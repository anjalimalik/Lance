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
