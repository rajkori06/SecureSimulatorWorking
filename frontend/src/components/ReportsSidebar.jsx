export default function ReportsSidebar({ open, reports, loading, error, activeId, onSelect, onClose, onRefresh }) {
  return (
    <aside className={"rs" + (open ? " open" : "")} aria-hidden={!open}>
      <div className="rs-head">
        <b>Saved reports</b>
        <span>
          <button className="rs-x" onClick={onRefresh} title="Refresh">↻</button>
          <button className="rs-x" onClick={onClose} title="Close">✕</button>
        </span>
      </div>
      {loading && <div className="rs-note">Loading…</div>}
      {error && <div className="rs-note rs-err">{error}</div>}
      {!loading && !error && !reports.length && <div className="rs-note">No reports saved yet.</div>}
      <ul>
        {reports.map((r) => (
          <li key={r.id}>
            <button className={r.id === activeId ? "act" : ""} onClick={() => onSelect(r.id)}>
              <span className={"sev " + r.severity} />
              <div>
                <strong>{r.title}</strong>
                <small>
                  {new Date(r.created_at).toLocaleString()} · {r.evacuated}/{r.total_people} out
                </small>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
