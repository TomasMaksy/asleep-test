import { normalizePhoneE164 } from "@/lib/tracking/phone";

export type MetaContact = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  postal?: string;
  country?: string;
};

const externalIdCache = new Map<string, string>();

export function normalizeMetaEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeMetaText(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeMetaCity(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function normalizeMetaPostal(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]/g, "");
}

export async function sha256Hex(value: string) {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("SHA-256 is unavailable.");
  }

  const digest = await subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function hashMetaExternalId(visitorId: string) {
  const cached = externalIdCache.get(visitorId);
  if (cached) {
    return cached;
  }

  const hashed = await sha256Hex(visitorId);
  externalIdCache.set(visitorId, hashed);
  return hashed;
}

export function buildMetaPixelUserData(
  contact: MetaContact = {},
  hashedExternalId?: string,
) {
  return compactDefined({
    em: contact.email ? normalizeMetaEmail(contact.email) : undefined,
    ph: contact.phone
      ? normalizePhoneE164(contact.phone, contact.country)
      : undefined,
    fn: contact.firstName ? normalizeMetaText(contact.firstName) : undefined,
    ln: contact.lastName ? normalizeMetaText(contact.lastName) : undefined,
    ct: contact.city ? normalizeMetaCity(contact.city) : undefined,
    zp: contact.postal ? normalizeMetaPostal(contact.postal) : undefined,
    country: contact.country ? normalizeMetaText(contact.country) : undefined,
    external_id: hashedExternalId,
  });
}

function compactDefined(record: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(record).filter((entry): entry is [string, string] =>
      Boolean(entry[1]),
    ),
  );
}
