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

                var list = document.getElementsById("nList");

                if (length != 0) {

                    // create a container div
                    var listDiv = document.createElement("div");
                    a.setAttribute('class', 'notificationsContainer');
                    list.appendChild(listDiv);

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
                        notif.innerHTML = (json[i].Notification);
                        head.appendChild(notif);

                        var ago = document.createElement("small");
                        ago.innerHTML = (timeSince(new Date(Date.now() - json[i].msec)));
                        head.appendChild(ago);

                        var p = document.createElement("p");
                        p.setAttribute('class', 'mb-1');
                        p.innerHTML = json[i].SenderName;
                        a.appendChild(p);
                    }
                }
                else if (numNotifs == 0) {
                    var a = document.createElement("a");
                    a.setAttribute('class', 'list-group-item list-group-item-action flex-column align-items-start');
                    a.setAttribute('href', '#');
                    listDiv.appendChild(a);

                    var head = document.createElement("div");
                    head.setAttribute('class', 'd-flex w-100 justify-content-between');
                    a.appendChild(head);

                    var notif = document.createElement("h4");
                    notif.setAttribute('class', 'mb-1');
                    notif.innerHTML = "You have zero notifications!";
                    head.appendChild(notif);
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

function backToHome() {
    var u = 'home.html?email='.concat(em);
    window.location.href = u;
}

function backToProfile() {
    var u = 'profile.html?email='.concat(em);
    window.location.href = u;
}

function timeSince(date) {
    
      var seconds = Math.floor((new Date() - date) / 1000);
    
      // years
      var interval = Math.floor(seconds / 31536000);
      if (interval > 1) {
        return interval + " years ago";
      }

      // months
      interval = Math.floor(seconds / 2592000);
      if (interval > 1) {
        return interval + " months ago";
      }

      // days
      interval = Math.floor(seconds / 86400);
      if (interval > 1) {
        return interval + " days ago";
      }

      // hours
      interval = Math.floor(seconds / 3600);
      if (interval > 1) {
        return interval + " hours ago";
      }

      // minutes
      interval = Math.floor(seconds / 60);
      if (interval > 1) {
        return interval + " minutes ago";
      }

      // else - seconds
      return Math.floor(seconds) + " seconds ago";
}
