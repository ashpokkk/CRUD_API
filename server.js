const swaggerUi = require("swagger-ui-express")
const swaggerSpec = require("./swagger")
const express = require('express')
const app = express()
const port = 3000

const { getTasks, getTasksbyID } = require('./db')


app.use(express.json())
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))


app.get('/', (req, res) => {
    res.json({
        "name": "Task 1: API is working fine",
        "version": "1.0.0",
        "endpoint": ["/tasks"]
    })
})


/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     responses:
 *       200:
 *         description: List of all tasks
 */
app.get('/tasks', (req, res) => {

    const tasks = getTasks.all()

    res.json(tasks)

})


/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 */
app.get('/tasks/:id', (req, res) => {

    const id = Number(req.params.id)

    const task = getTasksbyID.get(id)

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        })
    }

    res.json(task)

})


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
app.post('/tasks', (req,res)=>{

    const { title } = req.body

    if(!title || title.trim() === ""){
        return res.status(400).json({
            error:"Title is required"
        })
    }


    const newTask = {
        id: tasks.length + 1,
        title:title,
        done:false
    }


    tasks.push(newTask)

    res.status(201).json(newTask)

})


/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 */
app.put('/tasks/:id',(req,res)=>{

    const id = Number(req.params.id)

    const task = tasks.find(t=>t.id===id)


    if(!task){

        return res.status(404).json({
            error:"Task not found"
        })

    }


    const {title,done}=req.body


    if(
        (title !== undefined && typeof title !== "string") ||
        (title !== undefined && title.trim()==="") ||
        (done !== undefined && typeof done !== "boolean")
    ){

        return res.status(400).json({
            error:"Invalid request body"
        })

    }


    if(title !== undefined){
        task.title=title
    }


    if(done !== undefined){
        task.done=done
    }


    res.json(task)

})


/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 */
app.delete('/tasks/:id',(req,res)=>{


    const id = Number(req.params.id)


    const index = tasks.findIndex(
        t=>t.id===id
    )


    if(index===-1){

        return res.status(404).json({
            error:"Task not found"
        })

    }


    tasks.splice(index,1)

    res.sendStatus(204)

})



app.listen(port,()=>{

    console.log(`Server is running on http://localhost:${port}`)

})