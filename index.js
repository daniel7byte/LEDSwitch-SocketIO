'use strict';

const five = require('johnny-five');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// let led = null;

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res, next) {
  res.sendFile(__dirname + '/dashboard.html');
});

five.Board().on('ready', function () {
  console.log('Arduino is ready.');

  // Initial state for the LED light
  let state = { red: 0, green: 0 };
  let statusYellow = { status: false };

  // Map pins to digital inputs on the board --> PWM
  let ledRed = new five.Led(5);
  let ledGreen = new five.Led(3);
  let ledYellow = new five.Led(8);

  // Helper function to set the colors
  let setStateBrightness = function (state) {
    ledRed.brightness(state.red);
    ledGreen.brightness(state.green);
  };

  let setStatusYellow = function (data) {
    if (data.status == true) {
      ledYellow.on();
    } else {
      ledYellow.off();
    }
  };

  // Listen to the web socket connection
  io.on('connection', function (client) {
    client.on('join', function (handshake) {
      console.log(handshake);
      /*
      Emite la informacion que ya está guardada en el servidor al cliente
      para posteriormente ponerla en los campos
      */
      // NO USAR broadcast AQUÍ
      client.emit('defaultValues', state);
      client.emit('defaultValuesYellow', statusYellow);
    });

    // Set initial state
    setStateBrightness(state);
    setStatusYellow(statusYellow);

    // Listener brightness
    client.on('rgb', function (data) {

      state.red = data.color === 'red' ? data.value : state.red;
      state.green = data.color === 'green' ? data.value : state.green;

      // Imprime en consola el cambio efectuado
      console.log(data);

      // Set the new colors
      setStateBrightness(state);

      client.broadcast.emit('rgb', data);
    });

    // Listener checkbox
    client.on('yellow', function (data) {

      statusYellow.status = data.status;

      // Set the new colors
      setStatusYellow(statusYellow);

      // Imprime en consola el cambio efectuado
      console.log(data);

      client.broadcast.emit('yellow', data);
    });

    // Turn on the RGB LED
    // led.on();
  });
});

const port = process.env.PORT || 3000;

server.listen(port);
console.log(`Server listening on http://localhost:${port}`);
