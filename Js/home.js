var urlGetPosts = "http://localhost:5500/getPosts"
var urlReport = "http://localhost:5500/Report"
var urlLike = "http://localhost:5500/ClickInterested"
var urlClose = "http://localhost:5500/ClosePost"
var urlGetComment = "http://localhost:5500/getComments"
var urlWriteComment = "http://localhost:5500/WriteComment"
var urlSortPosts = "http://localhost:5500/getSortedPosts"
var urlFilterPosts = "http://localhost:5500/getFilteredPosts"
var urlCreatePost = "http://localhost:5500/CreatePost"
var urlCatAttributes = "http://localhost:5500/getCatAttributes";
var urlEditPost = "http://localhost:5500/EditPost";
var urlUserDetails = "http://localhost:5500/getUserDetails";
var urlNewNotifications = "http://localhost:5500/getNewNotifications";
var urlOwnerIDofPost = "http://localhost:5500/getOwnerIDofPost";
var urlSearch = "http://localhost:5500/runSearch";

var emailAdd = null;
var uID = "";
var numNotifs = 0;
var OwnerIDofPost = 0;
var th = "";

function onLoad_home() {
    var url = window.location.href;
    var str = url.split("?email=");
    emailAdd = str[1];
    console.log(emailAdd);

    if (emailAdd == null || emailAdd == "" || emailAdd == "undefined" || !emailAdd.includes("@purdue.edu")) {
        alert("You have to be logged in first!");
        window.location.href = "index.html";
    } else if (emailAdd.includes("#")) {
        emailAdd = emailAdd.replace("#", "");
    }

    documentReadyHome();  // event listeners 

    fetch(urlUserDetails, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "email": emailAdd
        })

    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                console.log("Inside res.ok. User ID retrieved");
                uID = data.response[0].idUsers;
                getNumOfNewNotifs(); // get num of notifs
                getAllPosts();

                // get theme
                th = data.response[0].Theme;
                getTheme(th, '1');
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
}

function getAllPosts() {
    fetch(urlGetPosts)
        .then(function (res) {
            res.json().then(function (data) {
                console.log(data);
                var numPost = Object.keys(data.response).length;
                var json = data.response;

                for (i = 0; i < numPost; i++) {
                    createPostCard(json[i].UserName, json[i].Content, json[i].Headline, json[i].PostingType, json[i].money, json[i].idPosts, json[i].DatePosted, json[i].numLikes, json[i].Category, json[i].Attributes, json[i].UserID);
                }
            });

        })
        .catch(function (data) {

            console.log(data.message);
        });
}

function documentReadyHome() {
    // Execute a function when the user releases a key on the keyboard
    document.getElementById("searchUserBar1").addEventListener("keyup", function (event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Trigger the button element with a click
            document.getElementById("userSearchBtn1").click();
        }
    });

    document.getElementById("searchPostBar").addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            document.getElementById("postSearchBtn").click();
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

