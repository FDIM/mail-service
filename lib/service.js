var juice = require('juice');
var angularTemplate = require('angular-template');
var nodemailer = require('nodemailer');

function MailService(endpoint) {

}
// export
module.exports = MailService;

MailService.prototype.init = function(smtp) {

}

MailService.prototype.send = function(template, data, callback) {
  callback({message:"not-implemented"});
}