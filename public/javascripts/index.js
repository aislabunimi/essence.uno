// getting elements from html
const roomNameInput = document.getElementById('roomName');
const nPlayersInput = document.getElementById('nPlayers');

// opening socket
const socket = io();

// if the user doesn't have a name, surname and a room name, can't create a room
function createRoom() {
  event.preventDefault();
  if (document.getElementById('name').checkValidity() &&
    document.getElementById('surname').checkValidity() &&
    document.getElementById('roomName').checkValidity()
  ) {
    // console.log("creating room: ", roomNameInput.value);
    // notify the server about new room
    socket.emit('create_room', roomNameInput.value, parseInt(nPlayersInput.value));
    // saving to cookies
    document.cookie = `roomName=${roomNameInput.value}; SameSite=Strict`;
    document.cookie = `name=${document.getElementById('name').value}; SameSite=Strict`;
    document.cookie = `surname=${document.getElementById('surname').value}; SameSite=Strict`;
    // submit form
    document.getElementById('form').submit();
  }
}

// the user needs a name and surname to join a room
function joinRoom(roomName) {
  if (document.getElementById('name').checkValidity() &&
   document.getElementById('surname').checkValidity()) {
    // setting room name to pass it with form to game
    roomNameInput.value = roomName;
    // saving to cookies
    document.cookie = `roomName=${roomNameInput.value}; SameSite=Strict`;
    document.cookie = `name=${document.getElementById('name').value}; SameSite=Strict`;
    document.cookie = `surname=${document.getElementById('surname').value}; SameSite=Strict`;
    // submit form
    document.getElementById('form').submit();
  }
  else {
    alert('Please enter your name and surname');
  }
}

exports = {
  createRoom,
  joinRoom,
};


// Making my life easier while debugging
window.onload = () => {
  console.log('loading data from cookies');
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