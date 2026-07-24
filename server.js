const express = require('express')
const app = express()
const port = 3000

const tasks = [
    {id:1.0, name: 'Asma', age:20 , designation:'HR'},
    {id:1.1, name:'Saad', age:24, designation:'Director'},
    {id:1.2, name:'Huria', age:25, designation:'Team Leader'}
]
app.get('/', (req, res) => {
    res.send('Task 1: API is working fine')
 })
app.get('/tasks', (req, res) => {
    res.json(
        {
            "name" : "Task 1: API is working fine",
            "version" : "1.0.0",
            "endpoint" : ["/tasks"]
        }
    )
 })
 app.get('/health', (req,res) => {
     res.json(
      { status : "ok"
      }
     )
 })

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})
