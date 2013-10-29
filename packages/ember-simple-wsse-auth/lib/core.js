Ember.SimpleWsseAuth = {};
Ember.SimpleWsseAuth.BuildXWsseHeader = function(session) {
    var username = session.get('username');
    var passwordDigest = session.get('passwordDigest');
    var nonce = this.GenerateNonce();
    var createdDate = this.GenerateCreatedDate();
    return "UsernameToken Username=" + username + ", PasswordDigest=" + passwordDigest + ", Nonce=" + nonce + ", Created=" + createdDate;
};
Ember.SimpleWsseAuth.GenerateNonce = function() {
    return CryptoJS.SHA512(Math.random().toString(36).substring(2)).toString();
};
Ember.SimpleWsseAuth.EncodePassword = function(password, salt) {
    var salted = password + '{' + salt + '}';
    var passwordDigest = CryptoJS.SHA512(salted);
    for(var i = 1; i < this.passwordEncodingIterations; i++) { //TODO use webworker
	passwordDigest = CryptoJS.SHA512(passwordDigest.concat(CryptoJS.enc.Utf8.parse(salted)));
    }
    return this.passwordEncodingAsBase64 ? passwordDigest.toString(CryptoJS.enc.Base64) : passwordDigest;
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
  this.passwordEncodingAsBase64 = options.passwordEncodingIterations || true;

  var session = Ember.SimpleWsseAuth.Session.create();
  app.register('simple_wsse_auth:session', session, { instantiate: false, singleton: true });
  
  Ember.$.each(['model', 'controller', 'view', 'route'], function(i, component) {
    app.inject(component, 'session', 'simple_wsse_auth:session');
  });

  Ember.$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
    if (!jqXHR.crossDomain && session.get('isValid')) {
      jqXHR.setRequestHeader('Authorization',  'Authorization profile="UsernameToken"');
      jqXHR.setRequestHeader('X-WSSE',  Ember.SimpleWsseAuth.BuildXWsseHeader(session));
    }
  });
};
