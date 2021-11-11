import UIHandler from '../helpers/UIHandler.js';
import GameHandler from '../helpers/GameHandler.js';
import SocketHandler from '../helpers/SocketHandler.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });
  }

  preload() {
    console.log('Loading info from cookies');
    this.roomUUID = getCookie('roomUUID');
    this.user = {
      uuid: getCookie('uuid').slice(2),
      name: getCookie('name'),
      surname: getCookie('surname'),
    };

    console.log('Loading game assets');
    // load uno cards
    const colors = ['Red', 'Green', 'Blue', 'Yellow'];
    const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', 'Draw', 'Wild', 'WildDraw'];
    this.load.image('Blank_Deck', 'images/assets/cards/Blank_Deck.svg');
    this.load.image('Blank_Wild', 'images/assets/cards/Blank_Wild.svg');
    this.load.image('Blank_WildDraw', 'images/assets/cards/Blank_WildDraw.svg');
    for (const color of colors) {
      for (const value of values) {
        this.load.image(`${color}_${value}`, `images/assets/cards/${color}_${value}.svg`);
      }
    }
    // load background
    this.load.image('Blank_Background', 'images/assets/Blank_Background.svg');
    // load buttons
    this.load.image('Green_Okay', 'images/assets/buttons/Green_Okay.svg');
    this.load.image('Red_No', 'images/assets/buttons/Red_No.svg');

    // setting strings
    this.strings = {
      waiting: 'Waiting for \nplayers...',
      skip: 'Your turn was \nskipped',
      reverse: 'The direction \nof the game \nhas been reversed',
      draw2: 'You drew 2 cards',
      draw4: 'You drew 4 cards',
      pass: 'Pass',
      uno: 'Uno!',
      contestUno: 'Contest Uno!',
      contest4: 'Contest +4?',
      disconnected: 'You were disconnected',
      full: 'The room is full',
      end: 'won!',
    };

  }

  create() {
    // console.log(window.innerWidth, window.innerHeight, window.innerWidth / window.innerHeight);
    // this.scale.displaySize.setAspectRatio(window.innerWidth / window.innerHeight);
    // this.scale.refresh();
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.colorScheme = 'dark';
    }
    else {
      this.colorScheme = 'light';
    }

    console.log('Creating game scene');
    console.log('Creating UIHandler');
    this.UIHandler = new UIHandler(this);
    console.log('Creating GameHandler');
    this.GameHandler = new GameHandler(this);
    console.log('Building UI');
    this.UIHandler.buildUI();
    console.log('Creating SocketHandler');
    this.SocketHandler = new SocketHandler(this);
    // console.log('Creating interactivity handler');
    // this.InteractivityHandler = new InteractivityHandler(this);
    console.log('Game scene created');
  }

  update() {
    // this makes the game lag hard
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