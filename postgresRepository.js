const pool = require('./postgres');

async function getTasks() {
    const result = await pool.query(
        'SELECT * FROM tasks'
    );

    return result.rows;
}

async function getTasksbyID(id) {
    const result = await pool.query(
        'SELECT * FROM tasks WHERE id = $1',
        [id]
    );

    return result.rows[0];
}

async function insertTask(title, done) {
    const result = await pool.query(
        'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
        [title, done]
    );

    return result.rows[0];
}

async function updateTask(id, title, done) {
    const result = await pool.query(
        'UPDATE tasks SET title = $1, done = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        [title, done, id]
    );

    return result.rows[0];
}

async function deleteTask(id) {
    const result = await pool.query(
        'DELETE FROM tasks WHERE id = $1 RETURNING *',
        [id]
    );

    return result.rows[0];
}

module.exports = {
    getTasks,
    getTasksbyID,
    insertTask,
    updateTask,
    deleteTask
};