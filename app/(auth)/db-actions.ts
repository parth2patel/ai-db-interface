'use server';

import { z } from 'zod';

import { createExternalDBConfig, getExternalDBConfig } from '@/db/queries';

import ExternalDB from '../external-db/index';

const dbConfigFormSchema = z.object({
  userId: z.string(),
  host: z.string(),
  dbName: z.string(),
  dbUserName: z.string(),
  port: z.string(),
  password: z.string(),
});

export interface DbConfigActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const authenticate = async (
  _: DbConfigActionState,
  formData: FormData
): Promise<DbConfigActionState> => {
  try {
    const validatedData = dbConfigFormSchema.parse({
      host: formData.get('host'),
      dbName: formData.get('dbName'),
      dbUserName: formData.get('dbUserName'),
      port: formData.get('port'),
      password: formData.get('password'),
    });

    const { host, dbName, password, port, dbUserName } = validatedData;

    const externalDb = new ExternalDB(host, dbName, password, port, dbUserName);

    await externalDb.authenticateConnection();

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export interface AddDbConfigActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'config_exists'
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

    const { userId, host, dbName, password, port, dbUserName } = validatedData;

    const externalDb = await getExternalDBConfig(userId);

    if (externalDb) {
      return { status: 'config_exists' } as AddDbConfigActionState;
    }

    await createExternalDBConfig({
      userId,
      dbName,
      dbUserName,
      host,
      port,
      password,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};
