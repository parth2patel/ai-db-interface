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
      validatedData.password,
      validatedData.port,
      validatedData.dbUserName
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

    return await externalDb.getConnection();
  } catch (error) {
    console.error('getExternalDbClient.error:', error);
    throw error;
  }
};

export const getDefaultDbClient = async (): Promise<PoolClient> => {
  try {
    const defaultDbConfig = await getDefaultDBConfig();

    const defaultDb = new ExternalDB(
      defaultDbConfig.host,
      defaultDbConfig.dbName,
      String(defaultDbConfig.port),
      defaultDbConfig.dbUserName,
      defaultDbConfig.password
    );

    return await defaultDb.getConnection();
  } catch (error) {
    console.error('getDefaultDbClient.error:', error);
    throw error;
  }
};

export const getDbClient = async (): Promise<PoolClient> => {
  try {
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
  } catch (error) {
    throw error;
  }
};

export const getDbSchema = async (client: PoolClient): Promise<any[]> => {
  try {
    // Retrieve schema info
    const schemaQuery = `
        SELECT table_schema, table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_schema, table_name;
      `;

    const schema = await client.query(schemaQuery);
    return schema.rows;
  } catch (error) {
    console.error('Error fetching schema:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};
