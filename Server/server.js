var express = require('express');
var bodyParser = require('body-parser');

var env = require('dotenv/config');
var path = require('path');

var app = express();

app.get('/', function(req, res){
    res.send('1ance Test Server');
});

app.listen(5500, function(){
    console.log('Server Started on Port 5500...');
});

var mysql = require('mysql');

var db = mysql.createConnection({
  host     : process.env.RDS_HOSTNAME,
  user     : process.env.RDS_USERNAME,
  password : process.env.RDS_PASSWORD,
  port     : process.env.RDS_PORT,
  database : process.env.RDS_NAME
});

db.connect(function(error) {
  if (error) {
    console.error('Database connection failed: ' + error.stack);
    return;
  }

  console.log('Connected to database.');
});
