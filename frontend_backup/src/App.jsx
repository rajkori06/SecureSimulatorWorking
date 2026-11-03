import { useState } from 'react';
import './App.css';

export default function App() {
  const [entered, setEntered] = useState(false);

  if (entered) {
    return (
      <div className="sim-wrap">
        <iframe className="sim-frame" src="/Secure_Simulator_emergency.html" title="Secure Simulator" />
        <button className="back-btn" onClick={() => setEntered(false)}>Exit to title</button>
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
