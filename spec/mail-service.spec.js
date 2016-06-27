var fs = require('fs');
var MailService = require('../index.js');
var doNotSendEmails = true;
var writeTestFiles = false;
var options = {
  service:'Mandrill',
  auth: {
    user:'cuubas',
    pass: ""
  },
  debug:true,
  logger:true,
};
var defaultMailOptions = {
  from:'no-reply@cuubas.dk'
};
if(process.env.HTTP_PROXY){
  options.proxy = process.env.HTTP_PROXY;
}


describe("mail service", function() {
  it("should send one rich mail", function(callback) {
    var mailer = new MailService(options, defaultMailOptions);
    mailer.$test = doNotSendEmails;
    var templateData = {
      name:'Tester',
      unsubscribeLink:'https://www.google.com',
      template:'content.html',
      items:['line1','line2','line3']
    };
    var textTemplateOptions = {
      path: __dirname+'/../emails/content.txt',
      data:templateData
    };
    var htmlTemplateOptions = {
      imagesDir:__dirname+'/../emails',
      path: __dirname+'/../emails/layout.html',
      data:templateData
    };

    var mailOptions = {
        to: 'domas@cuubas.dk', // list of receivers
        subject: "Hi "+(new Date()).getTime(), // Subject line
        htmlTemplate: htmlTemplateOptions,
        textTemplate: textTemplateOptions
    };

    mailer.send(mailOptions, (err, res)=>{
      expect(err).toBeNull();
      if(writeTestFiles){
        fs.writeFileSync(__dirname+'/test1.html', res.html);
        fs.writeFileSync(__dirname+'/test1.txt', res.text);
      }
      expect(res.html).toContain('Tester');
      expect(res.text).toContain('Tester');

      callback();
    });
  });

  it("should send one text mail", function(callback) {
    var mailer = new MailService(options, defaultMailOptions);
    mailer.$test = doNotSendEmails;
    var templateData = {
      name:'*|FNAME|*',
      unsubscribeLink:'https://www.google.com',
      items:['line1','line2','line3']
    };
    var textTemplateOptions = {
      path: __dirname+'/../emails/content.txt',
      data:templateData,
      placeholders:{
        fname:'Tester'
      }
    };

    var mailOptions = {
        to: 'domas@cuubas.dk', // list of receivers
        subject: "Hi "+(new Date()).getTime(), // Subject line
        textTemplate: textTemplateOptions
    };

    mailer.send(mailOptions, (err, res)=>{
      expect(err).toBeNull();

      expect(res.text).toContain('Tester');
      if(writeTestFiles){
        fs.writeFileSync(__dirname+'/test2.txt', res.text);
      }
      callback();
    });
  });
  it("should send one html only mail", function(callback) {
    var mailer = new MailService(options, defaultMailOptions);
    mailer.$test = doNotSendEmails;
    var templateData = {
      name:'Tester',
      unsubscribeLink:'https://www.google.com',
      template:'content.html',
      items:['line1','line2','line3']
    };
    var htmlTemplateOptions = {
      path: __dirname+'/../emails/layout.html',
      data:templateData
    };

    var mailOptions = {
        to: 'domas@cuubas.dk', // list of receivers
        subject: "Hi "+(new Date()).getTime(), // Subject line
        htmlTemplate: htmlTemplateOptions,
    };

    mailer.send(mailOptions, (err, res)=>{
      expect(err).toBeNull();

      expect(res.html).toContain('Tester');
      if(writeTestFiles){
        fs.writeFileSync(__dirname+'/test3.html', res.html);
      }

      callback();
    });
  });
});
