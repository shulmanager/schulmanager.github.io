import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useData, useLookup } from "../data.jsx";
import { formatDate } from "../components/ui.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const { data } = useData();
  const { subject, collection } = useLookup();

  if (!data) return <div className="text-center text-muted py-5">Lade…</div>;

  const events = collection("events")
    .slice()
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .slice(0, 6);

  const exams = collection("exams")
    .slice()
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .slice(0, 5);

  const homework = collection("homework")
    .slice()
    .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))
    .slice(0, 5);

  const widgets = collection("widgets")
    .filter((w) => w.enabled)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";

  return (
    <>
      <h1 className="d-none d-md-block">
        {greeting}, {user?.name}
      </h1>

      <div className="alert alert-warning">
        {" "}
        Sie befinden sich in der Zeitzone Europe/Moscow. Alle angezeigten Uhrzeiten
        entsprechen dieser Zeitzone und <strong>nicht</strong> der Heimatzeitzone
        (Europe/Berlin).{" "}
      </div>

      <div className="row">
        {widgets.map((w) => {
          if (w.key === "events") {
            return (
              <div className="col-lg-4 col-md-6 col-12" key={w.id}>
                <div className="tile widget-tile">
                  <div className="tile-header">
                    <span className="widget-icon fa fa-calendar" /> {w.title}
                  </div>
                  <div className="tile-body">
                    <div style={{ maxHeight: 200, overflowY: "auto", overflowX: "hidden" }}>
                      {events.map((ev) => (
                        <div key={ev.id} style={{ marginBottom: "0.5em" }}>
                          <strong>
                            {formatDate(ev.date)}
                            {ev.endDate ? ` bis ${formatDate(ev.endDate)}` : ""}
                          </strong>
                          <div className="row">
                            {ev.time ? (
                              <div className="col-2">{ev.time}</div>
                            ) : null}
                            <div className={ev.time ? "col-10" : "col-12"}>
                              <span className="d-inline-block">{ev.title}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {events.length === 0 && (
                        <p className="text-muted fst-italic">Keine Termine.</p>
                      )}
                    </div>
                    <div className="text-end" style={{ marginTop: 20 }}>
                      <Link className="btn btn-primary" to="/modules/calendar/overview">
                        Zum Kalender
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          if (w.key === "exams") {
            return (
              <div className="col-lg-4 col-md-6 col-12" key={w.id}>
                <div className="tile widget-tile">
                  <div className="tile-header">
                    <span className="widget-icon fa fa-edit" /> {w.title}
                  </div>
                  <div className="tile-body">
                    <div className="widget-exam-table">
                      <table className="table table-sm mb-0">
                        <thead>
                          <tr>
                            <th>Klassenarbeit</th>
                            <th>Stunde</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exams.map((r) => (
                            <tr key={r.id}>
                              <td>
                                {subject(r.subjectId)?.name || "—"}
                                <div className="small text-muted">{formatDate(r.date)}</div>
                              </td>
                              <td>
                                {r.slotFrom === r.slotTo
                                  ? `${r.slotFrom}.`
                                  : `${r.slotFrom}. – ${r.slotTo}.`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {exams.length === 0 && (
                        <p className="text-muted fst-italic">Aktuell sind keine Klassenarbeiten angekündigt.</p>
                      )}
                    </div>
                    <div className="text-end">
                      <Link className="btn btn-primary" to="/modules/exams/view">
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          if (w.key === "cloud") {
            return (
              <div className="col-lg-4 col-md-6 col-12" key={w.id}>
                <div className="tile widget-tile">
                  <div className="tile-header">{w.title}</div>
                  <div className="tile-body">
                    <div className="custom-formatted-text">
                      <p>
                        <a href="https://cloud.example.org" target="_blank" rel="noreferrer">
                          https://cloud.example.org
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          if (w.key === "homework") {
            return (
              <div className="col-lg-4 col-md-6 col-12" key={w.id}>
                <div className="tile widget-tile">
                  <div className="tile-header">
                    <span className="widget-icon fa fa-tasks" /> {w.title}
                  </div>
                  <div className="tile-body">
                    <table className="table table-sm mb-0">
                      <tbody>
                        {homework.map((r) => (
                          <tr key={r.id}>
                            <td>
                              <strong>{subject(r.subjectId)?.name}</strong>
                              <div className="small text-muted">{formatDate(r.dueDate)}</div>
                            </td>
                            <td>{r.text}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="text-end">
                      <Link className="btn btn-primary" to="/modules/classbook/homework">
                        Alle Hausaufgaben
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </>
  );
}