// CREATE A NEW CARD FOR EVERY POST FROM SERVER (/getPosts)
function createPostCard(user, content, headline, postingType, price, postID, date, likes, category, attributes, userid) {

    /* Adding the cards from information from the database */
    var ul = document.getElementById('news_card_list');

    var cardDiv = document.createElement('div');
    cardDiv.setAttribute('class', 'card_list_el');
    cardDiv.setAttribute('id', 'card_child');
    cardDiv.style = "width:70%; margin-left: 7%;";
    ul.appendChild(cardDiv);

    var divCenter = document.createElement("div");
    divCenter.setAttribute("id", "div".concat(postID));
    divCenter.setAttribute('class', 'card text-center');
    cardDiv.appendChild(divCenter);

    var divHeader = document.createElement("div");
    divHeader.setAttribute("id", "head".concat(postID));
    divHeader.setAttribute('class', 'card-header');
    divHeader.style = "height:45px;";
    divCenter.appendChild(divHeader);

    /* Price */
    var divTextPrice = document.createElement("kbd");
    divTextPrice.innerHTML = "$".concat(price);
    divTextPrice.style = "background-color:lightgrey;color:black;float:right;margin-top:-3px;margin-right:-1%;font-size: 15px;";
    divHeader.appendChild(divTextPrice);

    if (category) {
        if (category === "Sitter") {
            category = "Baby/Pet Sitter";
        } else if (category === "Ride") {
            category = "Ride Share";
        } else if (category === "Sale") {
            category = "For Sale";
        }
        /* Category */
        var btnCat = document.createElement("BUTTON");
        btnCat.setAttribute("class", "btn btn-outline-dark btn-sm");
        btnCat.setAttribute('onclick', 'categoryModal('.concat(postID, ")"));
        btnCat.setAttribute("id", "btnCat");
        btnCat.setAttribute("data-toggle", "modal");
        btnCat.setAttribute("data-target", "#categoryModal");
        btnCat.innerHTML = category;
        btnCat.style = "text-align:center;border-color:#333399;float:right;margin-top:-7px;margin-right:1%;font-size:12px;height:35px;";
        divHeader.appendChild(btnCat);
    }

    /* Offer/Request */
    var ReqOff = document.createElement("p");
    var str = postingType.concat(" by ", "<b style=\"", "color:#333399; font-weight:bold\">", "<a href='#' onclick=\"gotoUserProfile(", userid, ",", 1, ")\">", user, "</a></b>");
    ReqOff.style = "font-family:monaco;font-size:14px;float:left;";
    ReqOff.innerHTML = str;
    divHeader.appendChild(ReqOff);

    var divBody = document.createElement("div");
    divBody.setAttribute('class', 'card-body');
    divCenter.appendChild(divBody);

    /* This needs to be hidden - Post id */
    var post_id = document.createElement("LABEL");
    post_id.setAttribute("id", "postIDHidden");
    post_id.style.display = "none";
    post_id.innerHTML = postID;
    divBody.appendChild(post_id);

    /* Title */
    var divTitle = document.createElement("h5");
    divTitle.setAttribute('class', 'card-title');
    divTitle.innerHTML = headline;
    divTitle.style = "color:black;";
    divBody.appendChild(divTitle);

    /* DESCRIPTION */
    var divText = document.createElement("p");
    divText.setAttribute('class', 'card-text');
    divText.innerHTML = content;
    divBody.appendChild(divText);

    var divButtons = document.createElement("div");
    divButtons.setAttribute('class', 'card-text');
    divCenter.appendChild(divButtons);

    if (uID === userid) {
        /* Close Post */
        var btn_close = document.createElement("BUTTON");
        btn_close.setAttribute("class", "btn btn-default btn-sm");
        btn_close.setAttribute('onclick', "closePost(".concat(postID, ")"));
        btn_close.setAttribute("id", "btnClose");
        btn_close.style = "float:right;margin-bottom:1%;margin-right:0%;margin-top:0%;";
        divButtons.appendChild(btn_close);

        var imgClose = document.createElement('img');
        imgClose.setAttribute('src', './../css/Assets/close.png');
        imgClose.setAttribute('alt', 'Close');
        imgClose.style = "float:center;width:20px; height:20px;";
        btn_close.appendChild(imgClose);
    }

    /* Report */
    var btn_report = document.createElement("BUTTON");
    btn_report.setAttribute("id", "btnReport");
    btn_report.setAttribute("class", "btn btn-default btn-sm");
    btn_report.setAttribute("data-toggle", "modal");
    btn_report.setAttribute("data-target", "#myModalReport");
    btn_report.setAttribute("onclick", "getIDReport(".concat(postID, ")"));
    btn_report.style = "float:left;margin-bottom:1%;margin-right:-5%;";
    divButtons.appendChild(btn_report);

    var imgFlag = document.createElement('img');
    imgFlag.setAttribute('src', './../css/Assets/flag.png');
    imgFlag.setAttribute('alt', 'Report');
    imgFlag.style = "float:left;width:20px; height:20px;";
    btn_report.appendChild(imgFlag);

    if (uID === userid) {
        /* EDIT post */
        var btn_editPost = document.createElement("BUTTON");
        //btn_editPost.setAttribute('type', 'button');
        btn_editPost.setAttribute("id", "btnEditPost");
        btn_editPost.setAttribute("class", "btn btn-default btn-sm");
        btn_editPost.setAttribute("data-toggle", "modal");
        btn_editPost.setAttribute("data-target", "#myModalEditPost");
        btn_editPost.setAttribute("onclick", "getSelectedPost(".concat(postID, ")"));
        btn_editPost.style = "float:right;margin-bottom:1%;margin-right:1%;margin-top:0%;";
        divButtons.appendChild(btn_editPost);

        var imgEdit = document.createElement('img');
        imgEdit.setAttribute('src', './../css/Assets/Edit.png');
        imgEdit.setAttribute('alt', 'Edit Post');
        imgEdit.style = "float:left;width:17px; height:17px;";
        btn_editPost.appendChild(imgEdit);
    }

    var divFooter = document.createElement('div');
    divFooter.setAttribute('class', 'card-footer');
    divFooter.style = "height:45px;";
    divCenter.appendChild(divFooter);

    /* LIKE/INTERESTED */
    var aHeart = document.createElement('BUTTON');
    aHeart.setAttribute('class', 'btn btn-default btn-sm');
    aHeart.setAttribute('onclick', "clickInterested(".concat(postID, ")"));
    aHeart.style = "float:center; outline:none; border: 0; background: transparent; margin-left:35%; margin-top:-2%;";
    divFooter.appendChild(aHeart);

    var imgHeart = document.createElement('img');
    imgHeart.setAttribute('src', './../css/Assets/heart.png');
    imgHeart.setAttribute('alt', 'Like');
    imgHeart.style = "float:center;width:30px; height:30px;";
    aHeart.appendChild(imgHeart);

    var txtlikes = document.createElement("text");
    txtlikes.setAttribute("id", "txtLikes".concat(postID));
    if (likes == "1") {
        txtlikes.innerHTML = likes.toString().concat(" like");
    }
    else {
        txtlikes.innerHTML = likes.toString().concat(" likes");
    }
    txtlikes.style = "float:center;margin-left:-1%;font-size:14px;color:grey;";
    divFooter.appendChild(txtlikes);

    /* Date Posted */
    var divFooterDate = document.createElement('div');
    divFooterDate.setAttribute('class', 'text-muted');
    var d = new Date(date);
    date = d.toDateString();
    divFooterDate.innerHTML = date;
    divFooterDate.style = "float:right; font-size:14px;";
    divFooter.appendChild(divFooterDate);

    /* Comments */
    var divComments = document.createElement("BUTTON");
    divComments.setAttribute('class', 'btn btn-outline-primary btn-md');
    divComments.setAttribute("data-toggle", "modal");
    divComments.setAttribute("data-target", "#myCommentsModal");
    divComments.style = "float:right;margin-bottom:1%;margin-right:20%;margin-top:-1%; height:40px;";
    divComments.setAttribute('onclick', "expandPost(".concat(postID, ")"));
    divComments.innerHTML = "Comments";
    divFooter.appendChild(divComments);

    /* hidden post id */
    var post_id = document.createElement("LABEL");
    post_id.setAttribute("id", "postIDHidden");
    post_id.style.display = "none";
    post_id.innerHTML = postID;
    divCenter.appendChild(post_id);
}


// SEND REPORT
function getIDReport(id) {
    $(document).ready(function () {
        $('#sendReport').on('click', function (e) {
            reportPost(parseInt(id));
        });
    });
}

function reportPost(postID) {
    var reportMsg = document.getElementById("in_report").value;
    fetch(urlReport, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "message": reportMsg,
            "postId": postID
        })

    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                console.log("Inside res.ok");
                alert("Your report was sent successfully!");
            }.bind(this));
        }
        else {
            alert("Error: Sending report unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });
}

// CLICK INTERESTED
function clickInterested(postID) {

    // get id of the owner
    getUserIDofPost(postID);

    postID = parseInt(postID);
    fetch(urlLike, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "id": uID,
            "postId": postID
        })

    }).then(function (res) {

        // notifications counter incremented
        if (OwnerIDofPost == uID) {
            var val = document.getElementById("counter").innerHTML;
            val++;
            document.getElementById("counter").innerHTML = val;
            document.getElementById("counter").style.display = "block";
        }

        if (res.ok) {
            res.json().then(function (data) {
                var likesid = "txtLikes".concat(postID);
                var num = parseInt(document.getElementById(likesid).textContent);
                if (num === 0) {
                    document.getElementById(likesid).innerHTML = (num + 1).toString().concat(" like");
                }
                else {
                    document.getElementById(likesid).innerHTML = (num + 1).toString().concat(" likes");
                }

                $('.notifClass.dropdown-item').remove(); //remove past notfications
                $('.notifClass.dropdown-item.half-rule').remove(); //remove past notfications

                console.log("Inside res.ok. Number of Likes increased.");
            }.bind(this));
        }
        else {
            alert("Error: liking unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });
}


// CLOSE/DELETE POST METHOD
function closePost(postID) {
    if (window.confirm("Are you sure you want to delete this post?")) {
        postID = parseInt(postID);
        fetch(urlClose, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                "postId": postID
            })

        }).then(function (res) {
            if (res.ok) {
                $('.card_list_el').remove();
                getAllPosts();
                alert("Your post was closed and removed!");
                res.json().then(function (data) {
                    console.log("Inside res.ok. Post was closed");
                }.bind(this));
            }
            else {
                alert("Error: deletion unsuccessful!");
                res.json().then(function (data) {
                    console.log(data.message);
                }.bind(this));
            }
        }).catch(function (err) {
            alert("Error: No internet connection!");
            console.log(err.message + ": No Internet Connection");
        });
    }
}

