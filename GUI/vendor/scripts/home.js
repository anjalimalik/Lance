var urlGetPosts = "http://localhost:5500/getPosts"

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
                        createCard(json[i].UserID, json[i].Content, json[i].Headline, json[i].PostingType, json[i].money);
                    }

                });


            })
            .catch(function(data) {

                console.log(data.message);
        });
}

function createCard(user, content, headline, postingType, money) {

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

    var divLearnMore = document.createElement('a');
    divLearnMore.setAttribute('class', 'btn btn-primary');
    divLearnMore.setAttribute('href', 'www.google.com');
    divLearnMore.innerHTML = "Learn More!";
    divBody.appendChild(divLearnMore);

    var divFooterDate = document.createElement('div');
    divFooterDate.setAttribute('class', 'card-footer text-muted');
    divFooterDate.innerHTML = "some number";
    divCenter.appendChild(divFooterDate);

    var divFooterMoney = document.createElement('div');
    divFooterMoney.setAttribute('class', 'card-footer text-muted');
    divFooterMoney.innerHTML = money;
    divCenter.appendChild(divFooterMoney);

}
