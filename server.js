const Config = require('./config');

var express = require('express'),
  app = express(),
  port = process.env.PORT || Config.Api.LISTENING_PORT,
  bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('./api/routes')(app);

app.listen(port);

console.log('Fraud Service API server started on: ' + port);
