'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
var cors = require('cors');
dotenv.config();

const routes = require('./routes');

const app = express();
const http = require('http');
const { disconnect } = require('process');
app.set('port', process.env.PORT);
const server = http.createServer(app);
const {Server} = require("socket.io");

const io = new Server(server, {
    cors: {
      origin: '*'
    }
  });

app.use(cors());
app.options('*', cors());
app.use(bodyParser.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send('<h1>Hey Socket.io</h1>');
  });


app.get('/chat/:chatId', routes.gochat.getChatById);
app.get('/user/email/:userEmail', routes.gochat.getUserByEmail);

app.get('/chat/emails/:senderEmail/:receiverEmail', routes.gochat.getChatsFromEmails);

app.post('/message', routes.gochat.postMessage);

io.on('connection', (socket) => {
    // Join a Hard Coded Chat for Now
    // socket.join('abcxyzpqr');
    // console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    socket.on('my message', (msg) => {
      console.log('message: ' + msg);
      io.emit('my broadcast', `server: ${msg}`);
    });
  
    socket.on('join', (chatId) => {
      console.log('join: ' + chatId);
      socket.join(chatId);
    });
  
    socket.on('message', (roomObject, callback) => {
      // console.log("ROOM IN SEREVR: ", roomObject);
      console.log('message: ' + roomObject.message + ' in ' + roomObject.roomName);
  
      // generate data to send to receivers
      const outgoingMessage = {
        name: socket.user?.name,
        id: socket.user?.id,
        message: roomObject.message,
      };
      // send socket to all in chatId except sender
      socket.to(roomObject.roomName).emit("message", outgoingMessage);
      callback({
        status: "ok"
      });
      // send to all including sender
    //   io.to(chatId).emit('message', outgoingMessage);
    })
  });


// SHOULD BE COMMENTED WHILE RUNNING TESTS
server.listen(process.env.PORT, (err) => {
    if (err) console.log("Error in Server!!!");
    console.log("Listening on PORT: ", process.env.PORT);
});

// Should be used when trying to run tests
module.exports = server;