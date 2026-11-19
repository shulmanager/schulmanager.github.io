import React from "react";
import { useAuth } from "../auth.jsx";
import { useData, useLookup } from "../data.jsx";
import { Tile, DataTable, formatDate, Pill } from "../components/ui.jsx";

export default function Exams() {
  const { user } = useAuth();
  const { data } = useData();
  const { subject, teacher, classOf } = useLookup();

  if (!data) return <div className="text-center text-muted py-5">Lade…</div>;

  const exams = (data.exams || [])
    .slice()
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const today = new Date("2026-11-19");
  const upcoming = exams.filter((e) => new Date(e.date) >= today);
  const past = exams.filter((e) => new Date(e.date) < today);

  const columns = [
    { key: "subject", label: "Fach", render: (r) => subject(r.subjectId)?.name || "—" },
    { key: "date", label: "Datum", render: (r) => formatDate(r.date) },
    {
      key: "slot",
      label: "Stunde",
      render: (r) =>
        r.slotFrom === r.slotTo ? `${r.slotFrom}.` : `${r.slotFrom}. – ${r.slotTo}.`,
    },
    { key: "room", label: "Raum" },
    { key: "teacher", label: "Lehrkraft", render: (r) => teacher(r.teacherId)?.name || "—" },
    { key: "class", label: "Klasse", render: (r) => classOf(r.classId)?.name || "—" },
  ];

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <h1>Klassenarbeitstermine{user?.name ? ` für ${user.name}` : ""}</h1>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <div className="card p-3">
            <h4>Anstehende Klassenarbeiten</h4>
            <DataTable
              columns={[
                ...columns,
                {
                  key: "status",
                  label: "Status",
                  render: () => <Pill tone="warn">anstehend</Pill>,
                },
              ]}
              rows={upcoming}
            />
            <h4 className="mt-4">Vergangene Klassenarbeiten</h4>
            <DataTable columns={columns} rows={past} empty="Keine Einträge." />
          </div>
        </div>
      </div>
    </>
  );
}
