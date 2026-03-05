#!/usr/bin/env node
/**
 * Injects Firebase env vars into public/firebase-messaging-sw.js.
 * Run before dev/build so the service worker has valid config.
 */
const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.join(process.cwd(), ".env") });

const SW_PATH = path.join(process.cwd(), "public", "firebase-messaging-sw.js");

const replacements = [
  ["__NEXT_PUBLIC_FIREBASE_API_KEY__", process.env.NEXT_PUBLIC_FIREBASE_API_KEY],
  ["__NEXT_PUBLIC_FIREBASE_PROJECT_ID__", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID],
  ["__NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID__", process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID],
  ["__NEXT_PUBLIC_FIREBASE_APP_ID__", process.env.NEXT_PUBLIC_FIREBASE_APP_ID],
];

let content = fs.readFileSync(SW_PATH, "utf8");
for (const [placeholder, value] of replacements) {
  content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), value || placeholder);
}
fs.writeFileSync(SW_PATH, content);
console.log("[inject-firebase-sw] Firebase config injected into service worker");
