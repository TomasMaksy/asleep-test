import { trackClientEvent } from "@/lib/tracking/client/dispatcher";
import type { TrackingProperties } from "@/lib/tracking/events";

let visitStarted = false;
let visitFinished = false;

export function claimConfiguratorStarted() {
  if (visitStarted) {
    return false;
  }
  visitStarted = true;
  return true;
}

export function claimConfiguratorFinished() {
  if (visitFinished) {
    return false;
  }
  visitFinished = true;
  visitStarted = true;
  return true;
}

export function trackConfiguratorStarted() {
  if (!claimConfiguratorStarted()) {
    return;
  }
  return trackClientEvent(
    "configurator_started",
    {},
    { source: "configurator" },
  );
}

export function trackConfiguratorFinished(
  properties: TrackingProperties<"configurator_finished">,
) {
  if (!claimConfiguratorFinished()) {
    return;
  }
  return trackClientEvent("configurator_finished", properties, {
    source: "configurator",
  });
}

export function resetConfiguratorVisit() {
  visitStarted = false;
  visitFinished = false;
}
