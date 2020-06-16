const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')


//endpoint for creating users or Sign Up
router.post('/users',async (req,res)=>{
    const user = new User(req.body)

    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})

// login endpoint
router.post('/users/login', async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token             
        })
    }catch(e){
        res.status(400).send()
    }
})

//logout endpoint
router.post('/users/logout', auth ,async   (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(token=>{
            return token.token != req.token
        })
        await req.user.save()
        res.send('Successfully Logged Out!')
    }catch(e){
        res.status(500).send('Unable to logout')
    }
})

//logoutALL 
router.post('/users/logoutALL', auth ,async (req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send('Successfully Logged Out of All Devices!')
    }catch(e){
        res.status(500).send('Unable to logout from all accounts')
    }
})

//endpoint for reading your own PROFILE
router.get('/users/me', auth ,async (req,res)=>{
    res.send(req.user)
})

//endpoint for updating a user
router.patch('/users/me', auth ,async (req,res)=>{
    const updates = Object.keys(req.body)  //returns string of properties to be updated
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((item)=>allowedUpdates.includes(item))

    if(!isValidOperation){
        return res.status(400).send({error:'Property not available!'})
    } 

    try{
        updates.forEach(prop=>req.user[prop] = req.body[prop])
        await req.user.save()
        res.send(req.user)

    }catch(e){              
        res.status(400).send(e)
    }
})

//endpoint for deleting a user 
router.delete('/users/me', auth , async(req,res)=>{
    try{       
        await req.user.remove()
        res.send(req.user)
        }catch(e){
            res.status(400).send()
        }

})

//endpoint for setting avatar
const upload = multer({ 
    limits:{
        fileSize: 2000000  //2 MB
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
        {
            cb(new Error('File must be either of formats - (jpg , jpeg , png)!'))
        }
        cb(undefined, true)  //accepts the upload
    }
})
router.post('/users/me/avatar', auth , upload.single('avatar') ,async(req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()

    res.send('Avatar loaded successfully!')
},(error,req,res,next)=>{  //another callback to handle error
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth , async(req,res)=>{
    req.user.avatar = undefined
    await req.user.save()

    res.send('Avatar deleted successfully!')
})

//fetching avatars
router.get('/users/:id/avatar', async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar)
        {
            throw new Error()
        }

        res.set('Content-Type' , 'image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})

module.exports = router