// GET ALL COMMENTS
function getAllComments(postID) {
    postID = parseInt(postID);
    fetch(urlGetComment, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "postId": postID
        })

    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                console.log(data);
                var numComments = Object.keys(data.response).length;
                var json = data.response;
                expandComments(postID, numComments, json);
                console.log("Inside res.ok. Comments retrieved");
            }.bind(this));
        }
        else {
            alert("Error: expand comments unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });
}

// Expand post to get all comments
function expandPost(postID) {
    var lm = document.getElementById("commentsFG");
    // comments
    var ulComments = document.createElement("ul");
    ulComments.setAttribute('id', 'ulcomments'.concat(postID));
    ulComments.setAttribute('class', 'comments_list');
    lm.appendChild(ulComments);

    getAllComments(postID);
}

// EXPAND ALL COMMENTS FROM THE SERVER
function expandComments(postID, num, json) {

    // for later removal
    document.getElementById("xBtn_post").setAttribute('onclick', "$('.comment').remove();");
    document.getElementById("closeBtn_post").setAttribute('onclick', "$('.comment').remove();");

    var ul = document.getElementById('ulcomments'.concat(postID));

    if (json == null || num === 0) {
        //p
        var pComments = document.createElement("p");
        pComments.setAttribute('id', 'pComments'.concat(postID));
        pComments.setAttribute('class', 'comment');
        pComments.style = "padding:0px; margin:0px;";
        ul.appendChild(pComments);
        //center
        var center = document.createElement("div");
        center.setAttribute('class', 'card text-center');
        center.style = "width: 480px; height:55px; margin-left:-47px;";
        pComments.appendChild(center);

        //body
        var body = document.createElement("div");
        body.setAttribute('class', 'card-body');
        center.appendChild(body);

        //title (content of comment)
        var title = document.createElement("p");
        title.setAttribute('class', 'card-title');
        title.style = "font-family: monaco;font-size: 13px;";
        title.innerHTML = "No comments yet.";
        body.appendChild(title);
    }
    for (i = 0; i < num; i++) {
        //p
        var pComments = document.createElement("p");
        pComments.setAttribute('id', 'pComments'.concat(postID, i.toString()));
        pComments.setAttribute('class', 'comment');
        pComments.style = "padding:0px; margin:0px;";
        ul.appendChild(pComments);
        //center
        var center = document.createElement("div");
        center.setAttribute('class', 'card text-center');
        center.style = "width: 480px; height:55px; margin-left:-47px;";
        pComments.appendChild(center);

        //body
        var body = document.createElement("div");
        body.setAttribute('class', 'card-body');
        center.appendChild(body);

        //sender name (content of comment)
        var sender = document.createElement("kbd");
        sender.style = "font-family: monaco;float:left; background-color:lightgrey; height:32px; font-size:12px; margin-left:-15px; margin-top:-2px; color:black;border-right:1px solid #000;height:30px";
        sender.innerHTML = json[i].SenderName;
        body.appendChild(sender);

        //title (content of comment)
        var title = document.createElement("p");
        title.setAttribute('class', 'card-title');
        title.style = "font-family: monaco;font-size: 13px;";
        title.innerHTML = json[i].Comment;
        body.appendChild(title);
    }

    // WRITE COMMENT FIELD
    //p
    var pWComments = document.createElement("p");
    pWComments.setAttribute('id', 'pWComments'.concat(postID));
    pWComments.setAttribute('class', 'comment');
    pWComments.style = "padding:0px; margin:0px;";
    ul.appendChild(pWComments);
    //center
    var centerW = document.createElement("div");
    centerW.setAttribute('class', 'card text-center');
    centerW.style = "width: 480px; height:55px; margin-left:-47px;";
    pWComments.appendChild(centerW);

    //body
    var bodyW = document.createElement("div");
    bodyW.setAttribute('class', 'card-body');
    centerW.appendChild(bodyW);

    //input
    var inputW = document.createElement("INPUT");
    inputW.setAttribute('class', 'form-control mr-sm-2');
    inputW.setAttribute('type', 'text');
    inputW.setAttribute('placeholder', 'Add comment here');
    inputW.style = "font-family: monaco;margin-top: -21px;width: 400px; height: 55px; margin-left:-20px;";
    inputW.setAttribute('id', 'txtComment');
    bodyW.appendChild(inputW);

    //button
    var btnAddW = document.createElement("BUTTON");
    btnAddW.setAttribute('class', 'form-control mr-sm-2');
    btnAddW.setAttribute('onclick', 'addComment('.concat(postID, ')'));
    btnAddW.style = "padding:0px; color: #ffffff; margin-left:380px; margin-top: -55px; background-color: #000000; width: 80px; height: 55px; font-size: 13px";
    btnAddW.setAttribute('id', 'addBtn');
    btnAddW.setAttribute('data-dismiss', 'modal');
    btnAddW.setAttribute('onclick', 'addComment('.concat(postID, ",", email, ",", num, ")"));
    btnAddW.innerHTML = "Add";
    bodyW.appendChild(btnAddW);
}

// ADD COMMENT METHOD
function addComment(postID, email, num) {

    $('.notifClass.dropdown-item').remove(); //remove past notfications
    $('.notifClass.dropdown-item.half-rule').remove(); //remove past notfications

    var comment = document.getElementById("txtComment").value;
    postID = parseInt(postID);

    // get id of the owner
    getUserIDofPost(postID);

    // send new comment to the server
    fetch(urlWriteComment, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "postId": postID,
            "comment": comment,
            "id": uID
        })

    }).then(function (res) {
        if (res.ok) {
            // notifications counter incremented
            if (OwnerIDofPost == uID) {
                var val = document.getElementById("counter").innerHTML;
                val++;
                document.getElementById("counter").innerHTML = val;
                document.getElementById("counter").style.display = "block";
            }

            res.json().then(function (data) {
                console.log("Inside res.ok. New comment added");
            }.bind(this));
        }
        else {
            alert("Error: writing comment unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });

    // remoce past comments and close the modal
    $('.comment').remove();
    $('#myCommentsModal').modal('hide');
}

// Function to get user id from post id (id of the owner of the post)
function getUserIDofPost(postID) {

    fetch(urlOwnerIDofPost, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "postID": postID
        })
    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                OwnerIDofPost = parseInt(data.response[0].UserID);
                console.log("Inside res.ok. Owner ID retrieved");
            }.bind(this));
        }
        else {
            alert("Error: getting Owner ID unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });
}

// SORT POSTS based on either date or price
function sortPosts(basedOn, order, upper, lower) {
    fetch(urlSortPosts, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "basedOn": basedOn,
            "order": order,
            "upper": upper,
            "lower": lower
        })
    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                getSortedPosts(data.response);
                console.log("Inside res.ok. Sorted Posts retrieved");
            }.bind(this));
        }
        else {
            alert("Error: sorting of posts unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });

}

// GET SORTED POSTS
function getSortedPosts(json) {
    $('.card_list_el').remove();
    if (json) {
        var num = Object.keys(json).length;
        for (i = 0; i < num; i++) {
            createPostCard(json[i].UserName, json[i].Content, json[i].Headline, json[i].PostingType, json[i].money, json[i].idPosts, json[i].DatePosted, json[i].numLikes, json[i].Category, json[i].Attributes, json[i].UserID);
        }
    }
}

// FILTER POSTS
function filterPosts(category, type) {
    fetch(urlFilterPosts, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "category": category,
            "type": type
        })
    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                getSortedPosts(data.response);
                console.log("Inside res.ok. Filtered Posts retrieved");
            }.bind(this));
        }
        else {
            alert("Error: filtering of posts unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });

}

// function to filter posts according to price and date posted
function filterWRange() {
    if (parseInt(document.getElementById("priceLower").value) !== 0 || parseInt(document.getElementById("priceUpper").value) !== 5000) {
        if (parseInt(document.getElementById("priceUpper").value) <= parseInt(document.getElementById("priceLower").value)) {
            alert("Price input range is invalid.");
            return;
        }
        else {
            sortPosts("cost", null, document.getElementById("priceUpper").value, document.getElementById("priceLower").value);
        }
    } else if (document.getElementById("dateUpper").value && document.getElementById("priceLower").value) {

        var dateLow = new Date(document.getElementById("dateLower").value);
        var dateUpp = new Date(document.getElementById("dateUpper").value);

        if (Date.parse(dateUpp) <= Date.parse(dateLow)) {
            alert("Date input range is invalid.");
            return;
        }
        else {
            sortPosts("date", null, dateUpp, dateLow);
        }
    }
}

// shows values selected by user on price range slider
function slider_onChange(str) {
    var out = document.getElementById("out".concat(str));
    if (str === 'PL') {
        out.innerHTML = priceLower.value;
    } else {
        out.innerHTML = priceUpper.value;
    }
}

// CREATE NEW POST
function createPost(postID) {
    if (!postID) {
        var title = document.getElementById("in_title_newpost").value;
        var desc = document.getElementById("in_content_newpost").value;
        var price = document.getElementById("in_price_newpost").value;
        var type = document.getElementsByName("postType");
        var type_value = null;
        if (type[0].checked) {
            type_value = type[0].value;
        }
        else if (type[1].checked) {
            type_value = type[1].value;
        }
        else {
            alert("Not enough information provided");
            document.getElementById("postClose").click();
            return;
        }

        // Only category is optional
        if (!price || !title || !desc) {
            alert("Not enough information provided");
            document.getElementById("postClose").click();
            return;
        }
        var attributes = null;
        var category = document.getElementById("pickedCategory").value;
    }
    else {
        var title = document.getElementById("in_title_editpost").value;
        var desc = document.getElementById("in_content_editpost").value;
        var price = document.getElementById("in_price_editpost").value;
        var type = document.getElementsByName("editType");
        var type_value = null;
        if (type[0].checked) {
            type_value = type[0].value;
        }
        else if (type[1].checked) {
            type_value = type[1].value;
        }
        else {
            alert("Not enough information provided for editing");
            document.getElementById("postEditClose").click();
            return;
        }

        // Only category is optional
        if (!price || !title || !desc) {
            alert("HERE2 Not enough information provided for editing");
            document.getElementById("postEditClose").click();
            return;
        }
        var attributes = null;
        var category = document.getElementById("pickedEditCategory").value;
    }
    // make string for attributes according to the category
    if (category === "Ride") {
        attributes = "";
        attributes = attributes.concat("From: ", document.getElementById("ride_from").value, "|", "To: ", document.getElementById("ride_to").value, "|");
        attributes = attributes.concat("# of Passengers: ", document.getElementById("ride_num").value, "|");
    }
    else if (category === "Food") {
        attributes = "";
        attributes = attributes.concat("Restaurant: ", document.getElementById("food_res").value, "|");
        attributes = attributes.concat("Items: ", document.getElementById("food_items").value, "|");
    }
    else if (category === "Tutor") {
        attributes = "";
        attributes = attributes.concat("Course(s): ", document.getElementById("tutor_class").value, "|");
        attributes = attributes.concat("Qualifications: ", document.getElementById("tutor_qual").value, "|");
    }
    else if (category === "Sitter") {
        attributes = "";
        attributes = attributes.concat("Date: ", document.getElementById("sitter_date").value, "|");
    }
    else if (category === "Housing") {
        attributes = "";
        attributes = attributes.concat("Location: ", document.getElementById("housing_loc").value, "|");
        attributes = attributes.concat("# of Rooms: ", document.getElementById("housing_num").value, "|");
        attributes = attributes.concat("Duration: ", document.getElementById("housing_dur").value, "|");
    }
    else if (category === "Sale") {
        attributes = "";
        attributes = attributes.concat("Item: ", document.getElementById("sale_item").value, "|");
        attributes = attributes.concat("Condition: ", document.querySelector('input[name="sale_condition"]:checked').value, "|");
    }
    if (category) {
        attributes = attributes.concat("Contact Info: ", document.getElementById("info").value);
    }

    if (!postID) {

    }
    else {
        editPost(title, desc, price, type_value, category, attributes, postID);
        closeEditPostModal();
        return;
    }

    // send to server
    fetch(urlCreatePost, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "email": emailAdd,
            "Headline": title,
            "Content": desc,
            "PostingType": type_value,
            "money": price,
            "Category": category,
            "Attributes": attributes
        })

    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                $('.card_list_el').remove();
                getAllPosts();
                console.log("Inside res.ok. New post added");
                alert("New Post created!");
            }.bind(this));
        }
        else {
            alert("Error: creating post unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });

    closeNewPostModal();
}

// expand create new post modal to show attributes related to a category
// UI for all attributes
function expandCreatePModal(category, edit) {
    // remove elements if clicked on a category again
    $('.catDiv').remove();

    if (edit) {
        var pickedCategory = "pickedEditCategory";
        var fieldset = "fieldset_Edit";
    }
    else {
        var pickedCategory = "pickedCategory";
        var fieldset = "fieldset_createNP";
    }

    if (category === 'Ride') {
        document.getElementById(pickedCategory).value = "Ride";

        var rideDiv = document.createElement("div");
        rideDiv.setAttribute('class', 'catDiv');
        document.getElementById(fieldset).appendChild(rideDiv);

        // From (location) & To
        var fromFG = document.createElement("div");
        fromFG.setAttribute('class', 'form-group');
        rideDiv.appendChild(fromFG);

        var fromLbl = document.createElement("LABEL");
        fromLbl.innerHTML = "From: ";
        fromFG.appendChild(fromLbl);

        var toLbl = document.createElement("LABEL");
        toLbl.innerHTML = "To:";
        toLbl.style = "margin-left:190px;";
        fromFG.appendChild(toLbl);

        var pLoc = document.createElement("p");
        fromFG.appendChild(pLoc);

        var fromTxt = document.createElement("textarea");
        fromTxt.setAttribute('rows', '1');
        fromTxt.setAttribute('class', 'form-control');
        fromTxt.setAttribute('id', 'ride_from');
        fromTxt.setAttribute('placeholder', 'Location');
        fromTxt.style = "width:210px;display:inline-block;padding:10px;text-align:left;overflow:auto;";
        pLoc.appendChild(fromTxt);

        var toTxt = document.createElement("textarea");
        toTxt.setAttribute('rows', '1');
        toTxt.setAttribute('class', 'form-control');
        toTxt.setAttribute('id', 'ride_to');
        toTxt.setAttribute('placeholder', 'Location');
        toTxt.style = "width:210px;margin-left:20px;display:inline-block;padding:10px;text-align:left;overflow:auto;";
        pLoc.appendChild(toTxt);

        // Number of passengers and Contact info.
        var numFG = document.createElement("div");
        numFG.setAttribute('class', 'form-group');
        rideDiv.appendChild(numFG);

        var numLbl = document.createElement("LABEL");
        numLbl.innerHTML = "# of Passengers: ";
        numFG.appendChild(numLbl);

        var infoLbl = document.createElement("LABEL");
        infoLbl.innerHTML = "Contact Info: ";
        infoLbl.style = "margin-left:55px;";
        numFG.appendChild(infoLbl);

        var pNum = document.createElement("p");
        numFG.appendChild(pNum);

        var numTxt = document.createElement("input");
        numTxt.setAttribute('type', 'number');
        numTxt.setAttribute('rows', '1');
        numTxt.setAttribute('class', 'form-control');
        numTxt.setAttribute('id', 'ride_num');
        numTxt.setAttribute('placeholder', '#');
        numTxt.style = "width:50px; display:inline-block;padding:10px;text-align:left;overflow:auto;";
        pNum.appendChild(numTxt);

        var infoTxt = document.createElement("input");
        infoTxt.setAttribute('type', 'text');
        infoTxt.setAttribute('rows', '1');
        infoTxt.setAttribute('class', 'form-control');
        infoTxt.setAttribute('id', 'info');
        infoTxt.setAttribute('placeholder', 'Phone no. or email (optional)');
        infoTxt.style = "width:200px; display: inline-block; margin-left:125px; padding:10px;text-align:left;overflow:auto;";
        pNum.appendChild(infoTxt);
    }
    else if (category === 'Food') {
        document.getElementById("pickedCategory").value = "Food";

        var foodDiv = document.createElement("div");
        foodDiv.setAttribute('class', 'catDiv');
        document.getElementById(fieldset).appendChild(foodDiv);

        // Restaurant & Contact Info
        var resFG = document.createElement("div");
        resFG.setAttribute('class', 'form-group');
        foodDiv.appendChild(resFG);

        var resLbl = document.createElement("LABEL");
        resLbl.innerHTML = "Restaurant: ";
        resFG.appendChild(resLbl);

        var infoLbl = document.createElement("LABEL");
        infoLbl.innerHTML = "Contact Info: ";
        infoLbl.style = "margin-left:150px;";
        resFG.appendChild(infoLbl);

        var pRes = document.createElement("p");
        resFG.appendChild(pRes);

        var resTxt = document.createElement("textarea");
        resTxt.setAttribute('rows', '1');
        resTxt.setAttribute('class', 'form-control');
        resTxt.setAttribute('id', 'food_res');
        resTxt.style = "width:210px;display:inline-block;padding:10px;text-align:left;overflow:auto;";
        pRes.appendChild(resTxt);

        var infoTxt = document.createElement("textarea");
        infoTxt.setAttribute('type', 'text');
        infoTxt.setAttribute('rows', '1');
        infoTxt.setAttribute('class', 'form-control');
        infoTxt.setAttribute('id', 'info');
        infoTxt.setAttribute('placeholder', 'Phone no. or email (optional)');
        infoTxt.style = "width:210px; display: inline-block; margin-left:20px; padding:10px;text-align:left;overflow:auto;";
        pRes.appendChild(infoTxt);

        // Items
        var itemsFG = document.createElement("div");
        itemsFG.setAttribute('class', 'form-group');
        foodDiv.appendChild(itemsFG);

        var itemsLbl = document.createElement("LABEL");
        itemsLbl.innerHTML = "Items: ";
        itemsFG.appendChild(itemsLbl);

        var itemsTxt = document.createElement("textarea");
        itemsTxt.setAttribute('cols', '1');
        itemsTxt.setAttribute('rows', '2');
        itemsTxt.setAttribute('class', 'form-control');
        itemsTxt.setAttribute('id', 'food_items');
        itemsTxt.setAttribute('placeholder', '');
        itemsTxt.style = "padding:10px;text-align:left;overflow:auto;";
        itemsFG.appendChild(itemsTxt);

    }
    else if (category === 'Tutor') {
        document.getElementById("pickedCategory").value = "Tutor";

        var tutorDiv = document.createElement("div");
        tutorDiv.setAttribute('class', 'catDiv');
        document.getElementById(fieldset).appendChild(tutorDiv);

        // Class Name
        var classFG = document.createElement("div");
        classFG.setAttribute('class', 'form-group');
        tutorDiv.appendChild(classFG);

        var classLbl = document.createElement("LABEL");
        classLbl.innerHTML = "Course(s): ";
        classFG.appendChild(classLbl);

        var classTxt = document.createElement("textarea");
        classTxt.setAttribute('cols', '1');
        classTxt.setAttribute('rows', '1');
        classTxt.setAttribute('class', 'form-control');
        classTxt.setAttribute('id', 'tutor_class');
        classTxt.setAttribute('placeholder', 'name or course no. at Purdue');
        classTxt.style = "padding:10px;text-align:left;overflow:auto;";
        classFG.appendChild(classTxt);

        // Qualifications
        var qualFG = document.createElement("div");
        qualFG.setAttribute('class', 'form-group');
        tutorDiv.appendChild(qualFG);

        var qualLbl = document.createElement("LABEL");
        qualLbl.innerHTML = "Qualifications: ";
        qualFG.appendChild(qualLbl);

        var qualTxt = document.createElement("textarea");
        qualTxt.setAttribute('cols', '1');
        qualTxt.setAttribute('rows', '2');
        qualTxt.setAttribute('class', 'form-control');
        qualTxt.setAttribute('id', 'tutor_qual');
        qualTxt.setAttribute('placeholder', '');
        qualTxt.style = "padding:10px;text-align:left;overflow:auto;";
        qualFG.appendChild(qualTxt);

        // Contact Info
        var infoFG = document.createElement("div");
        infoFG.setAttribute('class', 'form-group');
        tutorDiv.appendChild(infoFG);

        var infoLbl = document.createElement("LABEL");
        infoLbl.innerHTML = "Contact Info: ";
        infoFG.appendChild(infoLbl);

        var infoTxt = document.createElement("textarea");
        infoTxt.setAttribute('type', 'text');
        infoTxt.setAttribute('rows', '1');
        infoTxt.setAttribute('class', 'form-control');
        infoTxt.setAttribute('id', 'info');
        infoTxt.setAttribute('placeholder', 'Phone no. or email (optional)');
        infoTxt.style = "width:210px; padding:10px;text-align:left;overflow:auto;";
        infoFG.appendChild(infoTxt);
    }
    else if (category === 'Sitter') {
        document.getElementById("pickedCategory").value = "Sitter";

        var sitDiv = document.createElement("div");
        sitDiv.setAttribute('class', 'catDiv');
        document.getElementById(fieldset).appendChild(sitDiv);

        // date
        var dateFG = document.createElement("div");
        dateFG.setAttribute('class', 'form-group');
        sitDiv.appendChild(dateFG);

        var numLbl = document.createElement("LABEL");
        numLbl.innerHTML = "Date: ";
        dateFG.appendChild(numLbl);

        var numTxt = document.createElement("input");
        numTxt.setAttribute('type', 'date');
        numTxt.setAttribute('class', 'form-control');
        numTxt.setAttribute('id', 'sitter_date');
        numTxt.style = "width:200px;padding:10px;text-align:left;overflow:auto;";
        dateFG.appendChild(numTxt);

        // Contact Info
        var infoFG = document.createElement("div");
        infoFG.setAttribute('class', 'form-group');
        sitDiv.appendChild(infoFG);

        var infoLbl = document.createElement("LABEL");
        infoLbl.innerHTML = "Contact Info: ";
        infoFG.appendChild(infoLbl);

        var infoTxt = document.createElement("input");
        infoTxt.setAttribute('type', 'text');
        infoTxt.setAttribute('rows', '1');
        infoTxt.setAttribute('class', 'form-control');
        infoTxt.setAttribute('id', 'info');
        infoTxt.setAttribute('placeholder', 'Phone no. or email (optional)');
        infoTxt.style = "width:200px;padding:10px;text-align:left;overflow:auto;";
        infoFG.appendChild(infoTxt);
    }
    else if (category === 'Housing') {
        document.getElementById("pickedCategory").value = "Housing";

        var housingDiv = document.createElement("div");
        housingDiv.setAttribute('class', 'catDiv');
        document.getElementById(fieldset).appendChild(housingDiv);

        // Location
        var locFG = document.createElement("div");
        locFG.setAttribute('class', 'form-group');
        housingDiv.appendChild(locFG);

        var locLbl = document.createElement("LABEL");
        locLbl.innerHTML = "Location: ";
        locFG.appendChild(locLbl);

        var locTxt = document.createElement("textarea");
        locTxt.setAttribute('rows', '1');
        locTxt.setAttribute('class', 'form-control');
        locTxt.setAttribute('id', 'housing_loc');
        locTxt.style = "width:210px;padding:10px;text-align:left;overflow:auto;";
        locFG.appendChild(locTxt);

        // Duration
        var durFG = document.createElement("div");
        durFG.setAttribute('class', 'form-group');
        housingDiv.appendChild(durFG);

        var durLbl = document.createElement("LABEL");
        durLbl.innerHTML = "Duration: ";
        durFG.appendChild(durLbl);

        var durTxt = document.createElement("textarea");
        durTxt.setAttribute('rows', '1');
        durTxt.setAttribute('cols', '1');
        durTxt.setAttribute('class', 'form-control');
        durTxt.setAttribute('id', 'housing_dur');
        durTxt.style = "padding:10px;text-align:left;overflow:auto;";
        durFG.appendChild(durTxt);

        // Number of Rooms and Contact info.
        var numFG = document.createElement("div");
        numFG.setAttribute('class', 'form-group');
        housingDiv.appendChild(numFG);

        var numLbl = document.createElement("LABEL");
        numLbl.innerHTML = "# of Rooms: ";
        numFG.appendChild(numLbl);

        var infoLbl = document.createElement("LABEL");
        infoLbl.innerHTML = "Contact Info: ";
        infoLbl.style = "margin-left:50px;";
        numFG.appendChild(infoLbl);

        var pNum = document.createElement("p");
        numFG.appendChild(pNum);

        var numTxt = document.createElement("input");
        numTxt.setAttribute('type', 'number');
        numTxt.setAttribute('rows', '1');
        numTxt.setAttribute('class', 'form-control');
        numTxt.setAttribute('id', 'housing_num');
        numTxt.setAttribute('placeholder', '#');
        numTxt.style = "width:50px; display:inline-block;padding:10px;text-align:left;overflow:auto;";
        pNum.appendChild(numTxt);

        var infoTxt = document.createElement("input");
        infoTxt.setAttribute('type', 'text');
        infoTxt.setAttribute('rows', '1');
        infoTxt.setAttribute('class', 'form-control');
        infoTxt.setAttribute('id', 'info');
        infoTxt.setAttribute('placeholder', 'Phone no. or email (optional)');
        infoTxt.style = "width:200px; display: inline-block; margin-left:90px; padding:10px;text-align:left;overflow:auto;";
        pNum.appendChild(infoTxt);
    }
    else if (category === 'Sale') {
        document.getElementById("pickedCategory").value = "Sale";

        var saleDiv = document.createElement("div");
        saleDiv.setAttribute('class', 'catDiv');
        document.getElementById(fieldset).appendChild(saleDiv);

        // Item name and Contact info.
        var itemFG = document.createElement("div");
        itemFG.setAttribute('class', 'form-group');
        saleDiv.appendChild(itemFG);

        var itemLbl = document.createElement("LABEL");
        itemLbl.innerHTML = "Item: ";
        itemFG.appendChild(itemLbl);

        var infoLbl = document.createElement("LABEL");
        infoLbl.innerHTML = "Contact Info: ";
        infoLbl.style = "margin-left:205px;";
        itemFG.appendChild(infoLbl);

        var pItem = document.createElement("p");
        itemFG.appendChild(pItem);

        var itemTxt = document.createElement("textarea");
        itemTxt.setAttribute('type', 'text');
        itemTxt.setAttribute('rows', '1');
        itemTxt.setAttribute('class', 'form-control');
        itemTxt.setAttribute('id', 'sale_item');
        itemTxt.style = "width:220px; display:inline-block;padding:10px;text-align:left;overflow:auto;";
        pItem.appendChild(itemTxt);

        var infoTxt = document.createElement("textarea");
        infoTxt.setAttribute('type', 'text');
        infoTxt.setAttribute('rows', '1');
        infoTxt.setAttribute('class', 'form-control');
        infoTxt.setAttribute('id', 'info');
        infoTxt.setAttribute('placeholder', 'Phone no. or email (optional)');
        infoTxt.style = "width:220px; display: inline-block; margin-left:20px; padding:10px;text-align:left;overflow:auto;";
        pItem.appendChild(infoTxt);

        // Condition radios
        var condFG = document.createElement("div");
        condFG.setAttribute('class', 'form-group');
        saleDiv.appendChild(condFG);

        var usedLbl = document.createElement("LABEL");
        usedLbl.innerHTML = " Used ";
        usedLbl.setAttribute('class', 'radio-inline');
        usedLbl.style = "margin-right:20px; margin-top: 20px;";
        condFG.appendChild(usedLbl);

        var usedR = document.createElement("input");
        usedR.setAttribute('type', 'radio');
        usedR.setAttribute('name', 'sale_condition');
        usedR.setAttribute('value', 'Used');
        usedLbl.appendChild(usedR);

        var newLbl = document.createElement("LABEL");
        newLbl.innerHTML = " New ";
        newLbl.setAttribute('class', 'radio-inline');
        condFG.appendChild(newLbl);

        var newR = document.createElement("input");
        newR.setAttribute('type', 'radio');
        newR.setAttribute('name', 'sale_condition');
        newR.setAttribute('value', 'New');
        newLbl.appendChild(newR);
    }

}

// Perform search on posts using keywords
function runSearchForPosts() {

    key = document.getElementById("searchPostBar").value;

    // if key is empty
    if (!key) {
        alert("Keyword for searching posts cannot be empty!");
        return;
    }

    fetch(urlSearch, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "key": key,
            "search": "post"
        })

    }).then(function (res) {
        if (res.ok) {

            res.json().then(function (data) {

                var numPost = Object.keys(data.response).length;
                var json = data.response;
                /*
                var ul = document.getElementById('news_card_list');
                ul.innerHTML = "";*/
                $('.card_list_el').remove();

                for (i = 0; i < numPost; i++) {
                    createPostCard(json[i].UserName, json[i].Content, json[i].Headline, json[i].PostingType, json[i].money, json[i].idPosts, json[i].DatePosted, json[i].numLikes, json[i].Category, json[i].Attributes, json[i].UserID);
                }
            });
        }
        else {
            alert("Error: couldn't run search");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });
}

