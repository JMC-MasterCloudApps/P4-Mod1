import { server } from './express.js';
import { sequelize } from './mysql.js';
import { WebSocketServer } from 'ws';
import { connect } from 'amqplib';
import { EoloPlant } from './models/EoloPlant.js';

const SERVER_PORT = 3000;
const WEB_SOCKET = {
    port: 3001,
    path: '/notifications'
};
const RABBITMQ_URL = 'amqp://guest:guest@localhost';
const RABBITMQ_NOTIFY_CHANNEL = 'eoloplantCreationProgressNotifications';

let clients = {};

await sequelize.sync();
console.log('Connected to MySQL');

server.listen(SERVER_PORT, () => console.log(`Server listening on port ${SERVER_PORT}!`));

const webSocketServer = new WebSocketServer(WEB_SOCKET);
webSocketServer.on('connection', ws => {

    console.log(`[ws] Client connected. ${JSON.stringify(WEB_SOCKET)}\n`);

    ws.on('message', msg => {
        console.log(`[ws-message] Received: ${msg}`);
        registerClient(ws, msg);
    });
});
console.log(`Web socket server listening on port ${webSocketServer.options.port}!`)

listenRabbitMQ().then(() => console.log('RabbitMQ listening.'));

async function registerClient(wsClient, msg) {

    const ID = JSON.parse(msg).wsClientID;
    console.log(`[ws] Recording client #${ID}`);
    if (ID) {
        console.log(`[ws] Client #${ID} recorded.`);
        clients[ID] = wsClient;
    }
}

async function listenRabbitMQ() {
    let channel = null;

    process.on('exit', (code) => {
        channel.close();
        console.log(`[rmq] Closing channel ${RABBITMQ_NOTIFY_CHANNEL}`);
    });

    const rabbitClient = await connect(RABBITMQ_URL);

    channel = await rabbitClient.createChannel();
    channel.assertQueue(RABBITMQ_NOTIFY_CHANNEL, {durable: false});

    channel.consume(RABBITMQ_NOTIFY_CHANNEL, (msg) => {

        const message = msg.content.toString();
        updateProgress(JSON.parse(message));
        console.log(`[rmq] Consumed from queue: '${message}'`);
        sendNotification(message);

    }, { noAck: true });
}

async function updateProgress(plant) {

    let message = plant.completed ? 'Plant created.' : `Progress completed: (${plant.progress})`;
    console.log(message);

    EoloPlant.update(plant, { where: { id: plant.id } });
}

async function sendNotification(message) {

    const ID = JSON.parse(message).id;
    console.log(`[ws-notify] Sending #${ID}-client: '${message}'\n`);
    let wsClient = clients[ID];

    if (wsClient) {
        wsClient.send(message);
        return;
    }

    console.error("[ws-notify] Client not found.");
}