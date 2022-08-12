export function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function loginWithSignature(address, signature, authUrl, redirect) {
    var request = new XMLHttpRequest();
    request.open('POST', authUrl, true);
    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var resp = JSON.parse(request.responseText);
            if (resp.success) {
                if (redirect) {
                    var redirectUrl = resp.redirect_url;
                    window.location.replace(redirectUrl);
                }
            } else {
                console.log(resp)
            }
        } else {
            // We reached our target server, but it returned an error
            console.log(resp)
        }
    };

    request.onerror = function () {
        console.log("Autologin failed - there was an error");
        if (typeof onLoginRequestError == 'function') {
            onLoginRequestError(request);
        }
        // There was a connection error of some sort
    };
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    var formData = 'address=' + address + '&signature=' + signature;
    request.send(formData);
}


export async function getUserAccount(){
    const provider = window.ethereum
    const accounts = await provider.request(
        {
            method: 'eth_requestAccounts'
        }
    );
    return accounts[0];
}

function asciiToHex (str) {
    if(!str)
        return "0x00";
    var hex = "";
    for(var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        var n = code.toString(16);
        hex += n.length < 2 ? '0' + n : n;
    }
    return "0x" + hex;
};

export async function authWeb3(authUrl, redirect = true) {
    // used in loginWithSignature

    // 1. Retrieve arbitrary login token from server
    // 2. Sign it using web3
    // 3. Send signed message & your eth address to server
    // 4. If server validates that you signature is valid
    // 4.1 The user with an according eth address is found - you are logged in
    // 4.2 The user with an according eth address is NOT found - you are redirected to signup page


    var request = new XMLHttpRequest();
    request.open('GET', authUrl, true);

    request.onload = async function () {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var resp = JSON.parse(request.responseText);
            var token = resp.token;
            var hex_token = asciiToHex(token);
            var from = await getUserAccount();
            const provider = window.ethereum;
            provider.request(
                {
                    method: 'personal_sign',
                    params: [
                        from, hex_token
                    ]
            })
            .then((result) => {
                loginWithSignature(from, result, authUrl, redirect);
            })
            .catch((error) => {
                console.log(error);
            });
        } else {
            // We reached our target server, but it returned an error
            console.log("Autologin failed - request status " + request.status);
        }
    };
    request.onerror = function () {
        // There was a connection error of some sort
        console.log("Autologin failed - there was an error");
    };
    request.send();
}

export async function connectWallet (redirect = true) {
    await authWeb3(window.AUTH_ENDPOINT, redirect)
};
