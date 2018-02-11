var express = require('express');
var bodyParser = require('body-parser');

var env = require('dotenv/config');
var path = require('path');

var app = express();

app.get('/', function(req, res){
    res.send('1ance Test Server');
});

app.listen(5500, function(){
    console.log('Server Started on Port 5500..');
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


// Add User into User credentials Table
app.get('/signUp', (req, res) => {
    var fname = 'Purdue'; 
    var mname = 'Boilermaker'; 
    var lname = 'Pete';
    var email = 'purduepete@purdue.com'; 
    var password = "pass123";
    let post = {
        FirstName: fname, 
        MiddleName: mname, 
        LastName: lname,
        EmailID: email, 
        Password: password
    };

    let query = 'INSERT INTO Users SET ?';
    
    db.query(query, post, (error, response) => {
        console.log(response);
        
        if(error) {
            res.send(JSON.stringify({
                "status": 500, 
                "error": error, 
                "response": null
            }));
        }
        
        else {
            res.send(JSON.stringify({
                "status": 200, 
                "error": null, 
                "response": response
            }));
        }
    });
});


// Get list of Posts
app.get('/getPosts', (req, res) => {
    let query = 'SELECT * FROM Posts';
    
    db.query(query, (error, response) => {
        console.log(response);
        
        if(error) {
            res.send(JSON.stringify({
                "status": 500, 
                "error": error, 
                "response": null
            }));
        }
        
        else {
            res.send(JSON.stringify({
                "status": 200, 
                "error": null, 
                "response": response
            }));
        }
    });
});
