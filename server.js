const express = require('express');
const socket = require('socket.io');
const cors = require('cors');

const app = express();
const server = app.listen(3000);

app.use(cors());
app.use(express.static('public'))

const io = socket(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

let messages = [];

io.on('connection', (socket) => {
    console.log(socket.id);
    socket.emit('load previous messages', messages);
    socket.on('chat', data => {
        messages.push(data);
        io.emit('chat', data)
    });
})