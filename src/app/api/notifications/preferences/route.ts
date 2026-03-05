import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-api";

export const runtime = "nodejs";

const PREF_KEYS = [
  "bookingRequest", "bookingConfirmed", "bookingCancelled", "bookingCompleted",
  "sessionReminder", "paymentReceived", "paymentRefunded", "mentorApproved",
  "mentorRejected", "newMessage", "systemUpdate", "system",
] as const;

function parsePreferences(obj: unknown): Record<string, boolean> | null {
  if (!obj || typeof obj !== "object") return null;
  const out: Record<string, boolean> = {};
  for (const key of PREF_KEYS) {
    const v = (obj as Record<string, unknown>)[key];
    if (typeof v === "boolean") out[key] = v;
  }
  return Object.keys(out).length > 0 ? out : null;
}

/**
 * GET /api/notifications/preferences - Get user notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId } = authResult;
    const preferencesCollection = await getCollection("notificationPreferences");

    const preferences = await preferencesCollection.findOne({ userId });

    // Default preferences if none exist (Sahay notification types)
    const defaultPreferences = {
      email: {
        bookingRequest: true,
        bookingConfirmed: true,
        bookingCancelled: true,
        bookingCompleted: true,
        sessionReminder: true,
        paymentReceived: true,
        paymentRefunded: true,
        mentorApproved: true,
        mentorRejected: true,
        newMessage: true,
        systemUpdate: true,
        system: true,
      },
      push: {
        bookingRequest: true,
        bookingConfirmed: true,
        bookingCancelled: true,
        bookingCompleted: true,
        sessionReminder: true,
        paymentReceived: true,
        paymentRefunded: true,
        mentorApproved: true,
        mentorRejected: true,
        newMessage: true,
        systemUpdate: true,
        system: true,
      },
      inApp: {
        bookingRequest: true,
        bookingConfirmed: true,
        bookingCancelled: true,
        bookingCompleted: true,
        sessionReminder: true,
        paymentReceived: true,
        paymentRefunded: true,
        mentorApproved: true,
        mentorRejected: true,
        newMessage: true,
        systemUpdate: true,
        system: true,
      },
    };

    return NextResponse.json({
      success: true,
      preferences: preferences?.preferences || defaultPreferences,
    });
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/preferences - Update user notification preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId } = authResult;
    const body = (await request.json()) as Record<string, unknown>;

    const preferencesCollection = await getCollection<{
      userId: string;
      preferences?: { email?: Record<string, boolean>; push?: Record<string, boolean>; inApp?: Record<string, boolean> };
    }>("notificationPreferences");

    // Get existing preferences
    const existing = await preferencesCollection.findOne({ userId });
    const currentPreferences = existing?.preferences || {
      email: {},
      push: {},
      inApp: {},
    };

    const emailPrefs = parsePreferences(body.email);
    const pushPrefs = parsePreferences(body.push);
    const inAppPrefs = parsePreferences(body.inApp);

    const updatedPreferences = {
      email: { ...currentPreferences.email, ...(emailPrefs ?? {}) },
      push: { ...currentPreferences.push, ...(pushPrefs ?? {}) },
      inApp: { ...currentPreferences.inApp, ...(inAppPrefs ?? {}) },
    };

    await preferencesCollection.updateOne(
      { userId },
      {
        $set: {
          preferences: updatedPreferences,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Preferences updated",
      preferences: updatedPreferences,
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
