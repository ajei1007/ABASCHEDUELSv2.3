const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const redisClient = require('../cache');
const { redis: redisConfig } = require('../config');
const logger = require('../services/logger/logger');

let ioInstance = null;

const socketInit = async (server) => {
  const socketOrigins = [
    'https://admin.abaschedules.com',
    'https://abc.abaschedules.com',
    'http://localhost:3000',
    'https://beta-api.abaschedules.com',
    'https://production-api.abaschedules.com'
  ];
  const io = new Server(server, {
    cors: {
      origin: socketOrigins,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket']
  });

  // Adapter - Only use Redis adapter if Redis is enabled
  if (!redisConfig.isDisabled) {
    try {
      const pubClient = redisClient.duplicate();
      const subClient = redisClient.duplicate();
      await Promise.all([
        pubClient.connect(),
        subClient.connect()
      ]);
      io.adapter(createAdapter(pubClient, subClient));
      console.log('Socket.io: Redis adapter enabled');
    } catch (error) {
      console.error('Socket.io: Failed to initialize Redis adapter:', error.message);
      console.log('Socket.io: Using default in-memory adapter');
    }
  } else {
    console.log('Socket.io: Redis is disabled, using default in-memory adapter');
  }

  // setupWorker(io);

  io.on('connection', (socket) => {
    socket.emit('reconnect_users');
    socket.on('join_room', (data) => {
      // console.log("********* SOCKET User Connected", socket.id);
      socket.join(data);
    });
    socket.on('leave_room', (data) => {
      socket.leave(data);
      // console.log(`********* SOCKET User with ID: ${socket.id} left room: ${data}`);
    });
    // socket.on('event', (data) => {
    //   console.log(`********* SOCKET New event from: ${socket.id} is: ${data}`);
    // });
    socket.on('send_message', (data) => {
      socket.to(data.room).emit('receive_message', data);
    });

    // Listen for user registration (e.g., when a user logs in)
    socket.on('register', (userId) => {
      if (userId) {
        // Join the room named after the userId
        socket.join(userId);
      }
    });

    socket.on('disconnect', (reason) => {
      // This reason is normal when the user closes the browser
      if (reason === 'transport close') {
        return;
      }

      logger.socket('error', 'Socket disconnected', {
        socketId: socket.id,
        reason,
        timestamp: new Date().toISOString(),
      });
      // console.log("********* SOCKET User Disconnected", socket.id);
    });
  });

  ioInstance = io;
  return io;
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized yet');
  }
  return ioInstance;
};

module.exports = {
  socketInit,
  getIO,
};
