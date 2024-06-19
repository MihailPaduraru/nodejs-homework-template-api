const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");

dotenv.config();

async function sendWithSendGrid(email, token) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const host = process.env.HOSTNAME;
  const verificationLink = `${host}/api/auth/verify/:verificationToken/verify/${token}`;
  const msg = {
    to: email,
    from: "mch.mihaii@yahoo.com",
    subject: "Hello from ContactsApp!",
    text: `Verification link: ${host}/api/auth/verify/:verificationToken/verify/${token}`,
    html: `Hello from <strong>ContactsApp</strong> <br />
    <a href="${verificationLink}/api/auth/verify/:verificationToken/verify/${token}">${verificationLink}}</a> to validate your account. <br />`,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent succesfully to ${email}`);
  } catch (error) {
    if (error?.response) {
      console.error(error.response.body);
    } else {
      console.error(error);
    }
  }
}

module.exports = sendWithSendGrid;
