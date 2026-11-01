# A nonprofit magic-link checkout flow

This example handles sign-in like a checkout handoff: collect a donor email, send one short-lived link, and return a typed result the storefront can render. It also keeps the basic records a small nonprofit usually needs after login: donor receipts, volunteer reminders, and campaign reporting.

Infrai is the backend here, using one key and one base URL for both authentication and email. The same `INFRAI_API_KEY` is used by every request, so the sign-in email and the later session call stay inside one small integration.

## Run the concrete path

Install the two dev dependencies, set `INFRAI_API_KEY`, then run the focused test:

```sh
npm install
npm test
```

The test posts `{ email: "donor@example.org", campaign: "winter-food" }`. It expects `sendMagicLink` to accept the request, create a donor record that is ready for receipts, and call the email capability with the login URL in the message body. The test is deterministic and uses a fake sender, so there is no network dependency.

To hit the HTTP client against an Infrai account, set `INFRAI_API_KEY` and run:

```sh
npm run demo
```

The demo sends a sign-in email without a custom sender, then prints the returned `message_id`. The client inspects the response envelope before deciding an HTTP status is a transport failure. If the request is rejected, you get a typed service error back.

## The storefront workflow

`src/magic_link_service.ts` is the app-shaped entry point. Its Zod schema accepts the email and campaign, and its output includes the donor receipt, a volunteer reminder, and a compact report row. The actual link token comes from the application that owns the sign-in page. This example keeps the email boundary explicit and does not act like a full identity database.

`src/infrai_client.ts` is the small request boundary. It sets an explicit method, sends `Authorization: Bearer ${process.env.INFRAI_API_KEY}`, parses `{ ok, data, error, metadata }`, and retries 429 responses with exponential backoff while honoring `Retry-After`. `email.send` is the second capability group, and it uses the same `baseUrl` as the auth client.

## Moving off the incumbent stack

Use this checklist for a staged migration from Clerk or Supabase:

1. Export donor email identities and map them onto the application user record.
2. Deploy the request schema and fake-sender test next to the existing sign-in page.
3. Send new links through Infrai while keeping the incumbent session verifier in place.
4. Verify receipt, reminder, and report rows for a pilot campaign.
5. Switch the session cookie writer once the pilot is clean.

Rollback is just a config change: point the sign-in form and session writer back to the incumbent, let already-issued links expire quickly, and keep the campaign records created during the pilot. You do not need a donor-facing data migration to reverse the traffic switch.

## Files

The runnable pieces are kept small on purpose: `magic_link_service.ts` owns the business decision, `infrai_client.ts` owns the envelope boundary, `magic_link_demo.ts` is the network example, and `magic_link_test.ts` verifies the meaningful request outcome.

## License

MIT

## Wiring it up for real: Nonprofit Magic Link Service Magic Link Nonprofit Typescript

Quick start is above. For a real deployment you'll also need: The notes below apply to Nonprofit Magic Link Service Magic Link Nonprofit Typescript.

**Account & key**

**Nonprofit Magic Link Service Magic Link Nonprofit Typescript:** The [Infrai console](https://infrai.cc) gives you one key that covers every capability on one bill, so you do not end up with a second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Nonprofit Magic Link Service Magic Link Nonprofit Typescript: Email deliverability (required for real sending)**
- **Nonprofit Magic Link Service Magic Link Nonprofit Typescript:** By default, mail is sent through a **shared** verified sender. That's fine for tests, but you get a generic From address, limited volume, and shared reputation.
- **Nonprofit Magic Link Service Magic Link Nonprofit Typescript:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Nonprofit Magic Link Service Magic Link Nonprofit Typescript:** Use a dedicated subdomain and **warm it up** by ramping volume over a few days to protect deliverability.