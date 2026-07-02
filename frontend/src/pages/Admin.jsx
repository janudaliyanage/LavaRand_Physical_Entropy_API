import React, { useState, useEffect, useCallback } from 'react';
import { getStatus } from '../services/api';

export default function Admin() {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [chartVals, setChartVals] = useState(Array.from({ length: 30 }, () => 0));
  const [error, setError] = useState(false);

  const poll = useCallback(async () => {
    try {
      const res = await getStatus();
      setStatus(res.data);
      setError(false);
      setChartVals(v => [...v.slice(1), res.data.entropy_score ?? 0]);
  
      // Also fetch real request logs
      const logsRes = await import('../services/api').then(m =>
        m.default.get('/admin/logs?limit=8')
      );
      setHistory(logsRes.data.logs ?? []);
    } catch (e) {
      setError(true);
    }
  }, []);

  useEffect(() => {
    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [poll]);

  const avg = chartVals.length ? (chartVals.reduce((a, b) => a + b, 0) / chartVals.length).toFixed(1) : 0;
  const min = chartVals.length ? Math.min(...chartVals).toFixed(1) : 0;
  const max = chartVals.length ? Math.max(...chartVals).toFixed(1) : 0;

  return (
    <>
      <style>{`
        .admin-page { flex:1; max-width:1400px; margin:0 auto; width:100%; padding:32px 48px 60px; display:flex; flex-direction:column; gap:24px; }
        .admin-header { display:flex; align-items:center; justify-content:space-between; }
        .admin-header h1 { font-size:22px; font-weight:700; letter-spacing:-0.5px; }
        .admin-badge { display:flex; align-items:center; gap:6px; font-family:var(--m); font-size:11px; padding:5px 12px; border-radius:20px; }
        .admin-kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
        .kpi-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r-md); padding:18px 20px; display:flex; flex-direction:column; gap:6px; }
        .kpi-label { font-size:11px; color:var(--text-3); text-transform:uppercase; letter-spacing:.8px; font-family:var(--m); }
        .kpi-value { font-size:24px; font-weight:700; letter-spacing:-0.8px; color:var(--text); }
        .kpi-sub { font-size:11px; color:var(--text-3); }
        .admin-main { display:grid; grid-template-columns:1.2fr .8fr; gap:16px; }
        .admin-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r-lg); overflow:hidden; }
        .admin-card-header { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid var(--border); background:var(--raised); }
        .admin-card-title { font-size:12px; font-weight:600; color:var(--text-2); text-transform:uppercase; letter-spacing:1px; font-family:var(--m); }
        .admin-card-body { padding:20px; }
        .entropy-chart { display:flex; align-items:flex-end; gap:3px; height:80px; }
        .entropy-bar-item { flex:1; background:var(--lava); border-radius:2px 2px 0 0; min-width:4px; transition:height .5s ease; }
        .entropy-stats-row { display:flex; gap:24px; margin-top:16px; }
        .e-stat-val { font-size:18px; font-weight:700; letter-spacing:-0.5px; }
        .e-stat-label { font-size:11px; color:var(--text-3); }
        .pool-gauge-track { height:8px; background:var(--raised); border-radius:4px; overflow:hidden; }
        .pool-gauge-fill { height:100%; border-radius:4px; background:linear-gradient(90deg, var(--lava-dim), var(--lava)); transition:width 1s ease; }
        .log-table { width:100%; border-collapse:collapse; font-size:12px; }
        .log-table th { text-align:left; padding:8px 12px; background:var(--raised); color:var(--text-3); font-family:var(--m); font-size:10px; text-transform:uppercase; letter-spacing:.5px; border-bottom:1px solid var(--border); }
        .log-table td { padding:10px 12px; border-bottom:1px solid var(--border); color:var(--text-2); }
        .log-table tr:last-child td { border-bottom:none; }
        @media (max-width:900px) { .admin-kpis { grid-template-columns:1fr 1fr; } .admin-main { grid-template-columns:1fr; } }
      `}</style>

      <div className="admin-page">
        <div className="admin-header">
          <h1>System Dashboard</h1>
          <div className="admin-badge" style={{
            color: error ? 'var(--red)' : 'var(--lava)',
            background: error ? 'rgba(248,113,113,0.1)' : 'var(--lava-faint)',
            border: `1px solid ${error ? 'rgba(248,113,113,0.3)' : 'rgba(255,140,66,0.2)'}`,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: error ? 'var(--red)' : 'var(--green)', display: 'inline-block' }} />
            {error ? 'Backend unreachable' : 'Lava lamp online'}
          </div>
        </div>

        <div className="admin-kpis">
          <div className="kpi-card">
            <span className="kpi-label">Entropy Score</span>
            <span className="kpi-value" style={{ color: 'var(--green)' }}>{status?.entropy_score ?? '—'}%</span>
            <span className="kpi-sub">above 70% threshold</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Pool Level</span>
            <span className="kpi-value" style={{ color: 'var(--lava)' }}>{status?.pool_level ?? '—'}%</span>
            <span className="kpi-sub">refilling continuously</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Camera FPS</span>
            <span className="kpi-value" style={{ color: 'var(--green)' }}>{status?.camera_fps ?? '—'}</span>
            <span className="kpi-sub">{status?.camera_ready ? 'stable capture' : 'waiting...'}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Acceptance Rate</span>
            <span className="kpi-value">{status?.acceptance_rate ?? '—'}%</span>
            <span className="kpi-sub">{status?.frames_analyzed ?? 0} frames analyzed</span>
          </div>
        </div>

        <div className="admin-main">
          <div className="admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">Entropy Quality — live polling</span>
            </div>
            <div className="admin-card-body">
              <div className="entropy-chart">
                {chartVals.map((v, i) => (
                  <div key={i} className="entropy-bar-item" style={{ height: `${v}%`, opacity: 0.4 + v / 200 }} />
                ))}
              </div>
              <div className="entropy-stats-row">
                <div><span className="e-stat-val" style={{ color: 'var(--green)' }}>{avg}%</span><br/><span className="e-stat-label">30-poll avg</span></div>
                <div><span className="e-stat-val" style={{ color: 'var(--lava)' }}>{min}%</span><br/><span className="e-stat-label">minimum</span></div>
                <div><span className="e-stat-val" style={{ color: 'var(--green)' }}>{max}%</span><br/><span className="e-stat-label">peak</span></div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="admin-card">
              <div className="admin-card-header"><span className="admin-card-title">Entropy Pool</span></div>
              <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Available entropy</span>
                    <span style={{ fontFamily: 'var(--m)', fontSize: 12, color: 'var(--lava)' }}>{status?.pool_level ?? 0}%</span>
                  </div>
                  <div className="pool-gauge-track"><div className="pool-gauge-fill" style={{ width: `${status?.pool_level ?? 0}%` }} /></div>
                </div>
              </div>
            </div>

            <div className="admin-card" style={{ flex: 1 }}>
              <div className="admin-card-header">
                <span className="admin-card-title">Poll Log</span>
                <span style={{ fontFamily: 'var(--m)', fontSize: 10, color: 'var(--text-3)' }}>every 3s</span>
              </div>
              <div className="admin-card-body" style={{ padding: 0 }}>
              <table className="log-table">
            <thead>
    <tr>
      <th>Endpoint</th>
      <th>API Key</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {history.length === 0
      ? <tr><td colSpan={3} style={{ color: 'var(--text-3)' }}>No requests yet</td></tr>
      : history.map((h, i) => (
        <tr key={i}>
          <td>{h.endpoint}</td>
          <td style={{ color: 'var(--text-3)', fontSize: 10 }}>{h.api_key}</td>
          <td style={{ color: h.status === 200 ? 'var(--green)' : 'var(--red)' }}>
            {h.status}
          </td>
        </tr>
      ))
    }
  </tbody>
</table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}