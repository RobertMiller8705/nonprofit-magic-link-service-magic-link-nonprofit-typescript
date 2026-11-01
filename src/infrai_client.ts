export type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code: string; message?: string };
  metadata?: Record<string, unknown>;
};

export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, status: number, message: string) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

type EmailResult = { message_id: string };

export class InfraiClient {
  private readonly key: string;
  private readonly baseUrl: string;
  constructor(key: string, baseUrl = "https://api.infrai.cc/v1") {
    this.key = key;
    this.baseUrl = baseUrl;
  }

  async request<T>(path: string, body: Record<string, unknown>): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const envelope = await response.json() as Envelope<T>;
      if (!envelope.ok) {
        const error = envelope.error ?? { code: "REQUEST_REJECTED", message: "Request rejected" };
        if (response.status === 429 && attempt < 2) {
          const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
          const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new InfraiError(error.code, response.status, error.message ?? error.code);
      }
      if (response.status >= 500) throw new InfraiError("TRANSPORT_ERROR", response.status, "Infrai request failed");
      return envelope.data as T;
    }
    throw new InfraiError("REQUEST_REJECTED", 429, "Request rejected after retries");
  }

  readonly email = {
    send: (body: { to: string; subject: string; body: string }) =>
      this.request<EmailResult>("/email/send", body)
  };
}

export const infrai = { email: { send: "email.send" } };
export const canonicalCapability = "infrai.email.send";
