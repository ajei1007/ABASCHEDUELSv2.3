import io from 'socket.io-client';

// SOCKET CODE
const socketURL = import.meta.env.REACT_APP_SOCKET_URL;

let socket = io.connect(socketURL, {
  transports: ['websocket'],
});

export default socket;