// Perform search on posts using keywords
function runSearchForUsers(from) {
    $('.searchClass.dropdown-item').remove();
    $('.searchClass.dropdown-item.half-rule').remove();

    if (from == '0') {
        key = document.getElementById("searchUserBar2").value;
    }
    else {
        key = document.getElementById("searchUserBar1").value;
    }

    // if key is empty
    if (!key) {
        alert("Keyword for searching users cannot be empty!");
        return;
    }

    fetch(urlSearch, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "key": key,
            "search": "user"
        })

    }).then(function (res) {
        if (res.ok) {

            res.json().then(function (data) {

                // Create dropdown-items to select from 
                // links should direct to the user profiles
                var json = data.response;
                var length = Object.keys(json).length;
                var userSearchDiv = document.getElementById("usersearch");

                if (length != 0) {
                    for (i = 0; i < length; i++) {
                        var lnk = document.createElement("a");
                        lnk.setAttribute('class', 'searchClass dropdown-item');
                        lnk.setAttribute('href', '#');
                        var click = "gotoUserProfile(".concat(json[i].idUsers, ",", from, ")");
                        lnk.setAttribute('onclick', click);
                        lnk.innerHTML = (json[i].FullName).concat("  (", json[i].Email, ")");
                        lnk.style = "border-bottom: 1px solid #ccc; font-weight: bold; overflow: scroll;";
                        userSearchDiv.appendChild(lnk);
                    }
                }
                else if (length == 0) {
                    var lnk = document.createElement("a");
                    lnk.setAttribute('class', 'searchClass dropdown-item half-rule');
                    lnk.innerHTML = "No matching users found!";
                    lnk.style = "border-bottom: 1px solid #ccc; font-weight: bold; margin-left:0;";
                    userSearchDiv.appendChild(lnk);
                }

                // show the dropdown
                document.getElementById("searchUserToggle").style.display = "block";

                // if clicked anywhere else, hide the dropdown list
                $(document).on('click', function (e) {
                    if (e.target.id !== 'searchUserToggle') {
                        $('#searchUserToggle').hide();
                    }

                })
            });
        }
        else {
            alert("Error: couldn't run search");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });
}


