import React, { useState } from 'react';
import { getUUID, getOTP, getToken, getAESKey, getBytes, getInteger, getStatus } from '../services/api';

const endpointList = [
  { id: 'uuid',   method: 'GET', path: '/random/uuid',                label: 'Unique ID',     fn: getUUID },
  { id: 'otp',    method: 'GET', path: '/random/otp?digits=6',         label: '6-digit OTP',   fn: () => getOTP(6) },
  { id: 'token',  method: 'GET', path: '/random/token',                label: 'Session token', fn: getToken },
  { id: 'aes',    method: 'GET', path: '/random/aes-key?bits=256',     label: 'AES-256 key',   fn: () => getAESKey(256) },
  { id: 'bytes',  method: 'GET', path: '/random/bytes?length=32',      label: 'Raw bytes',     fn: () => getBytes(32) },
  { id: 'int',    method: 'GET', path: '/random/integer?min=1&max=1000', label: 'Random integer', fn: () => getInteger(1, 1000) },
  { id: 'status', method: 'GET', path: '/entropy/status',              label: 'Pool status',   fn: getStatus },
];

export default function Playground() {
  const [selected, setSelected] = useState(endpointList[0]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const run = async () => {
    setLoading(true);
    try {
      const res = await selected.fn();
      setResult({ ok: true, data: res.data });
      setHistory(h => [{ path: selected.path, status: '200 OK', time: 'just now' }, ...h].slice(0, 6));
    } catch (e) {
      setResult({ ok: false, data: { error: 'Could not reach the API. Is your backend running on port 8000?' } });
      setHistory(h => [{ path: selected.path, status: 'ERROR', time: 'just now' }, ...h].slice(0, 6));
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        .pgp { flex:1; max-width:1280px; margin:0 auto; width:100%; padding:40px 48px; }
        .pgp-header { margin-bottom:32px; }
        .pgp-header h1 { font-size:28px; font-weight:700; letter-spacing:-0.5px; margin-bottom:8px; }
        .pgp-header p { font-size:14px; color:var(--text-2); }
        .full-pg { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        .full-pg-col { background:var(--surface); border:1px solid var(--border); border-radius:var(--r-lg); overflow:hidden; display:flex; flex-direction:column; }
        .pg-panel-header { padding:14px 20px; border-bottom:1px solid var(--border); background:var(--raised); font-size:12px; font-weight:600; color:var(--text-2); text-transform:uppercase; letter-spacing:1px; font-family:var(--m); }
        .pg-endpoints { padding:12px; display:flex; flex-direction:column; gap:4px; }
        .pg-ep-btn { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:var(--r-sm); background:transparent; border:1px solid transparent; color:var(--text-2); font-size:13px; text-align:left; transition:all .15s; width:100%; }
        .pg-ep-btn:hover { background:var(--raised); color:var(--text); border-color:var(--border); }
        .pg-ep-btn.active { background:var(--lava-faint); color:var(--lava); border-color:rgba(255,140,66,0.2); }
        .pg-ep-method { font-family:var(--m); font-size:9px; color:var(--green); background:rgba(52,211,153,0.1); padding:2px 6px; border-radius:3px; flex-shrink:0; }
        .pg-ep-path { font-family:var(--m); font-size:12px; }
        .pg-ep-label { font-size:11px; color:var(--text-3); margin-left:auto; }
        .pg-output-area { padding:20px; display:flex; flex-direction:column; gap:14px; flex:1; }
        .pg-endpoint-display { display:flex; align-items:center; gap:10px; background:var(--raised); border:1px solid var(--border); border-radius:var(--r-sm); padding:10px 14px; font-family:var(--m); font-size:12px; color:var(--text-2); }
        .pg-run-btn { padding:10px 24px; border-radius:var(--r-md); background:var(--lava); color:#fff; font-size:14px; font-weight:600; transition:filter .15s; width:100%; }
        .pg-run-btn:hover { filter:brightness(1.1); }
        .pg-run-btn:disabled { opacity:.5; cursor:default; }
        .pg-result { background:#040810; border:1px solid var(--border); border-radius:var(--r-md); padding:18px; font-family:var(--m); font-size:12px; line-height:1.8; color:var(--text-2); min-height:140px; white-space:pre-wrap; word-break:break-all; }
        .pg-history { border-top:1px solid var(--border); padding:14px 20px; }
        .pg-history-label { font-family:var(--m); font-size:10px; letter-spacing:1px; text-transform:uppercase; color:var(--text-3); margin-bottom:10px; }
        .pg-history-item { display:flex; align-items:center; justify-content:space-between; padding:7px 0; border-bottom:1px solid var(--border); font-family:var(--m); font-size:11px; }
        .pg-history-item:last-child { border-bottom:none; }
        @media (max-width:900px) { .full-pg { grid-template-columns:1fr; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="pgp">
        <div className="pgp-header">
          <h1>API Playground</h1>
          <p>Try every endpoint live, pulled straight from your running backend.</p>
        </div>

        <div className="full-pg">
          <div className="full-pg-col">
            <div className="pg-panel-header">Endpoints</div>
            <div className="pg-endpoints">
              {endpointList.map(ep => (
                <button
                  key={ep.id}
                  className={`pg-ep-btn ${selected.id === ep.id ? 'active' : ''}`}
                  onClick={() => { setSelected(ep); setResult(null); }}
                >
                  <span className="pg-ep-method">{ep.method}</span>
                  <span className="pg-ep-path">{ep.path.split('?')[0]}</span>
                  <span className="pg-ep-label">{ep.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="full-pg-col">
            <div className="pg-panel-header">Response</div>
            <div className="pg-output-area">
              <div className="pg-endpoint-display">
                <span className="pg-ep-method" style={{ fontSize: 11, padding: '3px 8px' }}>{selected.method}</span>
                {selected.path}
              </div>

              <button className="pg-run-btn" onClick={run} disabled={loading}>
  {loading
    ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
        Fetching entropy...
      </span>
    : 'Run request'
  }
</button>

              <div className="pg-result">
                {result
                  ? JSON.stringify(result.data, null, 2)
                  : <span style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>Hit "Run request" to see a live response.</span>
                }
              </div>
            </div>

            <div className="pg-history">
              <div className="pg-history-label">Recent calls</div>
              {history.length === 0
                ? <span style={{ color: 'var(--text-3)', fontSize: 11, fontFamily: 'var(--m)' }}>No calls yet</span>
                : history.map((h, i) => (
                  <div key={i} className="pg-history-item">
                    <span style={{ color: 'var(--lava)' }}>{h.path.split('?')[0]}</span>
                    <span style={{ color: 'var(--text-3)' }}>{h.time}</span>
                    <span style={{ color: h.status === '200 OK' ? 'var(--green)' : 'var(--red)' }}>{h.status}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}