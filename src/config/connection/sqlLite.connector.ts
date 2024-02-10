const sqlite3 = require('sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, '../../donnee.db');
const db = new sqlite3.Database(dbPath);

export default db;