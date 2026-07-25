const swaggerUi = require("swagger-ui-express")
const swaggerSpec = require("./swagger")
const express = require('express')
const app = express()
const port = 3000

app.use(express.json())
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
const tasks  =  [
    {
        id: 1,
        title: "Read Quran",
        done: true
    },
    {
        id : 2,
        title : "Push Day Workout",
        done : false
    },
    {
        id : 3,
        title : "Give Fifi a bath",
        done : false
    }
]
app.get('/', (req, res) => {
     res.json(
        {
            "name" : "Task 1: API is working fine",
            "version" : "1.0.0",
            "endpoint" : ["/tasks"]
        }
    )
 })
/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     responses:
 *       200:
 *         description: List of all tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: Read Quran
 *                   done:
 *                     type: boolean
 *                     example: true
 */
app.get('/tasks', (req, res) => {
    res.json(tasks)
 })
 /**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The task ID
 *     responses:
 *       200:
 *         description: The requested task
 *       404:
 *         description: Task not found
 */
app.get('/tasks/:id', (req,res) => {
    const id = Number(req.params.id)
    const task = tasks.find(task => task.id === id)
    if (!task) {
        return res.status(404).json({ error: 'Task not found' })
    }
    res.json(task)
 })
 /**
 * @swagger
 * /health:
 *   get:
 *     summary: Check the health of the API
 *     responses:
 *       200:
 *         description: API is healthy
 */
app.get('/health', (req,res) => {
     res.json(
      { status : "ok"
      }
     )
 })

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Buy milk
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid request body
 */
app.post('/tasks', (req, res) => {
    const { title } = req.body

    if (!title || title.trim() === '') {
        return res.status(400).json({
            error: "Title is required"
        })
    }

    const newTask = {
        id: tasks.length + 1,
        title: title,
        done: false
    }

    tasks.push(newTask)

    res.status(201).json(newTask)
})
  /**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated task title
 *               done:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Task not found
 */          
app.put('/tasks/:id', (req, res) => {
    const id = Number(req.params.id)
    const task = tasks.find(t => t.id === id)
    if (!task) {
        return res.status(404).json({
            error: 'Task not found'
        })
    }
    const { title, done } = req.body
    if (
        (title !== undefined && typeof title !== "string") ||
        (title !== undefined && title.trim() === "") ||
        (done !== undefined && typeof done !== "boolean")
    ) {
        return res.status(400).json({
            error: "Invalid request body."
        })
    }

    if (title !== undefined) {
        task.title = title
    }
    if (done !== undefined) {
        task.done = done
    }

    res.json(task)
})

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Task ID
 *     responses:
 *       204:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */
app.delete('/tasks/:id', (req,res) => {
    const id = Number(req.params.id)
    const index = tasks.findIndex( t => t.id === id)
    if (index === -1) {
        return res.status(404).json(
            { error : "Task not found " }
        )
    }
    tasks.splice(index, 1)
    res.sendStatus(204)
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})
