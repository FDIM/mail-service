# mail-service
A simple nodejs module that enables you to send rich html emails with inline css and embedded images.
All you need is a html template with angular like expressions (yes, ng-repeat will work too, even in plain text template).

# install
As simple as "npm install mail-service"

# usage

````
var MailService = require('mail-service');

var test = new MailService(<simply passed to nodemailer.createTransport>, <default mail options, like `from` address>, <angular template options>);
// or
var test = new MailService();
test.init(<simply passed to nodemailer.createTransport>, <default mail options, like `from` address>, <angular template options>); // meant to be initialized from outside and use environment variables

test.send(<mail options>, callback);
````


# example

```
// services/mailer.js
var MailService = require('mail-service');

function MyMailer(){
  MailService.call(this);
  // optional, just in case you need to fetch image from db
  this.fileHandler = asyncFileHandler;
  // used by regexp to do global replacement
  this.placeholderOptions = {regexp:/\*\|(.+?)\|\*/g, defaultValueSeparator:'?', defaultValue:''};
  // you can also post process template, default one replaces mailchimp like tags (*|FNAME|*,*|URL?no link|*), provided via placeholders template regexp option
  this.postProcessTemplate = postProcessTemplate;
}
function postProcessTemplate(tpl, templateOptions, options, callback) {
  callback(null, tpl);
}
function asyncFileHandler(filePath, templateOptions, callback){
  // gets called once per <img src="<path>"/> to read image file.
  // default one automatically reads images using basedir relative to the template or from imagesDir provided on template level.
}
MyMailer.prototype = Object.create(MailService.prototype);

module.exports = new MyMailer();


MyMailer.prototype.sendForgotPasswordMail = function(user, data, callback){
  this.send({
    to: user.email,
    subject: "Reset password link",
    textTemplate: {
      path:__dirname+'/../emails/forgot-password.txt',
      data: data,
      placeholders:{fname:'Test'}
    },
    htmlTemplate: {
      path:__dirname+'/../emails/forgot-password.html',
      data: data
    }
  }, callback);
};

// server.js
var mailer = require('./services/mailer.js');
mailer.init("smpt://usr:1234353@localhost:489");

// some-route.js
var mailer = require('../services/mailer.js');
mailer.sendForgotPasswordMail({email:'test@example.com'},{name:"Test"}, function(err, finalOptions){});
```
