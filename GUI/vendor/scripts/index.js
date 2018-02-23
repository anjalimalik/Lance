var url = "http://localhost:5500/login";
var authToken;
var email;

//LOGIN

function btn_login() {
    var _email = loginEmail.value;
    var _pass = pws.value;

        fetch(url, {
					method: "POST",
                    headers: {
        				'Accept': 'application/json',
        	   			'content-type': 'application/json'
        	  		},
                    body: JSON.stringify({
        				"email":_email,
        			 	"pass":_pass,
        			})

				}).then(function(res) {

			        if (res.ok) {
			            res.json().then(function(data) {

                            this.authToken = data.authToken
                            this.email = _email;
                            

			            }.bind(this));
			        }
			        else {
			            res.json().then(function(data) {

			            	createAlert(data.message);
			            }.bind(this));
			        }
			    }).catch(function(err) {

			    	createAlert(err.message + ": No Internet Connection");
			    });


}

function btn_register() {
    var _email = inputEmail.value;
    var _pass = inputPws.value;
    var _cpass = inputConfirmPws.value;
    var _agree = ch.checked;

    if (!_agree) {
        alert("Must agree to the terms and conditions!");
        return;
    }

    if (_pass !== _cpass || _pass.length == 0) {
        alert("The two passwords do not match, try again!");
        return;
    }

    var verified = false;
    if (verifyEmail(_email)) {
        users[_email] = _pass;
        verified = true;
    }
    if (verified) {

        fetch(url, {
			method: "POST",
			headers: {
				'Accept': 'application/json',
	   			'content-type': 'application/json'
	  		},
			body: JSON.stringify({
                "name": "userName123",
				"email":_email,
			 	"pass":_pass,
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

		            	createAlert(data.message);
                        alert(data.authToken);
		            }.bind(this));
		        }
		    }).catch(function(err) {

		    	createAlert(err.message + ": No Internet Connection");
		    }.bind(this));

        }
    }



function verifyEmail(_email) {
    
    var idx = _email.indexOf("@purdue.edu");
    if (idx == -1 || idx != _email.length-11 || idx == 0){
        document.getElementById("emailFeedback").style.visibility = "visible";
        return false;
    }
    return true;

}
