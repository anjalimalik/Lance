var urlGetPosts = "http://localhost:5500/getPosts"
var urlReport = "http://localhost:5500/Report"
var urlLike = "http://localhost:5500/ClickInterested"
var urlClose = "http://localhost:5500/ClosePost"
var urlGetComment = "http://localhost:5500/getComments"
var urlWriteComment = "http://localhost:5500/WriteComment"
var urlSortPosts = "http://localhost:5500/getSortedPosts"
var urlFilterPosts = "http://localhost:5500/getFilteredPosts"
var urlCreatePost = "http://localhost:5500/CreatePost"

function onLoad() {
    getAllPosts();
}

function getAllPosts() {
    fetch(urlGetPosts)
        .then(function (res) {
            res.json().then(function (data) {
                console.log(data);
                var numPost = Object.keys(data.response).length;
                var json = data.response;

                for (i = 0; i < numPost; i++) {
                    createCard(json[i].UserName, json[i].Content, json[i].Headline, json[i].PostingType, json[i].money, json[i].idPosts, json[i].DatePosted, json[i].numLikes, json[i].Category);
                }
            });

        })
        .catch(function (data) {

            console.log(data.message);
        });
}

// CREATE A NEW CARD FOR EVERY POST FROM SERVER (/getPosts)
function createCard(user, content, headline, postingType, price, postID, date, likes, category) {

    var ul = document.getElementById('news_card_list');

    var li = document.createElement('li');
    li.setAttribute('class', 'card_list_el');
    li.setAttribute('id', 'card_child');
    li.style = "width:70%; margin-left: 100px;";
    ul.appendChild(li);

    var divCenter = document.createElement("div");
    divCenter.setAttribute("id", "div".concat(postID));
    divCenter.setAttribute('class', 'card text-center');
    li.appendChild(divCenter);

    var divHeader = document.createElement("div");
    divHeader.setAttribute("id", "head".concat(postID));
    divHeader.setAttribute('class', 'card-header');
    divHeader.style = "height:45px;";
    divCenter.appendChild(divHeader);

    /* Price */
    var divTextPrice = document.createElement("kbd");
    divTextPrice.innerHTML = "$".concat(price);
    divTextPrice.style = "background-color:lightgrey;color:black;float:right;margin-top:-5px;margin-right:-7px;font-size: 16px;";
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
        var divCat = document.createElement("kbd");
        divCat.innerHTML = category;
        divCat.style = "background-color:#483D8B;color:white;float:right;margin-top:-5px;margin-right:7px;font-size: 14px; height:30px;";
        divHeader.appendChild(divCat);
    }

    /* Offer/Request */
    var ReqOff = document.createElement("p");
    var str = postingType.concat(" from ", "<b style=\"", "color:#333399; font-weight:bold\">", user, "</b>");
    ReqOff.style = "color:#666699;float:left;";
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

    /* Close Post */
    var btn_close = document.createElement("BUTTON");
    btn_close.setAttribute("class", "btn btn-default btn-sm");
    btn_close.setAttribute('onclick', "closePost(".concat(postID, ")"));
    btn_close.setAttribute("id", "btnClose");
    btn_close.style = "float:right;margin-bottom:3px;margin-right:0px;margin-top:0px;";
    divButtons.appendChild(btn_close);

    var imgClose = document.createElement('img');
    imgClose.setAttribute('src', 'close.png');
    imgClose.setAttribute('alt', 'Close');
    imgClose.style = "float:center;width:20px; height:20px;";
    btn_close.appendChild(imgClose);

    /* Report */
    var btn_report = document.createElement("BUTTON");
    btn_report.setAttribute("id", "btnReport");
    btn_report.setAttribute("class", "btn btn-default btn-sm");
    //btn_report.setAttribute("onclick", "getPostID(".concat(postID, ")"));
    btn_report.setAttribute("data-toggle", "modal");
    btn_report.setAttribute("data-target", "#myModalReport");
    btn_report.style = "float:right;margin-bottom:3px;margin-right:0px;margin-top:0px;";
    divButtons.appendChild(btn_report);

    var imgFlag = document.createElement('img');
    imgFlag.setAttribute('src', 'flag.png');
    imgFlag.setAttribute('alt', 'Report');
    imgFlag.style = "float:center;width:20px; height:20px;";
    btn_report.appendChild(imgFlag);


    var divFooter = document.createElement('div');
    divFooter.setAttribute('class', 'card-footer');
    divFooter.style = "height:45px;";
    divCenter.appendChild(divFooter);

    /* LIKE/INTERESTED */
    var aHeart = document.createElement('BUTTON');
    aHeart.setAttribute('class', 'btn btn-default btn-sm');
    aHeart.setAttribute('onclick', "clickInterested(".concat(postID, ")"));
    aHeart.style = "float:center; outline:none; border: 0; background: transparent; margin-left:310px; margin-top:-17px;";
    divFooter.appendChild(aHeart);

    var imgHeart = document.createElement('img');
    imgHeart.setAttribute('src', 'heart.png');
    imgHeart.setAttribute('alt', 'Like');
    imgHeart.style = "float:center;width:30px; height:30px;";
    aHeart.appendChild(imgHeart);

    var txtlikes = document.createElement("text");
    txtlikes.setAttribute("id", "txtLikes".concat(postID));
    txtlikes.innerHTML = likes.toString();
    txtlikes.style = "float:center;margin-left:-16px;font-size:14px;color:grey;";
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
    divComments.setAttribute("data-target", "#myPostModal");
    divComments.style = "float:right;margin-bottom:7px;margin-right:195px;margin-top:-10px; height:40px;";
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

