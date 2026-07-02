import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getUUID, getOTP, getAESKey, getToken } from '../services/api';

const endpoints = [
  { path: '/random/uuid',          label: 'unique ID', fn: getUUID,             display: '/random/uuid' },
  { path: '/random/otp?digits=6',  label: '6-digit OTP', fn: () => getOTP(6),   display: '/random/otp' },
  { path: '/random/aes-key',       label: '256-bit key', fn: () => getAESKey(256), display: '/random/aes-key' },
  { path: '/random/token',         label: 'session token', fn: getToken,        display: '/random/token' },
];

export default function Landing() {
  const [selected, setSelected] = useState(0);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (idx) => {
    setSelected(idx);
    setLoading(true);
    setOutput(null);
    try {
      const res = await endpoints[idx].fn();
      setOutput(res.data);
    } catch (e) {
      setOutput({ error: 'Could not reach the API. Is your backend running?' });
    }
    setLoading(false);
  }, []);

  useEffect(() => { run(0); }, [run]);

  return (
    <>
      <style>{`
        .hero { flex:1; display:grid; grid-template-columns:1fr 1fr; gap:0; max-width:1280px; width:100%; margin:0 auto; padding:80px 48px 60px; align-items:center; }
        .hero-eyebrow { font-family:var(--m); font-size:11px; letter-spacing:2.5px; text-transform:uppercase; color:var(--lava); margin-bottom:20px; display:flex; align-items:center; gap:8px; }
        .hero-eyebrow::before { content:''; display:block; width:24px; height:1px; background:var(--lava); }
        .hero-h1 { font-size:clamp(36px,4vw,52px); font-weight:700; line-height:1.12; letter-spacing:-1.5px; color:var(--text); margin-bottom:22px; }
        .hero-sub { font-size:17px; color:var(--text-2); line-height:1.75; max-width:440px; margin-bottom:36px; }
        .btn-primary { padding:13px 28px; border-radius:var(--r-md); background:var(--lava); color:#fff; font-size:15px; font-weight:600; transition:filter .15s, transform .15s; display:inline-block; }
        .btn-primary:hover { filter:brightness(1.1); transform:translateY(-1px); }
        .btn-ghost { padding:13px 24px; border-radius:var(--r-md); background:transparent; color:var(--text-2); font-size:15px; font-weight:500; border:1px solid var(--border-hi); transition:color .15s,border-color .15s; }
        .btn-ghost:hover { color:var(--text); border-color:var(--text-2); }
        .pg-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r-xl); overflow:hidden; }
        .pg-bar { display:flex; align-items:center; justify-content:space-between; padding:14px 20px; border-bottom:1px solid var(--border); background:var(--raised); }
        .pg-body { padding:20px; display:flex; flex-direction:column; gap:10px; }
        .ep-row { display:flex; align-items:center; gap:10px; padding:11px 14px; background:var(--raised); border:1px solid var(--border); border-radius:var(--r-md); cursor:pointer; transition:border-color .15s, background .15s; }
        .ep-row:hover, .ep-row.sel { border-color:var(--lava); background:var(--lava-faint); }
        .ep-method { font-family:var(--m); font-size:10px; color:var(--green); background:rgba(52,211,153,0.1); padding:2px 7px; border-radius:4px; flex-shrink:0; }
        .ep-path { font-family:var(--m); font-size:12px; color:var(--text); flex:1; }
        .ep-desc { font-size:11px; color:var(--text-3); }
        .pg-output { margin-top:4px; background:#040810; border:1px solid var(--border); border-radius:var(--r-md); padding:16px; min-height:90px; font-family:var(--m); font-size:12px; color:var(--text-2); line-height:1.7; white-space:pre-wrap; word-break:break-all; }
        .stats-bar { border-top:1px solid var(--border); border-bottom:1px solid var(--border); background:var(--surface); }
        .stats-inner { max-width:1280px; margin:0 auto; padding:0 48px; display:flex; }
        .stat-item { flex:1; padding:28px 40px; display:flex; flex-direction:column; gap:4px; border-right:1px solid var(--border); }
        .stat-item:first-child { padding-left:0; }
        .stat-item:last-child { border-right:none; }
        .stat-value { font-size:28px; font-weight:700; color:var(--text); letter-spacing:-1px; }
        .stat-label { font-size:13px; color:var(--text-2); }
        .section { max-width:1280px; margin:0 auto; padding:80px 48px; }
        .section-eyebrow { font-family:var(--m); font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--lava); margin-bottom:16px; }
        .section-h2 { font-size:36px; font-weight:700; letter-spacing:-1px; margin-bottom:16px; }
        .section-sub { font-size:16px; color:var(--text-2); line-height:1.75; max-width:520px; margin-bottom:56px; }
        .how-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--border); border:1px solid var(--border); border-radius:var(--r-lg); overflow:hidden; }
        .how-cell { background:var(--surface); padding:32px 28px; display:flex; flex-direction:column; gap:14px; transition:background .2s; }
        .how-cell:hover { background:var(--raised); }
        .how-icon { width:40px; height:40px; border-radius:var(--r-sm); background:var(--lava-glow); border:1px solid rgba(255,140,66,0.2); display:flex; align-items:center; justify-content:center; font-size:18px; }
        .how-title { font-size:15px; font-weight:600; color:var(--text); }
        .how-body { font-size:14px; color:var(--text-2); line-height:1.7; }
        .how-tag { font-family:var(--m); font-size:10px; color:var(--lava); letter-spacing:1px; text-transform:uppercase; margin-top:auto; }
        .cta-section { max-width:1280px; margin:0 auto; padding:80px 48px; display:flex; align-items:center; justify-content:space-between; gap:48px; }
        .cta-section h2 { font-size:34px; font-weight:700; letter-spacing:-1px; margin-bottom:12px; }
        .cta-section p { font-size:16px; color:var(--text-2); line-height:1.7; max-width:460px; }
        .cta-right { display:flex; flex-direction:column; gap:10px; flex-shrink:0; }
        footer { border-top:1px solid var(--border); padding:24px 48px; display:flex; align-items:center; justify-content:space-between; }
        @media (max-width: 900px) {
          .hero { grid-template-columns:1fr; }
          .how-grid { grid-template-columns:1fr; }
          .stats-inner { flex-wrap:wrap; }
        }
      `}</style>

      <div className="hero">
        <div>
          <p className="hero-eyebrow">Physical Entropy API</p>
          <h1 className="hero-h1">
            Randomness from<br/>
            <span style={{ color: 'var(--lava)' }}>physics,</span> not math.
          </h1>
          <p className="hero-sub">
            LavaRand captures live footage of a lava lamp and converts its
            unpredictable motion into cryptographically secure random values.
            One API call. True entropy.
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/docs" className="btn-primary">Start building free</Link>
            <Link to="/playground" className="btn-ghost">Try the API live →</Link>
          </div>
        </div>

        <div className="pg-card">
          <div className="pg-bar">
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840', display: 'inline-block' }} />
            </div>
            <span style={{ fontFamily: 'var(--m)', fontSize: 11, color: 'var(--text-3)' }}>localhost:8000</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--m)', fontSize: 11, color: 'var(--green)' }}>
              ● entropy live
            </span>
          </div>
          <div className="pg-body">
            {endpoints.map((ep, i) => (
              <div key={i} className={`ep-row ${selected === i ? 'sel' : ''}`} onClick={() => run(i)}>
                <span className="ep-method">GET</span>
                <span className="ep-path">{ep.display}</span>
                <span className="ep-desc">{ep.label}</span>
              </div>
            ))}
            <div className="pg-output">
  {loading
    ? <span style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>
        fetching from lava lamp...
      </span>
    : output?.error
      ? <span style={{ color: 'var(--red)' }}>
          ⚠ Backend offline — start your FastAPI server on port 8000
        </span>
      : output
        ? JSON.stringify(output, null, 2)
        : <span style={{ color: 'var(--text-3)' }}>
            ← click an endpoint to see live output
          </span>
  }
