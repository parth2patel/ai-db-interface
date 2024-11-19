import { auth } from '@/app/(auth)/auth';
import { createExternalDBConfig, getExternalDBConfig } from '@/db/queries';

export async function GET() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  let externalDBConfig;
  try {
    externalDBConfig = await getExternalDBConfig(session.user.id);
  } catch (err) {
    console.error('error in getting config:', err);
    return new Response('No config found', { status: 404 });
  }

  return new Response('Success', { status: 200 });
}

export async function POST(request: Request) {
  const {
    host,
    dbName,
    dbUserName,
    port,
    password,
  }: {
    host: string;
    dbName: string;
    dbUserName: string;
    port: string;
    password: string;
  } = await request.json();

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  let externalDBConfig;
  try {
    externalDBConfig = await getExternalDBConfig(session.user.id);
  } catch (err) {
    console.error('error in getting config:', err);
  }

  if (!externalDBConfig) {
    try {
      externalDBConfig = await createExternalDBConfig({
        userId: session.user.id,
        host,
        dbName,
        dbUserName,
        port,
        password,
      });
    } catch (err) {
      console.error('error in creating externalDbConfig:', err);
      return new Response('Bad Request', { status: 400 });
    }
  }
  return new Response('Success', { status: 200 });
}
