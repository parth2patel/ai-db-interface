import pg from 'pg';

const { Pool } = pg;

// const pool = new Pool({
//   user: 'postgres',
//   host: 'db.hrqfouzsxobbrbokvtsi.supabase.co',
//   database: 'postgres',
//   password: 'roboEncr@123',
//   port: 5432,
// });

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'staging_09_10',
  // password: 'roboEncr@123',
  port: 5432,
});

class ExternalDB {
  private host: string;
  private database: string;
  private password: string;
  private port: number;
  private user: string;
  private extPool: pg.Pool;
  private client?: pg.PoolClient;

  constructor(
    host: string,
    database: string,
    password: string,
    port: number,
    user: string
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
      password: this.password,
      port: this.port,
    });
  }

  async authenticateConnection() {
    try {
      const client = await this.extPool.connect();
      client.release();
    } catch (err) {
      console.error('error in connecting to db:', err);
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

export default pool;
