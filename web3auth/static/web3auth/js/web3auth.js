"use strict";

/**
 * Example JavaScript code that interacts with the page and Web3 wallets
 */

 // Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const Fortmatic = window.Fortmatic;
const evmChains = window.evmChains;
const CoinbaseWalletSDK = window.CoinbaseWalletSDK;

// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;


// Address of the selected account
let selectedAccount;


/**
 * Setup the orchestra
 */
function init() {

  console.log("Initializing example");
  console.log("WalletConnectProvider is", WalletConnectProvider);
  console.log("Fortmatic is", Fortmatic);
  console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);

  // Tell Web3modal what providers we have available.
  // Built-in web browser provider (only one can exist as a time)
  // like MetaMask, Brave or Opera is added automatically by Web3modal
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        // Mikko's test key - don't copy as your mileage may vary
        infuraId: "08fa71e3f14f4829b73cee825e658df1",
      }
    },

    coinbasewallet: {
      package: CoinbaseWalletSDK,
      options: {
        // Mikko's TESTNET api key
        infuraId: "08fa71e3f14f4829b73cee825e658df1",
      }
    }
  };

  web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
  });

  console.log("Web3Modal instance is", web3Modal);
}

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
  const web3 = new Web3(provider);
  const chainId = await web3.eth.getChainId();
  const chainData = evmChains.getChain(chainId);
  const accounts = await web3.eth.getAccounts();
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
            var from = await getUserAccount(provider);
            
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
    init();
    try {
      provider = await web3Modal.connect();
    } catch(e) {
      console.log("Could not get a wallet connection", e);
      return;
    }
    await authWeb3(window.AUTH_ENDPOINT, redirect)
};
