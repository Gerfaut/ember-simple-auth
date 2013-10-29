module('Ember.SimpleWsseAuth.Session');

test('reads the authToken from sessionStorage when it is initialized', function() {
  var token = Math.random().toString(36);
  sessionStorage.authToken = token;
  var session = Ember.SimpleWsseAuth.Session.create();

  equal(session.get('authToken'), token, 'Ember.SimpleWsseAuth.Session reads the authToken from sessionStorage when initialized.');
});

test('persists the authToken to the sessionStorage when it changes', function() {
  var session = Ember.SimpleWsseAuth.Session.create();
  var token = Math.random().toString(36);
  session.set('authToken', token);

  equal(sessionStorage.authToken, token, 'Ember.SimpleWsseAuth.Session persists the authToken in the sessionStorage.');
});

test('deletes the authToken from sessionStorage when it changes to empty', function() {
  var session = Ember.SimpleWsseAuth.Session.create();
  session.set('authToken', 'some token');
  session.set('authToken', undefined);

  equal(sessionStorage.authToken, undefined, 'Ember.SimpleWsseAuth.Session deletes the authToken from the sessionStorage when it changes ti empty.');
});

test('sets up the authToken correctly', function() {
  var session = Ember.SimpleWsseAuth.Session.create();
  var token = Math.random().toString(36);
  session.setup({ session: { authToken: token }});

  equal(session.get('authToken'), token, 'Ember.SimpleWsseAuth.Session sets up the authToken correctly.');

  session.setup({});

  equal(session.get('authToken'), undefined, 'Ember.SimpleWsseAuth.Session sets up the authToken correctly with an empty server session.');
});

test('clears the authToken when destroyed', function() {
  var session = Ember.SimpleWsseAuth.Session.create();
  session.set('authToken', 'some Token');
  session.destroy();

  equal(session.get('authToken'), undefined, 'Ember.SimpleWsseAuth.Session clears the authToken on logout.');
});

test('is authenticated when the authToken is present, otherwise not', function() {
  var session = Ember.SimpleWsseAuth.Session.create();
  session.set('authToken', Math.random().toString(36));

  ok(session.get('isValid'), 'Ember.SimpleWsseAuth.Session is authenticated when the authToken is present.');

  session.set('authToken', '');
  ok(!session.get('isValid'), 'Ember.SimpleWsseAuth.Session is not authenticated when the authToken is empty.');
});
