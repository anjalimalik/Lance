var urlGetPosts = "http://localhost:5500/getPosts"
var urlReport = "http://localhost:5500/Report"
var urlLike = "http://localhost:5500/ClickInterested"

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
    ul.appendChild(li);

    var divCenter = document.createElement("div");
    divCenter.setAttribute('class', 'card text-center');
    li.appendChild(divCenter);

    var divHeader = document.createElement("div");
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
    var str = postingType.concat(" from ", user);
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
    btn_close.setAttribute("id", "btnClose");
    btn_close.style = "float:right;margin-bottom:0px;margin-right:15px;margin-top:0px;";
    btn_close.appendChild(t2);
    divButtons.appendChild(btn_close);

    /* Report */
    var btn_report = document.createElement("BUTTON");
    var t1 = document.createTextNode("Report Post");
    btn_report.setAttribute("id", "btnReport");
    btn_report.setAttribute("class", "btn btn-warning btn-sm");
    btn_report.setAttribute("onclick", "getPostID(".concat(postID, ")"));
    btn_report.setAttribute("data-toggle", "modal");
    btn_report.setAttribute("data-target", "#myModalReport");
    btn_report.style = "float:right;margin-bottom:0px;margin-right:10px;margin-top:0px;";
    btn_report.appendChild(t1);
    divButtons.appendChild(btn_report);

    /* Learn More */
    var divLearnMore = document.createElement("BUTTON");
    divLearnMore.setAttribute('class', 'btn btn-primary btn-md');
    divLearnMore.style = "float:right;margin-bottom:7px;margin-right:380px;margin-top:0px; height:40px;";
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
    document.getElementById("postIDHidden").remove();
    document.getElementById("postid").remove();
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

function getPostID(id) {
    var ul = document.getElementById('postid');
    /* This needs to be hidden - Post id */
    var post_id = document.createElement("LABEL");
    post_id.setAttribute("id", "postIDHidden");
    post_id.style.display = "none";
    post_id.innerHTML = id;
    ul.appendChild(post_id);
}