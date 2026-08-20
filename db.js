const database = require('better-sqlite3');

const db = new database('tasks.db')

db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        done INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`);
const row = db.prepare('SELECT COUNT(*) as count FROM tasks').get();

const getTasks = db.prepare('SELECT * FROM tasks');
const getTasksbyID = db.prepare('SELECT * FROM tasks WHERE id = ?');
const insertTask = db.prepare('INSERT INTO tasks (title, done) VALUES (?,?)');
if (row.count === 0) {
    const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?,?)');
    insert.run('Read Quran', 1);
    insert.run('Push up day workout', 0);
    insert.run('Give fifi a bath', 0);
    console.log('Seed example with 3 tasks');
}
else{
    console.log(`Table already has ${row.count} tasks. No need for seed example`);
}
module.exports = { db, getTasks, getTasksbyID , insertTask};