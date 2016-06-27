var juice = require('juice');
var angularTemplate = require('angular-template');
var nodemailer = require('nodemailer');
var async = require('async');
var extend = require('extend');
var path = require('path');
var fs = require('fs');
var striptags = require('striptags');
var jsTemplate = require('js-template');
var defaultPlaceholderOptions = {
    open:'\\\*\\\|',
    close: '\\\|\\\*'
};

function commonInit(transportOptions, defaultMailOptions, angularTemplateOptions) {
  if(transportOptions){
    this.transporter = nodemailer.createTransport(transportOptions);
  }
  if(defaultMailOptions){
    this.defaultMailOptions = defaultMailOptions;
  }else{
    this.defaultMailOptions = {};
  }
  if(angularTemplateOptions){
    this.angularTemplateOptions = angularTemplateOptions;
  }else{
    this.angularTemplateOptions = {prefix:'ng'};
  }
  // if set, should be a function accepting file path and a callback that would pass content as 2nd parameter
  if(!this.fileHandler){
    this.fileHandler = defaultFileHandler;
  }
  // custom function that can modify the template (can be called twice, once for text and once for html)
  if(!this.postProcessTemplate){
    this.postProcessTemplate = postProcessTemplate;
  }
  // default post processing deals with mailchmip like tags
  if(!this.placeholderOptions){
    this.placeholderOptions = defaultPlaceholderOptions;
  }
}

function postProcessTemplate(tpl, templateOptions, options, callback) {
  //take care of mailchimp-like placeholders
  if(this.placeholderOptions && templateOptions.placeholders){
    try{
      var self = this;
      Object.keys(templateOptions.placeholders).forEach((key)=>{
        tpl = tpl.replace(new RegExp(self.placeholderOptions.open + key.toUpperCase() + self.placeholderOptions.close,'g'), templateOptions.placeholders[key]);
      });
    }catch(e){
      callback({message:"unable to process placeholders", exception:e}, null);
      return;
    }
  }
  callback(null, tpl);
}

function defaultFileHandler(filePath, templateOptions, callback) {
  var baseDir = templateOptions.imagesDir;
  if(!baseDir){
    baseDir = path.dirname(templateOptions.path);
  }
  callback(null, fs.createReadStream(baseDir+'/'+filePath));
}

function MailService(transportOptions, defaultMailOptions, angularTemplateOptions) {
  commonInit.apply(this, arguments);
}
// export
module.exports = MailService;
MailService.defaultFileHandler = defaultFileHandler;

MailService.prototype.init = function(transportOptions, defaultMailOptions, angularTemplateOptions) {
  commonInit.apply(this, arguments);
  return this;
};

MailService.prototype.extractImages = function(tpl) {
  var images = [];
  //TODO: refactor
  tpl.replace(/src="([^"']+)"/g, function(match, path){
    images.push(path);
  });
  return images;
};

MailService.prototype.processHTMLTemplate = function(template, mailOptions, callback) {
  var self = this;
  var tpl = angularTemplate(template.path || template.template, template.data, this.angularTemplateOptions);
  var images = this.extractImages(tpl);
  // extract domain from 'from' field
  var suffix = '@'+mailOptions.from.split('@')[1].replace('>','');
  var prefix = (new Date()).getTime()+'';
  if(!mailOptions.attachments){
    mailOptions.attachments = [];
  }
  async.each(images, (path, cb)=>{
    var cid = prefix+path+suffix;
    tpl = tpl.replace('src="'+path+'"','src="cid:'+cid+'"');
    // delegate file handling
    self.fileHandler(path, template, (err, content)=>{
      if(!err){
        mailOptions.attachments.push({
          filename:path,
          cid:cid,
          content: content,
          contentDisposition:'inline'
        });
      }
      cb(err);
    });
  }, (err)=>{
    if(callback){
      callback(err, tpl);
    }
  });
};

MailService.prototype.render = function(options, callback) {
  var self = this;
  var tasks = [];
  options = extend(true, {}, this.defaultMailOptions, options);
  // process html template if set
  if(options.htmlTemplate){
    tasks.push((cb)=>{
      try{
        self.processHTMLTemplate(options.htmlTemplate, options, (err, tpl)=>{
          self.postProcessTemplate(tpl, options.htmlTemplate, options, (err, tpl)=>{
            options.html = juice(tpl);
            delete options.htmlTemplate;
            cb(err, {});
          });
        });
      }catch(e){
        cb(e);
      }
    });
  }
  // process text template if set
  if(options.textTemplate){
    tasks.push((cb)=>{
      try{
        var tpl = angularTemplate(options.textTemplate.path || options.textTemplate.template, options.textTemplate.data, extend(true, {jsMode:true}, self.angularTemplateOptions));
        // kind of ugly, but the only way to fix newlines. Template engine removes it...
        tpl = tpl.replace(/\r\n/g,'|-------------------|').replace(/\n/g,'|-------------------|');
        tpl = jsTemplate(tpl, options.textTemplate.data).replace(/\|-------------------\|/g,'\n');

        self.postProcessTemplate(tpl, options.textTemplate, options, (err, tpl)=>{
          options.text = striptags(tpl);
          delete options.textTemplate;
          cb(null, {});
        });

      }catch(e){
        cb(e);
      }
    });
  }
  // process all templates and send the mail
  async.parallel(tasks, (err, res)=>{
    callback(err, options);
  });
};

MailService.prototype.send = function(options, callback) {
  var self = this;
  this.render(options, (err, options)=>{
    if(err || self.$test){
      callback(err, options);
    }else{
      self.transporter.sendMail(options, (err, res)=>{
        options.result = res;
        callback(err, options);
      });
    }
  });
};
