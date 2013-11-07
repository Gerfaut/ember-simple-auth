var testRoute = Ember.Object.extend(Ember.SimpleWsseAuth.AuthenticatedRouteMixin, {
  route: null,

  transitionTo: function(targetRoute) {
    this.route = targetRoute;
  }
}).create();

module('Ember.SimpleWsseAuth.AuthenticatedRouteMixin', {
  setup: function() {
    Ember.SimpleWsseAuth.loginRoute = 'login.route';
    testRoute.route = null;
    testRoute.set('session', Ember.SimpleWsseAuth.Session.create());
  }
});

test('it redirect to the login route correctly', function() {
  var attemptedTransition = Ember.Object.create();
  testRoute.redirectToLogin(attemptedTransition);

  equal(testRoute.route, 'login.route', 'Ember.SimpleWsseAuth.AuthenticatedRouteMixin redirects to the correct route.');
  equal(testRoute.get('session.attemptedTransition'), attemptedTransition, 'Ember.SimpleWsseAuth.AuthenticatedRouteMixin saves the attempted transition in the session when redirecting to the login route.');
});

test('it redirects to the correct route before model when the session is not authenticated', function() {
  testRoute.set('session.authToken', '');
  testRoute.beforeModel();

  equal(testRoute.route, 'login.route', 'Ember.SimpleWsseAuth.AuthenticatedRouteMixin redirects to the login route before model when the session is not authenticated.');

  testRoute.route = null;
  testRoute.set('session.authToken', 'token');
  testRoute.beforeModel();

  notEqual(testRoute.route, 'login.route', 'Ember.SimpleWsseAuth.AuthenticatedRouteMixin does not redirect to the login route before model when the session is authenticated.');
});
