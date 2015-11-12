var express = require('express');
var app = express();

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
  res.send(JSON.stringify({ strings: 1 }));
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
