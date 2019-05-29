const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const db             = require('./config/db');
const app            = express();


app.use(bodyParser.urlencoded({ extended: true }));


MongoClient.connect("mongodb+srv://Vaishnav:Vaishnav123@prd-pwuxx.mongodb.net/prediction?retryWrites=true", function(err, db) {
  if(err) console.log(err);
  require('./app/routes')(app, db);
    app.listen(process.env.PORT || 8080);
});



