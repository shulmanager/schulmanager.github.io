import React from "react";
import { useData, useLookup } from "../data.jsx";
import { Tile, DataTable, formatDate, Pill } from "../components/ui.jsx";

export default function Invoices() {
  const { data } = useData();
  const { student } = useLookup();

  if (!data) return <div className="text-center text-muted py-5">Lade…</div>;

  const rows = (data.invoices || []).slice();
  const open = rows.filter((r) => !r.paid);
  const totalOpen = open.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalPaid = rows.filter((r) => r.paid).reduce((s, r) => s + Number(r.amount || 0), 0);

  return (
    <>
      <div className="row">
        <div className="col-lg-12"><h1>Zahlungen</h1></div>
      </div>

      <div className="row mb-3">
        <div className="col-lg-4">
          <Tile title="Offener Betrag">
            <div className="fs-3 text-center">{totalOpen.toFixed(2)} €</div>
          </Tile>
        </div>
        <div className="col-lg-4">
          <Tile title="Bezahlt">
            <div className="fs-3 text-center">{totalPaid.toFixed(2)} €</div>
          </Tile>
        </div>
        <div className="col-lg-4">
          <Tile title="Rechnungen">
            <div className="fs-3 text-center">{rows.length}</div>
          </Tile>
        </div>
      </div>

      <Tile title="Rechnungen">
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
            { key: "title", label: "Titel" },
            { key: "amount", label: "Betrag", render: (r) => `${Number(r.amount).toFixed(2)} €` },
            { key: "dueDate", label: "Fällig", render: (r) => formatDate(r.dueDate) },
            {
              key: "status",
              label: "Status",
              render: (r) => (r.paid ? <Pill tone="ok">bezahlt</Pill> : <Pill tone="bad">offen</Pill>),
            },
            { key: "paidAt", label: "Bezahlt am", render: (r) => (r.paidAt ? formatDate(r.paidAt) : "—") },
          ]}
          rows={rows}
        />
      </Tile>
    </>
  );
}
