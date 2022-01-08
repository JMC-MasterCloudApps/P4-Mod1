// Plant management functions

async function createPlant() {

  const city = document.querySelector('#city').value;

  disableCreationButton();

  const query = `mutation($eoloPlant: EoloPlantInput) {
    createEoloPlant(eoloPlant: $eoloPlant) {
      id
      city
      planning
      progress
    }
  }`;

  console.log(`[graphQL] Request for 'createEoloPlant(${city})'`);
  const response = await graphql(query, { eoloPlant: { city }});

  if (response.errors) {
    console.error(response.errors[0].message);
    console.warn(response.data);
    enableCreationButton();
    return;
  }

  const plant = response.data.createEoloPlant;

  console.log(`[graphQL] Response: ${JSON.stringify(plant)}`);

  createPlantView(plant);
  displayPlantProgress(plant);
}

async function getAllPlants() {

  const query = `query {
    eoloPlants {
      id
      city
      planning
    }
  }`;

  console.log(`[graphQL] Request for 'eoloPlants()'`);
  const response = await graphql(query);

  console.log(`[graphQL] Response: ${JSON.stringify(response.data)}`);
  const plants = response.data.eoloPlants;
  
  plants.map(createPlantView);
}

function getWebSocketConnection() {
  console.log("[ws] Connecting server...");

  const webSocketUrl = "ws://localhost:3001/notifications";
  const webSocket = new WebSocket(webSocketUrl);

  webSocket.onopen = function (event) {
    console.log(`[ws-open] Connection established! (${event.currentTarget.url})`);
  };

  webSocket.onmessage = function (event) {
    console.log(`[ws-msg] From server: '${event.data}'`);
    displayPlantProgress(JSON.parse(event.data));
  };

  webSocket.onclose = function (event) {

    const message = event.wasClean
        ? `[ws-close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
        : '[ws-close] Connection died.';

    console.log(message);
  };

  webSocket.onerror = function (error) {
    console.log(`[ws-error] ${error.message}`);
  };

  return webSocket;
}

function deletePlant(id) {

  const query = `mutation($id: ID!) {
    deleteEoloPlant(id: $id) {
      id
      city
      planning
    }
  }`;

  console.log(`[graphQL] Request for 'deleteEoloPlant(${id})'`);
  graphql(query, { id });

  deletePlantView(id);
}

async function graphql(request, variables) {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query: request, variables })
  });

  return await response.json();
}

// Plant View functions

function disableCreationButton() {
  document.querySelector('#generate').style.display = 'none';
  document.querySelector('#creationSpinner').style.display = 'block';
}

function enableCreationButton() {
  document.querySelector('#generate').style.display = 'block';
  document.querySelector('#creationSpinner').style.display = 'none';
}

function createPlantView(plant) {

  const htmlContent = `<div id="plant-${plant.id}" class="col"></div>`;
  const current = document.querySelector('#plants').innerHTML;
  document.querySelector('#plants').innerHTML = htmlContent + current;
  document.querySelector('#plants-title').style.display = 'block';
  createOrUpdatePlanView(plant);
}

function deletePlantView(id) {

  const elem = document.querySelector('#plant-' + id);
  elem.parentNode.removeChild(elem);

  if (document.querySelector('#plants').childElementCount === 0) {
    document.querySelector('#plants-title').style.display = 'none';
  }
}

function createOrUpdatePlanView(plant) {

  const plantElement = document.querySelector('#plant-' + plant.id);
  if (!plantElement) {
    createPlantView(plant);
  } else {

    const htmlContent = `
    <div class="card mb-4 shadow-sm">
      <div class="card-header">
        <h4 class="my-0 fw-normal">${plant.city}</h4>
      </div>
      <div class="card-body px-2">
        <ul class="list-unstyled mt-3 mb-4">
          <li id="planning-${plant.id}" class="weather">Planning: ${plant.planning}</li>
        </ul>
        <div class="d-flex align-items-center">
          <button type="button" onClick="deletePlant(${plant.id})" class="btn btn-danger btn-sm d-none><i class="fas fa-trash-alt"></i>Delete</button>
        </div>
      </div>
    </div>
  `;

    document.querySelector('#plant-' + plant.id).innerHTML = htmlContent;
  }
}

async function displayPlantProgress(plant) {

  const plantElement = document.querySelector(`#planning-${plant.id}`);
  plantElement.textContent = `Planning: ${plant.progress}`;

  if (plant.completed) {
    await new Promise(r => setTimeout(r, 1500));
    createOrUpdatePlanView(plant);
    enableCreationButton();
  }

}

// -------------

getAllPlants();
const myWebSocket = getWebSocketConnection();
