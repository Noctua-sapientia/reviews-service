const mailgun = require('mailgun-js');

const mg = mailgun({ apiKey: 'bb4f9a1794f6106f0b99b6f4c035b015-063062da-914c6086', domain: 'sandbox9ef15dc23ab44e6baf3690343ea15f47.mailgun.org' });

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

module.exports = sendEmail;