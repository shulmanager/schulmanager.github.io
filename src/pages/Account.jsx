import React from "react";
import { useAuth } from "../auth.jsx";
import { useData } from "../data.jsx";
import { Tile, Pill } from "../components/ui.jsx";

export default function Account() {
  const { user } = useAuth();
  const { data } = useData();

  if (!data) return <div className="text-center text-muted py-5">Lade…</div>;

  return (
    <>
      <div className="row">
        <div className="col-lg-12"><h1>Mein Account</h1></div>
      </div>
      <div className="row">
        <div className="col-lg-6">
          <Tile title="Profil">
            <table className="table table-sm mb-0">
              <tbody>
                <tr><td className="text-muted">Name</td><td>{user?.name}</td></tr>
                <tr><td className="text-muted">E-Mail</td><td>{user?.email}</td></tr>
                <tr>
                  <td className="text-muted">Rolle</td>
                  <td><Pill tone={user?.role === "admin" ? "warn" : "ok"}>{user?.role}</Pill></td>
                </tr>
                <tr><td className="text-muted">Kürzel</td><td>{user?.avatar}</td></tr>
              </tbody>
            </table>
          </Tile>
        </div>
        <div className="col-lg-6">
          <Tile title="Benachrichtigungen">
            <p className="text-muted">E-Mail-Benachrichtigungen für neue Nachrichten, Termine und Zahlungen.</p>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" defaultChecked id="n1" />
              <label className="form-check-label" htmlFor="n1">Neue Nachrichten</label>
            </div>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" defaultChecked id="n2" />
              <label className="form-check-label" htmlFor="n2">Termine und Klassenarbeiten</label>
            </div>
            <div className="form-check mb-3">
              <input className="form-check-input" type="checkbox" id="n3" />
              <label className="form-check-label" htmlFor="n3">Zahlungserinnerungen</label>
            </div>
            <button className="btn btn-primary" type="button">Speichern</button>
          </Tile>
        </div>
      </div>
    </>
  );
}
