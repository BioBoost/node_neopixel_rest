var express = require('express');
var bodyParser = require("body-parser");
var app = express();

// If i2c module is not available just ignore i2c
var include_i2c = true;
try {
  var i2c = require('i2c');
} catch(err) {
  include_i2c = false;
  console.log('Module i2c is not installed. Proceeding without');
}

if (include_i2c) {
  var address = 0x40;
  var wire = new i2c(address, {device: '/dev/i2c-1'}); // point to your i2c address, debug provides REPL interface
}

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.json());   // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));   // for parsing application/x-www-form-urlencoded

// Set port
app.set('port', process.env.PORT || 3000);

app.use(function(req, res, next){
  console.log('[' + Date.now() + '] Request received ');
  next();
});

app.get('/', function (req, res) {
  res.type('text/plain');
  res.send('Hello and welcome to the neopixel RESTful API');
});

app.get('/strings', function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (include_i2c) {
    wire.readByte(function(err, nos) {
      if (err) {
        console.log('Could not read from i2c: ' + err);
        res.send(JSON.stringify({ number_of_string: "", string_ids: [], status: "failed" }));
      } else {
        var ids = new Array(nos);
        for (i = 0; i < nos; i++) { ids[i] = i; }
        res.send(JSON.stringify({ number_of_string: nos, string_ids: ids, status: "success" }));
      }
    });
  } else {
    res.send(JSON.stringify({ number_of_string: "2", string_ids: [0, 1], status: "success" }));
  }
});

app.get('/strings/:id', function (req, res) {
  var id = req.params.id    // id is currently unused (i2c function not implemented yet)
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ string_id: id, number_of_pixels: "8" }));
});

app.post('/strings/:id', function (req, res) {
  var id = req.params.id    // id is currently unused (i2c function not implemented yet)
  var red = req.body.color[0];
  var green = req.body.color[1];
  var blue = req.body.color[2];
  console.log(req.body);
  console.log('Setting color for string ' + id + ' to ' + red + ' ' + green + ' ' + blue);

  res.setHeader('Content-Type', 'application/json');

  if (include_i2c) {
    // Send color to mbed
    wire.write([0x03, red, green, blue], function(err) {
      if (err) {
        console.log('Could not write color to i2c: ' + err);
        res.send(JSON.stringify({ status: "failed" }));
      } else {
        res.send(JSON.stringify({ status: "success" }));
      }
    });
  } else {
    res.send(JSON.stringify({ status: "success" }));
  }

});

// Custom 404 (needs to be last in line of routes)
app.use(function(req, res, next){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

// Custom 500
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('text/plain');
  res.status(500);
  res.send('500 - Internal server error');
});

app.listen(app.get('port'), function(){
  console.log('Express app started on http://localhost:' + app.get('port'));
  console.log('Press CTRL-c to kill');
});
