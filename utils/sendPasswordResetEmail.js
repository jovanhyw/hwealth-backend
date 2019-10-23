const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendPasswordResetEmail = (recipient, token) => {
  const message = {
    to: recipient,
    from: 'noreply@hwealth.me',
    subject: 'Reset your password for HWealth',
    html:
      `
  <div>Hello,</div>
  
  <div>&nbsp;</div>
  
  <div>Reset the password for your HWealth account by clicking the link below.</div>
  
  <div>&nbsp;</div>
  
  <a href="` +
      `${process.env.FRONTEND_HOST_NAME}` +
      `/account/reset-password?token=` +
      `${token}` +
      `">Reset Account Password</a>
  
  <div>&nbsp;</div>
  
  <div>This link will expire after 1 hour from the time it is sent.</div>

  <div>&nbsp;</div>

  <div>If you did not request to reset the password to your HWealth account, you can safely ignore this email.</div>
  
  <div>&nbsp;</div>
  
  <div>Thank you,</div>
  
  <div>&nbsp;</div>
  
  <div>Your HWealth team</div>
 `
  };

  sgMail.send(message);
};

module.exports.sendPasswordResetEmail = sendPasswordResetEmail;
