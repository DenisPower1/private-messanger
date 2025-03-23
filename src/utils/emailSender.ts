import nodemail from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const appEmail = process.env.app_email;
const apikey = process.env.sendinblue_key;
const host = process.env.email_provider_host;
const transporter = nodemail.createTransport({
  host: host,
  port: 587,
  secure: false,
  auth: {
    user: appEmail,
    pass: apikey,
  },
});

export const verifyEmail = (recepientEmail: string, userName: string) => {
  const mailOptions: nodemail.SendMailOptions = {
    from: appEmail,
    to: recepientEmail,
    subject: 'Private Messanger Email Verification',
    text: `Hello dear ${userName}, welcome to the Private Messanger, your credential were verified
    We will use this email you provided to send to you notifications, such as when you recieve a new message
    when you're off.

    From the App team.
    `,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
      throw err;
    }
    console.log(info);
  });
};

export const sendNewMessageNotificationEmail = (
  user: { email: string; name: string },
  senderName: string,
) => {
  const mailOptions: nodemail.SendMailOptions = {
    from: appEmail,
    to: user.email,
    subject: `New message on Private Messanger`,
    text: `Hello ${user.name} you recieved a new message from ${senderName} check it out on the app.
        `,
  };

  transporter.sendMail(mailOptions);
};

export const sendOTPCodeEmail = (email: string, OTPCode: string) => {
  const mailOptions: nodemail.SendMailOptions = {
    from: appEmail,
    to: email,
    subject: 'Recieve your Private Messanger password',
    text: `The OTP code is: ${OTPCode} do not share it with anyone`,
  };

  transporter.sendMail(mailOptions);
};
