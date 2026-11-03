export default function ReportPopup({ report, onOpen, onDismiss }) {
  if (!report) return null;
  return (
    <div className="rp-backdrop" role="dialog" aria-modal="true" aria-label="Simulation complete">
      <div className="rp-card">
        <div className="rp-badge">Simulation complete</div>
        <h2>Generate emergency report?</h2>
        <p className="rp-sub">
          {report.evacuated} of {report.total_people} evacuated in {report.evacuation_time_label}
          {report.casualties ? ` · ${report.casualties} casualties` : ""}
        </p>
        <div className="rp-actions">
          <button className="rp-primary" onClick={onOpen}>Open report form</button>
          <button className="rp-ghost" onClick={onDismiss}>Not now</button>
        </div>
      </div>
    </div>
  );
}
