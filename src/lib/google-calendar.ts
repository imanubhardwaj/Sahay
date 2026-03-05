/**
 * Google Calendar API Integration for Google Meet links
 *
 * Setup:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create project, enable Google Calendar API
 * 3. Create OAuth 2.0 credentials (Web application)
 * 4. Add redirect URI: {APP_URL}/api/mentor-profile/google/callback
 * 5. Add env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 */

import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

export function getGoogleAuthUrl(userId: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/mentor-profile/google/callback`;

  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state: userId,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiryDate: Date;
} | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/mentor-profile/google/callback`;

  if (!clientId || !clientSecret) {
    console.error("Missing Google OAuth credentials");
    return null;
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.access_token || !tokens.refresh_token) {
      console.error("Google tokens missing access_token or refresh_token");
      return null;
    }

    const expiryDate = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000);

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate,
    };
  } catch (error) {
    console.error("Error exchanging Google code for tokens:", error);
    return null;
  }
}

export async function getGoogleAuthClient(
  accessToken: string,
  refreshToken: string
) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/mentor-profile/google/callback`;

  if (!clientId || !clientSecret) return null;

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return oauth2Client;
}

export interface CreateMeetEventParams {
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  timezone?: string;
  accessToken: string;
  refreshToken: string;
}

export interface MeetEventResult {
  hangoutLink: string;
  eventId: string;
}

export async function createGoogleMeetEvent(
  params: CreateMeetEventParams
): Promise<MeetEventResult | null> {
  try {
    const auth = await getGoogleAuthClient(
      params.accessToken,
      params.refreshToken
    );
    if (!auth) return null;

    const calendar = google.calendar({ version: "v3", auth });
    const timezone = params.timezone || "Asia/Kolkata";

    const event = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary: params.summary,
        description: params.description || "Mentorship session",
        start: {
          dateTime: params.startTime.toISOString(),
          timeZone: timezone,
        },
        end: {
          dateTime: params.endTime.toISOString(),
          timeZone: timezone,
        },
        conferenceData: {
          createRequest: {
            requestId: `sahay-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
      },
    });

    const hangoutLink = event.data.hangoutLink;
    const eventId = event.data.id;

    if (!hangoutLink || !eventId) {
      console.error("Google Calendar did not return hangout link");
      return null;
    }

    return { hangoutLink, eventId };
  } catch (error) {
    console.error("Error creating Google Meet event:", error);
    return null;
  }
}
