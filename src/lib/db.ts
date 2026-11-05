import { promises as fs } from "node:fs";
import path from "node:path";
import type { Database } from "./types";

const dbPath = path.join(process.cwd(), "data", "db.json");

const empty: Database = { students: [], orders: [] };

let cache: Database | null = null;
let queue: Promise<unknown> = Promise.resolve();

async function readDb(): Promise<Database> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(dbPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<Database>;
    cache = {
      students: parsed.students ?? [],
      orders: parsed.orders ?? [],
    };
  } catch {
    cache = structuredClone(empty);
  }
  return cache;
}

async function writeDb(db: Database) {
  cache = db;
  try {
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    const tmp = `${dbPath}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(tmp, dbPath);
  } catch {
    // Serverless hosts like Vercel have a read-only filesystem.
    // Keep serving from memory so a phone demo still works for the warm instance.
  }
}

export function withDb<T>(fn: (db: Database) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await readDb();
    const result = await fn(db);
    await writeDb(db);
    return result;
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function readOnly<T>(fn: (db: Database) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await readDb();
    return fn(db);
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
