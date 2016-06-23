var juice = require('juice');
var angularTemplate = require('angular-template');
var nodemailer = require('nodemailer');

function MailService(transportOptions) {
  if(transportOptions){
    this.transporter = nodemailer.createTransport(transportOptions);
  }
}
// export
module.exports = MailService;

MailService.prototype.init = function(transportOptions) {
  this.transporter = nodemailer.createTransport(transportOptions);
}

MailService.prototype.send = function(options, callback) {
  var template = options.template;
  delete options.template;

  var tpl = angularTemplate(template.path, template.data);
  var images = [];
  //TODO: refactor
  tpl.replace(/inline-image="([a-zA-Z0-9\-\/\\ \.]+)"/g, function(match, path){
    images.push(path);
  });
  var prefix = (new Date()).getTime()+'';
  images.forEach((path)=>{
    var cid = prefix+path+'@cuubas.dk';
    tpl = tpl.replace('inline-image="'+path+'"','src="cid:'+cid+'"');
    mailOptions.attachments.push({
      filename:path,
      cid:cid,
      content: fs.createReadStream(basePath+path),
      contentType:'image/jpeg',
      contentDisposition:'inline'
    });
  });

  options.html = juice(tpl);
  callback(null);
  //this.transporter.sendMail(options, callback);
}