import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useData } from "../data.jsx";

const MODULES = [
  { to: "/dashboard", label: "Startseite", icon: "fa-home" },
  { to: "/modules/letters/view", label: "Elternbriefe", icon: "fa-envelope-o" },
  { to: "/modules/calendar/overview", label: "Kalender", icon: "fa-calendar" },
  { to: "/modules/exams/view", label: "Klassenarbeiten", icon: "fa-edit" },
  { to: "/modules/classbook/reports", label: "Klassenbuch", icon: "fa-book" },
  { to: "/modules/classbook/homework", label: "Hausaufgaben", icon: "fa-tasks" },
  { to: "/modules/detention/enrollments", label: "Nacharbeit", icon: "fa-clock-o" },
  { to: "/modules/messenger/messages", label: "Nachrichten", icon: "fa-comments" },
  { to: "/modules/schedules/view", label: "Stundenplan", icon: "fa-clock-o" },
  { to: "/modules/invoicing/students-invoices", label: "Zahlungen", icon: "fa-euro" },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { data } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(null);

  const unread = (data?.threads || []).reduce((n, t) => n + (t.unread || 0), 0);

  const currentModule =
    MODULES.filter((m) => location.pathname.startsWith(m.to)).sort(
      (a, b) => b.to.length - a.to.length
    )[0] || MODULES[0];

  useEffect(() => {
    document.title = `${currentModule.label} - Schulmanager Online`;
  }, [currentModule.label]);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  function toggle(name) {
    setOpen((o) => (o === name ? null : name));
  }

  return (
    <>
      <nav className="sm-navbar d-print-none chat-visible many-modules">
        <div className="container-md sm-navbar-content">
          <div className="logo">
            <Link to="/dashboard" aria-label="Zur Startseite des Schulmanagers">
              <img src={`${import.meta.env.BASE_URL}vendor/logo.svg`} alt="Schulmanager" />
            </Link>
          </div>

          <div className="overview-navigation d-none d-md-block">
            <div className={`overview-navigation-dropdown dropdown active ${open === "modules" ? "show" : ""}`}>
              <button
                type="button"
                className="dropdown-toggle"
                aria-haspopup="true"
                aria-expanded={open === "modules"}
                aria-label={`Modulübersicht, aktuelles Modul ${currentModule.label}`}
                onClick={() => toggle("modules")}
              >
                <span>
                  <span className={`fa fa-fw ${currentModule.icon}`} aria-hidden="true" />{" "}
                  {currentModule.label}{" "}
                </span>
              </button>
              <div className={`dropdown-menu module-overview ${open === "modules" ? "show" : ""}`}>
                {MODULES.map((m) => (
                  <Link
                    key={m.to}
                    className="module-label"
                    to={m.to}
                    onClick={() => setOpen(null)}
                  >
                    <span className={`fa fa-fw ${m.icon}`} /> {m.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="ms-auto">
            <ul role="list" className="right-navigation right-navigation-lg d-none d-md-inline">
              <li>
                <div className={`navbar-dropdown-container dropdown ${open === "messages" ? "show" : ""}`}>
                  <button
                    type="button"
                    className="dropdown-toggle navbar-dropdown-toggle"
                    title="Nachrichten"
                    onClick={() => toggle("messages")}
                  >
                    <span className="fa fa-envelope" aria-hidden="true" />
                    {unread > 0 && <span className="new-messages-count"> {unread} </span>}
                  </button>
                  <div className={`dropdown-menu navbar-dropdown-menu ${open === "messages" ? "show" : ""}`}>
                    <div className="messages-header">
                      <Link className="dropdown-item messages-action" to="/modules/messenger/messages" onClick={() => setOpen(null)}>
                        <span className="fa fa-paper-plane" /> Neue Nachricht
                      </Link>
                      <Link className="dropdown-item messages-action" to="/modules/messenger/messages" onClick={() => setOpen(null)}>
                        <span className="fa fa-comment" /> Alle Nachrichten
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <button type="button" className="navbar-dropdown-toggle" title="Benachrichtigungen">
                  <span className="fa fa-bell" aria-hidden="true" />
                </button>
              </li>
              <li>
                <button type="button" className="navbar-dropdown-toggle" title="Hilfe">
                  <span className="fa fa-question-circle" aria-hidden="true" />
                </button>
              </li>
              <li>
                <div className={`navbar-dropdown-container dropdown ${open === "user" ? "show" : ""}`}>
                  <button
                    type="button"
                    className="dropdown-toggle navbar-dropdown-toggle"
                    onClick={() => toggle("user")}
                  >
                    <span className="fa fa-user" aria-hidden="true" />
                  </button>
                  <div className={`dropdown-menu navbar-dropdown-menu ${open === "user" ? "show" : ""}`}>
                    <Link className="dropdown-item" to="/account" onClick={() => setOpen(null)}>
                      <span className="fa fa-user" /> Mein Account
                    </Link>
                    {(user?.role === "admin" || user?.role === "teacher") && (
                      <Link className="dropdown-item" to="/admin" onClick={() => setOpen(null)}>
                        <span className="fa fa-cogs" /> Admin-Panel
                      </Link>
                    )}
                    <div className="dropdown-divider" />
                    <button className="dropdown-item" type="button" onClick={handleLogout}>
                      <span className="fa fa-sign-out" /> Ausloggen
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="container-md">{children}</div>
      </main>

      <footer className="container-md d-none d-md-block" style={{ clear: "both" }}>
        <div className="row d-print-none">
          <div className="col"> © 2026 Schulmanager Online </div>
          <div className="col text-right">
            <a href="#/privacy" onClick={(e) => e.preventDefault()} style={{ marginRight: "3em" }}>
              Datenschutz
            </a>
            <a href="#/imprint" onClick={(e) => e.preventDefault()}>
              Impressum
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
