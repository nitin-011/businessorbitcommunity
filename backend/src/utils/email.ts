import sgMail from '@sendgrid/mail';
import { config } from '../config/env';

if (config.sendgridApiKey) {
  sgMail.setApiKey(config.sendgridApiKey);
}

export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  if (!config.sendgridApiKey) {
    console.log('⚠️ SendGrid not configured. Welcome Email would be sent to:', to);
    return;
  }

  const msg = {
    to,
    from: config.senderEmail,
    subject: 'Welcome to Business Orbit Community! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #000;">Welcome to Business Orbit, ${name}!</h1>
        <p style="font-size: 16px; line-height: 1.6;">
          Thank you for applying to join our community. Your application has been received and is under review.
        </p>
        <div style="background: #f9f9f9; border-left: 4px solid #000; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0;">What's Next?</h3>
          <p>Our team will review your application and notify you via email once approved. This typically takes 1-2 business days.</p>
        </div>
        <div style="background: #000; color: #fff; padding: 20px; margin: 30px 0; text-align: center;">
          <h3 style="margin-top: 0;">Launching April 2024</h3>
          <p style="margin-bottom: 0;">Get ready for exclusive networking opportunities, events, and programs.</p>
        </div>
        <p style="color: #666; font-size: 14px;">Best regards,<br/>The Business Orbit Team</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Welcome email sent to:', to);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
};

export const sendBulkEmail = async (
  recipients: string[],
  subject: string,
  content: string
): Promise<void> => {
  if (!config.sendgridApiKey) {
    console.log('⚠️ SendGrid not configured. Bulk Email would be sent to:', recipients.length, 'recipients');
    return;
  }

  const msg = {
    to: recipients,
    from: config.senderEmail,
    subject,
    html: content,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Bulk email sent to', recipients.length, 'recipients');
  } catch (error) {
    console.error('❌ Error sending bulk email:', error);
    throw new Error('Failed to send bulk email');
  }
};

export const sendApprovalEmail = async (to: string, name: string, userType: 'student' | 'business'): Promise<void> => {
  if (!config.sendgridApiKey) {
    console.log('⚠️ SendGrid not configured. Approval Email would be sent to:', to);
    return;
  }

  const msg = {
    to,
    from: config.senderEmail,
    subject: 'Congratulations! Your Application Has Been Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #000;">🎉 Welcome to Business Orbit, ${name}!</h1>
        <p style="font-size: 16px; line-height: 1.6;">
          Great news! Your application has been approved. You are now part of the most action-oriented community.
        </p>
        <div style="background: #000; color: #fff; padding: 30px; margin: 30px 0; text-align: center;">
          <h2 style="margin: 0 0 10px 0;">You're In! ✅</h2>
          <p style="margin: 0;">Start connecting with ${userType === 'student' ? 'opportunities and events' : 'founders and business leaders'}</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6;">
          Watch your inbox for updates about upcoming events, networking opportunities, and exclusive programs.
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">Best regards,<br/>The Business Orbit Team</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Approval email sent to:', to);
  } catch (error) {
    console.error('❌ Error sending approval email:', error);
  }
};