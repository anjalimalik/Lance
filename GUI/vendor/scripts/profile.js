
var email, pass, fName, lName, edu, skills, desc, contact, links, pic, docs;

function body_onload() {

    edu = localStorage.getItem('edu');
    links = localStorage.getItem('links');
    contact = localStorage.getItem('contact');
    desc = localStorage.getItem('desc');
    skills = localStorage.getItem('skills');

    document.getElementById("profile_edu").innerHTML = edu;
    document.getElementById("profile_contact").innerHTML = contact;
    document.getElementById("profile_desc").innerHTML = desc;
    document.getElementById("profile_skills").innerHTML = skills;

    links = "https://" + links;
    var webLink = "<a href='" + links + "' id=\"profile_links\" class=\"card-link\">Link</a>"
    document.getElementById("profile_links").innerHTML = webLink;

}
