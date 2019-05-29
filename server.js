const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const db             = require('./config/db');
const app            = express();

const port = 5000;

app.use(bodyParser.urlencoded({ extended: true }));


MongoClient.connect("mongodb+srv://Vaishnav:Vaishnav123@prd-pwuxx.mongodb.net/prediction?retryWrites=true", function(err, db) {
  if(err) console.log(err);
  require('./app/routes')(app, db);
    app.listen(port, () => {
    console.log('We are live on ' + port);
  });
});



