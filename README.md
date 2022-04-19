![unoIcon](https://github.com/aislabunimi/essence.uno/blob/main/public/favicon.ico)
# essence.uno
Bachelor's degree thesys project of Francesco Torgano.

A nodejs implementation of the uno card game.

## Features
* Play in singleplayer or multiplayer
* Mobile friendly
* Automatic dark mode
* Added [survey](https://uno.fratorgano.me/survey) with Survey.js to test various agents

### Singleplayer
* Play in singleplayer with different agents with different parameters and strengths
* Different combinations of algorithms and evaluation functions to balance strength and fun
* Option to enter a survey to evaluate various agents

### Multiplayer
* Play in multiplayer with up to 10 people
* Support for optional jitsi (videochat while playing)
* Supports saying Uno and calling out someone that doesn't
* Supports contesting Draw Four card

## Try it
This version is used for testing and developing so it might stop working or be restarted often.

You can try out the game [here](https://uno.fratorgano.me). 

It's currently hosted on my own server, using a reverse proxy with apache.

## Dependencies/Modules Used
### Server-side
* [Node.js](https://github.com/nodejs/node) - Javascript runtime
* [Express](https://github.com/expressjs/express) - Web Framework
* [Express-Session](https://github.com/expressjs/session) - Session Middleware
* [HBS](https://github.com/pillarjs/hbs) - Embedded JavaScript templates for Express
* [Mongoose](https://github.com/Automattic/mongoose) - MongoDB support
* [Phaser](https://github.com/photonstorm/phaser) - HTML5 game framework
* [Socket.IO](https://github.com/socketio/socket.io) - Library for WebSocket communication
* [Seedrandom](https://github.com/davidbau/seedrandom) - Seeded random number generator for JavaScript
* [Uuid](https://github.com/uuidjs/uuid) - Library to generate UUIDs
### Client-side
* [Phaser](https://github.com/photonstorm/phaser) - HTML5 game framework
* [Socket.IO](https://github.com/socketio/socket.io) - Library for WebSocket communication
* [SruveyJS](https://github.com/surveyjs/survey-library) - Library for surveys

## Assets
* [Uno - Card Game Asset Pack](https://alexder.itch.io/uno-card-game-asset-pack) 

## License
essence.uno is released under the MIT License.
