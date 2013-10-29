Ember.SimpleWsseAuth.Session = Ember.Object.extend({
  init: function() {
    this._super();
    this.set('username', sessionStorage.username);
    this.set('passwordDigest', sessionStorage.passwordDigest);
    if(sessionStorage.username !== undefined && sessionStorage.passwordDigest !== undefined) {
      this.set('accountRestored', true);
    }
  },
  setup: function(serverSalt, password) {
    var salt = (serverSalt.session || {}).salt;
    var username = (serverSalt.session || {}).username;
    this.set('passwordDigest', Ember.SimpleWsseAuth.EncodePassword(password, salt));
    this.set('username', username);
    this.set('accountRestored', true);
  },
  didAccessChecked: function() {
    this.set('accessChecked', true);
  },
  destroy: function() {
    this.set('username', undefined);
    this.set('passwordDigest', undefined);
    this.set('accessChecked', undefined);
    this.set('accountRestored', undefined);
  },
  isValid: Ember.computed('username', 'passwordDigest', function() {
    return !Ember.isEmpty(this.get('username')) && !Ember.isEmpty(this.get('passwordDigest'));
  }),
  isAuthenticated: Ember.computed('username', 'passwordDigest', 'accessChecked', function() {
    return !Ember.isEmpty(this.get('username')) && this.get('accessChecked')
            && this.get('isValid');
  }),
  authDataObserver: Ember.observer(function() {
    var username = this.get('username');
    if (Ember.isEmpty(username)) {
      delete sessionStorage.username;
    } else {
      sessionStorage.username = this.get('username');
    }
    
    var passwordDigest = this.get('passwordDigest');
    if (Ember.isEmpty(passwordDigest)) {
      delete sessionStorage.passwordDigest;
    } else {
      sessionStorage.passwordDigest = this.get('passwordDigest');
    }
  }, 'passwordDigest', 'username')
});
