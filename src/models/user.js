const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    email:{
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value))
            {
                throw new Error('Email not valid!')
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        validate(value){
            if(validator.contains(value,'password'))
            {
                throw new Error("Password shouldn't contain your name in it!")
            }
        }
    },
    age:{
        type: Number,
        default: 18,
        validate(value){
            if(value<=0)
            {
                throw new Error('Age must be more than Zero!')
            }
        }
    },
    tokens: [{
       token:{
        type: String,
        required: true
       }
    }],
    avatar:{
        type: Buffer
    }
},
    {timestamps: true
})

userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function(){
    var obj = this.toObject()
    
    delete obj._id
    delete obj.tokens
    delete obj.password
    delete obj.avatar
    return obj
}

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString()},'kartikenkrb')
    
    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}


userSchema.statics.findByCredentials = async(email,password)=>{
    const user = await User.findOne({email})
    if(!user)
    {
        throw new Error('Unable to Login!')
    }
    
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch)
    {
        throw new Error('Unable to Login!')
    }

    return user
}


//using middleware  
userSchema.pre('save', async function(next){
    const user = this

    if(user.isModified('password'))
    {
        user.password = await bcrypt.hash(user.password,8)
    }

    next()
})

//using middleware to Delete the tasks if user is deleted
userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner: user._id})

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User