</div>
          </div>
        </div>
      </div>

      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item">
          <div className="stats-bar">
  <div className="stats-inner">
    <div className="stat-item">
      <span className="stat-value" style={{ color: output?.entropy_score ? 'var(--green)' : 'var(--text)' }}>
        {output?.entropy_score ? `${output.entropy_score}%` : '—'}
      </span>
      <span className="stat-label">Current entropy quality</span>
    </div>
    <div className="stat-item">
      <span className="stat-value">{output?.pool_level ?? '—'}</span>
      <span className="stat-label">Pool level</span>
    </div>
    <div className="stat-item">
      <span className="stat-value">7</span>
      <span className="stat-label">API endpoints</span>
    </div>
    <div className="stat-item">
      <span className="stat-value">&lt;30ms</span>
      <span className="stat-label">Average response time</span>
    </div>
  </div>
</div>
            <span className="stat-label">Current entropy quality</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">24fps</span>
            <span className="stat-label">Lava lamp capture rate</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">7</span>
            <span className="stat-label">API endpoints</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">&lt;30ms</span>
            <span className="stat-label">Average response time</span>
          </div>
        </div>
      </div>

      <div className="section">
        <p className="section-eyebrow">Under the hood</p>
        <h2 className="section-h2">Physics → bytes → your app</h2>
        <p className="section-sub">No seed. No algorithm. Just the chaotic, unpredictable movement of wax in oil — hashed and ready to use.</p>

        <div className="how-grid">
          <div className="how-cell">
            <div className="how-icon">🌋</div>
            <div className="how-title">Lava lamp capture</div>
            <div className="how-body">A webcam films a lava lamp 24/7. The wax blobs move in ways that are physically impossible to predict — that's the entropy source.</div>
            <div className="how-tag">Entropy source</div>
          </div>
          <div className="how-cell">
            <div className="how-icon">⚡</div>
            <div className="how-title">Pixel analysis</div>
            <div className="how-body">Each frame's pixel values are extracted and run through Shannon entropy analysis. Low-quality frames are rejected automatically.</div>
            <div className="how-tag">SHA-256 + PBKDF2</div>
          </div>
          <div className="how-cell">
            <div className="how-icon">🔐</div>
            <div className="how-title">Your random value</div>
            <div className="how-body">The entropy pool is drawn from on each API call. You get a UUID, OTP, AES key, or token backed by real physical randomness.</div>
            <div className="how-tag">AES-256-GCM ready</div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div>
          <h2>Start with a free API key.</h2>
          <p>No credit card. 10,000 requests/month on the free tier.</p>
        </div>
        <div className="cta-right">
          <Link to="/docs" className="btn-primary">Get your API key</Link>
          <Link to="/playground" className="btn-ghost">Try without signing up</Link>
        </div>
      </div>

      <footer>
        <span style={{ fontFamily: 'var(--m)', fontSize: 12, color: 'var(--text-3)' }}>LavaRand v1.0 — Physical Entropy API</span>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Built by J · SLIIT Cybersecurity</span>
      </footer>
    </>
  );
}