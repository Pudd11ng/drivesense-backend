const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Send password reset email
   * @param {string} to - Recipient email
   * @param {string} resetToken - Password reset token
   * @returns {Promise<boolean>} - Success status
   */
  async sendPasswordResetEmail(to, resetToken) {
    try {
      // App name for email
      const appName = "DriveSense";
      
      // Use HTTPS URL instead of custom scheme
      const resetUrl = `https://drivesense.my/reset-password?token=${resetToken}`;

      // Email content with improved accessibility
      const mailOptions = {
        from: `${appName} <${process.env.EMAIL_USER}>`,
        to,
        subject: `${appName} - Password Reset Request`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password for your ${appName} account.</p>
            
            <p><strong>Instructions:</strong></p>
            <ol style="margin-bottom: 25px;">
              <li>Open the DriveSense app on your device</li>
              <li>Tap on "Reset Password" or "Forgot Password"</li>
              <li>Enter the reset code shown above</li>
              <li>Create your new password</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
            </div>
            
            <p>This code will expire in 1 hour.</p>
            <p>If you didn't request this password reset, you can ignore this email.</p>
            <hr style="margin-top: 30px;">
            <p style="font-size: 12px; color: #666;">This is an automated email, please do not reply.</p>
          </div>
        `,
      };

      // Send email
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return false;
    }
  }
}

module.exports = new EmailService();

// Password Requirements Helper Text
