import type { ChangeEventType } from "@/lib/types";

export type ChangeFilter = "all" | ChangeEventType;

const options: { value: ChangeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paywall", label: "Paywalls" },
  { value: "offering", label: "Offerings" },
  { value: "experiment", label: "Experiments" },
  { value: "release", label: "Releases" },
];

export function ChangeFilters({ value, onChange }: { value: ChangeFilter; onChange: (filter: ChangeFilter) => void }) {
  return (
    <div className="filter-row" role="group" aria-label="Filter configuration changes">
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          className={`filter-pill ${value === option.value ? "selected" : ""}`}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
