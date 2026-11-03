import { useState } from "react";
import { createReport } from "../api/reports";

const LABELS = { fire: "Fire", hazard: "Fire hazard", struct: "Structural damage", equip: "Equipment failure" };

function severityFrom(r) {
  if (r.casualties > 0) return "critical";
  if (r.evacuation_seconds > 120) return "high";
  if (r.evacuation_seconds > 60) return "medium";
  return "low";
}

export default function ReportForm({ sim, onSaved, onCancel }) {
  const types = (sim.emergency_types || []).map((t) => LABELS[t] || t).join(", ");
  const [f, setF] = useState({
    title: `${types || "Emergency"} drill – ${new Date(sim.completed_at).toLocaleDateString()}`,
    severity: severityFrom(sim),
    reporter_name: "",
    location: "",
    summary: "",
    actions_taken: "",
    recommendations: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const saved = await createReport({
        ...f,
        emergency_type: types || "Emergency",
        total_people: sim.total_people,
        evacuated: sim.evacuated,
        casualties: sim.casualties,
        evacuation_secs: sim.evacuation_seconds,
        metrics: sim,
      });
      onSaved(saved);
    } catch (ex) {
      setErr("Could not save: " + ex.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="rf" onSubmit={submit}>
      <h2>Emergency report</h2>

      <div className="rf-metrics">
        <Metric v={sim.total_people} l="People" />
        <Metric v={sim.evacuated} l="Evacuated" />
        <Metric v={sim.casualties} l="Casualties" />
        <Metric v={sim.evacuation_time_label} l="Evac. time" />
        <Metric v={`${sim.exits_open}/${sim.exits_total}`} l="Exits open" />
        <Metric v={sim.peak_jam_people} l="Worst jam" />
      </div>

      {sim.suggestions?.length>0&&(<div className="rf-sug"><h4>Automatic suggestions</h4><ul>{sim.suggestions.map((s,i)=><li key={i}>{s}</li>)}</ul></div>)}

      <label>Title<input required value={f.title} onChange={set("title")} /></label>
      <div className="rf-row">
        <label>Severity
          <select value={f.severity} onChange={set("severity")}>
            <option value="low">Low</option><option value="medium">Medium</option>
            <option value="high">High</option><option value="critical">Critical</option>
          </select>
        </label>
        <label>Reported by<input value={f.reporter_name} onChange={set("reporter_name")} /></label>
      </div>
      <label>Building / location<input value={f.location} onChange={set("location")} /></label>
      <label>Summary<textarea rows="3" value={f.summary} onChange={set("summary")} /></label>
      <label>Actions taken<textarea rows="3" value={f.actions_taken} onChange={set("actions_taken")} /></label>
      <label>Recommendations<textarea rows="3" value={f.recommendations} onChange={set("recommendations")} /></label>

      {err && <div className="rf-err">{err}</div>}
      <div className="rp-actions">
        <button className="rp-primary" disabled={busy}>{busy ? "Saving…" : "Save report"}</button>
        <button type="button" className="rp-ghost" onClick={onCancel}>Back to simulator</button>
      </div>
    </form>
  );
}

const Metric = ({ v, l }) => (<div className="rf-m"><b>{v}</b><span>{l}</span></div>);



