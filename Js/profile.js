var email, pass, name, edu, skills, desc, contact, links, pic, docs, userProfileID;
var urlChangePass = "http://localhost:5500/changePassword"
var urlGetProfile = "http://localhost:5500/getProfile"
var urlUpload = "http://localhost:5500/api/upload";
var urlUserDetails = "http://localhost:5500/getUserDetails";
var urlNumNewNotifs = "http://localhost:5500/getNumNotifications";
var urlDeleteAccount = "http://localhost:5500/DeleteUser";
var urlWriteReview = "http://localhost:5500/WriteReview";
var urlGetReviews = "http://localhost:5500/getReviews";
var urlGetSortedReviews = "http://localhost:5500/getSortedReviews";
var urlGetAverageRating = "http://localhost:5500/getAverageRating";
var urlSetTheme = "http://localhost:5500/setTheme";

var uID = "";
var ratingSelected = 0;
var otheruserid = null;
var otherusername = null;

function onLoad_profile() {

    optionsToggle.style.display = "none";
    notificationsToggle.style.display = "none";

    // get email
    var url = window.location.href;
    var str = url.split("?email=");

    email = str[1];
    if (email === null) {
        alert("You have to be logged in first!");
        window.location.href = "index.html";
    }
    else if (email.includes("&")) {
        str = email.split("&id=");
        email = str[0];
        otheruserid = str[1];
        if (otheruserid.includes("#")) {
            otheruserid = otheruserid.replace("#", "");
        }
    }
    else if (email.includes("#")) {
        email = email.replace("#", "");
    }

    // give ratings
    giveRatings();

    documentReadyProfile();  // activate event listeners 

    // get user id and theme
    fetch(urlUserDetails, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "email": email
        })

    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                console.log("Inside res.ok. User ID retrieved");
                uID = data.response[0].idUsers;
                
                // get theme
                getTheme(data.response[0].Theme);

                // if visiting another user's profile, get their profile
                if (otheruserid) {
                    getUserProfile(otheruserid);
                    return;
                }

                // get profile
                fetch(urlGetProfile, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        "email": null,
                        "id": uID
                    })

                }).then(function (res) {
                    console.log("Inside res function");
                    if (res.ok) {
                        res.json().then(function (data) {
                            var json = data.response;
                            name = json[0].FullName;
                            edu = json[0].Education;
                            links = json[0].Links;
                            contact = json[0].ContactInfo;
                            desc = json[0].Description;
                            skills = json[0].SkillsSet;
                            userProfileID = json[0].idUsers;
                            populate_profile(email);
                            document.getElementById("editProfileBtn").style.display = "block";

                            // average rating
                            getAverageRating(uID);

                            // get reviews for this user
                            $('.review.card.bg-secondary').remove();
                            getReviews(uID);

                            // notifications
                            getNumOfNewNotifs();

                            var background = localStorage.getItem("style");
                            document.body.style.backgroundColor = background;
                        }.bind(this));
                    }
                    else {
                        alert("Error: get profile unsuccessful!");
                        res.json().then(function (data) {
                            console.log(data.message);
                        }.bind(this));
                        return;
                    }
                }).catch(function (err) {
                    alert("Error: No internet connection!");
                    console.log(err.message + ": No Internet Connection");
                    return;
                });

            }.bind(this));
        }
        else {
            console.log("Error: Cannot get UserID");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });

    //var img = new Image();
    //img.src = "./../css/Assets/spinner.jpg";
    document.getElementById("img_profile").src = "./../css/Assets/user_icon.jpg";
}

function documentReadyProfile() {
    // Execute a function when the user releases a key on the keyboard
    document.getElementById("searchUserBar2").addEventListener("keyup", function (event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Trigger the button element with a click
            document.getElementById("userSearchBtn2").click();
        }
    });

    // if clicked anywhere else, hide the dropdown list
    $(document).on('click', function (e) {
        if (e.target.id !== 'optionsToggle') {
            $('#optionsToggle').hide();
        }

    });

    // if clicked anywhere else, hide the dropdown list
    $(document).on('click', function (e) {
        if (e.target.id !== 'notificationsToggle') {
            $('#notificationsToggle').hide();
        }

    });
}

