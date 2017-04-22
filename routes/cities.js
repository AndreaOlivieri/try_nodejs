var express = require('express');
var bodyParser = require('body-parser');
var urlencode = bodyParser.urlencoded({ extended: false });
var router = express.Router();

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

router.route('/')
  .get(function(request, response){
    client.hkeys('cities', function(error, names){
      if (error) throw error;
      response.json(names);
    })
  })
  .post(urlencode, function(request, response){
    var newCity = request.body;
    if (newCity.name && newCity.description) {
      client.hset('cities', newCity.name, newCity.description, function(error, name){
        if (error) throw error;
        response.status(201).json(newCity);
      });
    } else {
      response.sendStatus(400);
    }
  });

router.route('/:name')
  .delete(function(request, response){
    client.hdel('cities', request.params.name, function(error, name){
      if(error) throw error;
      response.sendStatus(204);
    });
  })
  .get(function(request, response){
    client.hget('cities', request.params.name, function(error, description){
      if(error) throw error;
      response.render('show.ejs', {
        city: {
          name: request.params.name,
          description: description
        }
      });
    });
  });

module.exports = router;