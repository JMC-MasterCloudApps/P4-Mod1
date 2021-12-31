import { server } from './express.js';
import { sequelize } from './mysql.js';
import { WebSocketServer } from 'ws';

const SERVER_PORT = 3000;
const WEB_SOCKET = {
    port: 3001,
    path: '/notifications'
};

await sequelize.sync();
console.log('Connected to MySQL');

server.listen(SERVER_PORT, () => console.log(`Server listening on port ${SERVER_PORT}!`));

export const webSocketServer = new WebSocketServer(WEB_SOCKET);
webSocketServer.on('connection', ws => {

    console.log('User connected');
    ws.on('message', msg => {
        console.log('Message received:' + msg);
        ws.send(msg);
    });

    simulateProgress(ws);

});
console.log(`Web socket server listening on port ${webSocketServer.options.port}!`)

async function simulateProgress(ws) {

    for (const percentage of [25, 50, 75, 100]) {
        console.log(`Sending ${percentage}%`);
        await new Promise(r => setTimeout(r, 1500));
        ws.send(percentage);
    }
}
