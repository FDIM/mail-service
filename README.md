# mail-service
A simple nodejs module that enables you to send rich html emails with inline css. All you need is a html template with angular expressions as placeholders.

# install
As simple as "npm install mail-service"

# usage

````
var MailService = require('mail-service');

var test = new MailService(<simply passed to createTransport>, <default mail options, like from address>, <angular template options>);
// or
var test = new MailService();
test.init(<simply passed to createTransport>, <default mail options, like from address>, <angular template options>); // meant to be initialized from outside and use environment variables

test.send(<mail options>, callback);
````


# example

```
// services/mailer.js
var MailService = require('mail-service');

function MyMailer(){
  MailService.call(this);
  this.fileHandler = asyncFileHandler;
}
function asyncFileHandler(filePath, templateOptions, callback){
  // gets called once per <img src="<path>"/> to read image file.
  // default one automatically reads images using basedir relative to the template or from imagesDir provided on template level.
}
MyMailer.prototype = Object.create(MailService.prototype);

module.exports = new MyMailer();


MyApi.prototype.sendForgotPasswordMail = function(user, data, callback){
  this.send({
    to: user.email,
    subject: "Reset password link",
    textTemplate: {
      path:__dirname+'/../emails/forgot-password.txt',
      data: data
    },
    htmlTemplate: {
      path:__dirname+'/../emails/forgot-password.html',
      data: data
    }
  }, callback);
};

// server.js
var myApi = require('./services/my-api.js');
myApi.init("smpt://usr:1234353@localhost:489");

// some-route.js
var myApi = require('../services/my-api.js');
myApi.sendForgotPasswordMail({email:'test@example.com'},{name:"Test"}, function(err, finalOptions){});
```
