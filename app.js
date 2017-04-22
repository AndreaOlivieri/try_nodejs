var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var urlencode = bodyParser.urlencoded({ extended: false });

app.use(express.static('public'));

// Redis connection
var redis = require('redis');
var url = require('url');
if (process.env.REDISTOGO_URL){
  var rtg = url.parse(process.env.REDISTOGO_URL);
  var client = redis.createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(":")[1]);
} else {
  var client = redis.createClient();
  var node_env = process.env.NODE_ENV || 'development';
  client.select(node_env.length);
}
// End Redis connection

app.get('/', function(request, response){
  response.send('OK');
});

app.get('/cities', function(request, response){
  client.hkeys('cities', function(error, names){
    if (error) throw error;
    response.json(names);
  })
});

app.post('/cities', urlencode, function(request, response){
  var newCity = request.body;
  client.hset('cities', newCity.name, newCity.description, function(error, name){
    if (error) throw error;
    response.status(201).json(newCity.name);
  });
});

app.delete('/cities/:name', function(request, response){
  client.hdel('cities', request.params.name, function(error, name){
    if(error) throw error;
    response.sendStatus(204);
  });
});


module.exports = app;