const pool = require('./postgres');

async function initializeDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title TEXT,
            done BOOLEAN
        )
    `);

    const result = await pool.query(
        'SELECT COUNT(*) FROM tasks'
    );

    if (parseInt(result.rows[0].count) === 0) {
        await pool.query(`
            INSERT INTO tasks (title, done)
            VALUES
                ('Read Quran', true),
                ('Push up day workout', false),
                ('Give fifi a bath', false)
        `);

        console.log('Seeded 3 example tasks');
    } else {
        console.log('Tasks already exist. No seeding needed.');
    }
}

const databaseReady = initializeDatabase();

async function getTasks() {
    await databaseReady;

    const result = await pool.query(
        'SELECT * FROM tasks'
    );

    return result.rows;
}

async function getTasksbyID(id) {
    await databaseReady;

    const result = await pool.query(
        'SELECT * FROM tasks WHERE id = $1',
        [id]
    );

    return result.rows[0];
}

async function insertTask(title, done) {
    await databaseReady;

    const result = await pool.query(
        'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
        [title, done]
    );

    return result.rows[0];
}

async function updateTask(id, title, done) {
    await databaseReady;

    const result = await pool.query(
        'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
        [title, done, id]
    );

    return result.rows[0];
}

async function deleteTask(id) {
    await databaseReady;

    const result = await pool.query(
        'DELETE FROM tasks WHERE id = $1 RETURNING *',
        [id]
    );

    return result.rows[0];
}

databaseReady.catch(error => {
    console.error('Database initialization failed:', error);
});

module.exports = {
    getTasks,
    getTasksbyID,
    insertTask,
    updateTask,
    deleteTask
};