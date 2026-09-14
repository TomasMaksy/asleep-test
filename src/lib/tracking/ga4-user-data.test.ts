import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import {
  buildGa4GtagUserData,
  buildGa4MeasurementUserData,
  normalizeGa4Email,
  normalizeGa4Phone,
} from "@/lib/tracking/ga4-user-data";

const contact = {
  email: "Foo.Bar@gmail.com",
  phone: "860000000",
  firstName: "Customer",
  lastName: "Example",
  city: "Vilnius",
  postal: "LT-01100",
  country: "lt",
};

describe("ga4 user-provided data", () => {
  test("strips gmail dots and formats E.164 with a plus", () => {
    expect(normalizeGa4Email("Foo.Bar@gmail.com")).toBe("foobar@gmail.com");
    expect(normalizeGa4Email("Foo.Bar@example.com")).toBe(
      "foo.bar@example.com",
    );
    expect(normalizeGa4Phone("860000000", "LT")).toBe("+37060000000");
  });

  test("builds unhashed gtag user_data", () => {
    expect(buildGa4GtagUserData(contact)).toEqual({
      email: "foobar@gmail.com",
      phone_number: "+37060000000",
      address: {
        first_name: "customer",
        last_name: "example",
        city: "vilnius",
        postal_code: "LT-01100",
        country: "LT",
      },
    });
  });

  test("hashes Measurement Protocol user_data after Google normalization", async () => {
    const userData = await buildGa4MeasurementUserData(contact);

    expect(userData).toEqual({
      sha256_email_address: sha256("foobar@gmail.com"),
      sha256_phone_number: sha256("+37060000000"),
      address: {
        sha256_first_name: sha256("customer"),
        sha256_last_name: sha256("example"),
        city: "vilnius",
        postal_code: "LT-01100",
        country: "LT",
      },
    });
    expect(JSON.stringify(userData)).not.toContain("Foo.Bar@gmail.com");
    expect(JSON.stringify(userData)).not.toContain("860000000");
  });
});

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
