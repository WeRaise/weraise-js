/* globals
     wrClientSideAuth,
     utils */

// WeRaise library                                                            //
// -------------------------------------------------------------------------- //
var weraise = (function() {
  "use strict";

  var baseUrl,
      auth,
      exports = {};


  // Constructor ------------------------------------------------------------ //
  baseUrl = "http://localhost:8001/";
  exports.auth = new wrClientSideAuth(baseUrl, window);

  function configure(saveStateFn, clientDetails, cb) {
    exports.auth.configure(
      {}, // authOptions
      clientDetails, // client
      saveStateFn, // saveStateFn
      undefined // domNamespace
    );
    exports.auth.check(
      // On auth success, we need to complete library configuration
      function() {
        getResources(function(r) { exports.resources = r; cb(); });
      }
    );
  }

  // Public Members --------------------------------------------------------- //
  exports.configure = configure;
  return exports;
})();

// Exports ------------------------------------------------------------------ //
// We need to export the library carefully for both browser and node
if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = weraise;
  }
  exports.weraise = weraise;
} else {
  window.weraise = weraise;
}
