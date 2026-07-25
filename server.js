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
    
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})
