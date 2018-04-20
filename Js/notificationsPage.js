var urlAllNotifications = "http://localhost:5500/getAllNotifications";

var em = ""; // email
var id = ""; // user id

// onload
function onLoad_Notifications() {

    // get user id
    var url = window.location.href;
    var str = url.split("?email=");

    em = str[1];
    if (em === null) {
        alert("You have to be logged in first!");
        window.location.href = "index.html";
    }
    else if (em.includes("&")) {
        str = em.split("&id=");
        em = str[0];
        id = str[1];
        if (id.includes("#")) {
            id = id.replace("#", "");
        }
    }
    else if (em.includes("#")) {
        em = em.replace("#", "");
    }

    $(".notificationsContainer").remove();
    getAllNotifications(id);
}

// populate the list of notifications with all notifications (seen/unseen)
function getAllNotifications(id) {

    fetch(urlAllNotifications, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "id": id
        })

    }).then(function (res) {
        console.log("Inside res function");
        if (res.ok) {
            res.json().then(function (data) {
                console.log(data.message);
                var json = data.response;
                var length = Object.keys(data.response).length;

                var list = document.getElementById("nList");

                // create a container div
                var listDiv = document.createElement("div");
                listDiv.setAttribute('class', 'notificationsContainer');
                list.appendChild(listDiv);

                if (length != 0) {
                    // create the list using loop
                    for (i = 0; i < length; i++) {
                        var a = document.createElement("a");
                        a.setAttribute('class', 'list-group-item list-group-item-action flex-column align-items-start');
                        a.setAttribute('href', '#');
                        listDiv.appendChild(a);

                        var head = document.createElement("div");
                        head.setAttribute('class', 'd-flex w-100 justify-content-between');
                        a.appendChild(head);

                        var notif = document.createElement("h4");
                        notif.setAttribute('class', 'mb-1');
                        //notif.innerHTML = json[i].SenderName;
                        head.appendChild(notif);

                        var ago = document.createElement("small");
                        var date = new Date(parseInt(json[i].msec));
                        ago.innerHTML = date.toDateString() + ", " + date.toLocaleTimeString();
                        head.appendChild(ago);

                        var p = document.createElement("p");
                        p.setAttribute('class', 'mb-1');
                        p.style = "font-weight: bold; color: black;";
                        p.innerHTML = ((json[i].Notification).split("@"))[0];
                        a.appendChild(p);
                    }

                    // end of notifications
                    var end = document.createElement("p");
                    end.style = "padding: 15px 5px 5px 5px; text-align: center;";
                    end.innerHTML = "End of notifications";
                    listDiv.appendChild(end);
                }
                else {
                    // zero notifications
                    var zero = document.createElement("p");
                    zero.style = "padding: 15px 5px 5px 5px; text-align: center;";
                    zero.innerHTML = "You have zero notifications!";
                    listDiv.appendChild(zero);
                }

            }.bind(this));
        }
        else {
            alert("Error: Get all notifications (list) unsuccessful!");
            res.json().then(function (data) {
                console.log(data.message);
            }.bind(this));
        }
    }).catch(function (err) {
        alert("Error: No internet connection!");
        console.log(err.message + ": No Internet Connection");
    });
}

// Method to go to home
function backToHome() {
    var u = 'home.html?email='.concat(em);
    window.location.href = u;
}

// Method to go to profile
function backToProfile() {
    var u = 'profile.html?email='.concat(em);
    window.location.href = u;
}
