const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))


io.on('connection', (socket) => {
    console.log('Welcome!!')

    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({id: socket.id, username, room})
        
        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'welcome!')) //emits to single client
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })
   

    socket.on('sendMessage', (value, callback) => {
        const filter = new Filter()
        const user = getUser(socket.id)
        if (!user) {
            return callback()
        }
        if(filter.isProfane(value)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username, value)) //emits to all the clients connected
        callback()
    })

    socket.on('sendlocation', ({latitude, longitude}, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateMessage(user.username, `https://google.com/maps?q=${longitude},${latitude}`))
        callback('Location shared!!')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        console.log(user)
        if (user) { 
            io.to(user.room).emit('message', generateMessage('Admin', `User ${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

})


server.listen(port, () => {
    console.log('server is up at '+ port )
})