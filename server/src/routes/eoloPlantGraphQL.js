import * as plantService from "../services/eoloPlantService.js";

async function eoloPlants() {
  const plants = await plantService.getAllPlants();
  return toDTO(plants);
}

async function eoloPlant({ id }) {
  const plant = await plantService.getEoloPlantById(id);
  return toDTO(plant);
}

async function createEoloPlant({ eoloPlant }) {

  console.log(`[graph-ql] Request for new EoloPlant in city: ${eoloPlant.city}`);

  const plant = await plantService.postEoloPlant(eoloPlant);
  return toDTO(plant);

}

async function deleteEoloPlant({ id }) {
  const plant = await plantService.deleteEoloPlantById(id);
  return toDTO(plant);
}

function toDTO(model) {
  if (model === null) {
    return null;
  }
  if (model instanceof Array) {
    return model.map(elem => toDTO(elem));
  } else {
    return model.get({ plain: true });
  }
}

export default {
  eoloPlants,
  eoloPlant,
  createEoloPlant,
  deleteEoloPlant
};