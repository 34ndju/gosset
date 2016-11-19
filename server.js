'use strict';

require('dotenv').load()
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
var gridFs = require('gridfs-stream')
var pug = require('pug')
var ua = require('universal-analytics')
var bcrypt = require('bcrypt')
var xlsxj = require('xlsx-to-json')
var xlsj = require('xls-to-json')
var request = require('request')
var excel = require('xlsx')
var stripe = require('stripe')(process.env.CLIENT_SECRET)
var qs = require('querystring');
var sql = require('sql.js')
var sqlBuilder = require('mongo-sql')
var csvjson = require('csvjson')

var app = express();

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
    var fileMetadataModel = require('./client/models/fileMetadata')(mongoose, db);
    var LeadModel = require('./client/models/lead')(mongoose, db);
    
    require('./routes/routes')(
        express, 
        app, 
        session, 
        papa, 
        UserModel, 
        fileMetadataModel,
        LeadModel,
        d3, 
        multiparty, 
        fs, 
        mongoose, 
        db, 
        path, 
        gridfs, 
        pug, 
        visitor, 
        bcrypt, 
        xlsxj, 
        xlsj, 
        request, 
        excel, 
        stripe, 
        qs, 
        sql, 
        sqlBuilder, 
        csvjson)
        
});

app.listen(port, function() {
    console.log("Listening on port " + port)
})


