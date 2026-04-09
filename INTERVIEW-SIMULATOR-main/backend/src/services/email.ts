import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import crypto from 'crypto';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.secure,
      auth: {
        user: config.mail.auth.user,
        pass: config.mail.auth.pass,
      },
    });
  }

  async sendResetPasswordEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: '"InterYou" <noreply@ineryou.com>',
      to: email,
      subject: 'Reset Your Password - InterYou',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f766e;">Reset Your Password</h2>
          <p>You requested to reset your password. Click the button below to create a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(to right, #0d9488, #10b981); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
          <p style="color: #64748b; font-size: 14px;">This link will expire in 1 hour.</p>
          <p style="color: #64748b; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordChangedEmail(email: string): Promise<void> {
    const mailOptions = {
      from: '"InterYou" <noreply@ineryou.com>',
      to: email,
      subject: 'Your Password Has Been Changed - InterYou',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f766e;">Password Changed Successfully</h2>
          <p>Your password has been changed successfully. If you didn't make this change, please contact us immediately.</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export const emailService = new EmailService();

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
