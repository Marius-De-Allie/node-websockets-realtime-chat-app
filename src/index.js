const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

// create express web server.
const app = express();
// create node server.
const server = http.createServer(app);

// configure sockte io to work with node server.
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');

/* EXPRESS MIDDLEWARE */
// use express static middleware
app.use(express.static(publicDirectoryPath));

// let count = 0;

io.on('connection', (socket) => {
  console.log('New web socket connection.');

  socket.on('join', ({ username, room }, callback) => {
    const  { error, user } = addUser({
      id: socket.id,
      username,
      room
    });

    // if error returned from addUser fn.
    if(error) {
      return callback(error);
    }

    // join chat room.
    socket.join(user.room);
    // Send event back to newly connected client.
    socket.emit('message', generateMessage('Admin', 'Welcome!'));
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });
    
    callback();
    // io.to.emit()
    // socket.broadcast.to.emit()
  })

  // listen for sendMessage event emitted from client.
  socket.on('sendMessage', (sentMessage, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if(filter.isProfane(sentMessage)) {
      return callback('profanity is not allowed!')
    }

    io.to(user.room).emit('message', generateMessage(user.username, sentMessage));
    callback();
  });

  socket.on('sendLocation', (location, callback) => {
    const user = getUser(socket.id);

    // Send location to all connected clients.
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
  // socket.emit('countUpdated', count);
  // socket.on('increment', () => {
  //   count++;
  //   // emit an event to all connections/clients.
  //   io.emit('countUpdated', count);
  // })
  // Listen for sendLocation event emitted from client.
});


// Start express server.
server.listen(port, () => {
  console.log(`Server is up on port ${port}!`)
});