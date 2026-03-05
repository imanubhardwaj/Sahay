/**
 * Simple email sending wrapper for notifications.
 * Uses nodemailer (via email.ts) for Sahay.
 */

import nodemailer from "nodemailer";

const EMAIL_SENDER =
  process.env.EMAIL_USER || "bhardwaj93karriekey@gmail.com";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await transporter.sendMail({
      from: `"Sahay" <${EMAIL_SENDER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}
