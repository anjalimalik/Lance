
var email, pass, name, edu, skills, desc, contact, links, pic, docs;
var urlChangePass = "http://localhost:5500/changePassword"
function body_onload() {
    name = localStorage.getItem('name');
    email = localStorage.getItem('email');
    edu = localStorage.getItem('edu');
    links = localStorage.getItem('links');
    contact = localStorage.getItem('contact');
    desc = localStorage.getItem('desc');
    skills = localStorage.getItem('skills');

    var img = new Image();
    img.src = "./Pictures/spinner.jpg";
    document.getElementById("img_profile").src = "./Pictures/spinner.jpg";


    populate_profile();
}

$(function() {
    $(":file").change(function() {
        if(this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = imageIsLoaded;
            reader.readAsDataURL(this.files[0]);
        }
    });
});

function imageIsLoaded(e) {
    $('#img_profile').attr('src', e.target.result);
}

function populate_profile () {
    document.getElementById("profile_name").innerHTML = name;
    document.getElementById("profile_email").innerHTML = email;
    document.getElementById("profile_edu").innerHTML = edu;
    document.getElementById("profile_contact").innerHTML = contact;
    document.getElementById("profile_desc").innerHTML = desc;
    document.getElementById("profile_skills").innerHTML = skills;

    var finallink = "https://" + links;
    var webLink = "<a href='" + finallink + "' id=\"profile_links\" class=\"card-link\">Portfolio Link</a>"
    document.getElementById("profile_links").innerHTML = webLink;
}

function btn_edit() {
    document.getElementById("in_profile_edit_email").value = email;
    document.getElementById("in_profile_edit_email").readOnly = true;
    edit_edu.value = edu;
    edit_links.value = links;
    edit_contact.value = contact;
    edit_desc.value = desc;
    edit_skills.value = skills;
}

function btn_finish_edit() {
    edu = edit_edu.value;
    links = edit_links.value;
    contact = edit_contact.value;
    desc = edit_desc.value;
    skills = edit_skills.value;

    populate_profile();

}

function btn_passChange() {
    var currentPass = in_profile_currentPass.value;
    var newPass = in_profile_newPass.value;
    var confirmPass = in_profile_confirmPass.value;

    if (newPass != confirmPass) {
        alert(currentPass);
        alert(newPass);
        alert(confirmPass);
        return;
    }
    alert("equal");

    fetch(urlChangePass, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    "email": email,
                    "oldPass": currentPass,
                    "newPass": verifyPass
                })

            }).then(function(res) {
                console.log("Inside res function");
                if (res.ok) {
                    res.json().then(function(data) {
                        alert(data.message);
                        console.log("Inside res.ok");
                    }.bind(this));
                }
                else {
                    alert("Error: Change password unsuccessful!");
                    res.json().then(function(data) {
                    console.log(data.message);
                    }.bind(this));
                }
            }).catch(function(err) {
                alert("Error: No internet connection!");
                console.log(err.message + ": No Internet Connection");
        });

}
