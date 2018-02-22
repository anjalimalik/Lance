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

function btn_register_continue () {
    var email = in_register_email.value;
    var pass = in_register_pass.value;
    var fName = in_register_fName.value;
    var lName = in_register_lName.checked;


    if (!verifyEmail(email)) {
        return;
    }
    else {
        $('#myModal2').modal('hide');
        $("#myModal3").modal();
    }

//setAttribute("data-target", "myModal3")

}

function verifyEmail(_email) {

    var idx = _email.indexOf("@purdue.edu");
    if (idx == -1 || idx != _email.length-11 || idx == 0){
        document.getElementById("emailFeedback").value = "Invalid Email";
        return false;
    }

    document.getElementById("emailFeedback").visibility = "visible";

    return true;

}
