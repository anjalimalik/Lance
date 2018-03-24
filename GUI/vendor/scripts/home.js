var urlGetPosts = "http://localhost:5500/getPosts"
var urlReport = "http://localhost:5500/Report"

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
                    createCard(json[i].UserName, json[i].Content, json[i].Headline, json[i].PostingType, json[i].money, json[i].idPosts);
                }
            });

        })
        .catch(function (data) {

            console.log(data.message);
        });
}

// CREATE A NEW CARD FOR EVERY POST FROM SERVER (/getPosts)
function createCard(user, content, headline, postingType, price, postID) {

    var ul = document.getElementById('news_card_list');

    var li = document.createElement('li');
    li.setAttribute('class', 'card_list_el');
    ul.appendChild(li);

    var divCenter = document.createElement("div");
    divCenter.setAttribute('class', 'card text-center');
    li.appendChild(divCenter);

    /* Offer/Request */
    var divHeader = document.createElement("div");
    divHeader.setAttribute('class', 'card-header');
    var str = postingType.concat(" from ", user);
    divHeader.style = "color:#666699; margin-left:60px;";
    divHeader.innerHTML = str;
    divCenter.appendChild(divHeader);

    /* Price */
    var divTextPrice = document.createElement("kbd");
    divTextPrice.innerHTML = "$".concat(price);
    divTextPrice.style = "background-color:lightgrey;color:black;float:right;margin-right:3px;font-size: 16px;";
    divHeader.appendChild(divTextPrice);

    var divBody = document.createElement("div");
    divBody.setAttribute('class', 'card-body');
    divCenter.appendChild(divBody);

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
    btn_report.setAttribute("data-toggle", "modal");
    btn_report.setAttribute("data-target", "#myModalReport");
    btn_report.style = "float:right;margin-bottom:0px;margin-right:10px;margin-top:0px;";
    btn_report.appendChild(t1);
    divButtons.appendChild(btn_report);

    /* Learn More */
    var divLearnMore = document.createElement("BUTTON");
    divLearnMore.setAttribute('class', 'btn btn-primary btn-md');
    divLearnMore.style = "float:right;margin-bottom:7px;margin-right:380px;margin-top:0px;";
    divLearnMore.innerHTML = "Learn More!";
    divButtons.appendChild(divLearnMore);

    /* Date Posted */
    var divFooterDate = document.createElement('div');
    divFooterDate.setAttribute('class', 'card-footer text-muted');
    divFooterDate.innerHTML = "some number";
    divCenter.appendChild(divFooterDate);    
    
    /* LIKE/INTERESTED */
    var aHeart = document.createElement('BUTTON');
    aHeart.setAttribute('class', 'btn btn-default btn-sm');
    aHeart.style = "border: 0; background: transparent;";
    divFooterDate.appendChild(aHeart);  

    var spanHeart = document.createElement('img');
    spanHeart.setAttribute('src', 'heart.png');
    spanHeart.setAttribute('alt', 'Like');
    spanHeart.style = "width:20px; height:20px;";
    aHeart.appendChild(spanHeart); 

    /* This needs to be hidden - Post id */
    var post_id = document.createElement("LABEL");
    post_id.setAttribute("id", "postIDHidden");
    post_id.style.display = "none";
    post_id.innerHTML = postID;
    divBody.appendChild(post_id);
}

function reportPost() {
    var reportMsg = document.getElementById("in_report").value;
    console.log(document.getElementById("postIDHidden").textContent);
    fetch(urlReport, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "message": reportMsg,
            "postId": document.getElementById("postIDHidden").textContent
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
