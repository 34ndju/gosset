'use strict';

var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var path = require('path');
var session = require('express-session');
var d3 = require('d3');
var bodyParser = require('body-parser');
var multiparty = require('multiparty')
var fs = require('fs')
var papa = require('papaparse')
var excel = require('excel')

require('dotenv').config()

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
    })
);
console.log("Secret: " + process.env.SECRET)
app.use(express.static(path.resolve(__dirname, 'client')));


var db = mongoose.createConnection(process.env.MONGO_URI);

db.once('open', function callback () {
  console.info('Mongo db connected successfully');
});

var UserModel = require('./client/models/user')(mongoose, db);
var CSVModel = require('./client/models/csvdata')(mongoose, db);

require('./client/routes/routes')(express, app, session, papa, UserModel, CSVModel, d3, multiparty, fs, mongoose, db, path, excel);

/*
var temp_dir = path.join(process.cwd(), 'temp/');
if (!fs.existsSync(temp_dir))
    fs.mkdirSync(temp_dir);
*/

console.log("HEYYYYYYYYYYYY")
console.log("HEYYYY")
console.log(process.cwd())

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});