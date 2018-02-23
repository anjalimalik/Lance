/*
General
*******
Email from client - req.body.email
Password from client - req.body.pass
Name of client - req.body.name

Edit user profile endpoint
**************************
Field to be edited - req.body.field
Date to be added - req.body.fdata

Editing a field in User Profile pass one of the below in body as 'field'

Skills - skills
Education - edu
Links - links
Cover Photo - pic (Support not added yet)
Description - desc
Documents - docs (Support not added yet)
Contact Info (Mobile Number) - contact
Name - name (Support not added yet)

Create new post endpoint - Anjali could you describe what the endpoint does and each field means a bit more? thanks -Kenan
************************
Content: req.body.Content,
PostingType: req.body.PostingType,
money: req.body.money,
numLikes: numLikes,
Tags: req.body.Tags,
PostingStatus: Status, - set to 1 initiialy to indicate open
DatePosted: posted, - get date from system
UserID: null - get user id from database
*/

var AMAZON_ACCESS_KEY = "AKIAJCVYDLK3I4O5M4YQ";
var AMAZON_SECRET_ACCESS_KEY = "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";
var S3_BUCKET_NAME="1ancepics";

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var env = require('dotenv/config');
var path = require('path');
var uuid = require("uuid/v4");
var crypto = require('crypto');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors({
  origin: 'http://localhost:5500',
  credentials: true
}));

app.get('/', function (req, res) {
    res.send('1ance Test Server');
});

app.listen(5500, function () {
    console.log('Server Started on Port 5500..');
});

var mysql = require('mysql');

var db = mysql.createConnection({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    port: process.env.RDS_PORT,
    database: process.env.RDS_NAME
});

db.connect(function (error) {
    if (error) {
        console.error('Database connection failed: ' + error.stack);
        return;
    }

    console.log('Connected to database.');
});


//Auth Middleware
function authMiddleware(req, res, next) {

    // this is to make sure that user cannot get access to any page before signing in.
    if (!req.query.auth) {
        return res.status(400).json({ message: "unauthorized access" });
    }

    //Check this token against the database
    var dbQuery = "select * from Users where AuthToken = ?";
    db.query(dbQuery, [req.query.auth], function (err, user) {
        if (err) {
            return res.status(500).json({ message: "Internal server error" });
        }
        if (!user) {
            return res.status(400).json({ message: "unauthorized access" });
        }
        // check if expired
        var currentTime = new Date();
        var tokenTimestamp = new Date(parseInt(user.AuthTokenIssued));

        var millisInHour = 1000 * 60 * 60;
        if (currentTime - tokenTimestamp > millisInHour) {
            return res.status(400).json({ message: "auth token expired" });
        }
        return next();
    });
};

// Add User into User credentials Table
app.post('/signUp', (req, res) => {

    var email = req.body.email;
    var password = req.body.pass;
    var name = req.body.name;

    password = createPass(email, password);

    let user = {
        Email: email,
        Password: password
    };

    let query = 'INSERT INTO Users SET ?';

    db.query(query, user, (error, response) => {
        console.log(response);

        if (error) {
            res.send(JSON.stringify({
                "status": 500,
                "error": error,
                "response": null,
                "message": "Internal server error"
            }));
        }

        else {
            res.send(JSON.stringify({
                "status": 200,
                "error": null,
                "response": response,
                "message": "success"
            }));
        }
    });
});


// Get list of Posts
app.get('/getPosts', authMiddleware, (req, res) => {
    let query = 'SELECT * FROM Posts';

    db.query(query, (error, response) => {
        console.log(response);

        if (error) {
            res.send(JSON.stringify({
                "status": 500,
                "error": error,
                "message": "Internal server error",
                "response": null
            }));
        }

        else {
            res.send(JSON.stringify({
                "status": 200,
                "error": null,
                "response": response,
                "message": "success"
            }));
        }
    });
});

//Login
app.post('/login', function (req, res) {

    var email = req.body.email;
    var password = req.body.pass;

    password = createPass(email, password);

    if (!email || !password) { //SHOULD BE HANDLED IN JS too
        return res.status(401).json({ message: "invalid_credentials" });
    }

    var dbQuery = "select * from Users where Email = ? and Password = ?";
    var requestParams = [email, password];

    db.query(dbQuery, requestParams, function (err, user) {

        if (err) {
            return res.status(500).json({ message: "Internal server error" });
        }

        if (user == null) {
            return res.status(401).json({ message: "invalid_credentials" });
        }

        // valid user, issue them an auth token
        var authToken = uuid();
        var currentTime = new Date().getTime().toString();
        // Store the auth token in the database
        db.query("UPDATE Users SET AuthToken = ?, AuthTokenIssued = ? WHERE Email = ?", [authToken, currentTime, email], function (err) {

            if (err) {
                return res.status(500).json({ message: "Internal server error" });
            }
            return res.status(200).json({ message: "success", authToken: authToken });
        });
    });
});


