/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var fs = require('fs');
var path = require('path');
var morgan = require('morgan');
var express = require('express');
var errorHandler = require('errorhandler');
var bodyParser = require('body-parser');
var mongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID
var assert = require('assert');
var dbops = require('./modules/dbops');
var pug = require('pug');

// MongoDB connection url
//var dbserver = process.env.MONGODB_SERVER;
//var dbport = process.env.MONGODB_PORT;
//var dbname = process.env.DB_NAME;

var dbserver = "localhost";
var dbport = 27017;
var dbname = "nwb";
if (process.env.MONGODB_SERVER)
    dbserver = process.env.MONGODB_SERVER;
if (process.env.MONGODB_PORT)
    dbport = process.env.MONGODB_PORT;
if (process.env.DB_NAME)
    dbname = process.env.DB_NAME


var url = 'mongodb://' + dbserver + ':' + dbport + '/' + dbname;
console.log('mongodb: ' + url);

var port = 3000;
var host = 'localhost';

var app = express();

app.set('views', './templates');
app.set('view engine', 'pug');

app.use(morgan('short'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Listing all the places stored in the db
app.get('/places', function(req, res, next){
    mongoClient.connect(url, function(err, db){
        assert.equal(err, null);
        console.log('Connected to the MongoDB server');
        dbops.findDocuments(db, 'places', function(docs){
          res.render('places', {places: docs});
        });
        db.close();
    });
});

app.get('/places/:place_id', function(req, res, next){
    //res.send('Will return a short description of a particular place with id ' + req.params.place_id);
    mongoClient.connect(url, function(err, db){
        assert.equal(err, null);
        console.log('Connected to the MongoDB server');
        dbops.findDocument(db, 'places', req.params.place_id, function(doc){
          res.render('place', doc);
        });
        db.close();
    });
});

// Adding new places to the db
app.post('/places/add', function(req, res, next){
    mongoClient.connect(url, function(err, db){
        assert.equal(err, null);
        console.log('Connected to the MongoDB server');

        var collection = 'places';
        var document = { "name": req.body.name };

        dbops.insertDocument(db, collection, document, function(){
            console.log('New place ' + req.body.name + ' added to the db');
            res.redirect('/places');
        });
        db.close();
    });
});

app.put('/places/:place_id', function(req, res, next){
    res.send('Will edit the ' + req.params.place_id + ' place\'s info\n{"id":"place_id","name":"place_name","address":"place_address","info":"some_notes"}');
});

app.delete('/places/:place_id', function(req, res, next){
    res.send('Will delete the ' + req.params.place_id + ' place');
});

app.get('/vote', function(req, res, next){
    res.send('Will return current intermediate result of the today vote');
});

app.post('/vote', function(req, res, next){
    res.send('Vote for a concrete place for today');
});

app.get('/history', function(req, res, next){
    res.send('Will return history of our choises of the last week');
});

app.get('/log', function(req, res, next){
    res.send('Will log all requests to the app');
});

app.use(express.static(__dirname + '/public'));

app.listen(port);
