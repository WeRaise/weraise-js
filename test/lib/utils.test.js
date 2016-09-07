"use strict";

/*
 * Unit tests for weraise.js utility class
 */

/* globals utils */

describe("utils", function() {

  beforeEach(function() {
  });

  // utils.queryString
  it("should construct a querystring from a dictionary", function() {
    var qs = utils.queryString({
      firstName: "Daniel", lastName: "Jones"
    });
    expect(qs).toEqual("firstName=Daniel&lastName=Jones");
  });

  it("should create an empty string when given an empty dictionary", function() {
    var qs = utils.queryString({});
    expect(qs).toEqual("");
  });

  it("should not output key-values when value is undefined", function() {
    var qs = utils.queryString({
      firstName: "Daniel", secondName: undefined
    });
    expect(qs).toEqual("firstName=Daniel");
  });

  it("should URI encode inputs", function() {
    var qs = utils.queryString({
      homepage: "https://weraiseapp.com", secondName: undefined
    });
    expect(qs).toEqual("homepage=https%3A%2F%2Fweraiseapp.com");
  });

  it("should output escaped csv when arrays are given", function() {
    var qs = utils.queryString({
      daysOfWeek: ["Monday", "Wednesday", "Friday"]
    });
    expect(qs).toEqual("daysOfWeek=Monday%2CWednesday%2CFriday");
  });

  // utils.constructUrl
  it("should output url", function() {
    var url = utils.constructUrl(
      "http://admin.weraiseapp.com",
      ["auth", "complete"],
      {token: "specialAuthorisationToken"}
    );
    expect(url).toEqual("http://admin.weraiseapp.com/auth/complete?token=specialAuthorisationToken");
  });

  it("should not give querystring at all if none given", function() {
    var url = utils.constructUrl(
      "http://admin.weraiseapp.com",
      ["auth", "complete"]
    );
    expect(url).toEqual("http://admin.weraiseapp.com/auth/complete");
  });

  it("should not give querystring at all if empty dict given", function() {
    var url = utils.constructUrl(
      "http://admin.weraiseapp.com",
      ["auth", "complete"],
      {}
    );
    expect(url).toEqual("http://admin.weraiseapp.com/auth/complete");
  });

  it("should give correct url even with trailing / in base url", function() {
    var url = utils.constructUrl(
      "http://admin.weraiseapp.com/",
      ["auth", "complete"],
      {token: "specialAuthorisationToken"}
    );
    expect(url).toEqual("http://admin.weraiseapp.com/auth/complete?token=specialAuthorisationToken");
  });

});
