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
Create new post endpoint - (Anjali)
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
var cors = require('cors');
var express = require('express');
var bodyParser = require('body-parser');

var env = require('dotenv/config');
var path = require('path');
var uuid = require("uuid/v4");
var crypto = require('crypto');

var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
    db.get(dbQuery, [req.query.auth], function (err, user) {
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

    //password = createPass(email, password);

    let user = {
        Email: email,
        Password: password,
        FullName: name
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
                "message": "Success! New user account created"
            }));
        }
    });
});


// Get list of Posts
app.get('/getPosts', (req, res) => {
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
                "message": "Success! All posts retrived."
            }));
        }
    });
});


// Get Sorted list of Posts
app.get('/getSortedPosts', (req, res) => {

    var basedOn = req.body.basedOn; // can be posting date or cost of service
    var order = req.body.order;

    // cannot be null
    if (basedOn == null || order == null) {
        return res.status(400).json({ message: "Not enough information provided for sorting of posts" });
    }
    else if (basedOn === "date") {
        if (order === "ASC") {
            let query = 'SELECT * FROM Posts ORDER BY DatePosted ASC;';
        }
        else if (order === "DESC") {
            let query = 'SELECT * FROM Posts ORDER BY DatePosted DESC;';
        }
        else {
            return res.status(400).json({ message: "Invalid request for sorting posts" });
        }
    }
    else if (basedOn === "cost") {
        if (order === "ASC") {
            let query = 'SELECT * FROM Posts ORDER BY money ASC;';
        }
        else if (order === "DESC") {
            let query = 'SELECT * FROM Posts ORDER BY money DESC;';
        }
        else {
            return res.status(400).json({ message: "Invalid request for sorting posts" });
        }
    }
    else {
        return res.status(400).json({ message: "Invalid request for sorting posts" });
    }


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
                "message": "Succes! Sorted posts retrived."
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

    var dbQuery = "SELECT * FROM Users WHERE Email = ? AND Password = ?";
    var requestParams = [email, password];

    db.query(dbQuery, requestParams, function (err, result) {

        if (err) {
            return res.status(500).json({ message: "Internal server error" });
        }

        if (result == null || result == "") {
            return res.status(401).json({ message: "invalid_credentials" });
        }
        //console.log(result[0].Password);

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
app.post('/CreatePost', function (req, res) {

    // Email is needed to connect post to user
    if (!req.body.email) {
        return res.status(400).json({ message: "Email of poster not sent" });
    }

    // Headline, Content, PostingType, and Money are required entires that must be provided by users
    if (!req.body.Headline) {
        return res.status(400).json({ message: "Missing Headline" });
    }
    if (!req.body.Content) {
        return res.status(400).json({ message: "Missing Content" });
    }
    if (!req.body.PostingType) {
        return res.status(400).json({ message: "Missing Posting Type" });
    }
    if (!req.body.money) {
        return res.status(400).json({ message: "Missing Money value" });
    }


    // initially posting status should be open
    var Status = 1; // 1 is open, 0 is closed

    // initially  numLikes should be 0
    var numLikes = 0;

    // set date posted
    var posted = new Date();

    // get user id using email
    let query1 = "SELECT idUsers FROM Users WHERE Email = ?";

    db.query(query1, req.body.email, function (err, resp) {

        if (err) {
            res.send(JSON.stringify({
                "status": 500,
                "error": err,
                "response": null,
                "message": "Internal server error"
            }));
        }

        // Enter here if no account corresponds to the given email
        if (resp == null || resp == "") {
            res.send(JSON.stringify({
                "status": 401,
                "response": resp,
                "message": "Could not find account with this email"
            }));
        }

        else {
            // account with given email exists, therefore, proceed with creating a post 
            let query2 = "INSERT INTO Posts SET ?";

            var newPost = {
                Headline: req.body.Headline,
                Content: req.body.Content,
                PostingType: req.body.PostingType,
                money: req.body.money,
                numLikes: numLikes,
                Tags: req.body.Tags,
                PostingStatus: Status,
                DatePosted: posted,
                UserID: resp[0].idUsers,
                Comments: ""
            };

            // INSERT INTO POSTS TABLE
            db.query(query2, newPost, function (error, response) {
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
                        "message": "Success! New Post created!"
                    }));
                }
            });
        }
    });
});


