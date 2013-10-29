var ContainerMock = Ember.Object.extend({
  init: function() {
    this._super();
    this.registrations = [];
    this.injections = [];
  },
  register: function(name, factory, options) {
    this.registrations.push({
      name:    name,
      factory: factory,
      options: options
    });
  },
  inject: function(target, property, name) {
    var registration = Ember.$.grep(this.registrations, function(registration, i) {
      return registration.name === name;
    })[0];
    if (registration) {
      this.injections.push({
        target:   target,
        property: property,
        object:   registration.factory
      });
    }
  }
});

var XhrMock = Ember.Object.extend({
  init: function() {
    this._super();
    this.requestHeaders = {};
  },
  setRequestHeader: function(name, value) {
    this.requestHeaders[name] = value;
  }
});

var registeredAjaxPrefilter;
var ajaxPrefilterMock = function(prefilter) {
  registeredAjaxPrefilter = prefilter;
};

module('Ember.SimpleWsseAuth', {
  originalAjaxPrefilter: Ember.$.ajaxPrefilter,
  setup: function() {
    Ember.$.ajaxPrefilter = ajaxPrefilterMock;
  },
  teardown: function() {
    Ember.$.ajaxPrefilter = this.originalAjaxPrefilter;
  }
});

test('saves serverSessionRoute if specified', function() {
  Ember.SimpleWsseAuth.setup(ContainerMock.create(), { serverSessionRoute: '/route' });

  equal(Ember.SimpleWsseAuth.serverSessionRoute, '/route', 'Ember.SimpleWsseAuth saves serverSessionRoute when specified.');
});

test('saves routeAfterLogin if specified', function() {
  Ember.SimpleWsseAuth.setup(ContainerMock.create(), { routeAfterLogin: 'somewhere' });

  equal(Ember.SimpleWsseAuth.routeAfterLogin, 'somewhere', 'Ember.SimpleWsseAuth saves routeAfterLogin when specified.');
});

test('saves routeAfterLogout if specified', function() {
  Ember.SimpleWsseAuth.setup(ContainerMock.create(), { routeAfterLogout: 'somewhere' });

  equal(Ember.SimpleWsseAuth.routeAfterLogout, 'somewhere', 'Ember.SimpleWsseAuth saves routeAfterLogout when specified.');
});

test('injects a session object in models, views, controllers and routes', function() {
  var container = ContainerMock.create();
  Ember.SimpleWsseAuth.setup(container);

  Ember.$.each(['model', 'view', 'controller', 'view'], function(i, component) {
    var injection = Ember.$.grep(container.injections, function(injection) {
      return injection.target === component;
    })[0];

    equal(injection.property, 'session', 'Ember.SimpleWsseAuth injects a session into ' + component + '.');
    equal(injection.object.constructor, Ember.SimpleWsseAuth.Session, 'Ember.SimpleWsseAuth injects a session into ' + component + '.');
  });
});

test('registers an AJAX prefilter that adds the authToken for non-crossdomain requests', function() {
  var xhrMock = XhrMock.create();
  var token = Math.random().toString(36);
  sessionStorage.authToken = token;
  Ember.SimpleWsseAuth.setup(ContainerMock.create());

  registeredAjaxPrefilter({}, {}, xhrMock);
  equal(xhrMock.requestHeaders['X-AUTHENTICATION-TOKEN'], token, 'Ember.SimpleWsseAuth registers an AJAX prefilter that adds the authToken for non-crossdomain requests.');

  xhrMock = XhrMock.create();
  xhrMock.crossDomain = true;
  registeredAjaxPrefilter({}, {}, xhrMock);
  equal(xhrMock.requestHeaders['X-AUTHENTICATION-TOKEN'], undefined, 'Ember.SimpleWsseAuth registers an AJAX prefilter that does not add the authToken for crossdomain requests.');
});
