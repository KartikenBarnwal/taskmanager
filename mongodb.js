// performing CRUD ops: create, read, update & delete

// const mongodb = require('mongodb')
// const MongoClient = mongodb.MongoClient 
// const ObjectID = mongodb.ObjectID

const {MongoClient,ObjectID}=require('mongodb')

const connectionURL = 'mongodb://localhost:27017'
const databaseName = 'task-manager'

// const id = new ObjectID()
// console.log(id)
// console.log(id.getTimestamp())

MongoClient.connect(connectionURL,{useUnifiedTopology: true},(error, client)=>{
    if(error)
    {
        return console.log('unable 2 connect to database!')
    }
    console.log('Connected to Database!')
    const db = client.db(databaseName)

   
    db.collection('users').deleteMany(
        {
            mood: null
        })
        .then(response=>{
            console.log(response)
        })
        .catch(error=>{
            console.log(error)
        })
    

    // db.collection('tasks').insertMany(
    //     [{
    //         task:'going for a walk',
    //         completed: false
    //     },
    //     {
    //         task:'cleaning the house',
    //         completed: false
    //     },
    //     {
    //         task:'HDFC AMC share study',
    //         completed: false
    //     },
    //     {
    //         task:'enjoying Mongodb',
    //         completed: true
    //     }],
    //     (error,task)=>{
    //         console.log(task.ops)
    //     }
    // )

})
