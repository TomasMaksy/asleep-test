/** Client-only card checks. Never import this from a server route. */

export type CardBrand = "visa" | "mastercard" | "amex" | "unknown";

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function detectCardBrand(number: string): CardBrand {
  const digits = digitsOnly(number);
  if (/^3[47]/.test(digits)) {
    return "amex";
  }
  if (/^4/.test(digits)) {
    return "visa";
  }
  const two = Number(digits.slice(0, 2));
  const four = Number(digits.slice(0, 4));
  if ((two >= 51 && two <= 55) || (four >= 2221 && four <= 2720)) {
    return "mastercard";
  }
  return "unknown";
}

export function formatCardNumber(value: string) {
  const digits = digitsOnly(value).slice(0, 19);
  if (detectCardBrand(digits) === "amex") {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)]
      .filter(Boolean)
      .join(" ");
  }
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function formatExpiry(value: string) {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length === 0) {
    return "";
  }

  let month = digits.slice(0, 2);
  if (digits.length === 1 && Number(digits) > 1) {
    month = `0${digits}`;
  } else if (month.length === 2) {
    const asNumber = Number(month);
    if (asNumber === 0) {
      month = "01";
    } else if (asNumber > 12) {
      month = "12";
    }
  }

  const year = digits.slice(2, 4);
  return year ? `${month} / ${year}` : month;
}

export function luhnValid(number: string) {
  const digits = digitsOnly(number);
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let alternate = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (alternate) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    alternate = !alternate;
  }

  return sum % 10 === 0;
}

export function expiryValid(value: string) {
  const digits = digitsOnly(value);
  if (digits.length !== 4) {
    return false;
  }

  const month = Number(digits.slice(0, 2));
  const year = Number(digits.slice(2, 4));
  if (month < 1 || month > 12) {
    return false;
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear() % 100;
  if (year < currentYear) {
    return false;
  }
  if (year === currentYear && month < currentMonth) {
    return false;
  }

  return true;
}

export function cvcValid(value: string, number: string) {
  const digits = digitsOnly(value);
  const length = detectCardBrand(number) === "amex" ? 4 : 3;
  return digits.length === length;
}
