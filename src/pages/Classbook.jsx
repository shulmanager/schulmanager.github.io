import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useData, useLookup } from "../data.jsx";
import { Tile, DataTable, formatDate } from "../components/ui.jsx";

export default function Classbook({ homework }) {
  const { data } = useData();
  const { subject, teacher, classOf } = useLookup();
  const location = useLocation();
  const isHomework = homework ?? location.pathname.includes("homework");

  if (!data) return <div className="text-center text-muted py-5">Lade…</div>;

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <h1>Klassenbuch</h1>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-lg-12 d-flex gap-2">
          <Link className={`btn ${!isHomework ? "btn-primary" : "btn-light"}`} to="/modules/classbook/reports">
            Berichte
          </Link>
          <Link className={`btn ${isHomework ? "btn-primary" : "btn-light"}`} to="/modules/classbook/homework">
            Hausaufgaben
          </Link>
        </div>
      </div>

      {isHomework ? (
        <Tile title="Hausaufgaben">
          <DataTable
            columns={[
              { key: "subject", label: "Fach", render: (r) => subject(r.subjectId)?.name || "—" },
              { key: "class", label: "Klasse", render: (r) => classOf(r.classId)?.name || "—" },
              { key: "text", label: "Aufgabe" },
              { key: "teacher", label: "Lehrkraft", render: (r) => teacher(r.teacherId)?.name || "—" },
              { key: "due", label: "Fällig", render: (r) => formatDate(r.dueDate) },
            ]}
            rows={(data.homework || [])
              .slice()
              .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))}
          />
        </Tile>
      ) : (
        <div className="row">
          <div className="col-lg-4">
            <Tile title="Statistik">
              <table className="table table-sm mb-0">
                <tbody>
                  <tr><td>Hausaufgaben gesamt</td><td className="text-end">{data.homework.length}</td></tr>
                  <tr><td>Klassenarbeiten</td><td className="text-end">{data.exams.length}</td></tr>
                  <tr><td>Offene Nacharbeiten</td><td className="text-end">{data.detentions.filter((d) => !d.done).length}</td></tr>
                </tbody>
              </table>
            </Tile>
          </div>
          <div className="col-lg-8">
            <Tile title="Historie">
              <DataTable
                columns={[
                  { key: "subject", label: "Fach", render: (r) => subject(r.subjectId)?.name || "—" },
                  { key: "class", label: "Klasse", render: (r) => classOf(r.classId)?.name || "—" },
                  { key: "date", label: "Datum", render: (r) => formatDate(r.dueDate) },
                  { key: "text", label: "Eintrag" },
                ]}
                rows={(data.homework || []).slice().reverse().slice(0, 8)}
              />
            </Tile>
          </div>
        </div>
      )}
    </>
  );
}
