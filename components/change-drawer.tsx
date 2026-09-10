"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Sparkles, X } from "lucide-react";
import type { ChangeEvent, MetricImpact } from "@/lib/types";
import { chartData, changeEvents } from "@/data/demo-data";
import { eventLabels, eventsNear, formatEventDate } from "@/lib/change-utils";
import { ConversionChart } from "./conversion-chart";
import { EventTypeIcon } from "./change-table";

type DrawerTab = "overview" | "changes" | "impact" | "context";

function SemanticDiff({ event }: { event: ChangeEvent }) {
  return (
    <div className="diff-grid">
      <div className="diff-heading"><span /><span>Before</span><span /><span>After</span></div>
      {event.diffs.map((diff) => (
        <div className="diff-row" key={`${event.id}-${diff.label}`}>
          <span>{diff.label}</span>
          <span>{diff.before ? <mark className="before-value">{diff.before}</mark> : <span className="empty-value">—</span>}</span>
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
        <div className="impact-card" key={metric.label}>
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
  const [tab, setTab] = useState<DrawerTab>("overview");
  const nearby = event ? eventsNear(event, changeEvents) : [];

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  useEffect(() => setTab("overview"), [event?.id]);

  if (!open || !event) return null;

  const primaryDiffEvent = nearby.find((item) => item.type === "paywall") ?? event;

  return (
    <aside className="detail-drawer" aria-label="Change details">
      <header className="drawer-header">
        <EventTypeIcon type={event.type} />
        <div><h2>{eventLabels[event.type]} {event.type === "paywall" ? "published" : "changed"}</h2><p>{formatEventDate(event.timestamp)}</p></div>
        <button className="icon-button close-button" type="button" onClick={onClose} aria-label="Close details"><X size={19} /></button>
      </header>

      <div className="drawer-tabs" role="tablist">
        {(["overview", "changes", "impact", "context"] as DrawerTab[]).map((item) => (
          <button type="button" role="tab" aria-selected={tab === item} className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      <div className="drawer-content">
        {(tab === "overview" || tab === "context") && (
          <section className="drawer-card event-overview">
            <div className="event-card-heading">
              <div><h3>{nearby.length > 1 ? `${nearby.length} monetization changes` : event.title}</h3><p>within 6 hours of this metric movement</p></div>
              <button type="button" className="secondary-button" onClick={() => setTab("changes")}>View changes <ExternalLink size={13} /></button>
            </div>
            {nearby.map((item) => (
              <div className="nearby-event" key={item.id}>
                <EventTypeIcon type={item.type} />
                <div>
                  <strong>{item.type === "paywall" ? "Paywall published" : item.type === "offering" ? "Offering updated" : item.title}</strong>
                  <span>{item.title} · {formatEventDate(item.timestamp, false)}</span>
                  <small><span className="mini-avatar">{item.initials}</span>{item.actor}</small>
                  <p>{item.summary}</p>
                </div>
              </div>
            ))}
          </section>
        )}

        {(tab === "overview" || tab === "impact") && (
          <section className="drawer-card">
            <h3>Observed after change</h3>
            <ImpactCards metrics={impacts} />
            <div className="mini-chart-title"><span>Conversion to paying</span><span>Sep 3 change</span></div>
            <ConversionChart data={chartData.slice(19, 54)} events={[primaryDiffEvent]} compact selectedEvent={event} />
          </section>
        )}

        {(tab === "overview" || tab === "changes") && (
          <section className="drawer-card">
            <h3>Key changes</h3>
            {nearby.map((item) => (
              <div key={item.id} className="diff-event-block">
                {nearby.length > 1 && <h4><EventTypeIcon type={item.type} />{item.title}</h4>}
                <SemanticDiff event={item} />
              </div>
            ))}
          </section>
        )}

        {tab === "context" && (
          <section className="drawer-card context-card">
            <h3>About this comparison</h3>
            <p>ChangeLens compares the seven days before this change with the seven days after it. Changes shown here are based on configuration history.</p>
          </section>
        )}

        <p className="causality-note">ChangeLens surfaces temporal context, not causal conclusions.</p>
        <button className="rico-button" type="button" title="Rico integration is outside this prototype">
          <Sparkles size={16} /> Ask Rico about this change <span>→</span>
        </button>
      </div>
    </aside>
  );
}
