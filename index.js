const express = require('express')
const http = require('http')
const dotenv = require('dotenv')
const path = require('path')
const socketIo = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

const APP_PORT = process.env.APP_PORT || 8080
const APP_URL = process.env.URL || `http://localhost:${APP_PORT}`

// Dotenv
dotenv.config()

// Public
app.use(express.static(path.join(__dirname, 'public')))

let usersConnected = []
let sockesConnected = []
let userLogged = ''

// Routes

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
})

server.listen(APP_PORT, () => console.log(`Server running on port ${APP_PORT}!`))


io.on('connection', (socket) => {

    socket.on('join', name => {

        const exist = usersConnected.find(item => item.name == name)
        
        const verify = exist ? true : false
        socket.emit('name-exist', {verify, socketid: socket.id})
    })

    socket.on('logged', name => {
        usersConnected.push({name: name, socketid: socket.id})
        sockesConnected.push(socket)
        sockesConnected.forEach(item => {

            const namesConnected = usersConnected.map(user => {
                const copy = {...user}
                return copy.name
            })
            item.emit('update-user', usersConnected)
        })
    })

    socket.on('send-message', info => 
        sockesConnected.forEach(item => item.emit('load-message', info))
    )

    socket.on('disconnect', () => {
        usersConnected = usersConnected.filter(item => item.socketid != socket.id)
        sockesConnected = sockesConnected.filter(item => item != socket)
    })
})
