/* DESC INCOMPLETE
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
var randomstring = require("randomstring");
var nodemailer = require("nodemailer");

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

    password = createPass(email, password);

    let user = {
        Email: email,
        Password: password,
        FullName: name
    };

    let query = 'INSERT INTO Users SET ?';

    db.query(query, user, (error, response) => {
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
    let query = 'SELECT * FROM Posts ORDER BY DatePosted DESC';

    db.query(query, (error, response) => {

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

    // initially  numLikes should be 0
    var numLikes = 0;

    // set date posted
    var posted = new Date();

    var time = posted.getTime();

    if (!req.body.Category) {
        var cat = null;
        var att = null;
    }
    else {
        var cat = req.body.Category;
        var att = req.body.Attributes;
    }

    // get user id using email
    let query1 = "SELECT idUsers, FullName FROM Users WHERE Email = ?";

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
                DatePosted: posted,
                UserID: resp[0].idUsers,
                DateMSEC: time,
                Category: cat,
                Attributes: att,
                UserName: resp[0].FullName
            };

            // INSERT INTO POSTS TABLE
            db.query(query2, newPost, function (error, response) {
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

    if (!email || !name) {
        return res.status(400).json({ message: "Missing information" });
    }

    // First check if email corresponds to an account in Users Table.
    var query1 = "SELECT idUsers FROM Users WHERE Email = ?";

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

            var string = JSON.stringify(response);
            var json = JSON.parse(string);

            var id = parseInt(json[0].idUsers);

            let userProfile = {
                idUsers: id,
                Email: email,
                FullName: name,
                ContactInfo: contact,
                Description: desc,
                SkillsSet: skills,
                Education: edu,
                Links: links
            };

            db.query(query2, userProfile, (err, result) => {
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

    var email = req.body.email;

    if (!email) {
        return res.status(401).json({ message: "User not logged in!" });
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

app.post('/resetPass', function (req, res) {

    var email = req.body.email;

    if (!email) {
        return res.status(401).json({ message: "User not logged in!" });
    }

    var PIN = randomstring.generate({ length: 6, charset: 'numeric' });

    // reset AuthToken and AuthTokenIssued
    var dbQuery = "UPDATE Users SET resetPIN = ? WHERE Email = ?";
    var requestParams = [PIN, email];

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: '1ance.profilehelp@gmail.com',
            pass: '1ancedev'
        }
    });

    mess_text = "Hello,\n\tEnter this PIN: " + PIN + " to change your password.\nThis PIN is valid for 24 hours.\n\nThank you for using 1ance";

    var mailOptions = {
        from: '1ance.profile@gmail.com',
        to: email,
        subject: 'Reset Password',
        text: mess_text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return res.status(500).json({ message: "Internal server error" });
        } else {

            db.query(dbQuery, requestParams, function (err, result) {
                if (err) {
                    return res.status(500).json({ message: "Internal server error" });
                } else {
                    return res.status(200).json({ message: "Success" });
                }
            });
        }
    });
});

app.post('/verifyPIN', function (req, res) {

    var email = req.body.email;
    var pass = req.body.password;
    var PIN = req.body.PIN;

    if (!email) {
        return res.status(401).json({ message: "Missing information" });
    }

    if (!pass) {
        return res.status(401).json({ message: "Missing information" });
    }

    if (!PIN) {
        return res.status(401).json({ message: "Missing information" });
    }

    let sql = "SELECT * FROM Users WHERE Email = ? AND resetPIN = ?";
    params = [email, PIN];

    pass = createPass(email, pass);

    db.query(sql, params, function (err, result) {
        if (err) {
            return res.status(500).json({ message: "Internal server error" });
        }
        if (result == null || result == "") {
            return res.status(401).json({ message: "Invalid PIN" });
        }

        var passquery = "UPDATE Users Set Password = ?, AuthToken = ?, AuthTokenIssued = ? WHERE Email = ?";
        var passparams = [pass, null, null, email];

        db.query(passquery, passparams, function (err, result) {
            if (err) {
                return res.status(500).json({ message: "Internal server error" });
            } else {
                return res.status(200).json({ message: "Password has been reset" });
            }
        });
    });

});

// Endpoint to Change Password
app.post('/changePassword', (req, res) => {

    var email = req.body.email;
    var currPassword = req.body.oldPass;
    var newPassword = req.body.newPass;
    let sql = "SELECT Password FROM Users WHERE Email = ?";

    db.query(sql, email, (error, response) => {
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
                newPassword = createPass(email, newPassword);
                let query = "UPDATE Users SET Password = ? WHERE Email = ?";
                let params = [newPassword, email];

                // update password
                db.query(query, params, (error, response) => {
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

    let query = 'SELECT Comment, SenderName FROM Comments WHERE idPosts = ?';

    db.query(query, postId, (error, response) => {

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
    var comment = req.body.comment;
    var sender = ""; // name of the person who commented
    var userid = 0; // user id of the person who is the owner of the post
    var useridCommenter = req.body.id; // user id of the person who commented on the post

    // call function to make new notification
    newNotification(comment, postId, useridCommenter);

    /* Getting full name of the user who commented */
    let query1 = "SELECT FullName FROM Users WHERE idUsers = ?";

    db.query(query1, useridCommenter, function (err1, resp1) {
        if (err1) {
            res.send(JSON.stringify({
                "status": 500,
                "error": err1,
                "response": null,
                "message": "Internal server error"
            }));
        }
        else {
            var string = JSON.stringify(resp1);
            var json = JSON.parse(string);
            sender = sender.concat(json[0].FullName);

            /* Next, getting user id of the person who's post was commented on */
            let query2 = "SELECT UserID FROM Posts WHERE idPosts = ?";

            db.query(query2, postId, function (err2, resp2) {
                if (err2) {
                    res.send(JSON.stringify({
                        "status": 500,
                        "error": err2,
                        "response": null,
                        "message": "Internal server error"
                    }));
                }
                else {
                    var string = JSON.stringify(resp2);
                    var json = JSON.parse(string);
                    userid = parseInt(json[0].UserID);

                    let query3 = "INSERT INTO Comments SET ?";

                    var newComment = {
                        idOwnerOfPost: userid,
                        idPosts: postId,
                        Comment: comment,
                        SenderName: sender,
                        idCommenter: useridCommenter
                    };

                    // INSERT INTO Comments TABLE
                    db.query(query3, newComment, function (err, resp) {
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
        }
    });
});

// Endpoint to close a post (delete that post from the table)
app.post('/ClosePost', (req, res) => {

    var postId = req.body.postId;

    if (!postId) {
        return res.status(400).json({ message: "Missing information" });
    }

    let query1 = 'DELETE FROM Posts WHERE idPosts = ?';

    db.query(query1, postId, (error, response) => {
        if (error) {
            res.send(JSON.stringify({ "status": 500, "error": error, "message": "Internal server error", "response": null }));
        }

        else {
            let query2 = 'DELETE FROM Comments WHERE idPosts = ?';

            db.query(query2, postId, (err, resp) => {
                if (err) {
                    res.send(JSON.stringify({ "status": 500, "error": err, "message": "Internal server error", "response": null }));
                }

                else {
                    res.send(JSON.stringify({ "status": 200, "error": null, "response": resp, "message": "Success! Post closed/deleted." }));
                }
            });
        }
    });
});

// Endpoint to click interested (like) on a post
app.post('/ClickInterested', (req, res) => {
    var postId = req.body.postId;

    // who liked it
    var id = req.body.id;

    if (!postId || !id) {
        return res.status(400).json({ message: "Missing information" });
    }

    // function to send new notification for the like
    newNotification("like", postId, id);

    let query = "SELECT numLikes FROM Posts WHERE idPosts = ?";

    // get number of likes
    db.query(query, postId, (error, response) => {
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

/* THIS ENDPOINT WILL NEED MODIFICATIONS IN SPRINT 3 */
//Get Profile for user to view it
app.post('/getProfile', function (req, res) {

    var email = req.body.email;
    var id = req.body.id;

    var query;
    var params;

    if (email) {
        query = "SELECT * FROM Profiles WHERE Email = ?";
        params = [email];
    }
    else {
        query = "SELECT * FROM Profiles WHERE idUsers = ?";
        params = [id];
    }


    db.query(query, params, function (error, response) {
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
                "message": "Success! Profile successfully retrieved!"
            }));
        }
    });
});


// Function to add a new notification after every like and comment
function newNotification(str, postid, useridActor) {

    var notification = "";
    var sender = ""; // name of the person who liked or commented
    var userid = 0; // user id of the person who created the post
    var headline = ""; //headline of the post that was liked or commented on

    /* Getting full name of the user who liked or commented */
    let query1 = "SELECT FullName FROM Users WHERE idUsers = ?";

    db.query(query1, useridActor, function (err1, resp1) {
        if (err1) {
            console.log("Internal server error");
            return;
        }
        else {
            var string = JSON.stringify(resp1);
            var json = JSON.parse(string);
            sender = sender.concat(json[0].FullName);

            /* Next, getting user id of the person who's post was liked or commented on */
            let query2 = "SELECT UserID, Headline FROM Posts WHERE idPosts = ?";

            db.query(query2, postid, function (err2, resp2) {
                if (err2) {
                    console.log("Internal server error");
                    return;
                }
                else {
                    var string = JSON.stringify(resp2);
                    var json = JSON.parse(string);
                    userid = json[0].UserID;
                    headline = headline.concat(json[0].Headline);

                    // if notification is for liking a post
                    if (str === "like") {
                        notification = "Your post '";
                        notification = notification.concat(headline);
                        notification = notification.concat("' was liked by ");
                        notification = notification.concat(sender);
                    }
                    else {
                        notification = notification.concat(sender);
                        notification = notification.concat(" commented '");
                        notification = notification.concat(str);
                        notification = notification.concat("' on your post '");
                        notification = notification.concat(headline);
                        notification = notification.concat("'");
                    }

                    var date = new Date();
                    date = date.toString();
                    date = date.split("GMT");
                    date = date[0];
                    notification = notification.concat(" @ ");
                    notification = notification.concat(date);
                    var msec = (new Date(date)).getTime();

                    let query3 = "INSERT INTO Notifications SET ?";

                    var newNotification = {
                        idUsers: userid,
                        idPosts: postid,
                        Notification: notification,
                        SenderName: sender,
                        msec: msec,
                        seen: 0
                    };

                    // INSERT INTO Notifications TABLE
                    db.query(query3, newNotification, function (err, resp) {
                        if (err) {
                            console.log("Internal server error");
                        }
                        else {
                            console.log("Success! New Notification added!");
                        }
                    });
                }
            });
        }
    });
}

//Get all Notifications for user to view them
app.post('/getAllNotifications', function (req, res) {

    var id = req.body.id;

    if (!id) {
        return res.status(400).json({ message: "Missing information" });
    }

    // get data from Notifications using the user id
    let query = "SELECT Notification FROM Notifications WHERE idUsers = ? ORDER BY msec DESC";

    db.query(query, id, (err, result) => {
        if (err) {
            res.send(JSON.stringify({
                "status": 500,
                "error": err,
                "response": null,
                "message": "Internal server error"
            }));
        }
        else {
            seeNotifications(id);
            res.send(JSON.stringify({
                "status": 200,
                "error": null,
                "response": result,
                "message": "Success! All notifications for user retrieved!"
            }));
        }
    });
});

//Get unseen Notifications for user to view them
app.post('/getNewNotifications', function (req, res) {

    var id = req.body.id;

    if (!id) {
        return res.status(400).json({ message: "Missing information" });
    }

    // get data from Notifications using the user id
    let query1 = "SELECT Notification FROM Notifications WHERE idUsers = ? AND seen = '0' ORDER BY msec DESC";

    db.query(query1, id, (err, result) => {
        if (err) {
            res.send(JSON.stringify({
                "status": 500,
                "error": err,
                "response": null,
                "message": "Internal server error"
            }));
        }
        else {
            seeNotifications(id);

            res.send(JSON.stringify({
                "status": 200,
                "error": null,
                "response": result,
                "message": "Success! All new/unseen notifications for user retrieved!"
            }));
        }
    });
});

// function to see all notifications
function seeNotifications(id) {
    // toggle the seen attribute in the database
    let query = "UPDATE Notifications SET seen = '1' WHERE idUsers = ? AND seen = '0'";

    db.query(query, id, (error, response) => {
        if (error) {
            console.log("Error: Cannot 'see' new notifications");
        }
        else {
            console.log("Notifications seen from unseen");
        }
    });
}

//Get number of unseen Notifications when the user logs in
app.post('/getNumNotifications', function (req, res) {

    var id = req.body.id;

    if (!id) {
        return res.status(400).json({ message: "Missing information" });
    }

    let query1 = "SELECT COUNT(Notification) AS count FROM Notifications WHERE idUsers = ? AND seen = '0'";

    db.query(query1, id, (err, result) => {
        if (err) {
            res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "message": "Internal server error" }));
        }
        else {
            res.send(JSON.stringify({ "status": 200, "error": null, "response": result, "message": "Success! Number of new notifications recieved!" }));
        }
    });
});



