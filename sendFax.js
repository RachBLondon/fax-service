const env = require('env2')('./.env')

exports.handler = function(context, event, callback) {  
    const fs = require('fs');
    const client = context.getTwilioClient();

    
client.fax.faxes
  .create({
     from: process.env.FROM,
     to: process.env.TO,
     mediaUrl: 'https://www.twilio.com/docs/documents/25/justthefaxmaam.pdf'
    })
  .then(fax => callback(null, fax));
	
};