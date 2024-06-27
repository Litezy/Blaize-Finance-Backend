// configuring required environments
const  {Server}  = require("socket.io");
const express = require('express')
const env =require('dotenv')
env.config()
const http = require('http')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const port = process.env.PORT
//configuring express app
const app = express()
const server = http.createServer(app)


//configure server responses 
app.use(express.json())
//enabling file upload
app.use(fileUpload())

app.use(cors({
    origin:['http://localhost:5173','http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176']
}))

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173','http://localhost:5174', 'http://localhost:5176','http://localhost:5175']
    }
})


io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('sending-chat', () => {
        socket.broadcast.emit('send-back-chat')
    })
})

//grant access to frontend connections


//serve static files in the public folder
app.use(express.static('public'))
app.use('/user', require('./routes/userRoutes'))
app.use('/plan', require('./routes/plansRoutes'))
app.use('/funds', require('./routes/fundsRoutes'))
app.use('/notify', require('./routes/notificationRoutes'))
app.use('/plans', require('./routes/planRoutes'))
app.use('/admin', require('./routes/adminRoutes'))
app.use('/chats', require('./routes/ChatRoutes'))
server.listen(port, ()=>  console.log(`server running on http://localhost:${port}`))