function reportPost() {
    var reportMsg = document.getElementById("in_report").value;
    fetch(urlReport, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "message": reportMsg,
            "postId": parseInt(document.getElementById("postIDHidden").textContent)
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

function clickInterested(postID) {
    postID = parseInt(postID);
    fetch(urlLike, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "email": "test5@purdue.edu",
            "postId": postID
        })

    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                var likesid = "txtLikes".concat(postID);
                var num = parseInt(document.getElementById(likesid).textContent);
                document.getElementById(likesid).innerHTML = (num + 1).toString();
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
/*
function getPostID(id) {
    var ul = document.getElementById('postid');
    var post_id = document.createElement("LABEL");
    post_id.setAttribute("id", "postIDHidden");
    post_id.style.display = "none";
    post_id.innerHTML = id;
    ul.appendChild(post_id);
}
*/

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
                var id1 = "div".concat(postID.toString());
                var id2 = "head".concat(postID.toString());
                (document.getElementById(id1)).removeChild((document.getElementById(id2)));
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

// expand post to get all comments
function expandPost(postID) {
    var lm = document.getElementById("learnMoreFG");
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
    document.getElementById("xBtn_post").setAttribute('onclick', "removeElements(".concat(postID, ", ", num, ")"));
    document.getElementById("closeBtn_post").setAttribute('onclick', "removeElements(".concat(postID, ", ", num, ")"));

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
        sender.style = "float:left; background-color:lightblue; height:32px; font-size:15px; margin-left:-15px; margin-top:-10px; color:black;";
        sender.innerHTML = json[i].SenderName;
        body.appendChild(sender);

        //title (content of comment)
        var title = document.createElement("p");
        title.setAttribute('class', 'card-title');
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
    inputW.style = "margin-top: -21px;width: 400px; height: 55px; margin-left:-20px;";
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

function addComment(postID, email, num) {
    var comment = document.getElementById("txtComment").value;
    postID = parseInt(postID);
    fetch(urlWriteComment, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "postId": postID,
            "comment": comment,
            "email": "anjali@purdue.edu" // replace with email
        })

    }).then(function (res) {
        if (res.ok) {
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

    removeElements(postID, num);
    $('#myPostModal').modal('hide');
}

// Remove elements in Learn More Post modal
function removeElements(postID, num) {
    if (num === 0) {
        (document.getElementById('ulcomments'.concat(postID))).removeChild((document.getElementById('pComments'.concat(postID))));
    }
    for (i = 0; i < num; i++) {
        // remove comments
        (document.getElementById('ulcomments'.concat(postID))).removeChild((document.getElementById('pComments'.concat(postID, i.toString()))));
    }
    (document.getElementById('ulcomments'.concat(postID))).removeChild((document.getElementById('pWComments'.concat(postID))));
}

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

function getSortedPosts(json) {
    $('.card_list_el').remove();
    if (json) {
        var num = Object.keys(json).length;
        for (i = 0; i < num; i++) {
            createCard(json[i].UserName, json[i].Content, json[i].Headline, json[i].PostingType, json[i].money, json[i].idPosts, json[i].DatePosted, json[i].numLikes, json[i].Category);
        }
    }
}

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

function createPost() {
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
        alert ("Not enough information provided");
        document.getElementById("postClose").click();
        return;
    }

    // Only category is optional
    if(!price || !title || !desc) {
        alert ("Not enough information provided");
        document.getElementById("postClose").click();
        return;
    }
    var attributes = null;
    var category = document.getElementById("pickedCategory").value;

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

    // send to server
    fetch(urlCreatePost, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "email": "test@purdue.edu",
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
                console.log("Inside res.ok. New post added");
                alert("New Post created!");
            }.bind(this));
            $('.card_list_el').remove();
            getAllPosts();
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
function expandCreatePModal(category) {

    // remove elements if clicked on a category again
    $('.catDiv').remove();

    if (category === 'Ride') {
        document.getElementById("pickedCategory").value = "Ride";

        var rideDiv = document.createElement("div");
        rideDiv.setAttribute('class', 'catDiv');
        document.getElementById("fieldset_createNP").appendChild(rideDiv);

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
        document.getElementById("fieldset_createNP").appendChild(foodDiv);

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
        document.getElementById("fieldset_createNP").appendChild(tutorDiv);

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
        document.getElementById("fieldset_createNP").appendChild(sitDiv);

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
        document.getElementById("fieldset_createNP").appendChild(housingDiv);

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
        document.getElementById("fieldset_createNP").appendChild(saleDiv);

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
        usedLbl.appendChild(usedR);

        var newLbl = document.createElement("LABEL");
        newLbl.innerHTML = " New ";
        newLbl.setAttribute('class', 'radio-inline');
        condFG.appendChild(newLbl);

        var newR = document.createElement("input");
        newR.setAttribute('type', 'radio');
        newR.setAttribute('name', 'sale_condition');
        newLbl.appendChild(newR);
    }
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