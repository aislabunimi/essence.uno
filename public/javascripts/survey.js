// opening socket
const socket = io();

// https://surveyjs.io/create-survey
const surveys = [
  JSON.parse('{"pages":[{"name":"beforePlaying","elements":[{"type":"text","name":"name","title":"What\'s your name?","isRequired":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"text","name":"surname","title":"What\'s your surname?","isRequired":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"rating","name":"ownStrength","title":"How strong do you think you are at UNO?","isRequired":true,"rateMin": 0, "rateMax": 10}],"title":"Before playing"}],"completeText":"Play Game 1"}'),
  JSON.parse('{"pages":[{"name":"beforePlaying","elements":[{"type":"text","name":"name","title":"What\'s your name?","isRequired":true,"readOnly":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"text","name":"surname","title":"What\'s your surname?","isRequired":true,"readOnly":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"rating","name":"ownStrength","title":"How strong do you think you are at UNO?","isRequired":true,"rateMin": 0, "rateMax": 10}],"title":"Before playing"},{"name":"afterGame1","elements":[{"type":"rating","name":"bot1Strength","title":"How strong was the opponent?","rateMin": 0, "rateMax": 10},{"type":"rating","name":"bot1Fun","title":"How much fun did you have?","rateMin":0,"rateMax":10}],"title":"First game","description":"Please answer with information regarding the first game"}],"completeText":"Play Game 2"}'),
  JSON.parse('{"pages":[{"name":"beforePlaying","elements":[{"type":"text","name":"name","title":"What\'s your name?","isRequired":true,"readOnly":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"text","name":"surname","title":"What\'s your surname?","isRequired":true,"readOnly":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"rating","name":"ownStrength","title":"How strong do you think you are at UNO?","isRequired":true,"rateMin": 0, "rateMax": 10}],"title":"Before playing"},{"name":"afterGame1","elements":[{"type":"rating","name":"bot1Strength","title":"How strong was the opponent?","rateMin": 0, "rateMax": 10},{"type":"rating","name":"bot1Fun","title":"How much fun did you have?","rateMin":0,"rateMax":10}],"title":"First game","description":"Please answer with information regarding the first game"},{"name":"afterGame2","elements":[{"type":"rating","name":"bot2Strength","title":"How strong was the opponent?","rateMin": 0, "rateMax": 10},{"type":"rating","name":"bot2Fun","title":"How much fun did you have?","rateMin":0,"rateMax":10}],"title":"Second game","description":"Please answer with information regarding the second game"}],"completeText":"Play Game 3"}'),
  JSON.parse('{"pages":[{"name":"beforePlaying","elements":[{"type":"text","name":"name","title":"What\'s your name?","isRequired":true,"readOnly":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"text","name":"surname","title":"What\'s your surname?","isRequired":true,"readOnly":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"rating","name":"ownStrength","title":"How strong do you think you are at UNO?","isRequired":true,"rateMin": 0, "rateMax": 10}],"title":"Before playing"},{"name":"afterGame1","elements":[{"type":"rating","name":"bot1Strength","title":"How strong was the opponent?","rateMin": 0, "rateMax": 10},{"type":"rating","name":"bot1Fun","title":"How much fun did you have?","rateMin":0,"rateMax":10}],"title":"First game","description":"Please answer with information regarding the first game"},{"name":"afterGame2","elements":[{"type":"rating","name":"bot2Strength","title":"How strong was the opponent?","rateMin": 0, "rateMax": 10},{"type":"rating","name":"bot2Fun","title":"How much fun did you have?","rateMin":0,"rateMax":10}],"title":"Second game","description":"Please answer with information regarding the second game"},{"name":"AfterGame3","elements":[{"type":"rating","name":"bot3Strength","title":"How strong was the opponent?","rateMin": 0, "rateMax": 10},{"type":"rating","name":"bot3Fun","title":"How much fun did you have?","rateMin":0,"rateMax":10}],"title":"Third game","description":"Please answer with information regarding the third game"},{"name":"afterPlaying","elements":[{"type":"ranking","name":"sortDifficulty","title":"Sort the games by how difficult they were","choices":[{"value":"game1","text":"Game 1"},{"value":"game2","text":"Game 2"},{"value":"game3","text":"Game 3"}]},{"type":"ranking","name":"sortDifficulty","title":"Sort the games by how fun they were","choicesFromQuestion":"sortDifficulty","choices":[{"value":"item1","text":"Game 1"},{"value":"item2","text":"Game 2"},{"value":"item3","text":"Game 3"}]}],"title":"After playing"}],"completeText":"Done"}'),
];
const difficulties = ['RandomPlay', 'GreedyMiniMax2A075', 'ABMMTK03'];
initializeSurvey();

