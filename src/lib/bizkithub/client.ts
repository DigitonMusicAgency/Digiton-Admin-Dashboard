import "server-only";

import { getBizKitHubApiKey, getBizKitHubBaseUrl } from "@/lib/env";
import type {
  BizKitHubCustomerPayload,
  BizKitHubOrderPayload,
  BizKitHubSyncResponse,
} from "@/lib/bizkithub/types";

const BIZKITHUB_ENDPOINTS = {
  createCustomer: "/api/v1/customer/create",
  updateCustomer: "/api/v1/customer/update",
  createOrder: "/api/v1/shop/order/create",
  updateOrder: "/api/v1/shop/order/update",
} as const;

function ensureBizKitHubConfig() {
  const baseUrl = getBizKitHubBaseUrl().trim();
  const apiKey = getBizKitHubApiKey().trim();

  if (!baseUrl || !apiKey) {
    throw new Error(
      "BizKitHub neni nakonfigurovany. Doplň BIZKITHUB_API_BASE_URL a BIZKITHUB_API_KEY.",
    );
  }

  return { apiKey, baseUrl: baseUrl.replace(/\/+$/, "") };
}

function pickFirstString(value: unknown, paths: string[][]) {
  for (const path of paths) {
    let current: unknown = value;

    for (const key of path) {
      if (!current || typeof current !== "object" || !(key in current)) {
        current = undefined;
        break;
      }

      current = (current as Record<string, unknown>)[key];
    }

    if (typeof current === "string" && current.trim()) {
      return current.trim();
    }
  }

  return null;
}

function toErrorMessage(payload: unknown, statusText: string) {
  const knownMessage = pickFirstString(payload, [
    ["message"],
    ["error"],
    ["detail"],
    ["data", "message"],
  ]);

  return knownMessage ?? statusText;
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

async function bizKitHubRequest(
  endpoint: string,
  payload: Record<string, unknown>,
) {
  const { apiKey, baseUrl } = ensureBizKitHubConfig();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      apiKey,
      ...payload,
    }),
  });

  const parsed = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      `BizKitHub vratil ${response.status}: ${toErrorMessage(parsed, response.statusText)}`,
    );
  }

  return parsed;
}

function parseCustomerExternalId(payload: unknown) {
  return pickFirstString(payload, [
    ["cuRefNo"],
    ["customerRefNo"],
    ["customerId"],
    ["id"],
    ["data", "cuRefNo"],
    ["data", "customerRefNo"],
    ["data", "customerId"],
    ["data", "id"],
  ]);
}

function parseOrderExternalId(payload: unknown) {
  return pickFirstString(payload, [
    ["hash"],
    ["orderHash"],
    ["orderNumber"],
    ["id"],
    ["data", "hash"],
    ["data", "orderHash"],
    ["data", "orderNumber"],
    ["data", "id"],
  ]);
}

export async function syncBizKitHubCustomer(
  payload: BizKitHubCustomerPayload,
): Promise<BizKitHubSyncResponse> {
  const response = await bizKitHubRequest(BIZKITHUB_ENDPOINTS.createCustomer, payload);
  const externalId = parseCustomerExternalId(response);

  if (!externalId) {
    throw new Error("BizKitHub customer sync vratil odpoved bez customer ID.");
  }

  return { externalId, raw: response };
}

export async function updateBizKitHubCustomer(
  externalId: string,
  payload: BizKitHubCustomerPayload,
): Promise<BizKitHubSyncResponse> {
  try {
    const response = await bizKitHubRequest(BIZKITHUB_ENDPOINTS.updateCustomer, {
      customerId: externalId,
      cuRefNo: externalId,
      ...payload,
    });
    const parsedExternalId = parseCustomerExternalId(response) ?? externalId;

    return { externalId: parsedExternalId, raw: response };
  } catch {
    const fallbackResponse = await bizKitHubRequest(BIZKITHUB_ENDPOINTS.createCustomer, payload);
    const parsedExternalId = parseCustomerExternalId(fallbackResponse) ?? externalId;

    return { externalId: parsedExternalId, raw: fallbackResponse };
  }
}

export async function createBizKitHubOrder(
  payload: BizKitHubOrderPayload,
): Promise<BizKitHubSyncResponse> {
  const response = await bizKitHubRequest(BIZKITHUB_ENDPOINTS.createOrder, payload);
  const externalId = parseOrderExternalId(response);

  if (!externalId) {
    throw new Error("BizKitHub order sync vratil odpoved bez order ID.");
  }

  return { externalId, raw: response };
}

export async function updateBizKitHubOrder(
  externalId: string,
  payload: BizKitHubOrderPayload,
): Promise<BizKitHubSyncResponse> {
  const response = await bizKitHubRequest(BIZKITHUB_ENDPOINTS.updateOrder, {
    hash: externalId,
    orderHash: externalId,
    ...payload,
  });
  const parsedExternalId = parseOrderExternalId(response) ?? externalId;

  return { externalId: parsedExternalId, raw: response };
}
