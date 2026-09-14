import { afterEach, describe, expect, test } from "bun:test";
import {
  claimConfiguratorFinished,
  claimConfiguratorStarted,
  resetConfiguratorVisit,
} from "@/lib/tracking/client/configurator";

afterEach(() => {
  resetConfiguratorVisit();
});

describe("configurator visit tracking", () => {
  test("starts and finishes a visit only once", () => {
    expect(claimConfiguratorStarted()).toBe(true);
    expect(claimConfiguratorStarted()).toBe(false);
    expect(claimConfiguratorFinished()).toBe(true);
    expect(claimConfiguratorFinished()).toBe(false);
  });

  test("allows a new start after leaving the configurator", () => {
    expect(claimConfiguratorStarted()).toBe(true);
    expect(claimConfiguratorFinished()).toBe(true);
    resetConfiguratorVisit();
    expect(claimConfiguratorStarted()).toBe(true);
  });
});
