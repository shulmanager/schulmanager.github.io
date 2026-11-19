import React, { useState } from "react";
import { useData } from "../data.jsx";
import { Tile, formatDate, Pill, Modal } from "../components/ui.jsx";

export default function Letters() {
  const { data } = useData();
  const [open, setOpen] = useState(null);
  const [signed, setSigned] = useState({});

  if (!data) return <div className="text-center text-muted py-5">Lade…</div>;

  return (
    <>
      <div className="row">
        <div className="col-lg-12"><h1>Elternbriefe</h1></div>
      </div>

      <div className="row">
        {data.letters.map((letter) => (
          <div className="col-lg-6 mb-3" key={letter.id}>
            <Tile
              title={letter.title}
              footer={
                <button className="btn btn-primary btn-sm" onClick={() => setOpen(letter)}>
                  Brief öffnen
                </button>
              }
            >
              <div className="small text-muted mb-2">
                {formatDate(letter.date)} · {letter.audience}
              </div>
              <p className="mb-0">{letter.body.slice(0, 160)}…</p>
              {letter.requiresSignature && (
                <div className="mt-2">
                  {signed[letter.id] ? (
                    <Pill tone="ok">bestätigt</Pill>
                  ) : (
                    <Pill tone="warn">Unterschrift erforderlich</Pill>
                  )}
                </div>
              )}
            </Tile>
          </div>
        ))}
      </div>

      {open && (
        <Modal title={open.title} onClose={() => setOpen(null)}>
          <div className="small text-muted mb-2">{formatDate(open.date)} · {open.audience}</div>
          <p style={{ whiteSpace: "pre-wrap" }}>{open.body}</p>
          {open.requiresSignature && (
            <div className="mt-3">
              <button
                className="btn btn-success"
                onClick={() => {
                  setSigned({ ...signed, [open.id]: true });
                  setOpen(null);
                }}
              >
                Kenntnisnahme bestätigen
              </button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
