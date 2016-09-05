/* globals
     wrStore,
     utils */

// WeRaise OAuth2 Client                                                      //
// -------------------------------------------------------------------------- //
function wrClientSideAuth(
    providerUrl,
    window,
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
  if (window === undefined) {
    throw {
      error: "missing_parameter",
      message: "window: You must give the window object"
    };
  }

  // Private Members -------------------------------------------------------- //
  var store = new wrStore("wrClientSideAuth");
  var application, namespace;
  var options = {};

  /**
   * Generate an options object from default options, application information,
   * and request specific options (requestOptions). In that order of priority.
   * @param {Object} requestOptions Options to be used for this request only
   * @returns {Object} generatedOptions
   */
  var generateOptions = function(requestOptions) {
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
  };

  // Public Members --------------------------------------------------------- //

  /**
   * Setup the library with configuration options
   * @param {Object} clientDetails
   */
  this.configure = function(authOptions, client, newSaveStateFn, domNamespace) {
    application = client || store.get("application") || {};
    store.set("application", application);

    namespace = domNamespace || namespace || "wr";
    saveStateFn = newSaveStateFn || saveStateFn || undefined;

    // Setup some default options and override if available
    var defaultOptions = {
      scope: ["user", "reward", "merchant", "store"],
      grant_type: "implicit",
      access_type: "online"
    };
    if (authOptions === undefined || authOptions === null) {
      authOptions = {};
    }
    options = {
      scope:
        authOptions.scope ||
        options.scope ||
        defaultOptions.scope,
      grant_type:
        authOptions.grant_type ||
        options.grant_type ||
        defaultOptions.grant_type,
      response_type:
        authOptions.response_type ||
        options.response_type ||
        defaultOptions.response_type,
      access_type:
        authOptions.access_type ||
        options.access_type ||
        defaultOptions.access_type
    };
  };

  // Initial configuration from constructor
  this.configure(authOptions, client, saveStateFn, domNamespace);

  /**
   * Initiate the authorization process
   * @param {Array} requestOptions List of requesting scopes
   */
  this.start = function(requestOptions) {
    var options = generateOptions(requestOptions);
    var url = utils.constructUrl(providerUrl, ["oauth", "authorize"], options);
    window.location.href = url;
  };

  /**
   * Handles any authorisation errors. Will call saveStateFn before redirecting page
   * @param {} error
   */
  this.error = function(error) {
    // TODO: Call user/role and update
    //        -> Trigger UI update as well
    //       Give a message to user
    // Notify the user application if possible
    if (saveStateFn instanceof Function) {
      saveStateFn(function() {
        this.start();
      });
    } else {
      this.start();
    }
  };

  /**
   * Add authorization headers to an XHR request.
   *   - Will throw exceptions in the case of bad arguments.
   *   - Will initiate the authorization process if need be.
   * @param {XMLHttpRequest} xhr
   */
  this.request = function(xhr) {
    if (xhr === undefined || xhr === null) {
      throw "XHR parameter missing";
    }

    var token = store.get("token");
    var tokenType = store.get("tokenType");
    var application = store.get("application");

    var allDefined = token !== null && tokenType !== null && application !== null;
    if (!allDefined) { this.error("No saved auth data"); return; }

    xhr.setRequestHeader("X-WeRaiseApp-AppId", application.id);
    xhr.setRequestHeader("authorization", tokenType + " " + token);

    // TODO: wrap the callback with an auth error catcher
    return xhr;
  };

  /**
   * Fetch user roles from the API
   * @param {} token
   * @param {} appId
   * @param {Function} success Callback run on success (optional)
   */
  this.roles = function(success) {
    if (store.get("roles") !== null) {
      success(store.get("roles"));
      return;
    }

    var xhr = new XMLHttpRequest();

    xhr.withCredentials = false;

    var _this = this;
    xhr.addEventListener("readystatechange", function() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          if (success instanceof Function) {
            var parsedResponse = JSON.parse(this.response);
            store.set("roles", parsedResponse.UserRole);
            success(parsedResponse.UserRole);
          } // if not, we do nothing
        } else {
          _this.error("Invalid token");
        }
      }
    });

    xhr.open("GET", utils.constructUrl(providerUrl, ["api", "user", "role"]));
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("cache-control", "no-cache");

    xhr = this.request(xhr);
    if (xhr === undefined) { return; }

    xhr.send();
  };

  /**
   * Check if we are authorised. If not, will initiate the authorisation process
   * @param {} success
   */
  this.check = function(success) {
    var token = store.get("token");
    var tokenType = store.get("tokenType");

    var allDefined = token !== null && tokenType !== null;
    if (!allDefined) { this.error("No saved auth data"); return; }

    // At this point, we need to check validity of token with server
    // - we do this by fetching the user role
    this.roles(function(userRoles) {
      if (success instanceof Function) {
        success(); // in this case the caller doesn't care about user roles
      }
    });
    return;
  };

  /**
   * Check if the authorization process was successfull, and cache auth token
   * @param {} token
   * @param {} tokenType
   * @returns {}
   */
  this.complete = function(token, tokenType) {
    // If all variables are defined, we can assume it was a success
    if (token !== undefined && tokenType !== undefined) {
      // We need to save token etc to local storage
      store.set("token", token);
      store.set("tokenType", tokenType);
      return true;
    } else {
      return false;
    }
  };

  return this;
}

