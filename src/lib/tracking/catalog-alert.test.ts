import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  reportCatalogMismatch,
  resetCatalogAlertReportsForTests,
} from "@/lib/tracking/catalog-alert";

describe("reportCatalogMismatch", () => {
  afterEach(() => {
    resetCatalogAlertReportsForTests();
  });

  test("dedupes identical signatures in one session", () => {
    const sendBeacon = mock(() => true);
    // @ts-expect-error test shim
    globalThis.navigator = { sendBeacon };
    // @ts-expect-error test shim
    globalThis.window = { location: { pathname: "/x", href: "https://asleep.lt/x" } };

    const items = [
      {
        id: "bad-id",
        name: "x",
        price: 1,
        image: "/x.webp",
        quantity: 1,
      },
    ];

    reportCatalogMismatch({
      eventName: "add_to_cart",
      source: "configurator",
      items,
    });
    reportCatalogMismatch({
      eventName: "add_to_cart",
      source: "configurator",
      items,
    });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
  });
});
