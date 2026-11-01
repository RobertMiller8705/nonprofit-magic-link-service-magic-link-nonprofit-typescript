import assert from "node:assert/strict";
import { sendMagicLink } from "./magic_link_service.js";

const sent: string[] = [];
const result = await sendMagicLink(
  { email: "donor@example.org", campaign: "winter-food" },
  "https://example.org/sign-in?token=test",
  { send: async (to, subject, body) => { sent.push(`${to}|${subject}|${body}`); return { message_id: "m_test" }; } }
);
assert.equal(result.donorReceipt.status, "pending");
assert.equal(result.report.signInRequested, 1);
assert.match(sent[0], /donor@example.org/);
assert.match(sent[0], /winter-food|sign-in/);
console.log("magic-link business decision: ok");
