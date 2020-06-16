const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description:{
        type: String,
        required: true,
        trim: true
    },
    completed:{
        type: Boolean,
        default: false
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }

},  {
    timestamps: true
})

taskSchema.methods.toJSON = function(){
    const obj = this.toObject()

    delete obj._id
    delete obj.owner
    return obj
}


const Task = mongoose.model('Task', taskSchema)
module.exports = Task
