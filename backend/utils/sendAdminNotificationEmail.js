const nodemailer = require("nodemailer");

const sendAdminNotificationEmail = async (adminEmail, bannedUser, banReason, adminUsername) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Create the message
    const message = {
      to: adminEmail,
      subject: `🚫 User Banned: ${bannedUser.username}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🚫 User Account Banned</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Ban Notification</h2>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
              <h3 style="color: #dc2626; margin-top: 0;">Banned User Details:</h3>
              <p><strong>Username:</strong> ${bannedUser.username}</p>
              <p><strong>Email:</strong> ${bannedUser.email || 'No email provided'}</p>
              <p><strong>User ID:</strong> ${bannedUser._id}</p>
              <p><strong>Ban Reason:</strong> ${banReason}</p>
              <p><strong>Banned At:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Banned By:</strong> ${adminUsername}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px;">
              <h4 style="color: #92400e; margin-top: 0;">⚠️ Action Required:</h4>
              <p style="color: #92400e; margin-bottom: 0;">
                A user account has been banned. Please review the ban reason and take any additional actions if necessary.
              </p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #dbeafe; border-radius: 8px;">
              <h4 style="color: #1e40af; margin-top: 0;">📊 Quick Actions:</h4>
              <ul style="color: #1e40af; margin-bottom: 0;">
                <li>Review the ban reason for appropriateness</li>
                <li>Check if additional moderation is needed</li>
                <li>Monitor for any appeals or support requests</li>
              </ul>
            </div>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">
              This is an automated notification from your platform's admin system.
              <br>
              Generated on: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(message);
    console.log("Admin notification email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send admin notification email:", error);
    throw new Error("Admin notification email sending failed");
  }
};

module.exports = sendAdminNotificationEmail;












