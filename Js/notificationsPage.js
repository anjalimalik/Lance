var urlAllNotifications = "http://localhost:5500/getAllNotifications";

// onload
function onLoad_Notifications() {

    // get user id
    var url = window.location.href;
    var str = url.split("?");

    var id = str[1];
    if (id === null) {
        alert("You have to be logged in first!");
        window.location.href = "index.html";
    }
    else if (id.includes("#")) {
        id = id.replace("#", "");
    }

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
                    var notificationsPage = "./notifications.html?".concat(uID);
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
                    var notificationsPage = "./notifications.html?".concat(uID);
                    listNotifs.setAttribute('href', notificationsPage);
                    listNotifs.style = "border-bottom: 1px solid #ccc; text-align:center; color:#333399; font-weight: bold;";
                    document.getElementById("notif").appendChild(listNotifs);
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
