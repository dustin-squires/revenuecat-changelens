import type { ChangeEvent, ChangeEventType } from "./types";

export const eventDate = (event: ChangeEvent) => event.timestamp.slice(0, 10);

export function eventsNear(event: ChangeEvent, events: ChangeEvent[]) {
  const anchor = new Date(event.timestamp).getTime();
  return events.filter((candidate) => Math.abs(new Date(candidate.timestamp).getTime() - anchor) <= 6 * 60 * 60 * 1000);
}

export const eventLabels: Record<ChangeEventType, string> = {
  paywall: "Paywall",
  offering: "Offering",
  experiment: "Experiment",
  release: "Release",
};

export function formatEventDate(timestamp: string, includeYear = true) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" } : {}),
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}
