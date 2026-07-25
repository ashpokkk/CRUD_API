const express = require('express')
const app = express()
const port = 3000

app.use(express.json())
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
app.get('/tasks', (req, res) => {
    res.json(tasks)
 })
 app.get('/tasks/:id', (req,res) => {
    const id = Number(req.params.id)
    const task = tasks.find(task => task.id === id)
    if (!task) {
        return res.status(404).json({ error: 'Task not found' })
    }
    res.json(task)
 })
 app.get('/health', (req,res) => {
     res.json(
      { status : "ok"
      }
     )
 })


 app.post('/tasks', (req, res) =>{
         const {title, done} = req.body
         if (!title || typeof done !== 'boolean' || title.trim() === '') {
            return res.status(400).json({error : "Needs a title and done status"})
            }
            const newTask = {
    id: tasks.length+1,
    title: title,
    done: done
}
tasks.push(newTask)
res.status(201).json(newTask)

        }
            )
app.put('/tasks/:id', (req, res) => {
    const id = Number(req.params.id)
    const task = tasks.find(t => t.id === id)
    if (!task) {
        return res.status(404).json({
            error: 'Task not found'
        })
    }
    const { title, done } = req.body
    if ((title !== undefined && title.trim() === '') ||
        (done !== undefined && typeof done !== 'boolean')) {
        return res.status(400).json({
            error: 'Invalid request body.'
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
    res.json({ 
        message : "Task deleted successfully"
    })
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})