// to get notifications counter
function getNumOfNewNotifs() {

    fetch(urlNumNewNotifs, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "id": uID
        })

    }).then(function (res) {
        console.log("Inside res function");
        if (res.ok) {
            res.json().then(function (data) {
                var json = data.response;
                var num = parseInt(json[0].count);
                if (num > 0) {
                    document.getElementById("counter").innerHTML = num;
                    document.getElementById("counter").style.display = "block";
                }

            }.bind(this));
        }
        else {
            alert("Error: Get number of notifications unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
            return;
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
        return;
    });
}

function goToHome() {
    var u = 'home.html?email='.concat(email);
    window.location.href = u;
}

function displayOptions() {
    document.getElementById("notificationsToggle").style.display = "none";
    var x = document.getElementById("optionsToggle");

    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function displayNotifications(em) {
    document.getElementById("optionsToggle").style.display = "none";
    var x = document.getElementById("notificationsToggle");

    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }

    // function to get notifications
    getNotifications(em);
    document.getElementById('counter').style.display = "none";// remove counter
    document.getElementById('counter').innerHTML = 0;
}

$(function () {
    $(":file").change(function () {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = imageIsLoaded;
            reader.readAsDataURL(this.files[0]);
        }
    });
});

function imageIsLoaded(e) {
    $('#img_profile').attr('src', e.target.result);
}

function populate_profile(useremail) {
    if (otherusername != null) {
        document.getElementById("profile_name").innerHTML = otherusername;
    }
    else {
        document.getElementById("profile_name").innerHTML = name;
    }
    document.getElementById("profile_email").innerHTML = useremail;
    document.getElementById("profile_edu").innerHTML = edu;
    document.getElementById("profile_contact").innerHTML = contact;
    document.getElementById("profile_desc").innerHTML = desc;
    document.getElementById("profile_skills").innerHTML = skills;

    var finallink = "https://" + links;
    var webLink = "<a href='" + finallink + "' id=\"profile_links\" class=\"card-link\">Portfolio Link</a>"
    document.getElementById("profile_links").innerHTML = webLink;
}

function btn_EditProfile() {
    document.getElementById("in_profile_edit_email").value = email;
    document.getElementById("in_profile_edit_email").readOnly = true;
    edit_edu.value = edu;
    edit_links.value = links;
    edit_contact.value = contact;
    edit_desc.value = desc;
    edit_skills.value = skills;
}

function btn_finish_edit() {
    edu = edit_edu.value;
    links = edit_links.value;
    contact = edit_contact.value;
    desc = edit_desc.value;
    skills = edit_skills.value;

    populate_profile();
}

// "Passwords Match"
function passMatch() {
    $('.text.text-success').remove();
    $('.text.text-danger').remove();
    var currentPass = in_profile_currentPass.value;
    var newPass = in_profile_newPass.value;
    var confirmPass = in_profile_confirmPass.value;

    if (currentPass === confirmPass) {
        var same = document.createElement("div");
        same.setAttribute('class', 'text text-danger');
        same.innerHTML = "New password cannot be the same";
        document.getElementById("fieldset_passChange").appendChild(same);
    }
    else if (newPass != confirmPass) {
        var match = document.createElement("div");
        match.setAttribute('class', 'text text-danger');
        match.innerHTML = "Passwords do not match!";
        document.getElementById("fieldset_passChange").appendChild(match);
    }
    else if (newPass == confirmPass) {
        var match = document.createElement("div");
        match.setAttribute('class', 'text text-success');
        match.innerHTML = "Passwords match!";
        document.getElementById("fieldset_passChange").appendChild(match);
    }
}

// clear settings modal
function clearSetModal() {
    in_profile_currentPass.value = ""
    in_profile_newPass.value = "";
    in_profile_confirmPass.value = "";
    $('.text.text-success').remove();
    $('.text.text-danger').remove();
}

