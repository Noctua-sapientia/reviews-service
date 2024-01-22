const mailgun = require('mailgun-js');

const mg = mailgun({ apiKey: '790a7d93b4ade0a501f786c3f75431de-4c955d28-d17dc2ab', domain: 'sandboxfe9ba1cc048044bd9fb19a650b023953.mailgun.org' });

const sendEmail = async function(name, email,bookDescription, action){

  const data = {
    from: 'Team Reviews Noctua Sapientia <team-reviews@noctuasapientia.com>',
    to: email,
    subject: 'Review not valid',
    text: 'Lo lamentamos, ' + name + ' , la review para el libro ' + bookDescription + ' no se ha podido ' +action+' porque contiene palabras no apropiadas'
  };

  try {
    const result = await mg.messages().send(data);
    console.log('email sent successfully:', result);
  } catch (error) {
    console.error('error in sending email:', error);
  }
};

module.exports = sendEmail;