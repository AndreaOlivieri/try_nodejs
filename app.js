var express = require('express');
var app = express();

app.use(express.static('public'));

var cities = require('./routes/cities')
app.use('/cities', cities);

app.get('/', function(request, response){
  response.send('OK');
});

module.exports = app;