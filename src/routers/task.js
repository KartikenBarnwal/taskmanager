const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = express.Router()

//endpoint for creating tasks
router.post('/tasks', auth ,async (req,res)=>{
    const task = new Task({
        ...req.body, //ES6 spread operator
        owner: req.user._id
    })
    try{
        await task.save()
        res.send(task)
    }catch(e){
        res.status(400).send()
    }
   
})

//endpoint for reading all tasks of an user 
// GET /tasks?completed=true
// GET /tasks?limit=3&skip=0
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth ,async (req,res)=>{
    var obj = {}
    
    if(req.query.completed)
    {
        if(req.query.completed==='true')
        obj = {owner: req.user._id, completed: true}

        else if(req.query.completed==='false')
        obj = {owner: req.user._id, completed: false}
    }
    else
    {
        obj = {owner: req.user._id}
    }

    var sort = {}
    if(req.query.sortBy)
    {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try{
        const task = await Task.find(obj, null ,{
            limit:parseInt(req.query.limit), 
            skip:parseInt(req.query.skip),
            sort
        })
        if(task=="")
        return res.send('No tasks added yet!')

        res.send(task)
    }
    catch(e){
        res.status(500).send(e)
    }
})

//endpoint for reading a task of an user by id
router.get('/tasks/:id', auth ,async (req,res)=>{

    try{
        const _id = req.params.id
        const task = await Task.findOne({_id,owner: req.user._id})
        if(!task)
        return res.status(404).send()

        res.send(task)
    }
    catch(e){
        res.status(500).send(e)
    }
})

//endpoint for updating a task 
router.patch('/tasks/:id', auth ,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ["description", "completed"]
    const isValidOperation = updates.every(item=>allowedUpdates.includes(item))
    if(!isValidOperation)
    return res.status(400).send({error:'Property not available!'})
    
    try{
        const updatedTask = await Task.findOne({_id: req.params.id, owner: req.user._id})

        if(!updatedTask)
        return res.status(404).send()

        updates.forEach(prop=>updatedTask[prop] = req.body[prop])
        await updatedTask.save()

        res.send(updatedTask)
    }catch(e){
        res.status(500).send(e)
    }
})

//endpoint for deleting a task of an user
router.delete('/tasks/:id', auth ,async(req,res)=>{
    try{
        const taskToDelete = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})

        if(!taskToDelete)
        return res.status(404).send()

        res.send(taskToDelete)
        }catch(e){
            res.status(400).send()
        }
})

//endpoint for deleting all tasks of an user
router.delete('/tasks/all', auth , async (req,res)=>{
    try{
        if(await Task.find({owner: req.user._id})=="")
        return res.send('No tasks added yet!')

        await Task.deleteMany({owner: req.user._id})

        res.send('All tasks deleted successfully!')
    }catch(e){
        res.status(400).send()
    }
})

module.exports = router