// Get Sorted list of Posts, using either by order - ASCENDING OR DESCENDING or by range - upper/lower bounds (either for money or date posted)
app.post('/getSortedPosts', (req, res) => {

    var basedOn = req.body.basedOn; // can be posting date or cost of service
    var order = req.body.order;
    var upperBound = req.body.upper;
    var lowerBound = req.body.lower;

    let params = [];
    let query = "";

    // cannot be null
    if (!basedOn || (!order && (!upperBound && !lowerBound))) {
        return res.status(400).json({ message: "Not enough information provided for sorting of posts" });
    }
    else if (basedOn === "date") {
        if (order && upperBound && lowerBound) {
            var d1 = Date.parse(lowerBound);
            var d2 = Date.parse(upperBound);
            if (order === "ASC") {
                query = 'SELECT * FROM Posts WHERE DateMSEC BETWEEN ? AND ? ORDER BY DateMSEC ASC;';
            }
            else if (order === "DESC") {
                query = 'SELECT * FROM Posts WHERE DateMSEC BETWEEN ? AND ? ORDER BY DateMSEC DESC;';
            }
            else {
                return res.status(400).json({ message: "Invalid request for sorting posts" });
            }
            params = [d1, d2];
        }
        else if (!order) {
            var d1 = Date.parse(lowerBound);
            var d2 = Date.parse(upperBound);
            query = 'SELECT * FROM Posts WHERE DateMSEC BETWEEN ? AND ? ORDER BY DatePosted DESC;';
            params = [d1, d2];
        }
        else if (!upperBound && !lowerBound) {
            if (order === "ASC") {
                query = 'SELECT * FROM Posts ORDER BY DatePosted ASC;';
            }
            else if (order === "DESC") {
                query = 'SELECT * FROM Posts ORDER BY DatePosted DESC;';
            }
            else {
                return res.status(400).json({ message: "Invalid request for sorting posts" });
            }
        }
        else {
            return res.status(400).json({ message: "Not enough information provided for sorting of posts" });
        }
    }
    else if (basedOn === "cost") {
        if (order && upperBound && lowerBound) {
            if (order === "ASC") {
                upperBound = parseFloat(upperBound);
                lowerBound = parseFloat(lowerBound);
                query = 'SELECT * FROM Posts WHERE money BETWEEN ? AND ? ORDER BY money ASC;';
                params = [lowerBound, upperBound];
            }
            else if (order === "DESC") {
                upperBound = parseFloat(upperBound);
                lowerBound = parseFloat(lowerBound);
                query = 'SELECT * FROM Posts WHERE money BETWEEN ? AND ? ORDER BY money DESC;';
                params = [lowerBound, upperBound];
            }
            else {
                return res.status(400).json({ message: "Invalid request for sorting posts" });
            }
        }
        else if (order == null) {
            upperBound = parseFloat(upperBound);
            lowerBound = parseFloat(lowerBound);
            query = 'SELECT * FROM Posts WHERE money BETWEEN ? AND ? ORDER BY DatePosted DESC;';
            params = [lowerBound, upperBound];
        }
        else {
            if (order === "ASC") {
                query = 'SELECT * FROM Posts ORDER BY money ASC;';
            }
            else if (order === "DESC") {
                query = 'SELECT * FROM Posts ORDER BY money DESC;';
            }
            else {
                return res.status(400).json({ message: "Invalid request for sorting posts" });
            }
        }
    }
    else {
        return res.status(400).json({ message: "Invalid request for sorting posts" });
    }

    db.query(query, params, (error, response) => {

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
                "message": "Success! Sorted posts retrived."
            }));
        }
    });
});


