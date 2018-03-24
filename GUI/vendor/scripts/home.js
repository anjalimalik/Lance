var urlGetPosts = "http://localhost:5500/getPosts"
var urlReport = "http://localhost:5500/Report"

function onLoad() {
    getAllPosts();


}

function getAllPosts() {

    fetch(urlGetPosts)
        .then(function(res) {
                res.json().then(function(data) {
                    console.log(data);
                    var numPost = Object.keys(data.response).length;
                    var json = data.response;

                    for (i = 0; i < numPost; i++) {
                        createCard(json[i].UserName, json[i].Content, json[i].Headline, json[i].PostingType, json[i].money, json[i].idPosts);
                    }
                });

            })
            .catch(function(data) {

                console.log(data.message);
        });
}

function createCard(user, content, headline, postingType, price, postID) {

    var ul = document.getElementById('news_card_list');

    var li = document.createElement('li');
    li.setAttribute('class', 'card_list_el');
    ul.appendChild(li);

    var divCenter = document.createElement("div");
    divCenter.setAttribute('class', 'card text-center');
    li.appendChild(divCenter);

    var divHeader = document.createElement("div");
    divHeader.setAttribute('class', 'card-header');
    var str = postingType.concat(" from ", user);
    divHeader.innerHTML = str;
    divCenter.appendChild(divHeader);

    var divBody = document.createElement("div");
    divBody.setAttribute('class', 'card-body');
    divCenter.appendChild(divBody);

    var divTitle = document.createElement("h5");
    divTitle.setAttribute('class' ,'card-title');
    divTitle.innerHTML = headline;
    divBody.appendChild(divTitle);

    var divText = document.createElement("p");
    divText.setAttribute('class', 'card-text');
    divText.innerHTML = content;
    divBody.appendChild(divText);

    var divTextPrice = document.createElement("p");
    divTextPrice.setAttribute('class', 'card-text');
    divTextPrice.innerHTML = "$".concat(price);
    divBody.appendChild(divTextPrice);

    var divLearnMore = document.createElement('a');
    divLearnMore.setAttribute('class', 'btn btn-primary');
    divLearnMore.setAttribute('href', 'https://www.google.com');
    divLearnMore.innerHTML = "Learn More!";
    divBody.appendChild(divLearnMore);

    var divFooterDate = document.createElement('div');
    divFooterDate.setAttribute('class', 'card-footer text-muted');
    divFooterDate.innerHTML = "some number";
    divCenter.appendChild(divFooterDate);

    var btn_report = document.createElement("BUTTON");
    var t = document.createTextNode("Report Post");
    btn_report.appendChild(t);
    btn_report.onclick = reportPost;
    divBody.appendChild(btn_report);

    var post_id = document.createElement("LABEL");
    post_id.setAttribute("id", "postIDHidden");
    post_id.style.display = "none";

    post_id.innerHTML = postID;
    divBody.appendChild(post_id);

}

function reportPost() {
    var reportMsg = "Profanity in post";
    console.log(document.getElementById("postIDHidden").textContent);
    fetch(urlReport, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    "message":reportMsg,
                    "postId": document.getElementById("postIDHidden").textContent
                })

            }).then(function(res) {
                if (res.ok) {
                    res.json().then(function(data) {
                        console.log("Inside res.ok");
                        alert("Your Report was sent successfully");
                    }.bind(this));
                }
                else {
                    alert("Error: Login unsuccessful!");
                    res.json().then(function(data) {
                    console.log(data.message);
                    }.bind(this));
                }
            }).catch(function(err) {
                alert("Error: No internet connection!");
                console.log(err.message + ": No Internet Connection");
        });

}
