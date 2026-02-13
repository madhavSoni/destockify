import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER || 'madhav.soni@bazar.earth',
        pass: process.env.EMAIL_PASSWORD || 'emps muyi tgte evmn'
    },
    from: `"${process.env.EMAIL_FROM_NAME || 'FindLiquidation'}" <${process.env.EMAIL_FROM || 'noreply@findliquidation.com'}>`
});

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@findliquidation.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://findliquidation.com';

export async function sendVerificationEmail(email: string, verificationToken: string) {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;

  try {
    await transporter.sendMail({
      to: email,
      subject: 'Verify your FindLiquidation account 🎉',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6; 
                color: #0f172a;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
              }
              .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background: white;
              }
              .header { 
                background: linear-gradient(135deg, #3388FF 0%, #2670E6 100%);
                color: white; 
                padding: 40px 30px; 
                text-align: center; 
                border-radius: 24px 24px 0 0;
                border: 3px solid rgba(2,6,23,0.85);
                border-bottom: none;
              }
              .header h1 {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
                font-size: 36px;
                margin: 0;
                font-weight: 700;
              }
              .content { 
                background: #ffffff;
                padding: 40px 30px;
                border-left: 3px solid rgba(2,6,23,0.85);
                border-right: 3px solid rgba(2,6,23,0.85);
              }
              .content p {
                font-size: 16px;
                margin: 16px 0;
                color: #334155;
              }
              .button-container {
                text-align: center;
                margin: 30px 0;
              }
              .button { 
                display: inline-block;
                background: #3388FF;
                color: white !important;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 16px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
                font-size: 18px;
                font-weight: 600;
                border: 2px solid rgba(2,6,23,0.85);
                box-shadow: 4px 5px 0 0 rgba(2,6,23,0.85);
                transition: all 0.2s;
              }
              .button:hover {
                transform: translateY(-2px);
                box-shadow: 5px 6px 0 0 rgba(2,6,23,0.85);
              }
              .link-text {
                background: #f1f5f9;
                padding: 12px;
                border-radius: 8px;
                word-break: break-all;
                color: #3388FF;
                font-size: 14px;
                border: 2px solid #e2e8f0;
              }
              .warning {
                background: #fef3c7;
                border: 2px solid #fbbf24;
                border-radius: 12px;
                padding: 16px;
                margin: 20px 0;
              }
              .warning strong {
                color: #92400e;
              }
              .footer { 
                text-align: center; 
                padding: 30px;
                color: #64748b;
                font-size: 14px;
                background: #f8fafc;
                border: 3px solid rgba(2,6,23,0.85);
                border-top: none;
                border-radius: 0 0 24px 24px;
              }
              .footer p {
                margin: 8px 0;
              }
              .emoji {
                font-size: 24px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to FindLiquidation! <span class="emoji">🎉</span></h1>
              </div>
              <div class="content">
                <p>Hi there,</p>
                <p>Thanks for signing up! We're excited to have you join our community of liquidation suppliers and buyers.</p>
                <p>To get started, please verify your email address by clicking the button below:</p>
                <div class="button-container">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                <p style="text-align: center; color: #64748b; font-size: 14px;">Or copy and paste this link into your browser:</p>
                <div class="link-text">${verificationUrl}</div>
                <div class="warning">
                  <strong>⏰ This link will expire in 24 hours.</strong>
                </div>
              </div>
              <div class="footer">
                <p>If you didn't create an account, you can safely ignore this email.</p>
                <p style="margin-top: 16px;">© ${new Date().getFullYear()} FindLiquidation. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `Welcome to FindLiquidation! 🎉\n\nThanks for signing up! Please verify your email by visiting: ${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, you can ignore this email.\n\n© ${new Date().getFullYear()} FindLiquidation. All rights reserved.`,
    });

    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your FindLiquidation password 🔒',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6; 
                color: #0f172a;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
              }
              .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background: white;
              }
              .header { 
                background: #dc2626;
                color: white; 
                padding: 40px 30px; 
                text-align: center; 
                border-radius: 24px 24px 0 0;
                border: 3px solid rgba(2,6,23,0.85);
                border-bottom: none;
              }
              .header h1 {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
                font-size: 36px;
                margin: 0;
                font-weight: 700;
              }
              .content { 
                background: #ffffff;
                padding: 40px 30px;
                border-left: 3px solid rgba(2,6,23,0.85);
                border-right: 3px solid rgba(2,6,23,0.85);
              }
              .content p {
                font-size: 16px;
                margin: 16px 0;
                color: #334155;
              }
              .button-container {
                text-align: center;
                margin: 30px 0;
              }
              .button { 
                display: inline-block;
                background: #dc2626;
                color: white !important;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 16px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
                font-size: 18px;
                font-weight: 600;
                border: 2px solid rgba(2,6,23,0.85);
                box-shadow: 4px 5px 0 0 rgba(2,6,23,0.85);
                transition: all 0.2s;
              }
              .button:hover {
                transform: translateY(-2px);
                box-shadow: 5px 6px 0 0 rgba(2,6,23,0.85);
                background: #b91c1c;
              }
              .link-text {
                background: #fef2f2;
                padding: 12px;
                border-radius: 8px;
                word-break: break-all;
                color: #dc2626;
                font-size: 14px;
                border: 2px solid #fecaca;
              }
              .warning {
                background: #fef3c7;
                border: 2px solid #fbbf24;
                border-radius: 12px;
                padding: 16px;
                margin: 20px 0;
              }
              .warning strong {
                color: #92400e;
              }
              .security-notice {
                background: #f1f5f9;
                border: 2px solid #cbd5e1;
                border-radius: 12px;
                padding: 16px;
                margin: 20px 0;
              }
              .security-notice strong {
                color: #334155;
              }
              .footer { 
                text-align: center; 
                padding: 30px;
                color: #64748b;
                font-size: 14px;
                background: #f8fafc;
                border: 3px solid rgba(2,6,23,0.85);
                border-top: none;
                border-radius: 0 0 24px 24px;
              }
              .footer p {
                margin: 8px 0;
              }
              .emoji {
                font-size: 24px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Reset Your Password <span class="emoji">🔒</span></h1>
              </div>
              <div class="content">
                <p>Hi there,</p>
                <p>We received a request to reset your FindLiquidation password. Click the button below to create a new password:</p>
                <div class="button-container">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                <p style="text-align: center; color: #64748b; font-size: 14px;">Or copy and paste this link into your browser:</p>
                <div class="link-text">${resetUrl}</div>
                <div class="warning">
                  <strong>⏰ This link will expire in 1 hour.</strong>
                </div>
                <div class="security-notice">
                  <strong>🛡️ Security Tip:</strong> If you didn't request a password reset, you can safely ignore this email. Your account is secure.
                </div>
              </div>
              <div class="footer">
                <p>For security reasons, this password reset link can only be used once.</p>
                <p style="margin-top: 16px;">© ${new Date().getFullYear()} FindLiquidation. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `Reset Your Password 🔒\n\nWe received a request to reset your FindLiquidation password.\n\nVisit this link to create a new password: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request a password reset, you can safely ignore this email.\n\n© ${new Date().getFullYear()} FindLiquidation. All rights reserved.`,
    });

    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw error;
  }
}

