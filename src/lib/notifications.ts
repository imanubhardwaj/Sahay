/**
 * Notification service for sending notifications via different channels
 */

import { sendEmail } from "./resend";

export interface NotificationLike {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, unknown>;
  isRead?: boolean;
  createdAt?: Date;
}

interface NotificationPreferences {
  email?: {
    [key: string]: boolean;
  };
  push?: {
    [key: string]: boolean;
  };
  inApp?: {
    [key: string]: boolean;
  };
}

/**
 * Get notification type key from notification type
 */
function getNotificationTypeKey(type: string): string {
  const typeMap: Record<string, string> = {
    booking_request: "bookingRequest",
    booking_confirmed: "bookingConfirmed",
    booking_cancelled: "bookingCancelled",
    booking_completed: "bookingCompleted",
    session_reminder: "sessionReminder",
    payment_received: "paymentReceived",
    payment_refunded: "paymentRefunded",
    mentor_approved: "mentorApproved",
    mentor_rejected: "mentorRejected",
    new_message: "newMessage",
    system_update: "systemUpdate",
  };
  return typeMap[type] || "system";
}

/**
 * Send email notification
 */
export async function sendEmailNotification(
  email: string,
  notification: NotificationLike,
  preferences?: NotificationPreferences,
): Promise<{ success: boolean; error?: string }> {
  // Check if email notifications are enabled for this type
  const typeKey = getNotificationTypeKey(notification.type);
  if (preferences?.email?.[typeKey] === false) {
    return { success: true }; // Not an error, just disabled
  }

  const subject = notification.title;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Sahay</h1>
        </div>
        <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <h2 style="color: #111827; margin-top: 0;">${notification.title}</h2>
          <p style="color: #6b7280; font-size: 16px;">
            ${notification.message}
          </p>
          ${
            notification.link
              ? `
            <div style="margin: 30px 0; text-align: center;">
              <a href="${notification.link}" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                View Details
              </a>
            </div>
          `
              : ""
          }
          <p style="color: #9ca3af; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            © ${new Date().getFullYear()} Sahay. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  const result = await sendEmail({ to: email, subject, html });
  return { success: result.success, error: result.error };
}

/**
 * Send browser push notification
 */
export async function sendPushNotification(
  notification: NotificationLike,
  preferences?: NotificationPreferences,
): Promise<{ success: boolean; error?: string }> {
  // Check if push notifications are enabled for this type
  const typeKey = getNotificationTypeKey(notification.type);
  if (preferences?.push?.[typeKey] === false) {
    return { success: true }; // Not an error, just disabled
  }

  // This would be called from the client side
  // The actual push notification is handled by the browser Notification API
  return { success: true };
}

/**
 * Check if user has permission for push notifications
 */
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Show browser push notification
 */
export function showPushNotification(notification: NotificationLike): void {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(notification.title, {
      body: notification.message,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: notification._id,
      data: notification.link,
    });
  }
}
