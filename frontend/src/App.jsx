import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import './reports.css';
import { deleteReport, getReport, listReports } from './api/reports';
import ReportPopup from './components/ReportPopup';
import ReportForm from './components/ReportForm';
import ReportDetail from './components/ReportDetail';
import ReportsSidebar from './components/ReportsSidebar';

export default function App() {
  const [entered, setEntered] = useState(false);

  // ---- report feature state ----
  const iframeRef = useRef(null);
  const [sim, setSim] = useState(null);       // latest simulation result sent by the iframe
  const [popup, setPopup] = useState(false);
  const [view, setView] = useState('sim');    // 'sim' | 'form' | 'detail'
  const [detail, setDetail] = useState(null);
  const [sidebar, setSidebar] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setReports(await listReports()); }
    catch (e) { setError('Could not load reports: ' + e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (entered) refresh(); }, [entered, refresh]);

  // Listen for "simulation complete" from the iframe (only from our own iframe)
  useEffect(() => {
    const onMsg = (e) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      if (e.data?.source !== 'evac-sim' || e.data.type !== 'SIMULATION_COMPLETE') return;
      setSim(e.data.report);
      setPopup(true);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const openDetail = async (id) => {
    try { setDetail(await getReport(id)); setView('detail'); setSidebar(false); }
    catch (e) { setError(e.message); }
  };

  const exitToTitle = () => {
    setEntered(false); setView('sim'); setPopup(false); setSidebar(false); setSim(null);
  };

  if (entered) {
    return (
      <div className="sim-wrap">
        <iframe
          ref={iframeRef}
          className="sim-frame"
          src="/Secure_Simulator_emergency5.html"
          title="Secure Simulator"
        />
        <button className="back-btn" onClick={exitToTitle}>Exit to title</button>
        <button className="reports-btn" onClick={() => setSidebar((s) => !s)}>
          Reports ({reports.length})
        </button>

        <ReportsSidebar
          open={sidebar} reports={reports} loading={loading} error={error}
          activeId={detail?.id} onSelect={openDetail}
          onClose={() => setSidebar(false)} onRefresh={refresh}
        />

        <ReportPopup
          report={popup ? sim : null}
          onOpen={() => { setPopup(false); setView('form'); }}
          onDismiss={() => setPopup(false)}
        />

        {view === 'form' && sim && (
          <div className="page">
            <ReportForm
              sim={sim}
              onCancel={() => setView('sim')}
              onSaved={async (saved) => { await refresh(); setDetail(saved); setView('detail'); }}
            />
          </div>
        )}

        {view === 'detail' && detail && (
          <div className="page">
            <ReportDetail
              report={detail}
              onClose={() => setView('sim')}
              onDelete={async () => {
                await deleteReport(detail.id);
                setDetail(null); setView('sim'); refresh();
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="title-screen">
      <svg className="plan-bg" viewBox="0 0 300 180" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
          <path d="M0 0H130M170 0H300M0 180H300M0 0V70M0 110V180M300 0V70M300 110V180" />
          <path d="M100 0V50M100 80V130M100 160V180M200 0V50M200 80V130M200 160V180M100 90H140M160 90H200" />
        </g>
        <circle cx="236" cy="68" r="5" className="plan-fire" />
        <circle cx="236" cy="68" r="14" className="plan-fire-ring" />
      </svg>

      <div className="title-box">
        <p className="kicker">AI-enabled digital twin</p>
        <h1>Secure Simulator</h1>
        <p className="sub">
          Upload a floor plan, start a fire, and watch how a crowd finds its way out.
        </p>
        <button className="enter-btn" onClick={() => setEntered(true)}>Enter simulator</button>
        <p className="hint">Works with DXF, GeoJSON and JSON plans</p>
      </div>
    </main>
  );
}
