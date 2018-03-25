var urlLogin = "http://localhost:5500/login";
var urlRegister = "http://localhost:5500/signUp"
var urlCreateProfile = "http://localhost:5500/createProfile"
var urlLogout = "http://localhost:5500/logout"
var authToken;
var email, pass, fName, lName, edu, skills, desc, contact, links, pic, docs, name;
var verifyFlag;

//LOGIN
function on_load() {
    document.getElementById("in_login_pass")
        .addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode == 13) {
            document.getElementById("btn_modal_login").click();
        }
    });
}

function btn_login() {
    var _email = in_login_email.value;
    var _pass = in_login_pass.value;

    console.log("Inside btn_login()");
        fetch(urlLogin, {
					method: "POST",
                    headers: {
        				'Accept': 'application/json',
        	   			'content-type': 'application/json'
        	  		},
                    body: JSON.stringify({
        				"email":_email,
        			 	"pass":_pass
        			})

				}).then(function(res) {
                    console.log("Inside res function");
			        if (res.ok) {
			            res.json().then(function(data) {
                            alert("Login successful!");
                            this.authToken = data.authToken
                            this.email = _email;
                            console.log("Inside res.ok");
                            alert("You are successfully logged in!");
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
            window.location.href = 'profile.html';
}



function btn_register_continue() {
    email = in_register_email.value;
    pass = in_register_pass.value;
    fName = in_register_fName.value;
    lName = in_register_lName.value;

    name = fName.trim() + " " + lName.trim();
    //verifyFlag = true  --> means no errors
    //verifyFlag = false --> means errors
    verifyFlag = true;

    verifyEmail(email);
    verifyPass(pass);
    verifyFName(fName);
    verifyLName(lName);

    if (verifyFlag == true) {

        $('#myModal2').modal('hide');
        $("#myModal3").modal('show');


        fetch(urlRegister, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                "email":email,
                "pass":pass,
                "name":name
            })

            }).then(function(res) {

                if (res.ok) {
                    res.json().then(function(data) {
                        sessionStorage.setItem("signedIn", "true");
                    }.bind(this));
                }
                else {
                    res.json().then(function(data) {

                        console.log(data.message);
                        console.log(data.authToken);
                    }.bind(this));
                }
            }).catch(function(err) {

                console.log(err.message + ": No Internet Connection");
            }.bind(this));
    }
    return;
}
function btn_register_finish() {

        edu = in_register_edu.value;
        links = in_register_links.value;
        contact = in_register_contact.value;
        desc = in_register_desc.value;
        skills = in_register_skills.value;
        pic = null;
        docs = null;

        localStorage.setItem('email', email);
        localStorage.setItem('name', name);
        localStorage.setItem('edu', edu);
        localStorage.setItem('links', links);
        localStorage.setItem('contact', contact);
        localStorage.setItem('desc', desc);
        localStorage.setItem('skills', skills);

        window.location.href = "profile.html";

        fetch(urlCreateProfile, {
			method: "POST",
			headers: {
				'Accept': 'application/json',
	   			'content-type': 'application/json'
	  		},
			body: JSON.stringify({
				"email":email,
			 	"name":name,
                "desc":desc,
                "contact":contact,
                "links":links,
                "edu":edu,
                "skills":skills,
                "pic":null,
                "docs":null
			})

			}).then(function(res) {

		        if (res.ok) {
		            res.json().then(function(data) {

		            	sessionStorage.setItem("signedIn", "true");
						location.reload(true);
		            }.bind(this));
		        }
		        else {
		            res.json().then(function(data) {

		            	console.log(data.message);
                        console.log(data.authToken);
		            }.bind(this));
		        }
		    }).catch(function(err) {

		    	console.log(err.message + ": No Internet Connection");
		    }.bind(this));


}

function verifyEmail(_email) {

    var idx = _email.indexOf("@purdue.edu");
    if (idx == -1 || idx != _email.length-11 || idx == 0){
        document.getElementById("emailError").style.display = 'flex';
        verifyFlag = false;
        return false;
    }
    document.getElementById("emailError").style.display = 'none';
    return true;
}
function verifyPass(_pass) {
    if (_pass.length < 4) {
        document.getElementById("passError").style.display = 'flex';
        verifyFlag = false;
        return false;
    }
    document.getElementById("passError").style.display = 'none';
    return true;
}
function verifyFName(_fName) {
    if (_fName.length == 0) {
        document.getElementById("fNameError").style.display = 'flex';
        verifyFlag = false;
        return false;
    }
    document.getElementById("fNameError").style.display = 'none';
    return true;
}
function verifyLName(_lName) {
    if (_lName.length == 0) {
        document.getElementById("lNameError").style.display = 'flex';
        verifyFlag = false;
        return false;
    }
    document.getElementById("lNameError").style.display = 'none';
    return true;
}

function btn_logout() {
    fetch(urlLogout, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    "email":email,
                    "signOut":true
                })

            }).then(function(res) {
                console.log("Inside res function");
                if (res.ok) {
                    res.json().then(function(data) {
                        alert("Logout successful!");
                        //alert(this.authToken);
                    }.bind(this));
                }
                else {
                    alert("Error: Logout unsuccessful!");
                    res.json().then(function(data) {
                    console.log(data.message);
                    }.bind(this));
                }
            }).catch(function(err) {
                alert("Error: No connection to server!");
                console.log(err.message + ": No Internet Connection");
        });
}


///////////CLEARING MODALS///////////

function clearModal1() {
    document.getElementById("in_login_email").value = "";
    document.getElementById("in_login_pass").value = "";
}
function clearModal2() {
    document.getElementById("in_register_email").value = "";
    document.getElementById("in_register_pass").value = "";
    document.getElementById("in_register_fName").value = "";
    document.getElementById("in_register_lName").value = "";

    document.getElementById("emailError").style.display = 'none';
    document.getElementById("passError").style.display = 'none';
    document.getElementById("fNameError").style.display = 'none';
    document.getElementById("lNameError").style.display = 'none';

}
