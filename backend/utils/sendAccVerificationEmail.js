const nodemailer = require("nodemailer");

const sendAccVerificationEmail = async (to, token) => {
  try {
    // 1. Create transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // 2. Create message
    const message = {
      from: process.env.GMAIL_USER, // this is important
      to,
      subject: "Account Verification",
      html: `
        <p>You are receiving this email because you (or someone else) have requested to verify your account.</p>
        <p>Please click the link below or paste it in your browser to complete the process:</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/account-verification/${token}">Verify Account</a></p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    // 3. Send the email
    const info = await transporter.sendMail(message);
    console.log("✅ Email sent:", info.messageId);
    return info;

   } catch (error) {
    console.error("❌ Email sending failed:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    throw new Error("Email sending failed");
  }


};

module.exports = sendAccVerificationEmail;
