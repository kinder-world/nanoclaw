import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const STORE_DIR = path.resolve(process.cwd(), 'store');
const dbPath = path.join(STORE_DIR, 'messages.db');
const db = new Database(dbPath);

// Register tg:522273841 as main chat
const jid = 'tg:522273841';
const group = {
  name: 'Allen (Telegram)',
  folder: 'main',
  trigger: '@Andy',
  added_at: new Date().toISOString(),
  requiresTrigger: 0, // false = respond to all messages
};

db.prepare(
  `INSERT OR REPLACE INTO registered_groups (jid, name, folder, trigger, added_at, requires_trigger) VALUES (?, ?, ?, ?, ?, ?)`,
).run(jid, group.name, group.folder, group.trigger, group.added_at, group.requiresTrigger);

console.log(`✓ Registered ${jid} as main chat (responds to all messages)`);

// Create group folder structure
const groupDir = path.join(process.cwd(), 'groups', group.folder);
fs.mkdirSync(path.join(groupDir, 'logs'), { recursive: true });
console.log(`✓ Created folder structure: ${groupDir}`);

db.close();
