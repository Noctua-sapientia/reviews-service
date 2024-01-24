const mailgun = require('mailgun-js');

const mg = mailgun({ apiKey: '435841823b952f977593441e283b85da-063062da-73e4d154', domain: 'sandbox041680e4fa584f47a0576c352d53b65f.mailgun.org' });

const sendEmail = async function(name, email,type,itemDescription, action){

  const data = {
    from: 'Team Reviews <team-reviews@noctuasapientia.com>',
    to: email,
    subject: 'Review not valid',
    text: 'Lo lamentamos, ' + name + ', la review para el ' + type +' "' + itemDescription + '" no se ha podido ' + action + ' porque contiene palabras no apropiadas. Un saludo.'
  };

  try {
    const result = await mg.messages().send(data);
    console.log('email sent successfully:', result);
  } catch (error) {
    console.error('error in sending email:', error);
  }
};

module.exports = {
  sendEmail
};