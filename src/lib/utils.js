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
    var encodedList = Object.keys(queryObject).map(function(key) {
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
    if (path) {
      url += path.join("/");
    }
    if (queryObject) {
      url += "?" + exports.queryString(queryObject);
    }
    return url;
  };

  return exports;
})();
