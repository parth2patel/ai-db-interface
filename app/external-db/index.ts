import pg from 'pg';

const { Pool } = pg;

class ExternalDB {
  private host: string;
  private database: string;
  private password: string | null;
  private port: string;
  private user: string;
  private extPool: pg.Pool;
  private client?: pg.PoolClient;

  constructor(
    host: string,
    database: string,
    port: string,
    user: string,
    password: string | null
  ) {
    this.host = host;
    this.database = database;
    this.password = password;
    this.port = port;
    this.user = user;

    this.extPool = new Pool({
      user: this.user,
      host: this.host,
      database: this.database,
      password: this.password || undefined,
      port: Number(this.port),
    });
  }

  async authenticateConnection() {
    try {
      const client = await this.extPool.connect();
      const out = await client.query('SELECT version();');
      client.release();
    } catch (err) {
      console.error('error in connecting to db:', err);
      throw err;
    }
  }

  async getConnection() {
    if (!this.client) {
      this.client = await this.extPool.connect();
    }
    return this.client;
  }

  async closeConnection() {
    if (!this.client) {
      return;
    }
    return this.client.release();
  }
}

export default ExternalDB;
