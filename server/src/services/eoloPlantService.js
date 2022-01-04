import { EoloPlant } from '../models/EoloPlant.js';
import { createEoloPlant } from './eoloPlantCreator.js';
import DebugLib from 'debug';

const debug = new DebugLib('server:eoloPlantService');

export async function getAllPlants() {
    
    return EoloPlant.findAll();
}

export async function getEoloPlantById(id) {
    
    return await EoloPlant.findOne({ where: { id } });
}

export async function deleteEoloPlantById(id) {
    
    const plant = await getEoloPlantById(id);
    
    if (plant !== null) {
        plant.destroy();
    }

    return plant;
}

export async function postEoloPlant(eoloPlantCreationRequest) {

    debug('createEoloPlant', eoloPlantCreationRequest);

    let plant = await EoloPlant.create({city: eoloPlantCreationRequest.city, planning: ''});
    plant = await createEoloPlant(plant);

    EoloPlant.update(plant, { where: { id: plant.id } });

    return plant;
}

export async function updateEoloPlant(plant) {

    debug('updateEoloPlant', plant);

    await EoloPlant.update(plant, { where: { id: plant.id } });

}
