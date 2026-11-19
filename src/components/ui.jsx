import React from "react";

export function Tile({ title, children, footer, actions, className = "", tight, icon }) {
  return (
    <div className={`tile ${className}`}>
      {title && (
        <div className="tile-header">
          {icon && <span className={`widget-icon fa ${icon}`} />} {title}
          {actions && <span className="float-end">{actions}</span>}
        </div>
      )}
      <div className="tile-body" style={tight ? { paddingLeft: 0, paddingRight: 0 } : undefined}>
        {children}
      </div>
      {footer && <div className="tile-body border-top py-2 text-end">{footer}</div>}
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <div className="mb-3">
      {label && <label className="form-label fw-medium">{label}</label>}
      {children}
      {hint && <div className="form-text">{hint}</div>}
    </div>
  );
}

export function DataTable({ columns, rows, empty = "Keine Einträge vorhanden.", rowKey }) {
  if (!rows || rows.length === 0) {
    return <div className="text-center text-muted py-4">{empty}</div>;
  }
  return (
    <div className="table-responsive">
      <table className="table table-sm table-tight align-middle mb-0">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.className}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey ? rowKey(row) : row.id ?? i}>
              {columns.map((c) => (
                <td key={c.key} className={c.className}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({ title, children, onClose, footer }) {
  return (
    <div className="drawer" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="drawer-box">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <strong>{title}</strong>
          <button className="btn btn-sm btn-light" onClick={onClose}>
            Schließen
          </button>
        </div>
        {children}
        {footer && <div className="d-flex justify-content-end gap-2 mt-3">{footer}</div>}
      </div>
    </div>
  );
}

export function Spinner() {
  return <div className="text-center text-muted py-5">Lade…</div>;
}

export function Pill({ children, tone }) {
  const map = {
    ok: "text-bg-success",
    warn: "text-bg-warning",
    bad: "text-bg-danger",
  };
  return (
    <span className={`badge rounded-pill ${map[tone] || "text-bg-light"}`}>{children}</span>
  );
}

export function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
