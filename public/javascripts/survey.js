// opening socket
const socket = io();

$('#clearSurveyButton').on('click', clearSurvey);

const difficulties = ['RandomPlay', 'GreedyMiniMax2A075', 'ABMMT2K04', 'ABMMT2K04'];

// https://surveyjs.io/create-survey
/* const surveys = [
  JSON.parse('{"pages":[{"name":"beforePlaying","elements":[{"type":"text","name":"name","title":"What\'s your name?","isRequired":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"text","name":"surname","title":"What\'s your surname?","isRequired":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"rating","name":"ownStrength","title":"How strong do you think you are at UNO?","isRequired":true,"rateMin": 0, "rateMax": 10}],"title":"Before playing"}],"completeText":"Play Game 1"}'),
  JSON.parse('{"pages":[{"name":"beforePlaying","elements":[{"type":"text","name":"name","title":"What\'s your name?","isRequired":true,"readOnly":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"text","name":"surname","title":"What\'s your surname?","isRequired":true,"readOnly":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"rating","name":"ownStrength","title":"How strong do you think you are at UNO?","isRequired":true,"rateMin": 0, "rateMax": 10}],"title":"Before playing"},{"name":"afterGame1","elements":[{"type":"rating","name":"bot1Strength","title":"How strong was the opponent?","rateMin": 0, "rateMax": 10},{"type":"rating","name":"bot1Fun","title":"How much fun did you have?","rateMin":0,"rateMax":10}],"title":"First game","description":"Please answer with information regarding the first game"}],"completeText":"Play Game 2"}'),
  JSON.parse('{"pages":[{"name":"beforePlaying","elements":[{"type":"text","name":"name","title":"What\'s your name?","isRequired":true,"readOnly":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"text","name":"surname","title":"What\'s your surname?","isRequired":true,"readOnly":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"rating","name":"ownStrength","title":"How strong do you think you are at UNO?","isRequired":true,"rateMin": 0, "rateMax": 10}],"title":"Before playing"},{"name":"afterGame1","elements":[{"type":"rating","name":"bot1Strength","title":"How strong was the opponent?","rateMin": 0, "rateMax": 10},{"type":"rating","name":"bot1Fun","title":"How much fun did you have?","rateMin":0,"rateMax":10}],"title":"First game","description":"Please answer with information regarding the first game"},{"name":"afterGame2","elements":[{"type":"rating","name":"bot2Strength","title":"How strong was the opponent?","rateMin": 0, "rateMax": 10},{"type":"rating","name":"bot2Fun","title":"How much fun did you have?","rateMin":0,"rateMax":10}],"title":"Second game","description":"Please answer with information regarding the second game"}],"completeText":"Play Game 3"}'),
  JSON.parse('{"pages":[{"name":"beforePlaying","elements":[{"type":"text","name":"name","title":"What\'s your name?","isRequired":true,"readOnly":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"text","name":"surname","title":"What\'s your surname?","isRequired":true,"readOnly":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"rating","name":"ownStrength","title":"How strong do you think you are at UNO?","isRequired":true,"rateMin": 0, "rateMax": 10}],"title":"Before playing"},{"name":"afterGame1","elements":[{"type":"rating","name":"bot1Strength","title":"How strong was the opponent?","rateMin": 0, "rateMax": 10},{"type":"rating","name":"bot1Fun","title":"How much fun did you have?","rateMin":0,"rateMax":10}],"title":"First game","description":"Please answer with information regarding the first game"},{"name":"afterGame2","elements":[{"type":"rating","name":"bot2Strength","title":"How strong was the opponent?","rateMin": 0, "rateMax": 10},{"type":"rating","name":"bot2Fun","title":"How much fun did you have?","rateMin":0,"rateMax":10}],"title":"Second game","description":"Please answer with information regarding the second game"},{"name":"AfterGame3","elements":[{"type":"rating","name":"bot3Strength","title":"How strong was the opponent?","rateMin": 0, "rateMax": 10},{"type":"rating","name":"bot3Fun","title":"How much fun did you have?","rateMin":0,"rateMax":10}],"title":"Third game","description":"Please answer with information regarding the third game"},{"name":"afterPlaying","elements":[{"type":"ranking","name":"sortDifficulty","title":"Sort the games by how difficult they were","choices":[{"value":"game1","text":"Game 1"},{"value":"game2","text":"Game 2"},{"value":"game3","text":"Game 3"}]},{"type":"ranking","name":"sortFun","title":"Sort the games by how fun they were","choicesFromQuestion": "sortDifficulty"}],"title":"After playing"}],"completeText":"Done"}'),
]; */
// survey generation
const surveyBaseString = '{"pages":[],"completeText":"Prossima","pagePrevText": "Precedente","pageNextText": "Successiva","completedHtml": "<h3>Caricamento partita...</h3>"}';
const pages = [];
const firstPage = {
  name: 'beforePlaying',
  elements: [
    {
      type: 'text',
      name: 'name',
      title: 'Inserisci un username',
      isRequired: true,
      placeHolder: 'Insert username',
    },
    {
      type: 'nouislider',
      name: 'ownStrength',
      title: 'Quanto forte credi di essere a uno?',
      step: 1,
      rangeMin: 0,
      rangeMax: 100,
      pipsValues: [0, 50, 100],
      pipsText: [{ value:0, text:'Scarso' }, { value:50, text:'Nella media' }, { value:100, text:'Forte' }],
      pipsDensity: 100,
      tooltips: false,
    },
    {
      type: 'nouislider',
      name: 'funAgainstAI',
      title: 'Quanto credi possa essere divertente giocare contro una AI?',
      step: 1,
      rangeMin: 0,
      rangeMax: 100,
      pipsValues: [0, 50, 100],
      pipsText: [{ value:0, text:'Noioso' }, { value:50, text:'Normale' }, { value:100, text:'Divertente' }],
      pipsDensity: 100,
      tooltips: false,
    },
    {
      type: 'rating',
      name: 'predictionWonGames',
      title: 'Quante partite credi di poter vincere?',
      step: 1,
      rateMin: 0,
      rateMax: difficulties.length,
    },
  ],
  title: 'Prepartita',
};
// const firstPageString = '{"name":"beforePlaying","elements":[{"type":"text","name":"name","title":"What\'s your username?","isRequired":true,"placeHolder":"It doesn\'t need to be the real one"},{"type":"rating","name":"ownStrength","title":"How strong do you think you are at UNO?","isRequired":true,"rateMin": 0, "rateMax": 10}],"title":"Before playing"}';
// const lastPageString = '{"name":"afterPlaying","elements":[{"type":"ranking","name":"sortDifficulty","title":"Sort the games by how difficult they were","choices":[{"value":"game1","text":"Game 1"},{"value":"game2","text":"Game 2"},{"value":"game3","text":"Game 3"}]},{"type":"ranking","name":"sortFun","title":"Sort the games by how fun they were","choicesFromQuestion": "sortDifficulty"}],"title":"After playing"}';
pages.push(firstPage);
// generate pages for each game
for (const key in difficulties) {
  const number = parseInt(key, 10);
  const page = {
    name: `afterGame${number + 1}`,
    elements: [
      {
        type: 'nouislider',
        name: 'bot' + (number + 1) + 'Strength',
        title: 'Quanto era forte il tuo avversario?',
        step: 1,
        rangeMin: 0,
        rangeMax: 100,
        pipsValues: [0, 50, 100],
        pipsText: [{ value:0, text:'Scarso' }, { value:50, text:'Nella media' }, { value:100, text:'Forte' }],
        pipsDensity: 100,
        tooltips: false,
      },
      {
        type: 'boolean',
        name: 'bot' + (number + 1) + 'IsAI',
        title: 'Saresti in grado di capire se hai giocato contro una IA o contro un giocatore umano?',
        labelTrue: 'Sì',
        // defaultValue: 'true',
      },
      {
        type: 'nouislider',
        name: 'bot' + (number + 1) + 'Fun',
        title: 'Quanto ti sei divertito in questa partita?',
        step: 1,
        rangeMin: 0,
        rangeMax: 100,
        pipsValues: [0, 50, 100],
        pipsText: [{ value:0, text:'Poco' }, { value:50, text:'Nella media' }, { value:100, text:'Tanto' }],
        pipsDensity: 100,
        tooltips: false,
      },
      {
        type: 'radiogroup',
        name: 'length' + (number + 1),
        title: 'La durata della partita è stata:',
        choices: [
          'Corta',
          'Giusta',
          'Lunga',
        ],
      },
    ],
    title: `Partita ${number + 1}`,
    description: 'Rispondi con informazioni riguardanti la partita ' + (number + 1),
  };
  // add give up question if the game was gave up
  const games = JSON.parse(window.localStorage.getItem('games'));
  if (games && games[number] && games[number].winner === null) {
    page.elements.push({
      type: 'radiogroup',
      name: 'bot' + (number + 1) + 'GiveUp',
      title: 'Perchè ti sei arreso?',
      choices: [
        'Troppo difficile',
        'Troppo lunga',
        'Troppo noiosa',
      ],
    });
  }
  pages.push(page);
}
// generate last page
const choices = [];
for (const key in difficulties) {
  const number = parseInt(key, 10);
  const choice = {
    value: `game${number + 1}`,
    text: `Partita ${number + 1}`,
  };
  choices.push(choice);
}
const lastPage = {
  name: 'afterPlaying',
  elements: [
    {
      type: 'ranking',
      name: 'sortDifficulty',
      title: 'Ordina le partite per difficoltà (più difficile prima)',
      choices: choices,
    },
    {
      type: 'ranking',
      name: 'sortFun',
      title: 'Ordina le partite per divertimento (più divertente prima)',
      choicesFromQuestion: 'sortDifficulty',
    },
    {
      type: 'nouislider',
      name: 'generalFun',
      title: 'Quanto ti sei divertito in generale?',
      step: 1,
      rangeMin: 0,
      rangeMax: 100,
      pipsValues: [0, 50, 100],
      pipsText: [{ value:0, text:'Poco' }, { value:50, text:'Nella media' }, { value:100, text:'Tanto' }],
      pipsDensity: 100,
      tooltips: false,
    },
    {
      type: 'radiogroup',
      name: 'lengthTotal',
      title: 'La durata del sondaggio è:',
      choices: [
        'Corta',
        'Giusta',
        'Lunga',
      ],
    },
  ],
  title: 'Postpartita',
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
    console.log(s.getPlainData());
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
    survey.completeText = 'Finito';
  }
  else {
    survey.completeText = 'Gioca partita ' + (parseInt(gameNumber, 10) + 1);
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
      survey.pages[parsedId + 1].description = `La partita è stata vinta da ${game.winner} in ${game.turns} turni.`;
    }
    else {
      survey.pages[parsedId + 1].description = `Ti sei arreso dopo ${game.turns} turni.`;
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
  document.cookie = 'surname=; SameSite=Strict';
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
  const prevData = window.localStorage.getItem('survey') || null;
  if (prevData) {
    console.log('old survey data found, hiding disclaimer and rules');
    $('#survey-information').hide();
  }
  else {
    console.log('no old survey data found, showing disclaimer and rules');
    $('#survey-information').show();
  }
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