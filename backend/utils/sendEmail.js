const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (toEmail, name, otp, isReset = false) => {
  const subject = isReset
    ? 'Reset Your Password — Hospital Management'
    : 'Email Verification OTP — Hospital Management';

  const heading = isReset ? 'Reset Your Password' : 'Verify Your Email';
  const subtext = isReset
    ? 'Use the OTP below to reset your password. It is valid for <strong>10 minutes</strong>.'
    : 'Use the OTP below to verify your email address. It is valid for <strong>10 minutes</strong>.';

  const mailOptions = {
    from: `"Hospital Management" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: #2563eb; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">🏥 Hospital Management</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #111827; margin-top: 0;">${heading}</h2>
          <p style="color: #6b7280;">Hello <strong>${name}</strong>,</p>
          <p style="color: #6b7280;">${subtext}</p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #2563eb;">${otp}</span>
          </div>
          <p style="color: #9ca3af; font-size: 13px;">If you did not request this, please ignore this email. Do not share this OTP with anyone.</p>
        </div>
        <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2024 Hospital Management System</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };
