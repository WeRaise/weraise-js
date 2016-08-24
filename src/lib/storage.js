"use strict";

/* globals
     Storage */

// Browser Storage Wrapper
// -------------------------------------------------------------------------- //
var wrStore = function(namespace) {
  // Get and Set on this object, saves to store --------------------------- //
  this.get = function(prop) {
    return window.sessionStorage.getObj(namespace + "-" + prop);
  };
  this.set = function(prop, value) {
    return window.sessionStorage.setObj(namespace + "-" + prop, value);
  };
};

// Extend to Get and Set Objects -------------------------------------------- //
Storage.prototype.setObj = function(key, obj) {
    return this.setItem(key, JSON.stringify(obj));
};
Storage.prototype.getObj = function(key) {
    return JSON.parse(this.getItem(key));
};
