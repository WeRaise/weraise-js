/* globals
     wrStore,
     utils */

// WeRaise OAuth2 Client                                                      //
// -------------------------------------------------------------------------- //
var wrClientSideAuth = function(
    providerUrl,
    authOptions,
    client,
    saveStateFn,
    domNamespace
  ) {
  "use strict";

  // Required Parameters ---------------------------------------------------- //
  if (providerUrl === undefined) {
    throw {
      error: "missing_parameter",
      message: "providerUrl: You must give a provider URL"
    };
  }

  // Private Members -------------------------------------------------------- //
  var store = new wrStore("wrClientSideAuth");
  var application, namespace;
  var options = {};

  /**
   * Setup the library with configuration options
   * @param {Object} clientDetails
   */
  function configure(authOptions, client, newSaveStateFn, domNamespace) {
    application = client || store.get("application") || {};
    store.set("application", application);

    namespace = domNamespace || namespace || "wr";
    saveStateFn = newSaveStateFn || saveStateFn || undefined;

    // Setup some default options and override if available
    var defaultOptions = {
      scope: [],
      grant_type: "implicit",
      access_type: "online"
    };
    if (authOptions === undefined || authOptions === null) {
      authOptions = {};
    }
    options = {
      scope: authOptions.scope || options.scope || defaultOptions.scope,
      grant_type: authOptions.grant_type || options.grant_type ||
        defaultOptions.grant_type,
      response_type: authOptions.response_type || options.response_type ||
        defaultOptions.response_type,
      access_type: authOptions.access_type || options.access_type ||
        defaultOptions.access_type
    };
  }
  configure(authOptions, client, saveStateFn, domNamespace);

  /**
   * Generate an options object from default options, application information,
   * and request specific options (requestOptions). In that order of priority.
   * @param {Object} requestOptions Options to be used for this request only
   * @returns {Object} generatedOptions
   */
  function generateOptions(requestOptions) {
    // Use default/constructor options as starting point
    var generatedOptions = options;
    // Add in application details
    generatedOptions.client_id = application.id;
    generatedOptions.redirect_uri = application.redirect_uri;
    // Var user override on per-request basis
    if (requestOptions !== undefined && requestOptions !== null) {
        Object.keys(requestOptions).forEach(function(key) {
            generatedOptions[key] = requestOptions[key];
        });
    }
    return generatedOptions;
  }

  /**
   * Adds a full page div which darkens the screen
   * @returns {}
   */
  function getUserRole(token, appId, cb) {
    var xhr = new XMLHttpRequest();

    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", cb);

    xhr.open("GET", utils.constructUrl(providerUrl, ["api", "user"]));
    xhr.setRequestHeader("X-WeRaiseApp-AppId", store.get("application").id);
    xhr.setRequestHeader("authorization", "Bearer " + token);
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("cache-control", "no-cache");

    xhr.send();
  }

  /**
   * Initiate the authorization process
   * @param {Array} requestOptions List of requesting scopes
   */
  function start(requestOptions) {
    var options = generateOptions(requestOptions);
    var url = utils.constructUrl(providerUrl, ["oauth", "authorize"], options);
    window.location.href = url;
  }

  function error(error) {
    // Notify the user application if possible
    if (saveStateFn instanceof Function) {
      saveStateFn(function() {
        start();
      });
    } else {
      start();
    }
  }

  function check(success) {
    var token = store.get("token");
    var tokenType = store.get("tokenType");
    var expiresAt = store.get("expiresAt");

    var allDefined = token !== null && tokenType !== null && expiresAt !== null;
    if (!allDefined) { error("No saved auth data"); return; }

    var expired = (new Date() > expiresAt);
    if (expired) { error("Token Expired"); return; }

    // At this point, we need to check validity of token with server
    // - we do this by fetching the user role
    getUserRole(token, function() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          success();
        } else {
          error("Invalid token");
        }
      }
    });
    return;
  }

  /**
  * Initiate the authorization process
  * @param {Array} requestedScope List of requesting scopes
  */
  function complete(token, tokenType, expiresIn) {
    // We need to save token etc to local storage
    store.set("token", token);
    store.set("tokenType", tokenType);
    // Figure out the expiry time of the token
    var currentTime = new Date();
    var expiresAt = currentTime.setSeconds(currentTime.getSeconds() + expiresIn);
    store.set("expiresAt", expiresAt);
  }

  // Public Members --------------------------------------------------------- //
  return {
    configure: configure,
    start: start,
    check: check,
    complete: complete,
    error: error
  };
};
