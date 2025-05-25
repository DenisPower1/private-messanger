import nodemail from 'nodemailer';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
dotenv.config();
const appEmail = process.env.appEmail;
const host = process.env.emailHost;
const clientId = process.env.oAuthClientId;
const clientSecret = process.env.oAuthClientSecret;
const refreshToken = process.env.oAuth2RefreshToken;
const authClient = new OAuth2Client({ clientId, clientSecret });
authClient.setCredentials({ refresh_token: refreshToken });

const prepareMailTransporter = (acessToken: any) => {
  const transporter = nodemail.createTransport({
    host: host,
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: appEmail,
      clientId: clientId,
      clientSecret: clientSecret,
      refreshToken: refreshToken,
      accessToken: acessToken,
    },
  });

  return transporter;
};

export const sendNewMessageNotificationEmail = async (
  user: { email: string; name: string },
  senderName: string,
) => {
  const accessToken = await authClient.getAccessToken();
  const transporter = prepareMailTransporter(accessToken.token);
  const mailOptions: nodemail.SendMailOptions = {
    from: appEmail,
    to: user.email,
    subject: `New message on Private Messanger`,
    text: `Hello ${user.name} you recieved a new message from ${senderName} check it out on the app.
        `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendOTPCodeEmail = async (email: string, OTPCode: string) => {
  const accessToken = await authClient.getAccessToken();
  const transporter = prepareMailTransporter(accessToken.token);
  const mailOptions: nodemail.SendMailOptions = {
    from: appEmail,
    to: email,
    subject: 'Private Messanger One Time Password',
    text: `The OTP code is: ${OTPCode} do not share it with anyone, it will expire in 4 minutes`,
  };

  await transporter.sendMail(mailOptions);
};
