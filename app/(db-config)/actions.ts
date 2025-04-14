'use server';

import { PoolClient } from 'pg';
import { z } from 'zod';

import {
  createExternalDBConfig,
  getDefaultDBConfig,
  getExternalDBConfig,
  updateExternalDBConfig,
} from '@/db/queries';

import { auth } from '../(auth)/auth';
import ExternalDB from '../external-db';

const dbConfigFormSchema = z.object({
  host: z.string(),
  dbName: z.string(),
  dbUserName: z.string(),
  port: z.string(),
  password: z.string(),
});

export interface DbConfigActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const authenticate = async (formData: FormData): Promise<void> => {
  try {
    const validatedData = dbConfigFormSchema.parse({
      host: formData.get('host'),
      dbName: formData.get('dbName'),
      dbUserName: formData.get('dbUserName'),
      port: formData.get('port'),
      password: formData.get('password'),
    });

    const externalDb = new ExternalDB(
      validatedData.host,
      validatedData.dbName,
      validatedData.port,
      validatedData.dbUserName,
      validatedData.password
    );

    await externalDb.authenticateConnection();
  } catch (error) {
    console.error('authenticate error:', error);
    throw error;
  }
};

export interface AddDbConfigActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'config_updated'
    | 'unauthorized'
    | 'invalid_data';
}

export const register = async (
  _: AddDbConfigActionState,
  formData: FormData
): Promise<AddDbConfigActionState> => {
  try {
    const validatedData = dbConfigFormSchema.parse({
      userId: formData.get('userId'),
      host: formData.get('host'),
      dbName: formData.get('dbName'),
      dbUserName: formData.get('dbUserName'),
      port: formData.get('port'),
      password: formData.get('password'),
    });

    await authenticate(formData);

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return { status: 'unauthorized' };
    }

    const externalDb = await getExternalDBConfig(session.user.id);

    if (externalDb?.length) {
      await updateExternalDBConfig({
        id: externalDb[0].id,
        userId: session.user.id,
        dbName: validatedData.dbName,
        dbUserName: validatedData.dbUserName,
        host: validatedData.host,
        port: validatedData.port,
        password: validatedData.password,
      });
      return { status: 'config_updated' } as AddDbConfigActionState;
    }

    await createExternalDBConfig({
      userId: session.user.id,
      dbName: validatedData.dbName,
      dbUserName: validatedData.dbUserName,
      host: validatedData.host,
      port: validatedData.port,
      password: validatedData.password,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('register.error:', error);
      return { status: 'invalid_data' };
    }
    console.error('register.error:', error);

    return { status: 'failed' };
  }
};

export const getExternalDbClient = async (): Promise<PoolClient> => {
  let externalDbClient;
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      throw Error('unauthorized');
    }

    const externalDbConfig = await getExternalDBConfig(session.user.id).then(
      (res) => res?.[0]
    );

    const externalDb = new ExternalDB(
      externalDbConfig.host,
      externalDbConfig.dbName,
      String(externalDbConfig.port),
      externalDbConfig.dbUserName,
      externalDbConfig.password
    );

    externalDbClient = await externalDb.getConnection();
  } catch (error) {
    console.error('getExternalDbClient.error:', error);
    throw error;
  }
  return externalDbClient;
};

export const getDefaultDbClient = async (): Promise<PoolClient> => {
  let defaultDbClient;
  try {
    const defaultDbConfig = await getDefaultDBConfig();

    const defaultDb = new ExternalDB(
      defaultDbConfig.host,
      defaultDbConfig.dbName,
      String(defaultDbConfig.port),
      defaultDbConfig.dbUserName,
      defaultDbConfig.password
    );

    defaultDbClient = await defaultDb.getConnection();
  } catch (error) {
    console.error('getDefaultDbClient.error:', error);
    throw error;
  }
  return defaultDbClient;
};

export const getDbClient = async (): Promise<PoolClient> => {
  let dbClient;
  try {
    dbClient = await getExternalDbClient();
  } catch (err) {
    console.error('error in getting external db client:', err);
  }

  if (dbClient) {
    return dbClient;
  }

  try {
    dbClient = await getDefaultDbClient();
  } catch (err) {
    console.error('error in getting default db client:', err);
    throw err;
  }
  return dbClient;
};

export const getDbSchema = async (
  client: PoolClient
): Promise<Record<string, any[]>> => {
  const schema: Record<string, any[]> = {};

  try {
    const schemaQuery = `
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;

    const result = await client.query(schemaQuery);
    for (const row of result.rows) {
      if (!schema[row.table_name]) {
        schema[row.table_name] = [];
      }
      schema[row.table_name].push({
        column: row.column_name,
        type: row.data_type,
      });
    }
  } catch (error) {
    console.error('Error fetching schema:', error);
    throw error;
  }

  return schema;
};
