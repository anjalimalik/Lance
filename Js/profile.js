var email, pass, name, edu, skills, desc, contact, links, pic, docs, userProfileID;
var urlChangePass = "http://localhost:5500/changePassword"
var urlGetProfile = "http://localhost:5500/getProfile"
var urlUpload = "http://localhost:5500/api/upload";
var urlUserID = "http://localhost:5500/getUserID";

var uID = "";

function onLoad_profile() {

    optionsToggle.style.display = "none";
    notificationsToggle.style.display = "none";

    var url = window.location.href;
    var str = url.split("?email=");
    if (url == str) {
        str = url.split("?id1=");
        var otheruserid = str[1];
        if (otheruserid.includes("#")) {
            otheruserid = otheruserid.replace("#", "");
        }
        getUserProfile(otheruserid);
        return;
    }
    email = str[1];
    if (email === null) {
        alert("You have to be logged in first!");
        window.location.href = "index.html";
    }
    else if (email.includes("#")) {
        email = email.replace("#", "");
    }

    // average ratings
    // averageRatings();

    // get user id
    fetch(urlUserID, {
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
                            populate_profile();
                            document.getElementById("editProfileBtn").style.display = "block";

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

function displayNotifications() {
    document.getElementById("optionsToggle").style.display = "none";
    var x = document.getElementById("notificationsToggle");

    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }

    // function to get notifications
    getNotifications();
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

function populate_profile() {
    document.getElementById("profile_name").innerHTML = name;
    document.getElementById("profile_email").innerHTML = email;
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
function averageRatings() {

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
        console.log(parseInt($(this).data('value')));

    })

    $('.full').click(function () {
        if (starClicked == true) {
            setFullStarState(this)
        }
        $(this).closest('.rating').find('.js-score').text($(this).data('value'));

        $(this).find('js-average').text(parseInt($(this).data('value')));

        $(this).closest('.rating').data('vote', $(this).data('value'));
        //calculateAverage()

        console.log(parseInt($(this).data('value')));
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
    $(target).parent().prevAll().children().addClass('star-colour');

    $(target).parent().nextAll().removeClass('animate');
    $(target).parent().nextAll().children().removeClass('star-colour');
}

function setHalfStarState(target) {
    $(target).addClass('star-colour');
    $(target).siblings('.full').removeClass('star-colour');
    updateStarState(target)
}

function setFullStarState(target) {
    $(target).addClass('star-colour');
    $(target).parent().addClass('animate');
    $(target).siblings('.half').addClass('star-colour');

    updateStarState(target)
}

/* Star ratings end */

function gotoUserProfile(otheruserid, uid) {
    window.location.href = "profile.html?id1=".concat(otheruserid);
}

function getUserProfile(otheruserid) {

    //if (otheruserid == uid) {
    //document.getElementById("editProfileBtn").style.display = "block";
    //}
    //else {
    document.getElementById("editProfileBtn").style.display = "none";
    //}
    fetch(urlGetProfile, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "id": otheruserid,
            "email": null
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
                populate_profile();
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


window.gotoUserProfile = gotoUserProfile;