import { setTimeout } from 'timers/promises';
import { requestWeather } from '../clients/weather/weatherClient.js';
import { requestLandscape } from '../clients/topo/topoClient.js';
import { connect } from 'amqplib';

export async function createEoloPlant(city) {

    console.log('Create EoloPlant in city: ' + city);
    await createEolicPlant();

    const eoloplant = { city, planning: city };

    await Promise.all([
        getWeather(eoloplant),
        getLandscape(eoloplant)
    ]);

    await simulateProcessWaiting();

    processPlanning(eoloplant);

    return eoloplant;
}

async function createEolicPlant() {

    let channel = null;

    process.on('exit', (code) => {
        channel.close();
        console.log(`Closing rabbitmq channel`);
    });

    const rabbitClient = await connect('amqp://guest:guest@localhost');
    const data = '{"id":1, "city":"Madrid"}';
    const channelName = "eoloplantCreationRequests";

    channel = await rabbitClient.createChannel();
    channel.assertQueue(channelName,  {durable: false});
    channel.sendToQueue(channelName, Buffer.from(data));

    console.log("Produced to queue: '" + data + "'");
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
    eoloplant.planning = eoloplant.planning.match("^[A-Ma-m].*") ?
        eoloplant.planning.toLowerCase() :
        eoloplant.planning.toUpperCase();

    console.log('Processed planning: ' + eoloplant.planning);
}

async function simulateProcessWaiting() {
    await setTimeout(Math.random() * 2000 + 1000);
}