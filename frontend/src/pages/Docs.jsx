import React, { useEffect, useRef } from 'react';

const endpoints = [
  { method: 'GET', path: '/random/uuid',                  desc: 'Returns a UUID v4 seeded from lava lamp entropy. Use for order IDs, user IDs, or any unique identifier.', example: '→ "f47ac10b-58cc-4372-a567-0e02b2c3d479"' },
  { method: 'GET', path: '/random/otp?digits=6',           desc: 'Returns a numeric OTP. Default 6 digits. Accepts digits param (4–12). Use for 2FA, checkout verification.', example: '→ "847291"' },
  { method: 'GET', path: '/random/token',                  desc: 'Returns a 32-byte hex token. Ideal for session IDs, password reset links, and API tokens.', example: '→ "a3f8c2d9e1b4f7..."' },
  { method: 'GET', path: '/random/aes-key?bits=256',       desc: 'Returns an AES key as base64. Accepts bits param: 128, 192, or 256. Ready to use with any AES cipher.', example: '→ "Kx9mP2+vR8nQwL..."' },
  { method: 'GET', path: '/random/bytes?length=32',        desc: 'Returns N raw random bytes as base64. Use as entropy seed for your own cryptographic operations.', example: '→ "dGhpcyBpcyBhIHRlc3Q..."' },
  { method: 'GET', path: '/random/integer?min=1&max=100',  desc: 'Returns a random integer within the given range. For provably fair draws, games, and random selection.', example: '→ 73' },
  { method: 'GET', path: '/entropy/status',                desc: 'Returns the current pool level, entropy score, camera fps, and engine health.', example: '→ { "pool_level": "87%", ... }' },
];