//Edit user profile details
app.post('/EditProfile', function (req, res) {

    var email = req.body.email;
    var name = req.body.name;
    var desc = req.body.desc;
    var contact = req.body.contact;
    var skills = req.body.skills;
    var edu = req.body.edu;
    var links = req.body.links;

    var auth = req.query.auth;
    let query = "UPDATE Profiles SET FullName = ?, ContactInfo = ?, Description = ?, SkillsSet = ?, Education = ?, Links = ? WHERE Email = ?";
    var params = [name, desc, contact, skills, edu, links, email];

    db.query(query, params, function (error, response) {
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
                "message": "Success! Profile successfully edited!"
            }));
        }
    });
});



// Profile Creation
app.post('/CreateProfile', (req, res) => {

    var email = req.body.email;
    var name = req.body.name;
    var desc = req.body.desc;
    var contact = req.body.contact;
    var skills = req.body.skills;
    var edu = req.body.education;
    var links = req.body.links;

    // First check if email corresponds to an account in Users Table.
    var query1 = "SELECT * FROM Users WHERE Email = ?";

    db.query(query1, email, function (error, response) {

        if (error) {
            res.send(JSON.stringify({
                "status": 500,
                "error": error,
                "response": null,
                "message": "Internal server error"
            }));
        }

        // Enter here if no account corresponds to the given email
        if (response == null || response == "") {
            res.send(JSON.stringify({
                "status": 401,
                "response": null,
                "message": "Could not find account with this email"
            }));
        }

        else {
            // Insert profile into Profiles table
            let query2 = "INSERT INTO Profiles SET ?";

            let userProfile = {
                Email: email,
                FullName: name,
                ContactInfo: contact,
                Description: desc,
                SkillsSet: skills,
                Education: edu,
                Links: links
            };

            db.query(query2, userProfile, (err, result) => {
                console.log(result);
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
                        "response": result,
                        "message": "Success! New profile created!"
                    }));
                }
            });
        }
    });
});


function createPass(email, password) {

    var i = email.length;
    var salt = email.substring(i / 2, i) + email.substring(0, i / 2);

    const cipher = crypto.createCipher('aes192', salt);

    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
}

function decipherPass(email, encrypted) {

    var i = email.length;
    var salt = email.substring(i / 2, i) + email.substring(0, i / 2);

    const decipher = crypto.createDecipher('aes192', salt);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Endpoint to Logout
app.post('/logout', function (req, res) {

    var signOut = req.body.signOut;
    var email = req.body.email;

    if (!signOut) {
        return res.status(401).json({ message: "Logout selection not recieved" });
    }

    // reset AuthToken and AuthTokenIssued
    var dbQuery = "UPDATE Users SET AuthToken = ?, AuthTokenIssued = ? WHERE Email = ?";
    var requestParams = [null, null, email];

    db.query(dbQuery, requestParams, function (err, result) {
        if (err) {
            return res.status(500).json({ message: "Internal server error" });
        } else {
            return res.status(200).json({ message: "Success! User logged out!" });
        }
    });
});


// Endpoint to Change Password
app.post('/changePassword', (req, res) => {

    var email = req.body.email;
    var currPassword = req.body.oldPass;
    var newPassword = req.body.newPass;

    let sql = "SELECT Password FROM Users WHERE Email = ?";

    db.query(sql, email, (error, response) => {
        console.log(response);
        if (error) {
            res.send(JSON.stringify({
                "status": 500,
                "error": error,
                "response": null,
                "message": "Internal server error - Could not check old Password"
            }));
        }
        else {
            // check if old password is the same as the one in database
            var matchCurrPass = decipherPass(email, response[0].Password);
            if (currPassword === matchCurrPass) {
                console.log("Current password matches");

                newPassword = createPass(email, newPassword);
                let query = "UPDATE Users SET Password = ? WHERE Email = ?";
                let params = [newPassword, email];

                // update password
                db.query(query, params, (error, response) => {
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
                            "message": "Success! User Password Changed!"
                        }));
                    }
                });
            }
            else {
                res.send(JSON.stringify({
                    "status": 500,
                    "error": error,
                    "response": null,
                    "message": "Current password is not correct"
                }));
            }
        }
    });
});