//Create new post
app.post('/CreatePost', authMiddleware, function (req, res) {

    // Headline, Content, PostingType, and Money are required entires that must be provided by users
    if (!req.body.Headline) {
        return res.status(400).json({ message: "Missing Headline" });
    }
    if (!req.body.Content) {
        return res.status(400).json({ message: "Missing Content" });
    }
    if (!req.body.PostingType) {
        return res.status(400).json({ message: "Missing posting type" });
    }
    if (!req.body.money) {
        return res.status(400).json({ message: "Missing money" });
    }

    // initially posting status should be open
    var Status = 1; // 1 is open, 0 is closed

    // initially  numLikes should be 0
    var numLikes = 0;

    // set date posted
    var posted = new Date().toString();

    // WILL HAVE TO USE SOMETHING TO INPUT USERID AUTOMATICALLY

    var newPost = {
        Headline: req.body.Headline,
        Content: req.body.Content,
        PostingType: req.body.PostingType,
        money: req.body.money,
        numLikes: numLikes,
        Tags: req.body.Tags,
        PostingStatus: Status,
        DatePosted: posted,
        UserID: null
    };

    let query = "INSERT INTO Posts (Headline, Content, PostingType, money, numLikes, Tags, PostingType, DatePosted, UserID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    var params = [newPost.Headline, newPost.Content, newPost.PostingType, newPost.money, newPost.numLikes, newPost.Tags, newPost.PostingType, newPost.DatePosted, newPost.UserID];

    db.run(query, params, function (error, response) {

        if (error) {
            res.send(JSON.stringify({
                "status": 500,
                "error": error,
                "response": null,
                "message": "Internal server error"
            }));
        }
        else {
            res.send(JSON.stringify({
                "status": 200,
                "error": null,
                "response": response,
                "message": "success"
            }));
        }
    });
});

//create User profile
app.post('/createProfile', function (req, res) {

    var qparams = [];

    var email = req.body.email;
    var skills = req.body.skills;
    var edu = req.body.edu;
    var links = req.body.links;
    var pic = req.body.pic;
    var desc = req.body.desc;
    var docs = req.body.docs;
    var contact = req.body.contact;
    var name = req.body.name;

    qparams.push("SkillsSet");
    qparams.push("Education");
    qparams.push("Links");
    qparams.push("Picture");
    qparams.push("Description");
    qparams.push("Documents");
    qparams.push("Email");
    qparams.push("ContactInfo");
    qparams.push("FullName");

    if (contact == "") {

        return res.status(400).json({ message: "missing_field_contact" });
    }
    if (name == "") {

        return res.status(400).json({ message: "missing_field_name" });
    }
    if (email == "") {

        return res.status(400).json({ message: "missing_field_email_critical" });
    }

    if (skills != "") {

        qparams.push(skills);
    }
    else {

        qparams.push("");
    }

    if (edu != "") {

        qparams.push(edu);
    }
    else {

        qparams.push("");
    }

    if (links != "") {

        qparams.push(links);
    }
    else {

        qparams.push("");
    }

    if (pic != "") {

        qparams.push(pic);
    }
    else {

        qparams.push("");
    }

    if (desc != "") {

        qparams.push(desc);
    }
    else {

        qparams.push("");
    }

    if (docs != "") {

        qparams.push(docs);
    }
    else {

        qparams.push("");
    }

    qparams.push(email);
    qparams.push(contact);
    qparams.push(name);

    let query = "INSERT INTO Profiles (??, ??, ??, ??, ??, ??, ??, ??,??) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(query, qparams, function (error) {

        if (error) {
            return res.status(500).json({ message: error });
        }
        return res.status(200).json({ message: "Profile Created" });
    });
});

// Edit user profile details
app.post('/editProfile', authMiddleware, function (req, res) {

    var qparams = [];

    var email = req.body.email;
    var skills = req.body.skills;
    var edu = req.body.edu;
    var links = req.body.links;
    var pic = req.body.pic;
    var desc = req.body.desc;
    var docs = req.body.docs;
    var contact = req.body.contact;
    var name = req.body.name;


    if (contact == "") {

        return res.status(400).json({ message: "missing_field_contact" });
    }
    if (name == "") {

        return res.status(400).json({ message: "missing_field_name" });
    }
    if (email == "") {

        return res.status(400).json({ message: "missing_field_email_critical" });
    }

    if (skills != "") {

        qparams.push(skills);
    }
    else {

        qparams.push("");
    }

    if (edu != "") {

        qparams.push(edu);
    }
    else {

        qparams.push("");
    }

    if (links != "") {

        qparams.push(links);
    }
    else {

        qparams.push("");
    }

    if (pic != "") {

        qparams.push(pic);
    }
    else {

        qparams.push("");
    }

    if (desc != "") {

        qparams.push(desc);
    }
    else {

        qparams.push("");
    }

    if (docs != "") {

        qparams.push(docs);
    }
    else {

        qparams.push("");
    }

    qparams.push(email);
    qparams.push(contact);
    qparams.push(name);
    qparams.push(email);

    let query = "UPDATE Profiles SET SkillsSet = ?, Education = ?, Links = ?, Picture = ?, Description = ?, Documents = ?, Email = ?, ContactInfo = ?, FullName = ? WHERE Email = ?";

    db.query(query, qparams, function (error) {

        if (error) {
            return res.status(500).json({ message: error });
        }
        return res.status(200).json({ message: "Profile Updated" });
    });
});

app.get('/sign-s3', (req, res) => {
  const s3 = new aws.S3();
  const fileName = req.query['file-name'];
  const fileType = req.query['file-type'];
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if(err){
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
    };
    res.write(JSON.stringify(returnData));
    res.end();
  });
});

function createPass(email, password) {

    var i = email.length;
    var salt = email.substring(i/2, i) + email.substring(0, i/2);

    const cipher = crypto.createCipher('aes192', salt);

    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
}

function decipherPass(email, password) {

    var i = email.length;
    var salt = email.substring(i/2, i) + email.substring(0, i/2);

    const decipher = crypto.createDecipher('aes192', salt);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
