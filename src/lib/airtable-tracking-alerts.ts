/**
 * Ensures a "Tracking Alerts" Airtable table exists, then appends a row.
 * Uses the same base/token as Email Signups (`AIRTABLE_BASE_ID` / `AIRTABLE_API_KEY`).
 * Optional: set `AIRTABLE_TRACKING_ALERTS_TABLE_ID` to skip Meta API discovery.
 */

const TABLE_NAME = "Tracking Alerts";

type AlertFields = {
  occurredAt: string;
  eventName: string;
  source: string;
  cartIds: string;
  path: string;
  url: string;
  reason: string;
  environment: string;
};

let cachedTableId: string | null =
  process.env.AIRTABLE_TRACKING_ALERTS_TABLE_ID?.trim() || null;

function baseCredentials() {
  const token = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!token || !baseId) {
    return null;
  }
  return { token, baseId };
}

async function airtableFetch(url: string, token: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

async function listTables(token: string, baseId: string) {
  const response = await airtableFetch(
    `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
    token,
  );
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Airtable list tables ${response.status}: ${detail}`);
  }
  const json = (await response.json()) as {
    tables?: Array<{ id: string; name: string }>;
  };
  return json.tables ?? [];
}

async function createTrackingAlertsTable(token: string, baseId: string) {
  const response = await airtableFetch(
    `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
    token,
    {
      method: "POST",
      body: JSON.stringify({
        name: TABLE_NAME,
        description:
          "Auto-created when ecommerce tracking fails catalog lookup (ATC / checkout).",
        fields: [
          { name: "Occurred At", type: "singleLineText" },
          { name: "Event", type: "singleLineText" },
          { name: "Source", type: "singleLineText" },
          { name: "Cart IDs", type: "multilineText" },
          { name: "Path", type: "singleLineText" },
          { name: "URL", type: "singleLineText" },
          { name: "Reason", type: "singleLineText" },
          { name: "Environment", type: "singleLineText" },
        ],
      }),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    // Race: another instance created it first.
    if (response.status === 422 && /already exists|duplicate/i.test(detail)) {
      const tables = await listTables(token, baseId);
      const existing = tables.find((table) => table.name === TABLE_NAME);
      if (existing) {
        return existing.id;
      }
    }
    throw new Error(`Airtable create table ${response.status}: ${detail}`);
  }

  const json = (await response.json()) as { id?: string };
  if (!json.id) {
    throw new Error("Airtable create table returned no id.");
  }
  return json.id;
}

async function resolveTableId(token: string, baseId: string) {
  if (cachedTableId) {
    return cachedTableId;
  }

  const tables = await listTables(token, baseId);
  const existing = tables.find((table) => table.name === TABLE_NAME);
  if (existing) {
    cachedTableId = existing.id;
    return existing.id;
  }

  cachedTableId = await createTrackingAlertsTable(token, baseId);
  return cachedTableId;
}

export async function saveTrackingCatalogAlert(fields: AlertFields) {
  const creds = baseCredentials();
  if (!creds) {
    return { ok: false as const, configured: false };
  }

  try {
    const tableId = await resolveTableId(creds.token, creds.baseId);
    const response = await airtableFetch(
      `https://api.airtable.com/v0/${creds.baseId}/${tableId}`,
      creds.token,
      {
        method: "POST",
        body: JSON.stringify({
          records: [
            {
              fields: {
                "Occurred At": fields.occurredAt,
                Event: fields.eventName,
                Source: fields.source,
                "Cart IDs": fields.cartIds,
                Path: fields.path,
                URL: fields.url,
                Reason: fields.reason,
                Environment: fields.environment,
              },
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error("Airtable tracking alert error:", response.status, detail);
      return { ok: false as const, configured: true };
    }

    return { ok: true as const, configured: true, tableId };
  } catch (error) {
    console.error("Airtable tracking alert error:", error);
    return { ok: false as const, configured: true };
  }
}

export function resetTrackingAlertsTableCacheForTests() {
  cachedTableId =
    process.env.AIRTABLE_TRACKING_ALERTS_TABLE_ID?.trim() || null;
}
