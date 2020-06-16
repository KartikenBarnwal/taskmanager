const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
// const maintenance = require('./middleware/maintenance')
// const auth = require('./middleware/auth')

const app = express()
const port = process.env.PORT || 3000


app.use(express.json())  //parse incoming response to json
app.use(userRouter)
app.use(taskRouter)


app.listen(port, ()=>{
    console.log('Server is up on port '+port)
})


// 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