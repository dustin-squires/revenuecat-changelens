"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, CalendarDays, ChevronDown, Menu, Sparkles, X } from "lucide-react";
import { chartData, changeEvents, impactMetrics, primaryEventId } from "@/data/demo-data";
import type { ChangeEvent } from "@/lib/types";
import { Sidebar } from "./sidebar";
import { ChangeFilters, type ChangeFilter } from "./change-filters";
import { ConversionChart } from "./conversion-chart";
import { ChangeTable } from "./change-table";
import { ChangeDrawer } from "./change-drawer";

export function Dashboard() {
  const initialEvent = changeEvents.find((event) => event.id === primaryEventId) ?? changeEvents[0];
  const [filter, setFilter] = useState<ChangeFilter>("all");
  const [selectedEvent, setSelectedEvent] = useState<ChangeEvent | null>(initialEvent);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleEvents = useMemo(
    () => filter === "all" ? changeEvents : changeEvents.filter((event) => event.type === filter),
    [filter],
  );

  function selectEvent(event: ChangeEvent) {
    setSelectedEvent(event);
    setDrawerOpen(true);
  }

  function applyFilter(nextFilter: ChangeFilter) {
    setFilter(nextFilter);
    const nextVisible = nextFilter === "all" ? changeEvents : changeEvents.filter((event) => event.type === nextFilter);
    if (selectedEvent && !nextVisible.some((event) => event.id === selectedEvent.id)) {
      setDrawerOpen(false);
    }
  }

  return (
    <div className={`app-shell ${drawerOpen ? "drawer-visible" : ""}`}>
      <div className={`sidebar-shell ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <Sidebar />
        {mobileMenuOpen && <button className="mobile-overlay" type="button" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} />}
      </div>

      <main className="main-column">
        <div className="topbar">
          <button className="mobile-menu-button" type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Toggle navigation">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button className="date-button" type="button"><CalendarDays size={15} />Aug 1, 2024 – Sep 30, 2024<ChevronDown size={14} /></button>
        </div>

        <div className="page-content">
          <header className="page-heading">
            <div className="breadcrumb"><span>Charts</span><span>›</span><span>Conversion Rate</span></div>
            <div className="title-row">
              <h1>Conversion Rate <ChevronDown size={19} /></h1>
              <span className="feature-badge"><Sparkles size={13} />ChangeLens <em>Beta</em></span>
            </div>
            <p>See how your app converts visitors to paying customers, and understand what might be driving changes.</p>
          </header>

          <div className="period-control" role="group" aria-label="Chart date range">
            {['7D', '30D', '90D', '1Y', 'Custom'].map((period) => <button type="button" className={period === '90D' ? 'active' : ''} key={period}>{period}</button>)}
          </div>

          <section className="analytics-card">
            <div className="metric-strip">
              <div className="headline-metric"><span>Conversion Rate</span><div><strong>4.8%</strong><em className="down"><ArrowDown size={13} />12%</em><small>vs. previous 30 days</small></div></div>
              <div className="headline-metric"><span>Revenue per Paying Customer</span><div><strong>$24.31</strong><em className="up"><ArrowUp size={13} />8%</em><small>vs. previous 30 days</small></div></div>
            </div>
            <ConversionChart data={chartData} events={visibleEvents} selectedEvent={drawerOpen ? selectedEvent : null} onSelect={selectEvent} />
          </section>

          <section className="changes-card">
            <div className="changes-heading">
              <div><h2>Configuration changes</h2><p>Key changes to your RevenueCat setup, shown alongside performance data.</p></div>
              <span className="event-count">{visibleEvents.length} changes</span>
            </div>
            <ChangeFilters value={filter} onChange={applyFilter} />
            <ChangeTable events={visibleEvents} selectedId={drawerOpen ? selectedEvent?.id : undefined} onSelect={selectEvent} />
          </section>
        </div>
      </main>

      <ChangeDrawer open={drawerOpen} event={selectedEvent} impacts={impactMetrics} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
