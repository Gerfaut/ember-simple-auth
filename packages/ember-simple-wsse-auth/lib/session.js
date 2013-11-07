Ember.SimpleWsseAuth.Session = Ember.Object.extend({
  init: function() {
    this._super();
    this.set('username', sessionStorage.username);
    this.set('passwordEncoded', sessionStorage.passwordEncoded);
    if(sessionStorage.username !== undefined && sessionStorage.passwordEncoded !== undefined) {
      this.set('accountRestored', true);
    }
  },
  setup: function(serverSalt, password) {
    var salt = (serverSalt.session || {}).salt;
    var username = (serverSalt.session || {}).username;
    this.set('passwordEncoded', Ember.SimpleWsseAuth.EncodePassword(password, salt));
    this.set('username', username);
    this.set('accountRestored', true);
  },
  didAccessChecked: function() {
    this.set('accessChecked', true);
  },
  destroy: function() {
    this.set('username', undefined);
    this.set('passwordEncoded', undefined);
    this.set('accessChecked', undefined);
    this.set('accountRestored', undefined);
  },
  isAuthValid: Ember.computed('username', 'passwordEncoded', function() {
    return !Ember.isEmpty(this.get('username')) && !Ember.isEmpty(this.get('passwordEncoded'));
  }),
  isAuthenticated: Ember.computed('username', 'passwordEncoded', 'accessChecked', function() {
    return !Ember.isEmpty(this.get('username')) && this.get('accessChecked') && this.get('isAuthValid');
  }),
  authDataObserver: Ember.observer(function() {
    var username = this.get('username');
    if (Ember.isEmpty(username)) {
      delete sessionStorage.username;
    } else {
      sessionStorage.username = this.get('username');
    }
    
    var passwordEncoded = this.get('passwordEncoded');
    if (Ember.isEmpty(passwordEncoded)) {
      delete sessionStorage.passwordEncoded;
    } else {
      sessionStorage.passwordEncoded = this.get('passwordEncoded');
    }
  }, 'passwordEncoded', 'username')
});