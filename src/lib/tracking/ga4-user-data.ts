import { type MetaContact, sha256Hex } from "@/lib/tracking/meta-user-data";
import { normalizePhoneE164 } from "@/lib/tracking/phone";

export type Ga4GtagUserData = {
  email?: string;
  phone_number?: string;
  address?: {
    first_name?: string;
    last_name?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
};

export type Ga4MeasurementUserData = {
  sha256_email_address?: string;
  sha256_phone_number?: string;
  address?: {
    sha256_first_name?: string;
    sha256_last_name?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
};

export function normalizeGa4Email(value: string) {
  const email = value.trim().toLowerCase().replace(/\s+/g, "");
  const separator = email.lastIndexOf("@");
  if (separator < 0) {
    return email;
  }

  const local = email.slice(0, separator);
  const domain = email.slice(separator + 1);
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return `${local.replaceAll(".", "")}@${domain}`;
  }
  return email;
}

export function normalizeGa4Phone(value: string, country?: string) {
  const digits = normalizePhoneE164(value, country);
  return digits ? `+${digits}` : "";
}

export function normalizeGa4PersonName(value: string) {
  return value
    .toLowerCase()
    .replace(/[\p{N}\p{P}\p{S}]+/gu, "")
    .trim();
}

export function normalizeGa4City(value: string) {
  return value
    .toLowerCase()
    .replace(/[\p{N}\p{P}\p{S}]+/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeGa4Postal(value: string) {
  return value.replace(/[.~]/g, "").trim();
}

export function normalizeGa4Country(value: string) {
  return value.trim().toUpperCase();
}

export function buildGa4GtagUserData(
  contact: MetaContact,
): Ga4GtagUserData | undefined {
  const email = contact.email ? normalizeGa4Email(contact.email) : undefined;
  const phone = contact.phone
    ? normalizeGa4Phone(contact.phone, contact.country)
    : undefined;
  const address = compactDefined({
    first_name: contact.firstName
      ? normalizeGa4PersonName(contact.firstName)
      : undefined,
    last_name: contact.lastName
      ? normalizeGa4PersonName(contact.lastName)
      : undefined,
    city: contact.city ? normalizeGa4City(contact.city) : undefined,
    postal_code: contact.postal
      ? normalizeGa4Postal(contact.postal)
      : undefined,
    country: contact.country ? normalizeGa4Country(contact.country) : undefined,
  });

  const userData: Ga4GtagUserData = {
    ...(email ? { email } : {}),
    ...(phone ? { phone_number: phone } : {}),
    ...(Object.keys(address).length > 0 ? { address } : {}),
  };

  return Object.keys(userData).length > 0 ? userData : undefined;
}

export async function buildGa4MeasurementUserData(
  contact: MetaContact,
): Promise<Ga4MeasurementUserData | undefined> {
  const email = contact.email ? normalizeGa4Email(contact.email) : undefined;
  const phone = contact.phone
    ? normalizeGa4Phone(contact.phone, contact.country)
    : undefined;
  const firstName = contact.firstName
    ? normalizeGa4PersonName(contact.firstName)
    : undefined;
  const lastName = contact.lastName
    ? normalizeGa4PersonName(contact.lastName)
    : undefined;

  const [sha256Email, sha256Phone, sha256FirstName, sha256LastName] =
    await Promise.all([
      email ? sha256Hex(email) : undefined,
      phone ? sha256Hex(phone) : undefined,
      firstName ? sha256Hex(firstName) : undefined,
      lastName ? sha256Hex(lastName) : undefined,
    ]);

  const address = compactDefined({
    sha256_first_name: sha256FirstName,
    sha256_last_name: sha256LastName,
    city: contact.city ? normalizeGa4City(contact.city) : undefined,
    postal_code: contact.postal
      ? normalizeGa4Postal(contact.postal)
      : undefined,
    country: contact.country ? normalizeGa4Country(contact.country) : undefined,
  });

  const userData: Ga4MeasurementUserData = {
    ...(sha256Email ? { sha256_email_address: sha256Email } : {}),
    ...(sha256Phone ? { sha256_phone_number: sha256Phone } : {}),
    ...(Object.keys(address).length > 0 ? { address } : {}),
  };

  return Object.keys(userData).length > 0 ? userData : undefined;
}

function compactDefined<T extends Record<string, string | undefined>>(
  record: T,
) {
  return Object.fromEntries(
    Object.entries(record).filter((entry): entry is [string, string] =>
      Boolean(entry[1]),
    ),
  ) as { [K in keyof T]?: string };
}
