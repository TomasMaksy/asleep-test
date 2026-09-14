const CALLING_CODES: Record<string, string> = {
  LT: "370",
  LV: "371",
  EE: "372",
};

export function normalizePhoneE164(value: string, country?: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (!digits) {
    return "";
  }

  const code = CALLING_CODES[(country ?? "LT").toUpperCase()] ?? "370";
  if (digits.startsWith(code)) {
    return digits;
  }

  if (code === "370" && digits.startsWith("8") && digits.length === 9) {
    return `${code}${digits.slice(1)}`;
  }

  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }

  return `${code}${digits}`;
}
