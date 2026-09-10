"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Box, FlaskConical, Layers3, Tag } from "lucide-react";
import type { ChangeEvent, ChangeEventType, ChartPoint } from "@/lib/types";
import { eventDate, eventLabels, formatEventDate } from "@/lib/change-utils";

const eventColors: Record<ChangeEventType, string> = {
  paywall: "#ef4444",
  offering: "#16a765",
  experiment: "#3b82f6",
  release: "#64748b",
};

const eventIcons = { paywall: Layers3, offering: Tag, experiment: FlaskConical, release: Box };

function formatTick(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}

function shiftDate(date: string, days: number) {
  const shifted = new Date(`${date}T12:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartPoint; value: number }> }) {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  return (
    <div className="chart-tooltip">
      <span>{formatTick(point.payload.date)}</span>
      <strong>{Number(point.value).toFixed(2)}%</strong>
    </div>
  );
}

function MarkerLabel({
  viewBox,
  event,
  count,
  selected,
  onSelect,
  onHover,
}: {
  viewBox?: { x?: number; y?: number };
  event: ChangeEvent;
  count: number;
  selected: boolean;
  onSelect: () => void;
  onHover: (event: ChangeEvent | null) => void;
}) {
  const x = viewBox?.x ?? 0;
  const y = (viewBox?.y ?? 0) + 2;
  const Icon = eventIcons[event.type];
  const shortLabel = count > 1 ? `${count} changes` : eventLabels[event.type];
  const placeLabelBefore = count > 1;

  return (
    <g
      className={`event-marker ${selected ? "selected" : "quiet"}`}
      role="button"
      tabIndex={0}
      aria-label={`${shortLabel}: ${event.title}`}
      onClick={onSelect}
      onKeyDown={(keyEvent) => { if (keyEvent.key === "Enter" || keyEvent.key === " ") onSelect(); }}
      onMouseEnter={() => onHover(event)}
      onMouseLeave={() => onHover(null)}
    >
      {selected && <circle cx={x} cy={y + 8} r="16" fill={eventColors[event.type]} opacity="0.12" />}
      <circle
        cx={x}
        cy={y + 8}
        r={selected ? 11 : 8}
        fill={selected ? eventColors[event.type] : "#f8fafc"}
        stroke={selected ? eventColors[event.type] : "#aeb8c5"}
        strokeWidth={selected ? 2 : 1.25}
      />
      <foreignObject x={x - 6} y={y + 2} width="12" height="12" pointerEvents="none">
        <Icon size={12} color={selected ? "white" : "#748196"} strokeWidth={2.2} />
      </foreignObject>
      <text
        x={placeLabelBefore ? x - 15 : x + 15}
        y={y + 12}
        textAnchor={placeLabelBefore ? "end" : "start"}
        className="event-marker-label"
      >
        {shortLabel}
      </text>
      <circle cx={x} cy={y + 8} r="19" fill="transparent" />
    </g>
  );
}

export function ConversionChart({
  data,
  events,
  selectedEvent,
  onSelect,
}: {
  data: ChartPoint[];
  events: ChangeEvent[];
  selectedEvent?: ChangeEvent | null;
  onSelect?: (event: ChangeEvent) => void;
}) {
  const [hoveredEvent, setHoveredEvent] = useState<ChangeEvent | null>(null);
  const grouped = useMemo(() => {
    const byDate = new Map<string, ChangeEvent[]>();
    events.forEach((event) => {
      const date = eventDate(event);
      byDate.set(date, [...(byDate.get(date) ?? []), event]);
    });
    return [...byDate.entries()].map(([date, dateEvents]) => ({ date, events: dateEvents }));
  }, [events]);
  const comparisonWindow = selectedEvent
    ? {
        start: shiftDate(eventDate(selectedEvent), -7),
        end: shiftDate(eventDate(selectedEvent), 7),
      }
    : null;

  return (
    <div className="chart-wrap">
      {hoveredEvent && (
        <div className="marker-tooltip" role="status">
          <strong>{hoveredEvent.action}</strong>
          <span>{hoveredEvent.title}</span>
          <small>{formatEventDate(hoveredEvent.timestamp)}</small>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 44, right: 22, bottom: 4, left: -12 }}>
          <CartesianGrid stroke="#e8ecf2" vertical horizontal />
          <XAxis
            dataKey="date"
            tickFormatter={formatTick}
            axisLine={{ stroke: "#dfe4eb" }}
            tickLine={false}
            tick={{ fill: "#718096", fontSize: 11 }}
            minTickGap={60}
            dy={9}
          />
          <YAxis
            domain={[0, 8]}
            ticks={[0, 2, 4, 6, 8]}
            tickFormatter={(value) => `${value}%`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#718096", fontSize: 11 }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }} />
          {comparisonWindow && (
            <ReferenceArea
              className="comparison-window"
              x1={comparisonWindow.start}
              x2={comparisonWindow.end}
              fill="#6952f5"
              fillOpacity={0.035}
            />
          )}
          {grouped.map(({ date, events: dateEvents }) => (
            <ReferenceLine
              key={date}
              x={date}
              stroke={selectedEvent && eventDate(selectedEvent) === date ? eventColors[dateEvents[0].type] : "#aeb8c5"}
              strokeOpacity={selectedEvent && eventDate(selectedEvent) === date ? 0.7 : 0.35}
              strokeWidth={selectedEvent && eventDate(selectedEvent) === date ? 1.5 : 1}
              strokeDasharray="3 3"
              label={(props) => (
                <MarkerLabel
                  {...props}
                  event={dateEvents[0]}
                  count={dateEvents.length}
                  selected={Boolean(selectedEvent && eventDate(selectedEvent) === date)}
                  onSelect={() => onSelect?.(dateEvents[0])}
                  onHover={setHoveredEvent}
                />
              )}
            />
          ))}
          <Line
            type="monotone"
            dataKey="conversionRate"
            stroke="#684bff"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "white", stroke: "#684bff", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
