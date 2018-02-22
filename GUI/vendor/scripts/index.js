var users = {
    'user1234@purdue.edu': 'Password',
    'john2@purdue.edu': 'john2',
    'shengqi8@purdue.edu': 'cocoabutter',
    'juju-smith@purdue.edu': 'apple',
    'tombrady12@purdue.edu': 'banana',
    'gronk87@purdue.edu': 'spike',

}
function btn_login() {
    var _email = email.value;
    var _pass = pws.value;

    if (users[_email] && _pass === users[_email])
        alert("Successful login, you will be redirected");
    else
        alert("Invalid Email and/or Username");
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


    if (verifyEmail(_email)) {
        users[_email] = _pass;


        fetch("http://localhost:5500/auth/signin", {
					method: "POST",
					headers: {
						'Accept': 'application/json',
			   			'content-type': 'application/json'
			  		},
					body: JSON.stringify({

						"userID":_email,
					 	"password":_pass,
					})

				}).then(function(res) {

			        if (res.ok) {
			            res.json().then(function(data) {

			            	sessionStorage.setItem("signedIn", "true");
							this.authToken = data.authToken;

							console.log(this.authToken);

							location.reload(true);
			            }.bind(this));
			        }
			        else {
			            res.json().then(function(data) {

			            	createAlert(data.message);
			            }.bind(this));
			        }
			    }).catch(function(err) {

			    	createAlert(err.message + ": No Internet Connection");
			    }.bind(this));
			},



        alert("User added successfully");
    }

}

function verifyEmail(_email) {
    if (users[_email]) {
        alert("This email is already registered!");
        return false;
    }
    var idx = _email.indexOf("@purdue.edu");
    if (idx == -1 || idx != _email.length-11 || idx == 0){
        alert("Must be a valid Purdue Email!");
        return false;
    }
    return true;

}