// Password change function
function btn_passChange() {
    var currentPass = in_profile_currentPass.value;
    var newPass = in_profile_newPass.value;
    var confirmPass = in_profile_confirmPass.value;

    if (newPass != confirmPass) {
        alert("New password verification failed!");
        clearSetModal();
        return;
    }
    if (currentPass === null || currentPass === "") {
        alert("Current Password needs to be provided");
        clearSetModal();
        return;
    }
    else if (currentPass === newPass) {
        alert("New Password cannot be the same");
        clearSetModal();
        return;
    }
    if (newPass === null || newPass === "" || confirmPass === null || confirmPass === "") {
        alert("New password cannot be empty");
        clearSetModal();
        return;
    }

    fetch(urlChangePass, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "email": email,
            "oldPass": currentPass,
            "newPass": newPass
        })

    }).then(function (res) {
        console.log("Inside res function");
        if (res.ok) {
            res.json().then(function (data) {
                alert(data.message);
                console.log("Inside res.ok");
            }.bind(this));
        }
        else {
            alert("Error: Change password unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });
    clearSetModal();
}

// upload picture method
// need to debug as of now
function uploadPicture() {

    var input = document.querySelector('input[type="file"]')
    var data = new FormData()
    data.append('file', input.files[0])
    //data.append('user', 'hubot')

    fetch(urlUpload, {
        method: 'POST',
        body: ({ 'element2': data })
    }).then(function (res) {
        console.log("Inside res function");
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });
}


/* STAR RATINGS */
function giveRatings() {

    var starClicked = false;
    $('.star').click(function () {

        $(this).children('.selected').addClass('is-animated');
        $(this).children('.selected').addClass('pulse');

        var target = this;

        setTimeout(function () {
            $(target).children('.selected').removeClass('is-animated');
            $(target).children('.selected').removeClass('pulse');
        }, 1000);

        starClicked = true;
    })

    $('.half').click(function () {
        if (starClicked == true) {
            setHalfStarState(this)
        }
        $(this).closest('.rating').find('.js-score').text($(this).data('value'));

        $(this).closest('.rating').data('vote', $(this).data('value'));
        //calculateAverage()
        console.log(parseFloat($(this).data('value')));
        ratingSelected = (parseFloat($(this).data('value')));

    })

    $('.full').click(function () {
        if (starClicked == true) {
            setFullStarState(this)
        }
        $(this).closest('.rating').find('.js-score').text($(this).data('value'));

        $(this).find('js-average').text(parseInt($(this).data('value')));

        $(this).closest('.rating').data('vote', $(this).data('value'));
        //calculateAverage()

        console.log(parseFloat($(this).data('value')));
        ratingSelected = (parseFloat($(this).data('value')));
    })

    $('.half').hover(function () {
        if (starClicked == false) {
            setHalfStarState(this)
        }

    })

    $('.full').hover(function () {
        if (starClicked == false) {
            setFullStarState(this)
        }
    })
}

function updateStarState(target) {
    $(target).parent().prevAll().addClass('animate');
    $(target).parent().prevAll().children().addClass('star-color');

    $(target).parent().nextAll().removeClass('animate');
    $(target).parent().nextAll().children().removeClass('star-color');
}

function setHalfStarState(target) {
    $(target).addClass('star-color');
    $(target).siblings('.full').removeClass('star-color');
    updateStarState(target)
}

function setFullStarState(target) {
    $(target).addClass('star-color');
    $(target).parent().addClass('animate');
    $(target).siblings('.half').addClass('star-color');

    updateStarState(target)
}
/* Star ratings end */

function gotoUserProfile(id, from) {

    // no need to add id string if own's profile
    if (id == uID) {
        goToProfile(from);
        return;
    }

    if (from == '0') {
        window.location.href = "profile.html?email=".concat(email, "&id=", id);
    }
    else {
        window.location.href = "profile.html?email=".concat(emailAdd, "&id=", id);
    }
}

function getUserProfile(userid) {
    // if the user is same as the one logged in, show edit and upload buttons.
    if (userid == uID) {
        document.getElementById("editProfileBtn").style.display = "block";
    }
    else {
        document.getElementById('uploadBtn').style.display = "none";
        document.getElementById("editProfileBtn").style.display = "none";
    }

    // get profile of user
    fetch(urlGetProfile, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "id": userid,
            "email": null
        })

    }).then(function (res) {
        console.log("Inside res function");
        if (res.ok) {
            res.json().then(function (data) {
                var json = data.response;
                otherusername = json[0].FullName;
                edu = json[0].Education;
                links = json[0].Links;
                contact = json[0].ContactInfo;
                desc = json[0].Description;
                skills = json[0].SkillsSet;
                userProfileID = json[0].idUsers;
                otheruseremail = json[0].Email;
                populate_profile(otheruseremail);

                // average rating
                getAverageRating(userid);

                // make write review visible
                document.getElementById('writeNewReview').style.display = "block";
                document.getElementById('writeReviewLegend').innerHTML = "Start your review by selecting a rating score for " + otherusername + "...";
                document.getElementById('formWriteReview').style.display = "block";

                // get reviews
                $('.review.card.bg-secondary').remove();
                getReviews(userid);

                // number of notifications
                getNumOfNewNotifs();
            }.bind(this));
        }
        else {
            alert("Error: get profile unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
            return;
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
        return;
    });

}

function selectTheme(selected) {

    // theme selection
    switch (selected) {
        case "sunrise":
            var theme = "url('../css/Assets/Sunrise.jpg')";
            var textcolor = '#cc6600';
            break;
        case "purple":
            var theme = "url('../css/Assets/Purple.jpg')";
            var textcolor = '##3333cc';
            break;
        case "moose":
            var theme = "url('../css/Assets/Moose.jpg')";
            var textcolor = '#006699';
            break;
        case "dark":
            var theme = "url('../css/Assets/Dark.jpg')";
            document.getElementById("editProfileBtn").style.color = "white";
            var textcolor = '#00284d';
            break;
        case "colorful":
            var theme = "url('../css/Assets/Colorful.jpg')";
            var textcolor = '#6600cc';
            break;
        case "glitter":
            var theme = "url('../css/Assets/Glitter.jpg')";
            var textcolor = '#000099';
            break;
        default:
            var theme = null;
    }

    fetch(urlSetTheme, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "id": uID,
            "theme": selected
        })
    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                if (theme) {
                    changeTheme(theme, textcolor);
                }
            }.bind(this));
        }
        else {
            alert("Error: Setting theme unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });

}

function getTheme(key) {
    // check for null
    if (!key) {
        // do nothing
        // default
        return;
    }

    // select attributes
    switch (key) {
        case "sunrise":
            var theme = "url('../css/Assets/Sunrise.jpg')";
            var textcolor = '#cc6600';
            break;
        case "purple":
            var theme = "url('../css/Assets/Purple.jpg')";
            var textcolor = '##3333cc';
            break;
        case "moose":
            var theme = "url('../css/Assets/Moose.jpg')";
            var textcolor = '#006699';
            break;
        case "dark":
            var theme = "url('../css/Assets/Dark.jpg')";
            document.getElementById("editProfileBtn").style.color = "white";
            var textcolor = '#00284d';
            break;
        case "colorful":
            var theme = "url('../css/Assets/Colorful.jpg')";
            var textcolor = '#6600cc';
            break;
        case "glitter":
            var theme = "url('../css/Assets/Glitter.jpg')";
            var textcolor = '#000099';
            break;
        default:  
    }
    changeTheme(theme, textcolor);
}

function btn_theme_1() {
    var theme = "url('../css/Assets/Sunrise.jpg')";
    var textcolor = '#cc6600';
    changeTheme(theme, textcolor);
}

function btn_theme_2(theme) {
    var theme = "url('../css/Assets/Purple.jpg')";
    var textcolor = '##3333cc';
    changeTheme(theme, textcolor);
}
function btn_theme_3(theme) {
    var theme = "url('../css/Assets/Moose.jpg')";
    var textcolor = '#006699';
    changeTheme(theme, textcolor);
}
function btn_theme_4(theme) {
    var theme = "url('../css/Assets/Dark.jpg')";
    document.getElementById("editProfileBtn").style.color = "white";
    var textcolor = '#00284d';
    changeTheme(theme, textcolor);
}
function btn_theme_5(theme) {
    var theme = "url('../css/Assets/Colorful.jpg')";
    var textcolor = '#6600cc';
    changeTheme(theme, textcolor);
}
function btn_theme_6(theme) {
    var theme = "url('../css/Assets/Glitter.jpg')";
    var textcolor = '#000099';
    changeTheme(theme, textcolor);
}

function changeTheme(theme, textcolor) {
    document.body.style.backgroundImage = theme;
    document.body.style.color = theme;
    localStorage.setItem('style', theme);
    document.body.style.backgroundSize = "cover";
    document.getElementById('editProfileBtn').style.backgroundImage = theme;
    document.getElementById('bodyProfile').style.color = textcolor;
}

function deleteShowModal() {
    var str = name.concat(", confirm your password below to remove 1ance account");
    document.getElementById("accountName").innerHTML = str;
    document.getElementById("accountName").setAttribute("style", "font-size:120%; color:red;");
    document.getElementById("accountEmail").value = email;
    document.getElementById("accountEmail").readOnly = true;
    document.getElementById("accountEmail").setAttribute("style", "background-color: #D3D3D3;");
}


function deleteAccount() {
    var userPass = document.getElementById("deleteAccountPass").value;

    fetch(urlDeleteAccount, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "userid": uID,
            "password": userPass
        })
    }).then(function (res) {
        console.log("Inside res function");
        if (res.ok) {
            res.json().then(function (data) {
                alert("Your account has been Deleted, you will be redirected to the Login Page");
                window.location.href = "./index.html";
                console.log("Inside res.ok");
            }.bind(this));
        }
        else {
            alert("Error: Delete User Account unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });
}

window.gotoUserProfile = gotoUserProfile; // just making sure the function is globally available

// method to write new review
function writeReview() {
    if (ratingSelected == 0) {
        alert("Please provide a rating score for this user.");
        reloadProfile();
        return;
    }

    var review = document.getElementById("reviewWritten").value;

    fetch(urlWriteReview, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "byUserID": uID,
            "UserID": otheruserid,
            "byUserName": name,
            "rating": ratingSelected,
            "review": review
        })
    }).then(function (res) {
        console.log("Inside res function");
        if (res.ok) {
            res.json().then(function (data) {
                var json = data.response;
                if (json == null) {
                    confirm("Unsuccessful: You have already posted a review for this user!");
                    reloadProfile();
                    return;
                }
                else {
                    confirm("Writing new review successful!");

                    reloadProfile();
                }
            }.bind(this));
        }
        else {
            alert("Error: Writing new review unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });
}

// get reviews for this user
function getReviews(userid) {
    fetch(urlGetReviews, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "idUser": userid
        })
    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                console.log(data);
                var numReviews = Object.keys(data.response).length;
                var json = data.response;

                // check if any reviews are available
                if (numReviews == 0) {
                    var rlist = document.getElementById('reviewsList');
                    /* review div */
                    var reviewDiv = document.createElement('div');
                    reviewDiv.setAttribute('class', 'review card bg-secondary');
                    reviewDiv.style = "margin: 5%;";
                    rlist.appendChild(reviewDiv);

                    /* Card Body div */
                    var cardBodyDiv = document.createElement('div');
                    cardBodyDiv.setAttribute('class', 'card-body');
                    reviewDiv.appendChild(cardBodyDiv);

                    /* No reviews available */
                    var noneP = document.createElement('p');
                    noneP.setAttribute('class', 'card-text');
                    document.getElementById("sortReviewsDiv").style.display = "none"; // hide sort reviews
                    if (otherusername) {
                        noneP.innerHTML = otherusername + " has not been reviewed yet! Add your review?";
                    }
                    else {
                        noneP.innerHTML = "No one has reviewed you yet!";
                    }

                    noneP.style = "text-align:center;";
                    cardBodyDiv.appendChild(noneP);
                }
                else {
                    document.getElementById("sortReviewsDiv").style.display = "block"; // show sort reviews
                    for (i = 0; i < numReviews; i++) {
                        createReviewCard(json[i].idReviews, json[i].Rating, json[i].Review, json[i].byUserName, json[i].DatePosted, json[i].byUserID);
                    }
                }
            }.bind(this));
        }
        else {
            alert("Error: Getting reviews for this user unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });
}

// This method creates new card under profile for each review retrieved 
function createReviewCard(reviewID, rating, review, byUserName, datePosted, byUserID) {

    var rlist = document.getElementById('reviewsList');

    /* review div */
    var reviewDiv = document.createElement('div');
    reviewDiv.setAttribute('class', 'review card bg-secondary');
    reviewDiv.setAttribute('id', 'review');
    //reviewDiv.style = "max-width: 200rem;";
    reviewDiv.style = "margin:0%;";
    rlist.appendChild(reviewDiv);

    /* header */
    var headerDiv = document.createElement('div');
    headerDiv.setAttribute('class', 'card-header');
    headerDiv.style = "background-color:rgba(0,0,0,0.1); padding:0%; padding-top:1%;";
    reviewDiv.appendChild(headerDiv);

    /* Card Body div */
    var cardBodyDiv = document.createElement('div');
    cardBodyDiv.setAttribute('class', 'card-body');
    reviewDiv.appendChild(cardBodyDiv);

    /* Title h4 */
    var titleH4 = document.createElement('h4');
    titleH4.setAttribute('class', 'card-title text-capitalize');
    titleH4.setAttribute('id', 'reviewer');
    var str = "";
    str = str.concat("<b style=\"color:black; font-weight:bold\"><a href='#' onclick=\"gotoUserProfile(", byUserID, ",", 0, ")\">", byUserName, "</a></b>");
    titleH4.innerHTML = str;
    cardBodyDiv.appendChild(titleH4);

    /* date posted */
    var reviewDate = document.createElement('p');
    reviewDate.setAttribute('class', 'card-text');
    reviewDate.setAttribute('id', 'reviewDate');
    var d = new Date(datePosted);
    datePosted = d.toDateString();
    reviewDate.innerHTML = datePosted;
    reviewDate.style = "display:inline-block; float:right; font-size:12px;";
    titleH4.appendChild(reviewDate);

    /* Rating */
    var ratingP = document.createElement('p');
    ratingP.style = "color: grey;";
    cardBodyDiv.appendChild(ratingP);
    /* Stars */
    var starP1 = document.createElement('span');
    starP1.setAttribute('class', 'fa fa-star');
    var starID = "star1".concat(reviewID);
    starP1.setAttribute('id', starID);
    ratingP.appendChild(starP1);

    var starP2 = document.createElement('span');
    starP2.setAttribute('class', 'fa fa-star');
    starID = "star2".concat(reviewID);
    starP2.setAttribute('id', starID);
    ratingP.appendChild(starP2);

    var starP3 = document.createElement('span');
    starP3.setAttribute('class', 'fa fa-star');
    starID = "star3".concat(reviewID);
    starP3.setAttribute('id', starID);
    ratingP.appendChild(starP3);

    var starP4 = document.createElement('span');
    starP4.setAttribute('class', 'fa fa-star');
    starID = "star4".concat(reviewID);
    starP4.setAttribute('id', starID);
    ratingP.appendChild(starP4);

    var starP5 = document.createElement('span');
    starP5.setAttribute('class', 'fa fa-star');
    starID = "star5".concat(reviewID);
    starP5.setAttribute('id', starID);
    ratingP.appendChild(starP5);

    // fill color in the stars using rating
    var i = 1;
    var r = parseInt(rating);
    var colorArray = ["#e6b800", "#ff9900", "#ff6600", "#ff5050", "#cc0000"]; // array for colors based on how high the rating is
    while (r >= i) {
        starID = "star".concat(i, reviewID);
        document.getElementById(starID).style.color = colorArray[(r - 1)];
        i = i + 1;
    }
    // if half a star
    if (r !== parseFloat(rating)) {
        starID = "star".concat(i, reviewID);
        document.getElementById(starID).className = "fa fa-star-half-o";
        document.getElementById(starID).style.color = colorArray[(r - 1)];
    }
    /* Rating end */

    /* Review blockquote */
    var blockquote = document.createElement('blockquote');
    blockquote.setAttribute('class', 'blockquote');
    cardBodyDiv.appendChild(blockquote);

    var reviewContent = document.createElement('footer');
    reviewContent.setAttribute('class', 'blockquote-footer');
    reviewContent.setAttribute('id', 'reviewContent');
    reviewContent.innerHTML = review;
    blockquote.appendChild(reviewContent);
}

// function to get average rating
function getAverageRating(userid) {
    fetch(urlGetAverageRating, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "idUser": userid
        })
    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                console.log(data);
                var numReviews = Object.keys(data.response).length;
                var rating = data.response[0].AverageRating;

                var profileNameDiv = document.getElementById('profile_name');

                var avgRating = document.createElement('p');
                avgRating.style = "float:right; margin:0;";
                profileNameDiv.appendChild(avgRating);

                if (rating == null) {
                    avgRating.style = "font-size:15px; color: #a6a6a6; padding-top:1.5%; float:right;";
                    avgRating.innerHTML = "No reviews";
                    return;
                }

                /* Stars */
                var starP1 = document.createElement('span');
                starP1.setAttribute('class', 'fa fa-star');
                starP1.setAttribute('id', "avgStar1");
                avgRating.appendChild(starP1);

                var starP2 = document.createElement('span');
                starP2.setAttribute('class', 'fa fa-star');
                starP2.setAttribute('id', "avgStar2");
                avgRating.appendChild(starP2);

                var starP3 = document.createElement('span');
                starP3.setAttribute('class', 'fa fa-star');
                starP3.setAttribute('id', "avgStar3");
                avgRating.appendChild(starP3);

                var starP4 = document.createElement('span');
                starP4.setAttribute('class', 'fa fa-star');
                starP4.setAttribute('id', "avgStar4");
                avgRating.appendChild(starP4);

                var starP5 = document.createElement('span');
                starP5.setAttribute('class', 'fa fa-star');
                starP5.setAttribute('id', "avgStar5");
                avgRating.appendChild(starP5);

                // fill color in the stars using rating
                var i = 1;
                var r = parseInt(rating);
                var starID;
                var colorArray = ["#e6b800", "#ff9900", "#ff6600", "#ff5050", "#cc0000"]; // array for colors based on how high the rating is
                while (r >= i) {
                    starID = "avgStar".concat(i);
                    document.getElementById(starID).style.color = colorArray[(r - 1)];
                    i = i + 1;
                }
                // if half a star
                if (r !== parseFloat(rating)) {
                    starID = "avgStar".concat(i);
                    document.getElementById(starID).className = "fa fa-star-half-o";
                    document.getElementById(starID).style.color = colorArray[(r - 1)];
                }

            }.bind(this));
        }
        else {
            alert("Error: Getting AverageRating for this user unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });
}

// method to sort reviews in asc or desc order of ratings
function sortReviews() {
    // get the order
    var sort = "";
    var basedOn = "";
    if ((document.getElementById("sortReviews")).value == "Highest Reviews") {
        sort = "DESC";
        basedOn = "Rating";
    }
    else if ((document.getElementById("sortReviews")).value == "Lowest Reviews") {
        sort = "ASC";
        basedOn = "Rating";
    }
    else if ((document.getElementById("sortReviews")).value == "Latest Reviews") {
        sort = "DESC";
        basedOn = "DatePosted";
    }
    else if ((document.getElementById("sortReviews")).value == "Oldest Reviews") {
        sort = "ASC";
        basedOn = "DatePosted";
    }

    // ID for own profile or some other user?
    var userid;
    if (otheruserid) {
        userid = otheruserid;
    }
    else {
        userid = uID;
    }

    // fetch sorted reviews
    fetch(urlGetSortedReviews, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "idUser": userid,
            "order": sort,
            "basedOn": basedOn
        })
    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                $('.review.card.bg-secondary').remove(); // remove old cards
                // create new review cards
                var numReviews = Object.keys(data.response).length;
                var json = data.response;
                for (i = 0; i < numReviews; i++) {
                    createReviewCard(json[i].idReviews, json[i].Rating, json[i].Review, json[i].byUserName, json[i].DatePosted, json[i].byUserID);
                }
            }.bind(this));
        }
        else {
            alert("Error: Getting sorted reviews for this user unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });
}

// method to simply reload the page without losing query strings
function reloadProfile() {
    var url = window.location.href;
    window.location.href = url;
}