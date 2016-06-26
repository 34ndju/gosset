'use strict';

var gridfs
var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var session = require('express-session');
var d3 = require('d3');
var bodyParser = require('body-parser');
var multiparty = require('multiparty')
var fs = require('fs')
var papa = require('papaparse')
var excel = require('excel')
var gridFs = require('gridfs-stream')
var pug = require('pug')
var ua = require('universal-analytics')
var bcrypt = require('bcrypt')
var braintree = require('braintree')

var app = express();

require('dotenv').load()

var gateway = require('./lib/gateway');
var TRANSACTION_SUCCESS_STATUSES = [
  braintree.Transaction.Status.Authorizing,
  braintree.Transaction.Status.Authorized,
  braintree.Transaction.Status.Settled,
  braintree.Transaction.Status.Settling,
  braintree.Transaction.Status.SettlementConfirmed,
  braintree.Transaction.Status.SettlementPending,
  braintree.Transaction.Status.SubmittedForSettlement
];
var port = process.env.PORT || 8080;
var visitor = ua('UA-77388290-1');

app.set('views', './views')
app.set('view engine', 'pug')

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
  gridfs = gridFs(db.db, mongoose.mongo)
  
  var UserModel = require('./client/models/user')(mongoose, db);

  require('./routes/routes')(express, app, session, papa, UserModel, d3, multiparty, fs, mongoose, db, path, excel, gridfs, pug, visitor, bcrypt, braintree, gateway);
  
});

app.listen(port, function() {
  console.log("Listening on port " + port)
})


