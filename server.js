const swaggerUi = require("swagger-ui-express")
const swaggerSpec = require("./swagger")
const express = require('express')
require('dotenv').config();
const supabase = require('./supabase');
const authMiddleware = require('./authMiddleware');
const app = express()
const port = 3000

const {
    getTasks,
    getTasksbyID,
    insertTask,
    updateTask,
    deleteTask
} = require('./postgresRepository')


app.use(express.json())
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))


app.get('/', (req, res) => {
    res.json({
        "name": "Task 1: API is working fine",
        "version": "1.0.0",
        "endpoint": ["/tasks"]
    })
})


app.get('/public/info', (req, res) => {
    res.status(200).json({
        message: "Welcome stranger! This info is public."
    });
});


app.get('/protected/profile', authMiddleware, (req, res) => {
    res.status(200).json({
        id: req.user.id,
        email: req.user.email,
        created_at: req.user.created_at
    });
});


app.get('/protected/dashboard', authMiddleware, (req, res) => {
    res.status(200).json({
        message: "Welcome to your dashboard",
        user: {
            id: req.user.id,
            email: req.user.email
        }
    });
});


/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     responses:
 *       200:
 *         description: List of all tasks
 */
app.get('/tasks', async (req, res) => {
    const tasks = await getTasks();

    res.json(tasks);
});


/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 */
app.get('/tasks/:id', async (req, res) => {
    const id = Number(req.params.id);

    const task = await getTasksbyID(id);

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    res.json(task);
});


/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check health of API
 */
app.get('/health', (req,res)=>{

    res.json({
        status:"ok"
    })

})


/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 */
app.post('/tasks', async (req, res) => {
    const { title } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    const newTask = await insertTask(title, false);

    res.status(201).json(newTask);
});


/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 */
app.put('/tasks/:id', async (req, res) => {
    const id = Number(req.params.id);

    const task = await getTasksbyID(id);

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    const { title, done } = req.body;

    if (
        (title !== undefined && typeof title !== "string") ||
        (title !== undefined && title.trim() === "") ||
        (done !== undefined && typeof done !== "boolean")
    ) {
        return res.status(400).json({
            error: "Invalid request body"
        });
    }

    const newTitle = title !== undefined ? title : task.title;
    const newDone = done !== undefined ? done : task.done;

    const updatedTask = await updateTask(id, newTitle, newDone);

    res.json(updatedTask);
});


/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 */
app.delete('/tasks/:id', async (req, res) => {
    const id = Number(req.params.id);

    const task = await getTasksbyID(id);

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    await deleteTask(id);

    res.sendStatus(204);
});


app.post('/auth/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: "Email and password are required"
        });
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) {
        return res.status(400).json({
            error: error.message
        });
    }

    res.status(201).json(data.user);
});


app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: "Email and password are required"
        });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        return res.status(401).json({
            error: "Invalid login credentials"
        });
    }

    res.status(200).json({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
    });
});


app.post('/auth/logout', authMiddleware, async (req, res) => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        return res.status(500).json({
            error: "Logout failed"
        });
    }

    res.sendStatus(204);
});


async function testSupabaseConnection() {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Supabase connection failed:', error.message);
    } else {
        console.log('Supabase connection successful!');
    }
}

testSupabaseConnection();


app.listen(port,()=>{

    console.log(`Server is running on http://localhost:${port}`)

})