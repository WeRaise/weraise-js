"use strict";

/*
 * Unit tests for weraise.js library
 */

/* globals wrClientSideAuth */

describe("wrClientSideAuth", function() {

  it("should show login box on auth flow start", function() {
    var auth = wrClientSideAuth("http://localhost:8001/");
    auth.setClient({
      id: "_AI_WR-cILYr58V.9176893222a4479712e80f443edd066f4a78ec6bd6d8c422cc6d78124e1c2339",
      redirect_uri: "https://dev.weraiseapp.com"
    });
    var authFrame = auth.start({
      scope: ["user", "reward"],
      return_type: "JSON"
    });
    expect(document.getElementById("wr-authframe")).toBeDefined();
    expect(document.getElementById("wr-authframe")).toBe(authFrame);
  });

});
