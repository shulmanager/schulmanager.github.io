import React, { useMemo, useState } from "react";
import { useData, useLookup } from "../data.jsx";
import { formatDate } from "../components/ui.jsx";

function buildMonth(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  return cells;
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default function Calendar() {
  const { data } = useData();
  const { classOf } = useLookup();
  const [cursor, setCursor] = useState({ year: 2026, month: 10 });
  const [selected, setSelected] = useState(null);

  const events = data?.events || [];
  const cells = useMemo(() => buildMonth(cursor.year, cursor.month), [cursor]);

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });

  function eventsOn(date) {
    if (!date) return [];
    const iso = date.toISOString().slice(0, 10);
    return events.filter((ev) => {
      if (ev.endDate) return iso >= ev.date && iso <= ev.endDate;
      return ev.date === iso;
    });
  }

  function shift(delta) {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  }

  if (!data) return <div className="text-center text-muted py-5">Lade…</div>;

  return (
    <div className="row">
      <div className="col-md-2 d-md-block order-last order-md-first">
        <div className="d-none d-md-block" style={{ paddingTop: 75 }} />
        <div className="event-category-selection">
          <h5>Kategorien anzeigen:</h5>
          <label style={{ color: "black" }}><input type="checkbox" defaultChecked /> Alle anzeigen</label>
          <label style={{ background: "rgb(162, 157, 155)" }}><input type="checkbox" defaultChecked /> Schultermine</label>
          <label style={{ background: "rgb(98, 196, 0)" }}><input type="checkbox" defaultChecked /> Ferien/Feiertage</label>
        </div>
        <br />
        <h5>Kalender exportieren</h5>
        <button className="btn btn-light" type="button"><span className="fa fa-print" /> PDF-Datei</button>
        <br />
        <button className="btn btn-light mt-2" type="button"><span className="fa fa-calendar" /> .ics-Datei</button>
        <br />
        <button className="btn btn-light mt-2" type="button"><span className="fa fa-refresh" /> Kalender abonnieren</button>
      </div>

      <div className="col-md-10 order-first order-md-last">
        <div className="card">
          <div className="d-flex align-items-center gap-2 p-2 border-bottom">
            <button className="btn btn-light" type="button" onClick={() => setCursor({ year: 2026, month: 10 })}>
              Heute
            </button>
            <div className="d-flex align-items-center gap-2 ms-auto">
              <button className="btn btn-light fa fa-chevron-left" type="button" onClick={() => shift(-1)} />
              <strong style={{ minWidth: 150, textAlign: "center" }}>{monthLabel}</strong>
              <button className="btn btn-light fa fa-chevron-right" type="button" onClick={() => shift(1)} />
            </div>
            <div className="d-none d-md-flex gap-1 ms-auto">
              <button className="btn btn-light active" type="button">Monat</button>
              <button className="btn btn-light" type="button">Woche</button>
              <button className="btn btn-light" type="button">Tag</button>
            </div>
          </div>

          <div className="p-2">
            <table className="w-100" style={{ tableLayout: "fixed", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {WEEKDAYS.map((w) => (
                    <th key={w} className="text-center small text-muted py-2">{w}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.ceil(cells.length / 7) }).map((_, w) => (
                  <tr key={w}>
                    {cells.slice(w * 7, w * 7 + 7).map((date, i) => {
                      const evs = eventsOn(date);
                      const isToday = date && date.toDateString() === new Date(2026, 10, 19).toDateString();
                      return (
                        <td
                          key={i}
                          className={`cal-cell pointer ${date ? "" : "empty"}`}
                          onClick={() => date && setSelected({ date, events: evs })}
                        >
                          {date && (
                            <>
                              <div className={`cal-daynum ${isToday ? "today" : ""}`}>{date.getDate()}</div>
                              {evs.slice(0, 2).map((ev) => (
                                <div key={ev.id} className="cal-event">{ev.title}</div>
                              ))}
                              {evs.length > 2 && <div className="small text-muted">+{evs.length - 2} weitere</div>}
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="card mt-3 p-3">
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">{formatDate(selected.date)}</h4>
              <button className="btn btn-light btn-sm" onClick={() => setSelected(null)}>Schließen</button>
            </div>
            {selected.events.length === 0 && <p className="text-muted mb-0 mt-2">Keine Termine an diesem Tag.</p>}
            {selected.events.map((ev) => (
              <div key={ev.id} className="border-bottom py-2">
                <div>{ev.title}</div>
                <div className="small text-muted">
                  {ev.time || "ganztägig"} · {ev.location || "—"} · {classOf(ev.classId)?.name || "Schule"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
