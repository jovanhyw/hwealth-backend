const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = {
  to: 'jovanhyw@outlook.com',
  from: 'noreply@hwealth.com',
  subject: 'Verify your email for HWealth',
  html: `
  <div>Hello,</div>
  
  <div>&nbsp;</div>
  
  <div>Follow this link to verify your email address.</div>
  
  <div>&nbsp;</div>
  
  <a href="https://hwealth.me/api/verify-email?accountId=asdasdasd&verificationToken=asdasdasd">https://hwealth.me/api/verify-email?accountId=asdasdasd&verificationToken=asdasdasd</a>
  
  <div>&nbsp;</div>
  
  <div>If you didn&rsquo;t ask to verify this address, you can ignore this email.</div>
  
  <div>&nbsp;</div>
  
  <div>Thank you,</div>
  
  <div>&nbsp;</div>
  
  <div>Your HWealth team</div>
 `
};

sgMail.send(sendVerificationEmail);
