// getting elements from html
const roomNameInput = document.getElementById('roomName');
const nPlayersInput = document.getElementById('nPlayers');

// opening socket
const socket = io();

// if the user doesn't have a name, surname and a room name, can't create a room
function createRoom(e) {
  console.log('Index: creating room...');
  e.preventDefault();
  if (document.getElementById('name').checkValidity() &&
    document.getElementById('surname').checkValidity() &&
    document.getElementById('roomName').checkValidity()
  ) {
    const roomType = document.getElementById('roomType').value;
    if (roomType == 'multiplayer') {
      document.cookie = 'gameType="multiplayer"; SameSite=Strict';
      socket.emit('create_room_multiplayer', roomNameInput.value, parseInt(nPlayersInput.value));
    }
    else {
      document.cookie = 'gameType="singleplayer"; SameSite=Strict';
      const difficulty = document.getElementById('difficulty').value;
      socket.emit('create_room_singleplayer', roomNameInput.value, difficulty);
    }
    // console.log("creating room: ", roomNameInput.value);
    // notify the server about new room
    // saving to cookies
    document.cookie = `name=${document.getElementById('name').value}; SameSite=Strict`;
    document.cookie = `surname=${document.getElementById('surname').value}; SameSite=Strict`;
  }
}
const form = document.getElementById('form');
form.addEventListener('submit', createRoom, true);

// the user needs a name and surname to join a room
function joinRoom(uuid) {
  if (document.getElementById('name').checkValidity() &&
   document.getElementById('surname').checkValidity()) {
    // adding data to an hidden input to pass it to the server
    document.getElementById('roomUUID').value = uuid;
    // saving to cookies
    document.cookie = `name=${document.getElementById('name').value}; SameSite=Strict`;
    document.cookie = `surname=${document.getElementById('surname').value}; SameSite=Strict`;
    document.cookie = `roomUUID=${uuid}; SameSite=Strict`;
    document.cookie = 'gameType="multiplayer"; SameSite=Strict';
    // submit form
    document.getElementById('form').submit();
  }
  else {
    alert('Please enter your name and surname');
  }
}

socket.on('room_created', (uuid) => {
  document.getElementById('roomUUID').value = uuid;
  document.cookie = `roomUUID=${uuid}; SameSite=Strict`;
  // submit form
  document.getElementById('form').submit();
});

window.onload = () => {
  // Making my life easier while debugging
  updateNPlayersSelect();
  console.log('Index: Loading data from cookies');
  if (getCookie('roomName') != '') {
    roomNameInput.value = getCookie('roomName');
  }
  if (getCookie('name') != '') {
    document.getElementById('name').value = getCookie('name');
  }
  if (getCookie('surname') != '') {
    document.getElementById('surname').value = getCookie('surname');
  }
};

function updateNPlayersSelect() {
  const roomType = document.getElementById('roomType').value;
  const nPlayers = document.getElementById('nPlayers');
  const nPlayersH3 = document.getElementById('nPlayersH3');
  const difficulty = document.getElementById('difficulty');
  const difficultyh3 = document.getElementById('difficultyH3');
  if (roomType == 'singleplayer') {
    // disable option to choose number of players
    nPlayers.hidden = true;
    nPlayersH3.hidden = true;
    difficulty.hidden = false;
    difficultyh3.hidden = false;
  }
  else {
    // enable option to choose number of players
    nPlayers.hidden = false;
    nPlayersH3.hidden = false;
    difficulty.hidden = true;
    difficultyh3.hidden = true;
  }
}

function getCookie(cname) {
  const name = cname + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

exports = {
  createRoom,
  joinRoom,
  updateNPlayersSelect,
};