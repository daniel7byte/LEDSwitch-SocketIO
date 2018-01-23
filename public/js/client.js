(function () {
  var socket = io.connect(window.location.hostname + ':' + 3000);
  var red = document.getElementById('red');
  var green = document.getElementById('green');
  var $yellow = $('#yellow');

  function emitValue(color, e) {
    socket.emit('rgb', {
      color: color,
      value: e.target.value,
    });
  }

  function emitValueYellow(status) {
    socket.emit('yellow', {
      status: status,
    });
  }

  red.addEventListener('change', emitValue.bind(null, 'red'));
  green.addEventListener('change', emitValue.bind(null, 'green'));

  $yellow.on('click', function () {
    // El "prop" obtiene el valor del checkbox true/false
    emitValueYellow($yellow.prop('checked'));
  });

  socket.on('connect', function (data) {
    socket.emit('join', 'Client is connected!');
  });

  // CHAT
  socket.on('rgb', function (data) {
    var color = data.color;
    document.getElementById(color).value = data.value;
  });

  socket.on('yellow', function (data) {
    $yellow.attr('checked', data.status);
  });

  // PONDRÁ LOS VALORES POR DEFECTO DE SERVIDOR
  socket.on('defaultValues', function (data) {
    for (var key in data) {
      var color = key;
      document.getElementById(color).value = data[key];
    }
  });

  socket.on('defaultValuesYellow', function (data) {
    $yellow.attr('checked', data.status);
  });

}());