// Get Filtered list of Posts - by Offer/Requests, or Categories
app.post('/getFilteredPosts', (req, res) => {

    var category = req.body.category; // can be posting date or cost of service
    var type = req.body.type;

    let query = "";
    let params = [];

    // cannot be null
    if (!category && !type) {
        return res.status(400).json({ message: "Not enough information provided for filtering of posts" });
    }
    else if (type) {
        query = "SELECT * FROM Posts WHERE PostingType = ?";
        params = [type];
    }
    else {
        query = "SELECT * FROM Posts WHERE Category = ?";
        params = [category];
    }

    db.query(query, params, (error, response) => {

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
                "message": "Success! Filtered posts retrived."
            }));
        }
    });
});

// May not be needed earlier. However, other options are buggy currently
// Get category and attributes of a post
app.post('/getCatAttributes', (req, res) => {
    var id = req.body.postID;
    query = "SELECT Category, Attributes FROM Posts WHERE idPosts = ?";
    db.query(query, id, (error, response) => {
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
                "message": "Success! Category and Attributes retrieved."
            }));
        }
    });
});


//Edit post details
app.post('/EditPost', function (req, res) {

    var id = req.body.PostId;

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

    /*
        // set date posted
        var posted = new Date();

        var time = posted.getTime();
    */

    if (req.body.Category) {
        var cat = req.body.Category;
        var att = req.body.Attributes;
    }

    let query = "UPDATE Posts SET Headline = ?, Content = ?, PostingType = ?, money = ?, Category = ?, Attributes = ? WHERE idPosts = ?";
    var params = [req.body.Headline, req.body.Content, req.body.PostingType, req.body.money, cat, att, id];

    // Update post
    db.query(query, params, function (error, response) {
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
                "message": "Success! Post updated!"
            }));
        }
    });
});

