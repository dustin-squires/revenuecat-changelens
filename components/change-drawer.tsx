"use client";

import { useEffect } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Sparkles, X } from "lucide-react";
import type { ChangeEvent, MetricImpact } from "@/lib/types";
import { changeEvents } from "@/data/demo-data";
import { eventsNear, formatEventDate } from "@/lib/change-utils";
import { EventTypeIcon } from "./change-table";

function SemanticDiff({ event }: { event: ChangeEvent }) {
  return (
    <div className="diff-grid">
      <div className="diff-heading"><span /><span>Before</span><span /><span>After</span></div>
      {event.diffs.map((diff) => (
        <div className="diff-row" key={`${event.id}-${diff.label}`}>
          <span>{diff.label}</span>
          <span>{diff.before ? <mark className="before-value">{diff.before}</mark> : <span className="empty-value">-</span>}</span>
          <span className="arrow">→</span>
          <span>{diff.after ? <mark className="after-value">{diff.after}</mark> : <span className="removed-value">Removed</span>}</span>
        </div>
      ))}
    </div>
  );
}

function ImpactCards({ metrics }: { metrics: MetricImpact[] }) {
  return (
    <div className="impact-grid">
      {metrics.map((metric) => (
        <div className="impact-card" data-impact-metric={metric.label} key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.before} <small>→</small> {metric.after}</strong>
          <div className={`metric-change ${metric.direction}`}>
            {metric.direction === "down" ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
            {metric.change}<em>7 days after</em>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChangeDrawer({
  open,
  event,
  impacts,
  onClose,
}: {
  open: boolean;
  event: ChangeEvent | null;
  impacts: MetricImpact[];
  onClose: () => void;
}) {
  const nearby = event ? eventsNear(event, changeEvents) : [];

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  if (!open || !event) return null;

  return (
    <aside className="detail-drawer" aria-label="Change details">
      <header className="drawer-header">
        <EventTypeIcon type={event.type} />
        <div><h2>{event.action}</h2><p>{formatEventDate(event.timestamp)}</p></div>
        <button className="icon-button close-button" type="button" onClick={onClose} aria-label="Close details"><X size={19} /></button>
      </header>

      <div className="drawer-content">
        <section className="drawer-card event-overview">
          <div className="event-card-heading">
            <div><h3>{nearby.length > 1 ? `${nearby.length} monetization changes` : event.title}</h3><p>within 6 hours of this metric movement</p></div>
            <button type="button" className="secondary-button">Audit log <ExternalLink size={13} /></button>
          </div>
          {nearby.map((item) => (
            <div className="nearby-event" key={item.id}>
              <EventTypeIcon type={item.type} />
              <div>
                <strong>{item.action}</strong>
                <span>{item.title} · {formatEventDate(item.timestamp, false)}</span>
                <small><span className="mini-avatar">{item.initials}</span>{item.actor}</small>
                <p>{item.summary}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="drawer-card">
          <h3>Key changes</h3>
          {nearby.map((item) => (
            <div key={item.id} className="diff-event-block">
              {nearby.length > 1 && <h4><EventTypeIcon type={item.type} />{item.title}</h4>}
              <SemanticDiff event={item} />
            </div>
          ))}
        </section>

        <section className="drawer-card">
          <div className="section-heading">
            <h3>Observed impact</h3>
            <span>7 days before vs. 7 days after</span>
          </div>
          <ImpactCards metrics={impacts} />
        </section>

        <p className="causality-note">ChangeLens surfaces temporal context, not causal conclusions.</p>
        <button className="rico-button" type="button" title="Rico integration is outside this prototype">
          <Sparkles size={16} /> Ask Rico about this change <span>→</span>
        </button>
      </div>
    </aside>
  );
}
