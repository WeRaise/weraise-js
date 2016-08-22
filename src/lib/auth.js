/* globals
     utils */

// WeRaise OAuth2 Client                                                      //
// -------------------------------------------------------------------------- //
var wrClientSideAuth = function(
    providerUrl,
    domNamespace,
    authOptions,
    client
  ) {
  "use strict";

  // Private Members -------------------------------------------------------- //
  var application = client || {};
  var namespace = domNamespace || "wr";

  if (providerUrl === undefined) {
    throw {
      error: "missing_parameter",
      message: "providerUrl: You must give a provider URL"
    };
  }

  // Setup some default options and override if available
  var options = {
    scope: [],
    grant_type: "implicit",
    access_type: "online"
  };
  if (authOptions !== undefined) {
    options = {
      scope: authOptions.scope || options.scope,
      grant_type: authOptions.grant_type || options.grant_type,
      response_type: authOptions.response_type || options.response_type,
      access_type: authOptions.access_type || options.access_type
    };
  }

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
    Object.keys(requestOptions).forEach(function(key) {
      generatedOptions[key] = requestOptions[key];
    });
    return generatedOptions;
  }

  function darkenPage() {
    var darkenElement = document.createElement("div");
    darkenElement.setAttribute("id", namespace + "-darkenpage");

    Object.assign(darkenElement.style, { // TODO: polyfill needed
      position: "fixed",
      top: "0px",
      bottom: "0px",
      left: "0px",
      right: "0px",
      backgroundColor: "#222",
      opacity: "0.3",
      zIndex: "1000"
    });

    document.body.appendChild(darkenElement);
    return darkenElement;
  }

  /**
   * Creates the login iframe, styles it and appends it to the body.
   * @param {String} url
   * @returns {DOMElement} authFrame
   */
  function createLoginElement(url) {
    var authFrame = document.createElement("iframe");
    authFrame.setAttribute("id", namespace + "-authframe");
    authFrame.setAttribute("src", url);

    // Assign styles non-destructively
    Object.assign(authFrame.style, { // TODO: polyfill needed
      position: "fixed",
      top: "20%",
      height: "60%",
      left: "50%",
      marginLeft: "-300px",
      width: "600px",
      maxWidth: "100%",
      boxShadow: "0px 0px 30px 0px #eee",
      border: "none",
      backgroundColor: "#efefef",
      zIndex: "1001"
    });

    document.body.appendChild(authFrame);
    return authFrame;
  }

  // Public Members --------------------------------------------------------- //
  var exports = {};

  /**
   * Setup the library to use the client with the given client identifier
   * @param {String} clientId
   */
  exports.setClient = function(client) {
    application = client;
  };

  /**
  * Initiate the authorization process
  * @param {Array} requestedScope List of requesting scopes
  */
  exports.start = function(requestOptions) {
    var options = generateOptions(requestOptions);
    var url = utils.constructUrl(providerUrl, ["oauth", "authorize"], options);
    darkenPage();
    var loginFrame = createLoginElement(url);
    return loginFrame;
  };

  return exports;
};
