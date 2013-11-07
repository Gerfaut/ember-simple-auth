/*global CryptoJS*/

Ember.SimpleWsseAuth = {};
Ember.SimpleWsseAuth.BuildXWsseHeader = function(session) {
    var username = session.get('username');
    var passwordEncoded = session.get('passwordEncoded');
    var nonce = this.GenerateNonce();
    var createdDate = this.GenerateCreatedDate();
    var passwordDigest = this.GeneratePasswordDigest(nonce, createdDate, passwordEncoded);
    return 'UsernameToken Username="' + username + '", PasswordDigest="' + passwordDigest + '", Nonce="' + nonce + '", Created="' + createdDate + '"';
};
Ember.SimpleWsseAuth.GenerateNonce = function() {
    var nonce = Math.random().toString(36).substring(2);
    return CryptoJS.enc.Utf8.parse(nonce).toString(CryptoJS.enc.Base64);
};
Ember.SimpleWsseAuth.GeneratePasswordDigest = function(nonce, createdDate, passwordEncoded) {
    var nonce_64 = CryptoJS.enc.Base64.parse(nonce);
    var _sha1 = CryptoJS.SHA1(nonce_64.concat(CryptoJS.enc.Utf8.parse(createdDate).concat(CryptoJS.enc.Utf8.parse(passwordEncoded))));
    var result = _sha1.toString(CryptoJS.enc.Base64);
    return result;
    //return CryptoJS.SHA1(CryptoJS.enc.Base64.parse(nonce) + createdDate + passwordEncoded).toString(CryptoJS.enc.Base64);
};
Ember.SimpleWsseAuth.EncodePassword = function(password, salt) {
    var salted = password + '{' + salt + '}';
    var passwordEncoded = CryptoJS.SHA512(salted);
    for(var i = 1; i < this.passwordEncodingIterations; i++) { //TODO use webworker
	passwordEncoded = CryptoJS.SHA512(passwordEncoded.concat(CryptoJS.enc.Utf8.parse(salted)));
    }
    return this.passwordEncodingAsBase64 ? passwordEncoded.toString(CryptoJS.enc.Base64) : passwordEncoded;
};
Ember.SimpleWsseAuth.GenerateCreatedDate = function() {
    return new Date().toISOString();
};
Ember.SimpleWsseAuth.setup = function(app, options) {
  options = options || {};
  this.routeAfterLogin = options.routeAfterLogin || 'index';
  this.routeAfterLogout = options.routeAfterLogout || 'index';
  this.loginRoute = options.loginRoute || 'login';
  this.logoutRoute = options.logoutRoute || 'logout';
  this.serverSaltRoute = options.serverSaltRoute || '/salt/{username}';
  this.serverCheckAccessRoute = options.serverCheckAccessRoute || '/check-access';
  this.passwordEncodingIterations = options.passwordEncodingIterations || 5000;
  this.passwordEncodingAsBase64 = options.passwordEncodingAsBase64 === 'false' ? false : true;

  var session = Ember.SimpleWsseAuth.Session.create();
  app.register('simple_wsse_auth:session', session, { instantiate: false, singleton: true });
  
  Ember.$.each(['model', 'controller', 'view', 'route'], function(i, component) {
    app.inject(component, 'session', 'simple_wsse_auth:session');
  });

  Ember.$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
    if (!jqXHR.crossDomain && session.get('isAuthValid')) {
      jqXHR.setRequestHeader('Authorization',  'Authorization profile="UsernameToken"');
      jqXHR.setRequestHeader('X-WSSE',  Ember.SimpleWsseAuth.BuildXWsseHeader(session));
    }
  });
};
