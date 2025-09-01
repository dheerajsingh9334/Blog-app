const nodemailer = require("nodemailer");

const sendAccVerificationEmail = async (to, token) => {
  try {
    // Create ethereal test account for development
    let testAccount = await nodemailer.createTestAccount();
    
    // For development, use Ethereal instead of Gmail to avoid authentication issues
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    console.log("📧 Using Ethereal test email account for development");
    
    // Create the message
    const message = {
      from: testAccount.user,
      to,
      subject: "Account Verification - Blog App",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Verify Your Account</h2>
          <p>Thank you for registering with our Blog App!</p>
          <p>To complete your registration and verify your email address, please click on the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/account-verification/${token}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify My Account
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 3px;">
            ${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/account-verification/${token}
          </p>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            <strong>Important:</strong> This verification link will expire in 10 minutes for security reasons.
          </p>
          
          <p style="font-size: 14px; color: #666;">
            If you did not create an account with us, please ignore this email.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            This email was sent from Blog App. Please do not reply to this email.
          </p>
        </div>
      `,
    };
    
    // Send the email
    const info = await transporter.sendMail(message);
    console.log("✅ Account verification email sent", info.messageId);
    
    // Provide both email preview and manual link
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("📧 Preview your email at:", previewUrl);
    console.log("🔗 Manual verification link:", `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/account-verification/${token}`);
    
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    // Provide manual link as fallback
    console.log(`🔗 Manual verification link: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/account-verification/${token}`);
    console.log("⚠️  Email failed but verification link is available above.");
    return { messageId: 'email-failed', manualLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/account-verification/${token}` };
  }
};

module.exports = sendAccVerificationEmail;
