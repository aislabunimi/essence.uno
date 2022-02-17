// opening socket
const socket = io();

$('#clearSurveyButton').on('click', clearSurvey);

const difficulties = ['RandomPlay', 'GreedyMiniMax2A075', 'ABMMT3K04', 'ABMMT2K04'];

// https://surveyjs.io/create-survey
/* const surveys = [
  JSON.parse('{"pages":[{"name":"beforePlaying","elements":[{"type":"text","name":"name","title":"What\'s your name?","isRequired":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"text","name":"surname","title":"What\'s your surname?","isRequired":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"rating","name":"ownStrength","title":"How strong do you think you are at UNO?","isRequired":true,"rateMin": 0, "rateMax": 10}],"title":"Before playing"}],"completeText":"Play Game 1"}'),
  JSON.parse('{"pages":[{"name":"beforePlaying","elements":[{"type":"text","name":"name","title":"What\'s your name?","isRequired":true,"readOnly":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"text","name":"surname","title":"What\'s your surname?","isRequired":true,"readOnly":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"rating","name":"ownStrength","title":"How strong do you think you are at UNO?","isRequired":true,"rateMin": 0, "rateMax": 10}],"title":"Before playing"},{"name":"afterGame1","elements":[{"type":"rating","name":"bot1Strength","title":"How strong was the opponent?","rateMin": 0, "rateMax": 10},{"type":"rating","name":"bot1Fun","title":"How much fun did you have?","rateMin":0,"rateMax":10}],"title":"First game","description":"Please answer with information regarding the first game"}],"completeText":"Play Game 2"}'),
  JSON.parse('{"pages":[{"name":"beforePlaying","elements":[{"type":"text","name":"name","title":"What\'s your name?","isRequired":true,"readOnly":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"text","name":"surname","title":"What\'s your surname?","isRequired":true,"readOnly":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"rating","name":"ownStrength","title":"How strong do you think you are at UNO?","isRequired":true,"rateMin": 0, "rateMax": 10}],"title":"Before playing"},{"name":"afterGame1","elements":[{"type":"rating","name":"bot1Strength","title":"How strong was the opponent?","rateMin": 0, "rateMax": 10},{"type":"rating","name":"bot1Fun","title":"How much fun did you have?","rateMin":0,"rateMax":10}],"title":"First game","description":"Please answer with information regarding the first game"},{"name":"afterGame2","elements":[{"type":"rating","name":"bot2Strength","title":"How strong was the opponent?","rateMin": 0, "rateMax": 10},{"type":"rating","name":"bot2Fun","title":"How much fun did you have?","rateMin":0,"rateMax":10}],"title":"Second game","description":"Please answer with information regarding the second game"}],"completeText":"Play Game 3"}'),
  JSON.parse('{"pages":[{"name":"beforePlaying","elements":[{"type":"text","name":"name","title":"What\'s your name?","isRequired":true,"readOnly":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"text","name":"surname","title":"What\'s your surname?","isRequired":true,"readOnly":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"rating","name":"ownStrength","title":"How strong do you think you are at UNO?","isRequired":true,"rateMin": 0, "rateMax": 10}],"title":"Before playing"},{"name":"afterGame1","elements":[{"type":"rating","name":"bot1Strength","title":"How strong was the opponent?","rateMin": 0, "rateMax": 10},{"type":"rating","name":"bot1Fun","title":"How much fun did you have?","rateMin":0,"rateMax":10}],"title":"First game","description":"Please answer with information regarding the first game"},{"name":"afterGame2","elements":[{"type":"rating","name":"bot2Strength","title":"How strong was the opponent?","rateMin": 0, "rateMax": 10},{"type":"rating","name":"bot2Fun","title":"How much fun did you have?","rateMin":0,"rateMax":10}],"title":"Second game","description":"Please answer with information regarding the second game"},{"name":"AfterGame3","elements":[{"type":"rating","name":"bot3Strength","title":"How strong was the opponent?","rateMin": 0, "rateMax": 10},{"type":"rating","name":"bot3Fun","title":"How much fun did you have?","rateMin":0,"rateMax":10}],"title":"Third game","description":"Please answer with information regarding the third game"},{"name":"afterPlaying","elements":[{"type":"ranking","name":"sortDifficulty","title":"Sort the games by how difficult they were","choices":[{"value":"game1","text":"Game 1"},{"value":"game2","text":"Game 2"},{"value":"game3","text":"Game 3"}]},{"type":"ranking","name":"sortFun","title":"Sort the games by how fun they were","choicesFromQuestion": "sortDifficulty"}],"title":"After playing"}],"completeText":"Done"}'),
]; */
// survey generation
const surveyBaseString = '{"pages":[],"completeText":"Next"}';
const pages = [];
const firstPageString = '{"name":"beforePlaying","elements":[{"type":"text","name":"name","title":"What\'s your name?","isRequired":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"text","name":"surname","title":"What\'s your surname?","isRequired":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"rating","name":"ownStrength","title":"How strong do you think you are at UNO?","isRequired":true,"rateMin": 0, "rateMax": 10}],"title":"Before playing"}';
// const lastPageString = '{"name":"afterPlaying","elements":[{"type":"ranking","name":"sortDifficulty","title":"Sort the games by how difficult they were","choices":[{"value":"game1","text":"Game 1"},{"value":"game2","text":"Game 2"},{"value":"game3","text":"Game 3"}]},{"type":"ranking","name":"sortFun","title":"Sort the games by how fun they were","choicesFromQuestion": "sortDifficulty"}],"title":"After playing"}';
pages.push(JSON.parse(firstPageString));
// generate pages for each game
for (const key in difficulties) {
  const number = parseInt(key, 10);
  const page = {
    name: `afterGame${number + 1}`,
    elements: [
      {
        type: 'rating',
        name: 'bot' + (number + 1) + 'Strength',
        title: 'How strong was the opponent?',
        rateMin: 0,
        rateMax: 10,
      },
      {
        type: 'rating',
        name: 'bot' + (number + 1) + 'Fun',
        title: 'How much fun did you have?',
        rateMin: 0,
        rateMax: 10,
      },
    ],
    title: `Game ${number + 1}`,
    description: 'Please answer with information regarding the game ' + (number + 1),
  };
  pages.push(page);
}
// generate last page
const choices = [];
for (const key in difficulties) {
  const number = parseInt(key, 10);
  const choice = {
    value: `game${number + 1}`,
    text: `Game ${number + 1}`,
  };
  choices.push(choice);
}
const lastPage = {
  name: 'afterPlaying',
  elements: [
    {
      type: 'ranking',
      name: 'sortDifficulty',
      title: 'Sort the games by how difficult they were',
      choices: choices,
    },
    {
      type: 'ranking',
      name: 'sortFun',
      title: 'Sort the games by how fun they were',
      choicesFromQuestion: 'sortDifficulty',
    },
  ],
  title: 'After playing',
};
pages.push(lastPage);

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
  if (window.localStorage.getItem('games') === null) {
    window.localStorage.setItem('games', JSON.stringify([]));
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
    // sending data to server using socket
    const data = s.data;
    const dataToSend = {
      id: getCookie('uuid').slice(2),
      answers: s.getPlainData(),
    };
    data.id = getCookie('uuid').slice(2);
    data.pageNo = s.currentPageNo;
    data.difficulties = difficulties;
    socket.emit('survey_results', dataToSend);
    console.log('The final results are:' + JSON.stringify(dataToSend));
    // TODO: save data somewhere
    // go to game if not done
    if (window.localStorage.getItem('gameNumber') < difficulties.length) {
      console.log('moving to game');
      createRoom(data.name, data.surname);
    }
    else {
      console.log('done');
      window.localStorage.setItem('done', true);
      $('#survey').remove();
      $('#survey-complete').show();
    }
  }
  function savingPartialData(s) {
    // saving on local storage
    const data = s.data;
    data.pageNo = s.currentPageNo;
    window.localStorage.setItem('survey', JSON.stringify(data));

    data.id = getCookie('uuid').slice(2);
  }
}