//Run Search
app.post('/runSearch', function (req, res) {

    var key = req.body.key;

    key = "%" + key + "%";

    if (key == "") {

        let query = 'SELECT * FROM Posts ORDER BY DatePosted DESC';

        db.query(query, (error, response) => {

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
    }

    var dbQuery = "SELECT * FROM Posts WHERE Headline LIKE ? OR Content LIKE ?";
    var requestParams = [key, key];

    db.query(dbQuery, requestParams, function (err, result) {

        if (err) {
            return res.status(500).json({ message: "Internal server error" });
        }

        return res.status(200).json({ response: result });
    });
});

// Get user id from email
app.post('/getUserID', function (req, res) {
    var email = req.body.email;
    let query = "SELECT idUsers FROM Users WHERE Email = ?";

    // get user id connected to the email
    db.query(query, email, function (error, response) {
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
                "message": "Success! User ID retrieved!"
            }));
        }
    });
});

// Could be used for populating edit post modal
// get details of one particular post
app.post('/getSelectedPost', function (req, res) {
    var id = req.body.PostId;

    let query = "SELECT * FROM Posts WHERE idPosts = ?";

    // get that post
    db.query(query, id, function (error, response) {
        if (error) {
            res.send(JSON.stringify({ "status": 500, "error": error, "response": null, "message": "Internal server error" }));
        }
        else {
            res.send(JSON.stringify({ "status": 200, "error": null, "response": response, "message": "Success! Selected post retrieved!" }));
        }
    });
});

