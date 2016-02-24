'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var path = require('path');
var session = require('express-session');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.resolve(__dirname, 'client')));
app.use(session({
    secret: "my secret",
    resave: false,
    saveUninitialized: true
    })
);

var UserModel = require('./client/models/user')(mongoose);

/*require('./client/scripts/login')(express, app, session, UserModel);
require('./client/scripts/register')(express, app, session, UserModel);*/
require('./client/routes/routes')(express, app, session, UserModel, mongoose);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});