export default function Docs() {
  // Refs for each section
  const refs = {
    introduction:   useRef(null),
    authentication: useRef(null),
    ratelimits:     useRef(null),
    endpoints:      useRef(null),
    response:       useRef(null),
  };

  // Endpoint card refs (one per endpoint)
  const epRefs = useRef({});

  const scrollTo = (key) => {
    if (refs[key]?.current) {
      refs[key].current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToEndpoint = (path) => {
    const key = path.split('?')[0];
    if (epRefs.current[key]) {
      epRefs.current[key].scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Flash highlight
      epRefs.current[key].style.borderColor = 'var(--lava)';
      epRefs.current[key].style.background  = 'var(--lava-faint)';
      setTimeout(() => {
        if (epRefs.current[key]) {
          epRefs.current[key].style.borderColor = '';
          epRefs.current[key].style.background  = '';
        }
      }, 1500);
    }
  };

  // Track which section is in view for sidebar highlight
  const [activeSection, setActiveSection] = React.useState('introduction');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.dataset.section);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    Object.entries(refs).forEach(([key, ref]) => {
      if (ref.current) {
        ref.current.dataset.section = key;
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  const sidebarSections = [
    {
      label: 'Getting started',
      items: [
        { label: 'Introduction',    onClick: () => scrollTo('introduction'),   key: 'introduction' },
        { label: 'Authentication',  onClick: () => scrollTo('authentication'), key: 'authentication' },
        { label: 'Rate limits',     onClick: () => scrollTo('ratelimits'),     key: 'ratelimits' },
      ]
    },
    {
      label: 'Endpoints',
      items: endpoints.map(ep => ({
        label:   ep.path.split('?')[0],
        onClick: () => scrollToEndpoint(ep.path),
        key:     ep.path.split('?')[0],
      }))
    },
  ];

  return (
    <>
      <style>{`
        .docs-layout { display:flex; flex:1; max-width:1280px; margin:0 auto; width:100%; padding:40px 48px; gap:48px; }
        .docs-sidebar { width:210px; flex-shrink:0; display:flex; flex-direction:column; gap:2px; position:sticky; top:70px; height:fit-content; }
        .sidebar-label { font-family:var(--m); font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:var(--text-3); padding:14px 8px 6px; }
        .sidebar-item { padding:7px 10px; border-radius:var(--r-sm); font-size:13px; color:var(--text-2); cursor:pointer; transition:all .15s; border-left:2px solid transparent; }
        .sidebar-item:hover { color:var(--text); background:var(--raised); }
        .sidebar-item.active { color:var(--lava); background:var(--lava-faint); border-left-color:var(--lava); }
        .docs-content { flex:1; display:flex; flex-direction:column; gap:56px; min-width:0; padding-bottom:120px; }
        .docs-block { scroll-margin-top:80px; }
        .docs-section-title { font-size:22px; font-weight:700; letter-spacing:-0.5px; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid var(--border); }
        .docs-text { font-size:14px; color:var(--text-2); line-height:1.8; margin-bottom:16px; }
        .code-block { background:#040810; border:1px solid var(--border); border-radius:var(--r-md); padding:20px; font-family:var(--m); font-size:13px; line-height:1.7; color:var(--text-2); overflow-x:auto; margin-bottom:16px; white-space:pre; }
        .docs-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:8px; }
        .doc-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r-md); padding:20px 22px; display:flex; flex-direction:column; gap:8px; transition:border-color .3s, background .3s; scroll-margin-top:90px; }
        .doc-card:hover { border-color:var(--border-hi); }
        .doc-method-row { display:flex; align-items:center; gap:8px; }
        .doc-method { font-family:var(--m); font-size:10px; color:var(--green); background:rgba(52,211,153,0.08); border:1px solid rgba(52,211,153,0.2); padding:2px 8px; border-radius:4px; flex-shrink:0; }
        .doc-path { font-family:var(--m); font-size:13px; color:var(--text); word-break:break-all; }
        .doc-desc { font-size:13px; color:var(--text-2); line-height:1.6; }
        .doc-example { font-family:var(--m); font-size:11px; color:var(--text-3); background:var(--raised); padding:8px 10px; border-radius:var(--r-sm); margin-top:4px; }
        @media (max-width:900px) { .docs-layout { flex-direction:column; } .docs-sidebar { width:100%; position:static; } .docs-grid { grid-template-columns:1fr; } }
      `}</style>

      <div className="docs-layout">

        {/* Sidebar */}
        <div className="docs-sidebar">
          {sidebarSections.map(section => (
            <React.Fragment key={section.label}>
              <span className="sidebar-label">{section.label}</span>
              {section.items.map(item => (
                <div
                  key={item.key}
                  className={`sidebar-item ${activeSection === item.key ? 'active' : ''}`}
                  onClick={item.onClick}
                >
                  {item.label}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="docs-content">

          {/* Introduction */}
          <div className="docs-block" ref={refs.introduction}>
            <div className="docs-section-title">Introduction</div>
            <p className="docs-text">LavaRand is a REST API that generates cryptographically secure random values using physical entropy extracted from a live lava lamp feed. Every value returned is seeded from real-world chaos — not a mathematical algorithm.</p>
            <p className="docs-text">Base URL for all requests:</p>
            <div className="code-block">http://localhost:8000/api/v1</div>
          </div>

          {/* Authentication */}
          <div className="docs-block" ref={refs.authentication}>
            <div className="docs-section-title">Authentication</div>
            <p className="docs-text">During local development, no API key is required. In production, pass your key in the request header:</p>
            <div className="code-block">{`# curl
curl http://localhost:8000/api/v1/random/uuid \\
  -H "X-API-Key: lr_your_key_here"`}</div>
            <div className="code-block">{`// JavaScript
const res = await fetch('http://localhost:8000/api/v1/random/uuid', {
  headers: { 'X-API-Key': 'lr_your_key_here' }
});
const { value } = await res.json();`}</div>
            <div className="code-block">{`# Python
import requests
res = requests.get(
    'http://localhost:8000/api/v1/random/uuid',
    headers={'X-API-Key': 'lr_your_key_here'}
)
print(res.json()['value'])`}</div>
          </div>

          {/* Rate limits */}
          <div className="docs-block" ref={refs.ratelimits}>
            <div className="docs-section-title">Rate limits</div>
            <p className="docs-text">Free tier: 10,000 requests per month. Rate limits are applied per API key. If you exceed the limit, the API returns a 429 status code.</p>
            <div className="code-block">{`{
  "error": "Rate limit exceeded",
  "limit": 10000,
  "reset_at": "2026-07-01T00:00:00Z"
}`}</div>
          </div>

          {/* Endpoints */}
          <div className="docs-block" ref={refs.endpoints}>
            <div className="docs-section-title">Endpoints</div>
            <div className="docs-grid">
              {endpoints.map(ep => {
                const key = ep.path.split('?')[0];
                return (
                  <div
                    key={ep.path}
                    className="doc-card"
                    ref={el => epRefs.current[key] = el}
                  >
                    <div className="doc-method-row">
                      <span className="doc-method">{ep.method}</span>
                      <span className="doc-path">{ep.path}</span>
                    </div>
                    <p className="doc-desc">{ep.desc}</p>
                    <div className="doc-example">{ep.example}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Response format */}
          <div className="docs-block" ref={refs.response}>
            <div className="docs-section-title">Response format</div>
            <p className="docs-text">Every endpoint returns the same base structure:</p>
            <div className="code-block">{`{
  "value":           "...",
  "entropy_source":  "lava_lamp",
  "entropy_score":   94.2,
  "generated_at":    "2026-07-02T09:00:00Z",
  "algorithm":       "SHA-256 + PBKDF2",
  "pool_level":      "87%"
}`}</div>
          </div>

        </div>
      </div>
    </>
  );
}