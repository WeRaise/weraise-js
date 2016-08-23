/* globals
     wrClientSideAuth,
     utils */

// WeRaise library                                                            //
// -------------------------------------------------------------------------- //
var weraise = (function() {
  "use strict";

  var auth = wrClientSideAuth("http://localhost:8001/");

  // Public Members --------------------------------------------------------- //
  var exports = {
    auth: auth
  };
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
