"use strict";

/*
 * Unit tests for weraise.js library
 */

/* globals wrStore */

describe("wrStore", function() {
  var storeInstance;

  beforeEach(function() {
    storeInstance = new wrStore("mainStore");
  });

  it("should namespace storage", function() {
    storeInstance.set("name", "WeRaise");

    var name = window.sessionStorage.getObj("mainStore-name");
    expect(name).toEqual("WeRaise");

    var blank = window.sessionStorage.getObj("name");
    expect(blank).toEqual(null);
  });

  it("should namespace storage to avoid collisions", function() {
    var storeInstance2 = new wrStore("secondStore");

    storeInstance.set("name", "WeRaise");
    storeInstance2.set("name", "TeamFirst");

    var stored1 = storeInstance.get("name");
    var stored2 = storeInstance2.get("name");

    expect(stored1).not.toEqual(stored2);
    expect(stored1).toEqual("WeRaise");
    expect(stored2).toEqual("TeamFirst");
  });

  it("should retain empty dictionaries", function() {
    storeInstance.set("empty", {});
    var empty = storeInstance.get("empty");
    expect(empty).toEqual({});
  });

});