// close new post modal and remove previous enteries
function closeNewPostModal() {
    $('.catDiv').remove();
    document.getElementById("in_title_newpost").value = null;
    document.getElementById("in_content_newpost").value = null;
    document.getElementById("in_price_newpost").value = null;
    var type = document.getElementsByName("postType");
    type[0].checked = false;
    type[1].checked = false;
    document.getElementById("pickedCategory").value = null;
}

// close edit post modal and remove previous enteries
function closeEditPostModal() {
    $('.catDiv').remove();
    document.getElementById("in_title_editpost").value = null;
    document.getElementById("in_content_editpost").value = null;
    document.getElementById("in_price_editpost").value = null;
    var type = document.getElementsByName("postEditType");
    type[0].checked = false;
    type[1].checked = false;
    document.getElementById("pickedEditCategory").value = null;
}

// get notifications in dropdown list
function getNotifications(em) {

    fetch(urlNewNotifications, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            //"email": emailAdd
            "id": uID
        })

    }).then(function (res) {
        console.log("Inside res function");
        if (res.ok) {
            res.json().then(function (data) {
                console.log(data.message);
                console.log("Inside res.ok, Get Notifications successful!");
                var length = Object.keys(data.response).length;
                if (length != 0 && numNotifs < length) {
                    numNotifs = 0;
                    var json = data.response;
                    for (i = 0; i < length; i++) {
                        var ul = document.createElement("a");
                        ul.setAttribute('class', 'notifClass dropdown-item');
                        ul.innerHTML = (json[i].Notification);
                        ul.style = "border-bottom: 1px solid #ccc;color:#333399;";
                        document.getElementById("notif").appendChild(ul);

                        numNotifs++;
                    }

                    // view all notifications list
                    var listNotifs = document.createElement("a");
                    listNotifs.setAttribute('class', 'notifClass dropdown-item');
                    listNotifs.innerHTML = "See All";
                    var notificationsPage = "./notifications.html?email=".concat(em, "&id=", uID, "&th=", th);
                    listNotifs.setAttribute('href', notificationsPage);
                    listNotifs.style = "border-bottom: 1px solid #ccc; text-align:center; color:#333399; font-weight: bold;";
                    document.getElementById("notif").appendChild(listNotifs);
                }
                else if (numNotifs == 0) {
                    numNotifs--;
                    var ul = document.createElement("a");
                    ul.setAttribute('class', 'notifClass dropdown-item half-rule');
                    ul.innerHTML = "No new notifications available for you at this time.";
                    ul.style = "border-bottom: 1px solid #ccc; margin-left:0;";
                    document.getElementById("notif").appendChild(ul);

                    // view all notifications list
                    var listNotifs = document.createElement("a");
                    listNotifs.setAttribute('class', 'notifClass dropdown-item');
                    listNotifs.innerHTML = "See All";
                    var notificationsPage = "./notifications.html?email=".concat(em, "&id=", uID, "&th=", th);
                    listNotifs.setAttribute('href', notificationsPage);
                    listNotifs.style = "border-bottom: 1px solid #ccc; text-align:center; color:#333399; font-weight: bold;";
                    document.getElementById("notif").appendChild(listNotifs);
                }

                // if clicked anywhere else, hide the dropdown list
                $(document).on('click', function (e) {
                    if (e.target.id !== 'notificationsToggle') {
                        $('#notificationsToggle').hide();
                    }

                })

            }.bind(this));
        }
        else {
            alert("Error: Get notifications unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });
}

// redirect to profile
function goToProfile(from) {
    if (from == '0') {
        var u = 'profile.html?email='.concat(email);
        window.location.href = u;
    }
    else if (from == '1') {
        var u = 'profile.html?email='.concat(emailAdd);
        window.location.href = u;
    }
}

// show attributes in UI of post card
function categoryModal(postID) {
    $('.catClass').remove();
    fetch(urlCatAttributes, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "postID": postID
        })
    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                console.log(data.message);
                console.log("Inside res.ok, category and attributes successfully recieved!");
                var category = data.response[0].Category;
                if (category === "Sitter") {
                    category = "Baby/Pet Sitter";
                } else if (category === "Ride") {
                    category = "Ride Share";
                } else if (category === "Sale") {
                    category = "For Sale";
                }
                document.getElementById("catModalTitle").innerHTML = "Category:&emsp;<b style=\"color:#333399;\">".concat(category, "</b>");

                if (data.response[0].Attributes === null) {
                    var lm = document.getElementById("learnMoreFG");
                    var divAttr = document.createElement("div");
                    divAttr.innerHTML = "No attributes available!";
                    divAttr.setAttribute('class', 'catClass');
                    lm.appendChild(divAttr);
                }
                else {
                    var attrs = data.response[0].Attributes.split("|");
                    for (i = 0; i < attrs.length; i++) {
                        var lm = document.getElementById("learnMoreFG");
                        var divAttr = document.createElement("div");

                        var catClass = document.createElement("div");
                        catClass.setAttribute('class', 'catClass');
                        lm.appendChild(catClass);

                        var Att = attrs[i].split(":");
                        divAttr.innerHTML = Att[0].concat(":&emsp;");
                        divAttr.style = "color:#333399; display:inline-block; font-weight:bold; font-size:16px;";
                        catClass.appendChild(divAttr);

                        var divStr = document.createElement("div");
                        divStr.innerHTML = Att[1];
                        divStr.style = "display:inline-block";
                        catClass.appendChild(divStr);

                        var br = document.createElement("br");
                        catClass.appendChild(br);
                    }
                }
            }.bind(this));
        }
        else {
            alert("Error: get Category and Attributes unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });
}


// EDIT POST method
function getSelectedPost(postID) {
    $(document).ready(function () {
        $('#postEditPublish').on('click', function (e) {
            createPost(parseInt(postID));
        });
    });
}

// EDIT POST method
function editPost(title, desc, price, type_value, category, attributes, postID) {

    // send to server
    fetch(urlEditPost, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "PostId": postID,
            "Headline": title,
            "Content": desc,
            "PostingType": type_value,
            "money": price,
            "Category": category,
            "Attributes": attributes
        })

    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                $('.card_list_el').remove();
                getAllPosts();
                console.log("Inside res.ok. Post edited");
                console.log("Editing Post successful!");
            }.bind(this));
        }
        else {
            alert("Error: editing post unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });

}
