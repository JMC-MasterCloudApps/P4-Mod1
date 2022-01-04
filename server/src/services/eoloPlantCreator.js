import { setTimeout } from 'timers/promises';
import { requestWeather } from '../clients/weather/weatherClient.js';
import { requestLandscape } from '../clients/topo/topoClient.js';
import { connect } from 'amqplib';

export async function createEoloPlant(plant) {

    //const eoloplant = { city, planning: city, progress: '0%' };

    publishToRequestsQueue(plant);

    // TODO move to planner
//    Promise.all([
//        getWeather(plant),
//        getLandscape(plant)
//    ]);

    // TODO move to planner
    //processPlanning(plant);

    return plant;
}

async function publishToRequestsQueue(eoloplant) {

    const RABBITMQ_URL = 'amqp://guest:guest@localhost';
    const RABBITMQ_REQUEST_CHANNEL = 'eoloplantCreationRequests';
    let channel = null;

    process.on('exit', (code) => {
        channel.close();
        console.log(`[rmq]\nClosing channel ${RABBITMQ_REQUEST_CHANNEL}\n`);
    });

    const rabbitClient = await connect(RABBITMQ_URL);
    channel = await rabbitClient.createChannel();
    channel.assertQueue(RABBITMQ_REQUEST_CHANNEL,  {durable: false});
    channel.sendToQueue(RABBITMQ_REQUEST_CHANNEL, Buffer.from(JSON.stringify(eoloplant)));

    console.log(`[rmq]\nPublished to queue '${JSON.stringify(eoloplant)}'\n`);
}

async function getWeather(eoloplant) {

    const weather = await requestWeather(eoloplant.city);

    console.log('Weather: ' + weather);

    addPlanning(eoloplant, weather);
}

async function getLandscape(eoloplant) {

    const landscape = await requestLandscape(eoloplant.city);

    console.log('Landscape: ' + landscape);

    addPlanning(eoloplant, landscape);
}

function addPlanning(eoloplant, planning) {
    eoloplant.planning += '-' + planning;
}

function processPlanning(eoloplant) {
    eoloplant.planning = eoloplant.city;
    eoloplant.planning = eoloplant.planning.match("^[A-Ma-m].*") ?
        eoloplant.planning.toLowerCase() :
        eoloplant.planning.toUpperCase();

    console.log('Processed planning: ' + eoloplant.planning);
}

async function simulateProcessWaiting() {
    await setTimeout(Math.random() * 2000 + 1000);
}