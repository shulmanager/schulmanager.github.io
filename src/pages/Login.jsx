import React, { useState } from "react";
import { useAuth } from "../auth.jsx";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
    } catch {
      setError("E-Mail-Adresse oder Passwort ist falsch.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-md" style={{ paddingTop: 60, paddingBottom: 60 }}>
      <div className="row g-4">
        <div className="col-lg-7 login-hero">
          <h1>Herzlich willkommen im Schulmanager!</h1>
          <p>
            Mit dem Schulmanager organisieren Lehrer, Eltern, Schüler und Schulverwaltung
            einfach den Schulalltag.
          </p>
        </div>

        <div className="col-lg-5">
          <form className="tile mb-3" onSubmit={submit}>
            <div className="tile-header">Login</div>
            <div className="tile-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="mb-3">
                <label className="form-label fw-medium">E-Mail-Adresse / Benutzername</label>
                <input
                  className="form-control"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-medium">Passwort</label>
                <input
                  className="form-control"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <a href="#/login" onClick={(e) => e.preventDefault()} className="small">
                  Passwort vergessen
                </a>
                <button className="btn btn-primary" type="submit" disabled={busy}>
                  {busy ? "…" : "Einloggen"}
                </button>
              </div>
            </div>
          </form>

          <div className="tile mb-3">
            <div className="tile-header">Erstmalig anmelden</div>
            <div className="tile-body">
              <div className="mb-3">
                <label className="form-label fw-medium">Zugangscode</label>
                <input
                  className="form-control"
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <div className="text-end">
                <button className="btn btn-primary" type="button" disabled>
                  Anmelden
                </button>
              </div>
            </div>
          </div>

          <div className="tile mb-3">
            <div className="tile-header">Schule auswählen</div>
            <div className="tile-body text-muted">
              Klicken Sie hier, um Ihre Schule auszuwählen
            </div>
          </div>

          <div className="d-flex justify-content-between small text-muted mt-4">
            <span>© 2026 Schulmanager</span>
            <span>
              <a href="#/privacy" onClick={(e) => e.preventDefault()}>Datenschutz</a>{" "}
              <a href="#/imprint" onClick={(e) => e.preventDefault()}>Impressum</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
