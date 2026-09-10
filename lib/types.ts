export type ChangeEventType = "paywall" | "offering" | "experiment" | "release";

export type ChangeDetail = {
  label: string;
  before?: string;
  after?: string;
};

export type ChangeEvent = {
  id: string;
  timestamp: string;
  type: ChangeEventType;
  title: string;
  actor: string;
  initials: string;
  summary: string;
  diffs: ChangeDetail[];
};

export type ChartPoint = {
  date: string;
  conversionRate: number;
};

export type MetricImpact = {
  label: string;
  before: string;
  after: string;
  change: string;
  direction: "up" | "down";
};
