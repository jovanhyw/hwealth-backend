const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmailVerification = (recipient, accountId, token) => {
  const message = {
    to: recipient,
    from: 'noreply@hwealth.com',
    subject: 'Verify your email for HWealth',
    html:
      `
  <div>Hello,</div>
  
  <div>&nbsp;</div>
  
  <div>Verify this email address for your HWealth account by clicking the link below.</div>
  
  <div>&nbsp;</div>
  
  <a href="` +
      `${process.env.API_HOST_NAME}` +
      `/api/account/verify-email?accountId=` +
      `${accountId}` +
      `&verificationToken=` +
      `${token}` +
      `">Verify Email Address</a>
  
  <div>&nbsp;</div>
  
  <div>This link will expire after 24 hours from the time it is sent.</div>

  <div>&nbsp;</div>

  <div>If you did not request to verify a HWealth account, you can safely ignore this email.</div>
  
  <div>&nbsp;</div>
  
  <div>Thank you,</div>
  
  <div>&nbsp;</div>
  
  <div>Your HWealth team</div>
 `
  };

  sgMail.send(message);
};

module.exports.sendEmailVerification = sendEmailVerification;