export async function sendSubmissionEmail(submission: any) {
  const adminEmail = process.env.ADMIN_EMAIL || 'listings@findliquidation.com';
  
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `New Listing Submission: ${submission.companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6; 
                color: #0f172a;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
              }
              .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background: white;
              }
              .header { 
                background: linear-gradient(135deg, #3388FF 0%, #2670E6 100%);
                color: white; 
                padding: 40px 30px; 
                text-align: center; 
                border-radius: 24px 24px 0 0;
              }
              .content { 
                background: #ffffff;
                padding: 40px 30px;
              }
              .field {
                margin: 16px 0;
                padding: 12px;
                background: #f8fafc;
                border-radius: 8px;
                border-left: 3px solid #3388FF;
              }
              .field-label {
                font-weight: 600;
                color: #334155;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
              }
              .field-value {
                color: #0f172a;
                font-size: 16px;
              }
              .footer { 
                text-align: center; 
                padding: 30px;
                color: #64748b;
                font-size: 14px;
                background: #f8fafc;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Listing Submission</h1>
              </div>
              <div class="content">
                <div class="field">
                  <div class="field-label">Company Name</div>
                  <div class="field-value">${submission.companyName}</div>
                </div>
                <div class="field">
                  <div class="field-label">Contact Email</div>
                  <div class="field-value">${submission.contactEmail}</div>
                </div>
                <div class="field">
                  <div class="field-label">Company Address</div>
                  <div class="field-value">${submission.companyAddress}</div>
                </div>
                ${submission.contactPhone ? `
                <div class="field">
                  <div class="field-label">Contact Phone</div>
                  <div class="field-value">${submission.contactPhone}</div>
                </div>
                ` : ''}
                ${submission.website ? `
                <div class="field">
                  <div class="field-label">Website</div>
                  <div class="field-value"><a href="${submission.website}">${submission.website}</a></div>
                </div>
                ` : ''}
                <div class="field">
                  <div class="field-label">Description</div>
                  <div class="field-value">${submission.description}</div>
                </div>
                ${submission.notes ? `
                <div class="field">
                  <div class="field-label">Additional Notes</div>
                  <div class="field-value">${submission.notes}</div>
                </div>
                ` : ''}
                <div class="field">
                  <div class="field-label">Submitted By</div>
                  <div class="field-value">${submission.customer.firstName} ${submission.customer.lastName} (${submission.customer.email})</div>
                </div>
                <div class="field">
                  <div class="field-label">Submission ID</div>
                  <div class="field-value">#${submission.id}</div>
                </div>
              </div>
              <div class="footer">
                <p>Review this submission in the admin panel.</p>
                <p style="margin-top: 16px;">© ${new Date().getFullYear()} Find Liquidation. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `New Listing Submission\n\nCompany: ${submission.companyName}\nContact: ${submission.contactEmail}\nAddress: ${submission.companyAddress}\n${submission.contactPhone ? `Phone: ${submission.contactPhone}\n` : ''}${submission.website ? `Website: ${submission.website}\n` : ''}\nDescription: ${submission.description}\n${submission.notes ? `Notes: ${submission.notes}\n` : ''}\nSubmitted by: ${submission.customer.firstName} ${submission.customer.lastName} (${submission.customer.email})\nSubmission ID: #${submission.id}`,
    });

    console.log(`✅ Submission email sent to ${adminEmail}`);
  } catch (error) {
    console.error('❌ Failed to send submission email:', error);
    throw error;
  }
}

export async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error);
    return false;
  }
}
