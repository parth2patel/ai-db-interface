export class InMemoryDB {
  private static instance: InMemoryDB;
  private db: Map<string, any>;
  private dbInit: Map<string, Date>;
  private defaultTTL: number = 1000 * 60 * 60 * 24;

  private constructor() {
    this.db = new Map();
    this.dbInit = new Map();
  }

  static getInstance(): InMemoryDB {
    if (!InMemoryDB.instance) {
      InMemoryDB.instance = new InMemoryDB();
    }
    return InMemoryDB.instance;
  }

  get(key: string) {
    const now = new Date();
    console.log('invoked', key);
    if (this.db.has(key)) {
      if (this.dbInit.get(key)?.getTime()! + this.defaultTTL > now.getTime()) {
        return this.db.get(key);
      } else {
        this.delete(key);
      }
    }
    return null;
  }

  set(key: string, value: any) {
    this.db.set(key, value);
    this.dbInit.set(key, new Date());
  }

  delete(key: string) {
    this.db.delete(key);
    this.dbInit.delete(key);
  }

  clear() {
    this.db.clear();
    this.dbInit.clear();
  }
}
