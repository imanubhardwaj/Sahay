/**
 * Email sending via Resend API.
 */

import { Resend } from "resend";

const EMAIL_SENDER =
  process.env.EMAIL_FROM ||
  process.env.EMAIL_USER ||
  "onboarding@resend.dev";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { error } = await resend.emails.send({
      from: `Sahay <${EMAIL_SENDER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error("Error sending email:", err);
    return {
      success: false,
      error: (err as Error).message,
    };
  }
}
