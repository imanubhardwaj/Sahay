/**
 * Firebase Admin SDK – used for FCM topic subscription (server-side).
 * Supports either:
 * - FIREBASE_SERVICE_ACCOUNT_JSON (full JSON key as string), or
 * - FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 */

import * as admin from "firebase-admin";

let messaging: admin.messaging.Messaging | null = null;

function getMessaging(): admin.messaging.Messaging | null {
  if (messaging) return messaging;

  if (admin.apps.length > 0) {
    messaging = admin.messaging();
    return messaging;
  }

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (json) {
    try {
      const serviceAccount = JSON.parse(json) as admin.ServiceAccount;
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      messaging = admin.messaging();
      return messaging;
    } catch (e) {
      console.error(
        "[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:",
        e,
      );
      return null;
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        } as admin.ServiceAccount),
      });
      messaging = admin.messaging();
      return messaging;
    } catch (e) {
      console.error(
        "[Firebase Admin] Failed to initialize with projectId/clientEmail/privateKey:",
        e,
      );
      return null;
    }
  }

  console.warn(
    "[Firebase Admin] Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY for topic subscription",
  );
  return null;
}

/**
 * Subscribe one or more FCM registration tokens to a topic.
 * No-op if Firebase Admin is not configured.
 */
export async function subscribeToTopic(
  registrationTokens: string[],
  topic: string,
): Promise<{ successCount: number; failureCount: number }> {
  const msg = getMessaging();
  if (!msg || !registrationTokens.length) {
    return { successCount: 0, failureCount: registrationTokens.length || 0 };
  }
  const res = await msg.subscribeToTopic(registrationTokens, topic);
  return { successCount: res.successCount, failureCount: res.failureCount };
}

/**
 * Subscribe a single token to multiple topics.
 */
export async function subscribeTokenToTopics(
  token: string,
  topics: string[],
): Promise<{ subscribed: string[]; failed: string[] }> {
  const subscribed: string[] = [];
  const failed: string[] = [];
  for (const topic of topics) {
    if (!topic || typeof topic !== "string") continue;
    const { successCount, failureCount } = await subscribeToTopic(
      [token],
      topic,
    );
    if (successCount > 0) subscribed.push(topic);
    if (failureCount > 0) failed.push(topic);
  }
  return { subscribed, failed };
}

/**
 * Unsubscribe one or more FCM registration tokens from a topic.
 * No-op if Firebase Admin is not configured.
 */
export async function unsubscribeFromTopic(
  registrationTokens: string[],
  topic: string,
): Promise<{ successCount: number; failureCount: number }> {
  const msg = getMessaging();
  if (!msg || !registrationTokens.length) {
    return { successCount: 0, failureCount: registrationTokens.length || 0 };
  }
  const res = await msg.unsubscribeFromTopic(registrationTokens, topic);
  return { successCount: res.successCount, failureCount: res.failureCount };
}

/**
 * Unsubscribe a single token from multiple topics.
 */
export async function unsubscribeTokenFromTopics(
  token: string,
  topics: string[],
): Promise<{ unsubscribed: string[]; failed: string[] }> {
  const unsubscribed: string[] = [];
  const failed: string[] = [];
  for (const topic of topics) {
    if (!topic || typeof topic !== "string") continue;
    const { successCount, failureCount } = await unsubscribeFromTopic(
      [token],
      topic,
    );
    if (successCount > 0) unsubscribed.push(topic);
    if (failureCount > 0) failed.push(topic);
  }
  return { unsubscribed, failed };
}

export interface SendPushOptions {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  link?: string;
}

/**
 * Send a push notification to the given FCM tokens.
 * No-op if Firebase Admin is not configured or tokens array is empty.
 */
export async function sendPushToTokens(
  options: SendPushOptions,
): Promise<{ successCount: number; failureCount: number }> {
  const msg = getMessaging();
  if (!msg || !options.tokens.length) {
    return { successCount: 0, failureCount: options.tokens?.length || 0 };
  }

  const data: Record<string, string> = {
    title: options.title,
    body: options.body,
    ...(options.data || {}),
  };
  if (options.link) data.link = options.link;

  try {
    const message: admin.messaging.MulticastMessage = {
      tokens: options.tokens,
      notification: {
        title: options.title,
        body: options.body,
      },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v ?? "")]),
      ),
      webpush: {
        fcmOptions: {
          link: options.link || "/",
        },
      },
    };

    const res = await msg.sendEachForMulticast(message);
    return { successCount: res.successCount, failureCount: res.failureCount };
  } catch (error) {
    console.error("[Firebase Admin] sendPushToTokens error:", error);
    return { successCount: 0, failureCount: options.tokens.length };
  }
}

/**
 * Send a push notification to all devices subscribed to a topic
 * (e.g. new_courses, new_mentors, mentor_123).
 */
export async function sendPushToTopic(
  topic: string,
  options: Omit<SendPushOptions, "tokens">,
): Promise<boolean> {
  const msg = getMessaging();
  if (!msg || !topic) return false;

  const data: Record<string, string> = {
    title: options.title,
    body: options.body,
    ...(options.data || {}),
  };
  if (options.link) data.link = options.link;

  try {
    const message: admin.messaging.Message = {
      topic,
      notification: {
        title: options.title,
        body: options.body,
      },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v ?? "")]),
      ),
      webpush: {
        fcmOptions: {
          link: options.link || "/",
        },
      },
    };
    await msg.send(message);
    return true;
  } catch (error) {
    console.error("[Firebase Admin] sendPushToTopic error:", error);
    return false;
  }
}