//Report a post
app.post('/Report', function (req, res) {

    var message = req.body.message;
    var postId = req.body.postId;
    let query = "INSERT INTO REPORTS SET ?";

    if (!message || !postId) {
        return res.status(400).json({ message: "Missing information" });
    }

    var report = {
        Message: message,
        PostId: postId
    };

    // INSERT INTO REPORTS TABLE
    db.query(query, report, function (error, response) {
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
                "message": "Success! Report submitted!"
            }));
        }
    });

});



// Get list of Comments
app.post('/getComments', (req, res) => {

    var postId = req.body.postId;

    if (!postId) {
        return res.status(400).json({ message: "Missing information" });
    }

    let query = 'SELECT Comments FROM Posts WHERE idPosts = ?';
    let params = [postId];

    db.query(query, params, (error, response) => {
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
                "message": "Success! All comments retrived."
            }));
        }
    });
});

// Endpoint to write a comment on a post
app.post('/WriteComment', (req, res) => {

    var postId = req.body.postId;
    var newComment = req.body.comment;
    if (!postId || !newComment) {
        return res.status(400).json({ message: "Missing information" });
    }

    let query = "SELECT Comments FROM Posts WHERE idPosts = ?";
    let params = [postId];

    var comments = "";

    // get comments
    db.query(query, params, (error, response) => {
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
            var string = JSON.stringify(response);
            var json = JSON.parse(string);

            comments = comments.concat(json[0].Comments);
            comments = comments.concat(";");
            comments = comments.concat(newComment);

            let query2 = "UPDATE Posts SET Comments = ? WHERE idPosts = ?";
            let params2 = [comments, postId];

            // update comments list
            db.query(query2, params2, (err, resp) => {
                console.log(resp);
                if (err) {
                    res.send(JSON.stringify({
                        "status": 500,
                        "error": err,
                        "response": null,
                        "message": "Internal server error"
                    }));
                }
                else {
                    res.send(JSON.stringify({
                        "status": 200,
                        "error": null,
                        "response": resp,
                        "message": "Success! New comment added!"
                    }));
                }
            });

        }
    });
});

// Endpoint to close a post (delete that post from the table)
app.post('/ClosePost', (req, res) => {

    var postId = req.body.postId;

    if (!postId) {
        return res.status(400).json({ message: "Missing information" });
    }

    let query = 'DELETE FROM Posts WHERE idPosts = ?';
    let params = [postId];

    db.query(query, params, (error, response) => {
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
                "message": "Success! Post closed/deleted."
            }));
        }
    });
});

// Endpoint to click interested (like) on a post
app.post('/ClickInterested', (req, res) => {
    var postId = req.body.postId;

    if (!postId) {
        return res.status(400).json({ message: "Missing information" });
    }

    let query = "SELECT numLikes FROM Posts WHERE idPosts = ?";
    let params = [postId];

    // get number of likes
    db.query(query, params, (error, response) => {
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
            var string = JSON.stringify(response);
            var json = JSON.parse(string);
            var num = parseInt(json[0].numLikes) + 1;

            let query2 = "UPDATE Posts SET numLikes = ? WHERE idPosts = ?";
            let params2 = [num, postId];

            // update numLikes
            db.query(query2, params2, (err, resp) => {
                console.log(resp);
                if (err) {
                    res.send(JSON.stringify({
                        "status": 500,
                        "error": err,
                        "response": null,
                        "message": "Internal server error"
                    }));
                }
                else {
                    res.send(JSON.stringify({
                        "status": 200,
                        "error": null,
                        "response": resp,
                        "message": "Success! Number of likes increased by 1!"
                    }));
                }
            });

        }
    });
});