function initializeSurvey() {
  if (window.localStorage.getItem('done') === 'true') {
    $('#survey-complete').show();
    return;
  }
  console.log('initializing survey');
  if (window.localStorage.getItem('gameNumber') === null) {
    window.localStorage.setItem('gameNumber', 0);
  }

  const defaultThemeColors = Survey
    .StylesManager
    .ThemeColors['default'];
  defaultThemeColors['$main-color'] = '#6495ed';
  defaultThemeColors['$main-hover-color'] = '#6495ed';
  defaultThemeColors['$header-color'] = '#6495ed';

  Survey.StylesManager.applyTheme();
  // Survey.StylesManager.applyTheme('default');

  // const surveyJSONs = { 'pages':[{ 'name': 'before_playing', 'elements':[{ 'type':'text', 'name':'name', 'title':'What\'s your name?', 'isRequired':!0, 'placeHolder':'It doesn\'t need to be the real one' }, { 'type':'text', 'name':'surname', 'title':'What\'s your surname?', 'isRequired':!0, 'placeHolder':'It doesn\'t need to be the real one' }, { 'type':'rating', 'name':'ownStrength', 'title':'How strong do you think you are at UNO?', 'isRequired':!0, 'rateMax':10 }], 'title': 'Before playing' }], 'completeText':'Done' };

  const survey = new Survey.Model(pickSurvey());
  console.log('checking if old survey data exists');
  const prevData = window.localStorage.getItem('survey') || null;
  if (prevData) {
    console.log('old survey data found');
    const data = JSON.parse(prevData);
    survey.data = data;
    if (data.pageNo != null) {
      survey.currentPageNo = data.pageNo + 1;
    }
  }
  $('#survey').Survey({
    model: survey,
    onComplete: completeSurvey,
    onValueChanged: savingPartialData,
  });

  function completeSurvey(s) {
    // send Ajax request to your web server.
    const data = s.data;
    data.id = getCookie('uuid').slice(2);
    data.pageNo = s.currentPageNo;
    data.difficulties = difficulties;
    console.log('The final results are:' + JSON.stringify(data));
    // TODO: save data somewhere
    // go to game if not done
    if (window.localStorage.getItem('gameNumber') < difficulties.length) {
      console.log('moving to game');
      createRoom(data.name, data.surname);
    }
    else {
      console.log('done');
      $('#survey').remove();
      $('#survey-complete').show();
      window.localStorage.setItem('done', true);
    }
  }
  function savingPartialData(s) {
    // saving on local storage
    const data = s.data;
    data.pageNo = s.currentPageNo;
    window.localStorage.setItem('survey', JSON.stringify(data));

    data.id = getCookie('uuid').slice(2);
    console.log('The results are:' + JSON.stringify(data));
  }
}

function pickSurvey() {
  const gameNumber = window.localStorage.getItem('gameNumber');
  return surveys[gameNumber];
}

function pickDifficulty() {
  const gameNumber = window.localStorage.getItem('gameNumber');
  return difficulties[gameNumber];
}

// if the user doesn't have a name, surname and a room name, can't create a room
function createRoom(name, surname) {
  console.log('creating room...');
  // saving name & surname
  document.cookie = `name=${name}; SameSite=Strict`;
  document.cookie = `surname=${surname}; SameSite=Strict`;
  // creating room for game
  // TODO: change difficulty
  const difficulty = pickDifficulty();
  socket.emit('create_room_survey', getUUID(), difficulty);
}

socket.on('room_created', (uuid) => {
  $('#roomUUID').value = uuid;
  document.cookie = `roomUUID=${uuid}; SameSite=Strict`;
  // submit form
  $('#form').submit();
});

window.onload = () => {
  /* console.log('loading data from cookies');
  if (getCookie('roomName') != '') {
    roomNameInput.value = getCookie('roomName');
  }
  if (getCookie('name') != '') {
    document.getElementById('name').value = getCookie('name');
  }
  if (getCookie('surname') != '') {
    document.getElementById('surname').value = getCookie('surname');
  } */
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

function getUUID() {
  return getCookie('uuid').slice(2);
}

exports = {
  createRoom,
};