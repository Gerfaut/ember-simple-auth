#  Ember.SimpleWsseAuth [![Build Status](https://travis-ci.org/Gerfaut/ember-simple-wsse-auth.png)](https://travis-ci.org/Gerfaut/ember-simple-wsse-auth)

Ember.SimpleWsseAuth is a lightweight and unobtrusive library for implementing
WSSE authentication with [Ember.js](http://emberjs.com) applications. It
has minimal requirements with respect to the application structure, routes etc. as well as the server interface.
This library is inspired (and forked) by [marcoow](https://github.com/simplabs/ember-simple-auth). Have a look at his work. 



####TODO: 
- More and more... (and more ?) Unit tests!
- Use WebWorker to compute encoded password
- Real check of PasswordDigest, server side (not mastering enough Ruby. Has been successfully tested with Symfony2)



## WSSE Authentication

The general idea behind WSSE for Ember.js applications is
that the server provides an endpoint that the client uses to get salt of user who want to login. 
Encoded password is then computed, browser side and user in combination with current data and random unique value (called Nonce) to sign each request made to server. No session is maintained server side. **Password is never send across the network and not stored browser side**. 

Each request contains WSSE headers to identify user: 

- Authorization: Authorization profile="UsernameToken"
- X-WSSE: UsernameToken Username="letme", PasswordDigest="CVes4PRj/iTguSLjqx+sQ/dQQxg=", Nonce="NTM1MjZjYTVlZGY3N2Q4MQ==", Created="2013-11-07T21:34:03Z"


**A lot of useful (and better) documentation is available across the net:**

- [http://obtao.com/blog/2013/06/configure-wsse-on-symfony2-use-it-with-fosrestbundle-and-test-it-with-chrome](http://obtao.com/blog/2013/06/configure-wsse-on-symfony2-use-it-with-fosrestbundle-and-test-it-with-chrome)
- [http://docs.oracle.com/cd/E21455_01/common/tutorials/authn_ws_user.html](http://docs.oracle.com/cd/E21455_01/common/tutorials/authn_ws_user.html)

**Afraid of publish SALT in your API ?**

- [http://stackoverflow.com/questions/213380/the-necessity-of-hiding-the-salt-for-a-hash](http://stackoverflow.com/questions/213380/the-necessity-of-hiding-the-salt-for-a-hash)

**WSSE is used a lot with Symfony2 Framework:**

- [How to create WSSE Authentication with SF2](http://symfony.com/en/doc/current/cookbook/security/custom_authentication_provider.html)

Tools to generate WSSE Header with Javascript :
- http://www.teria.com/~koseki/tools/wssegen/)

## Usage

Ember.SimpleWsseAuth requires external libraries: 
- SHA512 : http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha512.js
- SHA1 : http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha1.js
- BASE 64 Encoder/Decoder : http://crypto-js.googlecode.com/svn/tags/3.1.2/build/components/enc-base64-min.js

Ember.SimpleWsseAuth only requires 2 routes and one template/controller. To enable
it it's best to use a custom initializer:

```js
Ember.Application.initializer({
  name: 'authentication',
  initialize: function(container, application) {
    Ember.SimpleWsseAuth.setup(application);
  }
});
```

The routes for logging in and out can be named anything you want:

```js
App.Router.map(function() {
  this.route('login');
  this.route('logout');
});
```

To wire everything up, the generated ```App.LoginController``` and
```App.LogoutRoute``` need to implement the respective mixins provided by
Ember.SimpleWsseAuth:

```js
App.LoginController = Ember.Controller.extend(Ember.SimpleWsseAuth.LoginControllerMixin);
App.LogoutRoute     = Ember.Route.extend(Ember.SimpleWsseAuth.LogoutRouteMixin);
```

The last step is to add a template that renders the login form:

```html
<form {{action login on='submit'}}>
  <label for="identification">Login</label>
  {{view Ember.TextField id='username' valueBinding='username' placeholder='Enter Login'}}
  <label for="password">Password</label>
  {{view Ember.TextField id='password' type='password' valueBinding='password' placeholder='Enter Password'}}
  <button type="submit">Login</button>
</form>
```
At this point the infrastructure for users to log in and out is set up. Also
every AJAX request (unless it's a cross domain request) will include
[the authentication header](#token-based-authentication).

To actually make a route in the application protected and inaccessible when no
user is authenticated, simply implement the
```Ember.SimpleWsseAuth.AuthenticatedRouteMixin``` in the respective route:

```js
App.Router.map(function() {
  this.route('protected');
});
App.ProtectedRoute = Ember.Route.extend(Ember.SimpleWsseAuth.AuthenticatedRouteMixin);
```

This will make the route redirect to ```/login``` (or a different URL if
configured) when no user is authenticated.

The current session can always be accessed as ```session```. To display
login/logout buttons depending on whether the user is currently authenticated
or not, simple add something like this to the respective template:

```html
{{#if session.isAuthenticated}}
  {{#link-to 'logout'}}Logout{{/link-to}}
  <p class="navbar-text pull-right">Your are currently signed in</p>
{{else}}
  {{#link-to 'login'}}Login{{/link-to}}
{{/if}}
```

For more examples including custom URLs, JSON payloads, error handling,
handling of the session user etc., see the [examples](#examples).

## The Server side

The only requirements on the server side is that there are two different endpoints accessible with GET method : 


#####/salt/:username
```json
{
  session: {
    "salt": "thisIsMySalt", 
    "username":"letme"
  }
}
```

:username variable is automatically replaced by real username filled in login form. 
This method must return salt used to encode user password

#####/check-access
```json
true
```

/check-access is used to ensure right login infomation and can return what you want, in case of successful login. Otherwise return 403 error.


## Examples

To run the examples you need to have Ruby (at least version 1.9.3) and the
[bundler gem](http://bundler.io) installed. If you have that, you can run:

```bash
git clone https://github.com/simplabs/ember-simple-wsse-auth.git
cd ember-simple-wsse-auth/examples
bundle
./runner
```

Open [http://localhost:4567](http://localhost:4567) to access the examples.

## Installation

To install Ember.SimpleWsseAuth in you Ember.js application you have several
options:

* If you're using [Bower](http://bower.io), just add it to your
  ```bower.json``` file from Shim Repository:

```js
{
  "dependencies": {
    "ember-simple-wsse-auth": "*"
  }
}
```

* Download a prebuilt version from
  [the shim repository](https://github.com/Gerfaut/ember-simple-wsse-auth-component)
* [Build it yourself](#building)

## Building

To build Ember.SimpleWsseAuth yourself you need to have Ruby (at least version
1.9.3) and the [bundler gem](http://bundler.io) installed. If you have that,
building is as easy as running:

```bash
git clone https://github.com/Gerfaut/ember-simple-wsse-auth.git
cd ember-simple-wsse-auth
bundle
bundle exec rake dist
```

After running that you will find the compiled source file (including a minified
version) in the ```dist``` directory.

If you want to run the tests as well you also need
[PhantomJS](http://phantomjs.org). You can run the tests with:

```bash
bundle exec rake test
```


## Thanks
Many thanks to [marcoow](https://github.com/simplabs/ember-simple-auth) for his inspiring project.

Many thanks to EmberJS team. 

Feel free to contribute to this project. 