const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const db             = require('./config/db');

const app            = express();

const port = 8000;

app.use(bodyParser.urlencoded({ extended: true }));

var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  require('./app/routes')(app, db);
  app.listen(port, () => {
    console.log('We are live on ' + port);
  }); 
});


// MongoClient.connect(db.url, (err, database) => {
//   if (err) return console.log(err)
//   require('./app/routes')(app, database);
//   app.listen(port, () => {
//     console.log('We are live on ' + port);
//   });               
// })

// MongoClient.connect(db.url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("prediction");
//   dbo.createCollection("customers", function(err, res) {
//     if (err) throw err;
//     console.log("Collection created!");
//     db.close();
//   });
// });