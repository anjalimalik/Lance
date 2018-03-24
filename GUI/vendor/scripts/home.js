var urlGetPosts = "http://localhost:5500/getPosts"
var urlReport = "http://localhost:5500/Report"
var urlLike = "http://localhost:5500/ClickInterested"
var urlClose = "http://localhost:5500/ClosePost"
var urlGetComment = "http://localhost:5500/getComments"
var urlWriteComment = "http://localhost:5500/WriteComment"

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
                    createCard(json[i].UserName, json[i].Content, json[i].Headline, json[i].PostingType, json[i].money, json[i].idPosts, json[i].DatePosted, json[i].numLikes);
                }
            });

        })
        .catch(function (data) {

            console.log(data.message);
        });
}

// CREATE A NEW CARD FOR EVERY POST FROM SERVER (/getPosts)
function createCard(user, content, headline, postingType, price, postID, date, likes) {

    var ul = document.getElementById('news_card_list');

    var li = document.createElement('li');
    li.setAttribute('class', 'card_list_el');
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

    /* Offer/Request */
    var ReqOff = document.createElement("p");
    var str = postingType.concat(" from ", "<b style=\"", "color:#333399; font-weight:bold\">", user, "</b>");
    ReqOff.style = "color:#666699;margin-left:60px;";
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
    var t2 = document.createTextNode("Close Post");
    btn_close.setAttribute("class", "btn btn-danger btn-sm");
    btn_close.setAttribute('onclick', "closePost(".concat(postID, ")"));
    btn_close.setAttribute("id", "btnClose");
    btn_close.style = "float:right;margin-bottom:0px;margin-right:15px;margin-top:0px;";
    btn_close.appendChild(t2);
    divButtons.appendChild(btn_close);

    /* Report */
    var btn_report = document.createElement("BUTTON");
    var t1 = document.createTextNode("Report Post");
    btn_report.setAttribute("id", "btnReport");
    btn_report.setAttribute("class", "btn btn-warning btn-sm");
    //btn_report.setAttribute("onclick", "getPostID(".concat(postID, ")"));
    btn_report.setAttribute("data-toggle", "modal");
    btn_report.setAttribute("data-target", "#myModalReport");
    btn_report.style = "float:right;margin-bottom:0px;margin-right:10px;margin-top:0px;";
    btn_report.appendChild(t1);
    divButtons.appendChild(btn_report);

    /* Learn More */
    var divLearnMore = document.createElement("BUTTON");
    divLearnMore.setAttribute('class', 'btn btn-primary btn-md');
    divLearnMore.setAttribute("data-toggle", "modal");
    divLearnMore.setAttribute("data-target", "#myPostModal");
    divLearnMore.style = "float:right;margin-bottom:7px;margin-right:160px;margin-top:0px; height:40px;";
    divLearnMore.setAttribute('onclick', "expandPost(".concat(postID, ")"));
    divLearnMore.innerHTML = "Learn More!";
    divButtons.appendChild(divLearnMore);

    var divFooter = document.createElement('div');
    divFooter.setAttribute('class', 'card-footer');
    divFooter.style = "height:45px;";
    divCenter.appendChild(divFooter);

    /* LIKE/INTERESTED */
    var aHeart = document.createElement('BUTTON');
    aHeart.setAttribute('class', 'btn btn-default btn-sm');
    aHeart.setAttribute('onclick', "clickInterested(".concat(postID, ")"));
    aHeart.style = "float:center; outline:none; border: 0; background: transparent; margin-left:130px; margin-top:-12px;";
    divFooter.appendChild(aHeart);

    var imgHeart = document.createElement('img');
    imgHeart.setAttribute('src', 'heart.png');
    imgHeart.setAttribute('alt', 'Like');
    imgHeart.style = "float:center;width:30px; height:30px;";
    aHeart.appendChild(imgHeart);

    var txtlikes = document.createElement("text");
    txtlikes.setAttribute("id", "txtLikes".concat(postID));
    txtlikes.innerHTML = likes.toString();
    txtlikes.style = "float:center;margin-left:-10px;font-size:14px;color:grey;";
    divFooter.appendChild(txtlikes);

    /* Date Posted */
    var divFooterDate = document.createElement('div');
    divFooterDate.setAttribute('class', 'text-muted');
    var d = new Date(date);
    date = d.toDateString();
    divFooterDate.innerHTML = date;
    divFooterDate.style = "float:right; font-size:14px;";
    divFooter.appendChild(divFooterDate);

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

function expandPost(postID) {
    var lm = document.getElementById("learnMoreFG");
    // comments
    var ulComments = document.createElement("ul");
    ulComments.setAttribute('id', 'ulcomments'.concat(postID));
    ulComments.setAttribute('class', 'comments_list');
    lm.appendChild(ulComments);

    getAllComments(postID);

    /*var ul = document.getElementById('myPostModal');
    ul.setAttribute('aria-hidden', 'false');

    // dialog
    var divDialog = document.createElement('div');
    divDialog.setAttribute('class', 'modal-dialog');
    divDialog.setAttribute('role', 'document');
    ul.appendChild(divDialog);

    // content
    var divContent = document.createElement("div");
    divContent.setAttribute('class', 'modal-content');
    divDialog.appendChild(divContent);

    // body
    var divBody = document.createElement("div");
    divBody.setAttribute('class', 'modal-body');
    divContent.appendChild(divBody);

    // header
    var divHeader = document.createElement("div");
    divHeader.setAttribute('class', 'modal-header');
    //divHeader.style = "height:45px;";
    divBody.appendChild(divHeader);

    // title
    var hTitle = document.createElement("h5");
    hTitle.setAttribute('class', 'modal-title');
    hTitle.innerHTML = ""; // headline
    divHeader.appendChild(hTitle);

    // button &times
    var btnX = document.createElement("BUTTON");
    btnX.setAttribute('class', 'close');
    btnX.setAttribute('data-dismiss', 'modal');
    btnX.setAttribute('aria-label', 'Close');
    divHeader.appendChild(btnX);

    var spanX = document.createElement("BUTTON");
    spanX.setAttribute('aria-hidden', 'true');
    spanX.innerHTML = "&times;";
    btnX.appendChild(spanX);

    //form fieldset
    var form = document.createElement("form");
    divBody.appendChild(form);
    var fieldset = document.createElement("fieldset");
    form.appendChild(fieldset);

    // form group
    var divFG = document.createElement("div");
    divFG.setAttribute('class', 'form-group');
    fieldset.appendChild(divFG);

    // label
    var lbl = document.createElement("LABEL");
    lbl.innerHTML = ""; //
    divFG.appendChild(lbl);

    // footer
    var divFooter = document.createElement("div");
    divFooter.setAttribute('class', 'modal-footer');
    form.appendChild(divFooter);

    // comments
    var ulComments = document.createElement("ul");
    ulComments.setAttribute('id', 'ulcomments'.concat(postID));
    ulComments.setAttribute('class', 'comments_list');
    divFooter.appendChild(ulComments);

    getAllComments(postID);

    // button &times
    var btnClose = document.createElement("BUTTON");
    btnClose.setAttribute('class', 'btn btn-secondary');
    btnClose.setAttribute('data-dismiss', 'modal');
    btnClose.innerHTML = 'Close';
    divFooter.appendChild(btnClose); */

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

function addComment(postID, email, num){
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