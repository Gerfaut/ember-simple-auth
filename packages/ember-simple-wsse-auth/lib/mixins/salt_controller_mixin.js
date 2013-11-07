Ember.SimpleWsseAuth.SaltControllerMixin = Ember.Mixin.create({
  test:true,
  actions: {
    login: function() {
      var self = this;
      var data = this.getProperties('username');
      var secret = this.getProperties('password');
      if (!Ember.isEmpty(data.username)) {
        var saltRoute = Ember.SimpleWsseAuth.serverSaltRoute;
        if(saltRoute.indexOf('{username}') !== 0) {
            saltRoute = saltRoute.replace('{username}', data.username);
        }
        Ember.$.ajax(saltRoute).then(function(response) {
          self.get('session').setup(response, secret.password);
          self.send('checkAccess');
        }, function() {
          Ember.tryInvoke(self, 'loginFailed', arguments);
        });
      }
    },
    checkAccess: function() {
      if(this.get('session.accountRestored')) {
        var self = this;
        var checkAccessRoute = Ember.SimpleWsseAuth.serverCheckAccessRoute;
        Ember.$.ajax(checkAccessRoute).then(function(response) {
          self.get('session').didAccessChecked();
          var attemptedTransition = self.get('session.attemptedTransition');
          if (attemptedTransition) {
            attemptedTransition.retry();
            self.set('session.attemptedTransition', null);
          } else {
            self.transitionToRoute(Ember.SimpleWsseAuth.routeAfterLogin);
          }
        }, function() {
          Ember.tryInvoke(self, 'loginFailed', arguments);
        });
      }
    }
  }
});