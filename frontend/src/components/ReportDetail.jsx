export default function ReportDetail({ report, onClose, onDelete }) {
  const m = report.metrics || {};
  const Row = ({ t, v }) => v ? (<><h4>{t}</h4><p>{v}</p></>) : null;
  return (
    <div className="rf">
      <h2>{report.title}</h2>
      <p className="rp-sub">
        {new Date(report.created_at).toLocaleString()} · {report.emergency_type} · severity {report.severity}
        {report.reporter_name && ` · ${report.reporter_name}`}
      </p>
      <div className="rf-metrics">
        <div className="rf-m"><b>{report.total_people}</b><span>People</span></div>
        <div className="rf-m"><b>{report.evacuated}</b><span>Evacuated</span></div>
        <div className="rf-m"><b>{report.casualties}</b><span>Casualties</span></div>
        <div className="rf-m"><b>{m.evacuation_time_label || "–"}</b><span>Evac. time</span></div>
        <div className="rf-m"><b>{m.exits_open ?? "–"}/{m.exits_total ?? "–"}</b><span>Exits open</span></div>
        <div className="rf-m"><b>{m.peak_jam_people ?? "–"}</b><span>Worst jam</span></div>
      </div>
      {m.suggestions?.length>0&&(<div className="rf-sug"><h4>Automatic suggestions</h4><ul>{m.suggestions.map((s,i)=><li key={i}>{s}</li>)}</ul></div>)}
      <Row t="Location" v={report.location} />
      <Row t="Summary" v={report.summary} />
      <Row t="Actions taken" v={report.actions_taken} />
      <Row t="Recommendations" v={report.recommendations} />
      <div className="rp-actions">
        <button className="rp-ghost" onClick={onClose}>Back to simulator</button>
        <button className="rp-danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
