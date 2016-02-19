'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var path = require('path');
var session = require('express-session');

var app = express();

app.use(express.static(path.resolve(__dirname, 'client')));

mongoose.connect('mongodb://localhost/base');

app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/client/html/home.html');
});

app.get('/login', function(req, res) {
    res.sendFile(process.cwd() + '/client/html/login.html');
});

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});

