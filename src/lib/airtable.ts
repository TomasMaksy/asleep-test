const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_SOURCE_LENGTH = 200;
const MAX_NAME_LENGTH = 80;
const MAX_PHONE_LENGTH = 40;

export type EmailContactFields = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  cartBalance?: number;
};

type AirtableValue = string | number | boolean;

function isUnknownFieldError(detail: string) {
  return /UNKNOWN_FIELD_NAME|UNKNOWN_FIELD|invalid field/i.test(detail);
}

export function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return {};
  }
  if (parts.length === 1) {
    return { firstName: parts[0]?.slice(0, MAX_NAME_LENGTH) };
  }
  return {
    firstName: parts[0]?.slice(0, MAX_NAME_LENGTH),
    lastName: parts.slice(1).join(" ").slice(0, MAX_NAME_LENGTH),
  };
}

function contactFields(contact?: EmailContactFields) {
  if (!contact) {
    return {};
  }

  const fields: Record<string, AirtableValue> = {};
  const firstName = contact.firstName?.trim().slice(0, MAX_NAME_LENGTH);
  const lastName = contact.lastName?.trim().slice(0, MAX_NAME_LENGTH);
  const phone = contact.phone?.trim().slice(0, MAX_PHONE_LENGTH);
  const cartBalance = contact.cartBalance;

  if (firstName) {
    fields.Name = firstName;
  }
  if (lastName) {
    fields.Surname = lastName;
  }
  if (phone) {
    fields["Phone Number"] = phone;
  }
  if (
    typeof cartBalance === "number" &&
    Number.isFinite(cartBalance) &&
    cartBalance >= 0
  ) {
    fields["Cart Balance"] = Math.round(cartBalance * 100) / 100;
  }

  return fields;
}

function airtableUrl(baseId: string, tableId: string, query?: string) {
  const path = `https://api.airtable.com/v0/${baseId}/${tableId}`;
  return query ? `${path}?${query}` : path;
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

function credentials() {
  const token = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID;
  if (!token || !baseId || !tableId) {
    return null;
  }
  return { token, baseId, tableId };
}

function normalizeSource(source: string) {
  return source
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
}

function mergeSources(existing: string | undefined, incoming: string) {
  const next = normalizeSource(incoming);
  const parts = (existing ?? "")
    .split(/[|,]/)
    .map((part) => normalizeSource(part))
    .filter(Boolean);

  if (next && !parts.includes(next)) {
    parts.push(next);
  }

  return parts.join(", ").slice(0, MAX_SOURCE_LENGTH);
}

async function findEmailRecord(email: string) {
  const creds = credentials();
  if (!creds) {
    return null;
  }

  const formula = `{Email Address}='${email.replace(/'/g, "''")}'`;
  const url = airtableUrl(
    creds.baseId,
    creds.tableId,
    `filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`,
  );
  const response = await airtableFetch(url, creds.token);
  if (!response.ok) {
    const detail = await response.text();
    console.error("Airtable email lookup error:", response.status, detail);
    return null;
  }

  const json = (await response.json()) as {
    records?: Array<{ id: string; fields?: { Source?: string } }>;
  };
  return json.records?.[0] ?? null;
}

async function saveFields(
  creds: { token: string; baseId: string; tableId: string },
  method: "POST" | "PATCH",
  fields: Record<string, AirtableValue>,
  id?: string,
) {
  const payload = id
    ? { records: [{ id, fields }] }
    : { records: [{ fields }] };

  const response = await airtableFetch(
    airtableUrl(creds.baseId, creds.tableId),
    creds.token,
    {
      method,
      body: JSON.stringify(payload),
    },
  );

  if (response.ok) {
    return { ok: true as const };
  }

  const detail = await response.text();
  return { ok: false as const, status: response.status, detail };
}

/** One row per address. Source lists every place we saw it: website-footer, contact-form, checkout, … */
export async function saveEmail(
  email: string,
  source: string,
  contact?: EmailContactFields,
) {
  const trimmed = email.trim().toLowerCase();
  if (
    !trimmed ||
    trimmed.length > MAX_EMAIL_LENGTH ||
    !EMAIL_RE.test(trimmed)
  ) {
    return { ok: false as const, configured: true };
  }

  const creds = credentials();
  if (!creds) {
    return { ok: false as const, configured: false };
  }

  const extra = contactFields(contact);
  const existing = await findEmailRecord(trimmed);
  const sourceValue = mergeSources(existing?.fields?.Source, source);

  if (existing?.id) {
    const patchFields: Record<string, AirtableValue> = {
      Source: sourceValue,
      "Duplicate Flag": true,
      ...extra,
    };
    const patched = await saveFields(creds, "PATCH", patchFields, existing.id);
    if (patched.ok) {
      return { ok: true as const, configured: true, alreadySubscribed: true };
    }

    if (patched.status === 422 && isUnknownFieldError(patched.detail)) {
      console.warn(
        "Airtable is missing Name, Surname, Phone Number, Cart Balance, or Duplicate Flag. Add those columns to Email Signups.",
      );
      if (sourceValue !== (existing.fields?.Source ?? "").trim()) {
        const sourceOnly = await saveFields(
          creds,
          "PATCH",
          { Source: sourceValue },
          existing.id,
        );
        if (!sourceOnly.ok) {
          console.error(
            "Airtable email source update error:",
            sourceOnly.status,
            sourceOnly.detail,
          );
          return { ok: false as const, configured: true };
        }
      }
      return { ok: true as const, configured: true, alreadySubscribed: true };
    }

    console.error(
      "Airtable email source update error:",
      patched.status,
      patched.detail,
    );
    return { ok: false as const, configured: true };
  }

  const created = await saveFields(creds, "POST", {
    "Email Address": trimmed,
    Source: mergeSources("", source),
    "Duplicate Flag": false,
    ...extra,
  });

  if (created.ok) {
    return { ok: true as const, configured: true };
  }

  if (created.status === 422 && isUnknownFieldError(created.detail)) {
    console.warn(
      "Airtable is missing Name, Surname, Phone Number, Cart Balance, or Duplicate Flag. Add those columns to Email Signups.",
    );
    const emailOnly = await saveFields(creds, "POST", {
      "Email Address": trimmed,
      Source: mergeSources("", source),
    });
    if (emailOnly.ok) {
      return { ok: true as const, configured: true };
    }
    if (
      emailOnly.status === 422 &&
      /unique|duplicate|already/i.test(emailOnly.detail)
    ) {
      return { ok: true as const, configured: true, alreadySubscribed: true };
    }
    console.error(
      "Airtable email save error:",
      emailOnly.status,
      emailOnly.detail,
    );
    return { ok: false as const, configured: true };
  }

  if (
    created.status === 422 &&
    /unique|duplicate|already/i.test(created.detail)
  ) {
    return { ok: true as const, configured: true, alreadySubscribed: true };
  }

  console.error("Airtable email save error:", created.status, created.detail);
  return { ok: false as const, configured: true };
}

export { EMAIL_RE, MAX_EMAIL_LENGTH };
