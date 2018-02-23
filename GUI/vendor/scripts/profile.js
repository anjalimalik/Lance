
var email, pass, name, edu, skills, desc, contact, links, pic, docs;

function body_onload() {

    name = localStorage.getItem('name');
    email = localStorage.getItem('email');
    edu = localStorage.getItem('edu');
    links = localStorage.getItem('links');
    contact = localStorage.getItem('contact');
    desc = localStorage.getItem('desc');
    skills = localStorage.getItem('skills');

    document.getElementById("profile_name").innerHTML = name;
    document.getElementById("profile_email").innerHTML = email;
    document.getElementById("profile_edu").innerHTML = edu;
    document.getElementById("profile_contact").innerHTML = contact;
    document.getElementById("profile_desc").innerHTML = desc;
    document.getElementById("profile_skills").innerHTML = skills;

    links = "https://" + links;
    var webLink = "<a href='" + links + "' id=\"profile_links\" class=\"card-link\">Portfolio Link</a>"
    document.getElementById("profile_links").innerHTML = webLink;

}
