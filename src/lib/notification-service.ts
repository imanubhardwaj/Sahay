/**
 * Centralized notification service
 * Handles creating notifications and sending them via different channels
 */

import mongoose from "mongoose";
import { getCollection } from "@/lib/mongodb";
import { sendEmailNotification } from "./notifications";
import { sendPushToTokens } from "./firebase-admin";

interface CreateNotificationOptions {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, unknown>;
}

/**
 * Create a notification and send it via enabled channels (in-app, email, push)
 */
export async function createNotification(
  options: CreateNotificationOptions,
): Promise<{ success: boolean; notificationId?: string }> {
  try {
    const notificationsCollection = await getCollection("notifications");
    const usersCollection = await getCollection<{
      _id: unknown;
      email?: string;
    }>("users");
    const preferencesCollection = await getCollection<{
      userId: string;
      preferences?: Record<string, unknown>;
    }>("notificationPreferences");

    // Get user email
    const user = await usersCollection.findOne({
      _id: new mongoose.Types.ObjectId(options.userId),
    });
    if (!user) {
      return { success: false };
    }

    // Get user preferences
    const preferencesDoc = await preferencesCollection.findOne({
      userId: options.userId,
    });
    const preferences: Record<string, Record<string, unknown>> =
      (preferencesDoc?.preferences as Record<string, Record<string, unknown>>) ||
      {
        email: {},
        push: {},
        inApp: {},
      };

    // Create notification in database
    const notification = {
      userId: new mongoose.Types.ObjectId(options.userId),
      type: options.type,
      title: options.title,
      message: options.message,
      link: options.link,
      data: options.data || {},
      read: false,
      createdAt: new Date(),
    };

    const result = await notificationsCollection.insertOne(
      notification as unknown as Parameters<
        typeof notificationsCollection.insertOne
      >[0],
    );
    const notificationId = result.insertedId.toString();

    const typeKey = getNotificationTypeKey(options.type);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const fullLink = options.link ? `${appUrl}${options.link}` : appUrl;

    // Send email notification if enabled
    if (user.email && preferences.email?.[typeKey] !== false) {
      sendEmailNotification(
        user.email,
        {
          _id: notificationId,
          userId: options.userId,
          type: options.type,
          title: options.title,
          message: options.message,
          link: fullLink,
          data: options.data,
          isRead: false,
          createdAt: notification.createdAt,
        },
        preferences,
      ).catch((error) => {
        console.error("Error sending email notification:", error);
      });
    }

    // Send FCM push notification if enabled
    if (preferences.push?.[typeKey] !== false) {
      getFCMTokensForUser(options.userId).then((tokens) => {
        const tokenList = tokens.map((t) => t.token).filter(Boolean);
        if (tokenList.length > 0) {
          const data: Record<string, string> = {
            notificationId,
            type: options.type,
            ...(options.data
              ? Object.fromEntries(
                  Object.entries(options.data).map(([k, v]) => [
                    k,
                    String(v ?? ""),
                  ]),
                )
              : {}),
          };
          sendPushToTokens({
            tokens: tokenList,
            title: options.title,
            body: options.message,
            data,
            link: fullLink,
          }).then(({ successCount, failureCount }) => {
            if (failureCount > 0) {
              console.warn(
                `[Notifications] Push: ${successCount} sent, ${failureCount} failed for user ${options.userId}`,
              );
            }
          });
        }
      });
    }

    return { success: true, notificationId };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false };
  }
}

/**
 * Get all FCM tokens for a user (from DB). Use when sending push notifications.
 */
export async function getFCMTokensForUser(
  userId: string,
): Promise<{ token: string; platform: string }[]> {
  const coll = await getCollection<{
    userId: string;
    token: string;
    platform: string;
  }>("fcm_tokens");
  const docs = await coll
    .find({ userId })
    .project({ token: 1, platform: 1 })
    .toArray();
  return (docs as { token: string; platform: string }[]).map((d) => ({
    token: d.token,
    platform: d.platform,
  }));
}

/**
 * Get notification type key from notification type (Sahay notification types)
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

/** Booking event notification type */
type BookingEventType =
  | "booking_request"
  | "booking_confirmed"
  | "booking_cancelled";

const BOOKING_MESSAGES: Record<
  BookingEventType,
  (data: Record<string, unknown>) => { title: string; message: string }
> = {
  booking_request: (d) => ({
    title: "New Session Request",
    message: d.studentName
      ? `${d.studentName} requested a session`
      : d.mentorName
        ? `${d.mentorName} has a new session request`
        : "You have a new session request",
  }),
  booking_confirmed: (d) => ({
    title: "Session Confirmed",
    message: d.mentorName
      ? `Your session with ${d.mentorName} is confirmed`
      : d.studentName
        ? `Session with ${d.studentName} confirmed`
        : "Your session has been confirmed",
  }),
  booking_cancelled: (d) => ({
    title: "Session Cancelled",
    message: d.mentorName
      ? `Session with ${d.mentorName} was cancelled`
      : "Your session has been cancelled",
  }),
};

/**
 * Notify a user about a booking event (in-app, email, push).
 */
export async function notifyBookingEvent(
  userId: string,
  type: BookingEventType,
  data: Record<string, unknown>,
): Promise<void> {
  const fn = BOOKING_MESSAGES[type];
  if (!fn) return;
  const { title, message } = fn(data);
  const link = "/dashboard/sessions";
  await createNotification({
    userId,
    type,
    title,
    message,
    link,
    data,
  });
}
