import { InfraiClient } from "./infrai_client.js";
import { makeInfraiSender, sendMagicLink } from "./magic_link_service.js";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY before running the demo");
const recipient = process.env.DEMO_RECIPIENT;
if (!recipient) throw new Error("Set DEMO_RECIPIENT before running the demo");
const client = new InfraiClient(key);
const result = await sendMagicLink(
  { email: recipient, campaign: "winter-food" },
  "https://nonprofit.example.org/sign-in?token=sample",
  makeInfraiSender(client)
);
console.log(JSON.stringify({ message_id: result.message_id, report: result.report }));