function pickSurvey() {
  const gameNumber = window.localStorage.getItem('gameNumber');

  const survey = JSON.parse(surveyBaseString);
  // update complete text to match game
  if (parseInt(gameNumber, 10) === difficulties.length) {
    survey.completeText = 'Done';
  }
  else {
    survey.completeText = 'Play game ' + (parseInt(gameNumber, 10) + 1);
  }

  // add pages until gameNumber
  for (let i = 0; i <= gameNumber; i++) {
    survey.pages.push(pages[i]);
  }
  // add last page if done with games
  if (parseInt(gameNumber, 10) === difficulties.length) {
    survey.pages.push(pages[pages.length - 1]);
  }
  // update description with games data
  // const survey = surveys[gameNumber];
  const games = JSON.parse(window.localStorage.getItem('games'));
  for (const id in games) {
    const parsedId = parseInt(id);
    const game = games[parsedId];
    if (game.winner) {
      survey.pages[parsedId + 1].description = `The games was won by ${game.winner} in ${game.turns} turns.`;
    }
    else {
      survey.pages[parsedId + 1].description = `You gave up after ${game.turns} turns.`;
    }
  }
  return survey;
}

function clearSurvey() {
  console.log('clearing survey');
  // make cookie expire
  document.cookie = 'uuid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  window.localStorage.removeItem('survey');
  window.localStorage.removeItem('done');
  window.localStorage.removeItem('gameNumber');
  window.localStorage.removeItem('games');
  window.location.reload();
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
  document.cookie = 'gameType="singleplayer"; SameSite=Strict';
  // creating room for game
  // TODO: change difficulties
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