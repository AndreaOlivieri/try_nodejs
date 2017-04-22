var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var urlencode = bodyParser.urlencoded({ extended: false });

app.use(express.static('public'));

var redis = require('redis');
var client = redis.createClient();

client.select(process.env.NODE_ENV.length || 'development'.length);

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

module.exports = app;