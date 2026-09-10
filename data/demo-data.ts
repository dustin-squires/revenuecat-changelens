import type { ChangeEvent, ChartPoint, MetricImpact } from "@/lib/types";

const start = new Date("2024-08-01T12:00:00Z");
const wobble = [0.02, 0.16, -0.05, 0.09, -0.08, 0.11, -0.03, 0.14, -0.1, 0.04];

export const chartData: ChartPoint[] = Array.from({ length: 61 }, (_, index) => {
  const date = new Date(start);
  date.setUTCDate(start.getUTCDate() + index);
  const beforeChange = 5.35 + wobble[index % wobble.length] + Math.sin(index / 4) * 0.08;
  const transition = index < 33 ? beforeChange : index < 39 ? 5.08 - (index - 33) * 0.12 + wobble[index % 10] : 4.68 + wobble[index % 10] * 0.55 + Math.sin(index / 5) * 0.06;
  return { date: date.toISOString().slice(0, 10), conversionRate: Number(transition.toFixed(2)) };
});

export const changeEvents: ChangeEvent[] = [
  {
    id: "experiment-price-test",
    timestamp: "2024-08-14T09:21:00-04:00",
    type: "experiment",
    action: "Experiment started",
    title: "Price sensitivity test started",
    actor: "Jordan Lee",
    initials: "JL",
    summary: "Started a 50/50 experiment on annual package pricing for new users.",
    diffs: [
      { label: "Variant", after: "Annual — $39.99" },
      { label: "Audience", after: "New customers" },
    ],
  },
  {
    id: "paywall-v17",
    timestamp: "2024-09-03T11:42:00-04:00",
    type: "paywall",
    action: "Paywall published",
    title: "Onboarding Annual Test",
    actor: "Taylor Kim",
    initials: "TK",
    summary: "Removed the trial, made annual the default package, and refreshed onboarding copy.",
    diffs: [
      { label: "Trial duration", before: "7 days", after: "None" },
      { label: "Default package", before: "Monthly", after: "Annual" },
      { label: "Hero copy", before: "Start your free trial", after: "Unlock Premium" },
    ],
  },
  {
    id: "offering-onboarding",
    timestamp: "2024-09-03T13:08:00-04:00",
    type: "offering",
    action: "Offering updated",
    title: "default_offering",
    actor: "Growth Team",
    initials: "GT",
    summary: "Updated the default offering used by the onboarding placement.",
    diffs: [
      { label: "Removed package", before: "premium_monthly" },
      { label: "Affected placement", after: "onboarding" },
    ],
  },
  {
    id: "release-4-8",
    timestamp: "2024-09-08T10:14:00-04:00",
    type: "release",
    action: "App version released",
    title: "App version 4.8 released",
    actor: "Sarah Chen",
    initials: "SC",
    summary: "Released the new onboarding experience to the App Store.",
    diffs: [{ label: "App version", before: "4.7.2", after: "4.8.0" }],
  },
  {
    id: "experiment-rollout",
    timestamp: "2024-09-18T14:37:00-04:00",
    type: "experiment",
    action: "Experiment winner rolled out",
    title: "Annual messaging winner rolled out",
    actor: "Alex Rivera",
    initials: "AR",
    summary: "Ended the annual messaging experiment and rolled the winner out to everyone.",
    diffs: [
      { label: "Experiment status", before: "Running", after: "Completed" },
      { label: "Winner exposure", before: "50%", after: "100%" },
    ],
  },
];

const sep3Impact: MetricImpact[] = [
  { label: "Conversion to paying", before: "5.4%", after: "4.7%", change: "13.0%", direction: "down" },
  { label: "Annual selection", before: "41%", after: "62%", change: "21 pts", direction: "up" },
  { label: "Revenue / customer", before: "$3.21", after: "$3.45", change: "7.5%", direction: "up" },
];

export const impactsByEventId: Record<string, MetricImpact[]> = {
  "experiment-price-test": [
    { label: "Conversion to paying", before: "5.3%", after: "5.4%", change: "1.9%", direction: "up" },
    { label: "Annual selection", before: "38%", after: "41%", change: "3 pts", direction: "up" },
    { label: "Revenue / customer", before: "$3.12", after: "$3.18", change: "1.9%", direction: "up" },
  ],
  "paywall-v17": sep3Impact,
  "offering-onboarding": sep3Impact,
  "release-4-8": [
    { label: "Conversion to paying", before: "4.7%", after: "4.6%", change: "2.1%", direction: "down" },
    { label: "Annual selection", before: "62%", after: "60%", change: "2 pts", direction: "down" },
    { label: "Revenue / customer", before: "$3.45", after: "$3.39", change: "1.7%", direction: "down" },
  ],
  "experiment-rollout": [
    { label: "Conversion to paying", before: "4.7%", after: "4.8%", change: "2.1%", direction: "up" },
    { label: "Annual selection", before: "60%", after: "64%", change: "4 pts", direction: "up" },
    { label: "Revenue / customer", before: "$3.39", after: "$3.51", change: "3.5%", direction: "up" },
  ],
};

export const primaryEventId = "paywall-v17";
