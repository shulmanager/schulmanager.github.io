import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth.jsx";
import { useData, useLookup } from "../data.jsx";
import { api } from "../api.js";
import { formatDateTime } from "../components/ui.jsx";

export default function Messages() {
  const { user } = useAuth();
  const { data, reload } = useData();
  const { userById } = useLookup();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const threads = data?.threads || [];
  const allMessages = data?.messages || [];

  const filtered = useMemo(() => {
    return threads
      .filter((t) => (filter === "archived" ? t.archived : !t.archived))
      .filter((t) => (filter === "unread" ? (t.unread || 0) > 0 : true))
      .filter((t) =>
        query ? String(t.subject).toLowerCase().includes(query.toLowerCase()) : true
      )
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }, [threads, filter, query]);

  const active = threads.find((t) => t.id === activeId) || filtered[0] || null;

  useEffect(() => {
    if (!activeId && filtered[0]) setActiveId(filtered[0].id);
  }, [filtered, activeId]);

  const messages = allMessages
    .filter((m) => m.threadId === active?.id)
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));

  async function markRead(thread) {
    if (!thread || !thread.unread) return;
    if (user?.role !== "admin" && user?.role !== "teacher") return;
    try {
      await api.update("threads", thread.id, { unread: 0 });
      await reload();
    } catch {
      /* best effort */
    }
  }

  async function send(e) {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    setBusy(true);
    try {
      await api.create("messages", {
        threadId: active.id,
        authorId: user.id,
        body: draft.trim(),
        createdAt: new Date().toISOString(),
      });
      setDraft("");
      await reload();
    } catch (err) {
      window.alert("Nachricht konnte nicht gesendet werden: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!data) return <div className="text-center text-muted py-5">Lade…</div>;

  return (
    <div className="row">
      <div className="col-lg-4 col-md-5 d-print-none">
        <div className="tile">
          <div className="tile-header">
            <a
              className="pull-right fa fa-cog notification-settings"
              title="Benachrichtigungseinstellungen"
              href="#/modules/messenger/messages"
              onClick={(e) => e.preventDefault()}
              style={{ marginTop: "0.2em", color: "#fff", textDecoration: "none" }}
            />
            Nachrichten
          </div>
          <div className="tile-body" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <div className="px-2 mb-2">
              <input
                type="search"
                placeholder="Suchen..."
                className="form-control"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="my-2 fs-6 hstack gap-2">
                <button
                  type="button"
                  className={`badge rounded-pill text-bg-light p-2 thread-filter-button ${filter === "all" ? "active" : ""}`}
                  onClick={() => setFilter("all")}
                >
                  <span className="fa fa-envelope-o me-1" /> Alle
                </button>
                <button
                  type="button"
                  className={`badge rounded-pill text-bg-light p-2 thread-filter-button ${filter === "unread" ? "active" : ""}`}
                  onClick={() => setFilter("unread")}
                >
                  <span className="fa fa-eye-slash me-1" /> Ungelesene
                </button>
                <button
                  type="button"
                  className={`badge rounded-pill text-bg-light p-2 ms-auto thread-filter-button ${filter === "archived" ? "active" : ""}`}
                  onClick={() => setFilter("archived")}
                >
                  <span className="fa fa-archive me-1" /> Archiv
                </button>
              </div>
            </div>

            <div className="thread-list">
              {filtered.length === 0 && (
                <div className="text-center text-muted py-4">Keine Unterhaltungen.</div>
              )}
              {filtered.map((t) => (
                <a
                  key={t.id}
                  href={`#/modules/messenger/messages/${t.id}`}
                  className={`thread-list-item ${t.unread > 0 ? "text-bold" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveId(t.id);
                    markRead(t);
                  }}
                >
                  <div className="d-flex justify-content-between gap-2">
                    <span className="text-truncate">{t.subject}</span>
                    {t.unread > 0 && <span className="badge text-bg-primary">{t.unread}</span>}
                  </div>
                  <div className="small text-muted d-flex justify-content-between gap-2">
                    <span className="text-truncate">{userById(t.authorId)?.name || "—"}</span>
                    <span>{formatDateTime(t.createdAt)}</span>
                  </div>
                  <div className="small text-muted text-truncate">{t.participants}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="col-lg-8 col-md-7">
        <div className="tile">
          <div className="tile-header">
            {active ? active.subject : "Nachricht wählen"}
          </div>
          <div className="tile-body p-0">
            {!active && <div className="text-center text-muted py-5">Wähle links eine Unterhaltung.</div>}
            {active && (
              <>
                <div className="chat-scroll">
                  {messages.map((m) => (
                    <div key={m.id} className={`chat-bubble ${m.authorId === user.id ? "mine" : ""}`}>
                      <div className="who">{userById(m.authorId)?.name || "—"}</div>
                      <div>{m.body}</div>
                      <div className="when">{formatDateTime(m.createdAt)}</div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="text-center text-muted py-4">Noch keine Nachrichten.</div>
                  )}
                </div>
                <form className="chat-composer" onSubmit={send}>
                  <input
                    className="form-control"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Nachricht schreiben…"
                  />
                  <button className="btn btn-primary" disabled={busy || !draft.trim()}>
                    <span className="fa fa-paper-plane" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
