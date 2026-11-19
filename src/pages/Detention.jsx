import React from "react";
import { useData, useLookup } from "../data.jsx";
import { Tile, DataTable, formatDate, Pill } from "../components/ui.jsx";

export default function Detention() {
  const { data } = useData();
  const { subject, teacher, student } = useLookup();

  if (!data) return <div className="text-center text-muted py-5">Lade…</div>;

  const rows = (data.detentions || [])
    .slice()
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  return (
    <>
      <div className="row">
        <div className="col-lg-12"><h1>Nacharbeit</h1></div>
      </div>
      <Tile title={`Anmeldungen zur Nacharbeit (${rows.filter((r) => !r.done).length} offen)`}>
        <DataTable
          columns={[
            {
              key: "student",
              label: "Schüler",
              render: (r) => {
                const s = student(r.studentId);
                return s ? `${s.firstName} ${s.lastName}` : "—";
              },
            },
            { key: "subject", label: "Fach", render: (r) => subject(r.subjectId)?.name || "—" },
            { key: "date", label: "Datum", render: (r) => formatDate(r.date) },
            { key: "slot", label: "Stunde", render: (r) => `${r.slot}.` },
            { key: "room", label: "Raum" },
            { key: "teacher", label: "Lehrkraft", render: (r) => teacher(r.teacherId)?.name || "—" },
            { key: "reason", label: "Grund" },
            {
              key: "status",
              label: "Status",
              render: (r) => (r.done ? <Pill tone="ok">erledigt</Pill> : <Pill tone="bad">offen</Pill>),
            },
          ]}
          rows={rows}
        />
      </Tile>
    </>
  );
}
