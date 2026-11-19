import React, { useState } from "react";
import { useData, useLookup } from "../data.jsx";

const DAYS = [
  { n: 1, label: "Montag", short: "Mo." },
  { n: 2, label: "Dienstag", short: "Di." },
  { n: 3, label: "Mittwoch", short: "Mi." },
  { n: 4, label: "Donnerstag", short: "Do." },
  { n: 5, label: "Freitag", short: "Fr." },
];

// 19.11.2026 liegt in KW 47, die aktuelle Woche ist eine B-Woche.
const BASE_MONDAY = new Date(2026, 10, 16);
const BASE_WEEK = 47;

function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDay(date) {
  return (
    `${String(date.getDate()).padStart(2, "0")}.` +
    `${String(date.getMonth() + 1).padStart(2, "0")}.`
  );
}

const pad = (value) => ` ${value} `;

export default function Schedule() {
  const { data } = useData();
  const { subject, teacher } = useLookup();
  const [offset, setOffset] = useState(0);

  if (!data) return <div className="text-center text-muted py-5">Lade…</div>;

  const monday = addDays(BASE_MONDAY, offset * 7);
  const kw = BASE_WEEK + offset;
  const week = kw % 2 === 0 ? "A" : "B";

  // Wochen mit echter Planung (Datensatz hat isoWeek) gehen vor,
  // sonst greift das A/B-Raster.
  const weekRows = (data.lessons || []).filter((l) => Number(l.isoWeek) === kw);
  const template = (data.lessons || []).filter(
    (l) => !l.isoWeek && (l.week || "B") === week
  );
  const lessons = weekRows.length ? weekRows : template;
  const hasExactWeek = weekRows.length > 0;

  function lessonsAt(day, slot) {
    return lessons.filter((l) => Number(l.day) === day && Number(l.slot) === slot);
  }

  function renderLesson(l) {
    const cancelled = l.status === "cancelled";
    const current = subject(l.subjectId);
    const currentTeacher = teacher(l.teacherId);

    const oldSubject =
      l.oldSubjectId && Number(l.oldSubjectId) !== Number(l.subjectId)
        ? subject(l.oldSubjectId)
        : null;
    const oldTeacher =
      l.oldTeacherId && Number(l.oldTeacherId) !== Number(l.teacherId)
        ? teacher(l.oldTeacherId)
        : null;

    let left;
    if (cancelled) {
      left = <span className="timetable-left">{current?.short || ""}</span>;
    } else if (oldSubject) {
      left = (
        <span className="timetable-left">
          <span className="visual-diff-old me-1">({oldSubject.short})</span>
          <wbr />
          <span className="visual-diff-new">{current?.short || ""}</span>
        </span>
      );
    } else if (oldTeacher) {
      left = (
        <span className="timetable-left">
          <span className="visual-diff-unchanged">{current?.short || ""}</span>
        </span>
      );
    } else {
      left = (
        <span className="timetable-left">
          <span>{pad(current?.short || "")}</span>
        </span>
      );
    }

    const right = oldTeacher ? (
      <span className="timetable-right">
        <span style={{ color: "red" }}>
          <span>
            <span>(</span>
            <span>{pad(oldTeacher.short)}</span>
            <span>)</span>
          </span>
        </span>
        <span>
          <span>
            <span style={{ color: "green" }}>{pad(currentTeacher?.short || "")}</span>
          </span>
        </span>
      </span>
    ) : (
      <span className="timetable-right">
        <span>
          <span>
            <span>{pad(currentTeacher?.short || "")}</span>
          </span>
        </span>
      </span>
    );

    return (
      <div className={`lesson-cell${cancelled ? " cancelled" : ""}`}>
        {left}
        {right}
        <div className="timetable-bottom-host">
          <span className="timetable-bottom">
            <span>{pad(l.room || "")}</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <h1>Stundenplan</h1>
        </div>
      </div>

      <div className="card" style={{ position: "relative" }}>
        <div className="timetable-occurrences text-truncate"> {hasExactWeek ? `KW ${kw}` : `${week}-Woche`} </div>

        <div className="timetable-with-substitutions wide-when-xs">
          <div className="class-hour-calendar">
            <div className="week-navigation padding-for-wide-when-xs">
              <div className="row">
                <div className="current-week-column col-2">
                  <button className="btn btn-light" type="button" onClick={() => setOffset(0)}>
                    <span className="d-inline d-md-none"> Heute </span>
                    <span className="d-none d-md-inline"> Aktuelle Woche </span>
                  </button>
                </div>
                <div className="calendar-week-column col-10 col-md-8">
                  <div className="calendar-week-column-flex">
                    <div>
                      <button
                        className="btn fa fa-chevron-left btn-light"
                        type="button"
                        aria-label="Vorherige Woche"
                        onClick={() => setOffset(offset - 1)}
                      />
                    </div>
                    <div className="calendar-week">
                      <span className="d-inline d-md-none me-1"> KW </span>
                      <span className="d-none d-md-inline me-1"> Kalenderwoche </span>
                      <div className="calendar-week-selection ng-select ng-select-single ng-untouched ng-pristine ng-valid">
                        <div className="ng-select-container ng-has-value">
                          <div className="ng-value-container">
                            <div className="ng-value">
                              <span
                                className="text-right"
                                style={{ width: 24, display: "inline-block", whiteSpace: "nowrap" }}
                              >
                                {" "}
                                {kw}{" "}
                              </span>
                            </div>
                            <div className="ng-input">
                              <input
                                aria-autocomplete="list"
                                role="combobox"
                                type="text"
                                autoCorrect="off"
                                autoCapitalize="off"
                                autoComplete="off"
                                readOnly
                                aria-expanded="false"
                              />
                            </div>
                          </div>
                          <span className="ng-arrow-wrapper">
                            <span className="ng-arrow" />
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <button
                        className="btn fa fa-chevron-right btn-light"
                        type="button"
                        aria-label="Nächste Woche"
                        onClick={() => setOffset(offset + 1)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="calendar-swipe-area swipe-enabled">
              <i className="swipe-indicator swipe-indicator-previous fa fa-chevron-left" />
              <i className="swipe-indicator swipe-indicator-next fa fa-chevron-right" />
              <div>
                <table className="calendar-table">
                  <thead>
                    <tr>
                      <th style={{ verticalAlign: "bottom" }}>
                        <span className="d-none d-md-inline">Stunde</span>
                        <span className="d-inline d-md-none">Std.</span>
                      </th>
                      {DAYS.map((d, i) => (
                        <th key={d.n}>
                          <span className="d-none d-md-inline">{d.label}</span>
                          <span className="d-inline d-md-none">{d.short}</span>
                          <span>
                            <br />
                            <span style={{ fontWeight: "normal" }}>
                              {formatDay(addDays(monday, i))}{" "}
                              <span className="d-none d-md-inline">2026</span>
                            </span>
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((slot) => (
                      <tr key={slot}>
                        <th>
                          <span style={{ cursor: "help" }}> {slot} </span>
                        </th>
                        {DAYS.map((d) => {
                          const cellLessons = lessonsAt(d.n, slot);
                          return (
                            <td key={d.n}>
                              {cellLessons.map((l) => (
                                <div key={l.id}>{renderLesson(l)}</div>
                              ))}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
