import { server } from './express.js';
import { sequelize } from './mysql.js';
import { WebSocketServer } from 'ws';
import { connect } from 'amqplib';

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

    console.log('\nClient connected to WebSocket');
    console.log(WEB_SOCKET);
    console.log('\n');
    ws.on('message', msg => {
        console.log('Message received:' + msg);
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
        console.log(`Closing rabbitmq channel`);
    });

    const rabbitClient = await connect('amqp://guest:guest@localhost');
    const channelName = "eoloplantCreationProgressNotifications";

    channel = await rabbitClient.createChannel();
    channel.assertQueue(channelName, {durable: false});

    channel.consume(channelName, (msg) => {

        console.log("Consumed from queue: '", msg.content.toString()+ "'");
        console.log(`${JSON.parse(msg.content).progress}%`);
        ws.send(JSON.parse(msg.content).progress);

    }, { noAck: true });
}

