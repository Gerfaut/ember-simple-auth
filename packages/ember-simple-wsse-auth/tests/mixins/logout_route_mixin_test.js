var testRoute = Ember.Object.extend(Ember.SimpleWsseAuth.LogoutRouteMixin, {
  session: Ember.SimpleWsseAuth.Session.create(),
  route:   null,

  transitionTo: function(targetRoute) {
    this.route = targetRoute;
  }
}).create();

var ajaxRequestUrl;
var ajaxRequestOptions;
var ajaxMock = function(url, options) {
  ajaxRequestUrl     = url;
  ajaxRequestOptions = options;
  return {
    always: function(callback) {
      callback();
    }
  };
};

module('Ember.SimpleWsseAuth.LogoutRouteMixin', {
  originalAjax: Ember.$.ajax,
  setup: function() {
    Ember.SimpleWsseAuth.serverSessionRoute = '/session/route';
    ajaxRequestUrl     = undefined;
    ajaxRequestOptions = undefined;
    Ember.$.ajax       = ajaxMock;
  },
  teardown: function() {
    Ember.$.ajax = this.originalAjax;
  }
});

test('sends a DELETE request to the correct route before model', function() {
  testRoute.beforeModel();

  equal(ajaxRequestUrl, '/session/route', 'Ember.SimpleWsseAuth.LogoutRouteMixin sends a request to the correct route before model.');
  equal(ajaxRequestOptions.type, 'DELETE', 'Ember.SimpleWsseAuth.LogoutRouteMixin sends a DELETE request before model.');
});

test('destroys the current session before model', function() {
  testRoute.set('session.authToken', 'some token');
  testRoute.beforeModel();

  equal(testRoute.get('session.isValid'), false, 'Ember.SimpleWsseAuth.LogoutRouteMixin destroy the current session before model.');
});

test('redirects to the correct route before model', function() {
  Ember.SimpleWsseAuth.routeAfterLogout = 'some.route';
  testRoute.beforeModel();

  equal(testRoute.route, 'some.route', 'Ember.SimpleWsseAuth.LogoutRouteMixin redirects to the correct route before model.');
});
