import { requestWeather } from '../clients/weather/weatherClient.js';
import { connect } from 'amqplib';

export async function createEoloPlant(plant) {

    publishToRequestsQueue(plant);

    // TODO move to planner
//    Promise.all([
//        getWeather(plant),
//        getLandscape(plant)
//    ]);

    return plant;
}

async function publishToRequestsQueue(eoloplant) {

    const RABBITMQ_URL = 'amqp://guest:guest@localhost';
    const RABBITMQ_REQUEST_CHANNEL = 'eoloplantCreationRequests';
    let channel = null;

    process.on('exit', (code) => {
        channel.close();
        console.log(`[rmq] Closing channel ${RABBITMQ_REQUEST_CHANNEL}\n`);
    });

    const rabbitClient = await connect(RABBITMQ_URL);
    channel = await rabbitClient.createChannel();
    channel.assertQueue(RABBITMQ_REQUEST_CHANNEL,  {durable: false});
    channel.sendToQueue(RABBITMQ_REQUEST_CHANNEL, Buffer.from(JSON.stringify(eoloplant)));

    console.log(`[rmq] Published to queue '${JSON.stringify(eoloplant)}'\n`);
}

async function getWeather(eoloplant) {

    const weather = await requestWeather(eoloplant.city);

    console.log('Weather: ' + weather);

    addPlanning(eoloplant, weather);
}

function addPlanning(eoloplant, planning) {
    eoloplant.planning += '-' + planning;
}
