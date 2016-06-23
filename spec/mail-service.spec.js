var MailService = require('../index.js');
var options = {
  service:'Mandrill',
  auth: {
    user:'cuubas',
    pass: ""
  },
  debug:true,
  logger:true,
};

if(process.env.HTTP_PROXY){
  options.proxy = process.env.HTTP_PROXY;
}

var mailer = new MailService(options);

describe("mail service", function() {
  it("should send one mail", function(callback) {
    var templateOptions = {
      path: __dirname+'/../emails/layout.html',
      data:{
        title:'Tester',
        unsubscribeLink:'https://www.google.com',
        template:__dirname+'/../emails/content.html'
      }
    };

    var mailOptions = {
        from: 'no-reply@cuubas.dk', // sender address
        to: 'domas@cuubas.dk', // list of receivers
        subject: "Hi "+(new Date()).getTime(), // Subject line
        template: templateOptions
    };

    mailer.send(mailOptions, (err)=>{
      expect(err).toBeNull();
      callback();
    });
  });
});