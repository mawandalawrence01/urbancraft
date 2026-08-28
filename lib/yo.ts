/**
 * Yo! Payments (Uganda) client — API spec v3.48.
 *
 * We use the "Pull" deposit method (`acdepositfunds`): the customer receives an
 * on-screen authorisation prompt on their handset and the transaction only
 * completes once they approve it. Requests are non-blocking, so we record the
 * TransactionReference and reconcile through the IPN callback, with
 * `actransactioncheckstatus` as the polling fallback.
 *
 * Docs: https://www.yo.co.ug — sandbox at sandbox.yo.co.ug
 */
import { createVerify } from "node:crypto";

const API_URL =
  process.env.YO_API_URL ?? "https://sandbox.yo.co.ug/services/yopaymentsdev/task.php";

export type YoTransactionStatus =
  | "SUCCEEDED"
  | "PENDING"
  | "FAILED"
  | "INDETERMINATE";

export type YoResult = {
  ok: boolean;
  status: YoTransactionStatus | "ERROR";
  statusCode: string | null;
  statusMessage: string | null;
  transactionReference: string | null;
  mnoTransactionReferenceId: string | null;
  raw: Record<string, string>;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** The API returns flat XML, so a tag scan is enough — no parser dependency. */
function readTag(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? m[1].trim() : null;
}

function parseResponse(xml: string): YoResult {
  const raw: Record<string, string> = {};
  for (const m of xml.matchAll(/<([A-Za-z]+)>([^<]*)<\/\1>/g)) raw[m[1]] = m[2].trim();

  const status = readTag(xml, "Status");
  const txStatus = (readTag(xml, "TransactionStatus") ?? "").toUpperCase();

  return {
    ok: status === "OK",
    status: (txStatus || (status === "OK" ? "SUCCEEDED" : "ERROR")) as YoResult["status"],
    statusCode: readTag(xml, "StatusCode"),
    statusMessage: readTag(xml, "StatusMessage") ?? readTag(xml, "ErrorMessage"),
    transactionReference: readTag(xml, "TransactionReference"),
    mnoTransactionReferenceId: readTag(xml, "MNOTransactionReferenceId"),
    raw,
  };
}

async function call(fields: Record<string, string | undefined>): Promise<YoResult> {
  const username = process.env.YO_API_USERNAME;
  const password = process.env.YO_API_PASSWORD;

  if (!username || !password) {
    return {
      ok: false,
      status: "ERROR",
      statusCode: "NOT_CONFIGURED",
      statusMessage:
        "Mobile money is not configured yet. Set YO_API_USERNAME and YO_API_PASSWORD.",
      transactionReference: null,
      mnoTransactionReferenceId: null,
      raw: {},
    };
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<AutoCreate><Request>",
    `<APIUsername>${escapeXml(username)}</APIUsername>`,
    `<APIPassword>${escapeXml(password)}</APIPassword>`,
    ...Object.entries(fields)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => `<${k}>${escapeXml(String(v))}</${k}>`),
    "</Request></AutoCreate>",
  ].join("");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
        "Content-Transfer-Encoding": "text",
        Accept: "text/xml",
      },
      body,
      // The provider can be slow; fail before the platform's own timeout bites.
      signal: AbortSignal.timeout(45_000),
      cache: "no-store",
    });

    const text = await res.text();
    if (!res.ok) {
      return {
        ok: false, status: "ERROR", statusCode: String(res.status),
        statusMessage: `Payment gateway returned ${res.status}`,
        transactionReference: null, mnoTransactionReferenceId: null,
        raw: { body: text.slice(0, 2000) },
      };
    }
    return parseResponse(text);
  } catch (error) {
    return {
      ok: false, status: "ERROR", statusCode: "NETWORK",
      statusMessage:
        error instanceof Error && error.name === "TimeoutError"
          ? "The payment gateway did not respond in time. Your order is saved — please try again."
          : "Could not reach the payment gateway.",
      transactionReference: null, mnoTransactionReferenceId: null, raw: {},
    };
  }
}

/**
 * Requests funds from a customer's mobile money wallet.
 * `externalReference` should be the order number so IPNs can be correlated.
 */
export function requestDeposit(params: {
  msisdn: string;
  amount: number;
  narrative: string;
  externalReference: string;
  instantNotificationUrl?: string;
  failureNotificationUrl?: string;
  providerCode?: "MTN_UGANDA" | "AIRTEL_UGANDA";
}) {
  return call({
    Method: "acdepositfunds",
    NonBlocking: "TRUE",
    Amount: String(params.amount),
    Account: params.msisdn,
    AccountProviderCode: params.providerCode,
    Narrative: params.narrative.slice(0, 4096),
    ExternalReference: params.externalReference,
    ProviderReferenceText: params.externalReference,
    InstantNotificationUrl: params.instantNotificationUrl,
    FailureNotificationUrl: params.failureNotificationUrl,
  });
}

export function checkStatus(params: {
  transactionReference?: string;
  externalReference?: string;
}) {
  return call({
    Method: "actransactioncheckstatus",
    TransactionReference: params.transactionReference,
    PrivateTransactionReference: params.externalReference,
    DepositTransactionType: "PULL",
  });
}

/**
 * IPN authenticity check. Yo! signs the concatenation of six fields, in this
 * exact order, with their private key; we verify against the public key they
 * issue. Without YO_PUBLIC_KEY configured we cannot verify, so we refuse.
 */
export function verifyIpnSignature(params: {
  date_time: string;
  amount: string;
  narrative: string;
  network_ref: string;
  external_ref: string;
  msisdn: string;
  signature: string;
}): boolean {
  const pem = process.env.YO_PUBLIC_KEY?.replace(/\\n/g, "\n");
  if (!pem) return false;

  const payload =
    params.date_time + params.amount + params.narrative +
    params.network_ref + params.external_ref + params.msisdn;

  try {
    const verifier = createVerify("RSA-SHA1");
    verifier.update(payload, "utf8");
    verifier.end();
    return verifier.verify(pem, params.signature, "base64");
  } catch {
    return false;
  }
}

export function isConfigured() {
  return Boolean(process.env.YO_API_USERNAME && process.env.YO_API_PASSWORD);
}
