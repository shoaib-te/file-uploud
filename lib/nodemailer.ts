import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const emailUser = process.env.EMAIL_USER;
const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');
const smtpHost = process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.EMAIL_SERVER_PORT || 465);

if (!emailUser || !emailPass) {
  console.error('EMAIL_USER or EMAIL_PASS is missing. Use a Gmail app password without spaces.');
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

const getMailOptions = (toEmail: string, otp: string) => ({
  from: `"Your App" <${emailUser}>`,
  to: toEmail,
  subject: 'Your OTP Code 🚀',
  text: `Your OTP code is ${otp}. It will expire shortly.`,
  html: `<b>Your OTP code is <span style="font-size: 18px; color: blue;">${otp}</span>.</b><br><p>It will expire shortly.</p>`,
});

export default async function sendMail(toEmail: string, otp: string) {
  try {
    if (!emailUser || !emailPass) {
      throw new Error('EMAIL_USER or EMAIL_PASS is not configured.');
    }

    const info = await transporter.sendMail(getMailOptions(toEmail, otp));
    console.log('Email sent successfully: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

