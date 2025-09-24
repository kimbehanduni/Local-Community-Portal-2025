// db/db.js
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// defina os caminhos ANTES de usar
const dbPath     = path.join(__dirname, 'database.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

// abra o DB
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// agora pode logar o caminho
console.log('[DB] Using', dbPath);

// garanta o schema na 1ª execução
const hasListings = db.prepare(`
  SELECT name FROM sqlite_master WHERE type='table' AND name='listings'
`).get();

if (!hasListings) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  console.log('[DB] Initial schema applied.');
} else {
  console.log('[DB] Tables already exist.');
}

export default db;