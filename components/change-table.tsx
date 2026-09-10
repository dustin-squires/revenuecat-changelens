import { Box, FlaskConical, Layers3, Tag } from "lucide-react";
import type { ChangeEvent, ChangeEventType } from "@/lib/types";
import { eventLabels, formatEventDate } from "@/lib/change-utils";

const iconByType = { paywall: Layers3, offering: Tag, experiment: FlaskConical, release: Box };
const classByType: Record<ChangeEventType, string> = {
  paywall: "red",
  offering: "green",
  experiment: "blue",
  release: "slate",
};

export function EventTypeIcon({ type }: { type: ChangeEventType }) {
  const Icon = iconByType[type];
  return <span className={`type-icon ${classByType[type]}`}><Icon size={14} /></span>;
}

export function ChangeTable({ events, selectedId, onSelect }: { events: ChangeEvent[]; selectedId?: string; onSelect: (event: ChangeEvent) => void }) {
  return (
    <div className="changes-table" role="table" aria-label="Configuration changes">
      <div className="table-row table-head" role="row">
        <span>Date</span><span>Change</span><span>Type</span><span>Changed by</span>
      </div>
      {events.map((event) => (
        <button
          type="button"
          className={`table-row ${selectedId === event.id ? "selected" : ""}`}
          key={event.id}
          onClick={() => onSelect(event)}
          role="row"
        >
          <span>{formatEventDate(event.timestamp)}</span>
          <span className="change-name"><EventTypeIcon type={event.type} />{event.title}</span>
          <span><span className="mobile-label">Type</span>{eventLabels[event.type]}</span>
          <span className="actor-cell"><span className="mini-avatar">{event.initials}</span>{event.actor}</span>
        </button>
      ))}
      {events.length === 0 && <div className="empty-state">No changes match this filter.</div>}
    </div>
  );
}
