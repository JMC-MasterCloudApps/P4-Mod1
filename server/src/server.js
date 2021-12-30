import { server } from './express.js';
import { sequelize } from './mysql.js';
import { WebSocketServer } from 'ws';

const SERVER_PORT = 3000;
const SOCKET_PORT = 3001;

await sequelize.sync();
console.log('Connected to MySQL');

server.listen(SERVER_PORT, () => console.log(`Server listening on port ${SERVER_PORT}!`));

const webSocketServer = new WebSocketServer({
    port : SOCKET_PORT,
    path: "/notifications"
});

console.log(`Web socket server listening on port ${SOCKET_PORT}!`)

webSocketServer.on('connection', (ws, req) => {

    console.log('User connected');

    ws.on('message', msg => {
        console.log('Message received:' + msg);
    });

});
