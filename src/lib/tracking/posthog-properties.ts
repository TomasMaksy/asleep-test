import type { TrackingEvent, TrackingItem } from "@/lib/tracking/events";

export function posthogSharedProperties(event: TrackingEvent) {
  return {
    ...event.properties,
    ...("items" in event.properties
      ? posthogEcommerceBreakdown(event.properties.items)
      : {}),
    event_id: event.event_id,
    occurred_at: event.occurred_at,
    visitor_id: event.visitor_id,
    locale: event.locale,
    path: event.path,
    tracking_source: event.source,
    $current_url: event.url,
    $pathname: event.path,
  };
}

export function posthogEcommerceBreakdown(items: TrackingItem[]) {
  const size_ids = unique(items.map((item) => item.size_id));
  const item_ids = unique(items.map((item) => item.item_id));
  return {
    item_ids,
    size_ids,
    ...(size_ids.length === 1 ? { size_id: size_ids[0] } : {}),
  };
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}
