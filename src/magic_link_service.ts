import { z } from "zod";
import { InfraiClient } from "./infrai_client.js";

export const signInRequest = z.object({
  email: z.string().email(),
  campaign: z.string().min(1)
});

export type SignInRequest = z.infer<typeof signInRequest>;
export type CampaignPacket = {
  donorReceipt: { email: string; campaign: string; status: "pending" };
  volunteerReminder: { email: string; campaign: string; nextStep: string };
  report: { campaign: string; signInRequested: number };
  message_id?: string;
};

export interface LinkSender { send(to: string, subject: string, body: string): Promise<{ message_id: string }> }

export async function sendMagicLink(input: unknown, link: string, sender: LinkSender): Promise<CampaignPacket> {
  const request = signInRequest.parse(input);
  const result = await sender.send(request.email, "Your nonprofit sign-in link", `Open this link to continue: ${link}`);
  return {
    donorReceipt: { email: request.email, campaign: request.campaign, status: "pending" },
    volunteerReminder: { email: request.email, campaign: request.campaign, nextStep: "Confirm the donor receipt" },
    report: { campaign: request.campaign, signInRequested: 1 },
    message_id: result.message_id
  };
}

export function makeInfraiSender(client: InfraiClient): LinkSender {
  return { send: (to, subject, body) => client.email.send({ to, subject, body }) };
}
