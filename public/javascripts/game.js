import GameScene from './game/scenes/gameScene.js';

// setup game
const config = {
  type: Phaser.AUTO,
  parent: 'game',
  scale:{
    mode: Phaser.Scale.FIT,
    width: 1200,
    height: 1000,
  },
  scene: [GameScene],
};

window.onload = () => {
  if (!document.cookie) {
    // console.log('no cookie');
    window.location = document.referrer;
    return;
  }
  new Phaser.Game(config);
};