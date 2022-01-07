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

await sequelize.sync();
console.log('Connected to MySQL');

server.listen(SERVER_PORT, () => console.log(`Server listening on port ${SERVER_PORT}!`));

const webSocketServer = new WebSocketServer(WEB_SOCKET);
webSocketServer.on('connection', ws => {

    console.log(`[ws] Client connected. ${JSON.stringify(WEB_SOCKET)}\n`);

    ws.on('message', msg => {
        console.log(`[ws] Message received: ${msg}`);
        ws.send(msg);
    });

//    simulateProgress(ws);
    listenRabbitMQ(ws);

});
console.log(`Web socket server listening on port ${webSocketServer.options.port}!`)

async function simulateProgress(ws) {

    for (const percentage of [25, 50, 75, 100]) {
        console.log(`Sending ${percentage}%`);
        await new Promise(r => setTimeout(r, 1500));
        ws.send(percentage);
    }
}

async function listenRabbitMQ(ws) {
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
        saveIfCompleted(JSON.parse(message));
        console.log(`[rmq] Consumed from queue: '${message}'`);
        sendNotification(message, ws);

    }, { noAck: true });
}

async function saveIfCompleted(plant) {

    if (!plant.completed) {
        return;
    }

    EoloPlant.update(plant, { where: { id: plant.id } });
    console.log('Plant saved.');
}

async function sendNotification(message, ws) {
    console.log(`[ws] Sending notification: '${message}'\n`);
    ws.send(message);
}

