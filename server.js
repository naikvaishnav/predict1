const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const db             = require('./config/db');
const app            = express();



app.use(bodyParser.urlencoded({ extended: true }));

//Localhost Setup
// const port = 8000;
// var url = 'mongodb://localhost:27017/prediction';
// MongoClient.connect(url, function(err, db) {

MongoClient.connect("mongodb+srv://Vaishnav:Vaishnav123@prd-pwuxx.mongodb.net/prediction?retryWrites=true", function(err, db) {
  if(err) console.log(err);
  require('./app/routes')(app, db);
    app.listen(process.env.PORT || 8080);
    //Localhost Setup
    // app.listen(port, () => {    console.log('We are live on ' + port);  });
});



