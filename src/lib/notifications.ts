import Notification from "@/models/Notification";
import connectDB from "./mongodb";

export interface NotificationData {
  userId: string;
  type:
    | "booking_request"
    | "booking_confirmed"
    | "booking_cancelled"
    | "booking_completed"
    | "session_reminder"
    | "payment_received"
    | "payment_refunded"
    | "mentor_approved"
    | "mentor_rejected"
    | "new_message"
    | "system_update";
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Create a notification and emit it via Socket.io if available
 */
export async function createNotification(notificationData: NotificationData) {
  try {
    await connectDB();

    const notification = await Notification.create({
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data || {},
    });

    // Emit notification via Socket.io if server is available
    try {
      const { getIO } = await import("@/lib/socket");
      const io = getIO();
      if (
        io &&
        typeof (io as unknown as { to: (userId: string) => void }).to ===
          "function"
      ) {
        (
          io as unknown as {
            to: (userId: string) => {
              emit: (event: string, data: unknown) => void;
            };
          }
        )
          .to(notificationData.userId)
          .emit("notification", {
            _id: notification._id.toString(),
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            read: notification.read,
            createdAt: notification.createdAt,
          });
        console.log(
          `📤 Notification emitted to user ${notificationData.userId}`
        );
      } else {
        console.log("Socket.io not initialized, notification saved to DB only");
      }
    } catch (socketError) {
      // Socket.io not available, continue without real-time emit
      console.log(
        "Socket.io not available, notification saved to DB:",
        socketError
      );
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

/**
 * Create notification for booking events
 */
export async function notifyBookingEvent(
  userId: string,
  type:
    | "booking_request"
    | "booking_confirmed"
    | "booking_cancelled"
    | "booking_completed",
  bookingData: {
    bookingId: string;
    mentorName?: string;
    studentName?: string;
    sessionDate?: string;
    sessionTime?: string;
    price?: number;
  }
) {
  const messages = {
    booking_request: {
      title: "New Booking Request",
      message: `${
        bookingData.studentName || "A student"
      } requested to book a session with you`,
    },
    booking_confirmed: {
      title: "Booking Confirmed",
      message: `Your session with ${
        bookingData.mentorName || "the mentor"
      } has been confirmed`,
    },
    booking_cancelled: {
      title: "Booking Cancelled",
      message: `Your session scheduled for ${bookingData.sessionDate} has been cancelled`,
    },
    booking_completed: {
      title: "Session Completed",
      message: `Your session with ${
        bookingData.mentorName || "the mentor"
      } has been completed`,
    },
  };

  return createNotification({
    userId,
    type,
    title: messages[type].title,
    message: messages[type].message,
    data: bookingData,
  });
}
