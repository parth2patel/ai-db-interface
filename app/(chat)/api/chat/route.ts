import { convertToCoreMessages, Message, StreamData, streamText } from 'ai';
import { z } from 'zod';

import { customModel } from '@/ai';
import { models } from '@/ai/models';
import { systemPrompt } from '@/ai/prompts';
import { auth } from '@/app/(auth)/auth';
import { getDbClient, getDbSchema } from '@/app/(db-config)/actions';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';

export const maxDuration = 60;

type AllowedTools =
  // | 'createDocument'
  // | 'updateDocument'
  // | 'requestSuggestions'
  // | 'getWeather'
  'runSQLQuery';

const blocksTools: AllowedTools[] = [
  // 'createDocument',
  // 'updateDocument',
  // 'requestSuggestions',
];

const sqlTools: AllowedTools[] = ['runSQLQuery'];

const allTools: AllowedTools[] = [...blocksTools, ...sqlTools];

export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId,
  }: { id: string; messages: Array<Message>; modelId: string } =
    await request.json();

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const model = models.find((model) => model.id === modelId);

  if (!model) {
    return new Response('Model not found', { status: 404 });
  }
  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveChat({ id, userId: session.user.id, title });
  }

  await saveMessages({
    messages: [
      { ...userMessage, id: generateUUID(), createdAt: new Date(), chatId: id },
    ],
  });

  const streamingData = new StreamData();

  const result = await streamText({
    model: customModel(model.apiIdentifier),
    system: systemPrompt,
    messages: coreMessages,
    maxSteps: 5,
    experimental_activeTools: allTools,
    tools: {
      runSQLQuery: {
        description: 'Generate an SQL query based on the user input',
        parameters: z.object({
          prompt: z.string(),
        }),
        execute: async ({ prompt }) => {
          // Prompt ChatGPT to generate a SQL query based on user input
          let schemaInfo, client;

          try {
            client = await getDbClient();
          } catch (err) {
            console.error('error in connecting to default db:', err);
            return err;
          }

          try {
            schemaInfo = await getDbSchema(client);
          } catch (schemaError) {
            console.error('Error fetching schema info:', schemaError);
            return { error: 'Failed to retrieve database schema' };
          }

          const { fullStream } = await streamText({
            model: customModel(model.apiIdentifier),
            system: `You are an AI assistant that converts natural language queries to SQL. Use the following database schema to generate precise SQL queries:
          ${JSON.stringify(schemaInfo, null, 2)} Return only the SQL query with no additional explanations. Do not include any markdown syntax or backticks around the SQL query.`,
            messages: [{ role: 'user', content: prompt }],
          });

          let draftText: string = '';
          for await (const delta of fullStream) {
            const { type } = delta;

            if (type === 'text-delta') {
              const { textDelta } = delta;

              draftText += textDelta;
              streamingData.append({
                type: 'text-delta',
                content: textDelta,
              });
            }
          }

          const sqlQuery = draftText.replace(/```/g, '').trim();

          if (!sqlQuery) {
            return { error: 'Failed to generate SQL query' };
          }

          // Execute the generated SQL query on the PostgreSQL database

          let queryResult;
          try {
            queryResult = await client.query(sqlQuery);
          } catch (err) {
            console.error('error:', err);
            return err;
          }
          return queryResult?.rows ? queryResult.rows : 'error';
        },
      },
    },
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          const responseMessagesWithoutIncompleteToolCalls =
            sanitizeResponseMessages(responseMessages);

          if (responseMessagesWithoutIncompleteToolCalls?.length) {
            await saveMessages({
              messages: responseMessagesWithoutIncompleteToolCalls.map(
                (message) => {
                  const messageId = generateUUID();

                  if (message.role === 'assistant') {
                    streamingData.appendMessageAnnotation({
                      messageIdFromServer: messageId,
                    });
                  }

                  return {
                    id: messageId,
                    chatId: id,
                    role: message.role,
                    content: message.content,
                    createdAt: new Date(),
                  };
                }
              ),
            });
          }
        } catch (error) {
          console.error('Failed to save chat');
        }
      }

      streamingData.close();
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: 'stream-text',
    },
  });

  return result.toDataStreamResponse({
    data: streamingData,
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
