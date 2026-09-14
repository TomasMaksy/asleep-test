import { describe, expect, test } from "bun:test";
import { asMetaClientIp } from "@/lib/tracking/ip";

describe("asMetaClientIp", () => {
  test("keeps public IPv4 and IPv6", () => {
    expect(asMetaClientIp("203.0.113.1")).toBe("203.0.113.1");
    expect(asMetaClientIp("2001:db8::1")).toBe("2001:db8::1");
    expect(asMetaClientIp("::ffff:203.0.113.1")).toBe("203.0.113.1");
  });

  test("omits unknown, empty, and hostnames", () => {
    expect(asMetaClientIp("unknown")).toBeUndefined();
    expect(asMetaClientIp("")).toBeUndefined();
    expect(asMetaClientIp("localhost")).toBeUndefined();
    expect(asMetaClientIp("not-an-ip")).toBeUndefined();
  });
});
