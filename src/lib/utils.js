// WeRaise Utility Functions                                                  //
// -------------------------------------------------------------------------- //
var utils = (function() {
  "use strict";
  var exports = {};

  /**
   * Construct a URI-safe query string form the given dict to append to url
   * excludes the '?' char.
   * @param {Object} queryObject Input Object (values of type String, Integer or Array)
   * @returns {String} Query String from ? exclusive
   */
  exports.queryString = function(queryObject) {
    var nonEmptyKeys = Object.keys(queryObject).filter(function(key) {
      var value = queryObject[key];
      return value !== undefined && value !== null;
    });
    var encodedList = nonEmptyKeys.map(function(key) {
      var value = queryObject[key];
      if (value instanceof Array) { // for Arrays, we construct a CSV string
        value = queryObject[key].join(",");
      }
      return encodeURIComponent(key) + "=" + encodeURIComponent(value);
    });
    return encodedList.join("&");
  };

  /**
   * Construct a Url from a base, path, and a queryObject
   * @param {String} baseUrl
   * @param {Array} path
   * @param {Object} queryObject Input Object (values of type String, Integer or Array)
   * @returns {String} Url
   */
  exports.constructUrl = function(baseUrl, path, queryObject) {
    var url = baseUrl;
    // Remove trailing "/" from baseUrl if it exists
    if (baseUrl.substring(url.length - 1, url.length) === "/") {
      url = url.substring(0, url.length - 1);
    }
    // Construct path and add it (if one exists)
    if (path) {
      url += "/" + path.join("/");
    }
    // Generate and add queryString (if needed)
    if (queryObject) {
      var qs = exports.queryString(queryObject);
      if (qs !== "") { url += "?" + qs; }
    }
    return url;
  };

  exports.capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return exports;
})();