// get user id of the owner of the post
// for notifications counter
app.post('/getOwnerIDofPost', function (req, res) {
    var id = req.body.postID;

    let query = "SELECT UserID FROM Posts WHERE idPosts = ?";

    db.query(query, id, function (error, response) {
        if (error) {
            res.send(JSON.stringify({ "status": 500, "error": error, "response": null, "message": "Internal server error" }));
        }
        else {
            res.send(JSON.stringify({ "status": 200, "error": null, "response": response, "message": "Success! User ID of the owner of the post retrieved!" }));
        }
    });
});

// Delete a user from the DB
app.post('/DeleteUser', function (req, res) {
    var id = req.body.userid;
    var pass = req.body.password;

    // first check whether the current password given is correct
    let queryPass = "SELECT Email, Password FROM Users WHERE idUsers = ?";

    db.query(queryPass, id, (error, response) => {

        if (error) {
            res.send(JSON.stringify({ "status": 500, "error": error, "response": null, "message": "Internal server error - Could not check current Password" }));
        }
        else {
            // check if current password is the same as the one in database
            var matchPass = decipherPass(response[0].Email, response[0].Password);
            //var matchPass = response[0].Password;
            if (pass === matchPass) {
                console.log("Current password is correct");

                //delete users one by one from all tables
                let queryUsers = "DELETE FROM Users WHERE idUsers = ?";

                db.query(queryUsers, id, function (err1, resp1) {
                    if (err1) {
                        res.send(JSON.stringify({ "status": 500, "error": err1, "response": null, "message": "Internal server error" }));
                    }
                    else {
                        let queryProfiles = "DELETE FROM Profiles WHERE idUsers = ?";
                        db.query(queryProfiles, id, function (err2, resp2) {
                            if (err2) {
                                res.send(JSON.stringify({ "status": 500, "error": err2, "response": null, "message": "Internal server error" }));
                            }
                            else {
                                let queryPosts = "DELETE FROM Posts WHERE UserID = ?";
                                db.query(queryPosts, id, function (err3, resp3) {
                                    if (err3) {
                                        res.send(JSON.stringify({ "status": 500, "error": err3, "response": null, "message": "Internal server error" }));
                                    }
                                    else {
                                        let queryNotifications = "DELETE FROM Notifications WHERE idUsers = ?";
                                        db.query(queryNotifications, id, function (err4, resp4) {
                                            if (err4) {
                                                res.send(JSON.stringify({ "status": 500, "error": err4, "response": null, "message": "Internal server error" }));
                                            }
                                            else {
                                                let queryComments = "DELETE FROM Comments WHERE idCommenter = ? OR idOwnerOfPost = ?";
                                                var paramsComments = [id, id];
                                                db.query(queryComments, paramsComments, function (err5, resp5) {
                                                    if (err5) {
                                                        res.send(JSON.stringify({ "status": 500, "error": err5, "response": null, "message": "Internal server error" }));
                                                    }
                                                    else {
                                                        console.log("User DELETED");
                                                        res.send(JSON.stringify({
                                                            "status": 200,
                                                            "error": null,
                                                            "response": response,
                                                            "message": "Success! User deleted from all tables!"
                                                        }));
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
            else {
                res.send(JSON.stringify({ "status": 401, "error": error, "response": null, "message": "Current password is not correct" }));
            }
        }
    });
});

/* Reviews */
// write a new review
app.post('/WriteReview', function (req, res) {
    var idUser = req.body.UserID;
    var byUserID = req.body.byUserID;
    var byUserName = req.body.byUserName;
    var rating = req.body.rating;

    // Check if necessary information if given
    if (!idUser || !byUserID || !rating || !byUserName) {
        return res.status(400).json({ message: "Missing Review Information" });
    }

    // Reviews are not required
    var review;
    if (req.body.review == null) {
        review = null;
    }
    else {
        review = req.body.review;
    }

    // set date posted
    var posted = new Date();
    var time = posted.getTime();

    // first check if the user has already posted a review for this user
    let query1 = "SELECT * FROM Reviews WHERE idUsers = ? AND byUserID = ?;"
    var params = [idUser, byUserID];
    db.query(query1, params, function (error1, response1) {
        if (error1) {
            res.send(JSON.stringify({ "status": 500, "error": error1, "response": null, "message": "Internal server error" }));
        }
        else {
            if (Object.keys(response1).length != 0) { // if they have already posted a review
                res.send(JSON.stringify({ "status": 200, "error": null, "response": null, "message": "You have already posted a review for this user!" }));
            }
            else { // if not, add a new review
                let query2 = "INSERT INTO Reviews SET ?";

                var newReview = {
                    Rating: rating,
                    Review: review,
                    idUsers: idUser,
                    byUserID: byUserID,
                    byUserName: byUserName,
                    DateMSEC: time,
                    DatePosted: posted
                };

                db.query(query2, newReview, function (error2, response2) {
                    if (error2) {
                        res.send(JSON.stringify({ "status": 500, "error": error2, "response": null, "message": "Internal server error" }));
                    }
                    else {
                        res.send(JSON.stringify({ "status": 200, "error": null, "response": response2, "message": "Success! New Review added!" }));
                    }
                });
            }
        }
    });
});

// get all reviews for that user
app.post('/getReviews', function (req, res) {
    var idUser = req.body.idUser;

    if (!idUser) {
        return res.status(400).json({ message: "Missing Review Information" });
    }

    let query = "SELECT * FROM Reviews WHERE idUsers = ?";

    db.query(query, idUser, function (error, response) {
        if (error) {
            res.send(JSON.stringify({ "status": 500, "error": error, "response": null, "message": "Internal server error" }));
        }
        else {
            res.send(JSON.stringify({ "status": 200, "error": null, "response": response, "message": "Success! Reviews retrieved!" }));
        }
    });
});

// get average rating for the user
app.post('/getAverageRating', function (req, res) {
    var idUser = req.body.idUser;

    if (!idUser) {
        return res.status(400).json({ message: "Missing Review Information" });
    }

    let query = "SELECT AVG(Rating) AS AverageRating FROM Reviews WHERE idUsers = ?";

    db.query(query, idUser, function (error, response) {
        if (error) {
            res.send(JSON.stringify({ "status": 500, "error": error, "response": null, "message": "Internal server error" }));
        }
        else {
            res.send(JSON.stringify({ "status": 200, "error": null, "response": response, "message": "Success! Average rating for the user retrieved!" }));
        }
    });
});

// Get Sorted list of Posts, using either by order - ASCENDING OR DESCENDING or by range - upper/lower bounds (either for money or date posted)
app.post('/getSortedReviews', (req, res) => {

    var order = req.body.order;
    var idUser = req.body.idUser;

    if (!idUser || !order) {
        return res.status(400).json({ message: "Missing Information for Sorting Reviews" });
    }

    let query = "";
    if (order === "ASC") {
        query = 'SELECT * FROM Reviews WHERE idUsers = ? ORDER BY Rating ASC;';
    }
    else {
        query = 'SELECT * FROM Reviews WHERE idUsers = ? ORDER BY Rating DESC;';
    }

    db.query(query, idUser, (error, response) => {
        if (error) {
            res.send(JSON.stringify({ "status": 500, "error": error, "message": "Internal server error", "response": null }));
        }

        else {
            res.send(JSON.stringify({ "status": 200, "error": null, "response": response, "message": "Success! Sorted reviews retrived." }));
        }
    });
});


