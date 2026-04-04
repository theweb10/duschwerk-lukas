const Database = require('better-sqlite3')
const path = require('path')

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'duschwerk.db')

const fs = require('fs')
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(DB_PATH)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS inquiries (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL,
    subject    TEXT,
    message    TEXT,
    crm_synced INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS leads (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT    NOT NULL UNIQUE,
    name       TEXT,
    source     TEXT    DEFAULT 'website',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS configurations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id      TEXT,
    serie           TEXT,
    einbausituation TEXT,
    tuersystem      TEXT,
    breite          INTEGER,
    hoehe           INTEGER,
    glastyp         TEXT,
    glasstaerke     TEXT,
    profilfarbe     TEXT,
    rahmentyp       TEXT,
    config_json     TEXT,
    status          TEXT    DEFAULT 'draft',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

module.exports = db
