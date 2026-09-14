export function asMetaClientIp(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  let ip = value.trim().replace(/^\[|\]$/g, "");
  if (ip.startsWith("::ffff:")) {
    ip = ip.slice(7);
  }

  return isIpv4(ip) || isIpv6(ip) ? ip : undefined;
}

function isIpv4(value: string) {
  const parts = value.split(".");
  if (parts.length !== 4) {
    return false;
  }
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) {
      return false;
    }
    const octet = Number(part);
    return octet >= 0 && octet <= 255;
  });
}

function isIpv6(value: string) {
  if (!value.includes(":")) {
    return false;
  }
  if (value.includes(".")) {
    return false;
  }

  const halves = value.split("::");
  if (halves.length > 2) {
    return false;
  }

  const groups = value
    .split("::")
    .flatMap((section) => (section ? section.split(":") : []));
  if (groups.some((group) => !/^[0-9a-f]{1,4}$/i.test(group))) {
    return false;
  }

  const groupCount = groups.length;
  const hasCompression = halves.length === 2;
  if (hasCompression) {
    return groupCount < 8;
  }
  return groupCount === 8;
}
