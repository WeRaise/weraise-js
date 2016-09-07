"use strict";

/*
 * Unit tests for weraise.js library
 */

/* globals wrClientSideAuth */

describe("wrClientSideAuth", function() {
  var mockWindow = {location: {href: ""}};
  var mockAuth;
  var initialConfig = {
    authOptions: {
      scope: ["user", "reward"]
    },
    client: {
      id: "_AI_WR-cILYr58V.9176893222a4479712e80f443edd066f4a78ec6bd6d8c422cc6d78124e1c2339",
      redirect_uri: "http://localhost:9000/#/auth/complete"
    },
    tokenType: "Bearer",
    token: "specialAuthToken"
  };

  beforeEach(function() {
    jasmine.Ajax.install();
    mockAuth = new wrClientSideAuth(
      "http://localhost:8001/", mockWindow, initialConfig.authOptions, initialConfig.client);
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  // auth.start
  it("should construct a url from the config options", function() {
    mockAuth.start();
    expect(mockWindow.location.href).toEqual(
      "http://localhost:8001/oauth/authorize?scope=user%2Creward&grant_type=implicit&access_type=online&client_id=" + encodeURIComponent(initialConfig.client.id) + "&redirect_uri=" + encodeURIComponent(initialConfig.client.redirect_uri));
  });

  // auth.configure
  it("should change the scope via the configure call", function() {
    mockAuth.configure({scope: ["merchant"]}, undefined, undefined, "wr1");
    mockAuth.start();
    expect(mockWindow.location.href).toEqual(
      "http://localhost:8001/oauth/authorize?scope=merchant&grant_type=implicit&access_type=online&client_id=" + encodeURIComponent(initialConfig.client.id) + "&redirect_uri=" + encodeURIComponent(initialConfig.client.redirect_uri));
  });

  // auth.check
  it("should run error function if no auth token is in the cache", function() {
    // Clear the token
    window.sessionStorage.removeItem("wrClientSideAuth-token");

    // Spy on the error function
    spyOn(mockAuth, "error");

    // Spy on success callback and run the auth check
    var fakeSuccess = jasmine.createSpy('fakeSuccess');
    mockAuth.check(fakeSuccess);

    // Expect
    expect(fakeSuccess).not.toHaveBeenCalled();
    expect(mockAuth.error).toHaveBeenCalledWith("No saved auth data");
  });

  it("should run error function if no token type is in the cache", function() {
    // Clear the token
    window.sessionStorage.removeItem("wrClientSideAuth-tokenType");

    // Spy on the error function
    spyOn(mockAuth, "error");

    // Spy on success callback and run the auth check
    var fakeSuccess = jasmine.createSpy('fakeSuccess');
    mockAuth.check(fakeSuccess);

    // Expect
    expect(fakeSuccess).not.toHaveBeenCalled();
    expect(mockAuth.error).toHaveBeenCalledWith("No saved auth data");
  });

  it("should run success callback if authorisation succesfull", function() {
    // Imagine we just succesfully authorised
    var success = mockAuth.complete(initialConfig.token, initialConfig.tokenType);

    // Spy on the error function
    spyOn(mockAuth, "error");

    // We respond to user/role request with success!
    jasmine.Ajax
      .stubRequest('http://localhost:8001/api/user/role')
      .andReturn({
        status: 200,
        contentType: "application/json",
        response: "{ \"UserRole\": {} }"
      });

    // Spy on success callback and run the auth check
    var fakeSuccess = jasmine.createSpy('fakeSuccess');
    mockAuth.check(fakeSuccess);

    // Expect
    expect(fakeSuccess).toHaveBeenCalled();
    expect(mockAuth.error).not.toHaveBeenCalled();
  });

  // auth.complete
  it("should return false if token undefined", function() {
    var success = mockAuth.complete(undefined, "Bearer");
    expect(success).toEqual(false);
  });

  it("should return false if tokenType undefined", function() {
    var success = mockAuth.complete(initialConfig.token, undefined);
    expect(success).toEqual(false);
  });

  it("should return true if valid token, tokenType and expiresIn is given", function() {
    var success = mockAuth.complete(initialConfig.token, initialConfig.tokenType);
    expect(success).toEqual(true);
  });

  it("should save authentication details to the store", function() {
    var complete = mockAuth.complete(initialConfig.token, initialConfig.tokenType);

    var storedToken = window.sessionStorage.getItem("wrClientSideAuth-token");
    expect(storedToken).toEqual(JSON.stringify(initialConfig.token));

    var storedTokenType = window.sessionStorage.getItem("wrClientSideAuth-tokenType");
    expect(storedTokenType).toEqual(JSON.stringify(initialConfig.tokenType));
  });

  // auth.error
  it("should run our saveStateFn", function() {
    // We want to check if auth.start is run
    spyOn(mockAuth, "start");

    // Create a spy for the saveStateFn
    var mockSaveStateFn = jasmine.createSpy('mockSaveStateFn');
    mockAuth.configure(undefined, undefined, mockSaveStateFn, undefined);

    // Create an error
    mockAuth.error("Oh no, something is wrong");

    // Expect
    expect(mockSaveStateFn).toHaveBeenCalled();
    expect(mockAuth.start).not.toHaveBeenCalled();
  });

  // auth.roles
  it("should make call to user/role API endpoint", function() {
    // Clear any fetched roles
    window.sessionStorage.removeItem("wrClientSideAuth-roles");
    // Imagine we just completed auth
    mockAuth.complete(initialConfig.token, initialConfig.tokenType);

    // Spy on calls to the error function
    spyOn(mockAuth, "error");

    // We respond with success!
    jasmine.Ajax
      .stubRequest('http://localhost:8001/api/user/role')
      .andReturn({
        status: 200,
        contentType: "application/json",
        response: "{ \"UserRole\": {} }"
      });

    // Initialise XHR object and start spying
    // Make  roles request
    var fakeSuccess = jasmine.createSpy('fakeSuccess');
    mockAuth.roles(fakeSuccess);

    // Expect
    expect(fakeSuccess).toHaveBeenCalled();
    expect(mockAuth.error).not.toHaveBeenCalled();
  });

  it("should make call to error handler if unauthenticated", function() {
    // Clear any fetched roles
    window.sessionStorage.removeItem("wrClientSideAuth-roles");
    // Imagine we just completed auth
    window.sessionStorage.removeItem("wrClientSideAuth-token");
    window.sessionStorage.removeItem("wrClientSideAuth-tokenType");

    // Spy on calls to the error function
    spyOn(mockAuth, "error");

    // Make roles request
    var fakeSuccess= jasmine.createSpy('fakeSuccess');
    mockAuth.roles(fakeSuccess);

    // Expect
    expect(fakeSuccess).not.toHaveBeenCalled();
    expect(mockAuth.error).toHaveBeenCalledWith("No saved auth data");
  });

  it("should make call to error handler if token has expired/invalid", function() {
    // Clear any fetched roles
    window.sessionStorage.removeItem("wrClientSideAuth-roles");
    // Imagine we just completed auth
    mockAuth.complete(initialConfig.token, initialConfig.tokenType);

    // Spy on calls to the error function
    spyOn(mockAuth, "error");

    // We respond with an auth error
    jasmine.Ajax
      .stubRequest('http://localhost:8001/api/user/role')
      .andReturn({status: 401});

    // Initialise XHR object and start spying
    // Make  roles request
    var fakeSuccess= jasmine.createSpy('fakeSuccess');
    mockAuth.roles(fakeSuccess);

    // Expect
    expect(fakeSuccess).not.toHaveBeenCalled();
    expect(mockAuth.error).toHaveBeenCalledWith("Invalid token");
  });

  // auth.request
  it("should wrap the request with our authentication details", function() {
    // Imagine we just completed auth
    mockAuth.complete(initialConfig.token, initialConfig.tokenType);

    // Start our XHR request, spy on request header changes
    var xhr = new XMLHttpRequest();
    spyOn(xhr, "setRequestHeader");

    // Add auth to xhr request
    xhr = mockAuth.request(xhr);

    // Expect auth headers
    expect(xhr.setRequestHeader).toHaveBeenCalledWith(
      "X-WeRaiseApp-AppId", initialConfig.client.id);
    expect(xhr.setRequestHeader).toHaveBeenCalledWith(
      "authorization", initialConfig.tokenType + " " + initialConfig.token);
  });

  it("should call the error function if auth data is not there", function() {
    // Ensure auth store is empty, as if we never authenticated
    window.sessionStorage.removeItem("wrClientSideAuth-token");
    window.sessionStorage.removeItem("wrClientSideAuth-tokenType");

    // Spy on calls to the error function
    spyOn(mockAuth, "error");

    // Start our XHR request, spy on request header changes
    var xhr = new XMLHttpRequest();
    spyOn(xhr, "setRequestHeader");

    // Try adding auth to xhr request
    xhr = mockAuth.request(xhr);
    // We expect an error
    expect(mockAuth.error).toHaveBeenCalledWith("No saved auth data");
  });
});
