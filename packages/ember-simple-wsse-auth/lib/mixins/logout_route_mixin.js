Ember.SimpleWsseAuth.LogoutRouteMixin = Ember.Mixin.create({
  beforeModel: function() {
    this.get('session').destroy();
    this.transitionTo(Ember.SimpleWsseAuth.routeAfterLogout);
  }
});