import React from 'react';
import './styles/globals.css';
import { useAuth } from './hooks/useAuth.jsx';
import LoginModal from './components/LoginModal.jsx';
import WorkflowCanvas from './components/workflow/WorkflowCanvas.jsx';
import { useWorkflow } from './hooks/useWorkflow.jsx';


// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('atlas_tweaks') || 'null');
      return saved ? { ...defaults, ...saved } : defaults;
    } catch { return defaults; }
  });
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => {
      const next = { ...prev, ...edits };
      try { localStorage.setItem('atlas_tweaks', JSON.stringify(next)); } catch {}
      return next;
    });
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
    window.dispatchEvent(new CustomEvent('tweakchange', { detail: edits }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({ title = 'Tweaks', noDeckControls = false, children }) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  // Auto-inject a rail toggle when a <deck-stage> is on the page. The
  // toggle drives the deck's per-viewer _railVisible via window message;
  // state is mirrored from the same localStorage key the deck reads so
  // the control reflects reality across reloads. The mechanism is the
  // message — authors who want custom placement can post it directly
  // and pass noDeckControls to suppress this one.
  const hasDeckStage = React.useMemo(
    () => typeof document !== 'undefined' && !!document.querySelector('deck-stage'),
    [],
  );
  // deck-stage enables its rail in connectedCallback, but this panel can
  // mount before that element has upgraded. The initial read catches the
  // common case; the listener covers mounting first. (Older deck-stage.js
  // copies still wait for the host's __omelette_rail_enabled postMessage —
  // same listener handles those.)
  const [railEnabled, setRailEnabled] = React.useState(
    () => hasDeckStage && !!document.querySelector('deck-stage')?._railEnabled,
  );
  React.useEffect(() => {
    if (!hasDeckStage || railEnabled) return undefined;
    const onMsg = (e) => {
      if (e.data && e.data.type === '__omelette_rail_enabled') setRailEnabled(true);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [hasDeckStage, railEnabled]);
  const [railVisible, setRailVisible] = React.useState(() => {
    try { return localStorage.getItem('deck-stage.railVisible') !== '0'; } catch (e) { return true; }
  });
  const toggleRail = (on) => {
    setRailVisible(on);
    window.postMessage({ type: '__deck_rail_visible', on }, '*');
  };
  const offsetRef = React.useRef({ x: 16, y: 16 });
  const PAD = 16;

  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth, h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y)),
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);

  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);

  React.useEffect(() => {
    const onMsg = (e) => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);
      else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  };

  const onDragStart = (e) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy),
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  if (!open) return null;
  return (
    <>
      <style>{__TWEAKS_STYLE}</style>
      <div ref={dragRef} className="twk-panel" data-noncommentable=""
           style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}>
        <div className="twk-hd" onMouseDown={onDragStart}>
          <b>{title}</b>
          <button className="twk-x" aria-label="Close tweaks"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={dismiss}>✕</button>
        </div>
        <div className="twk-body">
          {children}
          {hasDeckStage && railEnabled && !noDeckControls && (
            <TweakSection label="Deck">
              <TweakToggle label="Thumbnail rail" value={railVisible} onChange={toggleRail} />
            </TweakSection>
          )}
        </div>
      </div>
    </>
  );
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({ label, children }) {
  return (
    <>
      <div className="twk-sect">{label}</div>
      {children}
    </>
  );
}

function TweakRow({ label, value, children, inline = false }) {
  return (
    <div className={inline ? 'twk-row twk-row-h' : 'twk-row'}>
      <div className="twk-lbl">
        <span>{label}</span>
        {value != null && <span className="twk-val">{value}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({ label, value, min = 0, max = 100, step = 1, unit = '', onChange }) {
  return (
    <TweakRow label={label} value={`${value}${unit}`}>
      <input type="range" className="twk-slider" min={min} max={max} step={step}
             value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </TweakRow>
  );
}

function TweakToggle({ label, value, onChange }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl"><span>{label}</span></div>
      <button type="button" className="twk-toggle" data-on={value ? '1' : '0'}
              role="switch" aria-checked={!!value}
              onClick={() => onChange(!value)}><i /></button>
    </div>
  );
}

function TweakRadio({ label, value, options, onChange }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = (o) => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({ 2: 16, 3: 10 }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = (s) => {
      const m = options.find((o) => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return <TweakSelect label={label} value={value} options={options}
                        onChange={(s) => onChange(resolve(s))} />;
  }
  const opts = options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
  const idx = Math.max(0, opts.findIndex((o) => o.value === value));
  const n = opts.length;

  const segAt = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor(((clientX - r.left - 2) / inner) * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };

  const onPointerDown = (e) => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = (ev) => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <TweakRow label={label}>
      <div ref={trackRef} role="radiogroup" onPointerDown={onPointerDown}
           className={dragging ? 'twk-seg dragging' : 'twk-seg'}>
        <div className="twk-seg-thumb"
             style={{ left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
                      width: `calc((100% - 4px) / ${n})` }} />
        {opts.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value}>
            {o.label}
          </button>
        ))}
      </div>
    </TweakRow>
  );
}

function TweakSelect({ label, value, options, onChange }) {
  return (
    <TweakRow label={label}>
      <select className="twk-field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const v = typeof o === 'object' ? o.value : o;
          const l = typeof o === 'object' ? o.label : o;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </TweakRow>
  );
}

function TweakText({ label, value, placeholder, onChange }) {
  return (
    <TweakRow label={label}>
      <input className="twk-field" type="text" value={value} placeholder={placeholder}
             onChange={(e) => onChange(e.target.value)} />
    </TweakRow>
  );
}

function TweakNumber({ label, value, min, max, step = 1, unit = '', onChange }) {
  const clamp = (n) => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({ x: 0, val: 0 });
  const onScrubStart = (e) => {
    e.preventDefault();
    startRef.current = { x: e.clientX, val: value };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = (ev) => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <div className="twk-num">
      <span className="twk-num-lbl" onPointerDown={onScrubStart}>{label}</span>
      <input type="number" value={value} min={min} max={max} step={step}
             onChange={(e) => onChange(clamp(Number(e.target.value)))} />
      {unit && <span className="twk-num-unit">{unit}</span>}
    </div>
  );
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}

const __TwkCheck = ({ light }) => (
  <svg viewBox="0 0 14 14" aria-hidden="true">
    <path d="M3 7.2 5.8 10 11 4.2" fill="none" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          stroke={light ? 'rgba(0,0,0,.78)' : '#fff'} />
  </svg>
);

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({ label, value, options, onChange }) {
  if (!options || !options.length) {
    return (
      <div className="twk-row twk-row-h">
        <div className="twk-lbl"><span>{label}</span></div>
        <input type="color" className="twk-swatch" value={value}
               onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = (o) => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return (
    <TweakRow label={label}>
      <div className="twk-chips" role="radiogroup">
        {options.map((o, i) => {
          const colors = Array.isArray(o) ? o : [o];
          const [hero, ...rest] = colors;
          const sup = rest.slice(0, 4);
          const on = key(o) === cur;
          return (
            <button key={i} type="button" className="twk-chip" role="radio"
                    aria-checked={on} data-on={on ? '1' : '0'}
                    aria-label={colors.join(', ')} title={colors.join(' · ')}
                    style={{ background: hero }}
                    onClick={() => onChange(o)}>
              {sup.length > 0 && (
                <span>
                  {sup.map((c, j) => <i key={j} style={{ background: c }} />)}
                </span>
              )}
              {on && <__TwkCheck light={__twkIsLight(hero)} />}
            </button>
          );
        })}
      </div>
    </TweakRow>
  );
}

function TweakButton({ label, onClick, secondary = false }) {
  return (
    <button type="button" className={secondary ? 'twk-btn secondary' : 'twk-btn'}
            onClick={onClick}>{label}</button>
  );
}

Object.assign(window, {
  useTweaks, TweaksPanel, TweakSection, TweakRow,
  TweakSlider, TweakToggle, TweakRadio, TweakSelect,
  TweakText, TweakNumber, TweakColor, TweakButton,
});
// Essay direction — shared base. Tokens, top nav, footer, primitives.

// Tokens vary by tweak (theme + accent). Returns a consistent palette.
function essayTokens({ theme = 'cream', accent = 'red' }) {
  const accents = {
    red:          { hex: '#e5251d', soft: '#fde4e2', name: 'SIGNAL RED' },
    amber:        { hex: '#c2540a', soft: '#fbe7d2', name: 'CINNABAR' },
    forest:       { hex: '#1f6f44', soft: '#daece1', name: 'EDITORIAL SAGE' },
    cobalt:       { hex: '#1d4ed8', soft: '#dee5fb', name: 'PRESS BLUE' },
    rose:         { hex: '#e11d48', soft: '#ffe1eb', name: 'ROSE BLUSH' },
    violet:       { hex: '#7c3aed', soft: '#ede9fe', name: 'VIOLET MIST' },
    teal:         { hex: '#0d9488', soft: '#d1faf5', name: 'ATLAS TEAL' },
    gold:         { hex: '#b45309', soft: '#fef3c7', name: 'ATLAS GOLD' },
    grad_sunset:  { hex: '#dc4e0c', soft: '#fbe7d2', gradient: 'linear-gradient(135deg, #f97316 0%, #e11d48 100%)', name: 'SUNSET' },
    grad_aurora:  { hex: '#0f7855', soft: '#daece1', gradient: 'linear-gradient(135deg, #0d9488 0%, #7c3aed 100%)', name: 'AURORA' },
    grad_ocean:   { hex: '#1a55c0', soft: '#dee5fb', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #4338ca 100%)', name: 'OCEAN DEEP' },
  };
  const a = accents[accent] || accents.red;

  const themes = {
    cream: {
      paper:    '#fbf9f4',
      paperAlt: '#f5f1e8',
      ink:      '#0f0f0f',
      inkSoft:  '#1f1d1a',
      mute:     '#767368',
      muteSoft: '#a8a395',
      rule:     '#d8d4ca',
      faint:    '#efebe1',
      cardOn:   '#ffffff',
    },
    slate: {
      paper:    '#15140f',
      paperAlt: '#1d1c17',
      ink:      '#f4f1e8',
      inkSoft:  '#e2dfd5',
      mute:     '#8c8778',
      muteSoft: '#5d5a4f',
      rule:     '#2a2823',
      faint:    '#1a1914',
      cardOn:   '#1d1c17',
    },
  };
  const palette = themes[theme] || themes.cream;

  return {
    ...palette,
    accent: a.hex,
    accentGradient: a.gradient || a.hex,
    accentSoft: a.soft,
    accentName: a.name,
    theme,
    fontDisplay: "'Archivo', 'Noto Sans SC', system-ui, sans-serif",
    fontBody:    "'Hanken Grotesk', 'Noto Sans SC', system-ui, sans-serif",
    fontSerif:   "'Newsreader', 'Noto Serif SC', Georgia, serif",
    fontMono:    "'JetBrains Mono', ui-monospace, monospace",
    fontCN:      "'Noto Sans SC', system-ui, sans-serif",
  };
}

// ── Top nav: wordmark + section nav + meta -------------------------------
const NAV_ITEMS = [
  { k: 'home',      en: 'NEW',      cn: '新建' },
  { k: 'library',   en: 'LIBRARY',  cn: '报告库' },
  { k: 'workflow',  en: 'FLOW',     cn: '工作流' },
  { k: 'benchmark', en: 'BENCH',    cn: '评测' },
  { k: 'sources',   en: 'SOURCES',  cn: '数据源' },
];

function TopBar({ route, setRoute, t, runState = 'idle', issueNum = 241, tweaks, setTweak, modelStore, toolbarStore, outlineMode, setOutlineMode, researchMode, setResearchMode, onNavClick }) {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = n => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}·${pad(now.getMonth()+1)}·${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  return (
    <div style={{
      borderBottom: `1px solid ${t.ink}`, background: t.paper, flexShrink: 0,
      padding: '0 36px', height: 60,
      display: 'flex', alignItems: 'center', gap: 24,
    }}>
      <div onClick={() => setRoute('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: 10, whiteSpace: 'nowrap', flexShrink: 0 }}>
        <span style={{
          fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 18,
          letterSpacing: 2.6, textTransform: 'uppercase', color: t.ink,
        }}>Atlas</span>
        <span style={{
          fontFamily: t.fontDisplay, fontWeight: 500, fontSize: 11,
          letterSpacing: 1.4, color: t.mute, textTransform: 'uppercase',
        }}>⎯ Essays</span>
      </div>

      <span style={{ flex: 1, height: 1, background: t.ink, opacity: 0.55, margin: '0 8px' }}/>

      <nav style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'stretch' }}>
        {NAV_ITEMS.map(n => (
          <span key={n.k}
            onClick={() => onNavClick ? onNavClick(n.k) : setRoute(n.k)}
            style={{
              cursor: 'pointer',
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '0 14px', height: 60,
              borderBottom: route === n.k ? `2px solid ${t.accent}` : '2px solid transparent',
              borderTop: '2px solid transparent',
              color: route === n.k ? t.ink : t.mute,
              userSelect: 'none',
            }}>
            <span style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', lineHeight: 1.2 }}>{n.en}</span>
            <span style={{ fontFamily: t.fontCN, fontSize: 10, letterSpacing: 0.3, marginTop: 1, lineHeight: 1.2, color: route === n.k ? t.ink : t.mute }}>{n.cn}</span>
          </span>
        ))}
      </nav>

      <span style={{ flex: 1, height: 1, background: t.ink, opacity: 0.55, margin: '0 8px' }}/>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, whiteSpace: 'nowrap' }}>
        {runState === 'running' && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <LiveDot color={t.accent}/>
            <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.accent, letterSpacing: 1.2 }}>LIVE</span>
          </span>
        )}
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 1 }}>
          VOL.04 · № {issueNum}
        </span>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 1 }}>{dateStr} · {timeStr}</span>
        <UserMenu t={t} tweaks={tweaks} setTweak={setTweak} modelStore={modelStore} toolbarStore={toolbarStore} outlineMode={outlineMode} setOutlineMode={setOutlineMode} researchMode={researchMode} setResearchMode={setResearchMode} setRoute={setRoute}/>
      </div>
    </div>
  );
}

function UMenuSliderRow({ label, value, min, max, step, onChange, formatVal, hints, t }) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <div style={{ fontFamily:t.fontMono, fontSize:9, color:t.mute, letterSpacing:1.1 }}>{label}</div>
        <div style={{ fontFamily:t.fontMono, fontSize:10, color:t.accent, fontWeight:700 }}>{formatVal ? formatVal(value) : value}</div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width:'100%', cursor:'pointer' }}/>
      {hints && (
        <div style={{ display:'flex', justifyContent:'space-between', fontFamily:t.fontMono, fontSize:8, color:t.mute, marginTop:2 }}>
          {hints.map((h, i) => <span key={i}>{h}</span>)}
        </div>
      )}
    </div>
  );
}

function UMenuReportModal({ visible, title, reports, selected, setSelected, onConfirm, onClose, confirmLabel, confirmDanger, t }) {
  if (!visible) return null;
  const allSel = reports.length > 0 && selected.size === reports.length;
  const toggleAll = (e) => setSelected(e.target.checked ? new Set(reports.map(r => r.id)) : new Set());
  const toggleOne = (id, checked) => setSelected(prev => { const n = new Set(prev); checked ? n.add(id) : n.delete(id); return n; });
  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.45)', zIndex:99999, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:t.paper, border:`1.5px solid ${t.ink}`, width:420, maxHeight:'72vh', display:'flex', flexDirection:'column', boxShadow:`4px 4px 0 rgba(0,0,0,0.15)` }}>
        <div style={{ padding:'11px 16px', borderBottom:`1px solid ${t.rule}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <span style={{ fontFamily:t.fontDisplay, fontWeight:800, fontSize:13, color:t.ink }}>{title}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:t.fontMono, fontSize:16, color:t.mute, lineHeight:1, padding:'0 2px' }}>×</button>
        </div>
        <div style={{ padding:'7px 16px 6px', borderBottom:`1px solid ${t.rule}`, flexShrink:0 }}>
          <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none' }}>
            <input type="checkbox" checked={allSel} onChange={toggleAll} style={{ cursor:'pointer', width:14, height:14 }}/>
            <span style={{ fontFamily:t.fontMono, fontSize:9, color:t.mute, letterSpacing:0.8 }}>全选（共 {reports.length} 份报告）</span>
          </label>
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {reports.length === 0
            ? <div style={{ padding:'28px 16px', fontFamily:'Noto Sans SC', fontSize:13, color:t.mute, textAlign:'center' }}>报告库为空</div>
            : reports.map(r => (
              <label key={r.id} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'8px 16px', cursor:'pointer', borderBottom:`1px solid ${t.rule}`, userSelect:'none' }}>
                <input type="checkbox" checked={selected.has(r.id)} onChange={e => toggleOne(r.id, e.target.checked)} style={{ marginTop:2, cursor:'pointer', flexShrink:0, width:14, height:14 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:'Noto Sans SC', fontSize:12, fontWeight:600, color:t.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.title || r.prompt?.slice(0,44) || '无标题'}</div>
                  <div style={{ fontFamily:t.fontMono, fontSize:9, color:t.mute, marginTop:1 }}>
                    {r.savedAt ? new Date(r.savedAt).toLocaleDateString('zh-CN') : ''}
                    {r.wordCount ? ` · ${r.wordCount} 字` : ''}
                  </div>
                </div>
              </label>
            ))
          }
        </div>
        <div style={{ padding:'10px 16px', borderTop:`1px solid ${t.rule}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <span style={{ fontFamily:t.fontMono, fontSize:9, color:t.mute }}>已选 {selected.size} / {reports.length}</span>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onClose} style={{ padding:'5px 14px', background:'transparent', border:`1px solid ${t.rule}`, fontFamily:t.fontDisplay, fontWeight:700, fontSize:10, letterSpacing:0.8, cursor:'pointer', color:t.mute }}>取消</button>
            <button onClick={onConfirm} disabled={selected.size === 0} style={{ padding:'5px 14px', background: selected.size === 0 ? t.rule : (confirmDanger ? '#dc2626' : t.ink), color: selected.size === 0 ? t.mute : t.paper, border:'none', fontFamily:t.fontDisplay, fontWeight:700, fontSize:10, letterSpacing:0.8, cursor: selected.size === 0 ? 'default' : 'pointer', opacity: selected.size === 0 ? 0.55 : 1 }}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Permission system ─────────────────────────────────────────────────────
function usePermission() {
  const { role: authRole } = useAuth();
  // If user has no team role (not in a team), treat as full admin
  const role = authRole || 'admin';
  const DEFAULT_RULES = {
    admin:  ['generate','save','export','template','library','sources','source_manage','sync','model_config','appearance'],
    editor: ['generate','save','export','template','library','sources','appearance'],
    viewer: ['library'],
  };
  const can = (feature) => {
    if (!authRole) return true; // no team = full access
    try {
      const cfg = JSON.parse(localStorage.getItem('atlas_perm_config') || 'null');
      if (cfg && cfg[role]) return !!cfg[role][feature];
    } catch {}
    return (DEFAULT_RULES[role] || DEFAULT_RULES.admin).includes(feature);
  };
  return { role, can };
}

// ── Settings Modal ────────────────────────────────────────────────────────
function LanguageManager({ t, inp, secHdr, toolbarStore }) {
  const [customLangs, setCustomLangs] = React.useState(
    () => { try { return JSON.parse(localStorage.getItem('atlas_custom_languages') || '[]'); } catch { return []; } }
  );
  const allLangs = [...BUILTIN_LANGUAGES, ...customLangs];
  const activeLangId = toolbarStore?.languageId;

  const handleRemove = (id) => {
    const updated = customLangs.filter(l => l.id !== id);
    setCustomLangs(updated);
    try { localStorage.setItem('atlas_custom_languages', JSON.stringify(updated)); } catch {}
    toolbarStore?.removeLanguage(id);
  };

  const handleAdd = (label) => {
    const id = 'custom_lang_' + Date.now();
    const newLang = { id, label, instr: `使用${label}写作`, custom: true };
    const updated = [...customLangs, newLang];
    setCustomLangs(updated);
    try { localStorage.setItem('atlas_custom_languages', JSON.stringify(updated)); } catch {}
    toolbarStore?.addLanguage(label);
  };

  return (
    <div>
      <div style={secHdr}>语言管理</div>
      <div style={{ fontFamily: t.fontCN, fontSize: 11, color: t.mute, marginBottom: 10 }}>内置语言无法删除，可在 Toolbar 切换。自定义语言可在此添加或删除。</div>
      {allLangs.map(lang => (
        <div key={lang.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', border: `1px solid ${t.rule}`, marginBottom: 4, background: activeLangId === lang.id ? t.faint : 'transparent' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: t.fontCN, fontSize: 13, fontWeight: 600, color: t.ink }}>{lang.label}</div>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginTop: 2 }}>{lang.instr}</div>
          </div>
          {activeLangId === lang.id && <span style={{ fontFamily: t.fontMono, fontSize: 8, color: t.accent }}>当前</span>}
          {lang.custom ? (
            <button type="button" onClick={() => handleRemove(lang.id)}
              style={{ border: `1px solid #dc2626`, background: 'transparent', cursor: 'pointer', color: '#dc2626', fontFamily: t.fontMono, fontSize: 9, padding: '3px 8px' }}>删除</button>
          ) : (
            <span style={{ fontFamily: t.fontMono, fontSize: 8, color: t.mute }}>内置</span>
          )}
        </div>
      ))}
      <AddLanguageInline t={t} inp={inp} onAdd={handleAdd}/>
    </div>
  );
}

function AddLanguageInline({ t, inp, onAdd }) {
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const inputRef = React.useRef(null);
  React.useEffect(() => { if (adding && inputRef.current) inputRef.current.focus(); }, [adding]);
  const submit = () => { if (draft.trim()) { onAdd(draft.trim()); setDraft(''); setAdding(false); } };
  if (!adding) {
    return (
      <button type="button" onClick={() => setAdding(true)}
        style={{ width: '100%', padding: '9px 0', border: `1px dashed ${t.rule}`, background: 'transparent', fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1, color: t.mute, cursor: 'pointer', textTransform: 'uppercase', marginTop: 4 }}>
        ＋ 新增自定义语言
      </button>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
      <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setAdding(false); setDraft(''); } }}
        placeholder="如：日本語、Français"
        style={{ ...inp, flex: 1 }}/>
      <button type="button" disabled={!draft.trim()} onClick={submit}
        style={{ padding: '6px 14px', background: draft.trim() ? t.ink : t.rule, color: t.paper, border: 'none', fontFamily: t.fontMono, fontSize: 9, cursor: draft.trim() ? 'pointer' : 'not-allowed' }}>确认</button>
      <button type="button" onClick={() => { setAdding(false); setDraft(''); }}
        style={{ padding: '6px 10px', background: 'transparent', color: t.mute, border: `1px solid ${t.rule}`, fontFamily: t.fontMono, fontSize: 9, cursor: 'pointer' }}>取消</button>
    </div>
  );
}

function ServerKeySection({ t, inp, secHdr }) {
  const [svrKeys, setSvrKeys] = React.useState([]);
  const [keyForm, setKeyForm] = React.useState({ provider: 'anthropic', apiKey: '', apiUrl: '', label: '' });
  const [keyStatus, setKeyStatus] = React.useState('idle');

  const getToken = async () => {
    try { const { supabase } = await import('./lib/supabase.js'); const { data: { session } } = await supabase.auth.getSession(); return session?.access_token || null; } catch { return null; }
  };

  React.useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) return;
      const res = await fetch('/api/keys', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setSvrKeys(await res.json());
    })();
  }, []);

  const saveKey = async () => {
    if (!keyForm.apiKey) return;
    setKeyStatus('saving');
    const token = await getToken();
    const res = await fetch('/api/keys', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(keyForm) });
    if (res.ok) { const d = await res.json(); setSvrKeys(prev => [...prev, { id: d.id, provider: keyForm.provider, api_url: keyForm.apiUrl, label: keyForm.label || keyForm.provider }]); setKeyForm(f => ({ ...f, apiKey: '' })); setKeyStatus('saved'); setTimeout(() => setKeyStatus('idle'), 2000); }
    else setKeyStatus('error');
  };

  const deleteKey = async (id) => {
    const token = await getToken();
    await fetch(`/api/keys/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setSvrKeys(prev => prev.filter(k => k.id !== id));
  };

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={secHdr}>服务端 API Key · 安全存储</div>
      <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#888', marginBottom: 10, lineHeight: 1.6 }}>Key 加密存于服务器，浏览器不可见 · 生成时自动走服务端路由</div>
      {svrKeys.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
          {svrKeys.map(k => (
            <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: `1px solid #ddd` }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 12 }}>{k.label}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#888', marginLeft: 8 }}>{k.api_url || k.provider}</span>
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#2a8c5c' }}>● 已保存</span>
              <button onClick={() => deleteKey(k.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#888', padding: '0 2px' }}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['anthropic','openai','custom'].map(p => (
            <button key={p} onClick={() => setKeyForm(f => ({ ...f, provider: p }))}
              style={{ padding: '3px 10px', fontFamily: 'monospace', fontSize: 8, letterSpacing: 0.8, border: `1px solid ${keyForm.provider === p ? '#c44' : '#ddd'}`, background: keyForm.provider === p ? '#c44' : 'transparent', color: keyForm.provider === p ? '#fff' : '#888', cursor: 'pointer' }}>
              {p}
            </button>
          ))}
        </div>
        {keyForm.provider === 'custom' && (
          <input placeholder="API URL（如 https://api.example.com/v1）" value={keyForm.apiUrl} onChange={e => setKeyForm(f => ({ ...f, apiUrl: e.target.value }))} style={inp}/>
        )}
        <input type="password" placeholder="粘贴 API Key" value={keyForm.apiKey} onChange={e => setKeyForm(f => ({ ...f, apiKey: e.target.value }))} style={inp}/>
        <input placeholder="备注名称（可选）" value={keyForm.label} onChange={e => setKeyForm(f => ({ ...f, label: e.target.value }))} style={inp}/>
        <button onClick={saveKey} disabled={!keyForm.apiKey || keyStatus === 'saving'}
          style={{ padding: '7px 0', border: '1px solid #111', background: '#111', color: '#fff', fontFamily: 'monospace', fontSize: 9, cursor: keyForm.apiKey ? 'pointer' : 'not-allowed', opacity: keyForm.apiKey ? 1 : 0.4, letterSpacing: 1 }}>
          {keyStatus === 'saving' ? '保存中…' : keyStatus === 'saved' ? '✓ 已保存' : '加密保存 Key'}
        </button>
      </div>
    </div>
  );
}

// MCP server configuration (remote HTTP only). Lives in self-managed localStorage.
// Recommended no-auth public remote MCP servers (verify current URLs at provider docs).
const PRESET_MCP_SERVERS = [
  { name: 'DeepWiki', url: 'https://mcp.deepwiki.com/mcp', desc: '查询 GitHub 仓库文档/问答 · 免鉴权' },
  { name: 'Context7', url: 'https://mcp.context7.com/mcp', desc: '查询开源库最新文档 · 免鉴权' },
];

function McpServersConfig({ t, secHdr }) {
  const [servers, setServers] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('atlas_mcp_servers') || '[]'); } catch { return []; }
  });
  const [adding, setAdding] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', url: '', token: '' });
  const [tokens, setTokens] = React.useState(getMcpTokens);

  const persist = (next) => {
    setServers(next);
    try { localStorage.setItem('atlas_mcp_servers', JSON.stringify(next)); } catch {}
  };
  const add = () => {
    if (!form.name.trim() || !form.url.trim()) return;
    persist([...servers, { id: Date.now().toString(), name: form.name.trim(), url: form.url.trim(), token: form.token.trim() }]);
    setForm({ name: '', url: '', token: '' });
    setAdding(false);
  };
  const addPreset = (p) => {
    if (servers.some(s => s.url === p.url)) return;
    persist([...servers, { id: Date.now().toString(), name: p.name, url: p.url, token: '' }]);
  };
  const remove = (id) => persist(servers.filter(s => s.id !== id));

  const inp = { width: '100%', padding: '6px 9px', fontFamily: t.fontMono, fontSize: 11, border: `1px solid ${t.rule}`, background: t.paper, color: t.ink, outline: 'none', boxSizing: 'border-box' };
  const btn = { padding: '5px 12px', fontFamily: t.fontMono, fontSize: 9, letterSpacing: 0.8, border: `1px solid ${t.ink}`, background: 'transparent', color: t.ink, cursor: 'pointer' };

  return (
    <div>
      <div style={secHdr}>MCP 服务器</div>
      <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginBottom: 10, lineHeight: 1.6 }}>
        仅支持远程 HTTP / Streamable HTTP 类型。配置后，开启「自主研究模式」时这些工具会一并提供给模型。stdio 本地服务器需桌面客户端，暂不支持。
      </div>
      {servers.map(s => {
        const authed = !!tokens[s.url];
        return (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: `1px solid ${t.rule}`, marginBottom: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: t.fontCN, fontSize: 12, color: t.ink }}>{s.name}{authed && <span style={{ color: '#2a8c5c', marginLeft: 6, fontFamily: t.fontMono, fontSize: 9 }}>● 已授权</span>}</div>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.url}{s.token ? ' · 已配置 token' : ''}</div>
          </div>
          {authed
            ? <button onClick={() => { removeMcpToken(s.url); setTokens(getMcpTokens()); }} style={{ ...btn, flexShrink: 0 }}>撤销授权</button>
            : <button onClick={() => startMcpOAuth(s)} title="若服务器需要 OAuth（如 Linear/Notion）" style={{ ...btn, flexShrink: 0 }}>OAuth 授权</button>}
          <button onClick={() => remove(s.id)} style={{ ...btn, border: `1px solid #e5251d`, color: '#e5251d', flexShrink: 0 }}>删除</button>
        </div>
      ); })}
      {/* Recommended no-auth presets */}
      <div style={{ fontFamily: t.fontMono, fontSize: 8.5, color: t.mute, letterSpacing: 1, margin: '10px 0 6px' }}>推荐（免鉴权，一键添加）</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {PRESET_MCP_SERVERS.map(p => {
          const added = servers.some(s => s.url === p.url);
          return (
            <button key={p.url} onClick={() => addPreset(p)} disabled={added} title={p.desc} style={{
              ...btn, fontSize: 9, opacity: added ? 0.4 : 1, cursor: added ? 'default' : 'pointer',
            }}>{added ? '✓ ' : '＋ '}{p.name}</button>
          );
        })}
      </div>
      {adding ? (
        <div style={{ padding: 10, border: `1px solid ${t.rule}`, background: t.faint, marginTop: 6 }}>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="名称（如 Notion）" style={{ ...inp, marginBottom: 6 }}/>
          <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="服务器 URL（https://…）" style={{ ...inp, marginBottom: 6 }}/>
          <input value={form.token} onChange={e => setForm(f => ({ ...f, token: e.target.value }))} placeholder="Bearer Token（可选）" style={{ ...inp, marginBottom: 8 }}/>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={add} disabled={!form.name.trim() || !form.url.trim()} style={{ ...btn, background: t.ink, color: t.paper, opacity: (!form.name.trim() || !form.url.trim()) ? 0.5 : 1 }}>保存</button>
            <button onClick={() => { setAdding(false); setForm({ name: '', url: '', token: '' }); }} style={btn}>取消</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ ...btn, marginTop: 4 }}>＋ 手动添加</button>
      )}
    </div>
  );
}

// M · Memory settings — writing profile (notes/avoid + derived view) + entity memory
function MemorySettings({ t, inp, lbl, secHdr }) {
  const [profile, setProfile] = React.useState(getWritingProfile);
  const [entities, setEntities] = React.useState(getEntityMemory);
  const [noteDraft, setNoteDraft] = React.useState('');
  const [avoidDraft, setAvoidDraft] = React.useState('');
  const [entForm, setEntForm] = React.useState({ area: '', keywords: '', entities: '' });

  const reports = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('atlas_saved_reports') || '[]'); } catch { return []; }
  }, []);
  const derived = React.useMemo(() => deriveProfileStats(reports), [reports]);

  const persistProfile = (p) => { setProfile(p); saveWritingProfile(p); };
  const addItem = (key, val, clear) => { if (!val.trim()) return; const p = { ...profile, [key]: [...new Set([...(profile[key] || []), val.trim()])] }; persistProfile(p); clear(''); };
  const delItem = (key, i) => { const p = { ...profile, [key]: (profile[key] || []).filter((_, j) => j !== i) }; persistProfile(p); };

  const persistEnts = (list) => { setEntities(list); saveEntityMemory(list); };
  const addEntity = () => {
    if (!entForm.area.trim()) return;
    persistEnts([...entities, { id: Date.now().toString(), area: entForm.area.trim(),
      keywords: entForm.keywords.split(/[,，\s]+/).map(s => s.trim()).filter(Boolean),
      entities: entForm.entities.split(/[,，\s]+/).map(s => s.trim()).filter(Boolean) }]);
    setEntForm({ area: '', keywords: '', entities: '' });
  };

  const btn = { padding: '5px 12px', fontFamily: t.fontMono, fontSize: 9, letterSpacing: 0.8, border: `1px solid ${t.ink}`, background: 'transparent', color: t.ink, cursor: 'pointer' };
  const chip = (txt, onDel) => (
    <span key={txt} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: t.fontCN, fontSize: 12, color: t.ink, padding: '3px 8px', border: `1px solid ${t.rule}`, background: t.faint, marginRight: 6, marginBottom: 6 }}>
      {txt}<button onClick={onDel} style={{ border: 'none', background: 'none', cursor: 'pointer', color: t.mute, fontSize: 12, lineHeight: 1, padding: 0 }}>×</button>
    </span>
  );

  return (
    <React.Fragment>
      <div style={{ fontFamily: t.fontCN, fontSize: 11, color: t.mute, marginBottom: 8, lineHeight: 1.6 }}>
        记忆会在生成时注入 &lt;user_memory&gt;，引导模型贴合你的偏好与重点对象。全部存于本机。
      </div>

      {/* Writing profile — preferences */}
      <div style={secHdr}>写作偏好（注入：希望模型做到）</div>
      <div>{(profile.notes || []).map((n, i) => chip(n, () => delItem('notes', i)))}</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 4, marginBottom: 16 }}>
        <input value={noteDraft} onChange={e => setNoteDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem('notes', noteDraft, setNoteDraft)} placeholder="如：多用数据和案例、结论先行" style={{ ...inp, flex: 1 }}/>
        <button onClick={() => addItem('notes', noteDraft, setNoteDraft)} style={{ ...btn, background: t.ink, color: t.paper }}>添加</button>
      </div>

      <div style={secHdr}>避免项（注入：希望模型避免 · 差评会自动累积到这里）</div>
      <div>{(profile.avoid || []).map((n, i) => chip(n, () => delItem('avoid', i)))}</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 4, marginBottom: 16 }}>
        <input value={avoidDraft} onChange={e => setAvoidDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem('avoid', avoidDraft, setAvoidDraft)} placeholder="如：避免空话套话、避免过度营销语气" style={{ ...inp, flex: 1 }}/>
        <button onClick={() => addItem('avoid', avoidDraft, setAvoidDraft)} style={{ ...btn, background: t.ink, color: t.paper }}>添加</button>
      </div>

      {/* Derived view */}
      <div style={secHdr}>历史归纳（只读 · 基于{derived.basis === 'good' ? '好评' : '全部'} {derived.n} 篇）</div>
      <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.inkSoft, lineHeight: 1.9, marginBottom: 18 }}>
        {derived.n === 0 ? '暂无生成历史' : <>
          常用模型：{derived.model || '—'}　·　模式：{derived.generationMode || '—'}<br/>
          语气：{derived.tone || '—'}　·　语言：{derived.language || '—'}　·　风格：{derived.style || '—'}
        </>}
      </div>

      {/* Entity memory */}
      <div style={secHdr}>实体记忆（topic 命中关键词时，注入重点对象）</div>
      {entities.map(e => (
        <div key={e.id} style={{ padding: '8px 10px', border: `1px solid ${t.rule}`, marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: t.fontCN, fontWeight: 600, fontSize: 13, color: t.ink, flex: 1 }}>{e.area}</span>
            <button onClick={() => persistEnts(entities.filter(x => x.id !== e.id))} style={{ ...btn, border: `1px solid #e5251d`, color: '#e5251d' }}>删除</button>
          </div>
          <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginTop: 3 }}>关键词：{(e.keywords || []).join('、') || '—'}</div>
          <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.accent, marginTop: 2 }}>重点对象：{(e.entities || []).join('、') || '—'}</div>
        </div>
      ))}
      <div style={{ padding: 10, border: `1px solid ${t.rule}`, background: t.faint, marginTop: 6 }}>
        <input value={entForm.area} onChange={e => setEntForm(f => ({ ...f, area: e.target.value }))} placeholder="领域名（如 咖啡赛道）" style={{ ...inp, marginBottom: 6 }}/>
        <input value={entForm.keywords} onChange={e => setEntForm(f => ({ ...f, keywords: e.target.value }))} placeholder="触发关键词（逗号分隔，如 咖啡,咖啡馆,Manner）" style={{ ...inp, marginBottom: 6 }}/>
        <input value={entForm.entities} onChange={e => setEntForm(f => ({ ...f, entities: e.target.value }))} placeholder="重点对象（逗号分隔，如 Manner,库迪,挪瓦）" style={{ ...inp, marginBottom: 8 }}/>
        <button onClick={addEntity} disabled={!entForm.area.trim()} style={{ ...btn, background: t.accent, color: '#fff', opacity: entForm.area.trim() ? 1 : 0.5 }}>＋ 添加领域</button>
      </div>
    </React.Fragment>
  );
}

function SettingsModal({ t, modelStore, toolbarStore, outlineMode, setOutlineMode, researchMode, setResearchMode, onClose }) {
  const { can } = usePermission();
  const canModelConfig = can('model_config');
  const [tab, setTab] = React.useState('model');
  const [modalReports, setModalReports] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('atlas_saved_reports') || '[]'); } catch { return []; }
  });
  const [exportSel, setExportSel] = React.useState(() => new Set());
  const [clearSel, setClearSel] = React.useState(() => new Set());
  React.useEffect(() => {
    const ids = modalReports.map(r => r.id);
    setExportSel(new Set(ids));
    setClearSel(new Set(ids));
  }, []);

  const [showAddForm, setShowAddForm] = React.useState(false);
  const emptyForm = { name: '', modelId: '', apiUrl: '', apiKey: '', provider: '' };
  const [form, setForm] = React.useState(emptyForm);
  const [showKey, setShowKey] = React.useState(false);
  const [role, setRoleState] = React.useState(() => {
    try { return localStorage.getItem('atlas_role') || 'admin'; } catch { return 'admin'; }
  });
  const saveRole = (r) => { setRoleState(r); try { localStorage.setItem('atlas_role', r); } catch {} };

  const [exportFmt, setExportFmt] = React.useState('json');
  const [exportMode, setExportMode] = React.useState('combined'); // 'combined' | 'separate'
  const [exportStatus, setExportStatus] = React.useState('idle');
  const [exportStatusMsg, setExportStatusMsg] = React.useState('');

  const [confirmingClear, setConfirmingClear] = React.useState(false);
  const [clearToast, setClearToast] = React.useState('');
  const [showTplForm, setShowTplForm] = React.useState(false);
  const [tplName, setTplName] = React.useState('');

  const PERM_TABLE = [
    { feature: '生成报告',          key: 'generate',      admin: true,  editor: true,  viewer: false },
    { feature: '保存 / 导出报告',   key: 'save',          admin: true,  editor: true,  viewer: false },
    { feature: '自定义模板管理',     key: 'template',      admin: true,  editor: true,  viewer: false },
    { feature: '查看报告库',         key: 'library',       admin: true,  editor: true,  viewer: true  },
    { feature: '查看 Sources 页',   key: 'sources',       admin: true,  editor: true,  viewer: false },
    { feature: '添加 / 断开数据源', key: 'source_manage', admin: true,  editor: false, viewer: false },
    { feature: '手动同步数据源',     key: 'sync',          admin: true,  editor: false, viewer: false },
    { feature: '修改模型 / 参数',   key: 'model_config',  admin: true,  editor: false, viewer: false },
    { feature: '修改主题 / 外观',   key: 'appearance',    admin: true,  editor: true,  viewer: false },
  ];
  const [permConfig, setPermConfig] = React.useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('atlas_perm_config') || 'null');
      if (stored) return stored;
    } catch {}
    const cfg = { admin: {}, editor: {}, viewer: {} };
    for (const row of PERM_TABLE) {
      cfg.admin[row.key] = row.admin;
      cfg.editor[row.key] = row.editor;
      cfg.viewer[row.key] = row.viewer;
    }
    return cfg;
  });
  const togglePerm = (roleKey, featureKey) => {
    setPermConfig(prev => {
      const next = { ...prev, [roleKey]: { ...prev[roleKey], [featureKey]: !prev[roleKey]?.[featureKey] } };
      try { localStorage.setItem('atlas_perm_config', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleAddModel = () => {
    if (!form.name || !form.modelId || !form.apiUrl || !form.apiKey) return;
    modelStore.addModel({ id: form.modelId, name: form.name, apiUrl: form.apiUrl, apiKey: form.apiKey, provider: form.provider || 'Custom', builtin: false });
    setForm(emptyForm); setShowAddForm(false); setShowKey(false);
  };

  const _norm = (r) => ({
    ...r,
    title: r.title || r.meta?.titleEn || r.meta?.title?.en || r.prompt?.slice(0,52) || '报告',
    subtitle: r.subtitle || r.meta?.subtitle || '',
  });

  const doExport = async () => {
    const data = modalReports.filter(r => exportSel.has(r.id));
    if (!data.length) return;
    const separate = exportMode === 'separate' && data.length > 1;
    setExportStatus('loading'); setExportStatusMsg('');
    try {
      if (exportFmt === 'json') {
        if (separate) {
          for (const r of data) {
            _dlBlob(new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' }), _slug(r.title || r.meta?.titleEn || 'report') + '.json');
          }
        } else {
          _dlBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `atlas-reports-${new Date().toISOString().slice(0,10)}.json`);
        }
        setExportStatus('done'); setExportStatusMsg(`✓ JSON 已下载（${data.length} 份${separate ? '，分别保存' : '，合并为一份'}）`);
      } else if (exportFmt === 'pdf') {
        for (const r of data) { await _exportPDFDownload(_norm(r)); }
        setExportStatus('done'); setExportStatusMsg(`✓ PDF 已下载（${data.length} 份）`);
      } else if (exportFmt === 'docx') {
        for (const r of data) {
          const html = _buildWordHTML(_norm(r));
          _dlBlob(new Blob(['﻿', html], { type: 'application/vnd.ms-word;charset=utf-8' }), _slug((r.title || r.meta?.titleEn || 'report')) + '.doc');
        }
        setExportStatus('done'); setExportStatusMsg(`✓ DOCX 已下载（${data.length} 份）`);
      } else if (exportFmt === 'md') {
        if (separate) {
          for (const r of data) {
            _dlBlob(new Blob([_buildMarkdown(_norm(r))], { type: 'text/markdown;charset=utf-8' }), _slug(r.title || r.meta?.titleEn || 'report') + '.md');
          }
        } else {
          const combined = data.map(r => _buildMarkdown(_norm(r))).join('\n\n---\n\n');
          _dlBlob(new Blob([combined], { type: 'text/markdown;charset=utf-8' }), `atlas-reports-${new Date().toISOString().slice(0,10)}.md`);
        }
        setExportStatus('done'); setExportStatusMsg(`✓ Markdown 已下载（${data.length} 份${separate ? '，分别保存' : '，合并为一份'}）`);
      } else if (exportFmt === 'notion') {
        const combined = data.map(r => _buildMarkdown(_norm(r))).join('\n\n---\n\n');
        await navigator.clipboard.writeText(combined);
        setExportStatus('done'); setExportStatusMsg('✓ 已复制 → 在 Notion 新建页面后直接粘贴');
      } else if (exportFmt === 'link') {
        const base = window.location.href.split('?')[0].split('#')[0];
        const links = data.map(r => {
          const param = btoa(encodeURIComponent(JSON.stringify({ id: r.id, title: r.title || r.meta?.titleEn || '', ts: Date.now() }))).slice(0, 32);
          return `${base}?r=${param}`;
        }).join('\n');
        await navigator.clipboard.writeText(links);
        setExportStatus('done'); setExportStatusMsg(`✓ ${data.length} 条链接已复制`);
      }
    } catch (err) {
      setExportStatus('error'); setExportStatusMsg('✕ 操作失败：' + (err.message || String(err)));
    }
    setTimeout(() => { setExportStatus('idle'); setExportStatusMsg(''); }, 4000);
  };

  const doClear = () => { if (clearSel.size) setConfirmingClear(true); };
  const doConfirmClear = () => {
    const count = clearSel.size;
    const keep = modalReports.filter(r => !clearSel.has(r.id));
    try { localStorage.setItem('atlas_saved_reports', JSON.stringify(keep)); } catch {}
    window.dispatchEvent(new Event('atlas-reports-updated'));
    setModalReports(keep);
    setExportSel(new Set(keep.map(r => r.id)));
    setClearSel(new Set());
    setConfirmingClear(false);
    setClearToast(`已删除 ${count} 份报告`);
    setTimeout(() => setClearToast(''), 3500);
  };

  const TABS = [
    { k: 'model',      label: '模型',  sub: '参数 & 管理' },
    { k: 'prompt',     label: '提示词', sub: 'System Prompt' },
    { k: 'memory',     label: '记忆',  sub: '画像 & 实体'  },
    { k: 'export',     label: '导出',  sub: '多格式导出'  },
    { k: 'clear',      label: '清除',  sub: '本地数据'    },
    { k: 'permission', label: '权限',  sub: '角色管理'    },
  ];
  const ROLES = [
    { k: 'admin',  label: '管理员', desc: '全部功能权限',          color: '#1d4ed8' },
    { k: 'editor', label: '编辑',   desc: '生成报告，不能改数据源', color: '#2a8c5c' },
    { k: 'viewer', label: '查看者', desc: '只读，仅查看报告库',    color: '#767368' },
  ];
  const EXPORT_FORMATS_SETTINGS = [
    { k: 'json',   en: 'JSON',     cn: '完整备份，含所有元数据' },
    { k: 'pdf',    en: 'PDF',      cn: '便于打印 / 邮件附件' },
    { k: 'docx',   en: 'DOCX',    cn: '继续在 Word 编辑' },
    { k: 'md',     en: 'Markdown', cn: '纯文本，所有报告合并为一个文件' },
    { k: 'notion', en: 'NOTION',  cn: '复制 Markdown 到剪贴板，粘贴进 Notion' },
    { k: 'link',   en: 'LINK',    cn: '每份报告生成一条分享链接，批量复制' },
  ];

  const lbl = { fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 5, display: 'block' };
  const inp = { width: '100%', padding: '6px 8px', boxSizing: 'border-box', border: `1px solid ${t.rule}`, background: t.paper, color: t.ink, fontFamily: t.fontBody, fontSize: 12, outline: 'none' };
  const secHdr = { fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12, paddingBottom: 7, borderBottom: `1px solid ${t.rule}` };

  const ReportList = ({ sel, setSel }) => {
    const all = modalReports.length > 0 && sel.size === modalReports.length;
    const toggleAll = (e) => setSel(e.target.checked ? new Set(modalReports.map(r => r.id)) : new Set());
    const toggleOne = (id, chk) => setSel(prev => { const n = new Set(prev); chk ? n.add(id) : n.delete(id); return n; });
    return (
      <div style={{ border: `1px solid ${t.rule}` }}>
        <div style={{ padding: '6px 12px', borderBottom: `1px solid ${t.rule}`, background: t.faint }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={all} onChange={toggleAll} style={{ cursor: 'pointer', width: 13, height: 13 }}/>
            <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>全选（共 {modalReports.length} 份）</span>
          </label>
        </div>
        <div style={{ maxHeight: 220, overflowY: 'auto' }}>
          {modalReports.length === 0
            ? <div style={{ padding: '24px', fontFamily: t.fontCN, fontSize: 13, color: t.mute, textAlign: 'center' }}>报告库为空</div>
            : modalReports.map(r => (
              <label key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', cursor: 'pointer', borderBottom: `1px solid ${t.rule}`, userSelect: 'none' }}>
                <input type="checkbox" checked={sel.has(r.id)} onChange={e => toggleOne(r.id, e.target.checked)} style={{ marginTop: 2, cursor: 'pointer', flexShrink: 0, width: 13, height: 13 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: t.fontCN, fontSize: 12, fontWeight: 600, color: t.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title || r.meta?.titleEn || r.prompt?.slice(0,44) || '无标题'}</div>
                  <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginTop: 1 }}>{r.meta?.date || ''}{r.meta?.words ? ` · ${r.meta.words} 字` : ''}</div>
                </div>
              </label>
            ))
          }
        </div>
        <div style={{ padding: '5px 12px', borderTop: `1px solid ${t.rule}`, fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>已选 {sel.size} / {modalReports.length}</div>
      </div>
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: t.paper, border: `1.5px solid ${t.ink}`, width: '100%', maxWidth: 700, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: `4px 4px 0 rgba(0,0,0,0.15)` }}>
        <div style={{ padding: '14px 20px', borderBottom: `1.5px solid ${t.ink}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Tag t={t} accent>◆ SETTINGS · 设置</Tag>
          <span style={{ flex: 1 }}/>
          <button type="button" onClick={onClose} style={{ border: `1px solid ${t.ink}`, background: t.paper, padding: '3px 8px', fontFamily: t.fontMono, fontSize: 11, cursor: 'pointer', color: t.ink }}>ESC</button>
        </div>
        <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
          <div style={{ width: 110, borderRight: `1px solid ${t.rule}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            {TABS.map(tb => (
              <div key={tb.k} onClick={() => setTab(tb.k)} style={{ padding: '13px 14px', cursor: 'pointer', background: tab === tb.k ? t.faint : 'transparent', borderBottom: `1px solid ${t.rule}`, borderLeft: `2.5px solid ${tab === tb.k ? t.accent : 'transparent'}` }}>
                <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 12, letterSpacing: 0.5, color: tab === tb.k ? t.ink : t.mute }}>{tb.label}</div>
                <div style={{ fontFamily: t.fontMono, fontSize: 8, color: t.mute, marginTop: 3, lineHeight: 1.3 }}>{tb.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

            {tab === 'model' && modelStore && (
              <React.Fragment>
                {!canModelConfig && (
                  <div style={{ padding: '8px 12px', marginBottom: 12, border: `1px solid ${t.rule}`, background: 'rgba(118,115,104,0.06)', fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 0.3 }}>
                    只读 · 当前团队角色无权修改模型 / 参数
                  </div>
                )}
                <div style={{ pointerEvents: canModelConfig ? 'auto' : 'none', opacity: canModelConfig ? 1 : 0.55 }}>
                <div>
                  <div style={secHdr}>生成流程</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: `1px solid ${t.rule}`, marginBottom: 6 }}>
                    <div>
                      <div style={{ fontFamily: t.fontCN, fontSize: 13, color: t.ink }}>大纲先行模式</div>
                      <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginTop: 2 }}>生成前先预览 AI 大纲，确认后再生成全文 · 无模板时触发</div>
                    </div>
                    <button type="button" onClick={() => setOutlineMode && setOutlineMode(!outlineMode)} style={{
                      width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', flexShrink: 0,
                      background: outlineMode ? t.accent : t.rule,
                      position: 'relative', transition: 'background 0.2s',
                    }}>
                      <span style={{
                        position: 'absolute', top: 3, left: outlineMode ? 18 : 3,
                        width: 14, height: 14, borderRadius: '50%', background: t.paper,
                        transition: 'left 0.2s',
                      }}/>
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: `1px solid ${t.rule}` }}>
                    <div>
                      <div style={{ fontFamily: t.fontCN, fontSize: 13, color: t.ink }}>自主研究模式</div>
                      <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginTop: 2 }}>生成前模型自主联网搜索/读网页补充资料 · 需 API Key · MiMo 仅单轮</div>
                    </div>
                    <button type="button" onClick={() => setResearchMode && setResearchMode(!researchMode)} style={{
                      width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', flexShrink: 0,
                      background: researchMode ? t.accent : t.rule,
                      position: 'relative', transition: 'background 0.2s',
                    }}>
                      <span style={{
                        position: 'absolute', top: 3, left: researchMode ? 18 : 3,
                        width: 14, height: 14, borderRadius: '50%', background: t.paper,
                        transition: 'left 0.2s',
                      }}/>
                    </button>
                  </div>
                </div>
                <McpServersConfig t={t} secHdr={secHdr}/>
                <div>
                  <div style={secHdr}>模型参数</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontFamily:t.fontMono, fontSize:9, color:t.mute, letterSpacing:1 }}>当前生成模式</span>
                    <div style={{ display:'flex', gap:4 }}>
                      {[...GENERATION_MODES, { id:'custom', cn:'自定义' }].map(m => (
                        <button key={m.id} onClick={() => m.id !== 'custom' && modelStore.setGenerationMode(m.id)} style={{
                          padding:'2px 8px', fontFamily:t.fontMono, fontSize:8, letterSpacing:0.8,
                          border:`1px solid ${modelStore.generationMode===m.id ? t.accent : t.rule}`,
                          background: modelStore.generationMode===m.id ? t.accent : 'transparent',
                          color: modelStore.generationMode===m.id ? t.paper : t.mute,
                          cursor: m.id==='custom' ? 'default' : 'pointer',
                        }}>{m.cn}</button>
                      ))}
                    </div>
                  </div>
                  <UMenuSliderRow t={t} label="TEMPERATURE" value={Number(modelStore.temperature||0.45)} min={0} max={2} step={0.05} onChange={v => modelStore.setTemperature(v)} formatVal={v => v.toFixed(2)} hints={['严谨 0.25','均衡 0.45','探索 0.75']}/>
                  <UMenuSliderRow t={t} label="TOP-P" value={Number(modelStore.topP ?? 0.90)} min={0} max={1} step={0.05} onChange={v => modelStore.setTopP(v)} formatVal={v => v.toFixed(2)} hints={['0.85','0.90','0.95']}/>
                  <UMenuSliderRow t={t} label="FREQUENCY PENALTY" value={Number(modelStore.frequencyPenalty ?? 0.10)} min={-2} max={2} step={0.05} onChange={v => modelStore.setFrequencyPenalty(v)} formatVal={v => (v>=0?'+':'')+v.toFixed(2)} hints={['+0.20','+0.10','+0.00']}/>
                  <UMenuSliderRow t={t} label="PRESENCE PENALTY" value={Number(modelStore.presencePenalty ?? 0)} min={-2} max={2} step={0.1} onChange={v => modelStore.setPresencePenalty(v)} formatVal={v => (v>=0?'+':'')+v.toFixed(1)} hints={['-2.0','0.0','+2.0']}/>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.1 }}>MAX TOKENS</div>
                      <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>留空则自动</div>
                    </div>
                    <input type="number" min={1} max={131072} value={modelStore.maxTokensOverride || ''} placeholder="Auto"
                      onChange={e => { const v = e.target.value ? Math.min(parseInt(e.target.value, 10), 131072) : null; modelStore.setMaxTokensOverride(v); }}
                      style={inp}/>
                  </div>
                  <div>
                    <div style={{ fontFamily: t.fontMono, fontSize: 8, color: t.mute, marginTop: 3 }}>当前模型：{modelStore.selected?.name || '—'} · System Prompt 设置在「提示词」标签页</div>
                  </div>
                </div>
                <div>
                  <div style={secHdr}>参数模板 · {modelStore.selected?.name || '—'}</div>
                  {(() => {
                    const modelId = modelStore.selected?.id;
                    const tpls = (modelStore.modelParamTemplates || {})[modelId] || [];
                    return (
                      <React.Fragment>
                        {tpls.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
                            {tpls.map(tpl => (
                              <div key={tpl.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: `1px solid ${modelStore.generationMode === tpl.id ? t.ink : t.rule}`, background: modelStore.generationMode === tpl.id ? t.faint : 'transparent' }}>
                                <div onClick={() => modelStore.setGenerationMode(tpl.id)} style={{ flex: 1, cursor: 'pointer', minWidth: 0 }}>
                                  <div style={{ fontFamily: t.fontCN, fontSize: 12, fontWeight: 600, color: t.ink }}>{tpl.name}</div>
                                  <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginTop: 2 }}>
                                    temp {Number(tpl.temperature).toFixed(2)} · top_p {Number(tpl.topP).toFixed(2)} · fp {(tpl.frequencyPenalty >= 0 ? '+' : '') + Number(tpl.frequencyPenalty).toFixed(2)}
                                  </div>
                                </div>
                                {modelStore.generationMode === tpl.id && <span style={{ fontFamily: t.fontMono, fontSize: 8, color: t.accent, flexShrink: 0 }}>使用中</span>}
                                <button type="button" onClick={() => modelStore.removeModelTemplate(modelId, tpl.id)}
                                  style={{ border: `1px solid #dc2626`, background: 'transparent', cursor: 'pointer', color: '#dc2626', fontFamily: t.fontMono, fontSize: 9, padding: '3px 8px', letterSpacing: 0.5, flexShrink: 0 }}>删除</button>
                              </div>
                            ))}
                          </div>
                        )}
                        {!showTplForm ? (
                          <button type="button" onClick={() => setShowTplForm(true)}
                            style={{ width: '100%', padding: '9px 0', border: `1px dashed ${t.rule}`, background: 'transparent', fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1, color: t.mute, cursor: 'pointer', textTransform: 'uppercase' }}>
                            ＋ 保存当前参数为模板
                          </button>
                        ) : (
                          <div style={{ border: `1px solid ${t.rule}`, padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1 }}>
                              保存当前参数：temp {Number(modelStore.temperature).toFixed(2)} · top_p {Number(modelStore.topP).toFixed(2)} · fp {(modelStore.frequencyPenalty >= 0 ? '+' : '') + Number(modelStore.frequencyPenalty).toFixed(2)}
                            </div>
                            <input value={tplName} onChange={e => setTplName(e.target.value)} placeholder="模板名称，如「产品分析专用」"
                              onKeyDown={e => { if (e.key === 'Enter' && tplName.trim()) { modelStore.addModelTemplate(modelId, tplName.trim(), modelStore.temperature, modelStore.topP, modelStore.frequencyPenalty); setShowTplForm(false); setTplName(''); }}}
                              style={inp} autoFocus/>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button type="button" onClick={() => { setShowTplForm(false); setTplName(''); }}
                                style={{ flex: 1, padding: '7px 0', border: `1px solid ${t.rule}`, background: 'transparent', fontFamily: t.fontMono, fontSize: 9, color: t.mute, cursor: 'pointer', textTransform: 'uppercase' }}>取消</button>
                              <button type="button" disabled={!tplName.trim()}
                                onClick={() => { modelStore.addModelTemplate(modelId, tplName.trim(), modelStore.temperature, modelStore.topP, modelStore.frequencyPenalty); setShowTplForm(false); setTplName(''); }}
                                style={{ flex: 2, padding: '7px 0', border: `1px solid ${t.ink}`, background: t.ink, color: t.paper, fontFamily: t.fontMono, fontSize: 9, cursor: 'pointer', textTransform: 'uppercase', opacity: !tplName.trim() ? 0.4 : 1 }}>保存模板</button>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })()}
                </div>
                <div>
                  <div style={secHdr}>模型管理</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
                    {modelStore.allModels.map(m => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `1px solid ${modelStore.selected?.id === m.id ? t.ink : t.rule}`, background: modelStore.selected?.id === m.id ? t.faint : 'transparent' }}>
                        <div onClick={() => modelStore.selectModel(m.id)} style={{ flex: 1, cursor: 'pointer', minWidth: 0 }}>
                          <div style={{ fontFamily: t.fontCN, fontSize: 13, fontWeight: 600, color: t.ink }}>{m.name}</div>
                          <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginTop: 2 }}>{m.provider} · {m.id}</div>
                        </div>
                        {modelStore.selected?.id === m.id && <span style={{ fontFamily: t.fontMono, fontSize: 8, color: t.accent, letterSpacing: 0.5, flexShrink: 0 }}>使用中</span>}
                        {m.builtin && m.needsKey && (
                          <span style={{ fontFamily: t.fontMono, fontSize: 8, color: modelStore.builtinKeys?.[m.id] ? '#2a8c5c' : t.mute, flexShrink: 0 }}>
                            {modelStore.builtinKeys?.[m.id] ? '已配置 Key' : '需配置 Key'}
                          </span>
                        )}
                        <button type="button"
                          onClick={() => m.builtin ? modelStore.hideBuiltin(m.id) : modelStore.removeModel(m.id)}
                          style={{ border: `1px solid #dc2626`, background: 'transparent', cursor: 'pointer', color: '#dc2626', fontFamily: t.fontMono, fontSize: 9, padding: '3px 8px', letterSpacing: 0.5, flexShrink: 0 }}>
                          {m.builtin ? '移除' : '删除'}
                        </button>
                      </div>
                    ))}
                  </div>
                  {!showAddForm ? (
                    <button type="button" onClick={() => setShowAddForm(true)}
                      style={{ width: '100%', padding: '9px 0', border: `1px dashed ${t.rule}`, background: 'transparent', fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1, color: t.mute, cursor: 'pointer', textTransform: 'uppercase' }}>
                      ＋ 新增模型
                    </button>
                  ) : (
                    <div style={{ border: `1px solid ${t.rule}`, padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.2, color: t.ink, textTransform: 'uppercase' }}>新增自定义模型</div>
                      {[{k:'name',l:'显示名称 *',ph:'GPT-4o Mini'},{k:'modelId',l:'Model ID *',ph:'gpt-4o-mini'},{k:'apiUrl',l:'API Base URL *',ph:'https://api.openai.com/v1'},{k:'provider',l:'Provider（选填）',ph:'Custom'}].map(({k,l,ph}) => (
                        <div key={k}>
                          <label style={lbl}>{l}</label>
                          <input value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} placeholder={ph} style={inp}/>
                        </div>
                      ))}
                      <div>
                        <label style={lbl}>API Key *</label>
                        <div style={{ position: 'relative' }}>
                          <input type={showKey ? 'text' : 'password'} value={form.apiKey}
                            onChange={e => setForm(f => ({...f, apiKey: e.target.value}))}
                            placeholder="sk-••••••••••••••••"
                            style={{ ...inp, paddingRight: 48 }}/>
                          <button type="button" onClick={() => setShowKey(s => !s)}
                            style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: t.fontMono, fontSize: 8, color: t.mute }}>
                            {showKey ? 'HIDE' : 'SHOW'}
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" onClick={() => { setShowAddForm(false); setForm(emptyForm); }}
                          style={{ flex: 1, padding: '7px 0', border: `1px solid ${t.rule}`, background: 'transparent', fontFamily: t.fontMono, fontSize: 9, color: t.mute, cursor: 'pointer', textTransform: 'uppercase' }}>取消</button>
                        <button type="button" onClick={handleAddModel}
                          disabled={!form.name || !form.modelId || !form.apiUrl || !form.apiKey}
                          style={{ flex: 2, padding: '7px 0', border: `1px solid ${t.ink}`, background: t.ink, color: t.paper, fontFamily: t.fontMono, fontSize: 9, cursor: 'pointer', textTransform: 'uppercase', opacity: (!form.name||!form.modelId||!form.apiUrl||!form.apiKey) ? 0.4 : 1 }}>确认添加</button>
                      </div>
                    </div>
                  )}
                </div>
                </div>
              </React.Fragment>
            )}

            {tab === 'model' && modelStore && (
              <div style={{ pointerEvents: canModelConfig ? 'auto' : 'none', opacity: canModelConfig ? 1 : 0.55 }}>
                <ServerKeySection t={t} inp={inp} secHdr={secHdr}/>
              </div>
            )}

            {tab === 'prompt' && (
              <React.Fragment>
                <div>
                  <div style={secHdr}>基础 System Prompt（预设专业版）</div>
                  <div style={{ fontFamily: t.fontCN, fontSize: 11, color: t.mute, marginBottom: 10, lineHeight: 1.6 }}>
                    以下为每次生成时自动注入的基础指令，包含角色定义、写作原则、约束、可视化规则和质量自查层。语言/语气/风格/章节数由 Toolbar 动态注入。
                  </div>
                  <textarea readOnly value={BASE_SYSTEM_PROMPT}
                    style={{ ...inp, minHeight: 260, resize: 'vertical', lineHeight: 1.55, fontFamily: t.fontMono, fontSize: 10, color: t.mute, background: t.faint }}/>
                </div>
                <div>
                  <label style={lbl}>自定义追加指令</label>
                  <textarea value={modelStore?.systemPromptExtra || ''} onChange={e => modelStore?.setSystemPromptExtra(e.target.value)}
                    placeholder="在基础指令后追加的自定义内容（可选），如：每章结尾加一个关键词小结"
                    style={{ ...inp, minHeight: 80, resize: 'vertical', lineHeight: 1.55 }}/>
                  <div style={{ fontFamily: t.fontMono, fontSize: 8, color: t.mute, marginTop: 3 }}>追加内容将嵌入 &lt;custom&gt; 标签，附加在基础指令末尾</div>
                </div>
                <LanguageManager t={t} inp={inp} secHdr={secHdr} toolbarStore={toolbarStore}/>
              </React.Fragment>
            )}

            {tab === 'memory' && (
              <MemorySettings t={t} inp={inp} lbl={lbl} secHdr={secHdr}/>
            )}

            {tab === 'export' && (
              <React.Fragment>
                <div style={secHdr}>导出报告</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {EXPORT_FORMATS_SETTINGS.map(f => (
                    <button key={f.k} type="button" onClick={() => setExportFmt(f.k)}
                      style={{ padding: '7px 12px', border: `1.5px solid ${exportFmt === f.k ? t.ink : t.rule}`, background: exportFmt === f.k ? t.ink : 'transparent', color: exportFmt === f.k ? t.paper : t.ink, fontFamily: t.fontMono, fontSize: 9, letterSpacing: 0.8, cursor: 'pointer', textTransform: 'uppercase' }}>
                      {f.en}
                    </button>
                  ))}
                </div>
                <div style={{ fontFamily: t.fontCN, fontSize: 11, color: t.mute }}>
                  {EXPORT_FORMATS_SETTINGS.find(f => f.k === exportFmt)?.cn || ''}
                </div>
                {exportSel.size > 1 && ['json','md'].includes(exportFmt) && (
                  <div style={{ display: 'flex', gap: 0, border: `1px solid ${t.rule}`, alignSelf: 'flex-start' }}>
                    {[{k:'combined',l:'合并为一份'},{k:'separate',l:'分别导出'}].map(m => (
                      <button key={m.k} type="button" onClick={() => setExportMode(m.k)}
                        style={{ padding: '5px 12px', border: 'none', borderRight: m.k==='combined' ? `1px solid ${t.rule}` : 'none', background: exportMode === m.k ? t.ink : 'transparent', color: exportMode === m.k ? t.paper : t.mute, fontFamily: t.fontMono, fontSize: 9, letterSpacing: 0.5, cursor: 'pointer' }}>
                        {m.l}
                      </button>
                    ))}
                  </div>
                )}
                <ReportList sel={exportSel} setSel={setExportSel}/>
                {exportStatus !== 'idle' && (
                  <div style={{ padding: '8px 12px', background: exportStatus === 'error' ? '#fef2f2' : t.faint, border: `1px solid ${exportStatus === 'error' ? '#dc2626' : t.rule}`, fontFamily: t.fontMono, fontSize: 10, color: exportStatus === 'error' ? '#dc2626' : '#2a8c5c' }}>
                    {exportStatus === 'loading' ? '处理中…' : exportStatusMsg}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Btn t={t} size="md" primary onClick={doExport} disabled={exportSel.size === 0 || exportStatus === 'loading'}>
                    {exportStatus === 'loading' ? '处理中…' : `${['notion','link'].includes(exportFmt) ? '⎘ 复制' : '↓ 下载'} ${exportFmt.toUpperCase()}（${exportSel.size} 份）`}
                  </Btn>
                </div>
              </React.Fragment>
            )}

            {tab === 'clear' && (
              <React.Fragment>
                <div style={secHdr}>清除本地数据</div>
                <ReportList sel={clearSel} setSel={setClearSel}/>
                {clearToast && (
                  <div style={{ padding: '8px 12px', background: '#f0fdf4', border: '1px solid #86efac', fontFamily: t.fontMono, fontSize: 10, color: '#16a34a' }}>
                    ✓ {clearToast}
                  </div>
                )}
                {confirmingClear ? (
                  <div style={{ padding: '14px 16px', border: '1.5px solid #dc2626', background: '#fef2f2' }}>
                    <div style={{ fontFamily: t.fontCN, fontSize: 13, color: '#dc2626', fontWeight: 600, marginBottom: 10 }}>确认删除 {clearSel.size} 份报告？此操作不可撤销。</div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button type="button" onClick={() => setConfirmingClear(false)}
                        style={{ flex: 1, padding: '8px 0', border: `1px solid ${t.rule}`, background: 'transparent', fontFamily: t.fontMono, fontSize: 9, color: t.mute, cursor: 'pointer', textTransform: 'uppercase' }}>取消</button>
                      <button type="button" onClick={doConfirmClear}
                        style={{ flex: 2, padding: '8px 0', border: '1.5px solid #dc2626', background: '#dc2626', color: '#fff', fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 11, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}>确认删除</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={doClear} disabled={clearSel.size === 0}
                      style={{ padding: '10px 16px', border: `1.5px solid ${clearSel.size ? '#dc2626' : t.rule}`, background: clearSel.size ? '#dc2626' : 'transparent', color: clearSel.size ? '#fff' : t.mute, fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 11, letterSpacing: 1.3, cursor: clearSel.size ? 'pointer' : 'not-allowed', textTransform: 'uppercase', opacity: clearSel.size ? 1 : 0.5 }}>
                      删除所选 {clearSel.size} 份报告
                    </button>
                  </div>
                )}
              </React.Fragment>
            )}

            {tab === 'permission' && (
              <React.Fragment>
                <div>
                  <div style={secHdr}>当前角色</div>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
                    {ROLES.map(r => (
                      <div key={r.k} onClick={() => saveRole(r.k)} style={{ flex: 1, padding: '12px 14px', cursor: 'pointer', border: `1.5px solid ${role === r.k ? r.color : t.rule}`, background: role === r.k ? r.color + '12' : 'transparent', transition: 'all 0.12s' }}>
                        <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 12, color: role === r.k ? r.color : t.ink }}>{r.label}</div>
                        <div style={{ fontFamily: t.fontCN, fontSize: 11, color: t.mute, marginTop: 5, lineHeight: 1.5 }}>{r.desc}</div>
                        {role === r.k && <div style={{ fontFamily: t.fontMono, fontSize: 8, color: r.color, marginTop: 6, letterSpacing: 0.5 }}>▶ 当前角色</div>}
                      </div>
                    ))}
                  </div>
                  <div style={{ ...secHdr, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>权限对照表</span>
                    <span style={{ fontFamily: t.fontMono, fontSize: 8, color: t.accent, letterSpacing: 0.5, textTransform: 'none', fontWeight: 400 }}>点击单元格可切换</span>
                  </div>
                  <div style={{ border: `1px solid ${t.rule}` }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px 64px 64px', padding: '7px 12px', background: t.faint, fontFamily: t.fontMono, fontSize: 9, letterSpacing: 0.8, color: t.mute, textTransform: 'uppercase', borderBottom: `1px solid ${t.rule}` }}>
                      <span>功能</span><span style={{ textAlign: 'center' }}>管理员</span><span style={{ textAlign: 'center' }}>编辑</span><span style={{ textAlign: 'center' }}>查看</span>
                    </div>
                    {PERM_TABLE.map((row, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 64px 64px 64px', padding: '9px 12px', borderBottom: i < PERM_TABLE.length-1 ? `1px solid ${t.rule}` : 'none' }}>
                        <span style={{ fontFamily: t.fontCN, fontSize: 12, color: t.ink }}>{row.feature}</span>
                        {['admin','editor','viewer'].map(rk => {
                          const on = permConfig[rk]?.[row.key] !== undefined ? permConfig[rk][row.key] : row[rk];
                          return (
                            <span key={rk} onClick={() => togglePerm(rk, row.key)}
                              style={{ textAlign: 'center', fontSize: 13, cursor: 'pointer', color: on ? '#2a8c5c' : t.mute, userSelect: 'none' }}>
                              {on ? '✓' : '—'}
                            </span>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 8, fontFamily: t.fontMono, fontSize: 8, color: t.mute }}>更改即时生效并保存到本地</div>
                </div>
              </React.Fragment>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function UserMenu({ t, tweaks, setTweak, modelStore, toolbarStore, outlineMode, setOutlineMode, researchMode, setResearchMode, setRoute }) {
  const { user, team, role, signOut } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [section, setSection] = React.useState(null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const ref = React.useRef(null);
  const tw = tweaks || {};
  const [profile, setProfile] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('atlas_user_profile') || '{}'); } catch { return {}; }
  });
  const saveProfile = (p) => { setProfile(p); try { localStorage.setItem('atlas_user_profile', JSON.stringify(p)); } catch {} };
  const initials = profile.displayName ? profile.displayName.slice(0,2).toUpperCase() : 'JL';
  const [draftProfile, setDraftProfile] = React.useState({});
  const [profileSaved, setProfileSaved] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSection(null); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  React.useEffect(() => {
    if (section === 'profile') { setDraftProfile({ ...profile }); setProfileSaved(false); }
  }, [section]);

  const toggleSec = (k) => setSection(s => s === k ? null : k);

  const ACCENT_OPTS = [
    { v:'red',         hex:'#e5251d' },
    { v:'amber',       hex:'#c2540a' },
    { v:'forest',      hex:'#1f6f44' },
    { v:'cobalt',      hex:'#1d4ed8' },
    { v:'rose',        hex:'#e11d48' },
    { v:'violet',      hex:'#7c3aed' },
    { v:'teal',        hex:'#0d9488' },
    { v:'gold',        hex:'#b45309' },
    { v:'grad_sunset', gradient:'linear-gradient(135deg, #f97316, #e11d48)' },
    { v:'grad_aurora', gradient:'linear-gradient(135deg, #0d9488, #7c3aed)' },
    { v:'grad_ocean',  gradient:'linear-gradient(135deg, #0ea5e9, #4338ca)' },
  ];
  const curAccent = tw.accent || 'red';
  const curAccentOpt = ACCENT_OPTS.find(a => a.v === curAccent);
  const accentLabel = curAccent.replace('grad_','').toUpperCase();
  const accentKind = curAccentOpt?.gradient ? 'GRADIENT' : 'SOLID';

  const MRow = ({ label, sub, isOpen, onClick, arrow }) => (
    <div onPointerDown={(e) => { e.preventDefault(); onClick && onClick(); }} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 16px', cursor:'pointer', background: isOpen ? t.faint : 'transparent', userSelect:'none' }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:'Noto Sans SC', fontSize:12, fontWeight:600, color:t.ink }}>{label}</div>
        {sub && <div style={{ fontFamily:t.fontMono, fontSize:9, color:t.mute, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sub}</div>}
      </div>
      {isOpen !== undefined && !arrow && <span style={{ fontFamily:t.fontMono, fontSize:8, color:t.mute, flexShrink:0 }}>{isOpen ? '▲' : '▼'}</span>}
      {arrow && <span style={{ fontFamily:t.fontMono, fontSize:11, color:t.mute, flexShrink:0 }}>›</span>}
    </div>
  );

  return (
    <div ref={ref} style={{ position:'relative', userSelect:'none', flexShrink:0 }}>
      <div onClick={() => { setOpen(o => !o); if (open) setSection(null); }} style={{
        width:30, height:30, borderRadius:'50%',
        border:`1.5px solid ${open ? t.accent : t.ink}`,
        background: open ? t.accentGradient || t.accent : t.paper, color: open ? t.paper : t.ink,
        fontFamily:t.fontDisplay, fontWeight:800, fontSize:10,
        display:'flex', alignItems:'center', justifyContent:'center',
        cursor:'pointer', overflow:'hidden', transition:'all 0.15s',
      }}>
        {profile.avatarUrl ? <img src={profile.avatarUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : initials}
      </div>

      {open && (
        <div style={{ position:'absolute', top:38, right:0, width:264, background:t.paper, border:`1.5px solid ${t.ink}`, boxShadow:`3px 3px 0 rgba(0,0,0,0.12)`, zIndex:9999 }}>
          <div style={{ padding:'12px 16px 10px', borderBottom:`1px solid ${t.rule}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:t.accentGradient||t.accent, color:t.paper, fontFamily:t.fontDisplay, fontWeight:800, fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                {profile.avatarUrl ? <img src={profile.avatarUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : initials}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:t.fontDisplay, fontWeight:800, fontSize:13, color:t.ink }}>{profile.displayName || 'Atlas User'}</div>
                <div style={{ fontFamily:t.fontMono, fontSize:9, color:t.mute, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{profile.email || 'lvhaocheng0726@gmail.com'}</div>
              </div>
            </div>
          </div>
          <div style={{ padding:'4px 0' }}>
            <MRow label="外观偏好" sub={`${tw.theme === 'cream' ? '浅色' : '深色'} · ${accentLabel}`} isOpen={section==='appearance'} onClick={() => toggleSec('appearance')}/>
            {section === 'appearance' && (
              <div style={{ padding:'10px 16px 14px', background:t.faint, borderTop:`1px solid ${t.rule}` }}>
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontFamily:t.fontMono, fontSize:9, color:t.mute, letterSpacing:1.1, marginBottom:5 }}>THEME</div>
                  <div style={{ display:'flex', gap:6 }}>
                    {[{v:'cream',label:'浅色'},{v:'slate',label:'深色'}].map(opt => (
                      <div key={opt.v} onClick={() => setTweak && setTweak('theme', opt.v)} style={{ flex:1, padding:'5px 0', textAlign:'center', cursor:'pointer', border:`1.5px solid ${tw.theme===opt.v ? t.accent : t.rule}`, background: tw.theme===opt.v ? t.accent : 'transparent', color: tw.theme===opt.v ? t.paper : t.ink, fontFamily:t.fontDisplay, fontSize:9, fontWeight:700, letterSpacing:0.8 }}>{opt.label}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily:t.fontMono, fontSize:9, color:t.mute, letterSpacing:1.1, marginBottom:6 }}>ACCENT COLOR</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:5 }}>
                    {ACCENT_OPTS.map(a => (
                      <div key={a.v} onClick={() => setTweak && setTweak('accent', a.v)} style={{ height:22, background: a.gradient || a.hex, cursor:'pointer', borderRadius:3, border: curAccent === a.v ? `2.5px solid ${t.ink}` : '2.5px solid transparent', transition:'border 0.1s', boxSizing:'border-box' }}/>
                    ))}
                  </div>
                  <div style={{ fontFamily:t.fontMono, fontSize:8, color:t.mute, marginTop:5, letterSpacing:0.8 }}>{accentLabel} · {accentKind}</div>
                </div>
              </div>
            )}
            <div style={{ height:1, background:t.rule, margin:'4px 0' }}/>
            <MRow label="编辑资料" sub={profile.displayName || 'Atlas User'} isOpen={section==='profile'} onClick={() => toggleSec('profile')}/>
            {section === 'profile' && (
              <div style={{ padding:'10px 16px 14px', background:t.faint, borderTop:`1px solid ${t.rule}` }}>
                {[{label:'显示名称',key:'displayName',ph:'Atlas User',mono:false},{label:'邮箱',key:'email',ph:'user@example.com',mono:true}].map(({label,key,ph,mono}) => (
                  <div key={key} style={{ marginBottom:8 }}>
                    <div style={{ fontFamily:t.fontMono, fontSize:9, color:t.mute, letterSpacing:1.1, marginBottom:3 }}>{label.toUpperCase()}</div>
                    <input value={draftProfile[key]||''} onChange={e => setDraftProfile(p => ({...p,[key]:e.target.value}))} placeholder={ph}
                      style={{ width:'100%', padding:'5px 8px', fontFamily: mono ? t.fontMono : 'Noto Sans SC', fontSize:12, border:`1px solid ${t.rule}`, background:t.paper, color:t.ink, outline:'none', boxSizing:'border-box' }}/>
                  </div>
                ))}
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <button onClick={() => { saveProfile(draftProfile); setProfileSaved(true); setTimeout(() => setProfileSaved(false), 2000); }}
                    style={{ padding:'5px 16px', background:t.ink, color:t.paper, border:'none', fontFamily:t.fontDisplay, fontWeight:700, fontSize:10, letterSpacing:1, textTransform:'uppercase', cursor:'pointer' }}>保存</button>
                  {profileSaved && <span style={{ fontFamily:t.fontMono, fontSize:9, color:'#16a34a', letterSpacing:0.5 }}>已保存 ✓</span>}
                </div>
              </div>
            )}
            <div style={{ height:1, background:t.rule, margin:'4px 0' }}/>
            {team ? (
              <MRow label={team.name} sub={`团队 · ${role === 'admin' ? '管理员' : role === 'editor' ? '编辑' : '只读'}`} arrow
                onClick={() => { setOpen(false); setSection(null); setRoute?.('team'); }}/>
            ) : (
              <MRow label="创建团队" sub="与他人协作，共享密钥与知识库" arrow
                onClick={() => { setOpen(false); setSection(null); setRoute?.('team'); }}/>
            )}
            <div style={{ height:1, background:t.rule, margin:'4px 0' }}/>
            <MRow label="设置" sub="模型 · 导出 · 权限" arrow onClick={() => { setOpen(false); setSection(null); setSettingsOpen(true); }}/>
            <div style={{ height:1, background:t.rule, margin:'4px 0' }}/>
            <div onClick={() => { setOpen(false); signOut(); }}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 16px', cursor:'pointer', userSelect:'none' }}
              onMouseEnter={e => e.currentTarget.style.background = t.faint}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div>
                <div style={{ fontFamily:t.fontCN, fontSize:12, color:t.mute }}>退出登录</div>
                <div style={{ fontFamily:t.fontMono, fontSize:9, color:t.mute, marginTop:1, letterSpacing:0.5 }}>{user?.email || ''}</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop:`1px solid ${t.rule}`, padding:'6px 16px', fontFamily:t.fontMono, fontSize:8, color:t.mute, letterSpacing:0.8 }}>ATLAS ESSAYS · VOL.04 · © 2026</div>
        </div>
      )}

      {settingsOpen && <SettingsModal t={t} modelStore={modelStore} toolbarStore={toolbarStore} outlineMode={outlineMode} setOutlineMode={setOutlineMode} researchMode={researchMode} setResearchMode={setResearchMode} onClose={() => setSettingsOpen(false)}/>}

    </div>
  );
}



// ── Page footer: thin issue bar -----------------------------------------
function IssueFooter({ t, page = '01', section = 'COVER', issue = 241 }) {
  const cell = { whiteSpace: 'nowrap', flexShrink: 0 };
  const dot = { ...cell, opacity: 0.5 };
  return (
    <div style={{
      borderTop: `1px solid ${t.ink}`, background: t.paper,
      padding: '0 36px', height: 32, flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 14,
      fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1, color: t.mute, textTransform: 'uppercase',
      overflow: 'hidden',
    }}>
      <span style={cell}>PAGE {page}</span>
      <span style={dot}>·</span>
      <span style={cell}>{section}</span>
      <span style={{ flex: 1 }}/>
      <span style={cell}>Atlas v0.41</span>
      <span style={dot}>·</span>
      <span style={cell}>An essay engine</span>
      <span style={{ flex: 1 }}/>
      <span style={cell}>ISSUE № {issue}</span>
      <span style={dot}>·</span>
      <span style={cell}>2026·MAY</span>
    </div>
  );
}

// ── Small primitives ----------------------------------------------------

function LiveDot({ size = 8, color }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, background: color || '#e5251d',
      borderRadius: size, flexShrink: 0, position: 'relative',
      boxShadow: `0 0 0 0 ${color || '#e5251d'}`, animation: 'essay-pulse 1.6s ease-out infinite',
    }}/>
  );
}

function Tag({ children, t, color, bg, accent = false, filled = false, style = {} }) {
  const fg = accent ? t.accent : (color || t.ink);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
      fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase',
      padding: '3px 7px', border: filled ? 'none' : `1px solid ${fg}`,
      background: filled ? fg : (bg || 'transparent'),
      color: filled ? t.paper : fg, lineHeight: 1,
      ...style,
    }}>{children}</span>
  );
}

function Btn({ children, t, primary = false, accent = false, size = 'md', onClick, disabled, style = {} }) {
  const sizes = {
    xs: { p: '5px 9px',  f: 9 },
    sm: { p: '7px 12px', f: 10 },
    md: { p: '10px 16px', f: 11 },
    lg: { p: '14px 22px', f: 13 },
  }[size];
  const fg = accent ? t.accent : t.ink;
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
        padding: sizes.p, fontSize: sizes.f,
        fontFamily: t.fontDisplay, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase',
        border: `1.5px solid ${fg}`,
        background: primary ? fg : t.paper,
        color: primary ? t.paper : fg,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        userSelect: 'none', transition: 'background 0.12s, color 0.12s, transform 0.08s',
        ...style,
      }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(1px)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >{children}</button>
  );
}

function Hairline({ t, color, vertical = false, opacity = 1 }) {
  return vertical
    ? <span style={{ width: 1, alignSelf: 'stretch', background: color || t.rule, opacity }}/>
    : <span style={{ height: 1, width: '100%', background: color || t.rule, opacity }}/>;
}

function Sup({ n, t, color }) {
  return (
    <sup style={{
      color: color || t.accent, fontFamily: t.fontMono, fontSize: 10,
      padding: '0 1px', fontWeight: 700,
    }}>[{n}]</sup>
  );
}

// Big bilingual head — EN kicker over CN title (or just EN)
function BilingualHead({ en, cn, t, size = 'lg', emphasis = '' }) {
  const sizes = {
    xs:  { en: 10, cn: 14, gap: 4 },
    sm:  { en: 11, cn: 18, gap: 4 },
    md:  { en: 12, cn: 26, gap: 6 },
    lg:  { en: 13, cn: 38, gap: 8 },
    xl:  { en: 14, cn: 52, gap: 10 },
    xxl: { en: 16, cn: 68, gap: 14 },
  }[size];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: sizes.gap }}>
      {en && (
        <div style={{
          fontFamily: t.fontDisplay, fontWeight: 800, fontSize: sizes.en,
          letterSpacing: 1.6, textTransform: 'uppercase', color: t.ink,
        }}>{en}</div>
      )}
      {cn && (
        <div style={{
          fontFamily: t.fontCN, fontWeight: 800, fontSize: sizes.cn,
          lineHeight: 1.05, letterSpacing: -0.5, color: t.ink,
          textWrap: 'balance', wordBreak: 'keep-all',
        }}>{cn}</div>
      )}
      {emphasis && (
        <div style={{
          fontFamily: t.fontSerif, fontStyle: 'italic', fontSize: sizes.cn * 0.45,
          color: t.mute, letterSpacing: 0,
        }}>{emphasis}</div>
      )}
    </div>
  );
}

// Metric pull-out: huge number + caption
function Metric({ value, en, cn, t, accent = false, big = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{
        fontFamily: t.fontDisplay, fontWeight: 800,
        fontSize: big ? 48 : 32, lineHeight: 0.95, letterSpacing: -1.4,
        color: accent ? t.accent : t.ink,
      }}>{value}</span>
      <span style={{
        fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', color: t.mute,
      }}>{en} · {cn}</span>
    </div>
  );
}

// Pull quote — italic serif emphasis block
function PullQuote({ children, t, attribution }) {
  return (
    <figure style={{ margin: '8px 0', padding: '20px 0', borderTop: `1px solid ${t.ink}`, borderBottom: `1px solid ${t.ink}` }}>
      <blockquote style={{
        margin: 0, fontFamily: t.fontSerif, fontStyle: 'italic',
        fontSize: 26, lineHeight: 1.3, color: t.ink, letterSpacing: -0.3,
      }}>“{children}”</blockquote>
      {attribution && (
        <figcaption style={{
          marginTop: 10, fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.2,
          color: t.mute, textTransform: 'uppercase',
        }}>— {attribution}</figcaption>
      )}
    </figure>
  );
}

// Figure placeholder — diagonal hatched rect with caption
function Figure({ t, label, caption, height = 200, type = 'chart' }) {
  return (
    <figure style={{ margin: '12px 0' }}>
      <div style={{
        width: '100%', height, border: `1px solid ${t.ink}`, position: 'relative',
        background: type === 'chart'
          ? `repeating-linear-gradient(135deg, ${t.faint} 0 6px, transparent 6px 12px), ${t.cardOn}`
          : t.cardOn,
        overflow: 'hidden',
      }}>
        {type === 'chart' && <FigureChart t={t}/>}
        {type === 'image' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: t.fontMono, fontSize: 11, color: t.mute, letterSpacing: 1, textTransform: 'uppercase',
          }}>◇ Image · {label}</div>
        )}
        <span style={{
          position: 'absolute', top: 8, left: 10,
          fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.2,
        }}>{label}</span>
      </div>
      {caption && (
        <figcaption style={{
          marginTop: 6, fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1,
          color: t.mute, textTransform: 'uppercase',
        }}>{caption}</figcaption>
      )}
    </figure>
  );
}

// Sample bar chart drawn inside a Figure
function FigureChart({ t }) {
  const bars = [
    { label: '10万以下', v: 8 },
    { label: '10-15万', v: 22 },
    { label: '15-20万', v: 38 },
    { label: '20-30万', v: 62, hi: true },
    { label: '30-50万', v: 28 },
    { label: '50万以上', v: 12 },
  ];
  const max = 70;
  return (
    <svg viewBox="0 0 600 200" preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <g transform="translate(60, 20)">
        {/* y-axis ticks */}
        {[0, 25, 50, 75].map(y => (
          <g key={y}>
            <line x1={-4} x2={540} y1={140 - (y / max) * 130} y2={140 - (y / max) * 130}
              stroke={t.rule} strokeWidth="0.5" strokeDasharray="2 3"/>
            <text x={-8} y={144 - (y / max) * 130} textAnchor="end"
              fontFamily={t.fontMono} fontSize="9" fill={t.mute}>{y}</text>
          </g>
        ))}
        {/* baseline */}
        <line x1={0} x2={540} y1={140} y2={140} stroke={t.ink} strokeWidth="1"/>
        {bars.map((b, i) => {
          const x = i * 90 + 10;
          const w = 70;
          const h = (b.v / max) * 130;
          return (
            <g key={b.label}>
              <rect x={x} y={140 - h} width={w} height={h}
                fill={b.hi ? t.accent : t.ink}/>
              <text x={x + w / 2} y={156} textAnchor="middle"
                fontFamily={t.fontCN} fontSize="11" fill={t.ink}>{b.label}</text>
              <text x={x + w / 2} y={140 - h - 6} textAnchor="middle"
                fontFamily={t.fontMono} fontSize="10" fontWeight="700" fill={b.hi ? t.accent : t.ink}>{b.v}%</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// Single marginalia entry — used in running screen
function MarginNote({ t, tag, cn, time, state = 'done', children }) {
  const live = state === 'live';
  const queued = state === 'queued';
  const ruleColor = live ? t.accent : (queued ? t.muteSoft : t.ink);
  return (
    <div style={{
      paddingLeft: 12, borderLeft: `2px solid ${ruleColor}`,
      display: 'flex', flexDirection: 'column', gap: 4,
      opacity: queued ? 0.5 : (state === 'done' && !live ? 0.72 : 1),
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.1, fontWeight: 700, color: live ? t.accent : t.ink }}>{tag}</span>
        {live && <LiveDot size={5} color={t.accent}/>}
        <span style={{ flex: 1 }}/>
        <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>{time}</span>
      </div>
      <span style={{ fontFamily: t.fontCN, fontSize: 11, lineHeight: 1.5, color: t.inkSoft }}>{cn}</span>
      {children}
    </div>
  );
}

Object.assign(window, {
  essayTokens, TopBar, IssueFooter, UserMenu,
  LiveDot, Tag, Btn, Hairline, Sup,
  BilingualHead, Metric, PullQuote, Figure, FigureChart, MarginNote,
  NAV_ITEMS,
});
// Home — magazine cover + working prompt input. The first thing users see.

const SAMPLE_PROMPTS = [
  '梳理 2025 年 Q1 国内咖啡赛道的融资动态，重点说说 Manner、库迪和挪瓦的新动向，给一份 2000 字的内部分析。',
  '用过去三个季度的销售数据，分析华南区不同品类的增长情况，输出 1,500 字的内部分析报告。',
  '帮我写一份关于"远程办公对一线城市租房市场影响"的研究报告，要有数据支撑。',
  '把这周团队的进展整理成一份周报，重点突出新启动的客户合作项目。',
];

const STARTERS = [
  {
    num: 'I.',
    en: 'Industry Scan',
    cn: '调研一个我没听过的赛道',
    sub: '我先扫一圈公开报道、社群讨论和融资数据，输出洞察。',
    minutes: '8-12 min',
    tag: 'RESEARCH',
    topicPrompt: '调研「家用清洁机器人」赛道，输出一篇约 2,200 字的内部分析报告。',
    sections: [
      { title: '核心结论（TL;DR）', req: '开头一句导语（≤30字）点明最重要的结构性变化；给出市场规模与增速数据；说明头部格局分化现状，谁在领跑、谁在掉队' },
      { title: '主要玩家分析', req: '分析头部3家各自竞争策略与差异化路径；穿插行业内部人士引述（引号+来源标注）；说明旗舰/中端/白牌价格带逻辑' },
      { title: '用户在说什么', req: '提炼高频好评关键词3个、差评关键词3个；指出一个被低估的细分人群及其需求特征与对应价格带' },
      { title: '接下来看什么', req: '两个值得追踪的行业信号各展开一段；最后一段简要提及海外机会' },
    ],
    prompt: `调研「家用清洁机器人」赛道，输出一篇 2,200 字的内部分析报告，严格按以下四节结构展开：

第一节 · 核心结论（TL;DR）
开头一句导语，直接点明赛道最重要的结构性变化（不超过 30 字）。随后两段：第一段给出市场规模与增速数据；第二段说明头部格局的分化现状，谁在领跑、谁在掉队。

第二节 · 主要玩家分析
分析石头科技、追觅、科沃斯三家各自的竞争策略与差异化路径。穿插一段行业内部人士视角的引述（用引号 + 来源标注），说明价格带逻辑：旗舰 8000 元以上 / 中端 2000–5000 元 / 白牌 1500 元以下各自的生存法则。

第三节 · 用户在说什么
基于小红书与电商评论提炼用户洞察：高频好评关键词、高频差评关键词（各列 3 个）；指出一个被品牌方低估的细分人群，说明其需求特征与对应价格带。

第四节 · 接下来看什么
列出两个值得持续追踪的行业信号，各用一段展开；最后一段简要提及海外机会。

写作要求：分析性语气，结论先行，数据支撑，观点鲜明。重要数据用 §1 §2 §3 标注脚注编号。直接输出报告正文，不要输出标题、前言或任何说明文字。`,
    _reportData: {
      meta: { issue: '№ 241', date: '2026 · MAY · 27', words: '2,240', sources: 8, reading: '5 min', category: 'INDUSTRY · 行业研究', titleEn: 'Bots, brushes, and the bathroom.', titleCn: '机器人、刷头与浴室', subtitle: '家用清洁机器人赛道 2025 全景速记' },
      metrics: [
        { value: '¥312亿', en: 'MARKET', cn: '2025年市场规模', accent: false },
        { value: '+29%',   en: 'YOY',    cn: '同比增长',       accent: true },
        { value: '3层',    en: 'TIERS',  cn: '明显价格分层',   accent: false },
        { value: '22%',    en: 'PENET',  cn: '家庭渗透率',     accent: false },
      ],
      sections: [
        { id: 's1', num: '01', en: 'TL;DR', cn: '核心结论', blocks: [
          { kind: 'lede', text: '扫地机器人不再是终点——清洁赛道正在从「一个产品」变成「一套系统」，谁能做到扫、拖、洗、烘一体，谁才真正拿到下一个增长周期的门票。' },
          { kind: 'p', text: '2025 年国内家用清洁机器人市场预计突破 312 亿元§1，同比增长约 29%。但增速的背后，结构性分化已经出现：头部三家（石头、追觅、科沃斯）合计份额超过 73%，中腰部品牌正面临被清出市场的压力。' },
          { kind: 'p', text: '用户不再为单一功能付费。小红书上的高互动帖子里，「全能基站」「自清洁」「热风烘干」是出现频率最高的三个词——这意味着产品定义权从「扫地」转移到了「免维护」。§2' },
        ]},
        { id: 's2', num: '02', en: 'The players', cn: '谁在场', blocks: [
          { kind: 'p', text: '石头科技依然是技术端最被认可的玩家——S8 MaxV Ultra 的避障算法和自动倒尘被核心用户反复提及§3。追觅则在旗舰机型之外，把价格下探到 2,000–3,000 元区间，试图同时打高端和中高端。科沃斯的策略有所不同：它在「商用清洁」上加大投入，用 ToB 的稳定毛利补贴 ToC 的价格战。' },
          { kind: 'quote', text: '这个品类现在的核心矛盾不是「扫不干净」，而是「用户不愿意自己洗拖布」——谁解决了这个问题，谁就赢了。', by: '某头部品牌产品总监 · 闭门沟通' },
          { kind: 'p', text: '价格带上，8,000 元以上的旗舰区间是各家必争之地，因为这里的用户对品牌忠诚度高、口碑效应强、溢价空间充足。1,500 元以下则几乎成了白牌和代工品牌的残酷竞技场，毛利率普遍低于 12%§4。' },
        ]},
        { id: 's3', num: '03', en: 'What users say', cn: '用户在说什么', blocks: [
          { kind: 'p', text: '分析 218 条小红书高互动内容后，几个结论浮出水面：「买了后悔」和「买了推荐」的比例几乎都在 30% 以上——说明品类的信息不对称问题依然严重。「噪音大」和「识图率差」是最高频的负面关键词，排在「清洁不干净」之前。' },
          { kind: 'figure', label: 'Fig. 1 · 用户好评 / 差评关键词分布', caption: '数据来源：小红书讨论抓取 · 2025 Q1 218 条高互动内容' },
          { kind: 'p', text: '租房群体是被低估的增量市场。这部分用户倾向于购买 2,000–3,500 元区间的产品——既不愿在「不属于自己的空间」投入太多，又真实需要清洁力。追觅和石头的子品牌都在悄悄开发针对这个群体的型号。§5' },
        ]},
        { id: 's4', num: '04', en: 'What to watch', cn: '接下来看什么', blocks: [
          { kind: 'p', text: '两个值得持续追踪的信号：其一，全能基站的「养护服务」订阅化——石头今年开始试验「免维护套餐」，如果续费率超过 40%，意味着软件服务将成为新的利润层。其二，AI 视觉在家庭场景的落地速度，将直接决定下一代旗舰机型的定价权。' },
          { kind: 'p', text: '海外市场是另一条没有被充分讨论的增长线——石头在欧洲的增速已连续三个季度超过 45%，价格还能比国内高 20–30%。追觅的东南亚布局刚刚起步，竞争格局远比国内宽松。§6' },
        ]},
      ],
      refs: [
        { n: '[1]', src: 'IDC', title: '2025 中国家用清洁机器人市场追踪', url: 'idc.com', date: '2025.03.15' },
        { n: '[2]', src: '小红书', title: '清洁机器人用户讨论分析 · Q1', url: 'xiaohongshu.com', date: '2025.04.10' },
        { n: '[3]', src: '36 氪', title: '石头科技产品策略深度解析', url: '36kr.com', date: '2025.03.28' },
        { n: '[4]', src: '国信证券', title: '清洁电器行业深度报告', url: 'guosen.com.cn', date: '2025.02.28' },
        { n: '[5]', src: '追觅科技', title: '2025 年品牌策略投资者说明', url: 'dreame.com', date: '2025.04.20' },
        { n: '[6]', src: '石头科技', title: '2025 Q1 财报 & 海外业务说明', url: 'roborock.com', date: '2025.04.30' },
      ],
    },
  },
  {
    num: 'II.',
    en: 'Data Analysis',
    cn: '把这堆数据读懂',
    sub: '上传或连接表格，我做清洗、聚类和洞察，附图。',
    minutes: '5-8 min',
    tag: 'DATA',
    topicPrompt: '分析过去四个季度的门店销售数据，按城市等级分群，输出约 1,400 字的内部分析报告。',
    sections: [
      { title: '核心结论（TL;DR）', req: '开头一句导语直接点明增长分布的关键事实；整体增速与各分群实际增速的落差；新增量 vs 存量有机增长的区别' },
      { title: '分群拆解分析', req: '逐层分析各分群表现（驱动因素、潜力、天花板）；穿插运营层面内部判断引述（引号+来源标注）' },
      { title: '季节性与周期性规律', req: '分析各时段节奏：峰值与淡旺季效应；同比数据说明趋势是否在强化或减弱' },
      { title: '建议与行动项', req: '3条具体可执行建议，每条说明：谁做、做什么、大概时间节点' },
    ],
    prompt: `分析过去四个季度的门店销售数据，按城市等级分群，输出约 1,400 字的内部分析报告，严格按以下四节结构展开：

第一节 · 核心结论（TL;DR）
开头一句导语，直接点明增长分布的关键事实（如"一线扛大旗，三四线在吃老本"）。随后说明：整体增速与各城市等级实际增速的落差；新店效应 vs 老店有机增长的区别。

第二节 · 城市等级分层分析
逐层分析一线城市（客单价变化、增速驱动因素）、新一线城市（成都 / 杭州 / 武汉等，潜力与现状）、三四线城市（增长天花板在哪里）；穿插一段来自运营层面的内部判断引述（用引号 + 来源标注）。

第三节 · 季节性规律
分析 Q1–Q4 各季度节奏：哪个季度是峰值、淡旺季效应是否在减弱；用同比数据对比说明趋势。

第四节 · 建议与行动项
三条具体可执行的业务建议，每条一句话，附明确方向（谁做、做什么、大概时间节点）。

写作要求：数据分析性语气，结论先行，不模棱两可。重要数据用 §1 §2 §3 标注。直接输出报告正文，不要输出标题。`,
    _reportData: {
      meta: { issue: '№ 241', date: '2026 · MAY · 27', words: '1,380', sources: 4, reading: '3 min', category: 'DATA · 数据分析', titleEn: 'The stores that didn\'t blink.', titleCn: '没有眨眼的门店', subtitle: '过去四季度门店销售数据分群分析' },
      metrics: [
        { value: '+18%',    en: 'OVERALL', cn: '整体销售增长',   accent: false },
        { value: '+34%',    en: 'TIER-1',  cn: '一线城市增速',   accent: true },
        { value: '+3.2%',   en: 'TIER-3',  cn: '三四线城市增速', accent: false },
        { value: 'Q4',      en: 'PEAK',    cn: '年度峰值季度',   accent: false },
      ],
      sections: [
        { id: 's1', num: '01', en: 'TL;DR', cn: '核心结论', blocks: [
          { kind: 'lede', text: '增长不是均匀分布的——一线城市的旗舰门店扛起了 62% 的总增量，三四线门店同比持平，事实上是在靠口碑存活。' },
          { kind: 'p', text: '过去四个季度，公司整体销售额同比增长 18%§1。但拆开来看，北上广深旗舰店的增幅接近 34%，而三四线城市门店平均增速只有 3.2%——两类门店在同一张财报里共存，讲的却是完全不同的故事。' },
          { kind: 'p', text: '新店效应是另一个影响因素。Q3 和 Q4 新开的 12 家门店贡献了整体增长的 21%——剥离新店后，老店的有机增长约在 14% 左右，这个数字其实相当健康。§2' },
        ]},
        { id: 's2', num: '02', en: 'City-tier breakdown', cn: '城市分层分析', blocks: [
          { kind: 'p', text: '一线城市的门店单均产出最高，但增速的来源耐人寻味——不是客流增长，而是客单价提升。Q4 的客单价同比提升了 11.2%，主要由新品和组合套餐拉动。这说明一线用户的消费升级意愿仍然强烈，产品策略的边际效果好。§3' },
          { kind: 'quote', text: '三四线门店最大的问题不是不赚钱，而是增长上限太低——本地客群基本盘稳固，但向上拓展的空间几乎没有。', by: '区域运营负责人 · 内部季度总结' },
          { kind: 'p', text: '新一线城市（成都、杭州、武汉）是最值得重点关注的区域：增速 22%，介于一线和三四线之间，坪效和客单价的提升空间仍然充足。Q1 有两家新一线门店的月均销售额首次超过了某些一线旗舰店。' },
        ]},
        { id: 's3', num: '03', en: 'Seasonality', cn: '季节性规律', blocks: [
          { kind: 'figure', label: 'Fig. 1 · 四季度销售趋势（按城市等级分组）', caption: '数据来源：内部销售数据库 · 近 16 个月滚动统计' },
          { kind: 'p', text: 'Q4 是毫无疑义的峰值季度——所有城市等级的门店都表现正增长。但值得注意的是，Q1 的同比下滑幅度在缩小——去年 Q1 同比下滑了 8%，今年只有 3.1%，说明春节后的淡季效应正在弱化。§4' },
        ]},
        { id: 's4', num: '04', en: 'Recommendations', cn: '建议与行动项', blocks: [
          { kind: 'p', text: '三条行动建议：第一，把新一线城市验证成功的产品组合策略迅速复制到其他城市；第二，三四线门店增加本地爆款和区域限定策略，减少统一 SKU 投放；第三，Q1 淡季效应减弱是积极信号，建议提前锁定 Q1 促销资源，争取连续两年缩小淡季缺口。' },
        ]},
      ],
      refs: [
        { n: '[1]', src: '内部数据库', title: '2024Q2–2025Q1 门店销售汇总', url: 'internal', date: '2025.04.30' },
        { n: '[2]', src: '内部数据库', title: '新店 vs 老店增长对照分析', url: 'internal', date: '2025.04.30' },
        { n: '[3]', src: '内部数据库', title: '客单价趋势及品类贡献报告', url: 'internal', date: '2025.04.30' },
        { n: '[4]', src: '内部数据库', title: '季节性调整模型 · 月度滚动', url: 'internal', date: '2025.04.30' },
      ],
    },
  },
  {
    num: 'III.',
    en: 'Weekly Brief',
    cn: '给老板写一份 10 分钟读完的周报',
    sub: '我会自动整理上周日程、文档和项目进展。',
    minutes: '2-4 min',
    tag: 'INTERNAL',
    topicPrompt: '帮我写一份本周工作周报，约 1,000 字。',
    sections: [
      { title: '本周进展', req: '开头一句导语点明本周最重要的一件事（≤25字）；分块说明关键客户/合作进展、已上线功能（附初步数据表现）' },
      { title: '本周遇到的问题', req: '具体描述问题：发生时间、影响范围（用户数）、根本原因；穿插内部复盘关键判断（引号+发言人·场合标注）；善后处理情况' },
      { title: '下周计划', req: '3件事，每件格式：事项描述 + 时间节点 + 负责人' },
    ],
    prompt: `帮我写一份本周工作周报，约 1,000 字，严格按以下三节结构展开：

第一节 · 本周进展
开头一句导语，直接点明本周最重要的一件事（不超过 25 字）。随后分三块：1）客户 A 的合作进展——本周第几次沟通、对方态度出现了什么变化、卡点在哪里、下一步动作；2）上线的第一个功能——功能名称、上线范围、初步数据表现；3）上线的第二个功能——同上格式。

第二节 · 本周遇到的问题
具体描述问题：发生时间、影响范围（用户数）、根本原因。穿插一段来自内部复盘会议的关键判断（用引号 + 发言人 · 场合标注）。最后说明善后处理情况和受影响用户的补偿方案。

第三节 · 下周计划
三件事，每件一句话，格式：事项描述 + 时间节点 + 负责人。

写作要求：内部报告风格，简洁直接，不废话，领导扫一遍就能抓住重点。重要事项来源或备注用 §1 §2 §3 标注。直接输出报告正文，不要输出标题。`,
    _reportData: {
      meta: { issue: '№ 241', date: '2026 · MAY · 27', words: '980', sources: 3, reading: '2 min', category: 'INTERNAL · 内部报告', titleEn: 'Seven days. Three wins.', titleCn: '七天，三件事', subtitle: '本周工作总结与关键进展' },
      metrics: [
        { value: '3',    en: 'WINS',     cn: '重要进展', accent: true },
        { value: '2',    en: 'FEATURES', cn: '功能上线', accent: false },
        { value: '1',    en: 'BLOCKER',  cn: '待解决问题', accent: false },
        { value: '下周一', en: 'NEXT',   cn: '关键节点', accent: false },
      ],
      sections: [
        { id: 's1', num: '01', en: 'This week', cn: '本周进展', blocks: [
          { kind: 'lede', text: '本周最大的突破不是产品——而是客户 A 终于松口，愿意进入合同审核阶段。这件事拖了六周，现在看到了终点。' },
          { kind: 'p', text: '客户 A 合作进展：经过周三第 4 次沟通，对方采购负责人确认将合同提交法务部审核，预计 5 个工作日内反馈。双方在账期上仍有小分歧（我们希望 30 天，对方倾向 45 天），这一点在合同审核阶段还需要再谈。§1' },
          { kind: 'p', text: '上线功能：本周完成了两个功能的灰度发布。第一个是报告导出功能（PDF / 图片），已在 200 名内测用户中开放，首日导出次数超预期 40%。第二个是数据源自动同步，连接了三个主要 API，目前运行稳定。§2' },
        ]},
        { id: 's2', num: '02', en: 'The problem', cn: '本周遇到的问题', blocks: [
          { kind: 'p', text: '服务器在周四凌晨出现约 23 分钟的异常波动，影响了约 340 名用户的正常使用。原因已定位：数据源同步功能上线后，并发处理的队列配置有误，导致部分请求超时。技术团队已当天修复并优化了队列参数。' },
          { kind: 'quote', text: '这次的问题不是偶发，是配置没有经过充分压测就上线了——下次新功能上线前，压测必须作为硬性门槛。', by: 'CTO · 周五内部复盘' },
          { kind: 'p', text: '340 名受影响用户中，有 17 名通过客服渠道反馈了问题，已全部得到及时回复和补偿方案（延长会员 7 天）。受影响的企业客户中，无人提出合同层面的追责。§3' },
        ]},
        { id: 's3', num: '03', en: 'Next week', cn: '下周计划', blocks: [
          { kind: 'p', text: '下周三件事：第一，跟进客户 A 合同，务必在周三前拿到法务反馈；第二，报告导出功能全量开放，同时启动「分享链接」功能的开发排期；第三，针对本周的服务器问题，完善压测流程并输出文档，下周五前提交技术委员会审阅。' },
        ]},
      ],
      refs: [
        { n: '[1]', src: 'CRM', title: '客户 A 沟通记录 · 本周', url: 'internal', date: '2025.05.21' },
        { n: '[2]', src: '产品日志', title: 'v2.3.1 & v2.3.2 上线记录', url: 'internal', date: '2025.05.20' },
        { n: '[3]', src: '客服系统', title: '周四故障用户反馈汇总', url: 'internal', date: '2025.05.22' },
      ],
    },
  },
  {
    num: 'IV.',
    en: 'Competitor Teardown',
    cn: '拆一拆这个对手',
    sub: '产品、定价、增长、舆情，四个角度做对比。',
    minutes: '10-15 min',
    tag: 'RESEARCH',
    topicPrompt: '对 Notion AI 和 ChatGPT for Teams 进行竞品对比分析，输出约 2,200 字的内部报告。',
    sections: [
      { title: '核心结论（TL;DR）', req: '开头一句导语点明两者的本质差异（工作流哲学层面，非功能层面）；定价对比与综合TCO分析；各自最适合的团队类型一句话总结' },
      { title: '产品功能对比', req: '竞品A核心竞争力（优势与局限）；竞品B核心竞争力（优势与局限）；穿插真实用户使用体感引述（引号+来源标注）' },
      { title: '用户口碑与增长', req: '对比权威平台评分及成因；各自高频差评关键词各2-3个；增长数据与市场渗透趋势' },
      { title: '选择建议', req: '分场景给出明确有立场的选择建议（至少3个具体场景）；最后点出需要关注的额外变量' },
    ],
    prompt: `对 Notion AI 和 ChatGPT for Teams 进行竞品对比分析，输出约 2,200 字的内部报告，严格按以下四节结构展开：

第一节 · 核心结论（TL;DR）
开头一句导语，直接点明两者的本质差异（不是功能差异，而是工作流哲学的不同）。随后：定价对比与综合 TCO 分析；各自最适合的团队类型一句话总结。

第二节 · 产品功能对比
Notion AI 的核心竞争力（上下文感知、工作区文档集成的优势与局限）；ChatGPT Teams 的核心竞争力（模型能力、灵活对话、多模态的优势与局限）；穿插一段真实用户使用体感的引述（用引号 + 来源标注），体现两种产品的日常使用感受差异。

第三节 · 用户口碑与增长
对比 G2 / Capterra 评分及成因；各自负面反馈集中在哪里（分别列出 2–3 个高频差评关键词）；增长数据与市场渗透趋势（可基于公开信息推算）。

第四节 · 选择建议
分场景给出明确的、有立场的选择建议（场景一：已重度使用 Notion；场景二：技术驱动的团队；场景三：重度 Office 365 用户）；最后点出第三个需要关注的变量。

写作要求：分析性语气，观点鲜明，不模棱两可，有明确立场。重要数据与来源用 §1 §2 §3 标注。直接输出报告正文，不要输出标题。`,
    _reportData: {
      meta: { issue: '№ 241', date: '2026 · MAY · 27', words: '2,180', sources: 6, reading: '5 min', category: 'RESEARCH · 竞品研究', titleEn: 'The AI assistant wars, enterprise edition.', titleCn: 'AI 助手企业战', subtitle: 'Notion AI 与 ChatGPT for Teams 深度对比' },
      metrics: [
        { value: '$16/月', en: 'NOTION', cn: 'Notion AI 单席位', accent: false },
        { value: '$25/月', en: 'TEAMS',  cn: 'ChatGPT Teams 单席位', accent: false },
        { value: '文档流',  en: 'EDGE-N', cn: 'Notion AI 优势场景', accent: true },
        { value: '对话流',  en: 'EDGE-C', cn: 'ChatGPT 优势场景', accent: false },
      ],
      sections: [
        { id: 's1', num: '01', en: 'TL;DR', cn: '核心结论', blocks: [
          { kind: 'lede', text: '这不是一场功能对比——而是两种完全不同的工作流哲学之间的碰撞。Notion AI 假设你的工作在文档里，ChatGPT for Teams 假设你的工作在对话里。' },
          { kind: 'p', text: 'Notion AI 在文档处理、知识库问答和团队协作上有明显优势，特别是对于「写作密集型」团队（咨询、内容、法务、产品），ROI 更高。ChatGPT Teams 在代码辅助、即兴创作和多模态理解上更强，但它的「无状态对话」模式反而让很多用户觉得更自由。§1' },
          { kind: 'p', text: '定价上，Notion AI 单席位 $16/月（需搭配 Notion 订阅），ChatGPT Teams 单席位 $25/月。综合 TCO 来看两者相差不大，关键在于团队现有工作流与哪个产品更契合。§2' },
        ]},
        { id: 's2', num: '02', en: 'Product features', cn: '产品功能', blocks: [
          { kind: 'p', text: 'Notion AI 的核心竞争力在于「上下文感知」——它能直接引用你工作区里的文档、数据库和页面历史，回答质量和你积累的 Notion 内容强相关。这对于已经重度使用 Notion 的团队是显著优势，对于新用户则是一个陡峭的前提成本。§3' },
          { kind: 'quote', text: '我们团队用 Notion AI 写周报只需要 10 分钟，因为它能直接拉上周的会议记录——但前提是我们已经把所有会议记录都存在 Notion 里了。', by: '某科技公司 PMO · 用户访谈' },
          { kind: 'p', text: 'ChatGPT Teams 则更像「高级搜索 + 创作助手」的组合。它的优势在于模型能力本身——GPT-4o 在创意写作、代码生成和多语言理解上仍然是行业基准。团队版在此基础上增加了数据隔离、自定义 GPT 和更高的 token 上限。' },
        ]},
        { id: 's3', num: '03', en: 'User feedback', cn: '用户口碑', blocks: [
          { kind: 'figure', label: 'Fig. 1 · G2 & Capterra 用户评分对比（满分 5 分）', caption: '数据来源：G2 · Capterra · 截至 2025 年 5 月，各取最近 200 条评价' },
          { kind: 'p', text: 'G2 上 Notion AI 均分 4.4，ChatGPT Teams 均分 4.6。差距来自不同的负面反馈：Notion AI 的差评集中在「学习成本高」和「非 Notion 用户难以入门」，ChatGPT 的差评集中在「幻觉率偏高」和「价格贵」。两者的满意度在各自核心用户群里都很高。§4' },
        ]},
        { id: 's4', num: '04', en: 'Recommendation', cn: '选择建议', blocks: [
          { kind: 'p', text: '选谁取决于你的团队现有工作流：如果团队已经在 Notion 上运转，选 Notion AI；如果需要一个独立的 AI 工作台、或者团队里有大量技术工作，ChatGPT Teams 的综合能力更强。两者都不建议作为「彻底替代人力」的工具，更适合做「加速器」。' },
          { kind: 'p', text: '一个值得关注的变量：微软 Copilot 正在快速迭代，它在 Office 生态里的整合优势是 Notion 和 OpenAI 都很难复制的。如果你的公司重度依赖 Office 365，Copilot 可能才是最值得评测的选项。§5' },
        ]},
      ],
      refs: [
        { n: '[1]', src: 'Notion', title: 'Notion AI 产品功能页', url: 'notion.so/product/ai', date: '2025.05.01' },
        { n: '[2]', src: 'OpenAI', title: 'ChatGPT for Teams 定价页', url: 'openai.com/chatgpt/team', date: '2025.05.01' },
        { n: '[3]', src: 'G2', title: 'Notion AI 用户评价 · 2025 Q2', url: 'g2.com', date: '2025.05.10' },
        { n: '[4]', src: 'Capterra', title: 'ChatGPT Teams 用户评价汇总', url: 'capterra.com', date: '2025.05.12' },
        { n: '[5]', src: '36 氪', title: 'Microsoft Copilot 企业端进展', url: '36kr.com', date: '2025.04.22' },
        { n: '[6]', src: '行业访谈', title: '6 位企业 IT 负责人工具评估访谈', url: 'internal', date: '2025.05.15' },
      ],
    },
  },
];

function useCustomTemplates() {
  const [templates, setTemplates] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('atlas_custom_templates') || '[]'); } catch { return []; }
  });
  const save = (tpl) => setTemplates(prev => {
    const next = tpl.id ? prev.map(t => t.id === tpl.id ? tpl : t) : [...prev, { ...tpl, id: Date.now().toString() }];
    try { localStorage.setItem('atlas_custom_templates', JSON.stringify(next)); } catch {}
    return next;
  });
  const remove = (id) => setTemplates(prev => {
    const next = prev.filter(t => t.id !== id);
    try { localStorage.setItem('atlas_custom_templates', JSON.stringify(next)); } catch {}
    return next;
  });
  return { templates, save, remove };
}

function useTeamKnowledge() {
  const { user, team } = useAuth();
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    if (!user || !team) { setItems([]); return; }
    let cancelled = false;
    import('./lib/supabase.js').then(({ supabase }) =>
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.access_token || cancelled) return;
        return fetch('/api/teams/knowledge', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }).then(r => r.json()).then(data => { if (!cancelled) setItems(Array.isArray(data) ? data : []); }).catch(() => {});
      })
    );
    return () => { cancelled = true; };
  }, [user, team]);

  return {
    templates: items.filter(i => i.type === 'template'),
    languages: items.filter(i => i.type === 'language').map(i => ({
      id: `team_${i.id}`, label: i.name, instr: i.content?.value || `使用${i.name}写作`, teamItem: true,
    })),
    promptExtras: items.filter(i => i.type === 'prompt_extra').map(i => i.content?.value || '').filter(Boolean),
  };
}

function TemplateEditor({ t, onSave, onClose, initial = null }) {
  const ICONS = ['📊','📈','🔍','💡','📝','🗂','🏢','💰','🌐','⚡','🎯','📋'];
  const TAG_OPTS = ['RESEARCH','DATA','STRATEGY','ANALYSIS','REPORT','CUSTOM'];
  const [icon, setIcon]         = React.useState(initial?.icon    || '📝');
  const [enName, setEnName]     = React.useState(initial?.en      || '');
  const [cnName, setCnName]     = React.useState(initial?.cn      || '');
  const [sub, setSub]           = React.useState(initial?.sub     || '');
  const [tag, setTag]           = React.useState(initial?.tag     || 'CUSTOM');
  const [minutes, setMinutes]   = React.useState(initial?.minutes || '3-5 min');
  const [promptVal, setPromptVal] = React.useState(initial?.prompt || '');
  const [sections, setSections] = React.useState(initial?.sections || []);
  const valid = enName.trim().length > 0 && (promptVal.trim().length > 0 || sections.length > 0);
  const handleSave = () => {
    if (!valid) return;
    const cleanSections = sections.filter(s => s.title.trim());
    const topicPrompt = cleanSections.length ? (promptVal.trim() || enName.trim()) : undefined;
    onSave({ ...initial, icon, en: enName.trim(), cn: cnName.trim(), sub: sub.trim(), tag, minutes, prompt: promptVal.trim(), sections: cleanSections.length ? cleanSections : undefined, topicPrompt });
  };
  const addSection = () => setSections(prev => [...prev, { title: '', req: '' }]);
  const removeSection = (i) => setSections(prev => prev.filter((_, idx) => idx !== i));
  const updateSection = (i, field, val) => setSections(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const lbl = { fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.5, color: t.mute, textTransform: 'uppercase', marginBottom: 5, display: 'block' };
  const inp = { width: '100%', border: `1.5px solid ${t.rule}`, padding: '7px 10px', fontFamily: t.fontBody, fontSize: 13, color: t.ink, background: t.faint, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.38)', zIndex:9995, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:t.paper, border:`2px solid ${t.ink}`, boxShadow:`6px 6px 0 ${t.ink}`, width:560, maxWidth:'92vw', maxHeight:'90vh', overflow:'auto', padding:'32px 36px' }} onClick={e=>e.stopPropagation()}>

        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, borderBottom:`1px solid ${t.rule}`, paddingBottom:16 }}>
          <div>
            <div style={{ fontFamily:t.fontDisplay, fontWeight:800, fontSize:13, letterSpacing:1.6, textTransform:'uppercase' }}>{initial?.id ? 'Edit Template' : 'New Template'}</div>
            <div style={{ fontFamily:t.fontCN, fontSize:12, color:t.mute, marginTop:3 }}>{initial?.id ? '编辑自定义模板' : '新建自定义模板'}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:t.mute, lineHeight:1, padding:'0 4px' }}>×</button>
        </div>

        <div style={{ marginBottom:16 }}>
          <span style={lbl}>Icon · 图标</span>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {ICONS.map(ic => (
              <button key={ic} onClick={()=>setIcon(ic)} style={{ width:34, height:34, fontSize:17, cursor:'pointer', border: icon===ic ? `2px solid ${t.ink}` : `1.5px solid ${t.rule}`, background: icon===ic ? t.faint : t.paper, boxShadow: icon===ic ? `2px 2px 0 ${t.ink}` : 'none' }}>{ic}</button>
            ))}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
          <div>
            <span style={lbl}>Template Name *</span>
            <input value={enName} onChange={e=>setEnName(e.target.value)} placeholder="e.g. Competitor Scan" style={{...inp, borderColor: enName.trim() ? t.ink : t.rule}} maxLength={30}/>
          </div>
          <div>
            <span style={lbl}>中文标题（可选）</span>
            <input value={cnName} onChange={e=>setCnName(e.target.value)} placeholder="e.g. 竞品调研" style={inp} maxLength={20}/>
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <span style={lbl}>Subtitle · 副标题</span>
          <input value={sub} onChange={e=>setSub(e.target.value)} placeholder="一句话描述这个模板的用途" style={inp} maxLength={50}/>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
          <div>
            <span style={lbl}>Tag · 标签</span>
            <div style={{ display:'flex', border:`1.5px solid ${t.ink}` }}>
              {TAG_OPTS.map((tg, i) => (
                <button key={tg} onClick={()=>setTag(tg)} style={{ flex:1, padding:'5px 0', fontSize:7.5, fontFamily:t.fontMono, letterSpacing:0.5, border:'none', borderLeft: i===0?'none':`1px solid ${t.ink}`, background: tag===tg ? t.ink : t.paper, color: tag===tg ? t.paper : t.ink, cursor:'pointer' }}>{tg}</button>
              ))}
            </div>
          </div>
          <div>
            <span style={lbl}>Est. Time · 预计用时</span>
            <input value={minutes} onChange={e=>setMinutes(e.target.value)} placeholder="e.g. 5-8 min" style={inp} maxLength={15}/>
          </div>
        </div>

        <div style={{ marginBottom:20 }}>
          <span style={lbl}>Prompt · 提示词内容{sections.length === 0 ? ' *' : '（有章节结构时可留空）'}</span>
          <textarea value={promptVal} onChange={e=>setPromptVal(e.target.value)}
            placeholder="输入完整的提示词，点击模板卡片后会直接填入输入框…"
            style={{...inp, height:sections.length ? 80 : 150, resize:'vertical', lineHeight:1.6, borderColor: promptVal.trim() ? t.ink : t.rule}}/>
        </div>

        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{...lbl, marginBottom:0}}>章节结构（可选）· 定义后将注入 System Prompt 作为强制框架</span>
            {sections.length > 0 && <span style={{ fontFamily:t.fontMono, fontSize:9, color:t.accent }}>已定义 {sections.length} 章节</span>}
          </div>
          {sections.map((s, i) => (
            <div key={i} style={{ border:`1px solid ${t.rule}`, padding:'10px 12px', marginBottom:8, background:t.faint }}>
              <div style={{ display:'flex', gap:8, marginBottom:6, alignItems:'center' }}>
                <span style={{ fontFamily:t.fontCN, fontSize:12, color:t.mute, flexShrink:0, width:20, textAlign:'center' }}>
                  {['一','二','三','四','五','六','七','八'][i]}
                </span>
                <input value={s.title} onChange={e=>updateSection(i,'title',e.target.value)}
                  placeholder="章节标题（必填）"
                  style={{...inp, flex:1, height:30, padding:'4px 8px', fontSize:12}} />
                <button onClick={()=>removeSection(i)} style={{ background:'none', border:`1px solid ${t.rule}`, width:26, height:26, cursor:'pointer', color:t.mute, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>×</button>
              </div>
              <textarea value={s.req} onChange={e=>updateSection(i,'req',e.target.value)}
                placeholder="写作要求（模型必须遵守的具体指令，如：开头一句结论，列举3个要点…）"
                style={{...inp, height:52, resize:'vertical', fontSize:11, lineHeight:1.5, padding:'5px 8px'}} />
            </div>
          ))}
          {sections.length < 8 && (
            <button onClick={addSection} style={{ width:'100%', padding:'7px 0', fontFamily:t.fontMono, fontSize:9, letterSpacing:1.2, border:`1.5px dashed ${t.rule}`, background:'transparent', color:t.mute, cursor:'pointer' }}>
              ＋ 添加章节
            </button>
          )}
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:16, borderTop:`1px solid ${t.rule}` }}>
          <button onClick={onClose} style={{ padding:'8px 20px', fontFamily:t.fontMono, fontSize:10, letterSpacing:1.2, border:`1.5px solid ${t.rule}`, background:'transparent', color:t.mute, cursor:'pointer' }}>CANCEL</button>
          <button onClick={handleSave} disabled={!valid} style={{ padding:'8px 22px', fontFamily:t.fontMono, fontSize:10, letterSpacing:1.2, border:`1.5px solid ${valid?t.ink:t.rule}`, background: valid?t.ink:'transparent', color: valid?t.paper:t.mute, cursor: valid?'pointer':'default', boxShadow: valid?`2px 2px 0 ${t.accent}`:'none' }}>SAVE TEMPLATE</button>
        </div>
      </div>
    </div>
  );
}

function getAutoNote() {
  try {
    const reports = JSON.parse(localStorage.getItem('atlas_saved_reports') || '[]');
    const custom = JSON.parse(localStorage.getItem('atlas_custom_templates') || '[]');
    const count = reports.length;
    if (count === 0 && custom.length === 0) return null;
    const tplUsage = {};
    reports.forEach(r => { if (r.template) tplUsage[r.template] = (tplUsage[r.template] || 0) + 1; });
    const top = Object.entries(tplUsage).sort((a, b) => b[1] - a[1])[0];
    const parts = [];
    if (count > 0) parts.push(`这一期你已生成 ${count} 篇报告${top ? `，最常调用「${top[0]}」模板` : ''}`);
    if (custom.length > 0) parts.push(`另有 ${custom.length} 个自定义模板待用`);
    return parts.join('；') + '。';
  } catch { return null; }
}

function useEditorNote() {
  const [note, setNote] = React.useState(() => {
    try { return localStorage.getItem('atlas_editor_note') || ''; } catch { return ''; }
  });
  const save = (text) => {
    setNote(text);
    try {
      if (text) localStorage.setItem('atlas_editor_note', text);
      else localStorage.removeItem('atlas_editor_note');
    } catch {}
  };
  return { note, save };
}

function useAINews() {
  const cacheKey = `atlas_ai_news_${new Date().toISOString().slice(0,10)}`;
  const [items, setItems] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(cacheKey) || '[]'); } catch { return []; }
  });
  const [loading, setLoading] = React.useState(false);
  const getHost = (url) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'hn'; } };
  const translate = async (text) => {
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`);
      const d = await res.json();
      return (d[0] || []).map(s => s?.[0] || '').join('').trim() || text;
    } catch { return text; }
  };

  React.useEffect(() => {
    if (items.length) return;
    setLoading(true);
    fetch('https://hn.algolia.com/api/v1/search_by_date?query=AI+LLM+OpenAI+Claude+Gemini+GPT&tags=story&hitsPerPage=30')
      .then(r => r.json())
      .then(async data => {
        const raw = (data.hits || [])
          .filter(h => h.title && (h.points || 0) >= 3 && h.url)
          .slice(0, 20)
          .map(h => ({ title: h.title, url: h.url, points: h.points, source: getHost(h.url) }));
        const news = await Promise.all(raw.map(async h => ({ ...h, titleCN: await translate(h.title) })));
        setItems(news);
        try { localStorage.setItem(cacheKey, JSON.stringify(news)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { items, loading };
}

function Home({ t, prompt, setPrompt, onStart, onBackground, onWorkflow, bgTaskStatus, density = 'editorial', modelStore, toolbarStore, onNavigateSources, teamTemplates = [] }) {
  const editorial = density === 'editorial';
  const headSize = editorial ? 'xxl' : 'xl';
  const customTpls = useCustomTemplates();
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingTemplate, setEditingTemplate] = React.useState(null);
  const [hoveredCustomId, setHoveredCustomId] = React.useState(null);
  const editorNote = useEditorNote();
  const [noteEditing, setNoteEditing] = React.useState(false);
  const [noteDraft, setNoteDraft] = React.useState('');
  const autoNote = getAutoNote();
  const displayNote = editorNote.note || autoNote || '这一期，我学会了更好地引用脚注。写完后告诉我"再细一些"，我会重写。';
  const aiNews = useAINews();
  const [newsIdx, setNewsIdx] = React.useState(0);
  React.useEffect(() => {
    if (!aiNews.items.length) return;
    const id = setInterval(() => setNewsIdx(i => (i + 1) % aiNews.items.length), 5000);
    return () => clearInterval(id);
  }, [aiNews.items.length]);
  const [now] = React.useState(() => new Date());
  const DAY_CN = ['日','一','二','三','四','五','六'];
  const coverDate = `${now.getMonth()+1}月${now.getDate()}日 · 周${DAY_CN[now.getDay()]}`;

  return (
    <div style={{
      flex: 1, background: t.paper, color: t.ink,
      display: 'grid', gridTemplateColumns: '64px 1fr', minHeight: 0, overflow: 'auto',
    }}>
      {/* Left thin rail — vertical metadata */}
      <div style={{
        borderRight: `1px solid ${t.ink}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
        padding: '28px 0', minHeight: 0,
      }}>
        <span style={{
          fontFamily: t.fontMono, fontSize: 10, letterSpacing: 2,
          writingMode: 'vertical-lr',
          color: t.ink,
        }}>VOL. 04 · № 241</span>
        <span style={{
          fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.8, color: t.mute,
          writingMode: 'vertical-lr',
        }}>报告智能体 · ATLAS</span>
      </div>

      {/* Cover area */}
      <div style={{
        padding: editorial ? '48px 72px 32px' : '32px 56px 28px',
        display: 'flex', flexDirection: 'column', gap: editorial ? 36 : 24, minHeight: 0,
      }}>
        {/* Kicker row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Tag t={t} accent>◆ THE COVER STORY · 封面故事</Tag>
          <span style={{ flex: 1, height: 1, background: t.ink }}/>
          <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 1.2 }}>{coverDate}</span>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <BilingualHead t={t} size={headSize}
            en="Tell Atlas what to write."
            cn={<>今天写点什么<span style={{ color: t.accent }}>报告</span>？</>}
          />
          <div style={{
            fontFamily: t.fontSerif, fontStyle: 'italic', fontWeight: 400,
            fontSize: editorial ? 26 : 22, lineHeight: 1.35, color: t.mute,
            letterSpacing: -0.3, maxWidth: 720,
          }}>
            An essay engine. Drop a brief, get back a piece you can actually file.
          </div>
        </div>

        {/* Prompt input */}
        <PromptComposer t={t} prompt={prompt} setPrompt={setPrompt} onStart={onStart} onBackground={onBackground} onWorkflow={onWorkflow} bgTaskStatus={bgTaskStatus} modelStore={modelStore} toolbarStore={toolbarStore} onNavigateSources={onNavigateSources}/>

        {/* AI news ticker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px', border: `1px solid ${t.ink}`, background: t.cardOn, minWidth: 0 }}>
          <Tag t={t} accent>AI 动态</Tag>
          {aiNews.loading ? (
            <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, flex: 1, letterSpacing: 0.5 }}>加载中…</span>
          ) : aiNews.items.length > 0 ? (
            <React.Fragment>
              <a key={newsIdx} href={aiNews.items[newsIdx].url} target="_blank" rel="noreferrer"
                style={{ fontFamily: t.fontCN, fontSize: 13, color: t.ink, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none', cursor: 'pointer' }}>
                {aiNews.items[newsIdx].titleCN || aiNews.items[newsIdx].title}
              </a>
              <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, flexShrink: 0, letterSpacing: 0.3 }}>{aiNews.items[newsIdx].source}</span>
              <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, flexShrink: 0 }}>{newsIdx + 1}/{aiNews.items.length}</span>
            </React.Fragment>
          ) : (
            <span style={{ fontFamily: t.fontCN, fontSize: 13, color: t.mute, flex: 1 }}>{displayNote}</span>
          )}
        </div>

        {/* Starters grid */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14,
            borderTop: `1px solid ${t.ink}`, paddingTop: 12,
          }}>
            <span style={{ fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 12, letterSpacing: 1.6, textTransform: 'uppercase' }}>
              Or pick a starter
            </span>
            <span style={{ fontFamily: t.fontCN, fontSize: 12, color: t.mute }}>从模板开始</span>
            <span style={{ flex: 1, height: 1, background: t.rule }}/>
            <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>
              {String(STARTERS.length + customTpls.templates.length + teamTemplates.length).padStart(2,'0')} entries
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
            borderTop: `1px solid ${t.rule}`, borderLeft: `1px solid ${t.rule}`,
          }}>
            {/* ── built-in starters ── */}
            {STARTERS.map((s) => (
              <button key={s.num} type="button" onClick={() => {
                if (s.sections?.length) {
                  setPrompt(s.topicPrompt || s.prompt);
                  toolbarStore?.setActiveTemplate({ id: s.en, en: s.en, cn: s.cn, sections: s.sections });
                } else {
                  setPrompt(s.prompt);
                  toolbarStore?.clearActiveTemplate();
                }
              }}
                style={{ borderRight:`1px solid ${t.rule}`, borderBottom:`1px solid ${t.rule}`, background:t.paper, padding:'18px 22px', textAlign:'left', display:'flex', flexDirection:'column', gap:6, cursor:'pointer', fontFamily:t.fontBody, color:t.ink, transition:'background 0.12s' }}
                onMouseEnter={e=>e.currentTarget.style.background=t.faint}
                onMouseLeave={e=>e.currentTarget.style.background=t.paper}
              >
                <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontFamily:t.fontSerif, fontStyle:'italic', fontWeight:600, fontSize:22, color:t.accent, letterSpacing:-0.5, lineHeight:1 }}>{s.num}</span>
                  <Tag t={t}>{s.tag}</Tag>
                </div>
                <div style={{ fontFamily:t.fontDisplay, fontWeight:700, fontSize:13, letterSpacing:0.5, textTransform:'uppercase' }}>{s.en}</div>
                <div style={{ fontFamily:t.fontCN, fontSize:15, fontWeight:600, lineHeight:1.3 }}>{s.cn}</div>
                <div style={{ fontFamily:t.fontCN, fontSize:12, color:t.mute, lineHeight:1.5 }}>{s.sub}</div>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                  <span style={{ fontFamily:t.fontMono, fontSize:9, color:t.mute, letterSpacing:1 }}>{s.minutes}</span>
                  {s.sections?.length > 0 && (
                    <span style={{ fontFamily:t.fontMono, fontSize:8, color:t.accent, border:`1px solid ${t.accent}`, padding:'1px 5px', letterSpacing:0.5 }}>
                      {s.sections.length} 章节
                    </span>
                  )}
                  <span style={{ flex:1 }}/>
                  <span style={{ fontFamily:t.fontMono, fontSize:11, color:t.ink }}>↗</span>
                </div>
              </button>
            ))}

            {/* ── custom templates ── */}
            {customTpls.templates.map((s) => (
              <div key={s.id} style={{ position:'relative', borderRight:`1px solid ${t.rule}`, borderBottom:`1px solid ${t.rule}` }}
                onMouseEnter={()=>setHoveredCustomId(s.id)}
                onMouseLeave={()=>setHoveredCustomId(null)}
              >
                {/* card body — same layout as built-in starters */}
                <button type="button" onClick={()=>{
                  if (s.sections?.length) {
                    setPrompt(s.topicPrompt || s.prompt);
                    toolbarStore?.setActiveTemplate({ id: s.id, en: s.en, cn: s.cn, sections: s.sections });
                  } else {
                    setPrompt(s.prompt);
                    toolbarStore?.clearActiveTemplate();
                  }
                }}
                  style={{ width:'100%', height:'100%', background: hoveredCustomId===s.id ? t.faint : t.paper, padding:'18px 22px', textAlign:'left', display:'flex', flexDirection:'column', gap:6, cursor:'pointer', fontFamily:t.fontBody, color:t.ink, transition:'background 0.12s', border:'none' }}
                >
                  {/* top row: icon left, tag right — mirrors built-in num/tag row */}
                  <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontFamily:t.fontSerif, fontStyle:'italic', fontWeight:600, fontSize:22, lineHeight:1, letterSpacing:-0.5 }}>{s.icon || '📝'}</span>
                    <Tag t={t}>{s.tag || 'CUSTOM'}</Tag>
                  </div>
                  <div style={{ fontFamily:t.fontDisplay, fontWeight:700, fontSize:13, letterSpacing:0.5, textTransform:'uppercase' }}>{s.en}</div>
                  {s.cn&&<div style={{ fontFamily:t.fontCN, fontSize:15, fontWeight:600, lineHeight:1.3 }}>{s.cn}</div>}
                  {s.sub&&<div style={{ fontFamily:t.fontCN, fontSize:12, color:t.mute, lineHeight:1.5 }}>{s.sub}</div>}
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                    <span style={{ fontFamily:t.fontMono, fontSize:9, color:t.mute, letterSpacing:1 }}>{s.minutes}</span>
                    <span style={{ fontFamily:t.fontMono, fontSize:7.5, letterSpacing:1, color:t.accent, border:`1px solid ${t.accent}`, padding:'1px 4px', lineHeight:1.5 }}>CUSTOM</span>
                    <span style={{ flex:1 }}/><span style={{ fontFamily:t.fontMono, fontSize:11, color:t.ink }}>↗</span>
                  </div>
                </button>
                {/* edit / delete — only visible on hover */}
                {hoveredCustomId===s.id&&(
                  <div style={{ position:'absolute', top:10, right:10, display:'flex', gap:3 }} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>{setEditingTemplate(s);setEditorOpen(true);}} title="编辑模板"
                      style={{ width:22, height:22, border:`1px solid ${t.rule}`, background:t.paper, cursor:'pointer', fontSize:11, color:t.mute, display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>✎</button>
                    <button onClick={()=>customTpls.remove(s.id)} title="删除模板"
                      style={{ width:22, height:22, border:`1px solid ${t.rule}`, background:t.paper, cursor:'pointer', fontSize:13, color:t.mute, display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>×</button>
                  </div>
                )}
              </div>
            ))}

            {/* ── team templates ── */}
            {teamTemplates.map((s) => (
              <button key={s.id} type="button" onClick={() => {
                if (s.content?.sections?.length) {
                  setPrompt(s.content?.topicPrompt || s.name);
                  toolbarStore?.setActiveTemplate({ id: s.id, en: s.name, cn: s.name, sections: s.content.sections });
                } else {
                  setPrompt(s.content?.prompt || s.name);
                  toolbarStore?.clearActiveTemplate();
                }
              }}
                style={{ background:t.paper, padding:'18px 22px', textAlign:'left', display:'flex', flexDirection:'column', gap:6, cursor:'pointer', fontFamily:t.fontBody, color:t.ink, transition:'background 0.12s', border:'none', borderRight:`1px solid ${t.rule}`, borderBottom:`1px solid ${t.rule}` }}
                onMouseEnter={e=>e.currentTarget.style.background=t.faint}
                onMouseLeave={e=>e.currentTarget.style.background=t.paper}
              >
                <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontFamily:t.fontSerif, fontStyle:'italic', fontWeight:600, fontSize:22, lineHeight:1, letterSpacing:-0.5 }}>🏢</span>
                  <span style={{ fontFamily:t.fontMono, fontSize:7.5, letterSpacing:1, color:'#1d4ed8', border:`1px solid #1d4ed8`, padding:'1px 4px', lineHeight:1.5 }}>TEAM</span>
                </div>
                <div style={{ fontFamily:t.fontDisplay, fontWeight:700, fontSize:13, letterSpacing:0.5, textTransform:'uppercase' }}>{s.name}</div>
                {s.content?.sections?.length > 0 && (
                  <span style={{ fontFamily:t.fontMono, fontSize:8, color:t.accent, border:`1px solid ${t.accent}`, padding:'1px 5px', letterSpacing:0.5, alignSelf:'flex-start' }}>
                    {s.content.sections.length} 章节
                  </span>
                )}
                <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:'auto' }}>
                  <span style={{ flex:1 }}/><span style={{ fontFamily:t.fontMono, fontSize:11, color:t.ink }}>↗</span>
                </div>
              </button>
            ))}

            {/* ── + add new template ── */}
            <button type="button" onClick={()=>{setEditingTemplate(null);setEditorOpen(true);}}
              style={{ background:'transparent', padding:'18px 22px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer', minHeight:130, border:'none', borderRight:`1px dashed ${t.rule}`, borderBottom:`1px dashed ${t.rule}`, outline:`1px dashed ${t.rule}` }}
              onMouseEnter={e=>{e.currentTarget.style.background=t.faint;}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}
            >
              <span style={{ fontFamily:t.fontSerif, fontStyle:'italic', fontSize:28, color:t.rule, lineHeight:1 }}>+</span>
              <span style={{ fontFamily:t.fontMono, fontSize:9, letterSpacing:1.5, color:t.mute, textTransform:'uppercase' }}>Add Template</span>
              <span style={{ fontFamily:t.fontCN, fontSize:11, color:t.mute }}>自定义模板</span>
            </button>
          </div>

          {/* template editor modal */}
          {editorOpen&&(
            <TemplateEditor t={t} initial={editingTemplate}
              onSave={tpl=>{customTpls.save(tpl);setEditorOpen(false);setEditingTemplate(null);}}
              onClose={()=>{setEditorOpen(false);setEditingTemplate(null);}}/>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Model Selector ─────────────────────────────────────────────────────

const BUILTIN_MODELS = [
  { id: 'claude-opus-4-7',           name: 'Opus 4.7',    provider: 'Anthropic', builtin: true, apiUrl: 'https://api.anthropic.com/v1' },
  { id: 'claude-sonnet-4-6',         name: 'Sonnet 4.6',  provider: 'Anthropic', builtin: true, apiUrl: 'https://api.anthropic.com/v1' },
  { id: 'claude-haiku-4-5-20251001', name: 'Haiku 4.5',   provider: 'Anthropic', builtin: true, apiUrl: 'https://api.anthropic.com/v1' },
  { id: 'mimo-v2.5-pro',             name: 'MiMo V2.5 Pro', provider: 'Xiaomi', builtin: true, apiUrl: 'https://api.xiaomimimo.com/v1', needsKey: true },
];
const EFFORT_OPTIONS = ['Low', 'Medium', 'High', 'Max'];

function useModelStore() {
  const [customModels, setCustomModels] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('atlas_custom_models') || '[]'); } catch { return []; }
  });
  const [selectedId, setSelectedId] = React.useState(
    () => localStorage.getItem('atlas_selected_model') || 'claude-sonnet-4-6'
  );
  // API keys + custom URLs for builtin models (keyed by model id)
  const [builtinKeys, setBuiltinKeys] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('atlas_builtin_keys') || '{}'); } catch { return {}; }
  });
  const [builtinUrls, setBuiltinUrls] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('atlas_builtin_urls') || '{}'); } catch { return {}; }
  });
  const [effort, setEffort] = React.useState('High');
  const [fastMode, setFastMode] = React.useState(false);
  const [generationMode, setGenerationModeState] = React.useState(
    () => localStorage.getItem('atlas_generation_mode') || 'balanced'
  );
  const DEFAULT_MODE = GENERATION_MODES.find(m => m.id === 'balanced');
  const [temperature, setTemperatureState] = React.useState(() => {
    const v = parseFloat(localStorage.getItem('atlas_temperature'));
    return isNaN(v) ? DEFAULT_MODE.temperature : v;
  });
  const [systemPromptExtra, setSystemPromptExtraState] = React.useState(
    () => localStorage.getItem('atlas_system_prompt_extra') || ''
  );
  const [topP, setTopPState] = React.useState(() => {
    const v = parseFloat(localStorage.getItem('atlas_top_p'));
    return isNaN(v) ? DEFAULT_MODE.topP : v;
  });
  const [frequencyPenalty, setFreqPenaltyState] = React.useState(() => {
    const v = parseFloat(localStorage.getItem('atlas_freq_penalty'));
    return isNaN(v) ? DEFAULT_MODE.frequencyPenalty : v;
  });
  const [presencePenalty, setPresPenaltyState] = React.useState(() => {
    const v = parseFloat(localStorage.getItem('atlas_pres_penalty'));
    return isNaN(v) ? 0 : v;
  });
  const [maxTokensOverride, setMaxTokensOverrideState] = React.useState(() => {
    const v = parseInt(localStorage.getItem('atlas_max_tokens_override'), 10);
    return isNaN(v) ? null : Math.min(v, 131072);
  });

  const [hiddenBuiltins, setHiddenBuiltins] = React.useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('atlas_hidden_builtins') || '[]')); } catch { return new Set(); }
  });
  const [modelParamTemplates, setModelParamTemplatesState] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('atlas_model_param_templates') || '{}'); } catch { return {}; }
  });
  const hideBuiltin = (id) => {
    const next = new Set([...hiddenBuiltins, id]);
    setHiddenBuiltins(next);
    try { localStorage.setItem('atlas_hidden_builtins', JSON.stringify([...next])); } catch {}
  };

  // Merge builtin keys + custom URLs into allModels, excluding hidden builtins
  const allModels = [
    ...BUILTIN_MODELS.filter(m => !hiddenBuiltins.has(m.id)).map(m => m.needsKey
      ? { ...m, apiKey: builtinKeys[m.id] || '', apiUrl: builtinUrls[m.id] || m.apiUrl }
      : m),
    ...customModels,
  ];
  const selected = allModels.find(m => m.id === selectedId) || allModels[1];

  const selectModel = (id) => {
    setSelectedId(id);
    try { localStorage.setItem('atlas_selected_model', id); } catch {}
    // Auto-apply model-specific preset for current non-custom mode
    const curMode = generationMode;
    if (curMode !== 'custom' && !curMode.startsWith('tpl_')) {
      const preset = getModelPreset(id, curMode);
      if (preset) {
        setTemperatureState(preset.temperature); try { localStorage.setItem('atlas_temperature', String(preset.temperature)); } catch {}
        setTopPState(preset.topP); try { localStorage.setItem('atlas_top_p', String(preset.topP)); } catch {}
        setFreqPenaltyState(preset.frequencyPenalty); try { localStorage.setItem('atlas_freq_penalty', String(preset.frequencyPenalty)); } catch {}
      }
    }
  };
  const setBuiltinKey = (id, key, url) => {
    const updatedKeys = { ...builtinKeys, [id]: key };
    setBuiltinKeys(updatedKeys);
    try { localStorage.setItem('atlas_builtin_keys', JSON.stringify(updatedKeys)); } catch {}
    if (url !== undefined) {
      const updatedUrls = { ...builtinUrls, [id]: url };
      setBuiltinUrls(updatedUrls);
      try { localStorage.setItem('atlas_builtin_urls', JSON.stringify(updatedUrls)); } catch {}
    }
  };
  const addModel = (model) => {
    const updated = [...customModels, model];
    setCustomModels(updated);
    try { localStorage.setItem('atlas_custom_models', JSON.stringify(updated)); } catch {}
  };
  const removeModel = (id) => {
    const updated = customModels.filter(m => m.id !== id);
    setCustomModels(updated);
    try { localStorage.setItem('atlas_custom_models', JSON.stringify(updated)); } catch {}
  };
  const addModelTemplate = (modelId, name, temp, tp, fp) => {
    const id = 'tpl_' + Date.now();
    const tpl = { id, name, temperature: temp, topP: tp, frequencyPenalty: fp };
    const updated = { ...modelParamTemplates, [modelId]: [...(modelParamTemplates[modelId] || []), tpl] };
    setModelParamTemplatesState(updated);
    try { localStorage.setItem('atlas_model_param_templates', JSON.stringify(updated)); } catch {}
  };
  const removeModelTemplate = (modelId, tplId) => {
    const updated = { ...modelParamTemplates, [modelId]: (modelParamTemplates[modelId] || []).filter(t => t.id !== tplId) };
    setModelParamTemplatesState(updated);
    try { localStorage.setItem('atlas_model_param_templates', JSON.stringify(updated)); } catch {}
    if (generationMode === tplId) {
      setGenerationModeState('custom'); try { localStorage.setItem('atlas_generation_mode', 'custom'); } catch {}
    }
  };
  const setTemperature = (v) => {
    setTemperatureState(v); try { localStorage.setItem('atlas_temperature', String(v)); } catch {}
    setGenerationModeState('custom'); try { localStorage.setItem('atlas_generation_mode', 'custom'); } catch {}
  };
  const setSystemPromptExtra = (v) => { setSystemPromptExtraState(v); try { localStorage.setItem('atlas_system_prompt_extra', v); } catch {} };
  const setTopP = (v) => {
    setTopPState(v); try { localStorage.setItem('atlas_top_p', String(v)); } catch {}
    setGenerationModeState('custom'); try { localStorage.setItem('atlas_generation_mode', 'custom'); } catch {}
  };
  const setFrequencyPenalty = (v) => {
    setFreqPenaltyState(v); try { localStorage.setItem('atlas_freq_penalty', String(v)); } catch {}
    setGenerationModeState('custom'); try { localStorage.setItem('atlas_generation_mode', 'custom'); } catch {}
  };
  const setPresencePenalty = (v) => { setPresPenaltyState(v); try { localStorage.setItem('atlas_pres_penalty', String(v)); } catch {} };
  const setMaxTokensOverride = (v) => {
    setMaxTokensOverrideState(v);
    try { v !== null ? localStorage.setItem('atlas_max_tokens_override', String(v)) : localStorage.removeItem('atlas_max_tokens_override'); } catch {}
  };
  const setGenerationMode = (id) => {
    if (id.startsWith('tpl_')) {
      const modelId = allModels.find(m => m.id === selectedId)?.id;
      const tpl = (modelParamTemplates[modelId] || []).find(t => t.id === id);
      if (!tpl) return;
      setGenerationModeState(id); try { localStorage.setItem('atlas_generation_mode', id); } catch {}
      setTemperatureState(tpl.temperature); try { localStorage.setItem('atlas_temperature', String(tpl.temperature)); } catch {}
      setTopPState(tpl.topP); try { localStorage.setItem('atlas_top_p', String(tpl.topP)); } catch {}
      setFreqPenaltyState(tpl.frequencyPenalty); try { localStorage.setItem('atlas_freq_penalty', String(tpl.frequencyPenalty)); } catch {}
      return;
    }
    const mode = GENERATION_MODES.find(m => m.id === id);
    if (!mode) return;
    const preset = getModelPreset(selectedId, id) || mode;
    setGenerationModeState(id); try { localStorage.setItem('atlas_generation_mode', id); } catch {}
    setTemperatureState(preset.temperature); try { localStorage.setItem('atlas_temperature', String(preset.temperature)); } catch {}
    setTopPState(preset.topP); try { localStorage.setItem('atlas_top_p', String(preset.topP)); } catch {}
    setFreqPenaltyState(preset.frequencyPenalty); try { localStorage.setItem('atlas_freq_penalty', String(preset.frequencyPenalty)); } catch {}
  };
  return { allModels, selected, selectModel, effort, setEffort, fastMode, setFastMode, addModel, removeModel, hideBuiltin, setBuiltinKey, builtinKeys, temperature, setTemperature, systemPromptExtra, setSystemPromptExtra, topP, setTopP, frequencyPenalty, setFrequencyPenalty, presencePenalty, setPresencePenalty, maxTokensOverride, setMaxTokensOverride, generationMode, setGenerationMode, modelParamTemplates, addModelTemplate, removeModelTemplate };
}

function ModelSelector({ t, store }) {
  const [open, setOpen] = React.useState(false);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const emptyForm = { name: '', modelId: '', apiUrl: '', apiKey: '', provider: '' };
  const [form, setForm] = React.useState(emptyForm);
  const [showKey, setShowKey] = React.useState(false);
  const popoverRef = React.useRef(null);
  const triggerRef = React.useRef(null);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)) {
        setOpen(false); setShowAddForm(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ⇧⌘I keyboard shortcut
  React.useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault(); setOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleAdd = () => {
    if (!form.name || !form.modelId || !form.apiUrl || !form.apiKey) return;
    store.addModel({ id: form.modelId, name: form.name, apiUrl: form.apiUrl, apiKey: form.apiKey, provider: form.provider || 'Custom', builtin: false });
    setForm(emptyForm); setShowAddForm(false); setShowKey(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {/* Trigger */}
      <button ref={triggerRef} type="button" onClick={() => setOpen(o => !o)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
        fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase',
        padding: '3px 7px', lineHeight: 1, cursor: 'pointer',
        border: `1px solid ${open ? t.ink : t.ink}`,
        background: open ? t.ink : 'transparent',
        color: open ? t.paper : t.ink,
      }}>◈ {store.selected.name} ▾</button>

      {/* Popover */}
      {open && (
        <div ref={popoverRef} style={{
          position: 'absolute', bottom: 'calc(100% + 10px)', left: 0,
          width: 290, zIndex: 300,
          background: t.cardOn, border: `1.5px solid ${t.ink}`,
          boxShadow: `4px 4px 0 ${t.ink}`,
        }}>
          {/* ── MODELS ── */}
          <div style={{ borderBottom: `1px solid ${t.rule}` }}>
            <div style={{ padding: '8px 14px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.4, color: t.mute, textTransform: 'uppercase' }}>Models · 模型</span>
              <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.muteSoft, letterSpacing: 0.5 }}>⇧⌘I</span>
            </div>
            {store.allModels.map(m => (
              <ModelRow key={m.id} model={m} t={t}
                selected={store.selected.id === m.id}
                onSelect={() => store.selectModel(m.id)}
                onRemove={!m.builtin ? () => store.removeModel(m.id) : null}
                onSetKey={store.setBuiltinKey}/>
            ))}
            {/* Add model */}
            {!showAddForm ? (
              <button type="button" onClick={() => setShowAddForm(true)} style={{
                display: 'flex', width: '100%', padding: '8px 14px',
                border: 'none', borderTop: `1px dashed ${t.rule}`,
                background: 'transparent', cursor: 'pointer', textAlign: 'left',
                fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.2,
                color: t.mute, textTransform: 'uppercase',
              }}
                onMouseEnter={e => e.currentTarget.style.background = t.faint}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >＋ 添加模型 · Add model</button>
            ) : (
              <AddModelForm t={t} form={form} setForm={setForm}
                showKey={showKey} setShowKey={setShowKey}
                onAdd={handleAdd}
                onCancel={() => { setShowAddForm(false); setForm(emptyForm); setShowKey(false); }}/>
            )}
          </div>

          {/* ── EFFORT ── */}
          <div style={{ padding: '8px 14px 10px', borderBottom: `1px solid ${t.rule}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.4, color: t.mute, textTransform: 'uppercase' }}>Effort · 力度</span>
              <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.muteSoft, letterSpacing: 0.5 }}>⇧⌘E</span>
            </div>
            <div style={{ display: 'flex', border: `1px solid ${t.ink}` }}>
              {EFFORT_OPTIONS.map((e, i) => (
                <button key={e} type="button" onClick={() => store.setEffort(e)} style={{
                  flex: 1, padding: '6px 0', border: 'none',
                  borderLeft: i === 0 ? 'none' : `1px solid ${t.ink}`,
                  background: store.effort === e ? t.ink : 'transparent',
                  color: store.effort === e ? t.paper : t.ink,
                  fontFamily: t.fontMono, fontSize: 9, letterSpacing: 0.8,
                  cursor: 'pointer', textTransform: 'uppercase',
                }}>{e}</button>
              ))}
            </div>
          </div>

          {/* ── FAST MODE ── */}
          <div style={{ padding: '8px 14px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.4, color: t.mute, textTransform: 'uppercase', marginBottom: 3 }}>Fast mode · 快速模式</div>
              <div style={{ fontFamily: t.fontCN, fontSize: 11, color: t.mute, lineHeight: 1.4 }}>用 Opus 的速度输出（Beta）</div>
            </div>
            <button type="button" onClick={() => store.setFastMode(v => !v)} style={{
              position: 'relative', width: 36, height: 20, border: `1.5px solid ${t.ink}`,
              background: store.fastMode ? t.ink : t.paper, cursor: 'pointer', padding: 0, flexShrink: 0,
            }}>
              <span style={{
                position: 'absolute', top: 2, left: store.fastMode ? 16 : 2,
                width: 12, height: 12, background: store.fastMode ? t.paper : t.ink, transition: 'left 0.12s',
              }}/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const MIMO_ENDPOINTS = [
  { label: '国际（按量付费）', url: 'https://api.xiaomimimo.com/v1' },
  { label: '中国区（Token 套餐）', url: 'https://token-plan-cn.xiaomimimo.com/v1' },
];

function ModelRow({ model, t, selected, onSelect, onRemove, onSetKey }) {
  const [hover, setHover] = React.useState(false);
  const [editingKey, setEditingKey] = React.useState(false);
  const [keyDraft, setKeyDraft] = React.useState(model.apiKey || '');
  const [urlDraft, setUrlDraft] = React.useState(model.apiUrl || '');
  const [showKey, setShowKey] = React.useState(false);
  const hasKey = !!(model.apiKey);
  const needsKey = model.needsKey;
  const isMimo = model.id && model.id.startsWith('mimo');

  const openEdit = (e) => {
    e.stopPropagation();
    setEditingKey(v => !v);
    setKeyDraft(model.apiKey || '');
    setUrlDraft(model.apiUrl || '');
    setShowKey(false);
  };

  const save = () => {
    onSetKey(model.id, keyDraft, urlDraft);
    setEditingKey(false);
  };

  const inputStyle = {
    flex: 1, padding: '5px 8px', border: `1px solid ${t.rule}`,
    background: t.paper, color: t.ink, fontFamily: t.fontMono, fontSize: 11, outline: 'none',
    width: '100%', boxSizing: 'border-box',
  };

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ borderBottom: `1px solid ${t.faint}` }}>
      {/* Row */}
      <div onClick={onSelect} style={{
        display: 'flex', alignItems: 'center', padding: '7px 14px',
        cursor: 'pointer', background: hover ? t.faint : 'transparent',
      }}>
        <span style={{ width: 16, flexShrink: 0, fontFamily: t.fontMono, fontSize: 11, color: t.accent }}>
          {selected ? '✓' : ''}
        </span>
        <span style={{ flex: 1, fontFamily: t.fontBody, fontSize: 13, color: t.ink }}>{model.name}</span>
        {needsKey && (
          <span onClick={openEdit} style={{
            fontFamily: t.fontMono, fontSize: 9, letterSpacing: 0.8, cursor: 'pointer',
            marginRight: 6, textDecoration: 'underline',
            color: hasKey ? '#10b981' : t.accent,
          }}>
            {hasKey ? 'KEY ✓' : 'SET KEY'}
          </span>
        )}
        <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 0.4 }}>{model.provider}</span>
        {onRemove && hover && (
          <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }} style={{
            marginLeft: 8, border: 'none', background: 'transparent', cursor: 'pointer',
            fontFamily: t.fontMono, fontSize: 10, color: t.mute, padding: '0 2px', lineHeight: 1,
          }}>✕</button>
        )}
      </div>

      {/* Edit panel */}
      {editingKey && needsKey && (
        <div onClick={e => e.stopPropagation()} style={{
          padding: '8px 14px 12px 14px', background: t.paperAlt,
          display: 'flex', flexDirection: 'column', gap: 8,
          borderTop: `1px dashed ${t.rule}`,
        }}>
          {/* API URL */}
          <div>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1, marginBottom: 4 }}>
              API BASE URL
            </div>
            {/* MiMo quick-select */}
            {isMimo && (
              <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                {MIMO_ENDPOINTS.map(ep => (
                  <button key={ep.url} type="button" onClick={() => setUrlDraft(ep.url)} style={{
                    padding: '3px 8px', fontSize: 9, fontFamily: t.fontMono,
                    border: `1px solid ${urlDraft === ep.url ? t.ink : t.rule}`,
                    background: urlDraft === ep.url ? t.ink : 'transparent',
                    color: urlDraft === ep.url ? t.paper : t.mute,
                    cursor: 'pointer', letterSpacing: 0.5, whiteSpace: 'nowrap',
                  }}>{ep.label}</button>
                ))}
              </div>
            )}
            <input value={urlDraft} onChange={e => setUrlDraft(e.target.value)}
              style={inputStyle} placeholder="https://api.example.com/v1"/>
          </div>

          {/* API Key */}
          <div>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1, marginBottom: 4 }}>
              API KEY
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input type={showKey ? 'text' : 'password'} value={keyDraft}
                  onChange={e => setKeyDraft(e.target.value)}
                  placeholder="粘贴你的 API Key"
                  style={{ ...inputStyle, paddingRight: 42 }}/>
                <button type="button" onClick={() => setShowKey(s => !s)} style={{
                  position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  fontFamily: t.fontMono, fontSize: 8, color: t.mute, letterSpacing: 0.5,
                }}>{showKey ? 'HIDE' : 'SHOW'}</button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={() => setEditingKey(false)} style={{
              flex: 1, padding: '5px 0', border: `1px solid ${t.rule}`, background: 'transparent',
              fontFamily: t.fontMono, fontSize: 9, color: t.mute, cursor: 'pointer', letterSpacing: 1,
            }}>取消</button>
            <button type="button" onClick={save} disabled={!keyDraft} style={{
              flex: 2, padding: '5px 0',
              border: `1px solid ${keyDraft ? t.ink : t.rule}`,
              background: keyDraft ? t.ink : 'transparent',
              fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1,
              color: keyDraft ? t.paper : t.mute,
              cursor: keyDraft ? 'pointer' : 'not-allowed',
            }}>保存</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddModelForm({ t, form, setForm, showKey, setShowKey, onAdd, onCancel }) {
  const iStyle = (extra = {}) => ({
    width: '100%', padding: '6px 8px', boxSizing: 'border-box',
    border: `1px solid ${t.rule}`, background: t.paper, color: t.ink,
    fontFamily: t.fontBody, fontSize: 12, outline: 'none',
    ...extra,
  });
  const lStyle = {
    display: 'block', fontFamily: t.fontMono, fontSize: 9,
    letterSpacing: 1, color: t.mute, textTransform: 'uppercase', marginBottom: 3,
  };
  const canSubmit = form.name && form.modelId && form.apiUrl && form.apiKey;
  return (
    <div style={{ padding: '10px 14px 12px', borderTop: `1px dashed ${t.rule}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.4, color: t.ink, textTransform: 'uppercase' }}>Add Model · 新增模型</span>
      <div>
        <label style={lStyle}>显示名称 *</label>
        <input style={iStyle()} placeholder="GPT-4o Mini" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}/>
      </div>
      <div>
        <label style={lStyle}>Model ID *</label>
        <input style={iStyle()} placeholder="gpt-4o-mini" value={form.modelId}
          onChange={e => setForm(f => ({ ...f, modelId: e.target.value }))}/>
      </div>
      <div>
        <label style={lStyle}>API Base URL *</label>
        <input style={iStyle()} placeholder="https://api.openai.com/v1" value={form.apiUrl}
          onChange={e => setForm(f => ({ ...f, apiUrl: e.target.value }))}/>
      </div>
      <div>
        <label style={lStyle}>API Key *</label>
        <div style={{ position: 'relative' }}>
          <input style={iStyle({ paddingRight: 48 })}
            type={showKey ? 'text' : 'password'}
            placeholder="sk-••••••••••••••••"
            value={form.apiKey}
            onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}/>
          <button type="button" onClick={() => setShowKey(s => !s)} style={{
            position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
            border: 'none', background: 'transparent', cursor: 'pointer',
            fontFamily: t.fontMono, fontSize: 8, color: t.mute, letterSpacing: 0.5,
          }}>{showKey ? 'HIDE' : 'SHOW'}</button>
        </div>
      </div>
      <div>
        <label style={lStyle}>Provider（选填）</label>
        <input style={iStyle()} placeholder="Custom" value={form.provider}
          onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}/>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
        <button type="button" onClick={onCancel} style={{
          flex: 1, padding: '6px 0', border: `1px solid ${t.rule}`, background: 'transparent',
          fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1, color: t.mute,
          cursor: 'pointer', textTransform: 'uppercase',
        }}>取消</button>
        <button type="button" onClick={onAdd} disabled={!canSubmit} style={{
          flex: 2, padding: '6px 0',
          border: `1px solid ${canSubmit ? t.ink : t.rule}`,
          background: canSubmit ? t.ink : 'transparent',
          fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1,
          color: canSubmit ? t.paper : t.mute,
          cursor: canSubmit ? 'pointer' : 'not-allowed', textTransform: 'uppercase',
        }}>确认添加 ↗</button>
      </div>
    </div>
  );
}

// ── Toolbar constants ─────────────────────────────────────────────────────
const BUILTIN_TONES = [
  { id: 'analytical', cn: '分析性', en: 'Analytical' },
  { id: 'narrative',  cn: '叙述性', en: 'Narrative' },
  { id: 'formal',     cn: '正式',   en: 'Formal' },
  { id: 'concise',    cn: '简洁',   en: 'Concise' },
  { id: 'persuasive', cn: '说服性', en: 'Persuasive' },
];

const BUILTIN_LANGUAGES = [
  { id: 'zh-cn', label: '简体中文', instr: '使用简体中文写作' },
  { id: 'en',    label: 'English',  instr: 'Write in English' },
  { id: 'zh-tw', label: '繁體中文', instr: '使用繁體中文寫作' },
];

const BUILTIN_STYLES = [
  { id: 'business',   cn: '商业可读', instr: '结论先行，每节开头一句话总结核心观点，适合高管快速阅读，避免术语堆砌' },
  { id: 'academic',   cn: '学术严谨', instr: '论据展开充分，逻辑严密，引用规范，适合研究报告场景' },
  { id: 'consulting', cn: '咨询框架', instr: '使用 MECE 原则分解问题，每节给出明确洞察和可执行建议，结构感强' },
  { id: 'internal',   cn: '内部简报', instr: '极度精简直接，领导扫一遍即可抓住重点，不废话不铺垫' },
];

const BASE_SYSTEM_PROMPT = `<role>
你是 Atlas Report Agent，一名专业深度报告撰写专家，具备咨询顾问、数据分析师、行业研究员的综合能力。
你的任务：将用户输入的主题转化为结构严谨、论据充分、数据可溯源的深度分析报告。
</role>

<principles>
- 结论先行（金字塔原理）：每章节第一句必须是核心结论，支撑论据居中，细节最后；结论禁止藏在段落末尾
- 每个核心观点必须有支撑：数据 / 案例 / 逻辑推断三选一，不允许空泛陈述（禁止"显著增长"等无数字的定性描述）
- 各章节必须符合 MECE 原则：互相独立、完整覆盖，无重叠无遗漏
- 数据必须标注来源机构及时间范围（如：据 McKinsey 2024 年报告 / 截至 2024Q3）
- 章节间必须有衔接过渡句，确保叙述连贯，不允许突兀跳转
</principles>

<constraints>
- 禁止：开场白（"本报告将……"）、结尾客套话、免责声明
- 禁止：将列表作为正文主体，正文以段落为主，列表仅用于并列枚举型数据
- 禁止：无数字支撑的定性结论
- 禁止：仅有标题、没有实质内容的章节
</constraints>

<visualization>
凡正文涉及可量化对比数据时，必须在该段后插入图表块（每篇报告必须插入 1–3 个，不可省略）。
图表格式：[CHART:{...JSON...}]，必填字段：type / title / source，根据数据特征选择最合适的类型：

bar（横向条形，适合排名/对比）：
[CHART:{"type":"bar","title":"标题","unit":"单位","source":"来源","data":[{"label":"A","value":42}]}]

column（纵向柱状，适合时序/分类对比）：
[CHART:{"type":"column","title":"标题","unit":"单位","source":"来源","data":[{"label":"Q1","value":120}]}]

line（折线，适合连续趋势）：
[CHART:{"type":"line","title":"标题","unit":"单位","source":"来源","data":[{"label":"2020","value":30}]}]

donut（环形，适合占比/构成，各项之和应为100%或整体总量）：
[CHART:{"type":"donut","title":"标题","unit":"%","source":"来源","data":[{"label":"A","value":45}]}]

scatter（散点，适合两变量相关性，每项需 x 和 y 值）：
[CHART:{"type":"scatter","title":"标题","xUnit":"x轴单位","yUnit":"y轴单位","source":"来源","data":[{"label":"品牌A","x":120,"y":34}]}]

radar（雷达，适合多维能力评估，3–8 个维度，value 建议 0–100）：
[CHART:{"type":"radar","title":"标题","source":"来源","data":[{"label":"维度A","value":78}]}]

combo（组合图，同一时间轴上叠加柱形+折线两组数据）：
[CHART:{"type":"combo","title":"标题","barUnit":"左轴单位","lineUnit":"右轴单位","source":"来源","data":[{"label":"Q1","bar":200,"line":18.5}]}]

规则：数据与正文完全一致；每个图表最多 8 项；不可省略 source 字段
</visualization>

<quality_check>
输出前完成以下自查，任一项不合格则修改后输出：

【结构检查】
- 各章节标题互相独立，无内容重叠（MECE）
- 每章首句是核心结论而非背景铺垫（金字塔原理）
- 章节间有过渡语句，叙述连贯不突兀
- 报告标题准确概括核心内容，体现核心洞察，非泛化标题

【数据检查】
- 所有数据均标注了来源机构名称及时间范围
- 凡出现可对比的量化数据，已插入对应图表（至少 1 个）
- 图表数据与正文数字完全一致，含 title/unit/source
- 无"显著增长""大幅下降"等未附具体数字的定性描述

【内容检查】
- 无仅有标题没有实质内容的章节
- 报告结论可独立回答用户的核心问题（可操作性）
- 已说明分析的范围边界（时间、地域、样本等）
- 各章节逻辑递进，而非平铺罗列

【格式检查】
- 第一行是 [TITLE: 精炼标题（20字以内）]
- 末尾有 [REFS]...[/REFS]，条数与正文 §N 标注一致
- 无开场白、结尾客套话、免责声明
</quality_check>`;

// O-C · prompt version tracking — short stable hash of the base system prompt.
// Changes whenever BASE_SYSTEM_PROMPT is edited, enabling per-version A/B on ratings.
function _hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16).slice(0, 6);
}
const PROMPT_VERSION = _hashStr(BASE_SYSTEM_PROMPT);

const LENGTH_PRESETS = [
  { id: 'brief',    cn: '简报', chars: 800 },
  { id: 'standard', cn: '标准', chars: 1500 },
  { id: 'deep',     cn: '深度', chars: 2500 },
  { id: 'long',     cn: '长文', chars: 4000 },
];

const GENERATION_MODES = [
  { id: 'precise',  cn: '严谨', en: 'Precise',  desc: '结构稳定，适合行业报告 / 技术分析', temperature: 0.25, topP: 0.85, frequencyPenalty: 0.20 },
  { id: 'balanced', cn: '均衡', en: 'Balanced', desc: '通用报告首选，质量与流畅度均衡',       temperature: 0.45, topP: 0.90, frequencyPenalty: 0.10 },
  { id: 'creative', cn: '探索', en: 'Creative', desc: '头脑风暴 / 探索性分析，表达更多样',   temperature: 0.75, topP: 0.95, frequencyPenalty: 0.00 },
];

// Per-model vendor-recommended params for each generation mode
const MODEL_PARAM_PRESETS = {
  'claude-opus-4-7':           { precise: { temperature:0.20, topP:0.85, frequencyPenalty:0.20 }, balanced: { temperature:0.40, topP:0.90, frequencyPenalty:0.10 }, creative: { temperature:0.70, topP:0.95, frequencyPenalty:0.00 } },
  'claude-sonnet-4-6':         { precise: { temperature:0.25, topP:0.85, frequencyPenalty:0.20 }, balanced: { temperature:0.45, topP:0.90, frequencyPenalty:0.10 }, creative: { temperature:0.75, topP:0.95, frequencyPenalty:0.00 } },
  'claude-haiku-4-5-20251001': { precise: { temperature:0.20, topP:0.85, frequencyPenalty:0.25 }, balanced: { temperature:0.40, topP:0.90, frequencyPenalty:0.15 }, creative: { temperature:0.65, topP:0.95, frequencyPenalty:0.00 } },
  'mimo-v2.5-pro':             { precise: { temperature:0.15, topP:0.80, frequencyPenalty:0.25 }, balanced: { temperature:0.30, topP:0.85, frequencyPenalty:0.15 }, creative: { temperature:0.55, topP:0.90, frequencyPenalty:0.05 } },
};
function getModelPreset(modelId, modeId) {
  const presets = MODEL_PARAM_PRESETS[modelId];
  return (presets && presets[modeId]) ? presets[modeId] : null;
}

// ── Toolbar store ─────────────────────────────────────────────────────────
function useToolbarStore() {
  const [selectedSources, setSelectedSources] = React.useState(() => new Set());
  const [attachments, setAttachments] = React.useState([]);
  const [toneId, setToneId] = React.useState('analytical');
  const [customTones, setCustomTones] = React.useState(
    () => { try { return JSON.parse(localStorage.getItem('atlas_custom_tones') || '[]'); } catch { return []; } }
  );
  const [lengthId, setLengthId] = React.useState('deep');
  const [customLength, setCustomLength] = React.useState('');
  const [languageId, setLanguageIdRaw] = React.useState(
    () => localStorage.getItem('atlas_language') || 'zh-cn'
  );
  const [customLanguages, setCustomLanguages] = React.useState(
    () => { try { return JSON.parse(localStorage.getItem('atlas_custom_languages') || '[]'); } catch { return []; } }
  );
  const [styleId, setStyleIdRaw] = React.useState(
    () => localStorage.getItem('atlas_style') || 'business'
  );
  const [activeTemplate, setActiveTemplateRaw] = React.useState(null);

  const allTones = [...BUILTIN_TONES, ...customTones];
  const currentTone = allTones.find(to => to.id === toneId) || allTones[0];
  const effectiveLength = lengthId === 'custom'
    ? (parseInt(customLength) || 2500)
    : (LENGTH_PRESETS.find(p => p.id === lengthId)?.chars || 2500);
  const [teamLanguages, setTeamLanguages] = React.useState([]);
  const allLanguages = [...BUILTIN_LANGUAGES, ...customLanguages, ...teamLanguages];
  const currentLanguage = allLanguages.find(l => l.id === languageId) || allLanguages[0];
  const currentStyle = BUILTIN_STYLES.find(s => s.id === styleId) || BUILTIN_STYLES[0];

  const addTone = (cn) => {
    const id = 'custom_' + Date.now();
    const updated = [...customTones, { id, cn, en: cn, custom: true }];
    setCustomTones(updated);
    try { localStorage.setItem('atlas_custom_tones', JSON.stringify(updated)); } catch {}
    setToneId(id);
  };

  const removeTone = (id) => {
    const updated = customTones.filter(to => to.id !== id);
    setCustomTones(updated);
    try { localStorage.setItem('atlas_custom_tones', JSON.stringify(updated)); } catch {}
    if (toneId === id) setToneId('analytical');
  };

  const setLanguageId = (id) => {
    setLanguageIdRaw(id);
    try { localStorage.setItem('atlas_language', id); } catch {}
  };

  const setStyleId = (id) => {
    setStyleIdRaw(id);
    try { localStorage.setItem('atlas_style', id); } catch {}
  };

  const addLanguage = (label) => {
    const id = 'custom_lang_' + Date.now();
    const updated = [...customLanguages, { id, label, instr: `使用${label}写作`, custom: true }];
    setCustomLanguages(updated);
    try { localStorage.setItem('atlas_custom_languages', JSON.stringify(updated)); } catch {}
    setLanguageIdRaw(id);
  };

  const removeLanguage = (id) => {
    const updated = customLanguages.filter(l => l.id !== id);
    setCustomLanguages(updated);
    try { localStorage.setItem('atlas_custom_languages', JSON.stringify(updated)); } catch {}
    if (languageId === id) setLanguageIdRaw('zh-cn');
  };

  const toggleSource = (name) => {
    setSelectedSources(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const addAttachment = (file) => {
    const reader = new FileReader();
    const isText = file.type.startsWith('text') || /\.(txt|md|csv|json|docx)$/i.test(file.name);
    reader.onload = (e) => {
      setAttachments(prev => [...prev, {
        id: Date.now() + '_' + file.name,
        name: file.name,
        size: file.size,
        type: file.type,
        content: typeof e.target.result === 'string' ? e.target.result.slice(0, 8000) : '[binary]',
      }]);
    };
    isText ? reader.readAsText(file) : reader.readAsDataURL(file);
  };

  const removeAttachment = (id) => setAttachments(prev => prev.filter(a => a.id !== id));

  const [urlContexts, setUrlContexts] = React.useState(
    () => { try { return JSON.parse(localStorage.getItem('atlas_url_contexts') || '[]'); } catch { return []; } }
  );
  const addUrlContext = (url) => {
    const trimmed = url.trim();
    if (!trimmed || urlContexts.includes(trimmed)) return;
    const updated = [...urlContexts, trimmed];
    setUrlContexts(updated);
    try { localStorage.setItem('atlas_url_contexts', JSON.stringify(updated)); } catch {}
  };
  const removeUrlContext = (url) => {
    const updated = urlContexts.filter(u => u !== url);
    setUrlContexts(updated);
    try { localStorage.setItem('atlas_url_contexts', JSON.stringify(updated)); } catch {}
  };

  // Tavily search results added to context (already have content, no Jina fetch needed)
  const [searchContexts, setSearchContexts] = React.useState([]);
  const addSearchContext = (item) => {
    setSearchContexts(prev => prev.find(s => s.url === item.url) ? prev : [...prev, item]);
  };
  const removeSearchContext = (url) => setSearchContexts(prev => prev.filter(s => s.url !== url));
  const clearSearchContexts = () => setSearchContexts([]);

  const setActiveTemplate = (tpl) => setActiveTemplateRaw(tpl);
  const clearActiveTemplate = () => setActiveTemplateRaw(null);

  return {
    selectedSources, toggleSource,
    attachments, addAttachment, removeAttachment,
    urlContexts, addUrlContext, removeUrlContext,
    searchContexts, addSearchContext, removeSearchContext, clearSearchContexts,
    toneId, setToneId, allTones, currentTone, addTone, removeTone,
    lengthId, setLengthId, customLength, setCustomLength, effectiveLength,
    languageId, setLanguageId, allLanguages, currentLanguage, addLanguage, removeLanguage, setTeamLanguages,
    styleId, setStyleId, currentStyle,
    activeTemplate, setActiveTemplate, clearActiveTemplate,
  };
}

// ── ToolPopover (shared popover container) ────────────────────────────────
function ToolPopover({ t, label, open, onOpen, onClose, children, width = 280 }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open, onClose]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div onClick={open ? onClose : onOpen} style={{
        display: 'inline-flex', alignItems: 'center',
        fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
        padding: '3px 8px', border: `1px solid ${open ? t.ink : t.rule}`,
        background: open ? t.ink : 'transparent',
        color: open ? t.paper : t.ink,
        cursor: 'pointer', userSelect: 'none', transition: 'all 0.12s',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </div>
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, zIndex: 200,
          width, background: t.cardOn, border: `1px solid ${t.ink}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── SourcesPopover ────────────────────────────────────────────────────────
function SourcesPopover({ t, store, onNavigateSources }) {
  const [open, setOpen] = React.useState(false);
  const [catFilter, setCatFilter] = React.useState('all');
  const allSources = typeof SOURCES !== 'undefined' ? SOURCES : [];
  const allCats = typeof SOURCE_CATEGORIES !== 'undefined' ? SOURCE_CATEGORIES : [];
  const filtered = catFilter === 'all' ? allSources : allSources.filter(s => s.type === catFilter);
  const count = store.selectedSources.size;

  return (
    <ToolPopover t={t} label={`＋ 数据源${count > 0 ? ` (${count})` : ''}`}
      open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} width={320}>
      <div style={{ padding: '6px 10px 6px', borderBottom: `1px solid ${t.rule}`, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {allCats.map(c => (
          <button key={c.k} onClick={() => setCatFilter(c.k)} style={{
            fontFamily: t.fontMono, fontSize: 8, letterSpacing: 0.8,
            padding: '3px 7px', border: `1px solid ${catFilter === c.k ? t.ink : t.rule}`,
            background: catFilter === c.k ? t.ink : 'transparent',
            color: catFilter === c.k ? t.paper : t.mute,
            cursor: 'pointer', transition: 'all 0.1s',
          }}>{c.cn}</button>
        ))}
      </div>
      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
        {filtered.map(s => {
          const checked = store.selectedSources.has(s.name);
          return (
            <div key={s.name} onClick={() => store.toggleSource(s.name)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
              cursor: 'pointer', background: checked ? t.paperAlt : 'transparent',
              borderBottom: `1px solid ${t.rule}`,
            }}>
              <div style={{
                width: 11, height: 11, flexShrink: 0,
                border: `1px solid ${checked ? t.accent : t.rule}`,
                background: checked ? t.accent : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {checked && <span style={{ color: t.paper, fontSize: 8, lineHeight: 1 }}>✓</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: t.fontCN, fontSize: 12, color: t.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.name}
                </div>
                <div style={{ fontFamily: t.fontMono, fontSize: 8, color: t.mute, marginTop: 1 }}>{s.kind}</div>
              </div>
              {s.quality && (
                <span style={{ fontFamily: t.fontMono, fontSize: 8, letterSpacing: 0.5, padding: '1px 4px', flexShrink: 0,
                  color: s.quality === 'A' ? '#2a8c5c' : s.quality === 'B' ? '#7a6a3a' : '#9b1c14',
                  border: `1px solid ${s.quality === 'A' ? '#2a8c5c' : s.quality === 'B' ? '#c2a04a' : '#9b1c14'}` }}>
                  {s.quality}
                </span>
              )}
              <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: s.status === 'ok' ? '#5B8A6A' : '#C4844A' }}/>
            </div>
          );
        })}
      </div>
      <div style={{ padding: '8px 12px' }}>
        <button onClick={() => { setOpen(false); onNavigateSources?.(); }} style={{
          width: '100%', padding: '6px 0', background: 'transparent',
          border: `1px solid ${t.rule}`, fontFamily: t.fontMono, fontSize: 9,
          letterSpacing: 0.8, color: t.mute, cursor: 'pointer',
        }}>管理全部数据源 →</button>
      </div>
    </ToolPopover>
  );
}

// ── UrlContextPopover ─────────────────────────────────────────────────────
function UrlContextPopover({ t, store }) {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState('url'); // 'url' | 'search'
  const [draft, setDraft] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [searching, setSearching] = React.useState(false);
  const [searchError, setSearchError] = React.useState('');

  const urlCount = store.urlContexts.length;
  const searchCount = store.searchContexts.length;
  const totalCount = urlCount + searchCount;

  const handleAdd = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed;
    store.addUrlContext(withProto);
    setDraft('');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError('');
    setSearchResults([]);
    try {
      const { supabase: sb } = await import('./lib/supabase.js');
      const { data: { session } } = await sb.auth.getSession();
      const token = session?.access_token;
      const resp = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query: searchQuery.trim(), maxResults: 6 }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || `搜索失败 ${resp.status}`);
      setSearchResults(data.results || []);
    } catch (e) {
      setSearchError(e.message);
    } finally {
      setSearching(false);
    }
  };

  const hostOf = (url) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } };

  const tabStyle = (active) => ({
    flex: 1, padding: '5px 0', fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1,
    background: active ? t.ink : 'transparent', color: active ? t.paper : t.mute,
    border: 'none', cursor: 'pointer', textTransform: 'uppercase',
  });

  return (
    <ToolPopover t={t} label={`↗ 网页${totalCount > 0 ? ` (${totalCount})` : ''}`}
      open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} width={360}>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${t.rule}` }}>
        <button onClick={() => setTab('url')} style={tabStyle(tab === 'url')}>URL 贴入</button>
        <button onClick={() => setTab('search')} style={tabStyle(tab === 'search')}>⊕ Tavily 搜索</button>
      </div>

      {tab === 'url' && (
        <>
          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${t.rule}` }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.2, color: t.mute, marginBottom: 8 }}>
              URL CONTEXT · 生成前自动抓取正文
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="https://example.com/article"
                style={{ flex: 1, border: `1px solid ${t.rule}`, padding: '5px 8px', fontFamily: t.fontBody, fontSize: 12, color: t.ink, background: t.paper, outline: 'none', minWidth: 0 }}
              />
              <button onClick={handleAdd} disabled={!draft.trim()} style={{
                padding: '5px 10px', fontFamily: t.fontMono, fontSize: 9, letterSpacing: 0.8,
                border: `1px solid ${draft.trim() ? t.ink : t.rule}`,
                background: draft.trim() ? t.ink : 'transparent',
                color: draft.trim() ? t.paper : t.mute,
                cursor: draft.trim() ? 'pointer' : 'default',
              }}>ADD</button>
            </div>
          </div>
          {urlCount === 0 ? (
            <div style={{ padding: '14px 12px', fontFamily: t.fontCN, fontSize: 12, color: t.mute, textAlign: 'center' }}>
              粘贴网页 URL，生成时自动抓取正文注入上下文
            </div>
          ) : (
            <div style={{ maxHeight: 180, overflowY: 'auto' }}>
              {store.urlContexts.map((url, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderBottom: `1px solid ${t.rule}` }}>
                  <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.accent, flexShrink: 0 }}>↗</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={url}>{hostOf(url)}</div>
                    <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</div>
                  </div>
                  <button onClick={() => store.removeUrlContext(url)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.mute, fontSize: 14, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}>×</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ padding: '6px 12px', background: t.faint, borderTop: `1px solid ${t.rule}` }}>
            <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>
              通过 Jina Reader API 抓取 · 每条截取前 2000 字
            </span>
          </div>
        </>
      )}

      {tab === 'search' && (
        <>
          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${t.rule}` }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.2, color: t.mute, marginBottom: 8 }}>
              TAVILY SEARCH · 实时联网搜索，结果直接注入上下文
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="输入搜索关键词…"
                style={{ flex: 1, border: `1px solid ${t.rule}`, padding: '5px 8px', fontFamily: t.fontBody, fontSize: 12, color: t.ink, background: t.paper, outline: 'none', minWidth: 0 }}
              />
              <button onClick={handleSearch} disabled={!searchQuery.trim() || searching} style={{
                padding: '5px 10px', fontFamily: t.fontMono, fontSize: 9, letterSpacing: 0.8,
                border: `1px solid ${searchQuery.trim() && !searching ? t.ink : t.rule}`,
                background: searchQuery.trim() && !searching ? t.ink : 'transparent',
                color: searchQuery.trim() && !searching ? t.paper : t.mute,
                cursor: searchQuery.trim() && !searching ? 'pointer' : 'default',
              }}>{searching ? '…' : 'SEARCH'}</button>
            </div>
            {searchError && <div style={{ marginTop: 6, fontFamily: t.fontMono, fontSize: 9, color: '#c44' }}>{searchError}</div>}
          </div>

          {/* Already added search contexts */}
          {searchCount > 0 && (
            <div style={{ borderBottom: `1px solid ${t.rule}` }}>
              <div style={{ padding: '4px 12px', fontFamily: t.fontMono, fontSize: 9, color: t.mute, background: t.faint }}>已添加 ({searchCount})</div>
              {store.searchContexts.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderBottom: `1px solid ${t.rule}` }}>
                  <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.accent, flexShrink: 0 }}>⊕</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: t.fontBody, fontSize: 11, color: t.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title || hostOf(item.url)}</div>
                    <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hostOf(item.url)}</div>
                  </div>
                  <button onClick={() => store.removeSearchContext(item.url)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.mute, fontSize: 14, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Search results */}
          {searchResults.length > 0 && (
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {searchResults.map((r, i) => {
                const alreadyAdded = store.searchContexts.some(s => s.url === r.url);
                return (
                  <div key={i} style={{ padding: '8px 12px', borderBottom: `1px solid ${t.rule}`, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: t.fontBody, fontSize: 12, color: t.ink, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                      <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hostOf(r.url)}</div>
                      <div style={{ fontFamily: t.fontCN, fontSize: 11, color: t.mute, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.content}</div>
                    </div>
                    <button onClick={() => !alreadyAdded && store.addSearchContext(r)} style={{
                      flexShrink: 0, marginTop: 2, padding: '3px 8px', fontFamily: t.fontMono, fontSize: 9, letterSpacing: 0.8,
                      border: `1px solid ${alreadyAdded ? t.rule : t.ink}`,
                      background: alreadyAdded ? t.faint : t.ink,
                      color: alreadyAdded ? t.mute : t.paper,
                      cursor: alreadyAdded ? 'default' : 'pointer',
                    }}>{alreadyAdded ? '✓' : '+ ADD'}</button>
                  </div>
                );
              })}
            </div>
          )}

          {!searching && searchResults.length === 0 && searchCount === 0 && (
            <div style={{ padding: '14px 12px', fontFamily: t.fontCN, fontSize: 12, color: t.mute, textAlign: 'center' }}>
              输入关键词搜索，将结果添加为参考资料
            </div>
          )}
        </>
      )}
    </ToolPopover>
  );
}

// ── AttachmentsPopover ────────────────────────────────────────────────────
function AttachmentsPopover({ t, store }) {
  const [open, setOpen] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const fileRef = React.useRef(null);
  const count = store.attachments.length;
  const handleFiles = (files) => Array.from(files).forEach(f => store.addAttachment(f));
  const fmt = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b/1024).toFixed(1)+' KB' : (b/1048576).toFixed(1)+' MB';

  return (
    <ToolPopover t={t} label={count > 0 ? `＋ 附件 (${count})` : '＋ 附件'}
      open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} width={280}>
      {count > 0 && (
        <div style={{ borderBottom: `1px solid ${t.rule}` }}>
          {store.attachments.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderBottom: `1px solid ${t.rule}` }}>
              <span style={{ fontFamily: t.fontMono, fontSize: 8, color: t.paper, background: t.mute, padding: '1px 4px', flexShrink: 0 }}>
                {a.name.split('.').pop().toUpperCase()}
              </span>
              <span style={{ flex: 1, fontFamily: t.fontCN, fontSize: 12, color: t.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {a.name}
              </span>
              <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, flexShrink: 0 }}>{fmt(a.size)}</span>
              <button onClick={(e) => { e.stopPropagation(); store.removeAttachment(a.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.mute, fontSize: 14, padding: '0 2px', lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        style={{
          margin: '10px 12px', padding: '18px 12px', textAlign: 'center', cursor: 'pointer',
          border: `1px dashed ${dragOver ? t.ink : t.rule}`,
          background: dragOver ? t.paperAlt : 'transparent', transition: 'all 0.15s',
        }}
      >
        <input ref={fileRef} type="file" multiple accept=".pdf,.txt,.md,.csv,.docx,.json"
          style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)}/>
        <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 0.8 }}>拖拽文件或点击上传</div>
        <div style={{ fontFamily: t.fontMono, fontSize: 8, color: t.mute, marginTop: 4, opacity: 0.7 }}>PDF · TXT · CSV · DOCX · JSON</div>
      </div>
    </ToolPopover>
  );
}

// ── TonePopover ───────────────────────────────────────────────────────────
function TonePopover({ t, store }) {
  const [open, setOpen] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const inputRef = React.useRef(null);

  React.useEffect(() => { if (adding && inputRef.current) inputRef.current.focus(); }, [adding]);

  const submit = () => {
    if (draft.trim()) { store.addTone(draft.trim()); setDraft(''); setAdding(false); }
  };

  return (
    <ToolPopover t={t} label={`语气 · ${store.currentTone?.cn || '分析性'}`}
      open={open} onOpen={() => setOpen(true)} onClose={() => { setOpen(false); setAdding(false); setDraft(''); }} width={220}>
      <div style={{ padding: '6px 0' }}>
        {store.allTones.map(tone => {
          const active = tone.id === store.toneId;
          return (
            <div key={tone.id} style={{
              display: 'flex', alignItems: 'center', padding: '7px 12px',
              cursor: 'pointer', background: active ? t.paperAlt : 'transparent',
              borderBottom: `1px solid ${t.rule}`,
            }}>
              <div onClick={() => store.setToneId(tone.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  border: `1px solid ${active ? t.ink : t.rule}`,
                  background: active ? t.ink : 'transparent',
                }}/>
                <span style={{ fontFamily: t.fontCN, fontSize: 13, color: t.ink }}>{tone.cn}</span>
                {!tone.custom && (
                  <span style={{ fontFamily: t.fontMono, fontSize: 8, color: t.mute, marginLeft: 'auto' }}>{tone.en}</span>
                )}
              </div>
              {tone.custom && (
                <button onClick={(e) => { e.stopPropagation(); store.removeTone(tone.id); }} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: t.mute, fontSize: 12, padding: '0 2px', lineHeight: 1,
                }}>×</button>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ padding: '8px 10px', borderTop: `1px solid ${t.rule}` }}>
        {!adding ? (
          <button onClick={() => setAdding(true)} style={{
            width: '100%', padding: '5px 0', background: 'transparent',
            border: `1px solid ${t.rule}`, fontFamily: t.fontMono, fontSize: 9,
            letterSpacing: 0.8, color: t.mute, cursor: 'pointer',
          }}>＋ 新增语气</button>
        ) : (
          <div style={{ display: 'flex', gap: 5 }}>
            <input ref={inputRef} value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setAdding(false); setDraft(''); }}}
              placeholder="如：批判性"
              style={{ flex: 1, padding: '4px 7px', fontFamily: t.fontCN, fontSize: 12, border: `1px solid ${t.ink}`, background: t.cardOn, color: t.ink, outline: 'none' }}
            />
            <button disabled={!draft.trim()} onClick={submit} style={{
              padding: '4px 10px', background: draft.trim() ? t.ink : t.rule, border: 'none',
              fontFamily: t.fontMono, fontSize: 9, letterSpacing: 0.5, color: t.paper,
              cursor: draft.trim() ? 'pointer' : 'not-allowed',
            }}>确认</button>
          </div>
        )}
      </div>
    </ToolPopover>
  );
}

// ── LanguagePopover ───────────────────────────────────────────────────────
function LanguagePopover({ t, store }) {
  const [open, setOpen] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const inputRef = React.useRef(null);
  React.useEffect(() => { if (adding && inputRef.current) inputRef.current.focus(); }, [adding]);
  const submit = () => {
    if (draft.trim()) { store.addLanguage(draft.trim()); setDraft(''); setAdding(false); }
  };
  return (
    <ToolPopover t={t} label={`语言 · ${store.currentLanguage?.label || '简体中文'}`}
      open={open} onOpen={() => setOpen(true)} onClose={() => { setOpen(false); setAdding(false); setDraft(''); }} width={200}>
      <div style={{ padding: '6px 0' }}>
        {store.allLanguages.map(lang => {
          const active = lang.id === store.languageId;
          return (
            <div key={lang.id} style={{ display: 'flex', alignItems: 'center', padding: '7px 12px', cursor: 'pointer', background: active ? t.paperAlt : 'transparent', borderBottom: `1px solid ${t.rule}` }}>
              <div onClick={() => { store.setLanguageId(lang.id); setOpen(false); }} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, border: `1px solid ${active ? t.ink : t.rule}`, background: active ? t.ink : 'transparent' }}/>
                <span style={{ fontFamily: t.fontCN, fontSize: 13, color: t.ink }}>{lang.label}</span>
              </div>
              {lang.teamItem ? (
                <span style={{ fontFamily: t.fontMono, fontSize: 7.5, color: '#1d4ed8', border: '1px solid #1d4ed8', padding: '1px 4px', letterSpacing: 0.5 }}>TEAM</span>
              ) : lang.custom ? (
                <button onClick={(e) => { e.stopPropagation(); store.removeLanguage(lang.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.mute, fontSize: 14, padding: '0 2px', lineHeight: 1 }}>×</button>
              ) : null}
            </div>
          );
        })}
      </div>
      <div style={{ padding: '8px 10px', borderTop: `1px solid ${t.rule}` }}>
        {!adding ? (
          <button onClick={() => setAdding(true)} style={{ width: '100%', padding: '5px 0', background: 'transparent', border: `1px solid ${t.rule}`, fontFamily: t.fontMono, fontSize: 9, letterSpacing: 0.8, color: t.mute, cursor: 'pointer' }}>＋ 新增语言</button>
        ) : (
          <div style={{ display: 'flex', gap: 5 }}>
            <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setAdding(false); setDraft(''); } }}
              placeholder="如：日本語"
              style={{ flex: 1, padding: '4px 7px', fontFamily: t.fontCN, fontSize: 12, border: `1px solid ${t.ink}`, background: t.cardOn, color: t.ink, outline: 'none' }}/>
            <button disabled={!draft.trim()} onClick={submit} style={{ padding: '4px 10px', background: draft.trim() ? t.ink : t.rule, border: 'none', fontFamily: t.fontMono, fontSize: 9, color: t.paper, cursor: draft.trim() ? 'pointer' : 'not-allowed' }}>确认</button>
          </div>
        )}
      </div>
    </ToolPopover>
  );
}

// ── StylePopover ──────────────────────────────────────────────────────────
function StylePopover({ t, store }) {
  const [open, setOpen] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const inputRef = React.useRef(null);
  React.useEffect(() => { if (adding && inputRef.current) inputRef.current.focus(); }, [adding]);
  const submitTone = () => {
    if (draft.trim()) { store.addTone(draft.trim()); setDraft(''); setAdding(false); }
  };
  const sectionHdr = { fontFamily: t.fontMono, fontSize: 8, letterSpacing: 1.4, color: t.mute, padding: '7px 12px 4px', textTransform: 'uppercase' };

  return (
    <ToolPopover t={t} label={`风格 · ${store.currentStyle?.cn || '商业可读'}`}
      open={open} onOpen={() => setOpen(true)} onClose={() => { setOpen(false); setAdding(false); setDraft(''); }} width={260}>
      <div style={{ maxHeight: '52vh', overflowY: 'auto' }}>
        <div style={sectionHdr}>报告风格</div>
        <div style={{ paddingBottom: 4 }}>
          {BUILTIN_STYLES.map(style => {
            const active = style.id === store.styleId;
            return (
              <div key={style.id} onClick={() => store.setStyleId(style.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer', background: active ? t.paperAlt : 'transparent', borderBottom: `1px solid ${t.rule}` }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, border: `1px solid ${active ? t.ink : t.rule}`, background: active ? t.ink : 'transparent' }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: t.fontCN, fontSize: 13, color: t.ink }}>{style.cn}</div>
                  <div style={{ fontFamily: t.fontCN, fontSize: 10, color: t.mute, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{style.instr.slice(0, 22)}…</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ ...sectionHdr, borderTop: `1px solid ${t.rule}`, paddingTop: 9 }}>写作语气</div>
        <div style={{ paddingBottom: 4 }}>
          {store.allTones.map(tone => {
            const active = tone.id === store.toneId;
            return (
              <div key={tone.id} style={{ display: 'flex', alignItems: 'center', padding: '7px 12px', cursor: 'pointer', background: active ? t.paperAlt : 'transparent', borderBottom: `1px solid ${t.rule}` }}>
                <div onClick={() => store.setToneId(tone.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, border: `1px solid ${active ? t.ink : t.rule}`, background: active ? t.ink : 'transparent' }}/>
                  <span style={{ fontFamily: t.fontCN, fontSize: 13, color: t.ink }}>{tone.cn}</span>
                  {!tone.custom && <span style={{ fontFamily: t.fontMono, fontSize: 8, color: t.mute, marginLeft: 'auto' }}>{tone.en}</span>}
                </div>
                {tone.custom && (
                  <button onClick={e => { e.stopPropagation(); store.removeTone(tone.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.mute, fontSize: 12, padding: '0 2px', lineHeight: 1 }}>×</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ padding: '7px 10px', borderTop: `1px solid ${t.rule}` }}>
        {!adding ? (
          <button onClick={() => setAdding(true)} style={{ width: '100%', padding: '4px 0', background: 'transparent', border: `1px solid ${t.rule}`, fontFamily: t.fontMono, fontSize: 9, letterSpacing: 0.8, color: t.mute, cursor: 'pointer' }}>＋ 新增语气</button>
        ) : (
          <div style={{ display: 'flex', gap: 5 }}>
            <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitTone(); if (e.key === 'Escape') { setAdding(false); setDraft(''); } }}
              placeholder="如：批判性"
              style={{ flex: 1, padding: '4px 7px', fontFamily: t.fontCN, fontSize: 12, border: `1px solid ${t.ink}`, background: t.cardOn, color: t.ink, outline: 'none' }}
            />
            <button disabled={!draft.trim()} onClick={submitTone} style={{ padding: '4px 10px', background: draft.trim() ? t.ink : t.rule, border: 'none', fontFamily: t.fontMono, fontSize: 9, color: t.paper, cursor: draft.trim() ? 'pointer' : 'not-allowed' }}>确认</button>
          </div>
        )}
      </div>
    </ToolPopover>
  );
}

// ── LengthPopover ─────────────────────────────────────────────────────────
function LengthPopover({ t, store }) {
  const [open, setOpen] = React.useState(false);
  const preset = LENGTH_PRESETS.find(p => p.id === store.lengthId);
  const displayLen = store.lengthId === 'custom'
    ? `${store.customLength || '?'} 字`
    : `${(preset?.chars || 2500).toLocaleString()} 字`;

  return (
    <ToolPopover t={t} label={`长度 · ${displayLen}`}
      open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} width={220}>
      <div style={{ padding: '6px 0' }}>
        {LENGTH_PRESETS.map(p => {
          const active = store.lengthId === p.id;
          return (
            <div key={p.id} onClick={() => store.setLengthId(p.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px',
              cursor: 'pointer', background: active ? t.paperAlt : 'transparent',
              borderBottom: `1px solid ${t.rule}`,
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                border: `1px solid ${active ? t.ink : t.rule}`,
                background: active ? t.ink : 'transparent',
              }}/>
              <span style={{ fontFamily: t.fontCN, fontSize: 13, color: t.ink }}>{p.cn}</span>
              <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginLeft: 'auto' }}>
                {p.chars.toLocaleString()} 字
              </span>
            </div>
          );
        })}
        <div style={{ padding: '8px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div onClick={() => store.setLengthId('custom')} style={{
              width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
              border: `1px solid ${store.lengthId === 'custom' ? t.ink : t.rule}`,
              background: store.lengthId === 'custom' ? t.ink : 'transparent',
              cursor: 'pointer',
            }}/>
            <span style={{ fontFamily: t.fontCN, fontSize: 13, color: t.ink }}>自定义</span>
            <input type="number" min={100} max={10000}
              value={store.customLength}
              onChange={e => { store.setCustomLength(e.target.value); store.setLengthId('custom'); }}
              placeholder="100–10000"
              style={{
                flex: 1, padding: '3px 6px', fontFamily: t.fontMono, fontSize: 11,
                border: `1px solid ${t.rule}`, background: t.cardOn, color: t.ink, outline: 'none', minWidth: 0,
              }}
            />
            <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, flexShrink: 0 }}>字</span>
          </div>
        </div>
      </div>
    </ToolPopover>
  );
}

// ── GenerationModePopover ─────────────────────────────────────────────────
function GenerationModePopover({ t, modelStore }) {
  const [open, setOpen] = React.useState(false);
  const modelId = modelStore.selected?.id;
  const userTemplates = (modelStore.modelParamTemplates || {})[modelId] || [];
  const activeMode = modelStore.generationMode;
  const currentBuiltin = GENERATION_MODES.find(m => m.id === activeMode);
  const currentTpl = userTemplates.find(t => t.id === activeMode);
  const labelText = currentBuiltin ? currentBuiltin.cn : currentTpl ? currentTpl.name : '自定义';
  const label = `◈ ${labelText}`;

  return (
    <ToolPopover t={t} label={label}
      open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} width={290}>
      <div style={{ padding: '8px 12px 4px', borderBottom: `1px solid ${t.rule}` }}>
        <div style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.2, color: t.mute }}>
          GENERATION MODE · 生成模式
        </div>
      </div>
      <div>
        {GENERATION_MODES.map(m => {
          const active = activeMode === m.id;
          const preset = getModelPreset(modelId, m.id) || m;
          return (
            <div key={m.id} onClick={() => { modelStore.setGenerationMode(m.id); setOpen(false); }} style={{
              padding: '10px 14px', cursor: 'pointer', borderBottom: `1px solid ${t.rule}`,
              background: active ? t.faint : 'transparent',
              borderLeft: active ? `3px solid ${t.accent}` : '3px solid transparent',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                <span style={{ fontFamily: t.fontCN, fontSize: 13, fontWeight: active ? 700 : 400, color: t.ink }}>{m.cn}</span>
                <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 0.8 }}>{m.en}</span>
                {active && <span style={{ fontFamily: t.fontMono, fontSize: 8, color: t.accent, marginLeft: 'auto' }}>✓ 当前</span>}
              </div>
              <div style={{ fontFamily: t.fontCN, fontSize: 11, color: t.mute, lineHeight: 1.5 }}>{m.desc}</div>
              <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginTop: 4, opacity: 0.7 }}>
                temp {preset.temperature} · top_p {preset.topP} · fp +{preset.frequencyPenalty.toFixed(2)}
              </div>
            </div>
          );
        })}
        {activeMode === 'custom' && (
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${t.rule}`, borderLeft: `3px solid ${t.accent}`, background: t.faint }}>
            <div style={{ fontFamily: t.fontCN, fontSize: 13, fontWeight: 700, color: t.ink, marginBottom: 3 }}>自定义</div>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>
              temp {Number(modelStore.temperature).toFixed(2)} · top_p {Number(modelStore.topP).toFixed(2)} · fp {(modelStore.frequencyPenalty >= 0 ? '+' : '') + Number(modelStore.frequencyPenalty).toFixed(2)}
            </div>
          </div>
        )}
        {userTemplates.length > 0 && (
          <div style={{ borderTop: `1px solid ${t.rule}` }}>
            <div style={{ padding: '5px 14px 3px', fontFamily: t.fontMono, fontSize: 8, color: t.mute, letterSpacing: 1, textTransform: 'uppercase' }}>
              {modelStore.selected?.name} · 自定义模板
            </div>
            {userTemplates.map(tpl => {
              const active = activeMode === tpl.id;
              return (
                <div key={tpl.id} onClick={() => { modelStore.setGenerationMode(tpl.id); setOpen(false); }} style={{
                  padding: '8px 14px', cursor: 'pointer', borderBottom: `1px solid ${t.rule}`,
                  background: active ? t.faint : 'transparent',
                  borderLeft: active ? `3px solid ${t.accent}` : '3px solid transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontFamily: t.fontCN, fontSize: 12, fontWeight: active ? 700 : 400, color: t.ink, flex: 1 }}>{tpl.name}</span>
                    {active && <span style={{ fontFamily: t.fontMono, fontSize: 8, color: t.accent }}>✓ 当前</span>}
                  </div>
                  <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, opacity: 0.7 }}>
                    temp {Number(tpl.temperature).toFixed(2)} · top_p {Number(tpl.topP).toFixed(2)} · fp {(tpl.frequencyPenalty >= 0 ? '+' : '') + Number(tpl.frequencyPenalty).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ padding: '6px 12px', background: t.faint, borderTop: `1px solid ${t.rule}` }}>
        <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>手动调参后自动切换为「自定义」· 模板在设置中管理</span>
      </div>
    </ToolPopover>
  );
}

// ── PromptComposer ──────────────────────────────────────────────────────

// ── TemplateLockBadge ─────────────────────────────────────────────────────
function TemplateLockBadge({ t, store }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const tpl = store.activeTemplate;
  if (!tpl) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
        padding: '3px 8px', border: `1px solid ${t.accent}`,
        background: open ? t.accent : 'transparent',
        color: open ? t.paper : t.accent,
        cursor: 'pointer', userSelect: 'none',
      }}>
        ◆ {tpl.en} · {tpl.sections.length} 章节
        <span onClick={(e) => { e.stopPropagation(); store.clearActiveTemplate(); }}
          style={{ marginLeft: 3, opacity: 0.7, fontSize: 11, lineHeight: 1 }}>×</span>
      </div>
      {open && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0, marginBottom: 6,
          background: t.paper, border: `1.5px solid ${t.ink}`,
          boxShadow: `3px 3px 0 rgba(0,0,0,0.12)`, zIndex: 200, width: 320, padding: '10px 0',
        }}>
          <div style={{ padding: '6px 14px 10px', borderBottom: `1px solid ${t.rule}` }}>
            <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: t.accent }}>{tpl.en}</div>
            {tpl.cn && <div style={{ fontFamily: t.fontCN, fontSize: 12, color: t.mute, marginTop: 2 }}>{tpl.cn}</div>}
          </div>
          {tpl.sections.map((s, i) => (
            <div key={i} style={{ padding: '8px 14px', borderBottom: `1px solid ${t.rule}` }}>
              <div style={{ fontFamily: t.fontCN, fontSize: 12, fontWeight: 600, color: t.ink, marginBottom: 3 }}>
                {['一','二','三','四','五','六','七','八'][i]}、{s.title}
              </div>
              <div style={{ fontFamily: t.fontCN, fontSize: 11, color: t.mute, lineHeight: 1.5 }}>{s.req}</div>
            </div>
          ))}
          <div style={{ padding: '8px 14px' }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 8, color: t.mute, letterSpacing: 0.5 }}>
              章节结构已注入 System Prompt · 点击 × 取消锁定
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StartWritingBtn({ t, disabled, onStart, onWorkflow, onBackground, bgTaskStatus }) {
  const [hover, setHover] = React.useState(false);
  const leaveTimer = React.useRef(null);
  const ref = React.useRef(null);

  const show = hover && !disabled && (onWorkflow || onBackground);

  const handleEnter = () => { clearTimeout(leaveTimer.current); setHover(true); };
  const handleLeave = () => { leaveTimer.current = setTimeout(() => setHover(false), 180); };

  const bgLabel = bgTaskStatus === 'queued' ? '排队中…' : bgTaskStatus === 'running' ? '生成中…' : bgTaskStatus === 'done' ? '✓ 后台完成' : bgTaskStatus === 'failed' ? '✕ 失败' : '后台生成';
  const bgDisabled = disabled || bgTaskStatus === 'queued' || bgTaskStatus === 'running';

  const optionStyle = (dim) => ({
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%', padding: '9px 14px', textAlign: 'left',
    fontFamily: t.fontMono, fontSize: 10, letterSpacing: 0.8,
    background: 'none', border: 'none',
    borderBottom: `1px solid ${t.rule}`,
    color: dim ? t.mute : t.ink,
    cursor: dim ? 'default' : 'pointer',
  });

  return (
    <div ref={ref} style={{ position: 'relative' }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {show && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 5px)', right: 0,
          background: t.paper, border: `1px solid ${t.ink}`,
          minWidth: 170, zIndex: 200,
          boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
          animation: 'fadeInUp 0.1s ease',
        }}>
          <div style={{ padding: '5px 14px 4px', fontFamily: t.fontMono, fontSize: 8, letterSpacing: 1.2, color: t.mute, borderBottom: `1px solid ${t.rule}` }}>
            모드 선택 · MODE
          </div>
          {onWorkflow && (
            <button style={optionStyle(disabled)} onClick={() => { if (!disabled) { setHover(false); onWorkflow(); } }}>
              <span style={{ color: t.accent }}>◈</span> 工作流模式
            </button>
          )}
          {onBackground && (
            <button style={{ ...optionStyle(bgDisabled), borderBottom: 'none' }}
              onClick={() => { if (!bgDisabled) { setHover(false); onBackground(); } }}>
              <span style={{ color: bgDisabled ? t.mute : t.accent }}>◈</span> {bgLabel}
            </button>
          )}
        </div>
      )}
      <button onClick={() => !disabled && onStart()} disabled={disabled} style={{
        padding: '7px 16px', fontFamily: t.fontMono, fontSize: 11, letterSpacing: 0.8,
        border: `1px solid ${disabled ? t.rule : t.accent}`,
        background: disabled ? 'transparent' : t.accent,
        color: disabled ? t.mute : '#fff',
        cursor: disabled ? 'default' : 'pointer',
      }}>
        Start writing ↗
      </button>
    </div>
  );
}

// G-2 · approximate per-provider pricing (USD per 1M tokens). Rough public list
// prices for a runaway-spend guard, NOT billing-accurate.
const MODEL_PRICING = {
  mimo:      { in: 0.15, out: 0.55 },
  deepseek:  { in: 0.27, out: 1.10 },
  openai:    { in: 2.50, out: 10.0 },
  anthropic: { in: 3.00, out: 15.0 },
  _default:  { in: 1.00, out: 4.00 },
};

// Rough token + cost estimate for a planned generation.
function estimateGeneration(promptChars, targetLength, provider) {
  const estIn = Math.round((promptChars + 2000) * 1.3);     // prompt + system scaffold
  const estOut = Math.round((targetLength || 2500) * 1.7);  // CN chars → tokens
  const p = MODEL_PRICING[provider] || MODEL_PRICING._default;
  const usd = (estIn * p.in + estOut * p.out) / 1e6;
  return { tokens: estIn + estOut, usd };
}

// G-3 · daily generation soft limit. Warns past the threshold; user may proceed.
// Returns false if the user cancels. Increments today's count on proceed.
const DAILY_GEN_LIMIT = 30;
function allowDailyGen() {
  const today = new Date().toISOString().slice(0, 10);
  let rec;
  try { rec = JSON.parse(localStorage.getItem('atlas_daily_gen') || '{}'); } catch { rec = {}; }
  if (rec.date !== today) rec = { date: today, count: 0 };
  if (rec.count >= DAILY_GEN_LIMIT) {
    if (!window.confirm(`今日已生成 ${rec.count} 次，已达软上限 ${DAILY_GEN_LIMIT} 次。\n频繁生成可能产生较多 API 费用，确认继续？`)) return false;
  }
  rec.count++;
  try { localStorage.setItem('atlas_daily_gen', JSON.stringify(rec)); } catch {}
  return true;
}

function PromptComposer({ t, prompt, setPrompt, onStart, onBackground, onWorkflow, bgTaskStatus, modelStore, toolbarStore, onNavigateSources }) {
  const charCount = prompt.length;
  const placeholder = '比如，"梳理一下 2025 年 Q1 咖啡赛道的融资动态…"';
  const taRef = React.useRef(null);
  const { can } = usePermission();
  const canGenerate = can('generate');

  // G-2 · cost estimate (only meaningful in live mode with a selected model)
  const est = React.useMemo(() => {
    if (!prompt.trim() || !modelStore?.selected) return null;
    return estimateGeneration(prompt.length, toolbarStore?.effectiveLength, modelStore.selected.provider);
  }, [prompt, modelStore?.selected, toolbarStore?.effectiveLength]);

  // Historical approval for the current model+mode (rating feedback surfaced)
  const approval = React.useMemo(() => {
    const name = modelStore?.selected?.name, mode = modelStore?.generationMode;
    if (!name) return null;
    let reports = []; try { reports = JSON.parse(localStorage.getItem('atlas_saved_reports') || '[]'); } catch {}
    const rel = reports.filter(r => r.meta?.model === name && (!mode || r.meta?.generationMode === mode) && (r.rating === 'good' || r.rating === 'bad'));
    if (rel.length < 3) return null; // not enough signal
    const good = rel.filter(r => r.rating === 'good').length;
    return { rate: Math.round((good / rel.length) * 100), n: rel.length };
  }, [modelStore?.selected, modelStore?.generationMode, prompt]);

  // auto-grow
  React.useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = Math.max(96, taRef.current.scrollHeight) + 'px';
    }
  }, [prompt]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && prompt.trim() && canGenerate) {
      e.preventDefault();
      onStart();
    }
  };

  return (
    <div style={{
      border: `1.5px solid ${t.ink}`, background: t.cardOn,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        padding: '10px 14px', borderBottom: `1px solid ${t.rule}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Tag t={t} filled>PROMPT</Tag>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 0.5 }}>describe the report</span>
        <span style={{ flex: 1 }}/>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>{charCount} / 4000</span>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>⌘ ↩ to send</span>
      </div>
      <textarea
        ref={taRef}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          padding: '18px 22px', minHeight: 96, fontFamily: t.fontCN, fontSize: 16,
          lineHeight: 1.55, color: t.ink, background: 'transparent',
          border: 'none', outline: 'none', resize: 'none', width: '100%', boxSizing: 'border-box',
        }}
      />
      <div style={{
        padding: '12px 14px', borderTop: `1px solid ${t.rule}`,
        display: 'flex', alignItems: 'center', gap: 8, background: t.paperAlt,
        flexWrap: 'wrap',
      }}>
        {toolbarStore ? (
          <>
            <SourcesPopover t={t} store={toolbarStore} onNavigateSources={onNavigateSources}/>
            <UrlContextPopover t={t} store={toolbarStore}/>
            <AttachmentsPopover t={t} store={toolbarStore}/>
            <div style={{ width: 1, alignSelf: 'stretch', background: t.rule, margin: '2px 4px' }}/>
            <LanguagePopover t={t} store={toolbarStore}/>
            <StylePopover t={t} store={toolbarStore}/>
            <LengthPopover t={t} store={toolbarStore}/>
            {modelStore && <GenerationModePopover t={t} modelStore={modelStore}/>}
            {toolbarStore.activeTemplate && (
              <TemplateLockBadge t={t} store={toolbarStore}/>
            )}
          </>
        ) : (
          <>
            <Tag t={t}>＋ 数据源 (3)</Tag>
            <Tag t={t}>↗ 网页</Tag>
            <Tag t={t}>＋ 附件</Tag>
            <div style={{ width: 1, alignSelf: 'stretch', background: '#ddd', margin: '2px 4px' }}/>
            <Tag t={t}>语言 · 简体中文</Tag>
            <Tag t={t}>风格 · 商业可读</Tag>
            <Tag t={t}>长度 · 2,500 字</Tag>
            <Tag t={t}>◈ 均衡</Tag>
          </>
        )}
        {modelStore && <ModelSelector t={t} store={modelStore}/>}
        <span style={{ flex: 1 }}/>
        {approval && canGenerate && (
          <span title="该模型+模式的历史好评率（基于你的评分）" style={{ fontFamily: t.fontMono, fontSize: 9, color: approval.rate >= 60 ? '#2a8c5c' : approval.rate >= 30 ? t.mute : '#b04040', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>
            好评率 {approval.rate}%（{approval.n}篇）
          </span>
        )}
        {est && canGenerate && (
          <span title="粗估，仅用于防止意外超支，非账单级精确" style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 0.3, whiteSpace: 'nowrap' }}>
            粗估 ~{est.tokens.toLocaleString()} tok · ≈${est.usd < 0.01 ? est.usd.toFixed(4) : est.usd.toFixed(3)}
          </span>
        )}
        <Btn t={t} size="sm"
          onClick={() => setPrompt(SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)])}>
          ✦ Surprise me
        </Btn>
        <StartWritingBtn t={t} disabled={!prompt.trim() || !canGenerate}
          onStart={onStart} onWorkflow={canGenerate ? onWorkflow : null} onBackground={canGenerate ? onBackground : null} bgTaskStatus={bgTaskStatus}/>
      </div>
      {!canGenerate && (
        <div style={{ padding: '8px 14px', borderTop: `1px solid ${t.rule}`, background: 'rgba(118,115,104,0.06)', fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 0.4 }}>
          只读成员 · 当前团队角色无生成权限，仅可查看报告库
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Home, PromptComposer, SAMPLE_PROMPTS, STARTERS });
// Running — agent at work. Center column streams the essay paragraph by
// paragraph; right column collects marginalia in real time. Total demo
// duration ~26s. User can pause, slow down, or skip to the finished report.

// ── Paragraph copy --------------------------------------------------------
const RUN_PARAGRAPHS = [
  { kind: 'lede',
    text: '一句话总结：钱没少，故事变了——资本退出"高密度精品"的叙事，重新拥抱规模与下沉。' },
  { kind: 'p',
    text: '2025 年第一季度，国内连锁咖啡品牌共发生 9 起公开融资事件，总金额约 11.4 亿元§1。其中 6 起集中在 1 月，3 起分布在 2 月与 3 月——节奏明显前置，且回避了春节后的传统淡季窗口。' },
  { kind: 'p',
    text: 'Manner 在 1 月完成新一轮融资，估值约 30 亿美元§2，并同步释放"5 年内开设 5,000 家门店"的计划。这是公司首次明确表态规模化路径，此前 Manner 长期被视作精品咖啡的代表。' },
  { kind: 'p',
    text: '另一端则是库迪、挪瓦、本来不该有等品牌密集出现在三四线城市§3。库迪 1 月披露的加盟数据显示，下沉市场加盟商占比已超过 60%。' },
];

// ── Timeline ------------------------------------------------------------
const RUN_EVENTS = [
  // 0–8s: planning + fetching + analyzing
  { at: 0.0,  kind: 'marginStart', id: 'plan',    tag: 'PLAN',    cn: '拆解任务为 5 个子步骤' },
  { at: 2.4,  kind: 'marginDone',  id: 'plan' },
  { at: 2.6,  kind: 'marginStart', id: 'fetch1',  tag: 'FETCH',   cn: '抓取 IT 桔子 2025·Q1 融资数据库' },
  { at: 4.6,  kind: 'marginDone',  id: 'fetch1' },
  { at: 4.7,  kind: 'marginStart', id: 'fetch2',  tag: 'FETCH',   cn: '读取 36 氪 18 篇相关报道' },
  { at: 6.4,  kind: 'marginDone',  id: 'fetch2' },
  { at: 6.6,  kind: 'marginStart', id: 'analyze', tag: 'ANALYZE', cn: '提取金额 · 轮次 · 估值' },
  { at: 8.2,  kind: 'marginDone',  id: 'analyze' },
  // 8.5–20s: writing essay paragraph by paragraph
  { at: 8.5,  kind: 'marginStart', id: 'write',   tag: 'WRITE',   cn: '撰写正文 (1 / 4)' },
  { at: 8.6,  kind: 'paragraph',   idx: 0 },
  { at: 10.8, kind: 'paragraph',   idx: 1 },
  { at: 11.1, kind: 'marginAdd',   id: 'cite1',   tag: 'CITE [1]', cn: 'IT 桔子 · 2025 Q1 融资数据库' },
  { at: 14.0, kind: 'paragraph',   idx: 2 },
  { at: 14.4, kind: 'marginAdd',   id: 'cite2',   tag: 'CITE [2]', cn: '36 氪 · Manner 新一轮融资消息' },
  { at: 17.4, kind: 'paragraph',   idx: 3 },
  { at: 17.8, kind: 'marginAdd',   id: 'cite3',   tag: 'CITE [3]', cn: '窄门餐眼 · 咖啡品牌门店数据' },
  { at: 20.5, kind: 'marginDone',  id: 'write' },
  // 20.5–26s: chart + review
  { at: 20.7, kind: 'marginStart', id: 'chart',   tag: 'CHART',   cn: '生成融资金额柱状图' },
  { at: 22.4, kind: 'figure' },
  { at: 22.5, kind: 'marginDone',  id: 'chart' },
  { at: 22.7, kind: 'marginStart', id: 'review',  tag: 'REVIEW',  cn: '审校与引用核对' },
  { at: 25.2, kind: 'marginDone',  id: 'review' },
  { at: 26.0, kind: 'complete' },
];

const RUN_TOTAL = 26.0;

// ── Live API streaming -----------------------------------------------
async function fetchUrlContents(urls, onProgress) {
  const results = [];
  for (let i = 0; i < urls.length; i++) {
    onProgress?.(i, urls.length);
    try {
      const resp = await fetch(`https://r.jina.ai/${encodeURIComponent(urls[i])}`, {
        headers: { Accept: 'text/plain', 'X-No-Cache': 'true' },
        signal: AbortSignal.timeout(12000),
      });
      const text = await resp.text();
      results.push({ url: urls[i], content: text.slice(0, 2000), ok: true });
    } catch (e) {
      results.push({ url: urls[i], content: '', ok: false, error: String(e) });
    }
  }
  onProgress?.(urls.length, urls.length);
  return results;
}

// ── Agentic research (P4 stage 2 · Tool Use) ─────────────────────────────────
// Tool schemas exposed to the model (OpenAI function-calling format)
const RESEARCH_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: '联网搜索实时信息。当你需要最新数据、事实核查、或不确定的细节时调用。',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '搜索关键词，简洁精确' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'fetch_url',
      description: '读取指定网页的正文内容。当你已知一个具体 URL 需要深入了解其内容时调用。',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: '要读取的完整网页 URL' },
        },
        required: ['url'],
      },
    },
  },
];

// Resolve a non-streaming model endpoint (handles both server-key proxy and direct key)
async function resolveModelCall(model) {
  const apiKey = model.apiKey || '';
  const apiUrl = (model.apiUrl || 'https://api.xiaomimimo.com/v1').replace(/\/$/, '');
  const useServerKey = !apiKey && !!model.provider;
  let sessionToken = null;
  if (useServerKey) {
    try {
      const { supabase } = await import('./lib/supabase.js');
      const { data: { session } } = await supabase.auth.getSession();
      sessionToken = session?.access_token || null;
    } catch {}
  }
  const url = useServerKey && sessionToken ? '/api/generate' : `${apiUrl}/chat/completions`;
  const auth = useServerKey && sessionToken ? sessionToken : apiKey;
  return { url, auth, provider: model.provider };
}

// ── MCP (remote HTTP) tool discovery & execution ─────────────────────────────
// Servers configured in localStorage: [{ id, name, url, token }]
function getMcpServers() {
  try { return JSON.parse(localStorage.getItem('atlas_mcp_servers') || '[]'); } catch { return []; }
}

// ── MCP OAuth 2.1 (remote HTTP servers) ──────────────────────────────────────
// NOTE: untested end-to-end (no reachable OAuth MCP server in CI). Fully
// gracefully degrades: no token → behaves exactly like the no-auth path.
function getMcpTokens() {
  try { return JSON.parse(localStorage.getItem('atlas_mcp_tokens') || '{}'); } catch { return {}; }
}
function saveMcpToken(url, tok) {
  const all = getMcpTokens(); all[url] = { ...tok, savedAt: Date.now() };
  try { localStorage.setItem('atlas_mcp_tokens', JSON.stringify(all)); } catch {}
}
function removeMcpToken(url) {
  const all = getMcpTokens(); delete all[url];
  try { localStorage.setItem('atlas_mcp_tokens', JSON.stringify(all)); } catch {}
}
const _b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function _pkce() {
  const verifier = _b64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = _b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  return { verifier, challenge };
}
async function _sessionToken() {
  const { supabase } = await import('./lib/supabase.js');
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || '';
}

// Kick off the OAuth authorization-code + PKCE redirect for a server.
async function startMcpOAuth(server) {
  const redirectUri = window.location.origin + '/';
  const auth = await _sessionToken();
  const res = await fetch('/api/search', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth}` },
    body: JSON.stringify({ action: 'mcp_oauth_discover', serverUrl: server.url, redirectUri }),
  });
  if (!res.ok) { alert('OAuth 发现失败：' + (await res.text()).slice(0, 120)); return; }
  const disc = await res.json();
  if (!disc.authorization_endpoint || !disc.client_id) {
    alert('该服务器不支持自动 OAuth（缺少授权端点或动态客户端注册）。'); return;
  }
  const { verifier, challenge } = await _pkce();
  const state = _b64url(crypto.getRandomValues(new Uint8Array(16)));
  let pending; try { pending = JSON.parse(localStorage.getItem('atlas_mcp_oauth_pending') || '{}'); } catch { pending = {}; }
  pending[state] = { url: server.url, verifier, client_id: disc.client_id, token_endpoint: disc.token_endpoint, redirectUri };
  localStorage.setItem('atlas_mcp_oauth_pending', JSON.stringify(pending));
  const p = new URLSearchParams({ response_type: 'code', client_id: disc.client_id, redirect_uri: redirectUri, code_challenge: challenge, code_challenge_method: 'S256', state });
  if (disc.resource) p.set('resource', disc.resource);
  if ((disc.scopes_supported || []).length) p.set('scope', disc.scopes_supported.join(' '));
  window.location.href = disc.authorization_endpoint + (disc.authorization_endpoint.includes('?') ? '&' : '?') + p.toString();
}

// On app load: if the URL carries an OAuth code matching a pending MCP state,
// exchange it for a token. Returns true if it handled an MCP callback.
async function completeMcpOAuth() {
  const q = new URLSearchParams(window.location.search);
  const code = q.get('code'), state = q.get('state');
  if (!code || !state) return false;
  let pending; try { pending = JSON.parse(localStorage.getItem('atlas_mcp_oauth_pending') || '{}'); } catch { pending = {}; }
  const p = pending[state];
  if (!p) return false; // not an MCP callback (e.g. Supabase) — leave it alone
  try {
    const auth = await _sessionToken();
    const res = await fetch('/api/search', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth}` },
      body: JSON.stringify({ action: 'mcp_oauth_token', tokenEndpoint: p.token_endpoint, params: { grant_type: 'authorization_code', code, redirect_uri: p.redirectUri, client_id: p.client_id, code_verifier: p.verifier } }),
    });
    if (res.ok) { saveMcpToken(p.url, await res.json()); alert('MCP 授权成功'); }
    else alert('MCP 令牌兑换失败：' + (await res.text()).slice(0, 120));
  } catch (e) { alert('MCP 授权失败：' + (e?.message || '')); }
  delete pending[state]; localStorage.setItem('atlas_mcp_oauth_pending', JSON.stringify(pending));
  window.history.replaceState({}, '', window.location.pathname);
  return true;
}

async function mcpProxy(server, method, params) {
  const auth = await _sessionToken();
  const oauth = getMcpTokens()[server.url];
  const token = oauth?.access_token || server.token || '';
  const resp = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth}` },
    body: JSON.stringify({ action: 'mcp', serverUrl: server.url, token, method, params }),
  });
  if (!resp.ok) {
    let msg = `MCP ${resp.status}`;
    try { const d = await resp.json(); msg = d.error || msg; } catch {}
    throw new Error(msg);
  }
  const data = await resp.json();
  return data.result;
}

// Discover tools from all configured MCP servers. Returns { tools, toolMap }.
// tools: OpenAI function-calling schemas (namespaced); toolMap: name → { server, original }.
async function discoverMcpTools(servers) {
  const tools = [];
  const toolMap = {};
  for (let si = 0; si < servers.length; si++) {
    const server = servers[si];
    try {
      const result = await mcpProxy(server, 'tools/list', {});
      const list = result?.tools || [];
      for (const tl of list) {
        const safeName = `mcp_${si}_${(tl.name || '').replace(/[^a-zA-Z0-9_-]/g, '_')}`.slice(0, 64);
        tools.push({
          type: 'function',
          function: {
            name: safeName,
            description: `[${server.name || 'MCP'}] ${tl.description || tl.name || ''}`.slice(0, 1024),
            parameters: tl.inputSchema || { type: 'object', properties: {} },
          },
        });
        toolMap[safeName] = { server, original: tl.name };
      }
    } catch { /* skip unreachable server */ }
  }
  return { tools, toolMap };
}

// Run an MCP tool call → string result for the model
async function executeMcpTool(entry, args, onStatus) {
  onStatus?.({ phase: 'research', action: 'mcp', detail: `${entry.server.name || 'MCP'} · ${entry.original}` });
  try {
    const result = await mcpProxy(entry.server, 'tools/call', { name: entry.original, arguments: args || {} });
    const content = result?.content;
    if (Array.isArray(content)) {
      return content.map(c => c.text || (c.type === 'text' ? c.text : JSON.stringify(c))).filter(Boolean).join('\n') || '（无返回内容）';
    }
    return typeof result === 'string' ? result : JSON.stringify(result || {}).slice(0, 4000);
  } catch (e) {
    return `MCP 调用失败：${String(e.message || e).slice(0, 120)}`;
  }
}

// Execute a single tool call → returns a string result for the model
async function executeResearchTool(name, args, onStatus, mcpToolMap) {
  // MCP tool?
  if (mcpToolMap && mcpToolMap[name]) {
    return executeMcpTool(mcpToolMap[name], args, onStatus);
  }
  try {
    if (name === 'web_search') {
      const query = (args?.query || '').trim();
      if (!query) return '（空查询）';
      onStatus?.({ phase: 'research', action: 'search', detail: query });
      const { supabase } = await import('./lib/supabase.js');
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify({ query, maxResults: 5 }),
      });
      if (!resp.ok) return `搜索失败（${resp.status}）`;
      const data = await resp.json();
      const results = data.results || [];
      if (!results.length) return '无搜索结果';
      return results.map((r, i) => `[${i + 1}] ${r.title}（${r.url}）\n${r.content}`).join('\n\n');
    }
    if (name === 'fetch_url') {
      const url = (args?.url || '').trim();
      if (!url) return '（空 URL）';
      onStatus?.({ phase: 'research', action: 'fetch', detail: url });
      const [res] = await fetchUrlContents([url]);
      return res?.ok ? res.content : '网页抓取失败';
    }
  } catch (e) {
    return `工具执行出错：${String(e).slice(0, 120)}`;
  }
  return '未知工具';
}

// Run the agentic research loop. Returns { context, log }.
// MiMo: single-round only (upstream bug #44 rejects tool-call history on round 2+).
async function runAgenticResearch({ model, prompt, onStatus }) {
  const { url, auth, provider } = await resolveModelCall(model);
  const singleRound = provider === 'mimo'; // MiMo can't take tool history multi-turn
  const maxRounds = singleRound ? 1 : 3;

  // Discover MCP tools (remote HTTP servers) and merge with built-ins
  let mcpTools = [], mcpToolMap = {};
  const servers = getMcpServers();
  if (servers.length) {
    try { ({ tools: mcpTools, toolMap: mcpToolMap } = await discoverMcpTools(servers)); } catch {}
  }
  const allTools = [...RESEARCH_TOOLS, ...mcpTools];

  const log = [];
  const gathered = [];
  const messages = [
    { role: 'system', content: '你是一名严谨的研究助理。在为用户撰写报告前，先判断是否需要联网搜索或读取网页来补充事实、数据或最新信息。如需要就调用工具；如已掌握足够信息，直接回复"RESEARCH_DONE"即可，不要写报告正文。' },
    { role: 'user', content: `报告主题：${prompt}` },
  ];

  for (let round = 0; round < maxRounds; round++) {
    let data;
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth}` },
        body: JSON.stringify({
          model: model.id,
          provider: model.provider,
          messages,
          tools: allTools,
          tool_choice: round === 0 ? 'auto' : 'auto',
          stream: false,
          max_tokens: 1024,
          temperature: 0.3,
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      data = await resp.json();
    } catch (e) {
      // Any failure (incl. MiMo #44 on round 2) → stop gracefully, keep what we have
      log.push({ type: 'error', detail: String(e).slice(0, 80) });
      break;
    }

    const choice = data.choices?.[0];
    const msg = choice?.message;
    const toolCalls = msg?.tool_calls || [];

    if (!toolCalls.length) break; // model decided no (more) tools needed

    // Append assistant's tool-call message, then execute each tool
    messages.push(msg);
    for (const tc of toolCalls) {
      const fname = tc.function?.name;
      let args = {};
      try { args = JSON.parse(tc.function?.arguments || '{}'); } catch {}
      const result = await executeResearchTool(fname, args, onStatus, mcpToolMap);
      const isMcp = !!mcpToolMap[fname];
      const label = isMcp ? (mcpToolMap[fname].original) : (fname === 'web_search' ? '搜索' : '网页');
      const detail = args.query || args.url || JSON.stringify(args).slice(0, 60);
      log.push({ type: isMcp ? 'mcp' : fname, detail, ok: true });
      gathered.push(`【${label}：${detail}】\n${result}`);
      messages.push({ role: 'tool', tool_call_id: tc.id, content: String(result).slice(0, 4000) });
    }

    if (singleRound) break; // MiMo: stop after first round of tool execution
  }

  const context = gathered.length
    ? gathered.join('\n\n---\n\n')
    : '';
  return { context, log };
}

function validateReport(text, { effectiveLength, templateSections } = {}) {
  const warnings = [];
  const clean = text
    .replace(/^\[TITLE:[^\]]*\]\s*/m, '')
    .replace(/\[REFS\][\s\S]*?(?:\[\/REFS\]|$)/g, '');
  const trimmed = clean.trim();
  if (!trimmed) return warnings;

  // 1. Starts with a heading
  if (!/^#{1,3}\s/.test(trimmed)) {
    warnings.push('报告未以标题开头，格式可能异常');
  }

  // 2. Section count
  const minSections = (templateSections?.length) ||
    ((effectiveLength || 2500) < 1000 ? 3 : (effectiveLength || 2500) < 2000 ? 5 : (effectiveLength || 2500) < 3000 ? 6 : 8);
  const sectionCount = (trimmed.match(/^## /gm) || []).length;
  if (sectionCount > 0 && sectionCount < minSections) {
    warnings.push(`章节数不足（检测到 ${sectionCount} 章，建议 ≥ ${minSections}）`);
  }

  // 3. Char count vs target
  const minChars = Math.round((effectiveLength || 2500) * 0.7);
  const charCount = trimmed.replace(/\s+/g, '').length;
  if (charCount > 0 && charCount < minChars) {
    warnings.push(`字数偏少（${charCount.toLocaleString()} 字，建议 ≥ ${minChars.toLocaleString()}）`);
  }

  // 4. Unclosed code fence
  const fenceCount = (text.match(/^```/gm) || []).length;
  if (fenceCount % 2 !== 0) {
    warnings.push('存在未闭合的代码块');
  }

  // 5. Truncation: tail 150 chars must contain a sentence-ending marker
  const tail = text.trimEnd().slice(-150);
  const hasNormalEnd = /[。！？….!?]/.test(tail)
    || /\[\/REFS\]/.test(tail)
    || /^#{1,3}\s.+$/m.test(tail);
  if (!hasNormalEnd) {
    warnings.unshift('输出可能被截断，建议在设置中增大 Max Tokens 后重新生成');
  }

  return warnings;
}

// Benchmark scoring — objective 0-100 quality score for a generated report.
function scoreReport(text, targetLength) {
  if (!text) return { words: 0, sections: 0, citations: 0, truncated: true, structureOk: false, adherence: 0, score: 0 };
  const warnings = validateReport(text, { effectiveLength: targetLength });
  const clean = text.replace(/^\[TITLE:[^\]]*\]\s*/m, '').replace(/\[REFS\][\s\S]*?(?:\[\/REFS\]|$)/g, '').trim();
  const words = clean.replace(/\s+/g, '').length;
  const sections = (clean.match(/^##\s/gm) || []).length;
  const citations = new Set(text.match(/§\d+/g) || []).size;
  const truncated = warnings.some(w => w.includes('截断'));
  const structureOk = !warnings.some(w => w.includes('标题') || w.includes('章节'));
  let adherence = 1;
  if (targetLength) {
    const ratio = words / targetLength;
    adherence = ratio >= 1 ? Math.max(0, 1 - (ratio - 1) * 0.6) : ratio / 0.9; // penalise both short & bloated
    adherence = Math.max(0, Math.min(1, adherence));
  }
  let score = 0;
  score += structureOk ? 30 : 10;                              // structure
  score += truncated ? 0 : 20;                                 // completeness
  score += Math.round(adherence * 30);                          // length adherence
  score += citations >= 3 ? 20 : citations > 0 ? 12 : 0;        // sourcing
  return { words, sections, citations, truncated, structureOk, adherence, score: Math.max(0, Math.min(100, score)) };
}

function parseOutlineFromText(text) {
  const sections = [];
  const parts = text.split(/^## /gm).filter(Boolean);
  for (const part of parts) {
    const lines = part.trim().split('\n');
    const title = lines[0].replace(/^[一二三四五六七八九十]+[、．\.\s]+/, '').trim();
    const reqLine = lines.slice(1).join(' ').replace(/^写作要求[：:]\s*/, '').trim();
    if (title) sections.push({ title, req: reqLine });
  }
  return sections;
}

async function streamOutline({ model, prompt, language, onChunk, onDone, onError }) {
  const langInstr = language?.instr || '使用简体中文写作';
  const systemPrompt = `你是专业报告写作助手。根据用户提供的话题，生成一份结构化报告大纲。${langInstr}。

格式要求（严格遵守）：
- 生成 4-6 个章节
- 每章节格式：
## 章节标题（简洁，≤15字）
写作要求：具体说明这章要分析的核心问题、数据角度、逻辑框架（30-60字）

只输出大纲，不写正文内容，不要任何前言或后记。`;

  const apiKey = model.apiKey || '';
  const apiUrl = (model.apiUrl || '').replace(/\/$/, '');
  try {
    const resp = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model.id,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `请为以下话题生成报告大纲：\n\n${prompt}` },
        ],
        stream: true,
        max_tokens: 1500,
        temperature: 0.4,
      }),
    });
    if (!resp.ok) { const e = await resp.text(); throw new Error(`API ${resp.status}: ${e.slice(0, 200)}`); }
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const text = data.choices?.[0]?.delta?.content || '';
            if (text) onChunk(text);
          } catch {}
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err.message || String(err));
  }
}

// ── M · Memory layer (localStorage-backed, injected via <user_memory>) ────────
function getWritingProfile() {
  try { return JSON.parse(localStorage.getItem('atlas_writing_profile') || '{}'); } catch { return {}; }
}
function saveWritingProfile(p) {
  try { localStorage.setItem('atlas_writing_profile', JSON.stringify(p)); } catch {}
}
function addProfileAvoid(item) {
  const p = getWritingProfile();
  p.avoid = [...new Set([...(p.avoid || []), item])].slice(0, 12);
  saveWritingProfile(p);
}
function getEntityMemory() {
  try { return JSON.parse(localStorage.getItem('atlas_entity_memory') || '[]'); } catch { return []; }
}
function saveEntityMemory(list) {
  try { localStorage.setItem('atlas_entity_memory', JSON.stringify(list)); } catch {}
}

// Build the <user_memory> system-prompt block from profile + topic-matched entities.
// Returns '' when there is nothing to inject (→ identical to no-memory behaviour).
function buildMemoryBlock(topic) {
  const lines = [];
  const prof = getWritingProfile();
  if (prof.notes?.length)  lines.push('用户写作偏好：' + prof.notes.join('；'));
  if (prof.avoid?.length)  lines.push('需主动避免（基于历史差评）：' + prof.avoid.join('；'));
  const t = String(topic || '');
  const matched = getEntityMemory().filter(e => (e.keywords || []).some(k => k && t.includes(k)));
  const ents = [...new Set(matched.flatMap(e => e.entities || []))].filter(Boolean);
  if (ents.length) lines.push('涉及相关主题时，重点关注并尽量覆盖以下对象：' + ents.join('、'));
  return lines.length ? `\n<user_memory>\n${lines.join('\n')}\n</user_memory>` : '';
}

// Derive a read-only profile view from history (dominant settings, good-rated weighted).
function deriveProfileStats(reports) {
  const good = reports.filter(r => r.rating === 'good');
  const pool = good.length >= 3 ? good : reports;
  const top = (key) => {
    const c = {};
    pool.forEach(r => { const v = r.meta?.[key]; if (v) c[v] = (c[v] || 0) + 1; });
    const e = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    return e ? e[0] : null;
  };
  return { basis: good.length >= 3 ? 'good' : 'all', n: pool.length, model: top('model'), generationMode: top('generationMode'), tone: top('tone'), language: top('language'), style: top('style') };
}

async function streamReport({ model, prompt, toolbarConfig, onChunk, onDone, onError, onStatus }) {
  const { tone, language, style, length, selectedSources, attachments, urlContexts, searchContexts, gatheredContext, temperature, systemPromptExtra, topP, frequencyPenalty, presencePenalty, maxTokensOverride, templateSections } = toolbarConfig || {};
  const toneCN = tone?.cn || '分析性';
  const langInstr = language?.instr || '使用简体中文写作';
  const styleInstr = style?.instr || BUILTIN_STYLES[0].instr;
  const targetLength = length || 2500;

  const minSections = templateSections?.length || (
    targetLength < 300 ? 1 : targetLength < 700 ? 2 : targetLength < 1200 ? 3 :
    targetLength < 2000 ? 5 : targetLength < 3000 ? 6 : 8
  );
  const minWordsPerSection = Math.round(targetLength / minSections * 0.75);

  // Zone 3: Fetch URL contents via Jina Reader API
  let fetchedUrls = [];
  if (urlContexts?.length > 0) {
    onStatus?.({ phase: 'fetching', total: urlContexts.length, done: 0 });
    fetchedUrls = await fetchUrlContents(urlContexts, (done, total) => {
      onStatus?.({ phase: 'fetching', total, done });
    });
  }
  onStatus?.({ phase: 'connecting' });

  // Zone 3: Build <context> block (date + fetched URL content + Tavily search results)
  const now = new Date();
  const DAY_CN_CTX = ['日','一','二','三','四','五','六'];
  const dateStr = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日（周${DAY_CN_CTX[now.getDay()]}）`;
  const urlContextBlock = fetchedUrls.length > 0
    ? '\n\n' + fetchedUrls.map((r, i) =>
        r.ok
          ? `【参考网页 ${i+1}】${r.url}\n${r.content}`
          : `【参考网页 ${i+1}】${r.url}\n（抓取失败，忽略此来源）`
      ).join('\n\n---\n\n')
    : '';

  const searchContextBlock = searchContexts?.length > 0
    ? '\n\n' + searchContexts.map((r, i) =>
        `【搜索结果 ${i+1}】${r.title}（${r.url}）\n${r.content}`
      ).join('\n\n---\n\n')
    : '';

  // Agentic research findings (P4 stage 2): model-gathered context
  const researchBlock = gatheredContext
    ? `\n\n【模型自主研究资料】\n${gatheredContext}`
    : '';

  const contextBlock = `<context>
生成日期：${dateStr}${urlContextBlock}${searchContextBlock}${researchBlock}
</context>`;

  const sourceNote = (() => {
    if (!selectedSources?.size) return '';
    const allS = typeof SOURCES !== 'undefined' ? SOURCES : [];
    const enriched = [...selectedSources].map(name => {
      const found = allS.find(s => s.name === name);
      return { name, quality: found?.quality || 'A' };
    });
    enriched.sort((a, b) => ({ A: 0, B: 1, C: 2 }[a.quality] - ({ A: 0, B: 1, C: 2 }[b.quality] || 0)));
    const tiers = { A: [], B: [], C: [] };
    enriched.forEach(s => (tiers[s.quality] || tiers.A).push(s.name));
    let note = '\n   - A级（核心来源，优先引用）：' + (tiers.A.join('、') || '—');
    if (tiers.B.length) note += `\n   - B级（可参考，适度引用）：${tiers.B.join('、')}`;
    if (tiers.C.length) note += `\n   - C级（低优先级，谨慎引用）：${tiers.C.join('、')}`;
    return `\n\n参考数据源（按质量优先级排序）：${note}`;
  })();

  const displayLength = targetLength;
  const lengthInstr = targetLength < 100
    ? `目标字数：约 ${displayLength} 字`
    : `目标字数：${displayLength} 字（必须达到 ${Math.round(targetLength * 0.88)} 字以上，上限 ${Math.round(targetLength * 1.12)} 字，不得少于下限）`;

  const systemPrompt = `${BASE_SYSTEM_PROMPT}

${contextBlock}

<output_language>
${langInstr}
</output_language>

<style>
报告风格：${styleInstr}
写作语气：${toneCN}（全程必须体现，不得偏离）
</style>

${templateSections?.length ? `<structure>
本次报告必须严格按以下章节框架展开，不可增减章节，不可重排顺序：

${templateSections.map((s, i) => {
  const nums = ['一','二','三','四','五','六','七','八'];
  return `${nums[i] || (i+1)}、${s.title}\n写作要求：${s.req}`;
}).join('\n\n')}

${lengthInstr}（总字数分配到以上 ${templateSections.length} 个章节）
每章最少字数：${minWordsPerSection} 字
</structure>` : `<structure>
本次报告结构要求：
- 最少章节数：${minSections} 个，每章用「一、」「二、」等中文序号 + ## 标题格式
- 每章最少字数：${minWordsPerSection} 字
- ${lengthInstr}
</structure>`}

<citations>
重要数据用 §1 §2 §3 标注脚注编号，报告末尾输出：
[REFS]
[1] 来源机构 — 文献名 — 网址 — YYYY.MM
[/REFS]
条数与正文 §N 标注一致。${sourceNote}
</citations>
${systemPromptExtra ? `\n<custom>\n${systemPromptExtra}\n</custom>` : ''}${buildMemoryBlock(prompt)}

输出格式：第一行必须是 [TITLE: 精炼标题（20字以内）]，然后空行，再输出各章节，最后输出 [REFS]...[/REFS]。不要任何其他前言后记。`;

  // Build user message: prompt + optional attachment context
  const attachText = attachments?.length > 0
    ? '\n\n【附件参考资料】\n' + attachments.map(a => `《${a.name}》\n${a.content}`).join('\n\n---\n\n')
    : '';
  const userContent = prompt + attachText;

  // max_tokens: always at least 4000 so reasoning models have room to think + output
  // For longer targets, scale up generously (2.5 tokens/char + 2000 buffer)
  const maxTokens = Math.min(Math.max(Math.ceil(targetLength * 2.5) + 2000, 4000), 16000);

  const apiKey = model.apiKey || '';
  const apiUrl = (model.apiUrl || 'https://api.xiaomimimo.com/v1').replace(/\/$/, '');

  // Check if a server-side key is available — route through /api/generate if so
  const useServerKey = !apiKey && !!model.provider;
  let sessionToken = null;
  if (useServerKey) {
    try {
      const { supabase } = await import('./lib/supabase.js');
      const { data: { session } } = await supabase.auth.getSession();
      sessionToken = session?.access_token || null;
    } catch {}
  }

  const reqBody = {
    model: model.id,
    provider: model.provider,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    stream: true,
    max_tokens: (maxTokensOverride && maxTokensOverride > 0) ? Math.min(maxTokensOverride, 131072) : maxTokens,
    temperature: (temperature !== undefined && !isNaN(Number(temperature))) ? Number(temperature) : 0.7,
    ...(topP != null ? { top_p: Number(topP) } : {}),
    ...(frequencyPenalty != null ? { frequency_penalty: Number(frequencyPenalty) } : {}),
    ...(presencePenalty != null ? { presence_penalty: Number(presencePenalty) } : {}),
  };

  try {
    const resp = await fetch(
      useServerKey && sessionToken ? '/api/generate' : `${apiUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(useServerKey && sessionToken
            ? { Authorization: `Bearer ${sessionToken}` }
            : { Authorization: `Bearer ${apiKey}` }),
        },
        body: JSON.stringify(reqBody),
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`API error ${resp.status}: ${errText.slice(0, 200)}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let totalTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const delta = data.choices?.[0]?.delta;
            // Support both standard content and reasoning-model content fields
            const text = delta?.content || '';
            if (text) onChunk(text);
            // Capture token usage from final chunk (some providers send usage mid-stream)
            if (data.usage?.total_tokens) totalTokens = data.usage.total_tokens;
            else if (data.usage?.completion_tokens) totalTokens = (data.usage.prompt_tokens || 0) + data.usage.completion_tokens;
          } catch {}
        }
      }
    }
    onDone(totalTokens);
  } catch (err) {
    onError(err.message || String(err));
  }
}

// ── TeamPanel ────────────────────────────────────────────────────────────────

function TeamPanel({ t, modelStore, onBack }) {
  const { user, team, role, refreshTeam } = useAuth();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [members, setMembers] = React.useState([]);
  const [teamKeys, setTeamKeys] = React.useState([]);
  const [knowledge, setKnowledge] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [status, setStatus] = React.useState('');

  // Create team state
  const [createName, setCreateName] = React.useState('');
  const [creating, setCreating] = React.useState(false);

  const getToken = React.useCallback(async () => {
    const { supabase } = await import('./lib/supabase.js');
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }, []);

  const apiFetch = React.useCallback(async (path, opts = {}) => {
    const token = await getToken();
    const res = await fetch(path, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers || {}) } });
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : {}; } catch { json = {}; }
    if (!res.ok) {
      const detail = json?.error || json?.message || (text ? text.slice(0, 80) : '');
      const e = new Error(`${opts.method || 'GET'} ${path.replace('/api/teams', '')} → ${res.status}${detail ? ' · ' + detail : ''}`);
      e.status = res.status; e.detail = detail;
      throw e;
    }
    return json;
  }, [getToken]);

  const showStatus = (msg, isErr = false) => {
    if (isErr) setError(msg); else setStatus(msg);
    setTimeout(() => { setError(''); setStatus(''); }, 3500);
  };

  const [teamReports, setTeamReports] = React.useState([]);
  const loadMembers  = React.useCallback(() => apiFetch('/api/teams/members').then(d => setMembers(Array.isArray(d) ? d : [])).catch(() => {}), [apiFetch]);
  const loadKeys     = React.useCallback(() => apiFetch('/api/teams/keys').then(d => setTeamKeys(Array.isArray(d) ? d : [])).catch(() => {}), [apiFetch]);
  const loadKnowledge = React.useCallback(() => apiFetch('/api/teams/knowledge').then(d => setKnowledge(Array.isArray(d) ? d : [])).catch(() => {}), [apiFetch]);
  const loadReports  = React.useCallback(() => apiFetch('/api/teams/reports').then(d => setTeamReports(Array.isArray(d) ? d : [])).catch(() => {}), [apiFetch]);

  React.useEffect(() => {
    if (!team) return;
    if (activeTab === 'overview') { loadMembers(); loadReports(); loadKeys(); loadKnowledge(); }
    else if (activeTab === 'members') loadMembers();
    else if (activeTab === 'keys') loadKeys();
    else if (activeTab === 'knowledge') loadKnowledge();
    else if (activeTab === 'reports') loadReports();
  }, [activeTab, team]);

  const handleCreateTeam = async () => {
    if (!createName.trim()) return;
    setCreating(true);
    try {
      await apiFetch('/api/teams', { method: 'POST', body: JSON.stringify({ name: createName.trim() }) });
      await refreshTeam?.();
      showStatus('团队创建成功');
    } catch (e) { showStatus(e.message, true); }
    setCreating(false);
  };

  const isAdmin = role === 'admin';
  const isEditorOrAdmin = role === 'admin' || role === 'editor';

  const inp = { width: '100%', padding: '7px 10px', fontFamily: t.fontMono, fontSize: 12, border: `1px solid ${t.rule}`, background: t.paper, color: t.ink, outline: 'none', boxSizing: 'border-box' };
  const btnBase = { padding: '6px 16px', fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 10, letterSpacing: 1, cursor: 'pointer', border: 'none', textTransform: 'uppercase' };
  const secHdr = { fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 10, marginTop: 20 };

  const TABS = [
    { k: 'overview', label: '概览' },
    { k: 'reports', label: '报告库' },
    { k: 'members', label: '成员' },
    { k: 'keys', label: '共享密钥' },
    { k: 'knowledge', label: '知识库' },
    ...(isAdmin ? [{ k: 'settings', label: '团队设置' }] : []),
  ];

  // ── No team: show create UI ──────────────────────────
  if (!team) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: t.paper, color: t.ink }}>
        <div style={{ padding: '12px 36px', borderBottom: `1px solid ${t.rule}`, display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={onBack} style={{ ...btnBase, background: 'transparent', color: t.mute, border: `1px solid ${t.rule}`, padding: '5px 12px' }}>← 返回</button>
          <span style={{ fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 14, color: t.ink }}>创建团队</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ maxWidth: 400, width: '100%' }}>
            <div style={{ fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 22, color: t.ink, marginBottom: 8 }}>开始协作</div>
            <div style={{ fontFamily: t.fontCN, fontSize: 13, color: t.mute, marginBottom: 32, lineHeight: 1.7 }}>创建团队后，可以共享模型密钥、提示词模板和知识库，邀请成员一起生成报告。</div>
            <div style={secHdr}>团队名称</div>
            <input value={createName} onChange={e => setCreateName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateTeam()}
              placeholder="例如：增长研究团队" style={{ ...inp, marginBottom: 16 }}/>
            <button onClick={handleCreateTeam} disabled={creating || !createName.trim()}
              style={{ ...btnBase, background: t.accent, color: '#fff', width: '100%', padding: '10px 0', opacity: creating || !createName.trim() ? 0.5 : 1 }}>
              {creating ? '创建中…' : '创建团队'}
            </button>
            {error && <div style={{ marginTop: 12, fontFamily: t.fontMono, fontSize: 11, color: '#e5251d' }}>{error}</div>}
            {status && <div style={{ marginTop: 12, fontFamily: t.fontMono, fontSize: 11, color: '#16a34a' }}>{status}</div>}
          </div>
        </div>
      </div>
    );
  }

  // ── Has team: editorial workspace ────────────────────
  const roleLabel = role === 'admin' ? '管理员' : role === 'editor' ? '编辑' : '只读';
  const initial = (team.name || '?')[0].toUpperCase();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: t.paper, color: t.ink, overflow: 'auto' }}>
      {/* Masthead */}
      <div style={{ padding: '24px 44px 20px', borderBottom: `2px solid ${t.ink}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <button onClick={onBack} style={{ ...btnBase, background: 'transparent', color: t.mute, border: `1px solid ${t.rule}`, padding: '5px 12px' }}>← 返回</button>
          <Tag t={t} accent>◆ TEAM WORKSPACE · 团队协作</Tag>
          <span style={{ flex: 1 }}/>
          {status && <span style={{ fontFamily: t.fontMono, fontSize: 10, color: '#2a8c5c' }}>✓ {status}</span>}
          {error && <span style={{ fontFamily: t.fontMono, fontSize: 10, color: '#e5251d' }}>{error}</span>}
          {!isAdmin && (
            <button onClick={async () => {
              if (!confirm('确认退出团队？')) return;
              try { await apiFetch(`/api/teams/members?userId=${user?.id}`, { method: 'DELETE' }); await refreshTeam?.(); onBack?.(); }
              catch (e) { showStatus(e.message, true); }
            }} style={{ ...btnBase, background: 'transparent', color: '#e5251d', border: `1px solid #e5251d`, padding: '5px 12px' }}>退出团队</button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 60, height: 60, background: t.ink, color: t.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.fontDisplay, fontWeight: 900, fontSize: 30, flexShrink: 0, boxShadow: `4px 4px 0 ${t.accent}` }}>{initial}</div>
          <div>
            <div style={{ fontFamily: t.fontDisplay, fontWeight: 900, fontSize: 42, lineHeight: 1, letterSpacing: -1.5, color: t.ink }}>{team.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 0.5 }}>
              <span style={{ color: t.accent, border: `1px solid ${t.accent}`, padding: '1px 8px', letterSpacing: 1 }}>{roleLabel}</span>
              <span>{members.length} 成员</span><span>·</span><span>{teamReports.length} 共享报告</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${t.rule}`, flexShrink: 0, padding: '0 44px', gap: 4 }}>
        {TABS.map(tab => (
          <button key={tab.k} onClick={() => setActiveTab(tab.k)} style={{
            padding: '12px 18px', fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 11, letterSpacing: 1,
            background: 'transparent', border: 'none', cursor: 'pointer', textTransform: 'uppercase',
            color: activeTab === tab.k ? t.ink : t.mute,
            borderBottom: activeTab === tab.k ? `2.5px solid ${t.accent}` : '2.5px solid transparent',
            marginBottom: -1,
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, minHeight: 0, padding: '28px 44px 56px', maxWidth: 1120, width: '100%' }}>
        {activeTab === 'overview' && <TeamOverviewTab t={t} team={team} role={role} isAdmin={isAdmin} members={members} reports={teamReports} teamKeys={teamKeys} knowledge={knowledge} setActiveTab={setActiveTab} inp={inp} btnBase={btnBase} secHdr={secHdr} apiFetch={apiFetch} onRefreshMembers={loadMembers} showStatus={showStatus}/>}
        {activeTab === 'members' && <MembersTab t={t} members={members} role={role} team={team} inp={inp} btnBase={btnBase} secHdr={secHdr} apiFetch={apiFetch} onRefresh={loadMembers} showStatus={showStatus} currentUserId={user?.id}/>}
        {activeTab === 'keys' && <KeysTab t={t} teamKeys={teamKeys} isAdmin={isAdmin} modelStore={modelStore} inp={inp} btnBase={btnBase} secHdr={secHdr} apiFetch={apiFetch} onRefresh={loadKeys} showStatus={showStatus}/>}
        {activeTab === 'knowledge' && <KnowledgeTab t={t} knowledge={knowledge} canEdit={isEditorOrAdmin} inp={inp} btnBase={btnBase} secHdr={secHdr} apiFetch={apiFetch} onRefresh={loadKnowledge} showStatus={showStatus}/>}
        {activeTab === 'reports' && <TeamReportsTab t={t} reports={teamReports} isAdmin={isAdmin} canShare={isEditorOrAdmin} userEmail={user?.email} btnBase={btnBase} secHdr={secHdr} inp={inp} apiFetch={apiFetch} onRefresh={loadReports} showStatus={showStatus}/>}
        {activeTab === 'settings' && isAdmin && <TeamSettingsTab t={t} team={team} inp={inp} btnBase={btnBase} secHdr={secHdr} apiFetch={apiFetch} onRefresh={refreshTeam} showStatus={showStatus} onBack={onBack}/>}
      </div>
    </div>
  );
}

// Team overview — at-a-glance dashboard (the practical landing)
function TeamOverviewTab({ t, team, role, isAdmin, members, reports, teamKeys, knowledge, setActiveTab, inp, btnBase, secHdr, apiFetch, onRefreshMembers, showStatus }) {
  const [email, setEmail] = React.useState('');
  const [inviting, setInviting] = React.useState(false);
  const ROLE_COLORS = { admin: t.accent, editor: '#1d4ed8', viewer: t.mute };

  const stats = [
    { n: members.length, label: '成员 · MEMBERS', tab: 'members' },
    { n: reports.length, label: '共享报告 · REPORTS', tab: 'reports' },
    { n: teamKeys.length, label: '共享密钥 · KEYS', tab: 'keys' },
    { n: knowledge.length, label: '知识库 · KNOWLEDGE', tab: 'knowledge' },
  ];
  const recentReports = reports.slice(0, 4);

  const quickInvite = async () => {
    if (!email.trim()) return;
    setInviting(true);
    try { await apiFetch('/api/teams/members', { method: 'POST', body: JSON.stringify({ email: email.trim(), role: 'editor' }) }); setEmail(''); await onRefreshMembers(); showStatus('成员已添加'); }
    catch (e) { showStatus(e.message, true); }
    setInviting(false);
  };

  const card = { padding: '16px 18px', border: `1px solid ${t.rule}`, background: t.faint, cursor: 'pointer' };
  return (
    <div>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} onClick={() => setActiveTab(s.tab)} style={card}
            onMouseEnter={e => e.currentTarget.style.background = t.cardOn} onMouseLeave={e => e.currentTarget.style.background = t.faint}>
            <div style={{ fontFamily: t.fontDisplay, fontWeight: 900, fontSize: 32, letterSpacing: -1, color: t.ink, lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1, marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 28 }}>
        {/* Recent reports */}
        <div>
          <div style={{ ...secHdr, marginTop: 0, display: 'flex', alignItems: 'center' }}>
            <span>最近共享报告 · RECENT</span><span style={{ flex: 1 }}/>
            <span onClick={() => setActiveTab('reports')} style={{ cursor: 'pointer', color: t.accent }}>查看全部 →</span>
          </div>
          {recentReports.length === 0
            ? <div style={{ padding: '24px 16px', border: `1px dashed ${t.rule}`, fontFamily: t.fontCN, fontSize: 13, color: t.mute, textAlign: 'center' }}>还没有共享报告。在任意报告页点「分享到团队」即可共享给成员。</div>
            : recentReports.map(r => (
              <div key={r.id} onClick={() => setActiveTab('reports')} style={{ padding: '12px 14px', border: `1px solid ${t.rule}`, marginBottom: 8, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = t.ink} onMouseLeave={e => e.currentTarget.style.borderColor = t.rule}>
                <div style={{ fontFamily: t.fontCN, fontWeight: 600, fontSize: 14, color: t.ink, marginBottom: 4 }}>{r.title || '无标题'}</div>
                <div style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>{r.shared_by_email || '成员'} · {new Date(r.created_at).toLocaleDateString('zh-CN')} · {(r.word_count || 0).toLocaleString()} 字</div>
              </div>
            ))}
        </div>

        {/* Members + quick invite */}
        <div>
          <div style={{ ...secHdr, marginTop: 0, display: 'flex', alignItems: 'center' }}>
            <span>团队成员 · {members.length}</span><span style={{ flex: 1 }}/>
            <span onClick={() => setActiveTab('members')} style={{ cursor: 'pointer', color: t.accent }}>管理 →</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {members.slice(0, 10).map(m => (
              <div key={m.userId} title={`${m.displayName || m.email} · ${m.role}`}
                style={{ width: 38, height: 38, borderRadius: '50%', background: ROLE_COLORS[m.role] || t.ink, color: '#fff', fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {(m.displayName || m.email || '?')[0].toUpperCase()}
              </div>
            ))}
          </div>
          {isAdmin && (
            <div>
              <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginBottom: 6, letterSpacing: 0.5 }}>快速邀请（编辑角色）</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && quickInvite()} placeholder="对方邮箱" style={{ ...inp, flex: 1 }}/>
                <button onClick={quickInvite} disabled={inviting || !email.trim()} style={{ ...btnBase, background: t.ink, color: t.paper, opacity: inviting || !email.trim() ? 0.5 : 1 }}>{inviting ? '…' : '邀请'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MembersTab({ t, members, role, team, inp, btnBase, secHdr, apiFetch, onRefresh, showStatus, currentUserId }) {
  const [email, setEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState('editor');
  const [inviting, setInviting] = React.useState(false);
  const [inviteLink, setInviteLink] = React.useState('');
  const [generatingLink, setGeneratingLink] = React.useState(false);
  const isAdmin = role === 'admin';
  const ROLE_LABELS = { admin: '管理员', editor: '编辑', viewer: '只读' };
  const ROLE_COLORS = { admin: t.accent, editor: '#1d4ed8', viewer: t.mute };

  const handleInvite = async () => {
    if (!email.trim()) return;
    setInviting(true);
    try {
      await apiFetch('/api/teams/members', { method: 'POST', body: JSON.stringify({ email: email.trim(), role: inviteRole }) });
      setEmail('');
      await onRefresh();
      showStatus('成员已添加');
    } catch (e) { showStatus(e.message, true); }
    setInviting(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await apiFetch(`/api/teams/members?userId=${userId}`, { method: 'PATCH', body: JSON.stringify({ role: newRole }) });
      await onRefresh();
      showStatus('角色已更新');
    } catch (e) { showStatus(e.message, true); }
  };

  const handleRemove = async (userId) => {
    if (!confirm('确认移除该成员？')) return;
    try {
      await apiFetch(`/api/teams/members?userId=${userId}`, { method: 'DELETE' });
      await onRefresh();
      showStatus('成员已移除');
    } catch (e) { showStatus(e.message, true); }
  };

  const handleGenerateLink = async () => {
    setGeneratingLink(true);
    try {
      const data = await apiFetch('/api/teams/invite');
      const url = `${window.location.origin}${window.location.pathname}?invite=${data.token}`;
      setInviteLink(url);
    } catch (e) { showStatus(e.message, true); }
    setGeneratingLink(false);
  };

  return (
    <div>
      {isAdmin && (
        <>
          <div style={secHdr}>邀请成员</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="输入邮箱地址（对方需已注册）"
              onKeyDown={e => e.key === 'Enter' && handleInvite()} style={{ ...inp, flex: 1 }}/>
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
              style={{ ...inp, width: 90, cursor: 'pointer' }}>
              <option value="editor">编辑</option>
              <option value="viewer">只读</option>
              <option value="admin">管理员</option>
            </select>
            <button onClick={handleInvite} disabled={inviting || !email.trim()}
              style={{ ...btnBase, background: t.ink, color: t.paper, opacity: inviting || !email.trim() ? 0.5 : 1 }}>
              {inviting ? '…' : '添加'}
            </button>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={secHdr}>邀请链接（7天有效）</div>
            {inviteLink ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input readOnly value={inviteLink} style={{ ...inp, flex: 1, fontFamily: 'monospace', fontSize: 11 }} onClick={e => e.target.select()}/>
                <button onClick={() => { navigator.clipboard.writeText(inviteLink); showStatus('链接已复制'); }}
                  style={{ ...btnBase, background: t.ink, color: t.paper }}>复制</button>
              </div>
            ) : (
              <button onClick={handleGenerateLink} disabled={generatingLink}
                style={{ ...btnBase, background: 'transparent', border: `1px solid ${t.rule}`, color: t.mute, opacity: generatingLink ? 0.5 : 1 }}>
                {generatingLink ? '生成中…' : '生成邀请链接'}
              </button>
            )}
          </div>
        </>
      )}
      <div style={secHdr}>成员列表 · {members.length} 人</div>
      {members.map(m => (
        <div key={m.userId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: `1px solid ${t.rule}`, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: ROLE_COLORS[m.role] || t.ink, color: '#fff', fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {(m.displayName || m.email || '?')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: t.fontCN, fontSize: 13, fontWeight: 600, color: t.ink }}>{m.displayName || m.email}</div>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>{m.email}</div>
          </div>
          {isAdmin && m.userId !== currentUserId ? (
            <select value={m.role} onChange={e => handleRoleChange(m.userId, e.target.value)}
              style={{ ...inp, width: 80, padding: '4px 8px', cursor: 'pointer' }}>
              <option value="admin">管理员</option>
              <option value="editor">编辑</option>
              <option value="viewer">只读</option>
            </select>
          ) : (
            <span style={{ fontFamily: t.fontMono, fontSize: 9, color: ROLE_COLORS[m.role], border: `1px solid ${ROLE_COLORS[m.role]}`, padding: '2px 8px' }}>{ROLE_LABELS[m.role]}</span>
          )}
          {isAdmin && m.userId !== currentUserId && (
            <button onClick={() => handleRemove(m.userId)} style={{ ...btnBase, background: 'transparent', color: '#e5251d', border: `1px solid #e5251d`, padding: '4px 10px', fontSize: 9 }}>移除</button>
          )}
        </div>
      ))}
    </div>
  );
}

function KeysTab({ t, teamKeys, isAdmin, modelStore, inp, btnBase, secHdr, apiFetch, onRefresh, showStatus }) {
  const [form, setForm] = React.useState({ provider: 'anthropic', apiKey: '', apiUrl: '', label: '' });
  const [adding, setAdding] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [showImport, setShowImport] = React.useState(false);
  const [importSel, setImportSel] = React.useState({});
  const [importing, setImporting] = React.useState(false);

  const PROVIDERS = [
    { v: 'anthropic', label: 'Anthropic (Claude)',  url: 'https://api.anthropic.com/v1' },
    { v: 'openai',    label: 'OpenAI',              url: 'https://api.openai.com/v1' },
    { v: 'deepseek',  label: 'DeepSeek',            url: 'https://api.deepseek.com/v1' },
    { v: 'mimo',      label: 'MiMo (小米)',          url: 'https://api.xiaomimimo.com/v1' },
    { v: 'custom',    label: '自定义',               url: '' },
  ];
  const maskKey = (label) => label || '(未命名)';

  const handleProviderChange = (v) => {
    const p = PROVIDERS.find(x => x.v === v);
    setForm(f => ({ ...f, provider: v, apiUrl: p?.url || '' }));
  };

  const handleAdd = async () => {
    if (!form.apiKey.trim()) return;
    setAdding(true);
    try {
      await apiFetch('/api/teams/keys', { method: 'POST', body: JSON.stringify(form) });
      setForm({ provider: 'anthropic', apiKey: '', apiUrl: '', label: '' });
      setShowForm(false);
      await onRefresh();
      showStatus('密钥已添加');
    } catch (e) { showStatus(e.message, true); }
    setAdding(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('确认删除该共享密钥？')) return;
    try {
      await apiFetch(`/api/teams/keys?id=${id}`, { method: 'DELETE' });
      await onRefresh();
      showStatus('密钥已删除');
    } catch (e) { showStatus(e.message, true); }
  };

  // My server-side personal keys (encrypted; imported by copying the blob)
  const [personalKeys, setPersonalKeys] = React.useState([]);
  React.useEffect(() => {
    apiFetch('/api/keys').then(d => setPersonalKeys(Array.isArray(d) ? d : [])).catch(() => {});
  }, [apiFetch]);

  // Import candidates = client-side model keys (plaintext) + server-side personal keys
  const importCandidates = React.useMemo(() => {
    const existing = new Set(teamKeys.map(k => `${(k.provider || '').toLowerCase()}|${k.label || ''}`));
    const client = (modelStore?.allModels || [])
      .filter(m => m.apiKey && m.apiKey.trim())
      .map(m => ({ id: 'c:' + m.id, src: 'client', provider: (m.provider || 'custom').toLowerCase(), apiKey: m.apiKey, apiUrl: m.apiUrl || '', label: m.name || m.provider || '密钥', hint: '本机模型 · ****' + m.apiKey.slice(-4) }));
    const server = personalKeys
      .map(k => ({ id: 's:' + k.id, src: 'server', personalId: k.id, provider: (k.provider || 'custom').toLowerCase(), apiUrl: k.api_url || '', label: k.label || k.provider || '密钥', hint: '个人密钥（服务端加密）' }));
    return [...server, ...client].filter(m => !existing.has(`${m.provider}|${m.label}`));
  }, [modelStore, teamKeys, personalKeys]);

  const handleImport = async () => {
    const sel = importCandidates.filter(c => importSel[c.id]);
    if (!sel.length) return;
    setImporting(true);
    try {
      for (const c of sel) {
        const body = c.src === 'server'
          ? { fromPersonalId: c.personalId, label: c.label }
          : { provider: c.provider, apiKey: c.apiKey, apiUrl: c.apiUrl, label: c.label };
        await apiFetch('/api/teams/keys', { method: 'POST', body: JSON.stringify(body) });
      }
      setShowImport(false); setImportSel({});
      await onRefresh();
      showStatus(`已导入 ${sel.length} 个密钥`);
    } catch (e) { showStatus(e.message, true); }
    setImporting(false);
  };

  return (
    <div>
      <div style={{ fontFamily: t.fontCN, fontSize: 12, color: t.mute, marginBottom: 16, lineHeight: 1.7, padding: '10px 14px', border: `1px solid ${t.rule}`, background: t.faint }}>
        共享密钥由管理员统一管理，密钥原文不可查看。编辑成员生成报告时，若无个人密钥将自动使用团队密钥。
      </div>
      {isAdmin && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <button onClick={() => { setShowForm(f => !f); setShowImport(false); }} style={{ ...btnBase, background: t.ink, color: t.paper }}>
              {showForm ? '取消' : '＋ 添加密钥'}
            </button>
            <button onClick={() => { setShowImport(v => !v); setShowForm(false); }} style={{ ...btnBase, background: 'transparent', border: `1px solid ${t.rule}`, color: t.ink }}>
              ↑ 从我的密钥导入
            </button>
          </div>
          {showImport && (
            <div style={{ padding: 16, border: `1px solid ${t.rule}`, marginBottom: 20, background: t.faint }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginBottom: 10 }}>
                把你的密钥共享给团队 · 含本机模型密钥与个人服务端密钥（已在团队中的不显示）
              </div>
              {importCandidates.length === 0
                ? <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.mute }}>没有可导入的密钥（请先在 设置→模型 添加个人密钥）</div>
                : <>
                    {importCandidates.map(c => (
                      <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!importSel[c.id]} onChange={e => setImportSel(s => ({ ...s, [c.id]: e.target.checked }))}/>
                        <span style={{ fontFamily: t.fontCN, fontSize: 13, color: t.ink }}>{c.label}</span>
                        <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>{c.provider} · {c.hint}</span>
                      </label>
                    ))}
                    <button onClick={handleImport} disabled={importing || !Object.values(importSel).some(Boolean)}
                      style={{ ...btnBase, background: t.accent, color: '#fff', marginTop: 6, opacity: importing ? 0.5 : 1 }}>
                      {importing ? '导入中…' : `导入选中 (${Object.values(importSel).filter(Boolean).length})`}
                    </button>
                  </>}
            </div>
          )}
          {showForm && (
            <div style={{ padding: '16px', border: `1px solid ${t.rule}`, marginBottom: 20, background: t.faint }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginBottom: 4 }}>供应商</div>
                  <select value={form.provider} onChange={e => handleProviderChange(e.target.value)} style={{ ...inp }}>
                    {PROVIDERS.map(p => <option key={p.v} value={p.v}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginBottom: 4 }}>标签（可选）</div>
                  <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="如：生产密钥" style={inp}/>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginBottom: 4 }}>API Key</div>
                <input type="password" value={form.apiKey} onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))} placeholder="sk-..." style={inp}/>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginBottom: 4 }}>API URL</div>
                <input value={form.apiUrl} onChange={e => setForm(f => ({ ...f, apiUrl: e.target.value }))}
                  readOnly={form.provider !== 'custom'}
                  placeholder="https://..."
                  style={{ ...inp, background: form.provider !== 'custom' ? t.faint : t.paper, color: form.provider !== 'custom' ? t.mute : t.ink }}/>
              </div>
              <button onClick={handleAdd} disabled={adding || !form.apiKey.trim()}
                style={{ ...btnBase, background: t.accent, color: '#fff', opacity: adding || !form.apiKey.trim() ? 0.5 : 1 }}>
                {adding ? '保存中…' : '保存密钥'}
              </button>
            </div>
          )}
        </>
      )}
      <div style={secHdr}>已保存的共享密钥 · {teamKeys.length} 个</div>
      {teamKeys.length === 0 && <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.mute }}>暂无共享密钥</div>}
      {teamKeys.map(k => (
        <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: `1px solid ${t.rule}`, marginBottom: 6 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 12, color: t.ink }}>{maskKey(k.label)}</div>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>{k.provider} · 已加密存储 · {new Date(k.created_at).toLocaleDateString('zh-CN')}</div>
          </div>
          {isAdmin && (
            <button onClick={() => handleDelete(k.id)} style={{ ...btnBase, background: 'transparent', color: '#e5251d', border: `1px solid #e5251d`, padding: '4px 10px', fontSize: 9 }}>删除</button>
          )}
        </div>
      ))}
    </div>
  );
}

function KnowledgeTab({ t, knowledge, canEdit, inp, btnBase, secHdr, apiFetch, onRefresh, showStatus }) {
  const [knType, setKnType] = React.useState('template');
  const [form, setForm] = React.useState({ name: '', content: '' });
  const [showForm, setShowForm] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [showImport, setShowImport] = React.useState(false);
  const [importItems, setImportItems] = React.useState([]);
  const [importSel, setImportSel] = React.useState({});
  const [importing, setImporting] = React.useState(false);

  const TYPE_LABELS = { template: '提示词模板', language: '自定义语言', prompt_extra: '追加指令' };
  const filtered = knowledge.filter(k => k.type === knType);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      await apiFetch('/api/teams/knowledge', { method: 'POST', body: JSON.stringify({ type: knType, name: form.name.trim(), content: { value: form.content.trim() } }) });
      setForm({ name: '', content: '' });
      setShowForm(false);
      await onRefresh();
      showStatus('已添加到知识库');
    } catch (e) { showStatus(e.message, true); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('确认删除该知识库条目？')) return;
    try {
      await apiFetch(`/api/teams/knowledge?id=${id}`, { method: 'DELETE' });
      await onRefresh();
      showStatus('已删除');
    } catch (e) { showStatus(e.message, true); }
  };

  const openImport = () => {
    const localType = knType === 'language' ? 'language' : 'template';
    let locals = [];
    try {
      if (localType === 'template') {
        locals = JSON.parse(localStorage.getItem('atlas_custom_templates') || '[]')
          .map(t => ({ id: t.id || String(Math.random()), name: t.en || t.name || '', content: t.prompt || '', type: 'template' }))
          .filter(t => t.name && t.content);
      } else {
        locals = JSON.parse(localStorage.getItem('atlas_custom_languages') || '[]')
          .filter(l => l.custom)
          .map(l => ({ id: l.id, name: l.label, content: l.instr || `使用${l.label}写作`, type: 'language' }));
      }
    } catch {}
    const existingNames = new Set(knowledge.filter(k => k.type === localType).map(k => k.name));
    const available = locals.filter(l => !existingNames.has(l.name));
    setImportItems(available);
    setImportSel({});
    setShowImport(true);
  };

  const handleImport = async () => {
    const selected = importItems.filter(i => importSel[i.id]);
    if (!selected.length) return;
    setImporting(true);
    try {
      for (const item of selected) {
        await apiFetch('/api/teams/knowledge', {
          method: 'POST',
          body: JSON.stringify({ type: item.type, name: item.name, content: { value: item.content } }),
        });
      }
      await onRefresh();
      showStatus(`已导入 ${selected.length} 条`);
      setShowImport(false);
    } catch (e) { showStatus(e.message, true); }
    setImporting(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: `1px solid ${t.rule}` }}>
        {Object.entries(TYPE_LABELS).map(([k, label]) => (
          <button key={k} onClick={() => setKnType(k)} style={{
            padding: '7px 16px', fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1, background: 'transparent', border: 'none', cursor: 'pointer',
            color: knType === k ? t.ink : t.mute,
            borderBottom: knType === k ? `2px solid ${t.ink}` : '2px solid transparent', marginBottom: -1,
          }}>{label}</button>
        ))}
      </div>
      {canEdit && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <button onClick={() => { setShowForm(f => !f); setShowImport(false); }} style={{ ...btnBase, background: t.ink, color: t.paper }}>
              {showForm ? '取消' : `＋ 添加${TYPE_LABELS[knType]}`}
            </button>
            {knType !== 'prompt_extra' && (
              <button onClick={() => { openImport(); setShowForm(false); }} style={{ ...btnBase }}>
                ↑ 从本地导入
              </button>
            )}
          </div>
          {showForm && (
            <div style={{ padding: 16, border: `1px solid ${t.rule}`, marginBottom: 20, background: t.faint }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginBottom: 4 }}>名称</div>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="条目名称" style={inp}/>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginBottom: 4 }}>内容</div>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder={knType === 'language' ? '使用[语言名]写作' : '输入内容…'} rows={4}
                  style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}/>
              </div>
              <button onClick={handleAdd} disabled={saving || !form.name.trim() || !form.content.trim()}
                style={{ ...btnBase, background: t.accent, color: '#fff', opacity: saving ? 0.5 : 1 }}>
                {saving ? '保存中…' : '保存'}
              </button>
            </div>
          )}
          {showImport && (
            <div style={{ padding: 16, border: `1px solid ${t.rule}`, marginBottom: 20, background: t.faint }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginBottom: 10 }}>
                从个人{TYPE_LABELS[knType]}导入（已在团队库中的将不显示）
              </div>
              {importItems.length === 0
                ? <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.mute }}>没有可导入的本地{TYPE_LABELS[knType]}</div>
                : <>
                    {importItems.map(item => (
                      <label key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!importSel[item.id]} onChange={e => setImportSel(s => ({ ...s, [item.id]: e.target.checked }))}
                          style={{ marginTop: 2, flexShrink: 0 }}/>
                        <div>
                          <div style={{ fontFamily: t.fontCN, fontSize: 13, color: t.ink }}>{item.name}</div>
                          <div style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>{item.content.slice(0, 60)}{item.content.length > 60 ? '…' : ''}</div>
                        </div>
                      </label>
                    ))}
                    <button onClick={handleImport} disabled={importing || !Object.values(importSel).some(Boolean)}
                      style={{ ...btnBase, background: t.accent, color: '#fff', marginTop: 8, opacity: importing ? 0.5 : 1 }}>
                      {importing ? '导入中…' : `导入选中 (${Object.values(importSel).filter(Boolean).length})`}
                    </button>
                  </>
              }
            </div>
          )}
        </>
      )}
      <div style={secHdr}>{TYPE_LABELS[knType]} · {filtered.length} 条</div>
      {filtered.length === 0 && <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.mute }}>暂无内容</div>}
      {filtered.map(item => (
        <div key={item.id} style={{ padding: '12px 14px', border: `1px solid ${t.rule}`, marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ fontFamily: t.fontCN, fontWeight: 600, fontSize: 13, color: t.ink, flex: 1 }}>{item.name}</div>
            {canEdit && <button onClick={() => handleDelete(item.id)} style={{ ...btnBase, background: 'transparent', color: '#e5251d', border: `1px solid #e5251d`, padding: '3px 10px', fontSize: 9 }}>删除</button>}
          </div>
          <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.mute }}>{item.content?.value || ''}</div>
        </div>
      ))}
    </div>
  );
}

function TeamReportsTab({ t, reports, isAdmin, canShare, userEmail, btnBase, secHdr, inp, apiFetch, onRefresh, showStatus }) {
  const [viewing, setViewing] = React.useState(null);
  const [showImport, setShowImport] = React.useState(false);
  const [importSel, setImportSel] = React.useState({});
  const [importing, setImporting] = React.useState(false);

  // Import candidates = my personal saved reports, deduped against team titles
  const importCandidates = React.useMemo(() => {
    let mine = [];
    try { mine = JSON.parse(localStorage.getItem('atlas_saved_reports') || '[]'); } catch {}
    const existingTitles = new Set(reports.map(r => (r.title || '').trim()));
    return mine.map(r => {
      const title = r.meta?.titleEn || r.meta?.title?.en || (r.prompt || '').slice(0, 40) || '无标题';
      const wordCount = parseInt(String(r.meta?.words || '0').replace(/,/g, ''), 10) || 0;
      return { id: r.id, title, prompt: r.prompt || '', wordCount, content: { text: r.text || '', sections: r.sections || [] } };
    }).filter(r => !existingTitles.has(r.title.trim()));
  }, [reports, showImport]);

  const handleImport = async () => {
    const sel = importCandidates.filter(c => importSel[c.id]);
    if (!sel.length) return;
    setImporting(true);
    try {
      for (const c of sel) {
        await apiFetch('/api/teams/reports', { method: 'POST', body: JSON.stringify({ title: c.title, prompt: c.prompt, content: c.content, wordCount: c.wordCount, sharedByEmail: userEmail || '' }) });
      }
      setShowImport(false); setImportSel({});
      await onRefresh();
      showStatus(`已共享 ${sel.length} 篇报告`);
    } catch (e) { showStatus(e.message, true); }
    setImporting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('确认从团队报告库中删除该报告？')) return;
    try {
      await apiFetch(`/api/teams/reports?id=${id}`, { method: 'DELETE' });
      await onRefresh();
      showStatus('已删除');
      if (viewing?.id === id) setViewing(null);
    } catch (e) { showStatus(e.message, true); }
  };

  // The list endpoint omits `content` (lightweight); fetch the full report by id when needed.
  const fetchFull = async (r) => {
    if (r && r.content) return r;
    try { return await apiFetch(`/api/teams/reports?id=${r.id}`); }
    catch (e) { showStatus(e.message, true); return null; }
  };
  const openReport = async (r) => { const full = await fetchFull(r); if (full) setViewing(full); };

  // Copy a team report into the personal localStorage library (readable/exportable there)
  const importToMine = async (rIn) => {
    const r = await fetchFull(rIn);
    if (!r) return;
    try {
      const list = JSON.parse(localStorage.getItem('atlas_saved_reports') || '[]');
      if (list.some(x => x.meta?.teamReportId === r.id)) { showStatus('已在你的报告库中', true); return; }
      const sections = r.content?.sections || [];
      const id = Date.now().toString();
      list.unshift({
        id, prompt: r.prompt || '', text: r.content?.text || '',
        sections, refs: [], selectedSources: [], attachments: [], favorited: false,
        meta: { titleEn: r.title || '团队报告', title: { en: r.title || '团队报告', cn: '' }, subtitle: (r.prompt || '').slice(0, 80),
          date: new Date(r.created_at).toLocaleDateString('zh-CN'), words: (r.word_count || 0).toLocaleString(), sources: 0,
          reading: `${Math.max(1, Math.ceil((r.word_count || 0) / 300))} min`, category: `团队 · ${r.shared_by_email || ''}`,
          issue: 'TEAM', model: '团队共享', teamReportId: r.id },
      });
      localStorage.setItem('atlas_saved_reports', JSON.stringify(list));
      showStatus('已导入到你的报告库');
    } catch { showStatus('导入失败', true); }
  };

  if (viewing) {
    const sections = viewing.content?.sections || [];
    const fullText = viewing.content?.text || '';
    return (
      <div style={{ maxWidth: 760 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <button onClick={() => setViewing(null)} style={{ ...btnBase, background: 'transparent', border: `1px solid ${t.rule}`, color: t.ink }}>← 返回列表</button>
          <span style={{ flex: 1 }}/>
          <button onClick={() => importToMine(viewing)} style={{ ...btnBase, background: t.ink, color: t.paper }}>↓ 导入到我的库</button>
          {isAdmin && <button onClick={() => handleDelete(viewing.id)} style={{ ...btnBase, background: 'transparent', color: '#e5251d', border: `1px solid #e5251d` }}>删除</button>}
        </div>
        <div style={{ fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 24, color: t.ink, marginBottom: 8, lineHeight: 1.2 }}>{viewing.title || '无标题'}</div>
        <div style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${t.rule}` }}>
          分享者 {viewing.shared_by_email || '成员'} · {new Date(viewing.created_at).toLocaleDateString('zh-CN')} · {(viewing.word_count || 0).toLocaleString()} 字
          {viewing.prompt && <div style={{ marginTop: 6, color: t.inkSoft }}>提示词：{viewing.prompt.slice(0, 140)}{viewing.prompt.length > 140 ? '…' : ''}</div>}
        </div>
        <div style={{ fontFamily: t.fontCN, fontSize: 14, color: t.ink, lineHeight: 1.95 }}>
          {sections.length > 0
            ? sections.map((s, i) => (
                <div key={i} style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 16, marginBottom: 10, paddingTop: 8, borderTop: i > 0 ? `1px solid ${t.rule}` : 'none' }}>{s.en || s.title}</div>
                  {(s.blocks || []).map((b, j) => <div key={j} style={{ marginBottom: 10, fontWeight: b.kind === 'lede' ? 600 : 400 }}>{b.text}</div>)}
                </div>
              ))
            : <div style={{ whiteSpace: 'pre-wrap' }}>{fullText || '（无内容）'}</div>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ ...secHdr, marginTop: 0, marginBottom: 0 }}>团队报告库 · {reports.length} 篇</div>
        <span style={{ flex: 1 }}/>
        {canShare && (
          <button onClick={() => setShowImport(v => !v)} style={{ ...btnBase, background: showImport ? t.ink : 'transparent', color: showImport ? t.paper : t.ink, border: `1px solid ${t.ink}` }}>
            {showImport ? '取消' : '↑ 从我的报告库导入'}
          </button>
        )}
      </div>
      {showImport && (
        <div style={{ padding: 16, border: `1px solid ${t.rule}`, marginBottom: 18, background: t.faint }}>
          <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginBottom: 10 }}>
            把你个人报告库里的报告共享给团队（标题已在团队中的不显示）
          </div>
          {importCandidates.length === 0
            ? <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.mute }}>没有可导入的个人报告</div>
            : <>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {importCandidates.map(c => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={!!importSel[c.id]} onChange={e => setImportSel(s => ({ ...s, [c.id]: e.target.checked }))} style={{ flexShrink: 0 }}/>
                      <span style={{ fontFamily: t.fontCN, fontSize: 13, color: t.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                      <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, flexShrink: 0, marginLeft: 'auto' }}>{c.wordCount.toLocaleString()}字</span>
                    </label>
                  ))}
                </div>
                <button onClick={handleImport} disabled={importing || !Object.values(importSel).some(Boolean)}
                  style={{ ...btnBase, background: t.accent, color: '#fff', marginTop: 8, opacity: importing ? 0.5 : 1 }}>
                  {importing ? '共享中…' : `共享选中 (${Object.values(importSel).filter(Boolean).length})`}
                </button>
              </>}
        </div>
      )}
      {reports.length === 0 && !showImport && (
        <div style={{ padding: '40px 16px', border: `1px dashed ${t.rule}`, fontFamily: t.fontCN, fontSize: 14, color: t.mute, textAlign: 'center' }}>
          暂无共享报告<br/><span style={{ fontSize: 12 }}>点上方「↑ 从我的报告库导入」或在报告页点「⊕ 分享到团队」</span>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {reports.map(r => (
          <div key={r.id} onClick={() => openReport(r)} style={{ display: 'flex', flexDirection: 'column', padding: '16px 18px', border: `1px solid ${t.rule}`, background: t.paper, cursor: 'pointer', minHeight: 130 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.ink; e.currentTarget.style.boxShadow = `3px 3px 0 ${t.accent}`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.rule; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 16, color: t.ink, marginBottom: 8, lineHeight: 1.25 }}>{r.title || '无标题'}</div>
            {r.prompt && <div style={{ fontFamily: t.fontCN, fontSize: 12, color: t.inkSoft, lineHeight: 1.55, marginBottom: 'auto', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.prompt}</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${t.faint}` }}>
              <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.shared_by_email || '成员'} · {new Date(r.created_at).toLocaleDateString('zh-CN')} · {(r.word_count || 0).toLocaleString()}字
              </span>
              <button onClick={e => { e.stopPropagation(); importToMine(r); }} title="导入到我的报告库"
                style={{ ...btnBase, background: 'transparent', border: `1px solid ${t.rule}`, color: t.ink, padding: '3px 8px', fontSize: 9 }}>↓ 导入</button>
              {isAdmin && (
                <button onClick={e => { e.stopPropagation(); handleDelete(r.id); }}
                  style={{ ...btnBase, background: 'transparent', color: '#e5251d', border: `1px solid #e5251d`, padding: '3px 8px', fontSize: 9 }}>删除</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamSettingsTab({ t, team, inp, btnBase, secHdr, apiFetch, onRefresh, showStatus, onBack }) {
  const [name, setName] = React.useState(team?.name || '');
  const [saving, setSaving] = React.useState(false);

  const handleRename = async () => {
    if (!name.trim() || name.trim() === team?.name) return;
    setSaving(true);
    try {
      await apiFetch('/api/teams', { method: 'PATCH', body: JSON.stringify({ name: name.trim() }) });
      await onRefresh?.();
      showStatus('团队名称已更新');
    } catch (e) { showStatus(e.message, true); }
    setSaving(false);
  };

  const handleDissolve = async () => {
    if (!confirm(`确认解散团队「${team?.name}」？此操作不可恢复，所有共享数据将被删除。`)) return;
    try {
      await apiFetch('/api/teams', { method: 'DELETE' });
      await onRefresh?.();
      onBack?.();
    } catch (e) { showStatus(e.message, true); }
  };

  return (
    <div>
      <div style={secHdr}>团队名称</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        <input value={name} onChange={e => setName(e.target.value)} style={{ ...inp, flex: 1 }}/>
        <button onClick={handleRename} disabled={saving || !name.trim() || name.trim() === team?.name}
          style={{ ...btnBase, background: t.ink, color: t.paper, opacity: saving ? 0.5 : 1 }}>
          {saving ? '保存中…' : '更新'}
        </button>
      </div>
      <div style={secHdr}>危险操作</div>
      <div style={{ padding: '16px', border: `1.5px solid #e5251d`, background: '#fff5f5' }}>
        <div style={{ fontFamily: t.fontCN, fontSize: 13, color: t.ink, marginBottom: 8 }}>解散团队</div>
        <div style={{ fontFamily: t.fontCN, fontSize: 12, color: t.mute, marginBottom: 14 }}>解散后所有成员将失去访问权限，共享密钥和知识库将被永久删除。</div>
        <button onClick={handleDissolve} style={{ ...btnBase, background: '#e5251d', color: '#fff' }}>解散团队</button>
      </div>
    </div>
  );
}

// ── OutlineStep ─────────────────────────────────────────────────────────────
function OutlineStep({ t, prompt, modelStore, toolbarConfig, onConfirm, onSkip }) {
  const [status, setStatus] = React.useState('connecting');
  const [rawText, setRawText] = React.useState('');
  const [sections, setSections] = React.useState([]);
  const [error, setError] = React.useState('');
  const rawRef = React.useRef('');
  const runKey = React.useRef(0);

  const startGenerate = React.useCallback(() => {
    rawRef.current = '';
    setRawText('');
    setSections([]);
    setError('');
    setStatus('connecting');
    const key = ++runKey.current;
    streamOutline({
      model: modelStore.selected,
      prompt,
      language: toolbarConfig?.language,
      onChunk: (chunk) => {
        if (runKey.current !== key) return;
        rawRef.current += chunk;
        setRawText(rawRef.current);
        setSections(parseOutlineFromText(rawRef.current));
        setStatus('streaming');
      },
      onDone: () => {
        if (runKey.current !== key) return;
        setSections(parseOutlineFromText(rawRef.current));
        setStatus('done');
      },
      onError: (msg) => {
        if (runKey.current !== key) return;
        setError(msg);
        setStatus('error');
      },
    });
  }, [prompt, modelStore, toolbarConfig]);

  React.useEffect(() => { startGenerate(); }, []);

  const updateSection = (i, field, val) =>
    setSections(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const isDone = status === 'done';

  return (
    <div style={{ flex: 1, background: t.paper, color: t.ink, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* Header bar */}
      <div style={{ padding: '12px 36px', borderBottom: `1px solid ${t.rule}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, background: t.paper }}>
        <Tag t={t} accent>◆ 大纲预览 · {modelStore.selected?.name}</Tag>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>
          {status === 'connecting' && '正在生成大纲…'}
          {status === 'streaming' && `生成中… ${sections.length} 章节`}
          {status === 'done' && `${sections.length} 章节 · 可直接编辑后确认`}
          {status === 'error' && '生成失败'}
        </span>
        <span style={{ flex: 1 }}/>
        <Btn t={t} size="sm" onClick={startGenerate}>↺ 重新生成</Btn>
        <Btn t={t} size="sm" onClick={onSkip}>跳过，直接生成</Btn>
        <Btn t={t} size="sm" primary accent onClick={() => sections.length > 0 && onConfirm(sections)}
          style={{ opacity: !isDone || sections.length === 0 ? 0.45 : 1, cursor: !isDone || sections.length === 0 ? 'default' : 'pointer' }}>
          确认，开始生成
        </Btn>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '32px 36px', maxWidth: 760 }}>
        {/* Topic */}
        <div style={{ fontFamily: t.fontCN, fontSize: 13, color: t.mute, marginBottom: 24, lineHeight: 1.6, paddingBottom: 16, borderBottom: `1px solid ${t.rule}` }}>
          <span style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.2, color: t.mute, marginRight: 8 }}>TOPIC</span>
          {prompt.slice(0, 120)}{prompt.length > 120 ? '…' : ''}
        </div>

        {/* Streaming skeleton / sections */}
        {status === 'error' && (
          <div style={{ padding: '12px 16px', border: `1.5px solid #e5251d`, fontFamily: t.fontCN, fontSize: 13, color: '#e5251d' }}>
            ✕ {error}
          </div>
        )}
        {(status === 'connecting') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.mute }}>
            <span style={{ display: 'inline-block', width: 10, height: 18, background: t.accent, animation: 'essay-blink 1s steps(2) infinite' }}/>
            <span style={{ fontFamily: t.fontMono, fontSize: 11 }}>connecting to {modelStore.selected?.name}…</span>
          </div>
        )}
        {sections.map((sec, i) => (
          <div key={i} style={{ marginBottom: 16, border: `1px solid ${t.rule}`, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
              <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, flexShrink: 0 }}>
                {['一','二','三','四','五','六'][i] || i+1}
              </span>
              <input value={sec.title} onChange={e => updateSection(i, 'title', e.target.value)}
                disabled={!isDone}
                style={{ flex: 1, border: 'none', borderBottom: isDone ? `1px solid ${t.rule}` : 'none', background: 'transparent', fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 15, color: t.ink, outline: 'none', padding: '2px 0' }}/>
            </div>
            <textarea value={sec.req} onChange={e => updateSection(i, 'req', e.target.value)}
              disabled={!isDone} rows={2}
              style={{ width: '100%', border: 'none', borderTop: `1px solid ${t.rule}`, background: 'transparent', fontFamily: t.fontCN, fontSize: 12, color: t.inkSoft, lineHeight: 1.65, outline: 'none', resize: 'none', padding: '8px 0 0', boxSizing: 'border-box' }}/>
          </div>
        ))}
        {status === 'streaming' && sections.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.accent }}>
            <span style={{ display: 'inline-block', width: 10, height: 18, background: t.accent, animation: 'essay-blink 1s steps(2) infinite' }}/>
            <span style={{ fontFamily: t.fontMono, fontSize: 11 }}>生成大纲中…</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ParallelDraft ─────────────────────────────────────────────────────────

function ParallelDraft({ t, topic, sections, modelStore, toolbarConfig, onSaveReport, onDone, onBack }) {
  const contentRefs = React.useRef(Object.fromEntries(sections.map(s => [s.id, ''])));
  const [sectionContents, setSectionContents] = React.useState(
    () => Object.fromEntries(sections.map(s => [s.id, '']))
  );
  const [sectionStatus, setSectionStatus] = React.useState(
    () => Object.fromEntries(sections.map(s => [s.id, 'pending']))
  );
  const completedRef = React.useRef(0);
  const [doneCount, setDoneCount] = React.useState(0);
  const savedRef = React.useRef(false);
  const [startTime] = React.useState(Date.now);

  React.useEffect(() => {
    sections.forEach(section => {
      setSectionStatus(prev => ({ ...prev, [section.id]: 'streaming' }));
      streamSection({
        section, topic, researchCtx: [], allSections: sections,
        model: modelStore.selected, toolbarConfig,
        onChunk: (chunk) => {
          contentRefs.current[section.id] += chunk;
          setSectionContents(prev => ({ ...prev, [section.id]: contentRefs.current[section.id] }));
        },
        onDone: () => {
          setSectionStatus(prev => ({ ...prev, [section.id]: 'done' }));
          completedRef.current++;
          setDoneCount(completedRef.current);
        },
        onError: () => {
          setSectionStatus(prev => ({ ...prev, [section.id]: 'error' }));
          completedRef.current++;
          setDoneCount(completedRef.current);
        },
      });
    });
  }, []);

  const allDone = doneCount >= sections.length;

  React.useEffect(() => {
    if (!allDone || savedRef.current) return;
    savedRef.current = true;
    const fullText = sections.map(s => contentRefs.current[s.id] || '').join('\n\n');
    const parsedSections = parseMarkdownReport(fullText);
    const wordCount = fullText.replace(/\s+/g, ' ').trim().length;
    const titleLine = fullText.split('\n').find(l => l.startsWith('#'))?.replace(/^#+\s*/, '') || topic.slice(0, 60);
    const readMins = Math.max(1, Math.ceil(wordCount / 300));
    const now = new Date();
    const DAY_CN = ['日','一','二','三','四','五','六'];
    onSaveReport?.({
      id: now.getTime().toString(), prompt: topic, text: fullText,
      sections: parsedSections, refs: [], selectedSources: [], attachments: [],
      meta: {
        titleEn: titleLine, titleCn: '', title: { en: titleLine, cn: '' },
        subtitle: topic.slice(0, 80),
        date: `${now.getMonth()+1}月${now.getDate()}日 · 周${DAY_CN[now.getDay()]}`,
        words: wordCount.toLocaleString(), sources: 0, reading: `${readMins} min`,
        category: 'AI · 并行生成', issue: 'AI',
        model: modelStore.selected?.name || 'AI', tone: '', tokens: 0,
        provider: modelStore.selected?.provider || '',
        generationMode: modelStore?.generationMode || '',
        durationMs: Date.now() - startTime,
        sectionCount: parsedSections.length,
        promptHash: PROMPT_VERSION,
      },
      favorited: false,
    });
    onDone?.();
  }, [allDone]);

  const SEC_NUMS = ['一','二','三','四','五','六','七','八'];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', background: t.paper, color: t.ink }}>
      {/* Header */}
      <div style={{ padding: '12px 36px', borderBottom: `1px solid ${t.rule}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <Tag t={t} accent>◆ 并行生成 · {modelStore.selected?.name}</Tag>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>
          {allDone ? `✓ 全部完成` : `${doneCount} / ${sections.length} 章节完成`}
        </span>
        <span style={{ flex: 1 }}/>
        {!allDone && (
          <Btn t={t} size="sm" onClick={onBack}>← 返回大纲</Btn>
        )}
        {allDone && (
          <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>正在保存…</span>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: t.rule, flexShrink: 0 }}>
        <div style={{
          height: '100%', background: t.accent,
          width: `${sections.length > 0 ? (doneCount / sections.length) * 100 : 0}%`,
          transition: 'width 0.4s ease',
        }}/>
      </div>

      {/* Section cards */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 860 }}>
        {sections.map((sec, i) => {
          const status = sectionStatus[sec.id] || 'pending';
          const content = sectionContents[sec.id] || '';
          const wordCount = content.replace(/\s/g, '').length;
          const statusColor = status === 'done' ? '#1f6f44' : status === 'error' ? '#e5251d' : status === 'streaming' ? t.accent : t.mute;
          const statusLabel = status === 'done' ? '✓ 完成' : status === 'error' ? '✕ 错误' : status === 'streaming' ? '生成中…' : '等待中';

          return (
            <div key={sec.id} style={{ border: `1px solid ${status === 'done' ? t.rule : status === 'streaming' ? t.accent : t.rule}`, padding: '16px 20px', transition: 'border-color 0.3s' }}>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, flexShrink: 0 }}>{SEC_NUMS[i] || i+1}</span>
                <span style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 14, color: t.ink, flex: 1 }}>{sec.title}</span>
                <span style={{ fontFamily: t.fontMono, fontSize: 9, color: statusColor, flexShrink: 0 }}>{statusLabel}</span>
                {status === 'done' && <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>{wordCount} 字</span>}
              </div>

              {/* Content preview */}
              {status === 'pending' && (
                <div style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, opacity: 0.5 }}>等待中…</div>
              )}
              {status === 'streaming' && content.length === 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'inline-block', width: 8, height: 14, background: t.accent, animation: 'essay-blink 1s steps(2) infinite' }}/>
                  <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.accent }}>connecting…</span>
                </div>
              )}
              {content.length > 0 && (
                <div style={{ fontFamily: t.fontCN, fontSize: 12, color: t.inkSoft, lineHeight: 1.7, maxHeight: status === 'done' ? 160 : 120, overflow: 'hidden', position: 'relative' }}>
                  {content.replace(/^##[^\n]*\n?/, '').slice(0, 600)}
                  {status === 'streaming' && <span style={{ display: 'inline-block', width: 8, height: 13, background: t.accent, marginLeft: 2, animation: 'essay-blink 1s steps(2) infinite', verticalAlign: 'middle' }}/>}
                  {(content.replace(/^##[^\n]*\n?/, '').length > 600 || status === 'done') && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, background: `linear-gradient(transparent, ${t.paper})` }}/>
                  )}
                </div>
              )}
              {status === 'error' && (
                <div style={{ fontFamily: t.fontMono, fontSize: 10, color: '#e5251d' }}>生成失败，其他章节不受影响</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Workflow ─────────────────────────────────────────────────────────────

async function streamSection({ section, topic, researchCtx, allSections, model, toolbarConfig, onChunk, onDone, onError }) {
  const langInstr = toolbarConfig?.language?.instr || '使用简体中文写作';
  const otherSections = allSections.filter(s => s.id !== section.id).map(s => `• ${s.title}`).join('\n');
  const researchBlock = researchCtx?.length > 0
    ? '\n\n参考资料：\n' + researchCtx.map((r, i) => `【${i+1}】${r.title}（${r.url}）\n${r.content}`).join('\n\n')
    : '';

  const totalLength = toolbarConfig?.length || 2500;
  const sectionCount = allSections.length || 1;
  const perSection = Math.round(totalLength / sectionCount);
  const perMin = Math.round(perSection * 0.85);
  const perMax = Math.round(perSection * 1.15);
  const lengthInstr = `本章节字数：严格控制在 ${perMin}–${perMax} 字（不得超出，不得偏少超过 15%）`;

  const systemPrompt = `你是专业报告写作助手。${langInstr}。你正在撰写一篇关于「${topic}」的完整报告中的一个章节。
报告其他章节：
${otherSections}

只写分配给你的这一章节，不要写其他章节。不要写章节编号，以 ## 开头写章节标题。${lengthInstr}。${buildMemoryBlock(topic)}`;

  const userMsg = `请撰写以下章节：
标题：${section.title}
写作要求：${section.req || '详细分析此章节话题'}${researchBlock}`;

  const apiKey = model?.apiKey || '';
  const apiUrl = (model?.apiUrl || '').replace(/\/$/, '');
  const sectionMaxTokens = Math.min(Math.max(Math.ceil(perMax * 2.5) + 500, 800), 8000);

  if (!apiKey) {
    // Use server-side key via /api/generate
    try {
      const { supabase: sb } = await import('./lib/supabase.js');
      const { data: { session } } = await sb.auth.getSession();
      const token = session?.access_token;
      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }], stream: true, max_tokens: sectionMaxTokens, temperature: 0.5 }),
      });
      if (!resp.ok) { const e = await resp.text(); throw new Error(`API ${resp.status}: ${e.slice(0, 200)}`); }
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') { onDone?.(); return; }
          try { const d = JSON.parse(raw); const c = d.choices?.[0]?.delta?.content; if (c) onChunk?.(c); } catch {}
        }
      }
      onDone?.();
    } catch (e) { onError?.(String(e)); }
    return;
  }

  try {
    const resp = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: model.id, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }], stream: true, max_tokens: sectionMaxTokens, temperature: 0.5 }),
    });
    if (!resp.ok) { const e = await resp.text(); throw new Error(`API ${resp.status}: ${e.slice(0, 200)}`); }
    const reader = resp.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') { onDone?.(); return; }
        try { const d = JSON.parse(raw); const c = d.choices?.[0]?.delta?.content; if (c) onChunk?.(c); } catch {}
      }
    }
    onDone?.();
  } catch (e) { onError?.(String(e)); }
}

// ── WorkflowView ──────────────────────────────────────────────────────────
function WorkflowView({ t, topic, modelStore, toolbarConfig, onSaveReport, onBack }) {
  const PHASES = ['research', 'outline', 'draft', 'final'];
  const [phase, setPhase] = React.useState('research');

  // Research
  const [researchStatus, setResearchStatus] = React.useState('loading'); // loading|done|error
  const [researchResults, setResearchResults] = React.useState([]);
  const [selectedUrls, setSelectedUrls] = React.useState(new Set());
  const [researchError, setResearchError] = React.useState('');

  // Outline
  const [outlineStatus, setOutlineStatus] = React.useState('idle');
  const [outlineRaw, setOutlineRaw] = React.useState('');
  const [sections, setSections] = React.useState([]);

  // Draft
  const [draftStatus, setDraftStatus] = React.useState('idle'); // idle|running|done
  const [sectionDrafts, setSectionDrafts] = React.useState({}); // {id: {status, content}}

  const updateSection = (i, field, val) => setSections(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const selectedResults = researchResults.filter(r => selectedUrls.has(r.url));

  // ── Phase 1: Research ─────────────────────────────────────────────────
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { supabase: sb } = await import('./lib/supabase.js');
        const { data: { session } } = await sb.auth.getSession();
        const token = session?.access_token;
        const resp = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ query: topic.slice(0, 200), maxResults: 6 }),
        });
        if (!resp.ok) throw new Error(`搜索失败 ${resp.status}`);
        const data = await resp.json();
        if (cancelled) return;
        const results = data.results || [];
        setResearchResults(results);
        setSelectedUrls(new Set(results.map(r => r.url)));
        setResearchStatus('done');
      } catch (e) {
        if (!cancelled) { setResearchError(e.message); setResearchStatus('error'); }
      }
    })();
    return () => { cancelled = true; };
  }, [topic]);

  // ── Phase 2: Outline ──────────────────────────────────────────────────
  const runOutline = React.useCallback(() => {
    setOutlineStatus('running');
    setOutlineRaw('');
    setSections([]);
    const rawRef = { current: '' };
    streamOutline({
      model: modelStore.selected,
      prompt: topic,
      language: toolbarConfig?.language,
      onChunk: (c) => { rawRef.current += c; setOutlineRaw(rawRef.current); setSections(parseOutlineFromText(rawRef.current)); setOutlineStatus('streaming'); },
      onDone: () => { setSections(parseOutlineFromText(rawRef.current)); setOutlineStatus('done'); },
      onError: (e) => setOutlineStatus('error_' + e),
    });
  }, [topic, modelStore, toolbarConfig]);

  React.useEffect(() => { if (phase === 'outline' && outlineStatus === 'idle') runOutline(); }, [phase]);

  // ── Phase 3: Draft ────────────────────────────────────────────────────
  const runDraft = React.useCallback(async () => {
    if (draftStatus === 'running') return;
    setDraftStatus('running');
    const initDrafts = {};
    sections.forEach(s => { initDrafts[s.id] = { status: 'running', content: '' }; });
    setSectionDrafts(initDrafts);

    await Promise.all(sections.map(async (section) => {
      const contentRef = { current: '' };
      await new Promise(resolve => {
        streamSection({
          section, topic, researchCtx: selectedResults,
          allSections: sections, model: modelStore.selected,
          toolbarConfig,
          onChunk: (c) => {
            contentRef.current += c;
            setSectionDrafts(prev => ({ ...prev, [section.id]: { status: 'running', content: contentRef.current } }));
          },
          onDone: () => {
            setSectionDrafts(prev => ({ ...prev, [section.id]: { status: 'done', content: contentRef.current } }));
            resolve();
          },
          onError: (e) => {
            setSectionDrafts(prev => ({ ...prev, [section.id]: { status: 'error', content: e } }));
            resolve();
          },
        });
      });
    }));
    setDraftStatus('done');
  }, [sections, selectedResults, topic, modelStore, toolbarConfig, draftStatus]);

  React.useEffect(() => { if (phase === 'draft' && draftStatus === 'idle') runDraft(); }, [phase]);

  // ── Phase 4: Final save ───────────────────────────────────────────────
  const handleSave = () => {
    const fullText = sections.map(s => sectionDrafts[s.id]?.content || '').join('\n\n');
    const parsedSections = parseMarkdownReport(fullText);
    const wordCount = fullText.replace(/\s+/g, ' ').trim().length;
    const titleLine = fullText.split('\n').find(l => l.startsWith('#'))?.replace(/^#+\s*/, '') || topic.slice(0, 60);
    const readMins = Math.max(1, Math.ceil(wordCount / 300));
    const now = new Date();
    const DAY_CN = ['日','一','二','三','四','五','六'];
    const report = {
      id: now.getTime().toString(),
      prompt: topic,
      text: fullText,
      sections: parsedSections,
      refs: [],
      selectedSources: [],
      attachments: [],
      meta: {
        titleEn: titleLine, titleCn: '',
        title: { en: titleLine, cn: '' },
        subtitle: topic.slice(0, 80),
        date: `${now.getMonth()+1}月${now.getDate()}日 · 周${DAY_CN[now.getDay()]}`,
        words: wordCount.toLocaleString(),
        sources: 0,
        reading: `${readMins} min`,
        category: 'AI · 工作流',
        issue: 'AI',
        model: modelStore.selected?.name || 'AI',
        tone: '',
        tokens: 0,
      },
      favorited: false,
    };
    onSaveReport?.(report);
    onBack?.('report');
  };

  // ── Sidebar ───────────────────────────────────────────────────────────
  const nodeLabel = { research: '资料搜集', outline: '大纲确认', draft: '章节写作', final: '完成存档' };
  const nodeIcon = { research: '⊕', outline: '◆', draft: '▶', final: '✓' };
  const phaseIdx = PHASES.indexOf(phase);

  const nodeStatus = (p) => {
    const idx = PHASES.indexOf(p);
    if (idx < phaseIdx) return 'done';
    if (idx === phaseIdx) return 'active';
    return 'idle';
  };

  const sidebarNodeStyle = (p) => {
    const s = nodeStatus(p);
    return {
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
      cursor: s === 'done' ? 'pointer' : 'default',
      borderLeft: `3px solid ${s === 'active' ? t.accent : s === 'done' ? t.ink : t.rule}`,
      background: s === 'active' ? t.faint : 'transparent',
    };
  };

  const allDraftsDone = sections.length > 0 && sections.every(s => sectionDrafts[s.id]?.status === 'done');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: t.paper }}>
      {/* Header */}
      <div style={{ padding: '10px 24px', borderBottom: `1px solid ${t.rule}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: t.fontMono, fontSize: 10, color: t.mute, padding: '2px 0', letterSpacing: 0.8 }}>← 返回</button>
        <span style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.5, color: t.mute }}>WORKFLOW MODE</span>
        <span style={{ fontFamily: t.fontCN, fontSize: 13, color: t.ink, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{topic.slice(0, 80)}</span>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 180, borderRight: `1px solid ${t.rule}`, flexShrink: 0, paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {PHASES.map((p, i) => (
            <div key={p} onClick={() => nodeStatus(p) === 'done' && setPhase(p)} style={sidebarNodeStyle(p)}>
              <span style={{ fontFamily: t.fontMono, fontSize: 11, color: nodeStatus(p) === 'idle' ? t.mute : t.ink, width: 16, textAlign: 'center' }}>{nodeIcon[p]}</span>
              <div>
                <div style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 0.8, color: t.mute }}>0{i+1}</div>
                <div style={{ fontFamily: t.fontCN, fontSize: 12, color: nodeStatus(p) === 'idle' ? t.mute : t.ink }}>{nodeLabel[p]}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'auto', padding: '28px 36px' }}>

          {/* ── RESEARCH ─────────────────────────────────── */}
          {phase === 'research' && (
            <div style={{ maxWidth: 700 }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.5, color: t.mute, marginBottom: 16 }}>01 · RESEARCH</div>
              {researchStatus === 'loading' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.mute }}>
                  <span style={{ display: 'inline-block', width: 8, height: 16, background: t.accent, animation: 'essay-blink 1s steps(2) infinite' }}/>
                  <span style={{ fontFamily: t.fontMono, fontSize: 11 }}>正在搜索相关资料…</span>
                </div>
              )}
              {researchStatus === 'error' && (
                <div style={{ padding: '12px 16px', border: `1.5px solid #e5251d`, fontFamily: t.fontCN, fontSize: 13, color: '#e5251d', marginBottom: 16 }}>
                  ✕ 搜索失败：{researchError}<br/>
                  <span style={{ fontSize: 11 }}>请确认 Tavily API Key 已在 Vercel 配置。可直接跳过进行大纲。</span>
                </div>
              )}
              {(researchStatus === 'done' || researchStatus === 'error') && researchResults.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  {researchResults.map((r, i) => {
                    const checked = selectedUrls.has(r.url);
                    return (
                      <div key={i} onClick={() => setSelectedUrls(prev => { const n = new Set(prev); checked ? n.delete(r.url) : n.add(r.url); return n; })}
                        style={{ display: 'flex', gap: 12, padding: '12px 14px', marginBottom: 8, border: `1px solid ${checked ? t.ink : t.rule}`, cursor: 'pointer', background: checked ? t.faint : 'transparent' }}>
                        <span style={{ fontFamily: t.fontMono, fontSize: 11, color: checked ? t.accent : t.mute, flexShrink: 0, marginTop: 1 }}>{checked ? '✓' : '○'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: t.fontBody, fontSize: 13, color: t.ink, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                          <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.url}</div>
                          <div style={{ fontFamily: t.fontCN, fontSize: 11, color: t.mute, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.content}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {researchStatus === 'done' && researchResults.length === 0 && (
                <div style={{ fontFamily: t.fontCN, fontSize: 13, color: t.mute, marginBottom: 20 }}>未找到相关资料，将基于模型知识生成。</div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                {researchStatus !== 'loading' && (
                  <Btn t={t} primary accent size="md" onClick={() => { setPhase('outline'); }}>
                    继续 → 生成大纲
                  </Btn>
                )}
              </div>
            </div>
          )}

          {/* ── OUTLINE ──────────────────────────────────── */}
          {phase === 'outline' && (
            <div style={{ maxWidth: 700 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <span style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.5, color: t.mute }}>02 · OUTLINE</span>
                {outlineStatus === 'done' && <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>{sections.length} 章节 · 可编辑</span>}
                <span style={{ flex: 1 }}/>
                <Btn t={t} size="sm" onClick={runOutline}>↺ 重新生成</Btn>
              </div>
              {(outlineStatus === 'running' || outlineStatus === 'streaming') && sections.length === 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.mute }}>
                  <span style={{ display: 'inline-block', width: 8, height: 16, background: t.accent, animation: 'essay-blink 1s steps(2) infinite' }}/>
                  <span style={{ fontFamily: t.fontMono, fontSize: 11 }}>正在生成大纲…</span>
                </div>
              )}
              {sections.map((sec, i) => (
                <div key={sec.id || i} style={{ marginBottom: 12, border: `1px solid ${t.rule}`, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, flexShrink: 0 }}>{['一','二','三','四','五','六'][i] || i+1}</span>
                    <input value={sec.title} onChange={e => updateSection(i, 'title', e.target.value)} disabled={outlineStatus !== 'done'}
                      style={{ flex: 1, border: 'none', borderBottom: outlineStatus === 'done' ? `1px solid ${t.rule}` : 'none', background: 'transparent', fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 15, color: t.ink, outline: 'none', padding: '2px 0' }}/>
                  </div>
                  <textarea value={sec.req} onChange={e => updateSection(i, 'req', e.target.value)} disabled={outlineStatus !== 'done'} rows={2}
                    style={{ width: '100%', border: 'none', borderTop: `1px solid ${t.rule}`, background: 'transparent', fontFamily: t.fontCN, fontSize: 12, color: t.inkSoft, lineHeight: 1.65, outline: 'none', resize: 'none', padding: '8px 0 0', boxSizing: 'border-box' }}/>
                </div>
              ))}
              {outlineStatus === 'done' && sections.length > 0 && (
                <Btn t={t} primary accent size="md" style={{ marginTop: 8 }} onClick={() => setPhase('draft')}>
                  开始写作 →
                </Btn>
              )}
            </div>
          )}

          {/* ── DRAFT ────────────────────────────────────── */}
          {phase === 'draft' && (
            <div style={{ maxWidth: 760 }}>
              {(() => {
                const totalChars = sections.reduce((n, s) => n + (sectionDrafts[s.id]?.content?.replace(/\s/g,'')?.length || 0), 0);
                const doneSections = sections.filter(s => sectionDrafts[s.id]?.status === 'done').length;
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <span style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.5, color: t.mute }}>03 · DRAFT</span>
                    <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>
                      {draftStatus === 'running' && `生成中… ${doneSections}/${sections.length} 章节`}
                      {draftStatus === 'done' && `全部完成 · ${sections.length} 章节`}
                    </span>
                    {totalChars > 0 && (
                      <span style={{ fontFamily: t.fontMono, fontSize: 11, color: t.accent, fontWeight: 600 }}>
                        共 {totalChars.toLocaleString()} 字
                      </span>
                    )}
                    <span style={{ flex: 1 }}/>
                    {draftStatus === 'done' && <Btn t={t} size="sm" onClick={() => { setDraftStatus('idle'); runDraft(); }}>↺ 全部重新生成</Btn>}
                  </div>
                );
              })()}
              {sections.map((sec, i) => {
                const d = sectionDrafts[sec.id] || { status: 'idle', content: '' };
                return (
                  <div key={sec.id || i} style={{ marginBottom: 20, border: `1px solid ${d.status === 'done' ? t.ink : d.status === 'error' ? '#e5251d' : t.rule}` }}>
                    <div style={{ padding: '8px 14px', borderBottom: `1px solid ${t.rule}`, display: 'flex', alignItems: 'center', gap: 10, background: t.faint }}>
                      <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>{['一','二','三','四','五','六'][i] || i+1}</span>
                      <span style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 13, color: t.ink, flex: 1 }}>{sec.title}</span>
                      <span style={{ fontFamily: t.fontMono, fontSize: 9, color: d.status === 'done' ? t.accent : d.status === 'error' ? '#e5251d' : t.mute }}>
                        {d.status === 'running' ? '写作中…' : d.status === 'done' ? `${d.content.replace(/\s/g,'').length.toLocaleString()} 字` : d.status === 'error' ? '✕ 失败' : '等待'}
                      </span>
                      {d.status === 'done' && (
                        <button onClick={() => {
                          setSectionDrafts(prev => ({ ...prev, [sec.id]: { status: 'running', content: '' } }));
                          const contentRef = { current: '' };
                          streamSection({ section: sec, topic, researchCtx: selectedResults, allSections: sections, model: modelStore.selected, toolbarConfig,
                            onChunk: c => { contentRef.current += c; setSectionDrafts(prev => ({ ...prev, [sec.id]: { status: 'running', content: contentRef.current } })); },
                            onDone: () => setSectionDrafts(prev => ({ ...prev, [sec.id]: { status: 'done', content: contentRef.current } })),
                            onError: e => setSectionDrafts(prev => ({ ...prev, [sec.id]: { status: 'error', content: e } })),
                          });
                        }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: t.fontMono, fontSize: 9, color: t.mute, padding: 0 }}>↺</button>
                      )}
                    </div>
                    <div style={{ padding: '14px 16px', fontFamily: t.fontCN, fontSize: 13, color: t.ink, lineHeight: 1.8, whiteSpace: 'pre-wrap', maxHeight: 320, overflowY: 'auto' }}>
                      {d.status === 'idle' && <span style={{ color: t.mute }}>等待生成…</span>}
                      {d.status === 'error' && <span style={{ color: '#e5251d' }}>✕ {d.content}</span>}
                      {(d.status === 'running' || d.status === 'done') && (
                        <>
                          {d.content}
                          {d.status === 'running' && <span style={{ display: 'inline-block', width: 8, height: 14, background: t.accent, marginLeft: 2, animation: 'essay-blink 1s steps(2) infinite', verticalAlign: 'middle' }}/>}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {allDraftsDone && (
                <Btn t={t} primary accent size="md" style={{ marginTop: 8 }} onClick={() => setPhase('final')}>
                  存档报告 →
                </Btn>
              )}
            </div>
          )}

          {/* ── FINAL ────────────────────────────────────── */}
          {phase === 'final' && (
            <div style={{ maxWidth: 700 }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.5, color: t.mute, marginBottom: 20 }}>04 · FINAL</div>
              <div style={{ padding: '20px 24px', border: `1px solid ${t.ink}`, marginBottom: 20 }}>
                <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 18, color: t.ink, marginBottom: 8 }}>{topic.slice(0, 80)}</div>
                <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginBottom: 16 }}>
                  {sections.length} 个章节 · 约 {sections.reduce((n, s) => n + (sectionDrafts[s.id]?.content?.replace(/\s/g,'')?.length || 0), 0).toLocaleString()} 字
                </div>
                {sections.map((sec, i) => (
                  <div key={sec.id || i} style={{ marginBottom: 6, padding: '6px 0', borderTop: i > 0 ? `1px solid ${t.rule}` : 'none' }}>
                    <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginRight: 8 }}>0{i+1}</span>
                    <span style={{ fontFamily: t.fontCN, fontSize: 13, color: t.ink }}>{sec.title}</span>
                    <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginLeft: 8 }}>{(sectionDrafts[sec.id]?.content?.replace(/\s/g,'')?.length || 0).toLocaleString()}字</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn t={t} size="md" onClick={() => setPhase('draft')}>← 回到草稿</Btn>
                <Btn t={t} primary accent size="md" onClick={handleSave}>✓ 存入报告库</Btn>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Component -----------------------------------------------------------
function Running({ t, prompt, onDone, onTimelineComplete, marginaliaOn = true, density = 'editorial', modelStore, toolbarConfig, onSaveReport, researchMode = false }) {
  const selectedModel = modelStore?.selected;
  const isLiveMode = !!(selectedModel?.apiKey);

  // effectivePrompt: just the raw user prompt (toolbar config is passed to streamReport directly)
  const effectivePrompt = prompt;

  // ── LIVE MODE state ──────────────────────────────────────────────────
  const [liveText, setLiveText] = React.useState('');
  const [liveStatus, setLiveStatus] = React.useState('connecting'); // fetching | connecting | streaming | done | error
  const [liveFetchProgress, setLiveFetchProgress] = React.useState({ done: 0, total: 0 });
  const [liveError, setLiveError] = React.useState('');
  const [liveStartTime] = React.useState(Date.now);
  const [liveElapsed, setLiveElapsed] = React.useState(0);
  const [liveTokens, setLiveTokens] = React.useState(0);
  const liveTimerRef = React.useRef(null);

  // Agentic research (P4 stage 2) — runs before generation when researchMode on
  const [researchStatus, setResearchStatus] = React.useState(researchMode ? 'pending' : 'off'); // off | pending | running | done
  const [researchLog, setResearchLog] = React.useState([]);
  const researchMetaRef = React.useRef(null);

  // Ref always holds the latest streamed text — no stale-closure risk
  const liveTextRef = React.useRef('');
  const savedRef = React.useRef(false);
  const retryDoneRef = React.useRef(false);
  const [retryStatus, setRetryStatus] = React.useState(null); // null | 'retrying'
  const onSaveReportRef = React.useRef(onSaveReport);
  React.useEffect(() => { onSaveReportRef.current = onSaveReport; });

  React.useEffect(() => {
    if (!isLiveMode) return;
    liveTimerRef.current = setInterval(() => {
      setLiveElapsed(((Date.now() - liveStartTime) / 1000));
    }, 200);

    let cancelled = false;
    (async () => {
      // ── Phase 0: agentic research (optional) ───────────────────────────
      let effectiveConfig = toolbarConfig;
      if (researchMode) {
        setResearchStatus('running');
        try {
          const { context, log } = await runAgenticResearch({
            model: selectedModel,
            prompt: effectivePrompt,
            onStatus: (s) => {
              if (cancelled) return;
              if (s.action) setResearchLog(prev => [...prev, { action: s.action, detail: s.detail }]);
            },
          });
          if (cancelled) return;
          researchMetaRef.current = { rounds: log.filter(l => l.type !== 'error').length, log };
          if (context) effectiveConfig = { ...toolbarConfig, gatheredContext: context };
        } catch { /* degrade silently → plain generation */ }
        if (cancelled) return;
        setResearchStatus('done');
      }

      // ── Phase 1: report generation ─────────────────────────────────────
      streamReport({
      model: selectedModel,
      prompt: effectivePrompt,
      toolbarConfig: effectiveConfig,
      onStatus: ({ phase, total, done }) => {
        if (phase === 'fetching') { setLiveStatus('fetching'); setLiveFetchProgress({ done: done || 0, total: total || 0 }); }
        else if (phase === 'connecting') { setLiveStatus('connecting'); }
      },
      onChunk: (chunk) => {
        setLiveStatus('streaming');
        setLiveText(prev => {
          const next = prev + chunk;
          liveTextRef.current = next;
          return next;
        });
      },
      onDone: (tokens) => {
        clearInterval(liveTimerRef.current);
        const finalText = liveTextRef.current;

        const doSave = (text, totalTokens, retried) => {
          if (!onSaveReportRef.current || !text) return;
          const sections = parseMarkdownReport(text);
          const cleanForCount = text.replace(/^\[TITLE:[^\]]*\]\s*/m,'').replace(/\[REFS\][\s\S]*?(?:\[\/REFS\]|$)/g,'');
          const wordCount = cleanForCount.replace(/\s+/g,' ').trim().length;
          const refsArr = extractRefsFromText(text);
          const refs = refsArr.length || [...new Set((text.match(/§\d+/g) || []))].length;
          const readMins = Math.max(1, Math.ceil(wordCount / 300));
          const now = new Date();
          const DAY_CN = ['日','一','二','三','四','五','六'];
          const aiTitle = extractTitleFromText(text);
          const firstSectionTitle = sections?.[0]?.en?.replace(/^[一二三四五六七八九十]+[、．]\s*/, '').trim();
          const promptFallback = prompt.split(/[\n\r,，。.]/)[0].trim()
            .replace(/^(请|帮我|调研|分析|写一篇|生成|撰写|输出)\s*/,'')
            .replace(/[「」【】『』《》""'']/g,' ').trim();
          const titleEn = aiTitle || firstSectionTitle || promptFallback.slice(0, 52) || 'AI 分析报告';
          const subtitleRaw = prompt.replace(/^[^\n,，。.]{0,80}[,，。.\n]/, '').trim().split('\n')[0].trim();
          const subtitle = subtitleRaw.slice(0, 80) || prompt.slice(0, 80);
          const rawWarnings = validateReport(text, {
            effectiveLength: toolbarConfig?.length,
            templateSections: toolbarConfig?.templateSections,
          });
          const warnings = retried
            ? rawWarnings.map(w => w.includes('截断') ? w + '（已自动续写一次，建议增大 Max Tokens 后重跑）' : w)
            : rawWarnings;
          onSaveReportRef.current({
            id: now.getTime().toString(),
            prompt,
            text,
            sections,
            refs: refsArr,
            selectedSources: [...(toolbarConfig?.selectedSources || [])],
            attachments: (toolbarConfig?.attachments || []).map(a => ({ id: a.id, name: a.name, size: a.size, type: a.type, content: a.content })),
            meta: {
              titleEn, titleCn: '',
              title: { en: titleEn, cn: '' },
              subtitle,
              date: `${now.getMonth()+1}月${now.getDate()}日 · 周${DAY_CN[now.getDay()]}`,
              words: wordCount.toLocaleString(),
              sources: refs,
              reading: `${readMins} min`,
              category: `AI · ${selectedModel?.name || '生成'}`,
              issue: 'AI',
              model: selectedModel?.name || 'AI',
              provider: selectedModel?.provider || '',
              generationMode: modelStore?.generationMode || '',
              durationMs: Date.now() - liveStartTime,
              sectionCount: sections.length,
              promptHash: PROMPT_VERSION,
              tone: toolbarConfig?.tone?.cn || '',
              language: toolbarConfig?.language?.label || '',
              style: toolbarConfig?.style?.label || '',
              length: toolbarConfig?.length || 0,
              tokens: totalTokens,
              warnings: warnings.length > 0 ? warnings : undefined,
              retried: retried || undefined,
              research: researchMetaRef.current || undefined,
            },
            favorited: false,
          });
        };

        // Auto retry on truncation (once only)
        const isTruncated = validateReport(finalText, {
          effectiveLength: toolbarConfig?.length,
          templateSections: toolbarConfig?.templateSections,
        }).some(w => w.includes('截断'));

        if (isTruncated && !retryDoneRef.current && finalText) {
          retryDoneRef.current = true;
          setRetryStatus('retrying');
          setLiveStatus('streaming');
          liveTimerRef.current = setInterval(() => {
            setLiveElapsed(((Date.now() - liveStartTime) / 1000));
          }, 200);

          const tail = finalText.slice(-500);
          const retryPrompt = `${prompt}\n\n【续写指令】上一次生成因 token 限制被截断，请从截断处继续完成报告。直接续写，不要重复已有内容，保持相同格式和风格。\n\n截断处最后内容：\n${tail}\n\n请从这里继续：`;
          let retryChunks = '';

          streamReport({
            model: selectedModel,
            prompt: retryPrompt,
            toolbarConfig,
            onStatus: () => {},
            onChunk: (chunk) => {
              retryChunks += chunk;
              const merged = finalText + retryChunks;
              setLiveText(merged);
              liveTextRef.current = merged;
            },
            onDone: (retryTokens) => {
              clearInterval(liveTimerRef.current);
              const mergedText = finalText + retryChunks;
              if (!savedRef.current) {
                savedRef.current = true;
                doSave(mergedText, (tokens || 0) + (retryTokens || 0), true);
              }
              setRetryStatus(null);
              setLiveTokens((tokens || 0) + (retryTokens || 0));
              setLiveStatus('done');
              onTimelineComplete && onTimelineComplete();
            },
            onError: () => {
              clearInterval(liveTimerRef.current);
              if (!savedRef.current) {
                savedRef.current = true;
                doSave(finalText, tokens || 0, false);
              }
              setRetryStatus(null);
              setLiveTokens(tokens || 0);
              setLiveStatus('done');
              onTimelineComplete && onTimelineComplete();
            },
          });
          return;
        }

        // Normal path
        if (!savedRef.current && finalText && isLiveMode) {
          savedRef.current = true;
          doSave(finalText, tokens || 0, false);
        }
        setLiveTokens(tokens || 0);
        setLiveStatus('done');
        onTimelineComplete && onTimelineComplete();
      },
      onError: (msg) => {
        clearInterval(liveTimerRef.current);
        setLiveStatus('error');
        setLiveError(msg);
        onTimelineComplete && onTimelineComplete();
      },
    });
    })();
    return () => { cancelled = true; clearInterval(liveTimerRef.current); };
  }, []);

  // Split liveText into paragraphs for rendering
  const liveParagraphs = React.useMemo(() => {
    if (!liveText) return [];
    return liveText.split(/\n\n+/).filter(Boolean).map((p, i) => ({
      kind: i === 0 ? 'lede' : 'p', text: p.trim(),
    }));
  }, [liveText]);

  // ── DEMO MODE state ──────────────────────────────────────────────────
  const [elapsed, setElapsed] = React.useState(0);
  const [playing, setPlaying] = React.useState(!isLiveMode);
  const [speed, setSpeed] = React.useState(1);
  const startedRef = React.useRef(Date.now());
  const offsetRef = React.useRef(0);
  const firedDoneRef = React.useRef(false);

  React.useEffect(() => {
    if (isLiveMode) return;
    if (!playing) { offsetRef.current = elapsed; return; }
    startedRef.current = Date.now();
    const id = setInterval(() => {
      const e = offsetRef.current + ((Date.now() - startedRef.current) / 1000) * speed;
      setElapsed(Math.min(e, RUN_TOTAL + 0.5));
      if (e >= RUN_TOTAL) { offsetRef.current = RUN_TOTAL; setPlaying(false); }
    }, 80);
    return () => clearInterval(id);
  }, [playing, speed, isLiveMode]);

  React.useEffect(() => {
    if (isLiveMode) return;
    if (elapsed >= RUN_TOTAL && !firedDoneRef.current) {
      firedDoneRef.current = true;
      onTimelineComplete && onTimelineComplete();
    }
  }, [elapsed, onTimelineComplete, isLiveMode]);

  const { margins, paraIdx, showFigure, complete: demoComplete } = React.useMemo(() => {
    if (isLiveMode) return { margins: [], paraIdx: -1, showFigure: false, complete: false };
    const margins = new Map();
    let paraIdx = -1, showFigure = false, complete = false;
    for (const ev of RUN_EVENTS) {
      if (ev.at > elapsed) break;
      if (ev.kind === 'marginStart') margins.set(ev.id, { id: ev.id, tag: ev.tag, cn: ev.cn, state: 'live', t: ev.at });
      else if (ev.kind === 'marginDone' && margins.has(ev.id)) margins.get(ev.id).state = 'done';
      else if (ev.kind === 'marginAdd') margins.set(ev.id, { id: ev.id, tag: ev.tag, cn: ev.cn, state: 'done', t: ev.at });
      else if (ev.kind === 'paragraph') paraIdx = Math.max(paraIdx, ev.idx);
      else if (ev.kind === 'figure') showFigure = true;
      else if (ev.kind === 'complete') complete = true;
    }
    return { margins: Array.from(margins.values()), paraIdx, showFigure, complete };
  }, [elapsed, isLiveMode]);

  const activePara = React.useMemo(() => {
    if (isLiveMode || paraIdx < 0) return null;
    const startEv = RUN_EVENTS.find(e => e.kind === 'paragraph' && e.idx === paraIdx);
    const nextEv = RUN_EVENTS.find(e => e.at > (startEv?.at || 0) && (e.kind === 'paragraph' || e.kind === 'figure' || e.kind === 'complete'));
    const start = startEv?.at || 0;
    const finish = nextEv?.at || RUN_TOTAL;
    const para = RUN_PARAGRAPHS[paraIdx];
    if (!para) return null;
    const progress = Math.max(0, Math.min(1, (elapsed - start) / Math.max((finish - start) * 0.92, 0.6)));
    return { ...para, idx: paraIdx, revealCount: Math.floor(progress * para.text.length), complete: elapsed >= finish - 0.2 };
  }, [paraIdx, elapsed, isLiveMode]);

  // ── Unified derived values ───────────────────────────────────────────
  const complete = isLiveMode ? (liveStatus === 'done' || liveStatus === 'error') : demoComplete;
  const progressPct = isLiveMode
    ? (liveStatus === 'done' ? 100 : Math.min(95, (liveText.length / 1800) * 100))
    : Math.min(100, (elapsed / RUN_TOTAL) * 100);

  const editorial = density === 'editorial';
  const bodyCols = editorial
    ? (marginaliaOn ? '1fr 600px 220px 1fr' : '1fr 720px 1fr')
    : (marginaliaOn ? '1fr 540px 200px 1fr' : '1fr 660px 1fr');

  // ── Live marginalia (generated from API keywords) ────────────────────
  const liveMargins = React.useMemo(() => {
    if (!isLiveMode) return [];
    const out = [];
    // Agentic research trail (P4 stage 2)
    if (researchStatus !== 'off') {
      researchLog.forEach((r, i) => {
        const tag = r.action === 'search' ? 'SEARCH' : r.action === 'mcp' ? 'MCP' : 'READ';
        const verb = r.action === 'search' ? '搜索' : r.action === 'mcp' ? 'MCP' : '读取';
        out.push({ id: `research-${i}`, tag, cn: `${verb}：${(r.detail || '').slice(0, 40)}`, state: 'done', t: 0 });
      });
      if (researchStatus === 'running') out.push({ id: 'research-live', tag: 'RESEARCH', cn: '模型自主研究中…', state: 'live', t: 0 });
    }
    if (liveStatus === 'fetching') out.push({ id: 'fetch', tag: 'FETCH', cn: `抓取网页内容… ${liveFetchProgress.done}/${liveFetchProgress.total}`, state: 'live', t: 0 });
    if (liveStatus === 'connecting') out.push({ id: 'connect', tag: 'CONNECT', cn: `正在连接 ${selectedModel?.name || '模型'}…`, state: 'live', t: 0 });
    if (liveStatus === 'streaming' || liveStatus === 'done') {
      out.push({ id: 'write', tag: 'WRITE', cn: `${selectedModel?.name || 'AI'} 正在撰写…`, state: liveStatus === 'done' ? 'done' : 'live', t: 0.5 });
      const charCount = liveText.length;
      if (charCount > 300) out.push({ id: 'p1', tag: 'PARA 1', cn: '完成第一段', state: 'done', t: 2 });
      if (charCount > 700) out.push({ id: 'p2', tag: 'PARA 2', cn: '完成第二段', state: 'done', t: 5 });
      if (charCount > 1100) out.push({ id: 'p3', tag: 'PARA 3', cn: '完成第三段', state: 'done', t: 8 });
    }
    if (liveStatus === 'done') out.push({ id: 'done', tag: 'DONE', cn: `共 ${liveText.length} 字`, state: 'done', t: liveElapsed });
    if (liveStatus === 'error') out.push({ id: 'err', tag: 'ERROR', cn: liveError.slice(0, 60), state: 'done', t: liveElapsed });
    return out;
  }, [isLiveMode, liveStatus, liveText.length, liveError, selectedModel, liveElapsed, researchStatus, researchLog]);

  const displayMargins = isLiveMode ? liveMargins : margins;

  return (
    <div style={{ flex: 1, background: t.paper, color: t.ink, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* Header bar */}
      <div style={{
        padding: '14px 36px', borderBottom: `1px solid ${t.rule}`,
        display: 'flex', alignItems: 'center', gap: 18, background: t.paper, flexShrink: 0,
      }}>
        <LiveDot color={complete ? '#10b981' : (liveStatus === 'error' ? '#e5251d' : t.accent)}/>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.4, color: complete ? '#10b981' : t.accent, minWidth: 120 }}>
          {liveStatus === 'error' ? 'ERROR · 出错了' : complete ? 'DONE · 撰写完成' : liveStatus === 'fetching' ? `FETCH · ${liveFetchProgress.done}/${liveFetchProgress.total}` : isLiveMode ? `LIVE · ${selectedModel?.name}` : 'LIVE · 撰写中'}
        </span>
        <div style={{ flex: 1, height: 3, background: t.faint, position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, height: '100%',
            width: `${progressPct}%`,
            background: liveStatus === 'error' ? '#e5251d' : complete ? '#10b981' : t.accent,
            transition: 'width 0.2s linear',
          }}/>
        </div>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, minWidth: 100, textAlign: 'right' }}>
          {isLiveMode
            ? (complete ? `完成 · ${liveElapsed.toFixed(1)}s` : `${liveElapsed.toFixed(1)}s · ${liveText.length} 字`)
            : (complete ? '完成 · 26.0s' : `${elapsed.toFixed(1)}s / ~${RUN_TOTAL.toFixed(0)}s`)}
        </span>
        {!isLiveMode && <Btn t={t} size="sm" onClick={() => setPlaying(p => !p)} disabled={complete}>{playing ? '⏸' : '▶'}</Btn>}
        {!isLiveMode && <Btn t={t} size="sm" onClick={() => setSpeed(s => s === 1 ? 2 : s === 2 ? 4 : 1)} disabled={complete}>×{speed}</Btn>}
        {!isLiveMode && !complete && (
          <Btn t={t} size="sm" onClick={() => { offsetRef.current = RUN_TOTAL; setElapsed(RUN_TOTAL); setPlaying(false); }}>SKIP →</Btn>
        )}
        {complete && <Btn t={t} size="sm" primary accent onClick={onDone}>View report ↗</Btn>}
      </div>

      {/* Essay layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: bodyCols, minHeight: 0, overflow: 'auto' }}>
        <div/>
        <div style={{ padding: '36px 0 48px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <PromptHeader t={t} prompt={prompt}/>
          {/* Model badge in live mode */}
          {isLiveMode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Tag t={t} accent>◈ {selectedModel?.name} · {selectedModel?.provider}</Tag>
              {researchStatus === 'running' && <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.accent }}>◈ 自主研究中… 已调用 {researchLog.length} 个工具</span>}
              {researchStatus === 'done' && researchLog.length > 0 && <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>✓ 研究完成 · 调用 {researchLog.length} 个工具</span>}
              {researchStatus === 'done' && researchLog.length === 0 && <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>✓ 研究完成 · 模型未调用工具</span>}
              {liveStatus === 'fetching' && <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.accent }}>↗ 正在抓取网页内容… ({liveFetchProgress.done}/{liveFetchProgress.total})</span>}
              {liveStatus === 'connecting' && researchStatus !== 'running' && <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>正在连接…</span>}
              {retryStatus === 'retrying' && <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.accent }}>◈ 检测到截断，正在自动补全…</span>}
            </div>
          )}
          {!isLiveMode && (
            <div>
              <BilingualHead t={t} size="md" en="Cold brew, hotter capital." cn="2025 Q1 国内咖啡赛道融资速记" emphasis="From Manner's new round to the sprawl of small-town chains."/>
            </div>
          )}

          <div style={{
            fontFamily: t.fontCN, fontSize: editorial ? 16 : 15,
            lineHeight: 1.85, color: t.inkSoft,
            display: 'flex', flexDirection: 'column', gap: 18,
            paddingTop: 18, borderTop: `2px solid ${t.ink}`,
          }}>
            {/* Agentic research trail (visible regardless of marginalia toggle) */}
            {isLiveMode && researchStatus !== 'off' && (researchLog.length > 0 || researchStatus === 'running') && (
              <div style={{ border: `1px solid ${t.rule}`, background: t.faint, padding: '12px 14px' }}>
                <div style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.2, color: t.mute, marginBottom: researchLog.length ? 8 : 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>自主研究 · RESEARCH</span>
                  {researchStatus === 'running' && <span style={{ display: 'inline-block', width: 7, height: 12, background: t.accent, animation: 'essay-blink 1s steps(2) infinite' }}/>}
                  <span style={{ flex: 1 }}/>
                  <span>{researchLog.length} 次调用</span>
                </div>
                {researchLog.map((r, i) => {
                  const label = r.action === 'search' ? '搜索' : r.action === 'mcp' ? 'MCP' : '读取';
                  return (
                    <div key={i} style={{ display: 'flex', gap: 8, fontFamily: t.fontMono, fontSize: 11, color: t.ink, padding: '3px 0' }}>
                      <span style={{ color: t.accent, flexShrink: 0, width: 38 }}>{label}</span>
                      <span style={{ color: t.mute, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.detail}</span>
                    </div>
                  );
                })}
                {researchStatus === 'running' && researchLog.length === 0 && (
                  <div style={{ fontFamily: t.fontMono, fontSize: 11, color: t.mute }}>模型正在判断是否需要联网/调用工具…</div>
                )}
              </div>
            )}

            {/* LIVE MODE rendering */}
            {isLiveMode && liveParagraphs.map((p, i) => (
              <Paragraph key={i} t={t} para={p} isLead={p.kind === 'lede'} isActive={i === liveParagraphs.length - 1 && liveStatus === 'streaming'}/>
            ))}
            {isLiveMode && liveStatus === 'error' && (
              <div style={{ padding: '12px 16px', border: `1.5px solid #e5251d`, background: t.cardOn, fontFamily: t.fontCN, fontSize: 13, color: '#e5251d', lineHeight: 1.6 }}>
                ✕ API 错误：{liveError}
              </div>
            )}
            {isLiveMode && liveStatus === 'fetching' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.accent }}>
                <span style={{ display: 'inline-block', width: 10, height: 18, background: t.accent, animation: 'essay-blink 1s steps(2) infinite' }}/>
                <span style={{ fontFamily: t.fontMono, fontSize: 11 }}>↗ fetching {liveFetchProgress.done}/{liveFetchProgress.total} URLs via Jina Reader…</span>
              </div>
            )}
            {isLiveMode && liveStatus === 'connecting' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.mute }}>
                <span style={{ display: 'inline-block', width: 10, height: 18, background: t.accent, animation: 'essay-blink 1s steps(2) infinite' }}/>
                <span style={{ fontFamily: t.fontMono, fontSize: 11 }}>connecting to {selectedModel?.name}…</span>
              </div>
            )}

            {/* DEMO MODE rendering */}
            {!isLiveMode && RUN_PARAGRAPHS.slice(0, paraIdx + 1).map((p, i) => {
              const isActive = i === paraIdx && !demoComplete && !(activePara && activePara.complete);
              const text = isActive && activePara ? activePara.text.slice(0, activePara.revealCount) : p.text;
              return <Paragraph key={i} t={t} para={{ ...p, text }} isLead={p.kind === 'lede'} isActive={isActive}/>;
            })}
            {!isLiveMode && showFigure && (
              <Figure t={t} type="chart" label="Fig. 1 · 季度融资金额分布 (亿元)" caption="数据来源：IT 桔子 · 2025 Q1 一级市场数据库" height={220}/>
            )}
            {!isLiveMode && paraIdx < 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.mute }}>
                <span style={{ display: 'inline-block', width: 10, height: 18, background: t.accent, animation: 'essay-blink 1s steps(2) infinite' }}/>
                <span style={{ fontFamily: t.fontMono, fontSize: 11 }}>thinking…</span>
              </div>
            )}
          </div>
        </div>

        {/* Marginalia */}
        {marginaliaOn && (
          <div style={{ padding: '36px 0 36px 24px', borderLeft: `1px dashed ${t.rule}`, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.4, display: 'flex', alignItems: 'center', gap: 6 }}>
              MARGINALIA · 边注<span style={{ flex: 1 }}/><span>{displayMargins.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {displayMargins.map(m => (
                <MarginNote key={m.id} t={t} tag={m.tag} cn={m.cn} state={m.state} time={formatTime(m.t)}/>
              ))}
              {complete && liveStatus !== 'error' && (
                <div style={{ padding: '12px 14px', border: `1.5px solid #10b981`, background: t.cardOn, fontFamily: t.fontCN, fontSize: 12, lineHeight: 1.55, color: t.inkSoft }}>
                  ✓ {isLiveMode ? `写完了，共 ${liveText.length} 字。` : '写完了。共 2,418 字，9 处引用，4 段。'}
                </div>
              )}
            </div>
          </div>
        )}
        <div/>
      </div>
    </div>
  );
}

function Paragraph({ t, para, isLead, isActive }) {
  // Render text with §N footnote markers converted to superscripts
  const parts = [];
  const re = /§(\d+)/g;
  let lastIdx = 0;
  let match;
  while ((match = re.exec(para.text)) !== null) {
    parts.push(para.text.slice(lastIdx, match.index));
    parts.push({ sup: match[1] });
    lastIdx = match.index + match[0].length;
  }
  parts.push(para.text.slice(lastIdx));

  const style = isLead ? {
    margin: 0, fontWeight: 700, fontSize: 19, lineHeight: 1.55, color: t.ink,
  } : { margin: 0 };

  return (
    <p style={style}>
      {parts.map((p, i) => typeof p === 'string'
        ? <React.Fragment key={i}>{p}</React.Fragment>
        : <Sup key={i} n={p.sup} t={t}/>)}
      {isActive && <span style={{
        display: 'inline-block', width: 8, height: 16, background: t.accent,
        verticalAlign: '-3px', marginLeft: 2, animation: 'essay-blink 1s steps(2) infinite',
      }}/>}
    </p>
  );
}

function PromptHeader({ t, prompt }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Tag t={t} accent>◆ YOUR PROMPT · 你的提问</Tag>
      <div style={{
        padding: '12px 0', borderTop: `1px solid ${t.ink}`, borderBottom: `1px solid ${t.ink}`,
        fontFamily: t.fontCN, fontSize: 14, lineHeight: 1.6, color: t.inkSoft,
      }}>{prompt}</div>
    </div>
  );
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

Object.assign(window, { Running, RUN_PARAGRAPHS, RUN_EVENTS, RUN_TOTAL });
// Report — final published essay. Lead paragraph, sections with figures,
// pull quotes, marginal references column. Polished editorial output.

const REPORT_META = {
  issue: '№ 241',
  date: '2026 · MAY · 21',
  duration: '07:42',
  words: '2,418',
  sources: 9,
  reading: '6 min',
  category: 'INDUSTRY · 行业研究',
};

const REPORT_METRICS = [
  { value: '¥11.4亿', en: 'TOTAL', cn: '融资总额',  accent: false },
  { value: '+38%',   en: 'YOY',   cn: '同比增长',  accent: true },
  { value: '9',       en: 'DEALS', cn: '公开事件',  accent: false },
  { value: '6 / 9',   en: 'JAN',   cn: '集中于 1 月', accent: false },
];

const REPORT_SECTIONS = [
  {
    id: 's1', num: '01', en: 'TL;DR', cn: '核心结论',
    blocks: [
      { kind: 'lede',
        text: '钱没少，故事变了——资本退出"高密度精品"叙事，重新拥抱规模与下沉。' },
      { kind: 'p',
        text: '2025 年第一季度，国内连锁咖啡品牌共发生 9 起公开融资事件，总金额约 11.4 亿元§1。其中 6 起集中在 1 月，3 起分布在 2 月与 3 月，节奏明显前置——多数公司选择把好消息放在春节前后释放，回避后段的传统淡季窗口。' },
      { kind: 'p',
        text: '更值得注意的是融资标的的迁移：从过去两年的"精品 / 第三空间 / 高密度门店"叙事，转向"规模化 / 下沉 / 加盟"叙事。两端同时拿钱，中间最难。' },
    ],
  },
  {
    id: 's2', num: '02', en: 'The state of capital', cn: '资本的新姿态',
    blocks: [
      { kind: 'p',
        text: 'Manner 在 1 月完成新一轮融资，估值约 30 亿美元§2，并同步释放"5 年内开设 5,000 家门店"的计划——目前 Manner 的门店数约 1,300 家，这意味着接下来 4 年要保持每年新增 ~900 家的速度。' },
      { kind: 'quote',
        text: '资本不再用"每平米营收"读懂咖啡，它开始用"每个县城"读懂咖啡。',
        by: '一位连锁咖啡品牌的早期投资人 · 行业访谈' },
      { kind: 'p',
        text: '这是公司首次明确表态规模化路径——此前 Manner 长期被视作精品咖啡的代表，2024 年还曾因门店密度过低而被外界质疑增长上限。新的估值与计划，是一次清晰的姿态切换。' },
    ],
  },
  {
    id: 's3', num: '03', en: 'The sprawl beneath', cn: '下沉之下',
    blocks: [
      { kind: 'p',
        text: '另一端则是库迪、挪瓦、本来不该有等品牌密集出现在三四线城市§3。库迪 1 月披露的加盟数据显示，下沉市场加盟商占比已超过 60%。' },
      { kind: 'figure', label: 'Fig. 1 · 季度融资金额分布 (亿元)',
        caption: '数据来源：IT 桔子 · 2025 Q1 一级市场数据库' },
      { kind: 'p',
        text: '从单店模型上看，这些品牌的客单价在 9-12 元之间，比一二线城市的精品咖啡低近一倍。模型成立的前提是低租金、低人力、半成品供应链——这是另一套生意，需要另一套估值体系。' },
    ],
  },
  {
    id: 's4', num: '04', en: 'What to watch', cn: '接下来看什么',
    blocks: [
      { kind: 'p',
        text: '两个信号需要持续跟踪：其一，Manner 的展店速度是否能稳定在年化 ~900 家——这是判断"规模化叙事"能否成立的关键指标。其二，下沉市场的单店模型是否仍能维持 ~12 个月的回本周期。' },
      { kind: 'p',
        text: '如果两条线都顺利，2025 年 H2 会迎来下一波融资。如果有一条断了，资本就会重新回到"中间地带"，那些目前最尴尬的城市——比如杭州、苏州、宁波——可能反而成为新的故事来源。' },
    ],
  },
];

const REPORT_REFS = [
  { n: '[1]', src: 'IT 桔子', title: '2025 Q1 一级市场融资数据库', url: 'itjuzi.com', date: '2025.04.02' },
  { n: '[2]', src: '36 氪',   title: 'Manner 新一轮融资消息',         url: '36kr.com',  date: '2025.01.18' },
  { n: '[3]', src: '窄门餐眼', title: '咖啡品牌门店分布数据',         url: 'zhaimen.cn', date: '2025.03.30' },
  { n: '[4]', src: '行业访谈', title: '5 位早期投资人匿名访谈',       url: 'internal',   date: '2025.04.10' },
];

// ── Follow-up composer ──────────────────────────────────────────────────────
function FollowUpComposer({ t, reportData, rSections, onFollowUp, toolbarStore }) {
  const [text, setText] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [chips, setChips] = React.useState([]);
  const editorial = true;

  // Build context chips from section list
  React.useEffect(() => {
    const secChips = (rSections || []).slice(0, 4).map(s => ({
      id: s.id, label: `引用 ${s.num}`, active: false,
    }));
    setChips(secChips);
  }, [rSections]);

  const toggleChip = (id) => setChips(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const ctxSections = chips.filter(c => c.active).map(c => c.label).join('、');
    const ctx = ctxSections ? `（参考：${ctxSections}）` : '';
    const combined = ctxSections
      ? `${trimmed}${ctx}\n\n[原始报告主题: ${reportData?.meta?.subtitle || reportData?.meta?.titleEn || ''}]`
      : trimmed;
    if (onFollowUp) {
      onFollowUp(combined);
    } else {
      setSent(true);
      setTimeout(() => { setSent(false); setText(''); }, 2000);
    }
  };

  return (
    <div style={{
      marginTop: 36, padding: '18px 22px',
      border: `1.5px solid ${t.ink}`, background: t.cardOn,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Tag t={t} filled>FOLLOW-UP</Tag>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>追问、要求改写或继续</span>
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend(); }}
        placeholder="例：把第二节扩写一倍，加入更多具体数据和案例…"
        style={{
          fontFamily: t.fontCN, fontSize: 14, lineHeight: 1.55, color: t.ink,
          padding: '4px 0', border: 'none', outline: 'none', resize: 'none',
          minHeight: 54, background: 'transparent',
        }}/>
      {/* Section reference chips */}
      {chips.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1 }}>引用节：</span>
          {chips.map(c => (
            <button key={c.id} type="button" onClick={() => toggleChip(c.id)} style={{
              padding: '3px 8px', border: `1px solid ${c.active ? t.accent : t.rule}`,
              background: c.active ? t.accent : 'transparent',
              color: c.active ? '#fff' : t.inkSoft,
              fontFamily: t.fontMono, fontSize: 10, cursor: 'pointer', letterSpacing: 0.5,
            }}>{c.label}</button>
          ))}
        </div>
      )}

      {/* Bottom toolbar — mirrors PromptComposer */}
      <div style={{
        borderTop: `1px solid ${t.rule}`, paddingTop: 10, marginTop: 2,
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', background: t.paperAlt,
        marginLeft: -22, marginRight: -22, paddingLeft: 22, paddingRight: 22,
        paddingBottom: 10,
      }}>
        {toolbarStore ? (
          <>
            <SourcesPopover t={t} store={toolbarStore}/>
            <UrlContextPopover t={t} store={toolbarStore}/>
            <AttachmentsPopover t={t} store={toolbarStore}/>
            <div style={{ width: 1, alignSelf: 'stretch', background: t.rule, margin: '2px 4px' }}/>
            <LanguagePopover t={t} store={toolbarStore}/>
            <StylePopover t={t} store={toolbarStore}/>
            <LengthPopover t={t} store={toolbarStore}/>
          </>
        ) : (
          <>
            <Tag t={t}>＋ 数据源</Tag>
            <Tag t={t}>↗ 网页</Tag>
            <Tag t={t}>＋ 附件</Tag>
            <div style={{ width: 1, alignSelf: 'stretch', background: '#ddd', margin: '2px 4px' }}/>
            <Tag t={t}>语言 · 简体中文</Tag>
            <Tag t={t}>风格 · 商业可读</Tag>
            <Tag t={t}>长度 · 深度</Tag>
            <Tag t={t}>◈ 均衡</Tag>
          </>
        )}
        <span style={{ flex: 1 }}/>
        <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>⌘↵</span>
        <Btn t={t} size="sm" primary accent
          onClick={handleSend}
          style={sent ? { background: '#10b981', borderColor: '#10b981' } : (!text.trim() ? { opacity: 0.4 } : {})}>
          {sent ? '✓ 已发送' : '↗ 发送追问'}
        </Btn>
      </div>
    </div>
  );
}

// Quick inline copy-link button used in the report right-rail share box
function CopyLinkBtn({ t, reportData }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = async () => {
    const id = reportData?.id;
    if (!id) return;
    const base = window.location.href.split('?')[0].split('#')[0];
    const url = `${base}?r=${encodeURIComponent(id)}`;
    try { await navigator.clipboard.writeText(url); } catch { }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  return (
    <Btn t={t} size="sm" onClick={handleCopy}
      style={copied ? { color: '#10b981', borderColor: '#10b981' } : {}}>
      {copied ? '✓ 链接已复制' : '⎘ 复制链接'}
    </Btn>
  );
}

function parseCSV(text) {
  if (!text || typeof text !== 'string') return null;
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return null;
  const sep = lines[0].includes('\t') ? '\t' : ',';
  if (lines[0].split(sep).length < 2) return null;
  const headers = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g,''));
  const rows = lines.slice(1).map(l => l.split(sep).map(c => c.trim().replace(/^"|"$/g,'')));
  return { headers, rows };
}
function ReportCoverPlate({ t, title, category, isStatic, editorial }) {
  // Deterministic seed from title/category string
  const srcStr = (title || category || 'atlas').slice(0, 48);
  let seed = 0;
  for (let i = 0; i < srcStr.length; i++) seed = (seed * 31 + srcStr.charCodeAt(i)) | 0;
  seed = Math.abs(seed);
  const r = (n) => { const x = Math.sin((seed + n) * 9301.1 + n * 49.3) * 43758.5453; return x - Math.floor(x); };

  const VH = editorial ? 200 : 168;
  const PANEL = 188; // left accent panel width (in 800-unit viewBox)

  // Grid-based pattern: 10 cols × 4 rows in the right zone
  const COLS = 10, ROWS = 4;
  const cw = (800 - PANEL) / COLS, rh = VH / ROWS;
  const gridCells = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const idx = row * COLS + col;
      const v = r(idx);
      if (v > 0.62) {
        const span = r(idx + 100) > 0.7 ? 2 : 1;
        gridCells.push({
          x: PANEL + col * cw,
          y: row * rh,
          w: Math.min(span * cw, (800 - PANEL) - col * cw) - 1,
          h: rh - 1,
          useAccent: r(idx + 200) > 0.4,
          opacity: 0.07 + r(idx + 300) * 0.20,
        });
      }
    }
  }

  const bigLetter = (title || category || 'A').replace(/\s/g, '').charAt(0).toUpperCase();
  const catText = (category || (isStatic ? 'INDUSTRY' : 'AI · GEN')).replace(/\s*·.*$/, '').trim().toUpperCase().slice(0, 13);
  const subText = isStatic ? '№ 241' : 'AI · GENERATED';

  return (
    <div style={{ width: '100%', marginBottom: 22, overflow: 'hidden', borderBottom: `2px solid ${t.ink}` }}>
      <svg viewBox={`0 0 800 ${VH}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <clipPath id={`cp-right-${seed}`}>
            <rect x={PANEL} y={0} width={800 - PANEL} height={VH}/>
          </clipPath>
        </defs>

        {/* Right zone background */}
        <rect x={PANEL} width={800 - PANEL} height={VH} fill={t.faint}/>

        {/* Horizontal grid rules (right zone only) */}
        {[0.25, 0.5, 0.75].map((p, i) => (
          <line key={i} x1={PANEL} y1={p * VH} x2={800} y2={p * VH} stroke={t.rule} strokeWidth={0.7}/>
        ))}

        {/* Giant watermark letter */}
        <text x={(PANEL + 800) / 2} y={VH * 0.82} textAnchor="middle"
          fontFamily="'Archivo', sans-serif" fontSize={VH * 1.5} fontWeight={900}
          fill={t.ink} fillOpacity={0.033} clipPath={`url(#cp-right-${seed})`}>
          {bigLetter}
        </text>

        {/* Grid pattern cells */}
        {gridCells.map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h}
            fill={c.useAccent ? t.accent : t.ink} fillOpacity={c.opacity}/>
        ))}

        {/* Thin accent diagonal stripe */}
        <line x1={PANEL} y1={VH} x2={PANEL + VH * 0.6} y2={0} stroke={t.accent} strokeWidth={1} opacity={0.25}/>

        {/* Left accent panel */}
        <rect x={0} y={0} width={PANEL} height={VH} fill={t.accent}/>

        {/* Panel inner rule lines */}
        {[0.33, 0.67].map((p, i) => (
          <line key={i} x1={0} y1={p * VH} x2={PANEL} y2={p * VH} stroke="rgba(255,255,255,0.12)" strokeWidth={0.8}/>
        ))}

        {/* ATLAS label top-left */}
        <text x={14} y={20} fontFamily="'JetBrains Mono', monospace" fontSize={7}
          fill="rgba(255,255,255,0.55)" fontWeight={700} letterSpacing={3.5}>
          ATLAS
        </text>

        {/* Large decorative "AI" or "01" ghost text */}
        <text x={12} y={VH * 0.78} fontFamily="'Archivo', sans-serif" fontSize={VH * 0.62} fontWeight={900}
          fill="rgba(255,255,255,0.09)" letterSpacing={-3}>
          {isStatic ? '01' : 'AI'}
        </text>

        {/* Category label */}
        <text x={14} y={VH - 30} fontFamily="'JetBrains Mono', monospace" fontSize={9.5}
          fill="white" fontWeight={700} letterSpacing={1.8}>
          {catText}
        </text>

        {/* Sub-label */}
        <text x={14} y={VH - 13} fontFamily="'JetBrains Mono', monospace" fontSize={7.5}
          fill="rgba(255,255,255,0.52)" fontWeight={400} letterSpacing={1}>
          {subText}
        </text>

        {/* Panel separator */}
        <line x1={PANEL} y1={0} x2={PANEL} y2={VH} stroke={t.ink} strokeWidth={1.5}/>

        {/* Bottom accent strip */}
        <rect x={0} y={VH - 4} width={800} height={4} fill={t.accent}/>
      </svg>
    </div>
  );
}

// ── Section Refine ────────────────────────────────────────────────────────

async function streamSectionRefine({ sectionTitle, existingText, action, customInstr, topic, model, onChunk, onDone, onError }) {
  const actionPrompts = {
    rewrite: '请完全重新撰写这个章节，保持相同话题但换一个新的角度与结构。',
    expand:  '请扩写这个章节，增加更多细节、数据和分析，字数扩充到原来的 1.5 倍以上。',
    shrink:  '请精简这个章节，保留核心论点，字数压缩到原来的 60% 左右。',
    custom:  customInstr || '请改进这个章节。',
  };
  const instruction = actionPrompts[action] || actionPrompts.custom;

  const systemPrompt = `你是专业报告写作助手。你正在对一篇关于「${topic || '该话题'}」的报告中的某个章节进行精修。
${instruction}

要求：
- 以 ## 开头写章节标题（保持原标题或适当调整）
- 正文使用中文，风格专业、可读
- 只输出这一个章节，不要其他内容`;

  const userMsg = `原章节标题：${sectionTitle}

原章节内容：
${existingText}

请按要求重新写这个章节。`;

  const apiKey = model?.apiKey || '';
  const apiUrl = (model?.apiUrl || '').replace(/\/$/, '');

  const readStream = async (resp) => {
    const reader = resp.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') { onDone?.(); return; }
        try { const d = JSON.parse(raw); const c = d.choices?.[0]?.delta?.content; if (c) onChunk?.(c); } catch {}
      }
    }
    onDone?.();
  };

  try {
    if (!apiKey) {
      const { supabase: sb } = await import('./lib/supabase.js');
      const { data: { session } } = await sb.auth.getSession();
      const token = session?.access_token;
      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }], stream: true, max_tokens: 2000, temperature: 0.5 }),
      });
      if (!resp.ok) throw new Error(`API ${resp.status}`);
      await readStream(resp);
    } else {
      const resp = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: model.id, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }], stream: true, max_tokens: 2000, temperature: 0.5 }),
      });
      if (!resp.ok) throw new Error(`API ${resp.status}`);
      await readStream(resp);
    }
  } catch (e) { onError?.(String(e)); }
}

function SectionRefineBar({ t, section, topic, model, onApply }) {
  const [state, setState] = React.useState('idle'); // idle|running|preview|error
  const [streamText, setStreamText] = React.useState('');
  const [customInstr, setCustomInstr] = React.useState('');
  const [showCustom, setShowCustom] = React.useState(false);
  const streamRef = React.useRef('');

  const existingText = '## ' + section.en + '\n\n' + (section.blocks || []).map(b => b.text || '').join('\n\n');

  const run = (action) => {
    if (state === 'running') return;
    streamRef.current = '';
    setStreamText('');
    setState('running');
    setShowCustom(false);
    streamSectionRefine({
      sectionTitle: section.en, existingText, action,
      customInstr: action === 'custom' ? customInstr : '',
      topic, model,
      onChunk: (c) => { streamRef.current += c; setStreamText(streamRef.current); },
      onDone: () => setState('preview'),
      onError: () => setState('error'),
    });
  };

  const handleApply = () => {
    const parsed = parseMarkdownReport(streamRef.current);
    if (parsed.length > 0) {
      onApply({ blocks: parsed[0].blocks, en: parsed[0].en || section.en });
    }
    setState('idle');
    setStreamText('');
    streamRef.current = '';
  };

  const btnStyle = (dim) => ({
    padding: '3px 9px', fontFamily: t.fontMono, fontSize: 9, letterSpacing: 0.8,
    border: `1px solid ${dim ? t.rule : t.ink}`, background: 'transparent',
    color: dim ? t.mute : t.ink, cursor: dim ? 'default' : 'pointer',
  });

  return (
    <div>
      {/* Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: t.fontMono, fontSize: 8, color: t.mute, letterSpacing: 1, marginRight: 4 }}>AI 精修</span>
        {[['rewrite','重写'],['expand','扩写'],['shrink','精简']].map(([act, label]) => (
          <button key={act} style={btnStyle(state === 'running')}
            disabled={state === 'running'}
            onClick={() => run(act)}>{label}</button>
        ))}
        <button style={btnStyle(state === 'running')} disabled={state === 'running'}
          onClick={() => setShowCustom(v => !v)}>自定义</button>
        {state === 'running' && <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.accent }}>生成中…</span>}
        {state === 'error' && <span style={{ fontFamily: t.fontMono, fontSize: 9, color: '#e5251d' }}>✕ 生成失败</span>}
      </div>

      {/* Custom instruction input */}
      {showCustom && state !== 'running' && (
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <input value={customInstr} onChange={e => setCustomInstr(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && customInstr.trim() && run('custom')}
            placeholder="输入修改要求，如：换成更适合投资人的视角"
            style={{ flex: 1, padding: '5px 8px', border: `1px solid ${t.rule}`, fontFamily: t.fontCN, fontSize: 12, color: t.ink, background: t.paper, outline: 'none' }}/>
          <button onClick={() => customInstr.trim() && run('custom')} disabled={!customInstr.trim()}
            style={{ ...btnStyle(!customInstr.trim()), background: customInstr.trim() ? t.ink : 'transparent', color: customInstr.trim() ? t.paper : t.mute }}>
            执行
          </button>
        </div>
      )}

      {/* Preview */}
      {(state === 'running' || state === 'preview') && streamText && (
        <div style={{ marginTop: 12, border: `1px solid ${t.accent}`, padding: '14px 16px', background: 'rgba(200,50,50,0.03)' }}>
          <div style={{ fontFamily: t.fontMono, fontSize: 8, color: t.accent, letterSpacing: 1, marginBottom: 10 }}>
            {state === 'running' ? '▶ 生成中…' : '✓ 生成完成 · 预览'}
          </div>
          <div style={{ fontFamily: t.fontCN, fontSize: 14, lineHeight: 1.8, color: t.ink, whiteSpace: 'pre-wrap', maxHeight: 320, overflowY: 'auto' }}>
            {streamText}
            {state === 'running' && <span style={{ display: 'inline-block', width: 8, height: 14, background: t.accent, marginLeft: 2, animation: 'essay-blink 1s steps(2) infinite', verticalAlign: 'middle' }}/>}
          </div>
          {state === 'preview' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={handleApply} style={{ padding: '6px 16px', fontFamily: t.fontMono, fontSize: 9, letterSpacing: 0.8, border: `1px solid ${t.ink}`, background: t.ink, color: t.paper, cursor: 'pointer' }}>
                ✓ 采用
              </button>
              <button onClick={() => { setState('idle'); setStreamText(''); streamRef.current = ''; }}
                style={{ padding: '6px 12px', fontFamily: t.fontMono, fontSize: 9, letterSpacing: 0.8, border: `1px solid ${t.rule}`, background: 'transparent', color: t.mute, cursor: 'pointer' }}>
                放弃
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Report({ t, onExport, marginaliaOn = true, density = 'editorial', reportData, isFavorited, onToggleFavorite, onRerun, onFollowUp, onUpdate, toolbarStore, onSaveReport, rating, onRate, modelStore, onShareToTeam }) {
  const { can } = usePermission();
  const canExport = can('export');
  const [badReasons, setBadReasons] = React.useState(false);
  const [savedReason, setSavedReason] = React.useState('');
  const [activeSec, setActiveSec] = React.useState('s1');
  const containerRef = React.useRef(null);
  const [editMode, setEditMode] = React.useState(false);
  const [edits, setEdits] = React.useState({});
  const [warnDismissed, setWarnDismissed] = React.useState(false);
  const [localSections, setLocalSections] = React.useState(null); // null = use reportData
  const [hoveredSec, setHoveredSec] = React.useState(null);
  const [refineOpen, setRefineOpen] = React.useState(null); // section id

  const getEdit = (key, fallback) => edits[key] !== undefined ? edits[key] : fallback;
  const setEdit = (key, val) => setEdits(prev => ({ ...prev, [key]: val }));

  const handleSaveEdits = () => {
    if (!reportData) return;
    const d = JSON.parse(JSON.stringify(reportData));
    for (const [key, val] of Object.entries(edits)) {
      const p = key.split('.');
      if (p[0] === 'meta') { d.meta[p[1]] = val; }
      else if (p[0].startsWith('s')) {
        const si = +p[0].slice(1);
        if (p[1] === 'title') d.sections[si].en = val;
        else if (p[1].startsWith('b')) { const bi = +p[1].slice(1); d.sections[si].blocks[bi].text = val; }
      }
    }
    if (onSaveReport) onSaveReport(d);
    setEditMode(false);
    setEdits({});
  };
  const handleCancelEdits = () => { setEditMode(false); setEdits({}); };

  // Data: use reportData prop if provided, else fall back to static constants
  const isStatic     = !reportData;
  const rMeta        = reportData?.meta     || REPORT_META;
  const rMetrics     = reportData?.metrics  || REPORT_METRICS;
  const rSections    = (localSections || reportData?.sections)?.length > 0 ? (localSections || reportData?.sections) : REPORT_SECTIONS;

  const handleSectionApply = (sectionId, { blocks, en }) => {
    const base = localSections || reportData?.sections || [];
    const updated = base.map(s => s.id === sectionId ? { ...s, blocks, en } : s);
    setLocalSections(updated);
    setRefineOpen(null);
    if (onSaveReport && reportData) onSaveReport({ ...reportData, sections: updated });
  };
  const rRefs        = reportData?.refs     || REPORT_REFS;
  const rAttachments = reportData?.attachments || [];

  // Teaser: first lede block sentence from first section
  const teaser = React.useMemo(() => {
    const lede = rSections?.[0]?.blocks?.find(b => b.kind === 'lede');
    if (!lede?.text) return null;
    const raw = lede.text.replace(/\*\*/g, '').trim();
    const sentence = raw.match(/^[^。！？.!?]{6,}[。！？.!?]/)?.[0];
    return sentence || (raw.length > 90 ? raw.slice(0, 90) + '…' : raw);
  }, [rSections]);

  // Metrics: use stored for static; derive from meta for AI reports
  const metricsArr = rMetrics.length > 0 ? rMetrics : [
    { value: rMeta.words  || '—', en: 'WORDS',  cn: '字数',  accent: false },
    { value: String(rMeta.sources || '—'), en: 'REFS', cn: '引用', accent: false },
    { value: rMeta.reading || '—', en: 'READ',  cn: '阅读',  accent: false },
    { value: rMeta.tokens  ? rMeta.tokens.toLocaleString() : '—', en: 'TOKENS', cn: 'Tokens', accent: rMeta.tokens > 0 },
  ];

  // Scroll-spy
  React.useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const handler = () => {
      const headings = rSections.map(s => ({ id: s.id, el: root.querySelector(`[data-sec="${s.id}"]`) }));
      const top = root.scrollTop + 120;
      let current = headings[0]?.id;
      for (const h of headings) { if (h.el && h.el.offsetTop <= top) current = h.id; }
      setActiveSec(current);
    };
    root.addEventListener('scroll', handler);
    return () => root.removeEventListener('scroll', handler);
  }, [rSections]);

  const editorial = density === 'editorial';
  const bodyCols = editorial
    ? (marginaliaOn ? '180px 1fr 600px 220px 1fr' : '180px 1fr 720px 1fr')
    : (marginaliaOn ? '160px 1fr 540px 200px 1fr' : '160px 1fr 660px 1fr');

  const scrollTo = (id) => {
    const el = containerRef.current?.querySelector(`[data-sec="${id}"]`);
    if (el) containerRef.current.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };

  return (
    <div style={{ flex: 1, background: t.paper, color: t.ink, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', position: 'relative' }}>
      {/* Report header bar */}
      <div style={{ padding: '12px 36px', borderBottom: `1px solid ${t.rule}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, background: t.paper }}>
        <Tag t={t} accent>◆ {rMeta.issue || REPORT_META.issue} · DONE</Tag>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>
          {rMeta.words} 字 · {rMeta.sources} 来源 · {rMeta.reading} 阅读
          {rMeta.tokens > 0 && <span style={{ marginLeft: 8, color: t.accent }}>· {rMeta.tokens.toLocaleString()} tokens</span>}
        </span>
        <span style={{ flex: 1 }}/>
        <Btn t={t} size="sm" onClick={onRerun || undefined} style={!onRerun ? { opacity: 0.4 } : {}}>▸ 重跑</Btn>
        {!isStatic && onUpdate && <Btn t={t} size="sm" onClick={onUpdate}>↻ 基于此更新</Btn>}
        <Btn t={t} size="sm" onClick={onToggleFavorite || undefined}
          style={isFavorited ? { background: '#c8a84b', borderColor: '#c8a84b', color: '#fff' } : (!onToggleFavorite ? { opacity: 0.4 } : {})}>
          {isFavorited ? '★ 已收藏' : '☆ 收藏'}
        </Btn>
        {onRate && (
          <React.Fragment>
            <Btn t={t} size="sm" onClick={() => onRate('good')}
              style={rating === 'good' ? { background: '#2a8c5c', borderColor: '#2a8c5c', color: '#fff' } : {}}>
              + 好
            </Btn>
            <Btn t={t} size="sm" onClick={() => { onRate('bad'); setBadReasons(v => !v); }}
              style={rating === 'bad' ? { background: '#b04040', borderColor: '#b04040', color: '#fff' } : {}}>
              - 差
            </Btn>
          </React.Fragment>
        )}
        {!isStatic && !editMode && (
          <Btn t={t} size="sm" onClick={() => setEditMode(true)}>✎ 编辑</Btn>
        )}
        {editMode && <>
          <Btn t={t} size="sm" onClick={handleSaveEdits} primary accent>✓ 保存</Btn>
          <Btn t={t} size="sm" onClick={handleCancelEdits}>✕ 取消</Btn>
        </>}
        {!isStatic && onShareToTeam && (
          <Btn t={t} size="sm" onClick={onShareToTeam}>⊕ 分享到团队</Btn>
        )}
      </div>

      {/* Bad-rating reasons → feed into Memory avoid-list (closes the V→M loop) */}
      {badReasons && (
        <div style={{ padding: '8px 36px', borderBottom: `1px solid ${t.rule}`, background: t.faint, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 0.5 }}>哪里不满意？(记入「避免项」，下次自动规避)</span>
          {['内容太浅', '结构混乱', '数据不足', '语气不符', '不够具体', '过度营销'].map(r => (
            <button key={r} onClick={() => { addProfileAvoid(r); setSavedReason(r); setTimeout(() => { setSavedReason(''); setBadReasons(false); }, 1200); }}
              style={{ fontFamily: t.fontCN, fontSize: 11, color: t.ink, padding: '3px 10px', border: `1px solid ${t.rule}`, background: t.paper, cursor: 'pointer' }}>{r}</button>
          ))}
          {savedReason && <span style={{ fontFamily: t.fontMono, fontSize: 10, color: '#2a8c5c' }}>✓ 已记入：{savedReason}</span>}
        </div>
      )}

      {/* Validation warning banner */}
      {!warnDismissed && reportData?.meta?.warnings?.length > 0 && (
        <div style={{ padding: '7px 36px', borderBottom: `1px solid rgba(200,140,40,0.35)`, background: 'rgba(200,140,40,0.07)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontFamily: t.fontMono, fontSize: 10, color: '#b07a20', flexShrink: 0 }}>⚠</span>
          <span style={{ fontFamily: t.fontCN, fontSize: 11, color: '#7a5510', flex: 1, lineHeight: 1.5 }}>
            {reportData.meta.warnings.join(' · ')}
          </span>
          <button type="button" onClick={onRerun || undefined} style={{ border: `1px solid rgba(200,140,40,0.5)`, background: 'transparent', cursor: onRerun ? 'pointer' : 'default', color: '#b07a20', fontFamily: t.fontMono, fontSize: 8, padding: '3px 8px', letterSpacing: 0.8, opacity: onRerun ? 1 : 0.4, flexShrink: 0 }}>重新生成</button>
          <button type="button" onClick={() => setWarnDismissed(true)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#b07a20', fontFamily: t.fontMono, fontSize: 13, padding: '0 2px', lineHeight: 1, flexShrink: 0 }}>×</button>
        </div>
      )}

      {/* Scrollable body */}
      <div ref={containerRef} style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'grid', gridTemplateColumns: bodyCols }}>
        {/* Left rail: section index */}
        <aside style={{ padding: '32px 16px 40px 28px', position: 'sticky', top: 0, alignSelf: 'start', maxHeight: '100vh', overflowY: 'auto' }}>
          {/* Cover back-to-top */}
          <button type="button" onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} style={{
            display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '8px 0 12px 10px', marginBottom: 6,
            borderBottom: `1px solid ${t.rule}`,
          }}>
            <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.4 }}>CONTENTS · 目录</span>
          </button>

          {/* Cover entry */}
          <button type="button" onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} style={{
            display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '7px 0 7px 10px',
            borderLeft: activeSec === 's1' ? `3px solid transparent` : `3px solid transparent`,
          }}>
            <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1 }}>00 · COVER</span>
          </button>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {rSections.map(s => {
              const cnMatch = s.en.match(/^([一二三四五六七八九十]+[、．])\s*/);
              const prefix = cnMatch?.[1] || '';
              const label = prefix ? s.en.slice(cnMatch[0].length) : s.en;
              return (
              <button key={s.id} type="button" onClick={() => scrollTo(s.id)} style={{
                display: 'block', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '7px 0 7px 10px',
                borderLeft: activeSec === s.id ? `3px solid ${t.accent}` : `3px solid transparent`,
                fontFamily: t.fontBody, color: t.ink,
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  {prefix
                    ? <span style={{ fontFamily: t.fontCN, fontWeight: 800, fontSize: 12, color: activeSec === s.id ? t.accent : t.mute }}>{prefix}</span>
                    : <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 0.5 }}>{s.num} ·</span>
                  }
                  <span style={{ fontFamily: t.fontCN, fontWeight: 700, fontSize: 11, color: activeSec === s.id ? t.ink : t.inkSoft, lineHeight: 1.4 }}>{label}</span>
                </div>
              </button>
              );
            })}
          </div>

          {/* Tone / model badge */}
          {!isStatic && rMeta.tone && (
            <div style={{ marginTop: 20, padding: '8px 10px', border: `1px solid ${t.rule}`, background: t.faint }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 8, color: t.mute, letterSpacing: 1.2, marginBottom: 4 }}>STYLE</div>
              <div style={{ fontFamily: t.fontCN, fontSize: 11, color: t.inkSoft }}>{rMeta.tone}</div>
            </div>
          )}
        </aside>

        {/* Outer gutter */}
        <div/>

        {/* Center body */}
        <article style={{ padding: '32px 0 80px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* ═══════════════ COVER ═══════════════ */}
          <header style={{ display: 'flex', flexDirection: 'column', paddingBottom: 0, marginBottom: 8 }}>

            {/* Cover plate visual */}
            <ReportCoverPlate t={t}
              title={rMeta.titleEn || rMeta.title?.en || rMeta.subtitle || ''}
              category={rMeta.category || ''}
              isStatic={isStatic}
              editorial={editorial}/>

            {/* Row 1 · category / date / byline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottom: `1px solid ${t.rule}`, marginBottom: 22 }}>
              <Tag t={t} accent>◆ {rMeta.category || REPORT_META.category}</Tag>
              <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 0.8 }}>
                {rMeta.date || REPORT_META.date}
              </span>
              <span style={{ flex: 1 }}/>
              {!isStatic && rMeta.model && (
                <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 0.5 }}>
                  ◈ {rMeta.model}
                </span>
              )}
              <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 1.2, fontWeight: 700 }}>ATLAS</span>
            </div>

            {/* Row 2 · issue badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 4, height: 32, background: t.accent, flexShrink: 0 }}/>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.accent, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 700 }}>
                  {isStatic ? `ISSUE ${rMeta.issue || '№ 241'}` : 'AI · GENERATED'}
                </span>
                <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1 }}>
                  {[rMeta.reading && `${rMeta.reading} READ`, rMeta.words && `${rMeta.words} 字`].filter(Boolean).join('  ·  ')}
                </span>
              </div>
            </div>

            {/* Row 3 · Main headline */}
            {isStatic ? (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontFamily: t.fontDisplay, fontWeight: 900, fontSize: editorial ? 68 : 54, lineHeight: 0.92, letterSpacing: -2.5, color: t.ink }}>
                  Cold brew,<br/>
                  <span style={{ fontFamily: t.fontSerif, fontStyle: 'italic', fontWeight: 500, color: t.accent }}>hotter</span> capital.
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: t.fontCN, fontWeight: 900, fontSize: editorial ? 52 : 40, lineHeight: 1.05, letterSpacing: -1, color: t.ink }}>
                  {(rMeta.subtitle || rMeta.title?.cn || rMeta.titleEn || rMeta.title?.en || '').slice(0, 60)}
                </div>
              </div>
            )}

            {/* Row 4 · Subtitle / Chinese secondary title */}
            {isStatic ? (
              <div style={{ fontFamily: t.fontCN, fontWeight: 700, fontSize: editorial ? 18 : 15, lineHeight: 1.5, color: t.inkSoft, marginBottom: 24 }}>
                2025 Q1 国内咖啡赛道融资速记——从 Manner 的新一轮，到下沉市场的快速展店。
              </div>
            ) : (
              (rMeta.titleEn || rMeta.title?.en) && (
                <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: editorial ? 16 : 14, lineHeight: 1.5, color: t.mute, marginBottom: 22, letterSpacing: 0.5 }}>
                  {(rMeta.titleEn || rMeta.title?.en || '').slice(0, 80)}
                </div>
              )
            )}

            {/* Row 5 · Teaser lede (italic pullout) */}
            {teaser && (
              <div style={{
                fontFamily: t.fontSerif, fontStyle: 'italic',
                fontSize: editorial ? 16 : 14, lineHeight: 1.8,
                color: t.ink,
                borderLeft: `3px solid ${t.accent}`, paddingLeft: 18,
                marginBottom: 28,
              }}>
                {teaser}
              </div>
            )}

            {/* Row 6 · Metrics bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${metricsArr.length}, 1fr)`,
              borderTop: `2px solid ${t.ink}`, borderBottom: `1px solid ${t.rule}`,
              paddingTop: 16, paddingBottom: 16,
            }}>
              {metricsArr.map((m, i) => (
                <div key={m.en} style={{ paddingLeft: i === 0 ? 0 : 18, borderLeft: i === 0 ? 'none' : `1px solid ${t.rule}` }}>
                  <Metric {...m} t={t}/>
                </div>
              ))}
            </div>
          </header>
          {/* ════════════════════════════════════ */}

          {editMode && (
            <div style={{ padding: '6px 12px', background: 'rgba(255,215,0,0.12)', border: `1px dashed ${t.accent}`, fontFamily: t.fontMono, fontSize: 10, color: t.accent, letterSpacing: 1 }}>
              ✎ 编辑模式 — 点击文字框修改内容，完成后点击「保存」
            </div>
          )}
          {rSections.map((s, sIdx) => {
            const titleKey = `s${sIdx}.title`;
            const rawTitle = getEdit(titleKey, s.en);
            const cnNumMatch = rawTitle.match(/^([一二三四五六七八九十]+[、．])\s*/);
            const cnNumPrefix = cnNumMatch?.[1] || '';
            const sectionTitle = cnNumPrefix ? rawTitle.slice(cnNumMatch[0].length) : rawTitle;
            return (
            <section key={s.id} data-sec={s.id}
              onMouseEnter={() => setHoveredSec(s.id)}
              onMouseLeave={() => setHoveredSec(null)}
              style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 28, scrollMarginTop: 80 }}>
              <div style={{ borderTop: `2px solid ${t.ink}`, paddingTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  {cnNumPrefix ? (
                    <span style={{ fontFamily: t.fontCN, fontWeight: 900, fontSize: 22, color: t.accent, letterSpacing: 0 }}>{cnNumPrefix}</span>
                  ) : (
                    <span style={{ fontFamily: t.fontMono, fontSize: 11, color: t.accent, letterSpacing: 0.5 }}>§ {s.num}</span>
                  )}
                  {editMode
                    ? <input type="text" value={sectionTitle} onChange={e => setEdit(titleKey, cnNumPrefix + e.target.value)}
                        style={{ fontFamily: t.fontCN, fontWeight: 800, fontSize: editorial ? 18 : 16, color: t.ink, border: '1.5px dashed currentColor', background: 'rgba(255,215,0,0.07)', padding: '2px 6px', outline: 'none', flex: 1 }}/>
                    : <span style={{ fontFamily: t.fontCN, fontWeight: 800, fontSize: editorial ? 18 : 16, letterSpacing: 0.5, color: t.ink }}>{sectionTitle}</span>
                  }
                  {s.cn && !editMode && <span style={{ fontFamily: t.fontCN, fontSize: 14, fontWeight: 500, color: t.mute }}>· {s.cn}</span>}
                  {!editMode && !isStatic && modelStore?.selected && (hoveredSec === s.id || refineOpen === s.id) && (
                    <button onClick={() => setRefineOpen(v => v === s.id ? null : s.id)}
                      style={{ marginLeft: 'auto', padding: '2px 9px', fontFamily: t.fontMono, fontSize: 8, letterSpacing: 1, border: `1px solid ${refineOpen === s.id ? t.ink : t.rule}`, background: refineOpen === s.id ? t.ink : 'transparent', color: refineOpen === s.id ? t.paper : t.mute, cursor: 'pointer' }}>
                      ✦ 精修
                    </button>
                  )}
                </div>
                {refineOpen === s.id && !editMode && modelStore?.selected && (
                  <SectionRefineBar t={t} section={s}
                    topic={reportData?.prompt || reportData?.meta?.titleEn || ''}
                    model={modelStore.selected}
                    onApply={(update) => handleSectionApply(s.id, update)}/>
                )}
              </div>
              <div style={{ fontFamily: t.fontCN, fontSize: editorial ? 16 : 15, lineHeight: 1.85, color: t.inkSoft, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {s.blocks.map((b, bIdx) => {
                  const bKey = `s${sIdx}.b${bIdx}`;
                  const blockWithEdits = editMode ? { ...b, text: getEdit(bKey, b.text) } : b;
                  return <ReportBlock key={bIdx} block={blockWithEdits} t={t}
                    editMode={editMode} onChange={v => setEdit(bKey, v)}/>;
                })}
              </div>
            </section>
            );
          })}

          {/* Follow-up composer */}
          <FollowUpComposer t={t} reportData={reportData} rSections={rSections} onFollowUp={onFollowUp} toolbarStore={toolbarStore}/>
          {rAttachments.length > 0 && (
            <div style={{ marginTop: 48, borderTop: `2px solid ${t.ink}`, paddingTop: 28 }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.6, marginBottom: 20 }}>
                APPENDIX · 附件 ({rAttachments.length})
              </div>
              {rAttachments.map((att) => {
                const csvData = parseCSV(att.content);
                const isText = typeof att.content === 'string' && att.content !== '[binary]';
                return (
                  <div key={att.id} style={{ marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span style={{ color: t.accent }}>📎</span>
                      <span style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 13 }}>{att.name}</span>
                      <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, padding: '2px 6px', border: `1px solid ${t.rule}` }}>
                        {att.content === '[binary]' ? 'BINARY' : csvData ? 'CSV' : 'TEXT'} · {(att.size/1024).toFixed(1)} KB
                      </span>
                    </div>
                    {csvData ? (
                      <div style={{ overflowX: 'auto', border: `1px solid ${t.rule}` }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.fontCN, fontSize: 12 }}>
                          <thead><tr>
                            {csvData.headers.map((h,j) => <th key={j} style={{ padding: '6px 10px', borderBottom: `1.5px solid ${t.ink}`, background: t.faint, fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 10, textAlign: 'left' }}>{h}</th>)}
                          </tr></thead>
                          <tbody>
                            {csvData.rows.slice(0,100).map((row,j) => (
                              <tr key={j} style={{ background: j%2===0 ? t.paper : t.faint }}>
                                {row.map((cell,k) => <td key={k} style={{ padding: '4px 10px', borderBottom: `1px solid ${t.rule}`, color: t.inkSoft }}>{cell}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : isText ? (
                      <pre style={{ fontFamily: t.fontMono, fontSize: 11, color: t.inkSoft, background: t.faint, padding: '12px 14px', borderLeft: `3px solid ${t.accent}`, overflow: 'auto', maxHeight: 280, whiteSpace: 'pre-wrap', margin: 0 }}>
                        {att.content.slice(0,2000)}{att.content.length > 2000 ? '\n…截断' : ''}
                      </pre>
                    ) : (
                      <div style={{ padding: '10px 14px', background: t.faint, fontFamily: t.fontMono, fontSize: 11, color: t.mute }}>[二进制文件]</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </article>

        {/* Right rail: references */}
        {marginaliaOn && (
          <aside style={{ padding: '32px 0 32px 24px', borderLeft: `1px dashed ${t.rule}` }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.4, marginBottom: 14 }}>
              REFERENCES · 引用 ({rRefs.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {rRefs.map((r, i) => (
                <div key={r.n} style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 12, borderBottom: `1px dashed ${t.rule}` }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                    <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.accent, fontWeight: 700 }}>{r.n}</span>
                    <span style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' }}>{r.src}</span>
                  </div>
                  <span style={{ fontFamily: t.fontCN, fontSize: 12, color: t.inkSoft, lineHeight: 1.45, marginLeft: 24 }}>{r.title}</span>
                  <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginLeft: 24 }}>{r.url} · {r.date}</span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 18, padding: 12, border: `1.5px solid ${t.ink}`, background: t.cardOn,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.4 }}>SHARE · 分享</span>
              {canExport
                ? <Btn t={t} size="sm" onClick={onExport} primary accent>↗ 导出 / 分享</Btn>
                : <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>只读成员 · 无导出权限</span>}
              <CopyLinkBtn t={t} reportData={reportData}/>
            </div>
          </aside>
        )}
        <div/>
      </div>
      {/* Floating export fallback when right-rail (marginalia) is hidden */}
      {!marginaliaOn && canExport && (
        <button type="button" onClick={onExport} style={{
          position: 'absolute', right: 24, bottom: 24, zIndex: 20,
          padding: '9px 16px', border: `1.5px solid ${t.ink}`, background: t.accent, color: '#fff',
          fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1, cursor: 'pointer',
          boxShadow: `2px 2px 0 ${t.ink}`,
        }}>↗ 导出 / 分享</button>
      )}
    </div>
  );
}

// ── Chart system ─────────────────────────────────────────────────────────

const CHART_PALETTE = ['#e5251d','#1d4ed8','#1f6f44','#c2540a','#7c3aed','#0891b2','#b45309','#be185d'];

function ChartShell({ t, data, children }) {
  return (
    <div style={{ margin: '6px 0', padding: '16px 20px', border: `1.5px solid ${t.ink}`, background: t.cardOn }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
        <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.accent, letterSpacing: 1.2 }}>▪ {(data.type || 'CHART').toUpperCase()}</span>
        {data.title && <span style={{ fontFamily: t.fontCN, fontWeight: 700, fontSize: 12, color: t.ink }}>{data.title}</span>}
        {data.unit && <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>（{data.unit}）</span>}
      </div>
      {children}
      {data.source && (
        <div style={{ marginTop: 8, fontFamily: t.fontMono, fontSize: 8, color: t.mute, textAlign: 'right' }}>
          Source · {data.source}
        </div>
      )}
    </div>
  );
}

// Horizontal bar chart
function BarChartH({ t, data }) {
  const items = data.data || [];
  const maxVal = Math.max(...items.map(d => d.value), 0.001);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {items.map((item, i) => {
        const pct = (item.value / maxVal) * 100;
        const color = CHART_PALETTE[i % CHART_PALETTE.length];
        return (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 64px', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: t.fontCN, fontSize: 11, color: t.inkSoft, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
            <div style={{ height: 18, background: t.faint, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: color, transition: 'width 0.5s ease' }}/>
              {pct > 22 && <span style={{ position: 'absolute', right: `${100 - pct + 2}%`, top: '50%', transform: 'translateY(-50%)', fontFamily: t.fontMono, fontSize: 8, color: '#fff', whiteSpace: 'nowrap' }}>{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}</span>}
            </div>
            <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.ink, fontWeight: 700, textAlign: 'right' }}>
              {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}{data.unit ? ` ${data.unit}` : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Vertical column chart
function ColumnChart({ t, data }) {
  const items = data.data || [];
  if (!items.length) return null;
  const maxVal = Math.max(...items.map(d => d.value), 0.001);
  const VW = 500, VH = 210, pL = 44, pR = 16, pT = 20, pB = 48;
  const cW = VW - pL - pR, cH = VH - pT - pB;
  const n = items.length;
  const slotW = cW / n;
  const barW = Math.min(slotW * 0.62, 52);
  const gridVals = [0.25, 0.5, 0.75, 1].map(f => ({ y: pT + cH * (1 - f), v: Math.round(maxVal * f) }));
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: 'block' }}>
      {gridVals.map(({ y, v }) => (
        <g key={y}>
          <line x1={pL} y1={y} x2={VW - pR} y2={y} stroke={t.rule} strokeWidth={0.5}/>
          <text x={pL - 4} y={y + 3.5} textAnchor="end" fill={t.mute} fontSize={8} fontFamily="IBM Plex Mono,monospace">{v.toLocaleString()}</text>
        </g>
      ))}
      {items.map((item, i) => {
        const bh = (item.value / maxVal) * cH;
        const x = pL + i * slotW + (slotW - barW) / 2;
        const y = pT + cH - bh;
        const color = CHART_PALETTE[i % CHART_PALETTE.length];
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} fill={color} opacity={0.88}/>
            {bh > 14 && <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill={t.ink} fontSize={8} fontFamily="IBM Plex Mono,monospace" fontWeight={700}>{item.value.toLocaleString()}</text>}
            <text x={x + barW / 2} y={pT + cH + 14} textAnchor="middle" fill={t.inkSoft} fontSize={9} fontFamily={t.fontCN}>{item.label.length > 6 ? item.label.slice(0, 5) + '…' : item.label}</text>
          </g>
        );
      })}
      <line x1={pL} y1={pT + cH} x2={VW - pR} y2={pT + cH} stroke={t.ink} strokeWidth={1}/>
      <line x1={pL} y1={pT} x2={pL} y2={pT + cH} stroke={t.ink} strokeWidth={0.5}/>
    </svg>
  );
}

// Line chart
function LineChart({ t, data }) {
  const items = data.data || [];
  if (items.length < 2) return null;
  const maxVal = Math.max(...items.map(d => d.value), 0.001);
  const VW = 500, VH = 210, pL = 44, pR = 16, pT = 20, pB = 48;
  const cW = VW - pL - pR, cH = VH - pT - pB;
  const n = items.length;
  const pts = items.map((item, i) => ({
    x: pL + (i / (n - 1)) * cW,
    y: pT + cH - (item.value / maxVal) * cH,
    label: item.label, value: item.value,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L${pts[pts.length - 1].x.toFixed(1)},${(pT + cH).toFixed(1)} L${pts[0].x.toFixed(1)},${(pT + cH).toFixed(1)} Z`;
  const uid = `lc_${Math.random().toString(36).slice(2, 7)}`;
  const gridVals = [0.25, 0.5, 0.75, 1].map(f => ({ y: pT + cH * (1 - f), v: Math.round(maxVal * f) }));
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.accent} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={t.accent} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {gridVals.map(({ y, v }) => (
        <g key={y}>
          <line x1={pL} y1={y} x2={VW - pR} y2={y} stroke={t.rule} strokeWidth={0.5} strokeDasharray="3,3"/>
          <text x={pL - 4} y={y + 3.5} textAnchor="end" fill={t.mute} fontSize={8} fontFamily="IBM Plex Mono,monospace">{v.toLocaleString()}</text>
        </g>
      ))}
      <path d={areaD} fill={`url(#${uid})`}/>
      <path d={pathD} fill="none" stroke={t.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3.5} fill={t.accent} stroke={t.paper} strokeWidth={1.5}/>
          <text x={p.x} y={p.y - 8} textAnchor="middle" fill={t.ink} fontSize={8} fontFamily="IBM Plex Mono,monospace" fontWeight={700}>{p.value.toLocaleString()}</text>
          <text x={p.x} y={pT + cH + 14} textAnchor="middle" fill={t.inkSoft} fontSize={9} fontFamily={t.fontCN}>{p.label.length > 5 ? p.label.slice(0, 5) + '…' : p.label}</text>
        </g>
      ))}
      <line x1={pL} y1={pT + cH} x2={VW - pR} y2={pT + cH} stroke={t.ink} strokeWidth={1}/>
      <line x1={pL} y1={pT} x2={pL} y2={pT + cH} stroke={t.ink} strokeWidth={0.5}/>
    </svg>
  );
}

// Donut chart
function DonutChart({ t, data }) {
  const items = data.data || [];
  if (!items.length) return null;
  const total = items.reduce((s, d) => s + d.value, 0) || 1;
  const VW = 460, VH = 200, cx = 105, cy = 100, R = 80, r = 50;
  let angle = -Math.PI / 2;
  const segs = items.map((item, i) => {
    const sweep = (item.value / total) * 2 * Math.PI;
    const sa = angle, ea = angle + sweep;
    angle = ea;
    const large = sweep > Math.PI ? 1 : 0;
    const cos1 = Math.cos(sa), sin1 = Math.sin(sa), cos2 = Math.cos(ea), sin2 = Math.sin(ea);
    const path = `M${(cx + R * cos1).toFixed(2)},${(cy + R * sin1).toFixed(2)} A${R},${R},0,${large},1,${(cx + R * cos2).toFixed(2)},${(cy + R * sin2).toFixed(2)} L${(cx + r * cos2).toFixed(2)},${(cy + r * sin2).toFixed(2)} A${r},${r},0,${large},0,${(cx + r * cos1).toFixed(2)},${(cy + r * sin1).toFixed(2)} Z`;
    return { path, color: CHART_PALETTE[i % CHART_PALETTE.length], label: item.label, value: item.value, pct: Math.round((item.value / total) * 100) };
  });
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: 'block' }}>
      {segs.map((seg, i) => <path key={i} d={seg.path} fill={seg.color} opacity={0.9}/>)}
      <text x={cx} y={cy - 7} textAnchor="middle" fill={t.ink} fontSize={16} fontFamily="IBM Plex Mono,monospace" fontWeight={700}>{total.toLocaleString()}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill={t.mute} fontSize={8} fontFamily="IBM Plex Mono,monospace">{data.unit || 'TOTAL'}</text>
      {segs.map((seg, i) => (
        <g key={i} transform={`translate(225,${10 + i * 23})`}>
          <rect x={0} y={0} width={10} height={10} fill={seg.color} rx={2}/>
          <text x={15} y={9} fill={t.inkSoft} fontSize={10} fontFamily={t.fontCN}>{seg.label}</text>
          <text x={220} y={9} textAnchor="end" fill={t.ink} fontSize={9} fontFamily="IBM Plex Mono,monospace" fontWeight={700}>{seg.pct}%</text>
        </g>
      ))}
    </svg>
  );
}

// Scatter plot
function ScatterChart({ t, data }) {
  const items = data.data || [];
  if (!items.length) return null;
  const xs = items.map(d => d.x ?? 0), ys = items.map(d => d.y ?? 0);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const rX = maxX - minX || 1, rY = maxY - minY || 1;
  const VW = 500, VH = 230, pL = 52, pR = 20, pT = 20, pB = 52;
  const cW = VW - pL - pR, cH = VH - pT - pB;
  const toX = v => pL + ((v - minX) / rX) * cW;
  const toY = v => pT + cH - ((v - minY) / rY) * cH;
  const gridFs = [0, 0.25, 0.5, 0.75, 1];
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: 'block' }}>
      {gridFs.map(f => (
        <g key={f}>
          <line x1={pL} y1={pT + cH * (1 - f)} x2={VW - pR} y2={pT + cH * (1 - f)} stroke={t.rule} strokeWidth={0.5} strokeDasharray="2,3"/>
          <line x1={pL + cW * f} y1={pT} x2={pL + cW * f} y2={pT + cH} stroke={t.rule} strokeWidth={0.5} strokeDasharray="2,3"/>
        </g>
      ))}
      <line x1={pL} y1={pT + cH} x2={VW - pR} y2={pT + cH} stroke={t.ink} strokeWidth={1}/>
      <line x1={pL} y1={pT} x2={pL} y2={pT + cH} stroke={t.ink} strokeWidth={1}/>
      <text x={pL} y={pT + cH + 14} textAnchor="middle" fill={t.mute} fontSize={8} fontFamily="IBM Plex Mono,monospace">{minX.toLocaleString()}</text>
      <text x={VW - pR} y={pT + cH + 14} textAnchor="middle" fill={t.mute} fontSize={8} fontFamily="IBM Plex Mono,monospace">{maxX.toLocaleString()}</text>
      <text x={pL - 4} y={pT} textAnchor="end" fill={t.mute} fontSize={8} fontFamily="IBM Plex Mono,monospace">{maxY.toLocaleString()}</text>
      {data.xUnit && <text x={VW / 2} y={VH - 4} textAnchor="middle" fill={t.mute} fontSize={8} fontFamily="IBM Plex Mono,monospace">{data.xUnit}</text>}
      {data.yUnit && <text x={10} y={pT + cH / 2} textAnchor="middle" fill={t.mute} fontSize={8} fontFamily="IBM Plex Mono,monospace" transform={`rotate(-90,10,${pT + cH / 2})`}>{data.yUnit}</text>}
      {items.map((item, i) => {
        const px = toX(item.x ?? 0), py = toY(item.y ?? 0);
        const color = CHART_PALETTE[i % CHART_PALETTE.length];
        return (
          <g key={i}>
            <circle cx={px.toFixed(2)} cy={py.toFixed(2)} r={5} fill={color} opacity={0.85} stroke={t.paper} strokeWidth={1.5}/>
            {item.label && <text x={px.toFixed(2)} y={(py - 9).toFixed(2)} textAnchor="middle" fill={t.inkSoft} fontSize={8} fontFamily={t.fontCN}>{item.label}</text>}
          </g>
        );
      })}
    </svg>
  );
}

// Radar chart
function RadarChart({ t, data }) {
  const items = data.data || [];
  if (items.length < 3) return null;
  const maxVal = data.maxValue || Math.max(...items.map(d => d.value), 0.001);
  const n = items.length;
  const VW = 360, VH = 300, cx = VW / 2, cy = VH / 2 + 4, R = 108;
  const ang = i => -Math.PI / 2 + (i / n) * 2 * Math.PI;
  const px = (i, r) => cx + r * Math.cos(ang(i));
  const py = (i, r) => cy + r * Math.sin(ang(i));
  const levels = [0.25, 0.5, 0.75, 1];
  const dataPoly = items.map((item, i) => {
    const r = (item.value / maxVal) * R;
    return `${px(i, r).toFixed(2)},${py(i, r).toFixed(2)}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: 'block' }}>
      {levels.map(f => (
        <polygon key={f} points={items.map((_, i) => `${px(i, R * f).toFixed(2)},${py(i, R * f).toFixed(2)}`).join(' ')}
          fill="none" stroke={t.rule} strokeWidth={f === 1 ? 1 : 0.5}/>
      ))}
      {items.map((_, i) => (
        <line key={i} x1={cx} y1={cy} x2={px(i, R).toFixed(2)} y2={py(i, R).toFixed(2)} stroke={t.rule} strokeWidth={0.5}/>
      ))}
      <polygon points={dataPoly} fill={t.accent} fillOpacity={0.12} stroke={t.accent} strokeWidth={2}/>
      {items.map((item, i) => {
        const r = (item.value / maxVal) * R;
        return <circle key={i} cx={px(i, r).toFixed(2)} cy={py(i, r).toFixed(2)} r={3.5} fill={t.accent} stroke={t.paper} strokeWidth={1.5}/>;
      })}
      {items.map((item, i) => {
        const lx = px(i, R + 20), ly = py(i, R + 20);
        const anchor = lx < cx - 10 ? 'end' : lx > cx + 10 ? 'start' : 'middle';
        return (
          <text key={i} x={lx.toFixed(2)} y={ly.toFixed(2)} textAnchor={anchor} dominantBaseline="middle"
            fill={t.inkSoft} fontSize={9} fontFamily={t.fontCN}>{item.label}</text>
        );
      })}
      {items.map((item, i) => {
        const r = (item.value / maxVal) * R;
        return <text key={i} x={px(i, r).toFixed(2)} y={(py(i, r) - 9).toFixed(2)} textAnchor="middle"
          fill={t.ink} fontSize={8} fontFamily="IBM Plex Mono,monospace" fontWeight={700}>{item.value}</text>;
      })}
      {/* Level labels on top axis */}
      {levels.map(f => (
        <text key={f} x={(cx + 3).toFixed(2)} y={(cy - R * f).toFixed(2)} fill={t.mute} fontSize={7} fontFamily="IBM Plex Mono,monospace">{Math.round(maxVal * f)}</text>
      ))}
    </svg>
  );
}

// Combo chart (bar + line)
function ComboChart({ t, data }) {
  const items = data.data || [];
  if (!items.length) return null;
  const barVals = items.map(d => d.bar ?? 0);
  const lineVals = items.map(d => d.line ?? 0);
  const maxBar = Math.max(...barVals, 0.001), maxLine = Math.max(...lineVals, 0.001);
  const VW = 500, VH = 210, pL = 48, pR = 48, pT = 20, pB = 48;
  const cW = VW - pL - pR, cH = VH - pT - pB;
  const n = items.length;
  const slotW = cW / n;
  const barW = Math.min(slotW * 0.5, 44);
  const lx = i => pL + i * slotW + slotW / 2;
  const ly = i => pT + cH - (lineVals[i] / maxLine) * cH;
  const linePath = items.map((_, i) => `${i === 0 ? 'M' : 'L'}${lx(i).toFixed(1)},${ly(i).toFixed(1)}`).join(' ');
  const gridVals = [0.25, 0.5, 0.75, 1].map(f => ({ y: pT + cH * (1 - f), vBar: Math.round(maxBar * f), vLine: +(maxLine * f).toFixed(1) }));
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: 'block' }}>
      {gridVals.map(({ y, vBar, vLine }) => (
        <g key={y}>
          <line x1={pL} y1={y} x2={VW - pR} y2={y} stroke={t.rule} strokeWidth={0.5} strokeDasharray="3,3"/>
          <text x={pL - 4} y={y + 3.5} textAnchor="end" fill={t.mute} fontSize={8} fontFamily="IBM Plex Mono,monospace">{vBar.toLocaleString()}</text>
          <text x={VW - pR + 4} y={y + 3.5} textAnchor="start" fill={t.accent} fontSize={8} fontFamily="IBM Plex Mono,monospace">{vLine}</text>
        </g>
      ))}
      {items.map((item, i) => {
        const bh = (barVals[i] / maxBar) * cH;
        const x = pL + i * slotW + (slotW - barW) / 2;
        return (
          <g key={i}>
            <rect x={x} y={pT + cH - bh} width={barW} height={bh} fill={t.ink} opacity={0.72}/>
            <text x={lx(i)} y={pT + cH + 14} textAnchor="middle" fill={t.inkSoft} fontSize={9} fontFamily={t.fontCN}>{item.label.length > 6 ? item.label.slice(0, 5) + '…' : item.label}</text>
          </g>
        );
      })}
      <path d={linePath} fill="none" stroke={t.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {items.map((_, i) => <circle key={i} cx={lx(i).toFixed(2)} cy={ly(i).toFixed(2)} r={3.5} fill={t.accent} stroke={t.paper} strokeWidth={1.5}/>)}
      <line x1={pL} y1={pT + cH} x2={VW - pR} y2={pT + cH} stroke={t.ink} strokeWidth={1}/>
      <line x1={pL} y1={pT} x2={pL} y2={pT + cH} stroke={t.ink} strokeWidth={0.5}/>
      <line x1={VW - pR} y1={pT} x2={VW - pR} y2={pT + cH} stroke={t.accent} strokeWidth={0.5}/>
      {data.barUnit && <text x={pL} y={pT - 5} textAnchor="start" fill={t.mute} fontSize={7} fontFamily="IBM Plex Mono,monospace">{data.barUnit}</text>}
      {data.lineUnit && <text x={VW - pR} y={pT - 5} textAnchor="end" fill={t.accent} fontSize={7} fontFamily="IBM Plex Mono,monospace">{data.lineUnit}</text>}
    </svg>
  );
}

function DataChart({ t, data }) {
  if (!data) return null;
  const hasData = (data.data?.length ?? 0) > 0;
  if (!hasData) return null;
  let inner;
  switch (data.type) {
    case 'column': inner = <ColumnChart t={t} data={data}/>; break;
    case 'line':   inner = <LineChart   t={t} data={data}/>; break;
    case 'donut':  inner = <DonutChart  t={t} data={data}/>; break;
    case 'scatter':inner = <ScatterChart t={t} data={data}/>; break;
    case 'radar':  inner = <RadarChart  t={t} data={data}/>; break;
    case 'combo':  inner = <ComboChart  t={t} data={data}/>; break;
    default:       inner = <BarChartH   t={t} data={data}/>; break;
  }
  return <ChartShell t={t} data={data}>{inner}</ChartShell>;
}

function EditableText({ editMode, value, onChange, multiline = true, style = {} }) {
  if (!editMode) return null; // caller renders display; this only renders when editing
  const base = {
    width: '100%', boxSizing: 'border-box', background: 'rgba(255,215,0,0.07)',
    border: '1.5px dashed currentColor', outline: 'none', borderRadius: 2,
    padding: '3px 6px', fontFamily: 'inherit', fontSize: 'inherit',
    color: 'inherit', lineHeight: 'inherit', resize: 'vertical', ...style,
  };
  if (multiline) {
    const rows = Math.max(2, Math.ceil((value || '').length / 72));
    return <textarea rows={rows} value={value || ''} onChange={e => onChange(e.target.value)} style={base}/>;
  }
  return <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} style={{ ...base, resize: 'none' }}/>;
}

function ReportBlock({ block, t, editMode, onChange }) {
  if (block.kind === 'chart') return <DataChart t={t} data={block.data}/>;
  if (block.kind === 'figure') return <Figure t={t} type="chart" label={block.label} caption={block.caption} height={240}/>;

  if (block.kind === 'lede') {
    if (editMode) return <EditableText editMode value={block.text} onChange={onChange}
      style={{ fontWeight: 700, fontSize: 19, lineHeight: 1.55 }}/>;
    return <p style={{ margin: 0, fontWeight: 700, fontSize: 19, lineHeight: 1.55, color: t.ink }}>{renderFootnotes(block.text, t)}</p>;
  }
  if (block.kind === 'quote') {
    if (editMode) return <EditableText editMode value={block.text} onChange={onChange} style={{ fontStyle: 'italic' }}/>;
    return <PullQuote t={t} attribution={block.by}>{block.text}</PullQuote>;
  }
  if (editMode) return <EditableText editMode value={block.text} onChange={onChange}/>;
  return <p style={{ margin: 0 }}>{renderFootnotes(block.text, t)}</p>;
}

function renderMd(text, t) {
  if (!text) return null;
  const parts = [];
  const re = /(\*\*[^*\n]+\*\*|§\d+)/g;
  let last = 0, match;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(<React.Fragment key={`t${last}`}>{text.slice(last, match.index)}</React.Fragment>);
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(<strong key={`b${match.index}`}>{token.slice(2,-2)}</strong>);
    } else {
      parts.push(<Sup key={`s${match.index}`} n={token.slice(1)} t={t}/>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(<React.Fragment key="end">{text.slice(last)}</React.Fragment>);
  return parts;
}
// Keep alias for backward compat
const renderFootnotes = renderMd;

function extractRefsFromText(rawText) {
  // Match [REFS]...[/REFS] or [REFS]... to end-of-string (handles truncated output)
  const refsBlock = rawText.match(/\[REFS\]([\s\S]*?)(?:\[\/REFS\]|$)/);
  if (!refsBlock) return [];
  const content = refsBlock[1].trim();
  if (!content) return [];
  // Split on [N] boundaries so single-line and multi-line formats both work
  const parts = content.split(/(?=\[\d+\])/).filter(s => s.trim());
  const refs = [];
  for (const part of parts) {
    const rm = part.trim().match(/^\[(\d+)\]\s*([\s\S]+)/);
    if (!rm) continue;
    const body = rm[2].replace(/\s+/g, ' ').trim();
    const segments = body.split(/\s*—\s*/);
    refs.push({ n: '['+rm[1]+']', src: segments[0]||'来源', title: segments[1]||segments[0]||'参考资料', url: segments[2]||'', date: segments[3]||'' });
  }
  return refs;
}
function extractTitleFromText(rawText) {
  const tm = rawText.match(/^\[TITLE:\s*(.+?)\]/m);
  return tm ? tm[1].trim() : null;
}
// ── Markdown → Report Sections parser ───────────────────────────────────────
function parseMarkdownReport(rawText) {
  if (!rawText?.trim()) return [];
  const NUMS = ['01','02','03','04','05','06','07','08','09','10'];
  const cleanText = rawText
    .replace(/^\[TITLE:[^\]]*\]\s*/m, '')
    .replace(/\[REFS\][\s\S]*?(?:\[\/REFS\]|$)/g, '');

  // Tokenize line by line
  const tokens = [];
  for (const raw of cleanText.split('\n')) {
    const line = raw.trim();
    if (!line) { tokens.push({ type: 'blank' }); continue; }
    // Chart data block: [CHART:{...}]
    const chartMatch = line.match(/^\[CHART:(\{.*\})\]$/);
    if (chartMatch) {
      try {
        const chartData = JSON.parse(chartMatch[1]);
        tokens.push({ type: 'chart', data: chartData });
      } catch { tokens.push({ type: 'text', text: line }); }
      continue;
    }
    // Heading patterns
    if (/^[一二三四五六七八九十]+[、．]/.test(line) ||
        /^#{1,3}\s/.test(line) ||
        (/^\*\*/.test(line) && /\*\*$/.test(line) && /[一二三四五六七八九十]+[、．]|第[一二三四五六七八九十\d]+[节章]/.test(line)) ||
        /^第[一二三四五六七八九十\d]+[节章][·：:\s]/.test(line)) {
      const text = line.replace(/^\*{1,2}|\*{1,2}$/g,'').replace(/^#{1,3}\s*/,'').trim();
      tokens.push({ type: 'heading', text });
    } else if (line.startsWith('> ')) {
      tokens.push({ type: 'quote-line', text: line.slice(2).trim() });
    } else {
      tokens.push({ type: 'text', text: line });
    }
  }

  // Group into sections
  const sections = [];
  let sIdx = 0;
  let currentTitle = null;
  let currentBlocks = [];
  let textBuffer = [];
  let isFirstBlock = true;
  let inQuote = false;
  let quoteLines = [];

  const flushText = () => {
    const txt = textBuffer.join(' ').trim();
    if (txt) { currentBlocks.push({ kind: isFirstBlock ? 'lede' : 'p', text: txt }); isFirstBlock = false; }
    textBuffer = [];
  };
  const flushQuote = () => {
    if (inQuote && quoteLines.length > 0) {
      const qText = quoteLines[0];
      const by = quoteLines.slice(1).join(' ').replace(/^[—\s]+/,'').trim();
      currentBlocks.push({ kind: 'quote', text: qText, by });
      isFirstBlock = false;
      inQuote = false; quoteLines = [];
    }
  };
  const commitSection = () => {
    flushQuote(); flushText();
    if (currentBlocks.length > 0) {
      sIdx++;
      sections.push({ id: `s${sIdx}`, num: NUMS[sIdx-1] || String(sIdx).padStart(2,'0'), en: currentTitle || '正文', cn: '', blocks: currentBlocks });
    }
    currentTitle = null; currentBlocks = []; isFirstBlock = true;
  };

  for (const token of tokens) {
    if (token.type === 'heading') { commitSection(); currentTitle = token.text; }
    else if (token.type === 'blank') { flushQuote(); flushText(); }
    else if (token.type === 'chart') {
      flushQuote(); flushText();
      currentBlocks.push({ kind: 'chart', data: token.data });
      isFirstBlock = false;
    }
    else if (token.type === 'quote-line') {
      flushText();
      if (!inQuote) { inQuote = true; quoteLines = [token.text]; }
      else { const attr = token.text.replace(/^[—\s]+/,''); if (attr) quoteLines.push(attr); }
    }
    else if (token.type === 'text') {
      flushQuote();
      textBuffer.push(token.text);
    }
  }
  commitSection();
  return sections.filter(s => s.blocks.length > 0);
}

Object.assign(window, { Report, REPORT_META, REPORT_SECTIONS, REPORT_REFS });
// Library — magazine-style archive of past reports. Grid of "issues",
// filterable by category. Each card opens the report view.

const LIBRARY_ENTRIES = [
  {
    issue: 241, status: 'NEW',
    title: { en: 'Cold brew, hotter capital.', cn: '2025 Q1 国内咖啡赛道融资速记' },
    category: 'INDUSTRY · 行业研究', tag: 'INDUSTRY',
    date: '5月21日', words: '2,418', reading: '6 min', sources: 9,
    by: 'ATLAS · 04:07–07:42',
    teaser: '钱没少，故事变了——资本退出"高密度精品"叙事，重新拥抱规模与下沉。',
    feature: true,
  },
  {
    issue: 240, status: '',
    title: { en: 'Q1 sales · South China', cn: '华南区 Q1 品类增长复盘' },
    category: 'DATA · 数据分析', tag: 'DATA',
    date: '5月18日', words: '1,524', reading: '4 min', sources: 4,
    by: 'ATLAS · 02:41',
    teaser: '低线城市贡献了 70% 增量，但毛利空间收窄到 8 个百分点。',
  },
  {
    issue: 239, status: '',
    title: { en: 'Notion AI · ChatGPT Teams', cn: 'AI 协作工具竞品拆解' },
    category: 'COMPETITOR · 竞品', tag: 'COMPETITOR',
    date: '5月15日', words: '3,102', reading: '9 min', sources: 14,
    by: 'ATLAS · 11:08',
    teaser: '两家在「知识检索」上的产品差异，比定价策略更值得讨论。',
  },
  {
    issue: 238, status: '',
    title: { en: 'Weekly · Wk20 / 2026', cn: '团队周报 · 第 20 周' },
    category: 'INTERNAL · 内部', tag: 'INTERNAL',
    date: '5月12日', words: '812', reading: '3 min', sources: 2,
    by: 'ATLAS · 01:24',
    teaser: '上线 2 个功能，客户 A 谈判进入第二阶段，HR 系统迁移延期。',
  },
  {
    issue: 237, status: '',
    title: { en: 'Home robotics scan', cn: '家用清洁机器人赛道扫描' },
    category: 'INDUSTRY · 行业研究', tag: 'INDUSTRY',
    date: '5月09日', words: '2,710', reading: '7 min', sources: 11,
    by: 'ATLAS · 08:55',
    teaser: '价格带正在被 1,500-2,500 元这一段重新定义。',
  },
  {
    issue: 236, status: '',
    title: { en: 'Remote work · rent', cn: '远程办公对一线城市租房市场影响' },
    category: 'SOCIETY · 社会观察', tag: 'STRATEGY',
    date: '5月05日', words: '2,194', reading: '5 min', sources: 8,
    by: 'ATLAS · 06:38',
    teaser: '远郊租金回升了 4-6%，市中心仍在跌——但比一年前已收窄。',
  },
  {
    issue: 235, status: '',
    title: { en: 'Q1 board memo', cn: '一季度董事会备忘录' },
    category: 'INTERNAL · 内部', tag: 'INTERNAL',
    date: '5月02日', words: '1,406', reading: '4 min', sources: 3,
    by: 'ATLAS · 02:18',
    teaser: '三大业务线达成、超出、未达 Q1 目标的分布与原因。',
  },
  {
    issue: 234, status: 'ARCHIVED',
    title: { en: 'Q4 retro · go-to-market', cn: 'Q4 GTM 复盘' },
    category: 'INTERNAL · 内部', tag: 'INTERNAL',
    date: '4月28日', words: '1,802', reading: '5 min', sources: 5,
    by: 'ATLAS · 03:51',
    teaser: '渠道侧的 CAC 显著优于直销，但 LTV 还需要 2 个季度验证。',
  },
];

const LIB_FILTERS = [
  { k: 'ALL',        en: 'All',        cn: '全部' },
  { k: 'INDUSTRY',   en: 'Industry',   cn: '行业' },
  { k: 'COMPETITOR', en: 'Competitor', cn: '竞品' },
  { k: 'DATA',       en: 'Data',       cn: '数据' },
  { k: 'STRATEGY',   en: 'Strategy',   cn: '战略' },
  { k: 'INTERNAL',   en: 'Internal',   cn: '内部' },
];

function inferTagFromReport(r) {
  const cat = (r.meta?.category || r.category || '').toLowerCase();
  const prompt = (r.prompt || '').toLowerCase();
  const text = cat + ' ' + prompt;
  if (/internal|内部|周报|月报|memo|board|retro|gtm|复盘|团队|weekly|wk\d/.test(text)) return 'INTERNAL';
  if (/data|数据|sales|销售|gmv|指标|q[1-4]|quarter|kpi|增长|漏斗|留存/.test(text)) return 'DATA';
  if (/competitor|竞品|对比|vs\b|versus|comparison|拆解/.test(text)) return 'COMPETITOR';
  if (/strategy|战略|macro|宏观|policy|政策|society|社会|okr|planning|rent|远程|出行|楼市/.test(text)) return 'STRATEGY';
  return 'INDUSTRY';
}

// P5 Observability — aggregate stats over AI-generated reports
function LibraryStats({ t, reports }) {
  const [open, setOpen] = React.useState(false);
  const parseW = (w) => Number(String(w ?? '').replace(/,/g, '')) || 0;

  const stats = React.useMemo(() => {
    const n = reports.length;
    if (!n) return null;
    const words = reports.map(r => parseW(r.meta?.words));
    const totalWords = words.reduce((a, b) => a + b, 0);
    const durs = reports.map(r => r.meta?.durationMs).filter(d => d > 0);
    const avgDur = durs.length ? durs.reduce((a, b) => a + b, 0) / durs.length : 0;

    const byModel = {};
    reports.forEach(r => {
      const m = r.meta?.model || '未知';
      (byModel[m] ||= { count: 0, words: 0, durs: [] });
      byModel[m].count++; byModel[m].words += parseW(r.meta?.words);
      if (r.meta?.durationMs > 0) byModel[m].durs.push(r.meta.durationMs);
    });
    const models = Object.entries(byModel).map(([name, v]) => ({
      name, count: v.count, avgWords: Math.round(v.words / v.count),
      avgDur: v.durs.length ? v.durs.reduce((a, b) => a + b, 0) / v.durs.length : 0,
    })).sort((a, b) => b.count - a.count);

    const ratings = { good: 0, bad: 0, none: 0 };
    reports.forEach(r => { ratings[r.rating === 'good' ? 'good' : r.rating === 'bad' ? 'bad' : 'none']++; });

    const modeCount = {};
    reports.forEach(r => { const gm = r.meta?.generationMode; if (gm) modeCount[gm] = (modeCount[gm] || 0) + 1; });
    const modes = Object.entries(modeCount).map(([k, v]) => ({ k, v })).sort((a, b) => b.v - a.v);

    const withResearch = reports.filter(r => r.meta?.research);
    const totalCalls = withResearch.reduce((a, r) => a + (r.meta.research.log?.length || 0), 0);

    // O-C · per prompt-version: count + avg rating score (good=1, bad=0)
    const verMap = {};
    reports.forEach(r => {
      const h = r.meta?.promptHash; if (!h) return;
      (verMap[h] ||= { count: 0, rated: 0, score: 0 });
      verMap[h].count++;
      if (r.rating === 'good') { verMap[h].rated++; verMap[h].score++; }
      else if (r.rating === 'bad') { verMap[h].rated++; }
    });
    const versions = Object.entries(verMap).map(([h, v]) => ({
      h, count: v.count, rated: v.rated, approval: v.rated ? Math.round((v.score / v.rated) * 100) : null,
    })).sort((a, b) => b.count - a.count);

    return { n, totalWords, avgWords: Math.round(totalWords / n), avgDur, models, ratings, modes, versions,
      researchN: withResearch.length, avgCalls: withResearch.length ? (totalCalls / withResearch.length) : 0 };
  }, [reports]);

  if (!stats) return null;
  const fmtDur = (ms) => ms ? (ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`) : '—';
  const card = { flex: 1, minWidth: 120, padding: '12px 14px', border: `1px solid ${t.rule}`, background: t.faint };
  const bigNum = { fontFamily: t.fontDisplay, fontWeight: 900, fontSize: 26, letterSpacing: -0.5, color: t.ink, lineHeight: 1 };
  const capLbl = { fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1, marginTop: 5 };
  const secLbl = { fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.2, margin: '14px 0 8px' };
  const ratingTotal = stats.ratings.good + stats.ratings.bad + stats.ratings.none || 1;

  return (
    <div style={{ borderBottom: `1px solid ${t.rule}`, background: t.paper }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        width: '100%', textAlign: 'left', padding: '12px 36px', background: 'transparent',
        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.2, color: t.ink,
      }}>
        <span style={{ color: t.accent }}>▪ STATS · 数据概览</span>
        <span style={{ color: t.mute }}>{stats.n} 篇生成报告</span>
        <span style={{ flex: 1 }}/>
        <span style={{ color: t.mute }}>{open ? '收起 ▲' : '展开 ▼'}</span>
      </button>

      {open && (
        <div style={{ padding: '0 36px 22px' }}>
          {/* Overview cards */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={card}><div style={bigNum}>{stats.n}</div><div style={capLbl}>报告数 · REPORTS</div></div>
            <div style={card}><div style={bigNum}>{stats.totalWords.toLocaleString()}</div><div style={capLbl}>总字数 · TOTAL WORDS</div></div>
            <div style={card}><div style={bigNum}>{stats.avgWords.toLocaleString()}</div><div style={capLbl}>平均字数 · AVG WORDS</div></div>
            <div style={card}><div style={bigNum}>{fmtDur(stats.avgDur)}</div><div style={capLbl}>平均耗时 · AVG TIME</div></div>
            {stats.researchN > 0 && (
              <div style={card}><div style={bigNum}>{stats.researchN}</div><div style={capLbl}>启用研究 · 均 {stats.avgCalls.toFixed(1)} 次调用</div></div>
            )}
          </div>

          {/* By model */}
          <div style={secLbl}>按模型 · BY MODEL</div>
          <div style={{ border: `1px solid ${t.rule}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 90px', padding: '6px 12px', background: t.faint, fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 0.5 }}>
              <span>模型</span><span style={{ textAlign: 'right' }}>篇数</span><span style={{ textAlign: 'right' }}>平均字数</span><span style={{ textAlign: 'right' }}>平均耗时</span>
            </div>
            {stats.models.map(m => (
              <div key={m.name} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 90px', padding: '7px 12px', borderTop: `1px solid ${t.rule}`, fontFamily: t.fontCN, fontSize: 12, color: t.ink, alignItems: 'center' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                <span style={{ textAlign: 'right', fontFamily: t.fontMono, fontSize: 11 }}>{m.count}</span>
                <span style={{ textAlign: 'right', fontFamily: t.fontMono, fontSize: 11 }}>{m.avgWords.toLocaleString()}</span>
                <span style={{ textAlign: 'right', fontFamily: t.fontMono, fontSize: 11 }}>{fmtDur(m.avgDur)}</span>
              </div>
            ))}
          </div>

          {/* Rating distribution */}
          <div style={secLbl}>评分分布 · RATINGS</div>
          <div style={{ display: 'flex', height: 22, border: `1px solid ${t.rule}`, overflow: 'hidden', fontFamily: t.fontMono, fontSize: 9 }}>
            {[['good', '#2a8c5c', '好评'], ['bad', '#b04040', '差评'], ['none', t.rule, '未评']].map(([k, col, lbl]) => {
              const pct = (stats.ratings[k] / ratingTotal) * 100;
              if (pct === 0) return null;
              return (
                <div key={k} title={`${lbl} ${stats.ratings[k]}`} style={{ width: `${pct}%`, background: col, color: k === 'none' ? t.mute : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}>
                  {pct > 12 ? `${lbl} ${stats.ratings[k]}` : ''}
                </div>
              );
            })}
          </div>

          {/* Generation modes */}
          {stats.modes.length > 0 && (
            <>
              <div style={secLbl}>生成模式 · MODES</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {stats.modes.map(m => (
                  <span key={m.k} style={{ fontFamily: t.fontMono, fontSize: 10, color: t.ink, padding: '4px 10px', border: `1px solid ${t.rule}`, background: t.faint }}>
                    {m.k} · {m.v}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Prompt versions (O-C) — approval = good/(good+bad) */}
          {stats.versions.length > 0 && (
            <>
              <div style={secLbl}>提示词版本 · PROMPT VERSIONS</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {stats.versions.map(v => (
                  <span key={v.h} title={`${v.rated} 篇已评分`} style={{ fontFamily: t.fontMono, fontSize: 10, color: t.ink, padding: '4px 10px', border: `1px solid ${v.h === PROMPT_VERSION ? t.accent : t.rule}`, background: t.faint }}>
                    {v.h}{v.h === PROMPT_VERSION ? ' (当前)' : ''} · {v.count} 篇{v.approval !== null ? ` · 好评率 ${v.approval}%` : ''}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Library({ t, onOpen, savedReports = [], onToggleFavorite, onRate }) {
  const [filter, setFilter] = React.useState('ALL');
  const [sort, setSort] = React.useState('date');
  const [favOnly, setFavOnly] = React.useState(false);

  // Merge saved (generated) + static entries
  const generatedEntries = savedReports.map(r => ({
    _id: r.id,
    issue: '—',
    status: 'NEW',
    title: r.meta.title,
    category: r.meta.category,
    tag: inferTagFromReport(r),
    isAI: true,
    date: r.meta.date,
    words: r.meta.words,
    reading: r.meta.reading,
    sources: r.meta.sources,
    by: `ATLAS · ${r.meta.model || 'AI'}`,
    teaser: r.meta.subtitle || r.prompt?.slice(0, 80),
    favorited: r.favorited,
    rating: r.rating || null,
    feature: false,
  }));
  const staticEntries = LIBRARY_ENTRIES.map(e => ({ ...e, favorited: false }));
  const allEntries = [...generatedEntries, ...staticEntries];

  const LIB_FILTERS_DYNAMIC = [
    { k: 'ALL',        en: 'ALL',        cn: '全部' },
    { k: 'INDUSTRY',   en: 'INDUSTRY',   cn: '行业' },
    { k: 'COMPETITOR', en: 'COMPETITOR', cn: '竞品' },
    { k: 'DATA',       en: 'DATA',       cn: '数据' },
    { k: 'STRATEGY',   en: 'STRATEGY',   cn: '战略' },
    { k: 'INTERNAL',   en: 'INTERNAL',   cn: '内部' },
  ];

  const filtered = allEntries.filter(e => {
    if (favOnly && !e.favorited) return false;
    if (filter === 'ALL') return true;
    return e.tag === filter;
  });

  const feature = filtered.find(e => e.feature) || filtered[0];
  const rest = filtered.filter(e => e !== feature);
  const total = allEntries.length;

  return (
    <div style={{ flex: 1, background: t.paper, color: t.ink, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto' }}>
      {/* Masthead */}
      <div style={{ padding: '36px 36px 24px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'flex-end', borderBottom: `2px solid ${t.ink}` }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
            <Tag t={t} accent>◆ THE ARCHIVE · 报告库</Tag>
            <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>{total} entries · 全部 {total} 期</span>
          </div>
          <div style={{ fontFamily: t.fontDisplay, fontWeight: 900, fontSize: 80, lineHeight: 0.92, letterSpacing: -3, color: t.ink }}>
            Every essay <span style={{ fontFamily: t.fontSerif, fontStyle: 'italic', fontWeight: 500, color: t.accent }}>Atlas</span><br/>has ever filed.
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 1.2 }}>SINCE</span>
          <span style={{ fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 28, letterSpacing: -0.5 }}>2025 · 09 · 12</span>
          <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>{total} issues</span>
        </div>
      </div>

      {/* P5 · aggregate stats over generated reports */}
      <LibraryStats t={t} reports={savedReports}/>

      {/* Filters bar */}
      <div style={{ padding: '14px 36px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${t.rule}`, background: t.paper, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 1.2 }}>FILTER ·</span>
        {LIB_FILTERS_DYNAMIC.map(f => (
          <button key={f.k} type="button" onClick={() => setFilter(f.k)} style={{
            padding: '5px 12px', border: `1px solid ${filter === f.k ? t.ink : t.rule}`,
            background: filter === f.k ? t.ink : 'transparent',
            color: filter === f.k ? t.paper : t.ink,
            fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 10,
            letterSpacing: 1.2, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{ textTransform: 'uppercase' }}>{f.en}</span>
            <span style={{ fontFamily: t.fontCN, fontWeight: 500, fontSize: 11, opacity: 0.65, letterSpacing: 0 }}>{f.cn}</span>
          </button>
        ))}
        <span style={{ flex: 1 }}/>
        <button type="button" onClick={() => setFavOnly(v => !v)} style={{
          padding: '5px 11px', border: `1px solid ${favOnly ? '#c8a84b' : t.rule}`,
          background: favOnly ? 'rgba(200,168,75,0.10)' : 'transparent',
          color: favOnly ? '#c8a84b' : t.mute,
          fontFamily: t.fontMono, fontSize: 10, cursor: 'pointer',
          letterSpacing: 1, display: 'inline-flex', alignItems: 'center', gap: 5,
          transition: 'all 0.15s',
        }}>
          <span>{favOnly ? '★' : '☆'}</span>
          <span>收藏</span>
        </button>
        <button type="button" onClick={() => setSort(s => s === 'date' ? 'words' : 'date')}
          style={{ padding: '5px 10px', border: `1px solid ${t.rule}`, background: 'transparent', fontFamily: t.fontMono, fontSize: 10, color: t.ink, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase' }}>
          {sort === 'date' ? 'BY DATE ↓' : 'BY LENGTH ↓'}
        </button>
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: '48px 36px', fontFamily: t.fontCN, fontSize: 16, color: t.mute, textAlign: 'center' }}>
          {favOnly ? '还没有收藏的报告' : '没有符合条件的报告'}
        </div>
      )}

      {/* Featured */}
      {feature && (
        <article onClick={() => onOpen(feature)} style={{ padding: '36px 36px', borderBottom: `1px solid ${t.ink}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, cursor: 'pointer', background: t.paper, transition: 'background 0.12s' }}
          onMouseEnter={e => e.currentTarget.style.background = t.faint}
          onMouseLeave={e => e.currentTarget.style.background = t.paper}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Tag t={t} accent filled>◆ {feature._id ? `${feature.tag} · AI` : `ISSUE № ${feature.issue} · LATEST`}</Tag>
              <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>{feature.category}</span>
            </div>
            <div style={{ fontFamily: t.fontDisplay, fontWeight: 900, fontSize: 48, lineHeight: 0.96, letterSpacing: -1.6 }}>{feature.title.en}</div>
            <div style={{ fontFamily: t.fontCN, fontWeight: 700, fontSize: 22, lineHeight: 1.3, color: t.inkSoft }}>{feature.title.cn}</div>
            <div style={{ fontFamily: t.fontCN, fontSize: 14, lineHeight: 1.7, color: t.inkSoft, marginTop: 4 }}>{feature.teaser}</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, alignItems: 'center' }}>
              <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 1 }}>{feature.date}</span>
              <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>{feature.words} 字</span>
              <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>{feature.sources} 来源</span>
              <span style={{ flex: 1 }}/>
              {feature.favorited && <span style={{ color: '#c8a84b', fontSize: 16 }}>★</span>}
              <Btn t={t} size="sm" accent primary>Read ↗</Btn>
            </div>
          </div>
          <CoverArt t={t} entry={feature}/>
        </article>
      )}

      {/* Rest grid */}
      <div style={{ padding: '24px 36px 48px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderTop: `1px solid ${t.rule}`, borderLeft: `1px solid ${t.rule}` }}>
        {rest.map((e, i) => (
          <LibraryCard key={e._id || e.issue} entry={e} t={t} onOpen={onOpen}
            onToggleFavorite={e._id && onToggleFavorite ? (ev) => { ev.stopPropagation(); onToggleFavorite(e._id); } : null}
            onRate={e._id && onRate ? (rating, ev) => { ev.stopPropagation(); onRate(e._id, rating); } : null}/>
        ))}
      </div>
    </div>
  );
}

function LibraryCard({ entry, t, onOpen, onToggleFavorite, onRate }) {
  return (
    <article onClick={() => onOpen(entry)} style={{
      borderRight: `1px solid ${t.rule}`, borderBottom: `1px solid ${t.rule}`,
      padding: '22px 22px', cursor: 'pointer', background: t.paper,
      display: 'flex', flexDirection: 'column', gap: 12, minHeight: 280,
      transition: 'background 0.12s', position: 'relative',
    }}
      onMouseEnter={e => e.currentTarget.style.background = t.faint}
      onMouseLeave={e => e.currentTarget.style.background = t.paper}>
      {/* Favorite star */}
      {(entry.favorited || onToggleFavorite) && (
        <div onClick={onToggleFavorite} style={{
          position: 'absolute', top: 12, right: 12,
          color: entry.favorited ? '#c8a84b' : t.rule,
          fontSize: 16, cursor: onToggleFavorite ? 'pointer' : 'default',
          transition: 'color 0.15s', zIndex: 1,
        }}
          onMouseEnter={e => { if (onToggleFavorite) e.target.style.color = '#c8a84b'; }}
          onMouseLeave={e => { if (onToggleFavorite) e.target.style.color = entry.favorited ? '#c8a84b' : t.rule; }}>
          {entry.favorited ? '★' : '☆'}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 1.2 }}>
          {entry._id ? `№ —` : `№ ${entry.issue}`}
        </span>
        <Tag t={t}>{entry.tag}</Tag>
      </div>
      <CoverArt t={t} entry={entry} mini/>
      <div>
        <div style={{ fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 17, letterSpacing: -0.3, lineHeight: 1.1, marginBottom: 4 }}>
          {entry.title.en}
        </div>
        <div style={{ fontFamily: t.fontCN, fontWeight: 600, fontSize: 13, color: t.inkSoft, lineHeight: 1.3 }}>
          {entry.title.cn}
        </div>
      </div>
      <div style={{ fontFamily: t.fontCN, fontSize: 12, color: t.mute, lineHeight: 1.5, flex: 1 }}>
        {entry.teaser}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', paddingTop: 8, borderTop: `1px solid ${t.rule}` }}>
        <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 0.5 }}>{entry.date}</span>
        <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>·</span>
        <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>{entry.words} 字</span>
        <span style={{ flex: 1 }}/>
        {entry.rating && (
          <span style={{ fontFamily: t.fontMono, fontSize: 8, letterSpacing: 0.8,
            color: entry.rating === 'good' ? '#2a8c5c' : '#b04040',
            border: `1px solid ${entry.rating === 'good' ? 'rgba(42,140,92,0.4)' : 'rgba(176,64,64,0.4)'}`,
            padding: '1px 5px' }}>
            {entry.rating === 'good' ? '+ 好评' : '- 差评'}
          </span>
        )}
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.accent }}>↗</span>
      </div>
    </article>
  );
}

// Simple typographic "cover art" — bold geometric composition per category
function CoverArt({ t, entry, mini = false }) {
  const h = mini ? 110 : 280;
  const variants = {
    INDUSTRY:   { bg: t.ink,      fg: t.paper,    accent: t.accent },
    COMPETITOR: { bg: '#1a0f0a',  fg: '#f0e6d3',  accent: '#e07b4a' },
    DATA:       { bg: t.accent,   fg: t.paper,    accent: t.ink },
    STRATEGY:   { bg: '#0d1117',  fg: '#c9d1d9',  accent: '#58a6ff' },
    INTERNAL:   { bg: t.paperAlt, fg: t.ink,      accent: t.accent },
    RESEARCH:   { bg: t.ink,      fg: t.paper,    accent: t.accent },
  };
  const v = variants[entry.tag] || variants.INDUSTRY;
  const seed = entry.issue;
  return (
    <div style={{
      height: h, background: v.bg, color: v.fg,
      border: `1px solid ${t.ink}`,
      position: 'relative', overflow: 'hidden',
      fontFamily: t.fontDisplay,
    }}>
      <CoverArtComposition issue={entry.issue} v={v} t={t} mini={mini}/>
      <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontFamily: t.fontMono, fontSize: mini ? 8 : 10, letterSpacing: 1.4, opacity: 0.85 }}>VOL.04</span>
        <span style={{ fontFamily: t.fontMono, fontSize: mini ? 8 : 10, letterSpacing: 1.4, opacity: 0.85 }}>№ {entry.issue}</span>
      </div>
      <div style={{ position: 'absolute', bottom: 10, right: 12 }}>
        <span style={{ fontFamily: t.fontMono, fontSize: mini ? 8 : 10, letterSpacing: 1.2, opacity: 0.85 }}>{entry.date}</span>
      </div>
      {(entry._id || entry.isAI) && (
        <div style={{
          position: 'absolute', top: mini ? 6 : 10, right: mini ? 6 : 10,
          background: 'linear-gradient(135deg, #0f0f0f 0%, #1c1408 100%)',
          border: `1px solid rgba(200,168,75,0.7)`,
          borderRadius: 2,
          padding: mini ? '2px 5px' : '3px 8px',
          display: 'flex', alignItems: 'center', gap: 3,
          boxShadow: '0 0 6px rgba(200,168,75,0.2)',
          backdropFilter: 'blur(4px)',
        }}>
          <span style={{ color: '#c8a84b', fontSize: mini ? 7 : 8, lineHeight: 1 }}>◆</span>
          <span style={{ fontFamily: t.fontMono, fontSize: mini ? 7 : 8, fontWeight: 700, color: '#c8a84b', letterSpacing: 1.2 }}>AI</span>
        </div>
      )}
    </div>
  );
}

function CoverArtComposition({ issue, v, t, mini }) {
  // Pseudo-random but deterministic composition per issue
  const r = (s) => ((Math.sin((issue + s) * 91.3) + 1) / 2);
  const big = mini ? 36 : 88;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      {/* Big number */}
      <text x={50} y={64 + (mini ? 4 : 0)} textAnchor="middle"
        fontFamily="Archivo, sans-serif" fontWeight="900"
        fontSize={mini ? 48 : 78} letterSpacing="-4"
        fill={v.fg} opacity="0.18">{issue}</text>
      {/* Random shapes */}
      <circle cx={20 + r(1) * 30} cy={30 + r(2) * 20} r={4 + r(3) * 6}
        fill={v.accent} opacity="0.85"/>
      <rect x={60} y={20 + r(4) * 10} width={28} height={3} fill={v.fg} opacity="0.6"/>
      <line x1={10} y1={70} x2={92} y2={70} stroke={v.fg} strokeWidth="0.3" opacity="0.6"/>
      <text x={10} y={92} fontFamily="JetBrains Mono, monospace" fontSize="3.5" letterSpacing="0.4"
        fill={v.fg} opacity="0.7">A · T · L · A · S · ESSAYS</text>
    </svg>
  );
}

Object.assign(window, { Library, LIBRARY_ENTRIES });
// Sources — knowledge base / data source management.
// Plus the ExportModal overlay used from the report screen.

const SOURCE_CATEGORIES = [
  { k: 'all',   en: 'All',         cn: '全部',    count: 38 },
  { k: 'db',    en: 'Databases',   cn: '数据库',  count: 4 },
  { k: 'files', en: 'Files & Docs', cn: '文件',   count: 5 },
  { k: 'web',   en: 'Web crawl',   cn: '网络抓取', count: 16 },
  { k: 'api',   en: 'APIs',        cn: 'API',     count: 13 },
];

const SOURCES = [
  // ── 宏观经济 · 官方统计 ────────────────────────────────────────────────
  {
    name: '国家统计局 · 统计数据库', en: 'NBS · National Data',
    type: 'web', kind: 'WEB · 官方', size: '—', docs: '120k+ 指标',
    lastSync: '5月31日 10:00', cadence: 'monthly', status: 'ok', quality: 'A',
    note: 'GDP / CPI / PPI / PMI / 工业产值 / 固定资产投资。每月 15 日前后发布。',
    preview: { type: 'metrics', items: [
      { label: 'GDP 增速 (Q1)', value: '5.3', unit: '%', change: '+0.1pp YoY', dir: 'up' },
      { label: 'CPI (4月)', value: '0.3', unit: '%', change: '-0.1pp MoM', dir: 'down' },
      { label: 'PPI (4月)', value: '-2.5', unit: '%', change: '连续 19 月负增', dir: 'down' },
      { label: 'PMI 制造业 (5月)', value: '50.4', unit: '', change: '+0.2pt MoM', dir: 'up' },
      { label: '工业产值 (4月)', value: '+6.7', unit: '%', change: '超预期', dir: 'up' },
      { label: '固定资产投资 (1–4月)', value: '+4.2', unit: '%', change: 'YoY', dir: 'up' },
    ]},
  },
  {
    name: '中国人民银行 · 货币金融统计', en: 'PBOC · Monetary Statistics',
    type: 'web', kind: 'WEB · 官方', size: '—', docs: '85k+ 指标',
    lastSync: '5月30日 16:30', cadence: 'monthly', status: 'ok', quality: 'A',
    note: 'M0/M1/M2 货币供应 / 社融规模 / 信贷数据 / LPR 基准利率。',
    preview: { type: 'metrics', items: [
      { label: 'M2 增速 (4月)', value: '8.7', unit: '%', change: '-0.2pp MoM', dir: 'down' },
      { label: '社融增量 (4月)', value: '1.87', unit: '万亿', change: '同比少增0.12万亿', dir: 'down' },
      { label: 'LPR 1年期', value: '3.45', unit: '%', change: '持平', dir: 'neutral' },
      { label: 'LPR 5年期', value: '3.95', unit: '%', change: '持平', dir: 'neutral' },
      { label: '新增人民币贷款 (4月)', value: '7300', unit: '亿', change: '同比少增约600亿', dir: 'down' },
    ]},
  },
  {
    name: '海关总署 · 进出口统计', en: 'GACC · Trade Statistics',
    type: 'web', kind: 'WEB · 官方', size: '—', docs: '42k+ 商品',
    lastSync: '5月13日 09:00', cadence: 'monthly', status: 'ok', quality: 'A',
    note: '按 HS 编码细分的进出口量 / 金额 / 贸易伙伴。月度数据约滞后 2 周。',
    preview: { type: 'metrics', items: [
      { label: '出口 YoY (4月)', value: '+8.5', unit: '%', change: '超市场预期', dir: 'up' },
      { label: '进口 YoY (4月)', value: '+2.3', unit: '%', change: '弱于预期', dir: 'down' },
      { label: '贸易顺差 (4月)', value: '823', unit: '亿美元', change: '同比+24%', dir: 'up' },
      { label: '对美出口 (4月)', value: '-3.2', unit: '%', change: '关税压力显现', dir: 'down' },
      { label: '对东盟出口 (4月)', value: '+12.4', unit: '%', change: '高速增长', dir: 'up' },
    ]},
  },
  {
    name: '发改委 · 重要商品价格监测', en: 'NDRC · Commodity Prices',
    type: 'web', kind: 'WEB · 官方', size: '—', docs: '280 品类',
    lastSync: '5月31日 08:00', cadence: 'daily', status: 'ok', quality: 'A',
    note: '生猪、蔬菜、粮油、煤炭等重要商品零售与批发价格。每日更新。',
    preview: { type: 'table', cols: ['品类', '最新价', '单位', '周变动'], rows: [
      ['生猪 (批发)', '20.8', '元/kg', '-1.3%'],
      ['普通粳米', '3.84', '元/斤', '+0.2%'],
      ['大豆油 (5L)', '62.5', '元/桶', '+0.8%'],
      ['动力煤 (秦皇岛)', '780', '元/吨', '-2.1%'],
      ['93#汽油 (全国均)', '7.48', '元/L', '持平'],
    ]},
  },
  {
    name: '证监会 · 上市公司定期报告', en: 'CSRC · Listed Co. Filings',
    type: 'web', kind: 'WEB · 官方', size: '—', docs: '5200+ 公司',
    lastSync: '5月31日 18:00', cadence: 'daily', status: 'ok', quality: 'A',
    note: '季报 / 半年报 / 年报。含巨潮资讯全量公告镜像，T+0 更新。',
    preview: { type: 'headlines', items: [
      { time: '05-31 18:42', title: '贵州茅台 (600519) 披露 2024 年年度报告，营收同比 +17%', tag: '年报' },
      { time: '05-31 17:30', title: '宁德时代 (300750) Q1 净利润 105 亿元，同比 +33%', tag: '季报' },
      { time: '05-31 16:15', title: '比亚迪 (002594) 一季报：净利润 45.7 亿，同比 +11%', tag: '季报' },
      { time: '05-31 15:00', title: '中国平安 (601318) 2024 年报：净利 1196 亿，同比 +36%', tag: '年报' },
    ]},
  },

  // ── 金融市场 ────────────────────────────────────────────────────────────
  {
    name: '东方财富 · A 股实时行情', en: 'Eastmoney · A-Share Quotes',
    type: 'api', kind: 'API · REST', size: '—', docs: '5300+ 股票',
    lastSync: '5月31日 15:00', cadence: 'realtime', status: 'ok', quality: 'A',
    note: '沪深全量股票行情 / 涨跌幅 / 资金流向 / 龙虎榜。3 秒延迟。',
    preview: { type: 'table', cols: ['代码', '名称', '现价', '涨跌幅', '成交额'], rows: [
      ['600519', '贵州茅台', '1762.00', '+1.24%', '22.4亿'],
      ['300750', '宁德时代', '214.50', '+2.88%', '48.6亿'],
      ['002594', '比亚迪', '308.20', '-0.52%', '19.1亿'],
      ['601318', '中国平安', '52.80', '+0.76%', '15.3亿'],
      ['600036', '招商银行', '38.42', '+0.34%', '11.7亿'],
    ]},
  },
  {
    name: '中国货币网 · 汇率与利率', en: 'CFETS · FX & Rates',
    type: 'api', kind: 'API · 官方', size: '—', docs: '160+ 货币对',
    lastSync: '5月31日 16:30', cadence: 'realtime', status: 'ok', quality: 'A',
    note: '人民币中间价 / SHIBOR / LPR / 银行间债券报价。外汇交易中心官方源。',
    preview: { type: 'metrics', items: [
      { label: 'USD/CNY 中间价', value: '7.1068', unit: '', change: '-0.0023', dir: 'up' },
      { label: 'EUR/CNY', value: '7.7534', unit: '', change: '+0.0082', dir: 'up' },
      { label: 'SHIBOR 隔夜', value: '1.823', unit: '%', change: '-1.2bp', dir: 'down' },
      { label: 'SHIBOR 1M', value: '2.015', unit: '%', change: '+0.5bp', dir: 'up' },
      { label: '10Y 国债收益率', value: '2.285', unit: '%', change: '-1.5bp', dir: 'down' },
    ]},
  },
  {
    name: 'Wind 万得 · 金融数据终端', en: 'Wind · Financial Terminal',
    type: 'api', kind: 'API · SDK', size: '—', docs: '600k+ 指标',
    lastSync: '5月31日 15:30', cadence: 'realtime', status: 'ok', quality: 'A',
    note: '机构级金融数据。A 股 / 债券 / 期货 / 基金 / 宏观经济全覆盖。需授权 Key。',
    preview: { type: 'metrics', items: [
      { label: '沪深300 指数', value: '3872.56', unit: 'pts', change: '+0.68%', dir: 'up' },
      { label: '上证综指', value: '3124.42', unit: 'pts', change: '+0.44%', dir: 'up' },
      { label: '中债净价指数', value: '221.84', unit: 'pts', change: '+0.12%', dir: 'up' },
      { label: 'CRB 商品指数', value: '541.2', unit: 'pts', change: '-0.31%', dir: 'down' },
      { label: '恒生指数', value: '19184.6', unit: 'pts', change: '+1.24%', dir: 'up' },
    ]},
  },
  {
    name: '巨潮资讯 · 上市公司公告', en: 'CNINFO · Announcements',
    type: 'api', kind: 'API · REST', size: '—', docs: '18M+ 公告',
    lastSync: '5月31日 20:00', cadence: 'realtime', status: 'ok', quality: 'A',
    note: '交易所指定信披平台。公告全文 PDF + 结构化摘要。实时推送。',
    preview: { type: 'headlines', items: [
      { time: '05-31 20:02', title: '中芯国际 (688981) 拟定增募资不超过 120 亿元', tag: '再融资' },
      { time: '05-31 18:55', title: '药明康德 (603259) 董事会审议通过回购 5 亿股方案', tag: '回购' },
      { time: '05-31 17:30', title: '海天味业 (603288) 公告股权激励计划，授予 480 万股', tag: '激励' },
      { time: '05-31 16:02', title: '格力电器 (000651) 拟分红每股 4.2 元，总额 25 亿', tag: '分红' },
    ]},
  },
  {
    name: '上交所 · 债券与 ETF 行情', en: 'SSE · Bond & ETF Market',
    type: 'api', kind: 'API · 官方', size: '—', docs: '8200+ 品种',
    lastSync: '5月31日 15:00', cadence: 'daily', status: 'ok', quality: 'A',
    note: '交易所债券收益率 / ETF 净值与折溢价。T+0 日终数据。',
    preview: { type: 'table', cols: ['代码', '品种', '净值/收益率', '折溢价', '成交额'], rows: [
      ['510300', '沪深300ETF', '3.872', '+0.02%', '32.8亿'],
      ['510050', '上证50ETF', '3.021', '-0.01%', '18.4亿'],
      ['512010', '医药ETF', '1.185', '+0.05%', '8.2亿'],
      ['019673', '30年国债', '2.89%', '—', '11.3亿'],
    ]},
  },

  // ── 一级市场 & 创投 ─────────────────────────────────────────────────────
  {
    name: 'IT 桔子 · 一级市场数据库', en: 'IT Juzi · VC/PE Events',
    type: 'api', kind: 'API · v3', size: '—', docs: '91k+ 事件',
    lastSync: '5月31日 09:14', cadence: 'realtime', status: 'ok', quality: 'A',
    note: '融资事件 / 估值 / 投资方关系。支持行业 / 轮次 / 金额多维筛选。',
    preview: { type: 'table', cols: ['公司', '行业', '轮次', '金额', '机构'], rows: [
      ['智元机器人', '机器人', 'B轮', '7亿元', '高瓴 / 蔚来资本'],
      ['面壁智能', 'AI大模型', 'A轮', '3000万$', 'Sequoia China'],
      ['清陶能源', '固态电池', 'D轮', '40亿元', '国家大基金II'],
      ['Manus AI', 'AI Agent', '天使轮', '500万$', 'ZhenFund'],
    ]},
  },
  {
    name: '鲸准研究院 · VC 数据库', en: 'JingData · VC Intelligence',
    type: 'api', kind: 'API · v2', size: '—', docs: '62k+ 项目',
    lastSync: '5月30日 22:00', cadence: 'daily', status: 'ok', quality: 'A',
    note: '一级市场投融资 / 财务预测 / 投资机构图谱。含并购与 IPO 追踪。',
    preview: { type: 'table', cols: ['事件', '标的', '金额/估值', '日期'], rows: [
      ['IPO过会', '三菱电梯中国', 'A股主板', '2024-05-28'],
      ['并购', '商汤收购香港AI公司', '3.2亿HKD', '2024-05-25'],
      ['战略融资', '九号公司(689009)', '5000万元', '2024-05-22'],
      ['基金设立', '国新科创基金II期', '200亿元', '2024-05-18'],
    ]},
  },

  // ── 行业垂直数据 ────────────────────────────────────────────────────────
  {
    name: '乘联会 · 乘用车月度销量', en: 'CPCA · Monthly Sales',
    type: 'web', kind: 'WEB · RSS', size: '12.3 MB', docs: 96,
    lastSync: '5月28日 18:02', cadence: 'daily', status: 'ok', quality: 'A',
    note: '官方乘用车销量。涵盖燃油 / 新能源 / 出口三个口径，每月 10 日前后发布。',
    preview: { type: 'metrics', items: [
      { label: '4月 乘用车批发', value: '208.2', unit: '万辆', change: '+10.0% YoY', dir: 'up' },
      { label: '4月 新能源批发', value: '92.4', unit: '万辆', change: '+31.2% YoY', dir: 'up' },
      { label: '4月 NEV 渗透率', value: '44.4', unit: '%', change: '+10pp YoY', dir: 'up' },
      { label: '4月 出口', value: '38.5', unit: '万辆', change: '+21.3% YoY', dir: 'up' },
    ]},
  },
  {
    name: '中汽协 · 汽车行业统计', en: 'CAAM · Auto Industry',
    type: 'web', kind: 'WEB · 官方', size: '—', docs: '240+ 指标',
    lastSync: '5月13日 10:00', cadence: 'monthly', status: 'ok', quality: 'A',
    note: '汽车总产销 / 分车型 / 分品牌 / 出口数据。中国汽车工业协会官方发布。',
    preview: { type: 'table', cols: ['品牌', '4月销量 (万辆)', 'YoY', '市占率'], rows: [
      ['比亚迪', '31.25', '+46.1%', '15.0%'],
      ['大众集团', '28.40', '-5.2%', '13.7%'],
      ['通用集团', '18.62', '-12.8%', '8.9%'],
      ['特斯拉中国', '7.42', '+8.5%', '3.6%'],
      ['小米汽车', '3.20', '首发', '1.5%'],
    ]},
  },
  {
    name: '国家能源局 · 电力工业数据', en: 'NEA · Power Statistics',
    type: 'web', kind: 'WEB · 官方', size: '—', docs: '180+ 指标',
    lastSync: '5月16日 09:00', cadence: 'monthly', status: 'ok', quality: 'A',
    note: '发电量 / 用电量 / 装机容量 / 新能源占比。月度数据，每月中旬发布。',
    preview: { type: 'metrics', items: [
      { label: '全社会用电量 (4月)', value: '7408', unit: '亿kWh', change: '+6.8% YoY', dir: 'up' },
      { label: '新能源发电量 (4月)', value: '2580', unit: '亿kWh', change: '+22.4% YoY', dir: 'up' },
      { label: '可再生能源占比', value: '34.8', unit: '%', change: '+5.2pp YoY', dir: 'up' },
      { label: '光伏新增装机 (1-4月)', value: '62.4', unit: 'GW', change: '+28% YoY', dir: 'up' },
    ]},
  },
  {
    name: '中指院 · 房地产价格指数', en: 'CRIC · Property Index',
    type: 'api', kind: 'API · v2', size: '—', docs: '300+ 城市',
    lastSync: '5月31日 08:00', cadence: 'daily', status: 'ok', quality: 'A',
    note: '新房 / 二手房价格指数 / 成交量 / 库存周期。覆盖 300+ 城市，日更。',
    preview: { type: 'table', cols: ['城市', '新房均价', '月变动', '去化周期'], rows: [
      ['北京', '72,840 元/m²', '-0.3%', '14.2月'],
      ['上海', '80,120 元/m²', '-0.1%', '13.6月'],
      ['深圳', '65,580 元/m²', '-0.8%', '18.4月'],
      ['成都', '18,240 元/m²', '+0.5%', '9.1月'],
      ['郑州', '9,820 元/m²', '-1.2%', '26.8月'],
    ]},
  },
  {
    name: '窄门餐眼 · 门店与品牌数据', en: 'Zhaimen · F&B Stores',
    type: 'api', kind: 'API · v1', size: '—', docs: '12M+ 门店',
    lastSync: '5月31日 16:40', cadence: 'daily', status: 'ok', quality: 'A',
    note: '全国餐饮 / 零售门店开关店追踪。支持品牌 / 城市 / 商圈多维查询。',
    preview: { type: 'table', cols: ['品牌', '在营门店', '近30天净开', '人均消费'], rows: [
      ['蜜雪冰城', '43,280', '+312', '14元'],
      ['瑞幸咖啡', '20,150', '+285', '16元'],
      ['麦当劳', '6,820', '+48', '38元'],
      ['海底捞', '1,382', '-12', '125元'],
      ['喜茶', '3,246', '+96', '29元'],
    ]},
  },

  // ── 财经媒体 & 资讯 ─────────────────────────────────────────────────────
  {
    name: '财联社 · 实时财经快讯', en: 'CLS · Breaking Finance News',
    type: 'web', kind: 'WEB · 实时', size: '—', docs: '3000+ 条/日',
    lastSync: '5月31日 23:59', cadence: 'realtime', status: 'ok', quality: 'A',
    note: '国内领先财经快讯平台。政策解读 / 公司公告 / 市场异动即时推送。',
    preview: { type: 'headlines', items: [
      { time: '23:42', title: '央行：将综合运用多种货币政策工具，适时降准降息', tag: '政策' },
      { time: '22:15', title: '财政部：1-4月全国一般公共预算收入 82,293 亿元', tag: '财政' },
      { time: '20:38', title: 'MSCI：将中国A股纳入比例维持20%，暂不调整', tag: '外资' },
      { time: '18:02', title: '商务部：对原产于美国的农产品加征对等关税措施', tag: '贸易' },
    ]},
  },
  {
    name: '财新传媒 · 深度报道', en: 'Caixin · Investigative Finance',
    type: 'web', kind: 'WEB · RSS', size: '6.2 MB', docs: '580+ 篇/月',
    lastSync: '5月31日 20:30', cadence: 'daily', status: 'ok', quality: 'A',
    note: '深度财经调查报道。含 PMI 独家数据（财新 PMI）/ 宏观政策分析。',
    preview: { type: 'headlines', items: [
      { time: '05-31', title: '财新 5月 PMI 预览：制造业 51.2，服务业 53.4', tag: 'PMI' },
      { time: '05-30', title: '独家：某头部城商行不良率升至 2.3%，已启动风险处置', tag: '金融' },
      { time: '05-29', title: '中国汽车出口面临欧盟关税第二轮审查，波及三大整车厂', tag: '产业' },
      { time: '05-28', title: '地方债重组方案落地，六省存量债务置换比例超 40%', tag: '债务' },
    ]},
  },
  {
    name: '36 氪 · 创投与科技报道', en: '36Kr · Tech & VC News',
    type: 'web', kind: 'WEB · RSS', size: '8.6 MB', docs: '412+ 篇/月',
    lastSync: '5月31日 06:30', cadence: 'daily', status: 'ok', quality: 'A',
    note: '科技创业 / 融资快讯 / 行业深度。RSS 全文可抓，日均 15 篇。',
    preview: { type: 'headlines', items: [
      { time: '05-31', title: '字节跳动内部确认：豆包大模型日活突破 8000 万', tag: 'AI' },
      { time: '05-30', title: '独家：阿里云 2024 年营收首超 1000 亿，云计算增速回升', tag: '云计算' },
      { time: '05-30', title: '具身智能赛道疯狂融资，上半年已累计超 200 亿元', tag: '机器人' },
      { time: '05-29', title: 'Kimi 发布 k1.5 长思维链模型，数学推理跻身全球前三', tag: 'AI' },
    ]},
  },
  {
    name: '第一财经 · 经济报道', en: 'CBN · Economic News',
    type: 'web', kind: 'WEB · RSS', size: '—', docs: '800+ 篇/月',
    lastSync: '5月31日 22:00', cadence: 'realtime', status: 'ok', quality: 'A',
    note: '第一财经全频道 RSS。宏观 / 产业 / 金融 / 国际经济。实时更新。',
    preview: { type: 'headlines', items: [
      { time: '05-31', title: '国常会：进一步扩大内需，推动消费品以旧换新政策扩围', tag: '内需' },
      { time: '05-31', title: '上半年"新三样"出口突破 5000 亿，创历史同期新高', tag: '出口' },
      { time: '05-30', title: '专项债新增额度下达 3.8 万亿，基建发力预期升温', tag: '财政' },
      { time: '05-29', title: '工业产值连续 4 个月超预期，工程机械需求显著回暖', tag: '工业' },
    ]},
  },
  {
    name: '虎嗅 · 深度产业报道', en: 'Huxiu · Industry Analysis',
    type: 'web', kind: 'WEB · RSS', size: '3.4 MB', docs: '320+ 篇/月',
    lastSync: '5月31日 19:00', cadence: 'daily', status: 'ok', quality: 'B',
    note: '科技 / 消费 / 商业模式深度分析。RSS 可用，含作者背景信息。',
    preview: { type: 'headlines', items: [
      { time: '05-31', title: '淘天双11 GMV 同比下滑 15%：老路的终点', tag: '电商' },
      { time: '05-30', title: '华为鸿蒙生态三年：应用生态距离苹果还有多远？', tag: '手机' },
      { time: '05-29', title: '小红书赴美 IPO 估值或低至 70 亿美元，流量焦虑难解', tag: '社媒' },
      { time: '05-28', title: '理想汽车的焦虑：增程天花板与纯电泥潭', tag: '汽车' },
    ]},
  },
  {
    name: '晚点 LatePost · 科技深报', en: 'LatePost · Tech Deep Dive',
    type: 'web', kind: 'WEB · 抓取', size: '1.2 MB', docs: '40+ 篇/月',
    lastSync: '5月28日 14:00', cadence: 'weekly', status: 'ok', quality: 'A',
    note: '国内顶级科技报道。互联网大厂独家消息与战略分析。更新频率约每周 2 篇。',
    preview: { type: 'headlines', items: [
      { time: '05-28', title: '腾讯内部确认：将重组 PCG 事业群，短视频与内容合并运营', tag: '腾讯' },
      { time: '05-24', title: '阿里巴巴 2025 战略：放弃非核心业务，云+电商双核驱动', tag: '阿里' },
      { time: '05-20', title: '百度 AI 战略转折：文心放弃 ToC，全力押注企业服务', tag: '百度' },
      { time: '05-16', title: '字节"出海"的下一步：TikTok Shop 欧洲扩张计划曝光', tag: '字节' },
    ]},
  },

  // ── 社交媒体 & 搜索指数 ─────────────────────────────────────────────────
  {
    name: '百度指数 · 搜索热度趋势', en: 'Baidu Index · Search Trends',
    type: 'api', kind: 'API · v4', size: '—', docs: '1B+ 关键词',
    lastSync: '5月31日 08:00', cadence: 'daily', status: 'ok', quality: 'A',
    note: '关键词日均搜索量 / 用户画像 / 需求图谱。支持地域与人群维度拆分。',
    preview: { type: 'table', cols: ['关键词', '搜索指数', '7日变动', '主要人群'], rows: [
      ['人工智能', '98,420', '+12.3%', '18-35岁·男性'],
      ['新能源汽车', '72,185', '+8.7%', '25-40岁·均衡'],
      ['固态电池', '48,230', '+52.1%', '25-45岁·男性'],
      ['大模型', '63,580', '+18.4%', '20-35岁·高学历'],
    ]},
  },
  {
    name: '微博热搜 · 实时榜单', en: 'Weibo Hot Search',
    type: 'api', kind: 'API · 第三方', size: '—', docs: 'Top 50 实时',
    lastSync: '5月31日 23:30', cadence: 'realtime', status: 'ok', quality: 'B',
    note: '每 30 分钟更新。含热度指数 / 标签类型（娱乐 / 社会 / 财经）。',
    preview: { type: 'headlines', items: [
      { time: '#1', title: '央行宣布降准0.5个百分点', tag: '财经' },
      { time: '#2', title: '2024年高考报名人数创新高', tag: '社会' },
      { time: '#3', title: '比亚迪发布第五代DM技术', tag: '科技' },
      { time: '#5', title: '人民币汇率盘中升破7.10', tag: '财经' },
    ]},
  },
  {
    name: '微信指数 · 内容热度', en: 'WeChat Index · Content Heat',
    type: 'api', kind: 'API · 第三方', size: '—', docs: '500M+ 词条',
    lastSync: '5月31日 08:00', cadence: 'daily', status: 'ok', quality: 'B',
    note: '基于公众号 / 朋友圈 / 搜索的综合热度指数。覆盖 7 / 30 / 90 天趋势。',
    preview: { type: 'table', cols: ['词条', '今日指数', '7日趋势', '90日趋势'], rows: [
      ['AI大模型', '52,184,620', '▲ 上升', '▲ 大幅上升'],
      ['新能源', '38,402,110', '▲ 上升', '→ 平稳'],
      ['楼市', '28,103,850', '▼ 下降', '▼ 下降'],
      ['出海', '19,842,440', '▲ 上升', '▲ 上升'],
    ]},
  },
  {
    name: '小红书 · 讨论与热点抓取', en: 'Xiaohongshu · Community Crawl',
    type: 'web', kind: 'WEB · 抓取', size: '4.8 MB', docs: '340+ 条',
    lastSync: '5月30日 22:40', cadence: 'weekly', status: 'warn', quality: 'B',
    note: '按关键词抓取种草内容 / 用户评论。已去重过滤广告。建议扩展关键词池。',
    preview: { type: 'headlines', items: [
      { time: '5-31', title: '【种草】超详细！华为 Pura 70 Ultra 一个月使用评测', tag: '数码' },
      { time: '5-30', title: '小米 SU7 Ultra 提车日记：等了 4 个月终于拿到了', tag: '汽车' },
      { time: '5-29', title: '2025 必看理财指南：如何配置活期+稳健基金', tag: '理财' },
      { time: '5-28', title: '五月消费白皮书：90 后最爱的 10 个品牌', tag: '消费' },
    ]},
  },

  // ── 电商 & 消费 ─────────────────────────────────────────────────────────
  {
    name: '阿里数据 · 天猫商品趋势', en: 'Alibaba · Tmall Trends',
    type: 'api', kind: 'API · 开放平台', size: '—', docs: '1B+ SKU',
    lastSync: '5月31日 03:00', cadence: 'daily', status: 'ok', quality: 'A',
    note: '天猫 / 淘宝品类销量榜 / 搜索热词 / 价格趋势。官方开放平台 API。',
    preview: { type: 'table', cols: ['品类', '近7日销量', '环比', '搜索热词'], rows: [
      ['智能手机', '520万件', '+8.2%', 'iPhone 16 / 华为'],
      ['新能源配件', '240万件', '+31.5%', '车载冰箱 / 行车记录仪'],
      ['医美护肤', '680万件', '+12.0%', 'A醇精华 / 防晒'],
      ['家用健身器材', '98万件', '+5.6%', '哑铃 / 跑步机'],
    ]},
  },
  {
    name: '京东 · 商品价格实时监控', en: 'JD.com · Price Monitor',
    type: 'api', kind: 'API · 联盟', size: '—', docs: '500M+ SKU',
    lastSync: '5月31日 15:00', cadence: 'realtime', status: 'ok', quality: 'A',
    note: '全站实时价格 / 促销信息 / 销量排名。经京东联盟 API 接入，无频率限制。',
    preview: { type: 'table', cols: ['商品', '现价', '30日均价', '促销'], rows: [
      ['Apple iPhone 15 Pro 256G', '¥7,999', '¥8,299', '618立减300'],
      ['华为 Mate 60 Pro 512G', '¥8,299', '¥8,499', '无活动'],
      ['小米 SU7 标准版 (预订)', '¥215,900', '¥215,900', '新车'],
      ['戴森 V15 吸尘器', '¥4,590', '¥4,890', '618立减300'],
    ]},
  },
  {
    name: '商务部 · 商品流通数据', en: 'MOFCOM · Retail & Trade',
    type: 'web', kind: 'WEB · 官方', size: '—', docs: '560+ 指标',
    lastSync: '5月28日 09:00', cadence: 'weekly', status: 'ok', quality: 'A',
    note: '社会消费品零售总额 / 重点城市商品流通价格 / 生活必需品监测。',
    preview: { type: 'metrics', items: [
      { label: '社零总额 (4月)', value: '38,726', unit: '亿元', change: '+5.5% YoY', dir: 'up' },
      { label: '网上零售额 (1-4月)', value: '50,948', unit: '亿元', change: '+11.5% YoY', dir: 'up' },
      { label: '餐饮收入 (4月)', value: '4,782', unit: '亿元', change: '+12.4% YoY', dir: 'up' },
      { label: '汽车零售 (4月)', value: '4,260', unit: '亿元', change: '+7.1% YoY', dir: 'up' },
    ]},
  },

  // ── 内部数据源 ───────────────────────────────────────────────────────────
  {
    name: '内部销售数据库', en: 'Internal Sales DB',
    type: 'db', kind: 'PostgreSQL', size: '1.4 GB', docs: '~240k 行',
    lastSync: '5月31日 14:08', cadence: 'realtime', status: 'ok', quality: 'A',
    note: '只读连接。涵盖近 24 个月所有渠道 / 品类 / 城市维度销售数据。',
    preview: { type: 'metrics', items: [
      { label: 'MTD GMV (5月)', value: '2,840', unit: '万元', change: '+14.2% MoM', dir: 'up' },
      { label: '月订单量', value: '18,240', unit: '单', change: '+8.5% MoM', dir: 'up' },
      { label: '客单价', value: '1,558', unit: '元', change: '+5.2% YoY', dir: 'up' },
      { label: '退货率', value: '4.2', unit: '%', change: '-0.8pp MoM', dir: 'up' },
    ]},
  },
  {
    name: 'BigQuery · 用户行为日志', en: 'BigQuery · Event Log',
    type: 'db', kind: 'BigQuery', size: '83 GB', docs: '~84M 事件',
    lastSync: '5月31日 14:08', cadence: 'realtime', status: 'ok', quality: 'A',
    note: 'DAU / 留存 / 转化漏斗 / A/B 实验结果。分区表，按日查询成本约 $0.02。',
    preview: { type: 'metrics', items: [
      { label: 'DAU (昨日)', value: '84,230', unit: '', change: '+3.2% WoW', dir: 'up' },
      { label: '7日留存率', value: '38.4', unit: '%', change: '+1.2pp', dir: 'up' },
      { label: '30日留存率', value: '21.8', unit: '%', change: '+0.5pp', dir: 'up' },
      { label: '漏斗转化率', value: '6.8', unit: '%', change: '+0.3pp', dir: 'up' },
    ]},
  },
  {
    name: '团队 Notion 知识库', en: 'Team Notion Workspace',
    type: 'api', kind: 'NOTION · workspace', size: '—', docs: '1240+ 页',
    lastSync: '5月31日 13:55', cadence: 'realtime', status: 'ok', quality: 'B',
    note: '索引滞后约 15 分钟。含战略文档 / 产品 PRD / 竞品分析。',
    preview: { type: 'headlines', items: [
      { time: '5月31日', title: '2025 H2 战略规划 · 核心 OKR 草稿 v3', tag: '战略' },
      { time: '5月29日', title: '竞品 AI 功能对比：Notion AI / Perplexity / Atlas', tag: '竞品' },
      { time: '5月27日', title: '产品 PRD：报告生成引擎 v2 功能规格', tag: 'PRD' },
      { time: '5月24日', title: '用户调研总结：10 位 B 端用户深度访谈摘要', tag: '调研' },
    ]},
  },
  {
    name: '内部 CRM 客户数据库', en: 'Internal CRM Database',
    type: 'db', kind: 'MySQL', size: '280 MB', docs: '~18k 客户',
    lastSync: '5月31日 10:00', cadence: 'daily', status: 'ok', quality: 'A',
    note: '客户档案 / 合同金额 / 续约率。已脱敏处理，仅聚合维度可引用。',
    preview: { type: 'metrics', items: [
      { label: '活跃客户数', value: '12,840', unit: '家', change: '+420 MoM', dir: 'up' },
      { label: '年化续约率', value: '86.2', unit: '%', change: '+1.4pp YoY', dir: 'up' },
      { label: '平均合同额', value: '24.8', unit: '万元', change: '+8.2% YoY', dir: 'up' },
      { label: 'NPS 评分', value: '62', unit: '', change: '+5pt QoQ', dir: 'up' },
    ]},
  },
  {
    name: '客户访谈纪要 (Q1-Q2)', en: 'Customer Interview Transcripts',
    type: 'files', kind: 'FILES · 24 项', size: '4.6 MB', docs: 24,
    lastSync: '5月22日 11:22', cadence: 'manual', status: 'ok', quality: 'A',
    note: '已经过隐私脱敏。含深度访谈录音转写稿与结构化摘要。仅 Atlas 内部可见。',
    preview: { type: 'headlines', items: [
      { time: '05-18', title: '[访谈] 某头部券商研究院 VP：AI 报告生成的信任门槛', tag: '金融' },
      { time: '05-12', title: '[访谈] 快消品牌战略总监：每周报告需求与痛点调查', tag: '消费' },
      { time: '05-07', title: '[访谈] 创投机构 Partner：行研报告自动化的期望与顾虑', tag: '创投' },
      { time: '04-28', title: '[访谈] 咨询公司项目经理：从人工到 AI 辅助的迁移路径', tag: '咨询' },
    ]},
  },
  {
    name: 'J.D. Power 中国汽车研究', en: 'J.D. Power China Auto',
    type: 'files', kind: 'FILES · PDF', size: '24 MB', docs: 6,
    lastSync: '5月02日 09:10', cadence: 'manual', status: 'stale', quality: 'A',
    note: '上次更新已超 14 天，建议刷新。含 APEAL / IQS / VDS 三份年度研究报告。',
    preview: { type: 'table', cols: ['报告', '年份', '样本量', '核心发现'], rows: [
      ['中国汽车 APEAL 研究', '2024', '22,832 车主', '新能源品牌满意度大幅提升'],
      ['中国汽车 IQS 研究', '2024', '45,430 车主', 'PP100 质量问题创历史最低'],
      ['中国汽车 VDS 研究', '2023', '18,245 车主', '智能座舱故障占比 34%'],
    ]},
  },
  {
    name: '艾瑞咨询 · 行业研究报告', en: 'iResearch · Industry Reports',
    type: 'files', kind: 'FILES · PDF', size: '68 MB', docs: 22,
    lastSync: '5月26日 15:00', cadence: 'manual', status: 'ok', quality: 'A',
    note: '互联网 / 电商 / 移动端用户行为年度与季度报告。已整理为可检索文档。',
    preview: { type: 'headlines', items: [
      { time: '2025 Q1', title: '中国 AI 应用市场报告：月活用户破 4 亿，B 端渗透加速', tag: 'AI' },
      { time: '2025 Q1', title: '中国短视频 & 直播电商白皮书：GMV 突破 6 万亿', tag: '电商' },
      { time: '2024 年报', title: '中国移动互联网全景报告：用户规模趋于饱和，下沉攻坚', tag: '互联网' },
      { time: '2024 年报', title: '中国出行行业研究：网约车日均订单 4200 万单', tag: '出行' },
    ]},
  },
];

const STATUS_META = {
  ok:    { label: 'IN SYNC',   cn: '同步中',  color: '#2a8c5c' },
  warn:  { label: 'NEEDS ATT', cn: '待处理',  color: '#c2540a' },
  stale: { label: 'STALE',     cn: '已过期',  color: '#9b1c14' },
  off:   { label: 'OFFLINE',   cn: '未连接',  color: '#767368' },
};

const QUALITY_META = {
  A: { label: 'A · 高', color: '#0f0f0f' },
  B: { label: 'B · 中', color: '#767368' },
  C: { label: 'C · 低', color: '#9b1c14' },
};

// ── Add Source Modal ──────────────────────────────────────────────────────
function AddSourceModal({ t, onClose, onAdd }) {
  const [kind, setKind] = React.useState('web');
  const [name, setName] = React.useState('');
  const [quality, setQuality] = React.useState('A');
  const [noteVal, setNoteVal] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  // web
  const [url, setUrl] = React.useState('');
  const [crawlDepth, setCrawlDepth] = React.useState('page');
  const [keyword, setKeyword] = React.useState('');
  const [cadence, setCadence] = React.useState('每日');
  // api
  const [apiUrl, setApiUrl] = React.useState('');
  const [authType, setAuthType] = React.useState('none');
  const [apiKey, setApiKey] = React.useState('');
  const [testState, setTestState] = React.useState('idle');
  const [apiCadence, setApiCadence] = React.useState('每日');
  // db
  const [dbType, setDbType] = React.useState('PostgreSQL');
  const [connMode, setConnMode] = React.useState('string');
  const [connStr, setConnStr] = React.useState('');
  const [dbHost, setDbHost] = React.useState('');
  const [dbPort, setDbPort] = React.useState('');
  const [dbName, setDbName] = React.useState('');
  const [dbUser, setDbUser] = React.useState('');
  const [dbPass, setDbPass] = React.useState('');
  const [dbCadence, setDbCadence] = React.useState('每日');
  // files
  const [files, setFiles] = React.useState([]);
  const [dragOver, setDragOver] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const FILE_ACCEPT = '.pdf,.xlsx,.xls,.docx,.doc,.pptx,.ppt,.csv,.txt,.md,.json,.zip,.png,.jpg,.jpeg';
  const EXT_COLORS = { pdf:'#c0392b', xlsx:'#27ae60', xls:'#27ae60', docx:'#2980b9', doc:'#2980b9', pptx:'#e67e22', ppt:'#e67e22', csv:'#8e44ad', json:'#16a085', zip:'#7f8c8d' };
  const fmtSz = (b) => b < 1024 ? b+'B' : b < 1048576 ? (b/1024).toFixed(1)+'KB' : (b/1048576).toFixed(1)+'MB';

  const handleFiles = (fileList) => {
    const added = Array.from(fileList).map(f => ({ id: Date.now() + Math.random(), name: f.name, size: f.size }));
    setFiles(prev => [...prev, ...added]);
    if (!name.trim() && added.length > 0) setName(added[0].name.replace(/\.[^.]+$/, ''));
  };

  const canSave = () => {
    if (!name.trim()) return false;
    if (kind === 'web') return !!url.trim();
    if (kind === 'api') return !!apiUrl.trim();
    if (kind === 'db') return connMode === 'string' ? !!connStr.trim() : !!dbHost.trim();
    if (kind === 'files') return files.length > 0;
    return true;
  };

  const handleAdd = () => {
    if (!canSave() || saving) return;
    setSaving(true);
    setTimeout(() => {
      const kindLabels = { web: { page:'当前页', domain:'整站', deep:'多层' }, auth: { none:'公开', key:'API Key', bearer:'Bearer' } };
      let kindStr = '';
      let finalCadence = cadence;
      if (kind === 'web') { kindStr = `WEB · ${kindLabels.web[crawlDepth]}`; }
      else if (kind === 'api') { kindStr = `API · ${kindLabels.auth[authType]}`; finalCadence = apiCadence; }
      else if (kind === 'db') { kindStr = dbType; finalCadence = dbCadence; }
      else if (kind === 'files') { kindStr = `FILES · ${files.length} 项`; finalCadence = 'manual'; }
      onAdd({
        name: name.trim(), en: name.trim(), type: kind, kind: kindStr,
        lastSync: '刚刚', cadence: finalCadence, status: 'ok', quality,
        docs: kind === 'files' ? files.length : 0,
        size: kind === 'files' ? fmtSz(files.reduce((s, f) => s + f.size, 0)) : '—',
        note: noteVal.trim() || '已接入，等待首次同步。',
      });
      onClose();
    }, 900);
  };

  const inp = { border: `1px solid ${t.rule}`, padding: '7px 10px', fontFamily: t.fontCN, fontSize: 13, background: t.paper, color: t.ink, outline: 'none', width: '100%', boxSizing: 'border-box' };
  const lbl = { fontFamily: t.fontCN, fontSize: 12, color: t.mute, marginBottom: 5 };
  const muted = { fontFamily: t.fontMono, fontSize: 9, color: t.mute, opacity: 0.6 };

  const renderTypeFields = () => {
    if (kind === 'web') return (
      <React.Fragment>
        <div>
          <div style={lbl}>网页地址 *</div>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." style={inp}/>
        </div>
        <OptionRadio t={t} label="抓取范围" value={crawlDepth} onChange={setCrawlDepth}
          options={[['page','当前页'],['domain','整站'],['deep','多层']]}/>
        <div>
          <div style={lbl}>关键词过滤 <span style={muted}>(选填)</span></div>
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="例：竞品分析、用户评价" style={inp}/>
        </div>
        <OptionRadio t={t} label="同步频率" value={cadence} onChange={setCadence}
          options={[['每小时','时'],['每日','日'],['每周','周'],['手动','手动']]}/>
      </React.Fragment>
    );

    if (kind === 'api') return (
      <React.Fragment>
        <div>
          <div style={lbl}>接口地址 *</div>
          <input value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://api.example.com/v1/data" style={inp}/>
        </div>
        <OptionRadio t={t} label="认证方式" value={authType} onChange={setAuthType}
          options={[['none','无'],['key','API Key'],['bearer','Bearer Token']]}/>
        {authType !== 'none' && (
          <div>
            <div style={lbl}>{authType === 'key' ? 'API Key' : 'Bearer Token'}</div>
            <input value={apiKey} onChange={e => setApiKey(e.target.value)} type="password" placeholder="sk-…" style={inp}/>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button"
            onClick={() => { setTestState('testing'); setTimeout(() => setTestState('ok'), 1200 + Math.random() * 600); }}
            disabled={!apiUrl.trim() || testState === 'testing'}
            style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 0.8, padding: '5px 14px', border: `1px solid ${testState==='ok'?'#2a8c5c':testState==='fail'?'#c0392b':t.ink}`, background: 'transparent', color: testState==='ok'?'#2a8c5c':testState==='fail'?'#c0392b':t.ink, cursor: 'pointer' }}>
            {testState === 'testing' ? '测试中…' : testState === 'ok' ? '✓ 连接正常' : testState === 'fail' ? '✕ 连接失败' : '测试连接'}
          </button>
          {testState === 'ok' && <span style={{ fontFamily: t.fontMono, fontSize: 9, color: '#2a8c5c' }}>响应正常</span>}
        </div>
        <OptionRadio t={t} label="同步频率" value={apiCadence} onChange={setApiCadence}
          options={[['每小时','时'],['每日','日'],['每周','周']]}/>
      </React.Fragment>
    );

    if (kind === 'db') return (
      <React.Fragment>
        <OptionRadio t={t} label="数据库类型" value={dbType} onChange={setDbType}
          options={[['PostgreSQL','PG'],['MySQL','MySQL'],['BigQuery','BQ'],['MongoDB','Mongo'],['Snowflake','Snow']]}/>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['string','连接字符串'],['fields','分项填写']].map(([v, l]) => (
            <button key={v} type="button" onClick={() => setConnMode(v)}
              style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 0.8, padding: '4px 10px', border: `1px solid ${connMode===v?t.ink:t.rule}`, background: connMode===v?t.ink:'transparent', color: connMode===v?t.paper:t.mute, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
        {connMode === 'string' ? (
          <div>
            <div style={lbl}>连接字符串 *</div>
            <input value={connStr} onChange={e => setConnStr(e.target.value)} placeholder="postgresql://user:pass@host:5432/db" style={inp}/>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 84px', gap: 8 }}>
              <div><div style={lbl}>主机 *</div><input value={dbHost} onChange={e=>setDbHost(e.target.value)} placeholder="localhost" style={inp}/></div>
              <div><div style={lbl}>端口</div><input value={dbPort} onChange={e=>setDbPort(e.target.value)} placeholder="5432" style={inp}/></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <div><div style={lbl}>数据库名</div><input value={dbName} onChange={e=>setDbName(e.target.value)} placeholder="mydb" style={inp}/></div>
              <div><div style={lbl}>用户名</div><input value={dbUser} onChange={e=>setDbUser(e.target.value)} placeholder="admin" style={inp}/></div>
              <div><div style={lbl}>密码</div><input value={dbPass} onChange={e=>setDbPass(e.target.value)} type="password" placeholder="••••••" style={inp}/></div>
            </div>
          </div>
        )}
        <OptionRadio t={t} label="同步频率" value={dbCadence} onChange={setDbCadence}
          options={[['每小时','时'],['每日','日'],['每周','周']]}/>
      </React.Fragment>
    );

    if (kind === 'files') return (
      <React.Fragment>
        <input ref={fileInputRef} type="file" multiple accept={FILE_ACCEPT} style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}/>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
          style={{ border: `1.5px dashed ${dragOver ? t.ink : t.rule}`, padding: '22px 16px', textAlign: 'center', cursor: 'pointer', background: dragOver ? t.faint : 'transparent', transition: 'all 0.12s' }}>
          <div style={{ fontFamily: t.fontMono, fontSize: 10, color: dragOver ? t.ink : t.mute, letterSpacing: 0.8, marginBottom: 6 }}>拖拽文件或点击上传</div>
          <div style={{ fontFamily: t.fontMono, fontSize: 8, color: t.mute, lineHeight: 2, opacity: 0.7 }}>
            PDF · XLSX · XLS · DOCX · DOC · PPTX · PPT<br/>CSV · TXT · MD · JSON · ZIP · PNG · JPG
          </div>
        </div>
        {files.length > 0 && (
          <div style={{ border: `1px solid ${t.rule}`, maxHeight: 150, overflowY: 'auto' }}>
            {files.map(f => {
              const ext = f.name.split('.').pop().toLowerCase();
              const bg = EXT_COLORS[ext] || '#555';
              return (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderBottom: `1px solid ${t.rule}` }}>
                  <span style={{ fontFamily: t.fontMono, fontSize: 8, background: bg, color: '#fff', padding: '1px 5px', flexShrink: 0, borderRadius: 1 }}>{ext.toUpperCase()}</span>
                  <span style={{ flex: 1, fontFamily: t.fontCN, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: t.ink }}>{f.name}</span>
                  <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, flexShrink: 0 }}>{fmtSz(f.size)}</span>
                  <button type="button" onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.mute, fontSize: 15, padding: '0 2px', lineHeight: 1 }}>×</button>
                </div>
              );
            })}
            <div style={{ padding: '5px 10px', fontFamily: t.fontMono, fontSize: 8, color: t.mute, letterSpacing: 0.5 }}>
              共 {files.length} 个文件 · {fmtSz(files.reduce((s, f) => s + f.size, 0))}
            </div>
          </div>
        )}
        <div style={{ fontFamily: t.fontCN, fontSize: 12, color: t.mute }}>同步方式：<span style={{ color: t.ink }}>手动上传</span></div>
      </React.Fragment>
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,15,15,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: t.paper, border: `1.5px solid ${t.ink}`, width: '100%', maxWidth: 500, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1.5px solid ${t.ink}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Tag t={t} accent>＋ ADD SOURCE · 添加数据源</Tag>
          <span style={{ flex: 1 }}/>
          <button type="button" onClick={onClose} style={{ border: `1px solid ${t.ink}`, background: t.paper, padding: '3px 8px', fontFamily: t.fontMono, fontSize: 11, cursor: 'pointer', color: t.ink }}>ESC</button>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', flex: 1 }}>
          <OptionRadio t={t} label="数据源类型" value={kind} onChange={v => { setKind(v); setTestState('idle'); }}
            options={[['web','网页'],['api','API'],['db','数据库'],['files','文件']]}/>
          <div>
            <div style={lbl}>数据源名称 *</div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="例：产品用户反馈库" style={inp}/>
          </div>
          {renderTypeFields()}
          <OptionRadio t={t} label="数据质量" value={quality} onChange={setQuality}
            options={[['A','A · 高'],['B','B · 中'],['C','C · 低']]}/>
          <div>
            <div style={lbl}>备注 <span style={muted}>(选填)</span></div>
            <input value={noteVal} onChange={e => setNoteVal(e.target.value)} placeholder="说明数据范围、限制或注意事项" style={inp}/>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 6, borderTop: `1px solid ${t.rule}`, flexShrink: 0 }}>
            <Btn t={t} size="md" onClick={onClose}>取消</Btn>
            <Btn t={t} size="md" primary accent onClick={handleAdd} disabled={!canSave() || saving}>{saving ? '接入中…' : '确认接入 ↗'}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── References Drawer ──────────────────────────────────────────────────────
function RefsDrawer({ t, src, onClose }) {
  const refs = Array.from({ length: Math.min(src.docs || 6, 10) }, (_, i) => ({
    n: i + 1,
    title: `${src.name}文档 #${String(i+1).padStart(3,'0')} — ${['分析报告','数据集','行业综述','调研报告','市场数据','用户研究','竞品分析','技术白皮书','年度报告','专家访谈'][i % 10]}`,
    date: `2025.${String(Math.floor(Math.random()*12)+1).padStart(2,'0')}.${String(Math.floor(Math.random()*28)+1).padStart(2,'0')}`,
    used: Math.random() > 0.4,
  }));
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(15,15,15,0.5)', display:'flex', justifyContent:'flex-end' }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:t.paper, border:`1.5px solid ${t.ink}`, width:400, display:'flex', flexDirection:'column', height:'100%' }}>
        <div style={{ padding:'14px 20px', borderBottom:`1.5px solid ${t.ink}`, display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <Tag t={t} accent>◆ REFERENCES</Tag>
          <span style={{ fontFamily:t.fontCN, fontSize:13, fontWeight:600 }}>{src.name}</span>
          <span style={{ flex:1 }}/>
          <button onClick={onClose} style={{ border:`1px solid ${t.ink}`, background:t.paper, padding:'3px 8px', fontFamily:t.fontMono, fontSize:11, cursor:'pointer', color:t.ink }}>✕</button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'12px 20px', display:'flex', flexDirection:'column', gap:8 }}>
          {refs.map(r => (
            <div key={r.n} style={{ padding:'10px 12px', border:`1px solid ${t.rule}`, background:r.used?t.faint:'transparent', display:'flex', gap:10, alignItems:'flex-start' }}>
              <span style={{ fontFamily:t.fontMono, fontSize:10, color:t.accent, fontWeight:700, minWidth:24 }}>#{r.n}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:t.fontCN, fontSize:12, color:t.ink, lineHeight:1.45 }}>{r.title}</div>
                <div style={{ fontFamily:t.fontMono, fontSize:9, color:t.mute, marginTop:3 }}>{r.date} {r.used && '· 已在报告中引用'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Edit Access Modal ──────────────────────────────────────────────────────
function EditAccessModal({ t, src, onClose, onSave }) {
  const [level, setLevel] = React.useState('team');
  const [allowedModels, setAllowedModels] = React.useState(true);
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(15,15,15,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:40 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:t.paper, border:`1.5px solid ${t.ink}`, width:'100%', maxWidth:400, display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'14px 20px', borderBottom:`1.5px solid ${t.ink}`, display:'flex', alignItems:'center', gap:10 }}>
          <Tag t={t}>EDIT ACCESS</Tag>
          <span style={{ fontFamily:t.fontCN, fontSize:13, fontWeight:600, flex:1 }}>{src.name}</span>
          <button onClick={onClose} style={{ border:`1px solid ${t.ink}`, background:t.paper, padding:'3px 8px', fontFamily:t.fontMono, fontSize:11, cursor:'pointer', color:t.ink }}>ESC</button>
        </div>
        <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:14 }}>
          <OptionRadio t={t} label="访问级别" value={level} onChange={setLevel}
            options={[['owner','管理员'],['team','团队'],['read','只读']]}/>
          <OptionToggle t={t} label="允许 AI 模型读取此数据源" value={allowedModels} onChange={setAllowedModels}/>
          <OptionToggle t={t} label="在报告中自动引用" value={true} onChange={null}/>
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', paddingTop:6, borderTop:`1px solid ${t.rule}` }}>
            <Btn t={t} size="md" onClick={onClose}>取消</Btn>
            <Btn t={t} size="md" primary accent onClick={() => { onSave && onSave(level); onClose(); }}>保存</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sources({ t }) {
  const { can } = usePermission();
  const canManage = can('source_manage');
  const canSync = can('sync');
  const [cat, setCat] = React.useState('all');
  const [sourceList, setSourceList] = React.useState(SOURCES);
  const [syncingAll, setSyncingAll] = React.useState(false);
  const [syncAllDone, setSyncAllDone] = React.useState(false);
  const [showAdd, setShowAdd] = React.useState(false);

  // Compute real citation counts from saved reports
  const usageCounts = React.useMemo(() => {
    try {
      const reports = JSON.parse(localStorage.getItem('atlas_saved_reports') || '[]');
      const counts = {};
      reports.forEach(r => {
        (r.selectedSources || []).forEach(name => {
          counts[name] = (counts[name] || 0) + 1;
        });
      });
      return counts;
    } catch { return {}; }
  }, []);

  const filtered = sourceList.filter(s => cat === 'all' || s.type === cat);
  const total = sourceList.length;
  const warn = sourceList.filter(s => s.status === 'warn' || s.status === 'stale').length;

  const handleSyncAll = () => {
    setSyncingAll(true);
    setSyncAllDone(false);
    setTimeout(() => {
      setSyncingAll(false);
      setSyncAllDone(true);
      setSourceList(prev => prev.map(s => ({ ...s, status: 'ok', lastSync: '刚刚' })));
      setTimeout(() => setSyncAllDone(false), 3000);
    }, 2200);
  };

  const handleAdd = (newSrc) => {
    setSourceList(prev => [newSrc, ...prev]);
  };

  const handleDisconnect = (name) => {
    setSourceList(prev => prev.filter(s => s.name !== name));
  };

  return (
    <div style={{ flex: 1, background: t.paper, color: t.ink, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '32px 36px 20px', borderBottom: `2px solid ${t.ink}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32 }}>
        <div>
          <Tag t={t} accent>◆ SOURCES · 数据源</Tag>
          <div style={{ fontFamily: t.fontDisplay, fontWeight: 900, fontSize: 56, lineHeight: 0.96, letterSpacing: -1.6, marginTop: 14 }}>
            Where the<br/>
            <span style={{ fontFamily: t.fontSerif, fontStyle: 'italic', fontWeight: 500, color: t.accent }}>essays</span> come from.
          </div>
          <div style={{ fontFamily: t.fontCN, fontSize: 15, color: t.mute, marginTop: 10, maxWidth: 480 }}>
            Atlas 接入的数据库、文件库、网络抓取和 API。每次撰写都会自动选择最相关的来源。
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 18, paddingLeft: 24, borderLeft: `1px solid ${t.rule}` }}>
          <Metric value={total} en="SOURCES" cn="数据源" t={t}/>
          <Metric value="14,196" en="DOCS" cn="文档" t={t}/>
          <Metric value={warn} en="ATTN" cn="待处理" t={t} accent={warn > 0}/>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding: '14px 36px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${t.rule}` }}>
        {SOURCE_CATEGORIES.map(c => (
          <button key={c.k} type="button" onClick={() => setCat(c.k)} style={{
            padding: '6px 12px', border: `1px solid ${cat === c.k ? t.ink : t.rule}`,
            background: cat === c.k ? t.ink : 'transparent',
            color: cat === c.k ? t.paper : t.ink,
            fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 10,
            letterSpacing: 1.2, textTransform: 'uppercase', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <span>{c.en}</span>
            <span style={{ fontFamily: t.fontCN, opacity: 0.7 }}>{c.cn}</span>
            <span style={{ fontFamily: t.fontMono, fontSize: 9, opacity: 0.7 }}>{c.count}</span>
          </button>
        ))}
        <span style={{ flex: 1 }}/>
        {canSync && (
          <Btn t={t} size="sm" onClick={handleSyncAll} disabled={syncingAll}
            style={syncAllDone ? { color: '#10b981', borderColor: '#10b981' } : {}}>
            {syncingAll ? '⟳ 同步中…' : syncAllDone ? '✓ 全部同步完成' : '⟳ SYNC ALL · 全部同步'}
          </Btn>
        )}
        {canManage
          ? <Btn t={t} size="sm" primary accent onClick={() => setShowAdd(true)}>＋ ADD SOURCE · 添加</Btn>
          : <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>只读 · 无数据源管理权限</span>}
      </div>

      {/* Table */}
      <div style={{ padding: '0 36px 48px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '48px 1.7fr 110px 1fr 1fr 90px 80px 28px',
          alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1.5px solid ${t.ink}`,
          fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.2, color: t.mute, textTransform: 'uppercase',
        }}>
          <span>—</span><span>Source · 名称</span><span>Kind · 类型</span>
          <span>Last sync · 上次同步</span><span>Status · 状态</span>
          <span>Quality</span><span>被引用</span><span/>
        </div>
        {filtered.map((s, i) => (
          <SourceRow key={s.name} src={s} t={t} index={i} usageCount={usageCounts[s.name] || 0} onDisconnect={() => handleDisconnect(s.name)}/>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '32px 0', textAlign: 'center', fontFamily: t.fontCN, fontSize: 13, color: t.mute }}>
            没有符合条件的数据源
          </div>
        )}
      </div>

      {showAdd && <AddSourceModal t={t} onClose={() => setShowAdd(false)} onAdd={handleAdd}/>}
    </div>
  );
}

function SourcePreview({ t, preview }) {
  if (!preview) return null;
  const hdrStyle = {
    padding: '6px 12px', borderBottom: `1px solid ${t.rule}`,
    fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.5, color: t.mute,
  };
  if (preview.type === 'headlines') {
    return (
      <div style={{ border: `1px solid ${t.rule}`, marginTop: 8 }}>
        <div style={hdrStyle}>PREVIEW · LATEST ITEMS</div>
        {preview.items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px',
            borderBottom: i < preview.items.length - 1 ? `1px solid ${t.rule}` : 'none',
          }}>
            <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, flexShrink: 0, marginTop: 2, minWidth: 52 }}>{item.time}</span>
            <span style={{ fontFamily: t.fontCN, fontSize: 12, color: t.ink, lineHeight: 1.5, flex: 1 }}>{item.title}</span>
            {item.tag && <span style={{ fontFamily: t.fontMono, fontSize: 9, padding: '2px 6px', border: `1px solid ${t.rule}`, color: t.mute, flexShrink: 0, letterSpacing: 0.8 }}>{item.tag}</span>}
          </div>
        ))}
      </div>
    );
  }
  if (preview.type === 'metrics') {
    return (
      <div style={{ border: `1px solid ${t.rule}`, marginTop: 8 }}>
        <div style={hdrStyle}>PREVIEW · KEY METRICS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))' }}>
          {preview.items.map((item, i) => (
            <div key={i} style={{ padding: '10px 14px', borderRight: `1px solid ${t.rule}`, borderBottom: `1px solid ${t.rule}` }}>
              <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 0.8, marginBottom: 5 }}>{item.label}</div>
              <div style={{ fontFamily: t.fontMono, fontSize: 16, fontWeight: 700, color: t.ink, lineHeight: 1 }}>
                {item.value}
                {item.unit && <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 3, color: t.inkSoft }}>{item.unit}</span>}
              </div>
              {item.change && (
                <div style={{ fontFamily: t.fontMono, fontSize: 9, marginTop: 4, color: item.dir === 'up' ? '#2a8c5c' : item.dir === 'down' ? '#9b1c14' : t.mute }}>
                  {item.change}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (preview.type === 'table') {
    return (
      <div style={{ border: `1px solid ${t.rule}`, marginTop: 8, overflowX: 'auto' }}>
        <div style={hdrStyle}>PREVIEW · SAMPLE DATA</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1.5px solid ${t.ink}` }}>
              {preview.cols.map((c, i) => (
                <th key={i} style={{ padding: '7px 12px', textAlign: 'left', fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1, color: t.mute, fontWeight: 700, whiteSpace: 'nowrap' }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: `1px solid ${t.rule}` }}
                onMouseEnter={e => e.currentTarget.style.background = t.faint}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: '8px 12px', fontFamily: ci === 0 ? t.fontCN : t.fontMono, fontSize: ci === 0 ? 12 : 11, color: t.ink, whiteSpace: 'nowrap' }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return null;
}

function SourceRow({ src, t, index, usageCount = 0, onDisconnect }) {
  const [open, setOpen] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const [syncDone, setSyncDone] = React.useState(false);
  const [showRefs, setShowRefs] = React.useState(false);
  const [showAccess, setShowAccess] = React.useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const [srcData, setSrcData] = React.useState(src);

  const status = STATUS_META[srcData.status] || STATUS_META.off;
  const quality = QUALITY_META[srcData.quality] || QUALITY_META.B;

  const handleSync = (e) => {
    e.stopPropagation();
    setSyncing(true); setSyncDone(false);
    setTimeout(() => {
      setSyncing(false); setSyncDone(true);
      setSrcData(prev => ({ ...prev, status: 'ok', lastSync: '刚刚' }));
      setTimeout(() => setSyncDone(false), 2500);
    }, 1800);
  };

  return (
    <div style={{ borderBottom: `1px solid ${t.rule}` }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display: 'grid', gridTemplateColumns: '48px 1.7fr 110px 1fr 1fr 90px 80px 28px',
        alignItems: 'center', gap: 12, padding: '14px 0', cursor: 'pointer',
      }}
        onMouseEnter={e => e.currentTarget.style.background = t.faint}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <SourceIcon t={t} kind={srcData.type}/>
        <div>
          <div style={{ fontFamily: t.fontCN, fontSize: 14, fontWeight: 600 }}>{srcData.name}</div>
          <div style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, marginTop: 2 }}>{srcData.en}</div>
        </div>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.ink, letterSpacing: 0.5 }}>{srcData.kind}</span>
        <span style={{ fontFamily: t.fontMono, fontSize: 11, color: t.ink }}>
          {srcData.lastSync}
          <span style={{ display: 'block', fontSize: 9, color: t.mute, marginTop: 2 }}>{srcData.cadence}</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 8, background: status.color,
            animation: syncing ? 'essay-pulse 1s infinite' : 'none' }}/>
          <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.ink, letterSpacing: 1 }}>
            {syncing ? 'SYNCING' : status.label}
          </span>
        </span>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: quality.color, letterSpacing: 1, fontWeight: 700 }}>{quality.label}</span>
        <span style={{ fontFamily: t.fontMono, fontSize: 11, color: usageCount > 0 ? t.ink : t.mute }}>
          {usageCount > 0 ? `${usageCount} 次` : '—'}
        </span>
        <span style={{ fontFamily: t.fontMono, fontSize: 12, color: t.mute, transition: 'transform 0.15s', transform: `rotate(${open ? 90 : 0}deg)` }}>›</span>
      </div>

      {open && (
        <div style={{ padding: '14px 0 22px 60px', display: 'flex', flexDirection: 'column', gap: 12, borderTop: `1px dashed ${t.rule}`, background: t.paperAlt }}>
          {srcData.note && (
            <div style={{ fontFamily: t.fontCN, fontSize: 13, lineHeight: 1.6, color: t.inkSoft, maxWidth: 720 }}>
              {srcData.note}
            </div>
          )}
          {!confirmDisconnect ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <Btn t={t} size="sm" onClick={handleSync} disabled={syncing}
                style={syncDone ? { color: '#10b981', borderColor: '#10b981' } : {}}>
                {syncing ? '⟳ 同步中…' : syncDone ? '✓ 同步完成' : '⟳ Sync now'}
              </Btn>
              {srcData.preview && (
                <Btn t={t} size="sm"
                  style={showPreview ? { background: t.ink, color: t.paper } : {}}
                  onClick={e => { e.stopPropagation(); setShowPreview(v => !v); }}>
                  {showPreview ? '▴ 收起预览' : '◉ 数据预览'}
                </Btn>
              )}
              <Btn t={t} size="sm" onClick={e => { e.stopPropagation(); setShowRefs(true); }}>
                {usageCount > 0 ? `已引用 ${usageCount} 篇报告` : '暂无引用记录'}
              </Btn>
              <Btn t={t} size="sm" onClick={e => { e.stopPropagation(); setShowAccess(true); }}>
                Edit access
              </Btn>
              <Btn t={t} size="sm" accent onClick={e => { e.stopPropagation(); setConfirmDisconnect(true); }}>
                Disconnect
              </Btn>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: t.fontCN, fontSize: 13, color: '#e5251d' }}>
                确定要断开「{srcData.name}」的连接？此操作不可撤销。
              </span>
              <Btn t={t} size="sm" onClick={e => { e.stopPropagation(); setConfirmDisconnect(false); }}>取消</Btn>
              <Btn t={t} size="sm" accent onClick={e => { e.stopPropagation(); onDisconnect && onDisconnect(); }}>确认断开</Btn>
            </div>
          )}
          {showPreview && <SourcePreview t={t} preview={srcData.preview}/>}
        </div>
      )}

      {showRefs && <RefsDrawer t={t} src={srcData} onClose={() => setShowRefs(false)}/>}
      {showAccess && <EditAccessModal t={t} src={srcData} onClose={() => setShowAccess(false)} onSave={(lvl) => setSrcData(prev => ({ ...prev, accessLevel: lvl }))}/>}
    </div>
  );
}

function SourceIcon({ t, kind }) {
  const map = {
    web:   { symbol: '◐', label: 'W' },
    api:   { symbol: '⌖', label: 'A' },
    db:    { symbol: '▦', label: 'D' },
    files: { symbol: '◇', label: 'F' },
  };
  const m = map[kind] || map.files;
  return (
    <div style={{
      width: 32, height: 32, border: `1.5px solid ${t.ink}`, background: t.cardOn,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 14, color: t.ink,
    }}>{m.symbol}</div>
  );
}

// ─── Export modal ─────────────────────────────────────────────────────

const EXPORT_FORMATS = [
  { k: 'pdf',    en: 'PDF',      cn: '便于打印 / 邮件附件', size: '~ 480 KB · 8 页', recommended: true },
  { k: 'docx',   en: 'DOCX',    cn: '继续在 Word 编辑',    size: '~ 320 KB' },
  { k: 'md',     en: 'Markdown', cn: '纯文本，含元数据',    size: '~ 18 KB' },
  { k: 'notion', en: 'NOTION',  cn: '复制 Markdown 到 Notion', size: '一键粘贴' },
  { k: 'link',   en: 'LINK',    cn: '复制分享链接',         size: '存于本地' },
];

// ── Export helper functions ─────────────────────────────────────────────
function _dlBlob(blob, name) {
  const u = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: u, download: name });
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(u); }, 120);
}
function _esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function _slug(s) { return String(s||'report').slice(0,40).replace(/[^\w一-鿿]+/g,'-').replace(/^-|-$/g,'').toLowerCase() || 'report'; }

function _loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = () => rej(new Error('脚本加载失败: ' + src));
    document.head.appendChild(s);
  });
}

// ── Build inline report HTML (rendered in current document, for html2canvas) ──
// Fixed export palette (html2canvas-safe: no gradients / rotated text / fragile opacity)
const _XC = { ink: '#0f0f0f', soft: '#333333', mute: '#999999', rule: '#dddddd', accent: '#e5251d', accentLite: '#fbe4e2', paper: '#ffffff' };
const _XPAL = ['#e5251d', '#1d4ed8', '#1f6f44', '#c2540a', '#7c3aed', '#0891b2', '#b45309', '#be185d'];
const _nf = (v) => { const n = Number(v); return isNaN(n) ? String(v ?? '') : n.toLocaleString(); };
const _svgTag = (vw, vh, inner) => `<svg viewBox="0 0 ${vw} ${vh}" width="100%" style="display:block;height:auto" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
const _CN = "'Noto Sans SC',sans-serif", _MO = "'IBM Plex Mono',monospace";

// Produce a faithful SVG string for non-bar chart types; '' if unsupported.
function _chartSVG(cd) {
  const items = cd.data || [];
  if (!items.length) return '';
  const type = cd.type;

  if (type === 'column') {
    const max = Math.max(...items.map(d => +d.value || 0), 0.001);
    const VW = 500, VH = 210, pL = 44, pR = 16, pT = 20, pB = 48, cW = VW - pL - pR, cH = VH - pT - pB, n = items.length, slotW = cW / n, barW = Math.min(slotW * 0.62, 52);
    let g = '';
    [0.25, 0.5, 0.75, 1].forEach(f => { const y = pT + cH * (1 - f), v = Math.round(max * f); g += `<line x1="${pL}" y1="${y}" x2="${VW - pR}" y2="${y}" stroke="${_XC.rule}" stroke-width="0.5"/><text x="${pL - 4}" y="${y + 3.5}" text-anchor="end" fill="${_XC.mute}" font-size="8" font-family="${_MO}">${_nf(v)}</text>`; });
    items.forEach((it, i) => { const v = +it.value || 0, bh = (v / max) * cH, x = pL + i * slotW + (slotW - barW) / 2, y = pT + cH - bh; g += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" fill="${_XPAL[i % _XPAL.length]}" opacity="0.88"/>`; if (bh > 14) g += `<text x="${(x + barW / 2).toFixed(1)}" y="${(y - 4).toFixed(1)}" text-anchor="middle" fill="${_XC.ink}" font-size="8" font-family="${_MO}" font-weight="700">${_nf(v)}</text>`; g += `<text x="${(x + barW / 2).toFixed(1)}" y="${pT + cH + 14}" text-anchor="middle" fill="${_XC.soft}" font-size="9" font-family="${_CN}">${_esc(String(it.label || '').slice(0, 6))}</text>`; });
    g += `<line x1="${pL}" y1="${pT + cH}" x2="${VW - pR}" y2="${pT + cH}" stroke="${_XC.ink}" stroke-width="1"/><line x1="${pL}" y1="${pT}" x2="${pL}" y2="${pT + cH}" stroke="${_XC.ink}" stroke-width="0.5"/>`;
    return _svgTag(VW, VH, g);
  }

  if (type === 'line') {
    if (items.length < 2) return '';
    const max = Math.max(...items.map(d => +d.value || 0), 0.001);
    const VW = 500, VH = 210, pL = 44, pR = 16, pT = 20, pB = 48, cW = VW - pL - pR, cH = VH - pT - pB, n = items.length;
    const pts = items.map((it, i) => ({ x: pL + (i / (n - 1)) * cW, y: pT + cH - ((+it.value || 0) / max) * cH, label: it.label, value: +it.value || 0 }));
    let g = '';
    [0.25, 0.5, 0.75, 1].forEach(f => { const y = pT + cH * (1 - f), v = Math.round(max * f); g += `<line x1="${pL}" y1="${y}" x2="${VW - pR}" y2="${y}" stroke="${_XC.rule}" stroke-width="0.5" stroke-dasharray="3,3"/><text x="${pL - 4}" y="${y + 3.5}" text-anchor="end" fill="${_XC.mute}" font-size="8" font-family="${_MO}">${_nf(v)}</text>`; });
    g += `<polyline points="${pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}" fill="none" stroke="${_XC.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    pts.forEach(p => { g += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="${_XC.accent}" stroke="${_XC.paper}" stroke-width="1.5"/><text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" text-anchor="middle" fill="${_XC.ink}" font-size="8" font-family="${_MO}" font-weight="700">${_nf(p.value)}</text><text x="${p.x.toFixed(1)}" y="${pT + cH + 14}" text-anchor="middle" fill="${_XC.soft}" font-size="9" font-family="${_CN}">${_esc(String(p.label || '').slice(0, 5))}</text>`; });
    g += `<line x1="${pL}" y1="${pT + cH}" x2="${VW - pR}" y2="${pT + cH}" stroke="${_XC.ink}" stroke-width="1"/><line x1="${pL}" y1="${pT}" x2="${pL}" y2="${pT + cH}" stroke="${_XC.ink}" stroke-width="0.5"/>`;
    return _svgTag(VW, VH, g);
  }

  if (type === 'donut') {
    const total = items.reduce((s, d) => s + (+d.value || 0), 0) || 1;
    const VW = 460, VH = 200, cx = 105, cy = 100, R = 80, r = 50;
    let angle = -Math.PI / 2, g = '';
    items.forEach((it, i) => {
      const sweep = ((+it.value || 0) / total) * 2 * Math.PI, sa = angle, ea = angle + sweep; angle = ea;
      const large = sweep > Math.PI ? 1 : 0, c1 = Math.cos(sa), s1 = Math.sin(sa), c2 = Math.cos(ea), s2 = Math.sin(ea);
      g += `<path d="M${(cx + R * c1).toFixed(2)},${(cy + R * s1).toFixed(2)} A${R},${R},0,${large},1,${(cx + R * c2).toFixed(2)},${(cy + R * s2).toFixed(2)} L${(cx + r * c2).toFixed(2)},${(cy + r * s2).toFixed(2)} A${r},${r},0,${large},0,${(cx + r * c1).toFixed(2)},${(cy + r * s1).toFixed(2)} Z" fill="${_XPAL[i % _XPAL.length]}" opacity="0.9"/>`;
    });
    g += `<text x="${cx}" y="${cy - 7}" text-anchor="middle" fill="${_XC.ink}" font-size="16" font-family="${_MO}" font-weight="700">${_nf(total)}</text><text x="${cx}" y="${cy + 10}" text-anchor="middle" fill="${_XC.mute}" font-size="8" font-family="${_MO}">${_esc(cd.unit || 'TOTAL')}</text>`;
    items.forEach((it, i) => { const pct = Math.round(((+it.value || 0) / total) * 100), y = 10 + i * 23; g += `<rect x="225" y="${y}" width="10" height="10" fill="${_XPAL[i % _XPAL.length]}" rx="2"/><text x="240" y="${y + 9}" fill="${_XC.soft}" font-size="10" font-family="${_CN}">${_esc(String(it.label || ''))}</text><text x="445" y="${y + 9}" text-anchor="end" fill="${_XC.ink}" font-size="9" font-family="${_MO}" font-weight="700">${pct}%</text>`; });
    return _svgTag(VW, VH, g);
  }

  if (type === 'scatter') {
    const xs = items.map(d => +d.x || 0), ys = items.map(d => +d.y || 0);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys), rX = maxX - minX || 1, rY = maxY - minY || 1;
    const VW = 500, VH = 230, pL = 52, pR = 20, pT = 20, pB = 52, cW = VW - pL - pR, cH = VH - pT - pB;
    const toX = v => pL + ((v - minX) / rX) * cW, toY = v => pT + cH - ((v - minY) / rY) * cH;
    let g = '';
    [0, 0.25, 0.5, 0.75, 1].forEach(f => { g += `<line x1="${pL}" y1="${pT + cH * (1 - f)}" x2="${VW - pR}" y2="${pT + cH * (1 - f)}" stroke="${_XC.rule}" stroke-width="0.5" stroke-dasharray="2,3"/><line x1="${pL + cW * f}" y1="${pT}" x2="${pL + cW * f}" y2="${pT + cH}" stroke="${_XC.rule}" stroke-width="0.5" stroke-dasharray="2,3"/>`; });
    g += `<line x1="${pL}" y1="${pT + cH}" x2="${VW - pR}" y2="${pT + cH}" stroke="${_XC.ink}" stroke-width="1"/><line x1="${pL}" y1="${pT}" x2="${pL}" y2="${pT + cH}" stroke="${_XC.ink}" stroke-width="1"/>`;
    g += `<text x="${pL}" y="${pT + cH + 14}" text-anchor="middle" fill="${_XC.mute}" font-size="8" font-family="${_MO}">${_nf(minX)}</text><text x="${VW - pR}" y="${pT + cH + 14}" text-anchor="middle" fill="${_XC.mute}" font-size="8" font-family="${_MO}">${_nf(maxX)}</text><text x="${pL - 4}" y="${pT + 3}" text-anchor="end" fill="${_XC.mute}" font-size="8" font-family="${_MO}">${_nf(maxY)}</text>`;
    if (cd.xUnit) g += `<text x="${VW / 2}" y="${VH - 4}" text-anchor="middle" fill="${_XC.mute}" font-size="8" font-family="${_MO}">${_esc(cd.xUnit)}</text>`;
    if (cd.yUnit) g += `<text x="${pL - 44}" y="${pT - 6}" text-anchor="start" fill="${_XC.mute}" font-size="8" font-family="${_MO}">${_esc(cd.yUnit)}</text>`;
    items.forEach((it, i) => { const px = toX(+it.x || 0), py = toY(+it.y || 0); g += `<circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="5" fill="${_XPAL[i % _XPAL.length]}" opacity="0.85" stroke="${_XC.paper}" stroke-width="1.5"/>`; if (it.label) g += `<text x="${px.toFixed(2)}" y="${(py - 9).toFixed(2)}" text-anchor="middle" fill="${_XC.soft}" font-size="8" font-family="${_CN}">${_esc(String(it.label))}</text>`; });
    return _svgTag(VW, VH, g);
  }

  if (type === 'radar') {
    if (items.length < 3) return '';
    const max = cd.maxValue || Math.max(...items.map(d => +d.value || 0), 0.001), n = items.length;
    const VW = 360, VH = 300, cx = VW / 2, cy = VH / 2 + 4, R = 108;
    const ang = i => -Math.PI / 2 + (i / n) * 2 * Math.PI, px = (i, rr) => cx + rr * Math.cos(ang(i)), py = (i, rr) => cy + rr * Math.sin(ang(i));
    let g = '';
    [0.25, 0.5, 0.75, 1].forEach(f => { g += `<polygon points="${items.map((_, i) => `${px(i, R * f).toFixed(2)},${py(i, R * f).toFixed(2)}`).join(' ')}" fill="none" stroke="${_XC.rule}" stroke-width="${f === 1 ? 1 : 0.5}"/>`; });
    items.forEach((_, i) => { g += `<line x1="${cx}" y1="${cy}" x2="${px(i, R).toFixed(2)}" y2="${py(i, R).toFixed(2)}" stroke="${_XC.rule}" stroke-width="0.5"/>`; });
    g += `<polygon points="${items.map((it, i) => { const rr = ((+it.value || 0) / max) * R; return `${px(i, rr).toFixed(2)},${py(i, rr).toFixed(2)}`; }).join(' ')}" fill="${_XC.accentLite}" stroke="${_XC.accent}" stroke-width="2"/>`;
    items.forEach((it, i) => { const rr = ((+it.value || 0) / max) * R; g += `<circle cx="${px(i, rr).toFixed(2)}" cy="${py(i, rr).toFixed(2)}" r="3.5" fill="${_XC.accent}" stroke="${_XC.paper}" stroke-width="1.5"/>`; });
    items.forEach((it, i) => { const lx = px(i, R + 20), ly = py(i, R + 20), anchor = lx < cx - 10 ? 'end' : lx > cx + 10 ? 'start' : 'middle'; g += `<text x="${lx.toFixed(2)}" y="${(ly + 3).toFixed(2)}" text-anchor="${anchor}" fill="${_XC.soft}" font-size="9" font-family="${_CN}">${_esc(String(it.label || ''))}</text>`; });
    items.forEach((it, i) => { const rr = ((+it.value || 0) / max) * R; g += `<text x="${px(i, rr).toFixed(2)}" y="${(py(i, rr) - 9).toFixed(2)}" text-anchor="middle" fill="${_XC.ink}" font-size="8" font-family="${_MO}" font-weight="700">${_nf(it.value)}</text>`; });
    return _svgTag(VW, VH, g);
  }

  if (type === 'combo') {
    const barVals = items.map(d => +d.bar || 0), lineVals = items.map(d => +d.line || 0);
    const maxBar = Math.max(...barVals, 0.001), maxLine = Math.max(...lineVals, 0.001);
    const VW = 500, VH = 210, pL = 48, pR = 48, pT = 20, pB = 48, cW = VW - pL - pR, cH = VH - pT - pB, n = items.length, slotW = cW / n, barW = Math.min(slotW * 0.5, 44);
    const lx = i => pL + i * slotW + slotW / 2, ly = i => pT + cH - (lineVals[i] / maxLine) * cH;
    let g = '';
    [0.25, 0.5, 0.75, 1].forEach(f => { const y = pT + cH * (1 - f); g += `<line x1="${pL}" y1="${y}" x2="${VW - pR}" y2="${y}" stroke="${_XC.rule}" stroke-width="0.5" stroke-dasharray="3,3"/><text x="${pL - 4}" y="${y + 3.5}" text-anchor="end" fill="${_XC.mute}" font-size="8" font-family="${_MO}">${_nf(Math.round(maxBar * f))}</text><text x="${VW - pR + 4}" y="${y + 3.5}" text-anchor="start" fill="${_XC.accent}" font-size="8" font-family="${_MO}">${(+(maxLine * f).toFixed(1))}</text>`; });
    items.forEach((it, i) => { const bh = (barVals[i] / maxBar) * cH, x = pL + i * slotW + (slotW - barW) / 2; g += `<rect x="${x.toFixed(1)}" y="${(pT + cH - bh).toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" fill="${_XC.ink}" opacity="0.72"/><text x="${lx(i).toFixed(1)}" y="${pT + cH + 14}" text-anchor="middle" fill="${_XC.soft}" font-size="9" font-family="${_CN}">${_esc(String(it.label || '').slice(0, 6))}</text>`; });
    g += `<polyline points="${items.map((_, i) => `${lx(i).toFixed(1)},${ly(i).toFixed(1)}`).join(' ')}" fill="none" stroke="${_XC.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    items.forEach((_, i) => { g += `<circle cx="${lx(i).toFixed(2)}" cy="${ly(i).toFixed(2)}" r="3.5" fill="${_XC.accent}" stroke="${_XC.paper}" stroke-width="1.5"/>`; });
    g += `<line x1="${pL}" y1="${pT + cH}" x2="${VW - pR}" y2="${pT + cH}" stroke="${_XC.ink}" stroke-width="1"/><line x1="${pL}" y1="${pT}" x2="${pL}" y2="${pT + cH}" stroke="${_XC.ink}" stroke-width="0.5"/><line x1="${VW - pR}" y1="${pT}" x2="${VW - pR}" y2="${pT + cH}" stroke="${_XC.accent}" stroke-width="0.5"/>`;
    return _svgTag(VW, VH, g);
  }

  return ''; // bar / unknown → caller uses HTML bars
}

function _buildInlineChartHTML(cd) {
  if (!cd?.data?.length) return '';
  const svg = _chartSVG(cd);
  let inner;
  if (svg) {
    inner = svg;
  } else {
    // bar / default → horizontal HTML bars (renders cleanly in html2canvas)
    const max = Math.max(...cd.data.map(x => +x.value || 0), 0.001);
    inner = cd.data.map(it => {
      const pct = Math.round(((+it.value || 0) / max) * 100);
      return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <span style="width:90px;text-align:right;font-size:11px;color:#666;flex-shrink:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${_esc(it.label)}</span>
        <div style="flex:1;height:15px;background:#e8e6e0;position:relative">
          <div style="position:absolute;left:0;top:0;height:100%;width:${pct}%;background:#0f0f0f"></div>
        </div>
        <span style="width:50px;font-size:11px;font-weight:700;text-align:right;flex-shrink:0">${_nf(it.value)}${cd.unit?' '+cd.unit:''}</span>
      </div>`;
    }).join('');
  }
  return `<div style="margin:10px 0;padding:14px 16px;border:1.5px solid #0f0f0f;background:#fff">
    ${cd.title?`<div style="font-size:11.5px;font-weight:700;margin-bottom:9px">▪ ${_esc(cd.title)}${cd.unit&&(cd.type==='bar'||!cd.type)?'（'+cd.unit+'）':''}</div>`:''}
    ${inner}
    ${cd.source?`<div style="font-size:9px;color:#999;margin-top:8px">来源：${_esc(cd.source)}</div>`:''}
  </div>`;
}

function _buildInlineBodyHTML(d, {includeCover=true}={}) {
  const m = d.meta || {};
  let html = '';
  if (includeCover) {
    const metaRow = [m.date, m.words&&m.words+'字', m.sources&&m.sources+' 来源', m.reading].filter(Boolean).join(' · ');
    html += `<div style="padding:48px 0 36px;margin-bottom:40px;border-bottom:3px solid #0f0f0f">
      <div style="font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#999;margin-bottom:20px;font-family:monospace">${_esc(m.issue||'')} · ATLAS ESSAYS</div>
      <div style="font-size:44px;font-weight:900;line-height:.93;letter-spacing:-1.5px;margin-bottom:10px">${_esc(d.title||'')}</div>
      ${d.subtitle?`<div style="font-size:15px;font-weight:700;color:#555;margin-bottom:14px">${_esc(d.subtitle)}</div>`:''}
      <div style="font-size:10px;color:#999;margin-bottom:10px;font-family:monospace">${metaRow}</div>
    </div>`;
  }
  for (const s of d.sections||[]) {
    const cnM = s.en.match(/^([一二三四五六七八九十]+[、．])\s*/);
    const prefix = cnM?.[1]||''; const label = prefix ? s.en.slice(cnM[0].length) : s.en;
    html += `<div style="margin-top:26px;padding-top:14px;border-top:2px solid #0f0f0f">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        ${prefix?`<span style="font-size:19px;font-weight:900">${prefix}</span>`:`<span style="font-size:9px;font-family:monospace;color:#999">${_esc(s.num)}</span>`}
        <span style="font-size:15px;font-weight:800">${_esc(label)}</span>
      </div>`;
    for (const b of s.blocks||[]) {
      if (b.kind==='lede')  html += `<p style="font-weight:700;font-size:15px;line-height:1.65;margin:0 0 11px">${_esc(b.text)}</p>`;
      else if (b.kind==='p') html += `<p style="margin:0 0 9px;font-size:13.5px;line-height:1.85">${_esc(b.text)}</p>`;
      else if (b.kind==='quote') html += `<blockquote style="margin:10px 0 10px 16px;padding-left:10px;border-left:3px solid #0f0f0f;font-style:italic;color:#555;font-size:13px">${_esc(b.text)}${b.by?`<div style="font-style:normal;font-size:11px;color:#888;margin-top:3px">— ${_esc(b.by)}</div>`:''}</blockquote>`;
      else if (b.kind==='chart') html += _buildInlineChartHTML(b.data);
    }
    html += '</div>';
  }
  if ((d.refs||[]).length>0) {
    html += `<div style="margin-top:26px;padding-top:14px;border-top:2px solid #0f0f0f">
      <div style="font-size:15px;font-weight:800;margin-bottom:10px">参考来源 · References</div>`;
    for (const r of d.refs) {
      html += `<div style="display:flex;gap:8px;font-size:12px;margin-bottom:6px;padding-bottom:6px;border-bottom:0.5px dashed #ccc">
        <b style="color:#c8a84b;font-family:monospace;min-width:26px">${_esc(r.n)}</b>
        <div><b>${_esc(r.src)}</b> — ${_esc(r.title)}<br><span style="color:#999;font-size:10px">${_esc(r.url)} · ${_esc(r.date)}</span></div>
      </div>`;
    }
    html += '</div>';
  }
  return html;
}

async function _exportPDFDownload(d, {pageSize='A4', includeCover=true}={}) {
  // Lazy-load libraries (~750KB, first-time only)
  await _loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  await _loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');

  // Page dimensions in mm and matching pixel width at 96dpi
  const pgMM = { A4:[210,297], LET:[216,279], B5:[176,250] };
  const [pgW, pgH] = pgMM[pageSize] || pgMM.A4;
  const pxW = Math.round(pgW * 3.78); // 1mm ≈ 3.78px at 96dpi

  // Render report in a hidden off-screen div inside THIS document
  // (so Google Fonts already loaded in <head> are available to html2canvas)
  const wrap = document.createElement('div');
  wrap.style.cssText = `position:fixed;left:${-(pxW+200)}px;top:0;width:${pxW}px;padding:48px 52px;background:#ffffff;color:#0f0f0f;font-family:'Noto Sans SC','Hanken Grotesk',sans-serif;font-size:14px;line-height:1.85;box-sizing:border-box;overflow:visible`;
  wrap.innerHTML = _buildInlineBodyHTML(d, { includeCover });
  document.body.appendChild(wrap);

  // Brief pause for layout + font-display
  await new Promise(r => setTimeout(r, 600));

  try {
    const canvas = await window.html2canvas(wrap, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: pxW,
      windowWidth: pxW,
    });

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pgW, pgH] });

    const cw = canvas.width;
    // canvas px that map to one PDF page height (preserve aspect ratio: cw px == pgW mm)
    const pageSlicePx = Math.floor((pgH / pgW) * cw);

    // Scan a band near the naive cut for a near-blank (background) row, so we never
    // slice through a line of text. Returns an adjusted cut y (canvas px).
    const ctx = canvas.getContext('2d');
    const isBlankRow = (y) => {
      if (y <= 0 || y >= canvas.height) return false;
      const { data: px } = ctx.getImageData(0, y, cw, 1);
      // sample every 4th pixel; row is blank if all sampled pixels are near-white
      for (let i = 0; i < cw; i += 4) {
        const o = i * 4;
        if (px[o] < 245 || px[o + 1] < 245 || px[o + 2] < 245) return false;
      }
      return true;
    };
    const findCut = (ideal) => {
      const minCut = ideal - Math.floor(pageSlicePx * 0.18); // don't waste >18% of a page
      for (let y = ideal; y >= minCut; y--) {
        if (isBlankRow(y)) return y;
      }
      return ideal; // no whitespace found → fall back to hard cut
    };

    let top = 0, pg = 0;
    while (top < canvas.height) {
      let bottom = Math.min(top + pageSlicePx, canvas.height);
      if (bottom < canvas.height) bottom = findCut(bottom);
      const sliceH = bottom - top;
      if (sliceH <= 0) break;

      // Crop this slice onto a temp canvas, then place on the page
      const slice = document.createElement('canvas');
      slice.width = cw;
      slice.height = sliceH;
      slice.getContext('2d').drawImage(canvas, 0, top, cw, sliceH, 0, 0, cw, sliceH);
      const sliceUrl = slice.toDataURL('image/jpeg', 0.92);
      const sliceMM = (sliceH / cw) * pgW; // slice height in mm

      if (pg++ > 0) pdf.addPage();
      pdf.addImage(sliceUrl, 'JPEG', 0, 0, pgW, sliceMM);

      top = bottom;
      if (pg > 80) break; // safety cap
    }

    pdf.save(_slug(d.title) + '.pdf');
  } finally {
    document.body.removeChild(wrap);
  }
}

function _buildMarkdown(d) {
  const lines = [`# ${d.title || ''}`, ''];
  if (d.subtitle) lines.push(`> ${d.subtitle}`, '');
  const m = d.meta || {};
  const meta = [m.date, m.words&&(m.words+'字'), m.sources&&(m.sources+' 来源'), m.reading, m.tokens&&(m.tokens.toLocaleString()+' tokens')].filter(Boolean).join(' · ');
  if (meta) lines.push(meta, '', '---', '');
  for (const s of d.sections||[]) {
    lines.push(`## ${s.en}${s.cn?' · '+s.cn:''}`, '');
    for (const b of s.blocks||[]) {
      if (b.kind==='lede') lines.push(`**${b.text}**`, '');
      else if (b.kind==='p') lines.push(b.text, '');
      else if (b.kind==='quote') { lines.push(`> ${b.text}`); if(b.by) lines.push(`> — ${b.by}`); lines.push(''); }
      else if (b.kind==='chart'&&b.data) {
        lines.push(`**[图表: ${b.data.title||''}]**`);
        for (const it of b.data.data||[]) lines.push(`- ${it.label}: **${it.value}**${b.data.unit?' '+b.data.unit:''}`);
        lines.push('');
      }
    }
  }
  if (d.refs?.length) {
    lines.push('---', '', '## 参考来源 · References', '');
    for (const r of d.refs) { lines.push(`${r.n} **${r.src}** — ${r.title}`); lines.push(`   ${r.url} · ${r.date}`, ''); }
  }
  return lines.join('\n');
}

function _chartPrintHTML(cd) {
  if (!cd?.data?.length) return '';
  const svg = _chartSVG(cd);
  if (svg) {
    return `<div style="margin:8pt 0;border:1pt solid #0f0f0f;padding:10pt;break-inside:avoid">
      <p style="font-size:8.5pt;font-weight:bold;margin:0 0 6pt 0">▪ ${_esc(cd.title||'')}</p>
      ${svg}
      ${cd.source?`<p style="font-size:7pt;color:#999;margin:6pt 0 0">来源：${_esc(cd.source)}</p>`:''}</div>`;
  }
  const max = Math.max(...cd.data.map(x=>+x.value||0), 0.001);
  const rows = cd.data.map(it=>{
    const pct = Math.round(((+it.value||0)/max)*100);
    return `<tr><td style="text-align:right;padding:2pt 6pt 2pt 0;width:90pt;font-size:8.5pt;color:#555">${_esc(it.label)}</td>
    <td style="padding:2pt 4pt"><div style="background:#e8e6e0;height:13pt;position:relative"><div style="background:#0f0f0f;height:100%;width:${pct}%"></div></div></td>
    <td style="padding:2pt 0 2pt 4pt;width:55pt;font-size:8.5pt;font-weight:bold">${_nf(it.value)}${cd.unit?' '+cd.unit:''}</td></tr>`;
  }).join('');
  return `<div style="margin:8pt 0;border:1pt solid #0f0f0f;padding:10pt;break-inside:avoid">
    <p style="font-size:8.5pt;font-weight:bold;margin:0 0 6pt 0">▪ ${_esc(cd.title||'')}${cd.unit?'（'+cd.unit+'）':''}</p>
    <table style="width:100%;border-collapse:collapse">${rows}</table></div>`;
}

function _buildBodyHTML(d) {
  return (d.sections||[]).map(s => {
    const cnM = s.en.match(/^([一二三四五六七八九十]+[、．])\s*/);
    const prefix = cnM?.[1]||''; const label = prefix ? s.en.slice(cnM[0].length) : s.en;
    const blocks = (s.blocks||[]).map(b => {
      if (b.kind==='lede') return `<p class="lede">${_esc(b.text)}</p>`;
      if (b.kind==='quote') return `<blockquote>${_esc(b.text)}${b.by?`<footer>— ${_esc(b.by)}</footer>`:''}</blockquote>`;
      if (b.kind==='chart') return _chartPrintHTML(b.data);
      return `<p>${_esc(b.text)}</p>`;
    }).join('');
    return `<div class="section"><div class="sec-hd">
      ${prefix?`<span class="cn-n">${prefix}</span>`:`<span class="sec-n">${_esc(s.num)}</span>`}
      <span class="sec-t">${_esc(label)}</span>
    </div>${blocks}</div>`;
  }).join('');
}

function _buildPrintHTML(d, {pageSize='A4',includeCover=true}={}) {
  const szMap = {A4:'A4',LET:'letter',B5:'B5'};
  const title = _esc(d.title||'Atlas Report');
  const m = d.meta||{};
  const metaStr = [m.date,m.words&&m.words+'字',m.sources&&m.sources+' 来源',m.reading].filter(Boolean).join(' · ');
  const cover = includeCover ? `<div class="cover"><div class="cov-tag">ATLAS ESSAYS · ${_esc(m.issue||'')}</div>
    <div class="cov-title">${title}</div>
    ${d.subtitle?`<div class="cov-sub">${_esc(d.subtitle)}</div>`:''}
    <div class="cov-meta">${metaStr}</div><div class="cov-rule"></div></div>` : '';
  const refs = d.refs?.length ? `<div class="section refs"><div class="sec-hd"><span class="sec-t">参考来源 · References</span></div>
    ${d.refs.map(r=>`<div class="ref"><span class="ref-n">${_esc(r.n)}</span><div><b>${_esc(r.src)}</b> — ${_esc(r.title)}<br><small>${_esc(r.url)} · ${_esc(r.date)}</small></div></div>`).join('')}
    </div>` : '';
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;900&family=Noto+Sans+SC:wght@400;700;900&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<style>
@page{size:${szMap[pageSize]||'A4'};margin:22mm 24mm}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Noto Sans SC',sans-serif;font-size:10.5pt;line-height:1.85;color:#0f0f0f}
.cover{min-height:90vh;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:36pt;page-break-after:always}
.cov-tag{font-family:'Archivo',sans-serif;font-size:8pt;font-weight:700;letter-spacing:3pt;text-transform:uppercase;color:#888;margin-bottom:20pt}
.cov-title{font-family:'Archivo',sans-serif;font-size:42pt;font-weight:900;line-height:.94;letter-spacing:-1pt;margin-bottom:10pt}
.cov-sub{font-size:13pt;font-weight:700;color:#555;margin-bottom:14pt}
.cov-meta{font-family:'JetBrains Mono',monospace;font-size:8pt;color:#888;margin-bottom:10pt}
.cov-rule{height:2pt;background:#0f0f0f}
.section{margin-top:18pt;padding-top:12pt;border-top:1.5pt solid #0f0f0f}
.sec-hd{display:flex;align-items:baseline;gap:7pt;margin-bottom:8pt}
.cn-n{font-size:17pt;font-weight:900}
.sec-n{font-family:'JetBrains Mono',monospace;font-size:8.5pt;color:#888}
.sec-t{font-size:12.5pt;font-weight:800}
.lede{font-weight:700;font-size:11.5pt;line-height:1.6;margin-bottom:7pt}
p{margin-bottom:5pt}
blockquote{margin:7pt 0 7pt 14pt;padding-left:8pt;border-left:2.5pt solid #0f0f0f;font-style:italic;color:#555}
blockquote footer{font-style:normal;font-size:8.5pt;color:#888;margin-top:2pt}
.refs .ref{display:flex;gap:7pt;margin-bottom:7pt;padding-bottom:7pt;border-bottom:.5pt dashed #ccc;font-size:9pt}
.ref-n{font-family:'JetBrains Mono',monospace;font-size:8.5pt;font-weight:700;color:#c8a84b;min-width:24pt}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
${cover}${_buildBodyHTML(d)}${refs}
</body></html>`;
}

function _buildWordHTML(d) {
  const title = _esc(d.title||'Atlas Report');
  const m = d.meta||{};
  const metaLine = [m.date,m.words&&m.words+'字',m.sources&&m.sources+' 来源',m.reading].filter(Boolean).join(' · ');
  const body = (d.sections||[]).map(s => {
    const blocks = (s.blocks||[]).map(b => {
      if (b.kind==='lede') return `<p><b>${_esc(b.text)}</b></p>`;
      if (b.kind==='quote') return `<blockquote style="margin-left:18pt;font-style:italic;color:#555">${_esc(b.text)}${b.by?`<br>— ${_esc(b.by)}`:''}</blockquote>`;
      if (b.kind==='chart'&&b.data) { const its=(b.data.data||[]).map(i=>`<li>${_esc(i.label)}: <b>${i.value}${b.data.unit?' '+b.data.unit:''}</b></li>`).join(''); return `<p><b>【图表: ${_esc(b.data.title||'')}】</b></p><ul>${its}</ul>`; }
      return `<p>${_esc(b.text)}</p>`;
    }).join('');
    return `<h2 style="font-size:13pt;margin-top:18pt;padding-top:10pt;border-top:1.5pt solid #0f0f0f">${_esc(s.en)}${s.cn?' · '+_esc(s.cn):''}</h2>${blocks}`;
  }).join('');
  const refs = d.refs?.length ? `<hr/><h2>参考来源</h2>${d.refs.map(r=>`<p><b>${_esc(r.n)} ${_esc(r.src)}</b> — ${_esc(r.title)} <small>(${_esc(r.url)}, ${_esc(r.date)})</small></p>`).join('')}` : '';
  return `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${title}</title>
<style>body{font-family:"Noto Sans SC",sans-serif;font-size:11pt;line-height:1.85;color:#0f0f0f}h1{font-size:20pt;font-weight:900;line-height:.94;margin-bottom:8pt}p{margin:5pt 0}blockquote{color:#555}</style>
</head><body><h1>${title}</h1>${d.subtitle?`<p style="color:#555;font-size:12pt;font-weight:700">${_esc(d.subtitle)}</p>`:''}<p style="font-size:8.5pt;color:#888">${metaLine}</p><hr/>${body}${refs}</body></html>`;
}

function ExportModal({ t, onClose, exportData }) {
  const [format, setFormat] = React.useState('pdf');
  const [includeCover, setIncludeCover] = React.useState(true);
  const [includeMarginalia, setIncludeMarginalia] = React.useState(true);
  const [pageSize, setPageSize] = React.useState('A4');
  const [linkScope, setLinkScope] = React.useState('link');
  const [linkPwd, setLinkPwd] = React.useState('');
  const [allowFollowUp, setAllowFollowUp] = React.useState(true);
  const [showAnalytics, setShowAnalytics] = React.useState(false);
  const [status, setStatus] = React.useState('idle'); // idle | loading | done | error
  const [statusMsg, setStatusMsg] = React.useState('');
  const [copiedUrl, setCopiedUrl] = React.useState('');

  // Fall back to static report data if no exportData provided
  const d = exportData || {
    title: 'Cold brew, hotter capital.',
    subtitle: '2025 Q1 国内咖啡赛道融资速记',
    sections: REPORT_SECTIONS,
    refs: REPORT_REFS,
    meta: REPORT_META,
  };
  const displayTitle = d.title || 'Atlas Report';

  const setDone = (msg) => { setStatus('done'); setStatusMsg(msg); setTimeout(() => setStatus('idle'), 3500); };
  const setErr  = (msg) => { setStatus('error'); setStatusMsg(msg); setTimeout(() => setStatus('idle'), 5000); };

  const handleAction = async () => {
    setStatus('loading');
    try {
      if (format === 'md') {
        const text = _buildMarkdown(d);
        _dlBlob(new Blob([text], { type: 'text/markdown;charset=utf-8' }), _slug(d.title) + '.md');
        setDone('✓ Markdown 文件已下载');

      } else if (format === 'pdf') {
        await _exportPDFDownload(d, { pageSize, includeCover });
        setDone('✓ PDF 已下载');

      } else if (format === 'docx') {
        const html = _buildWordHTML(d);
        _dlBlob(new Blob(['﻿', html], { type: 'application/vnd.ms-word;charset=utf-8' }), _slug(d.title) + '.doc');
        setDone('✓ Word 文档已下载（.doc 格式，可用 Word / WPS 打开）');

      } else if (format === 'notion') {
        const md = _buildMarkdown(d);
        await navigator.clipboard.writeText(md);
        setDone('✓ 已复制 Markdown → 在 Notion 新建页面后直接 Cmd+V 粘贴');

      } else if (format === 'link') {
        const base = window.location.href.split('?')[0].split('#')[0];
        const url = `${base}?r=${encodeURIComponent(d.id || '')}`;
        await navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setDone('✓ 链接已复制到剪贴板');
      }
    } catch (err) {
      setErr('✕ 操作失败：' + (err.message || String(err)));
    }
  };

  const selected = EXPORT_FORMATS.find(f => f.k === format);
  const isLink = format === 'link';
  const isNotion = format === 'notion';
  const btnLabel = status === 'loading'
    ? (format === 'pdf' ? '生成 PDF 中…' : '处理中…')
    : isLink ? '复制链接 ↗'
    : isNotion ? '复制 Markdown ↗'
    : `下载 ${selected?.en} ↓`;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(15,15,15,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 900, maxHeight: '90vh',
        background: t.paper, border: `1.5px solid ${t.ink}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '14px 22px', borderBottom: `1.5px solid ${t.ink}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <Tag t={t} accent>◆ EXPORT · 导出 / 分享</Tag>
          <span style={{ fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 15, letterSpacing: 0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {displayTitle}
          </span>
          <button type="button" onClick={onClose} style={{
            border: `1px solid ${t.ink}`, background: t.paper, padding: '4px 9px',
            fontFamily: t.fontMono, fontSize: 11, cursor: 'pointer', color: t.ink, flexShrink: 0,
          }}>ESC</button>
        </div>

        {/* Body: 3 columns */}
        <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '220px 1fr 220px' }}>

          {/* Left: format picker */}
          <div style={{ borderRight: `1px solid ${t.rule}`, overflowY: 'auto' }}>
            <div style={{ padding: '10px 16px 4px', fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.4 }}>FORMAT · 格式</div>
            {EXPORT_FORMATS.map(f => (
              <button key={f.k} type="button" onClick={() => { setFormat(f.k); setStatus('idle'); }} style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: format === f.k ? t.faint : 'transparent',
                border: 'none', borderLeft: format === f.k ? `3px solid ${t.accent}` : '3px solid transparent',
                padding: '10px 16px', cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>{f.en}</span>
                  {f.recommended && <Tag t={t} accent>推荐</Tag>}
                </div>
                <div style={{ fontFamily: t.fontCN, fontSize: 11, color: t.inkSoft, marginTop: 2 }}>{f.cn}</div>
                <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginTop: 2 }}>{f.size}</div>
              </button>
            ))}
          </div>

          {/* Center: options */}
          <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.4, borderBottom: `1px solid ${t.rule}`, paddingBottom: 6 }}>OPTIONS · 选项</div>

            {!isLink && !isNotion && (
              <>
                <OptionToggle t={t} label="包含杂志封面 (Cover sheet)" value={includeCover} onChange={setIncludeCover}/>
                <OptionToggle t={t} label="包含边注 (Marginalia)" value={includeMarginalia} onChange={setIncludeMarginalia}/>
              </>
            )}

            {format === 'pdf' && (
              <OptionRadio t={t} label="纸张大小" value={pageSize} onChange={setPageSize}
                options={[['A4','A4'],['LET','Letter'],['B5','B5']]}/>
            )}

            {isLink && (
              <>
                <OptionRadio t={t} label="访问范围" value={linkScope} onChange={setLinkScope}
                  options={[['link','公开'],['team','团队'],['pwd','密码']]}/>
                {linkScope === 'pwd' && (
                  <div>
                    <div style={{ fontFamily: t.fontCN, fontSize: 12, color: t.mute, marginBottom: 6 }}>访问密码</div>
                    <input value={linkPwd} onChange={e => setLinkPwd(e.target.value)}
                      placeholder="设置密码…"
                      style={{ width: '100%', border: `1.5px solid ${t.ink}`, padding: '6px 10px', fontFamily: t.fontMono, fontSize: 12, background: t.paper, color: t.ink, outline: 'none' }}/>
                  </div>
                )}
                <OptionToggle t={t} label="允许追问 (Follow-up)" value={allowFollowUp} onChange={setAllowFollowUp}/>
                <OptionToggle t={t} label="显示阅读统计 (Analytics)" value={showAnalytics} onChange={setShowAnalytics}/>
                {copiedUrl && (
                  <div style={{ fontFamily: t.fontMono, fontSize: 10, color: t.accent, wordBreak: 'break-all', padding: '8px 10px', background: t.faint, border: `1px solid ${t.accent}` }}>
                    {copiedUrl}
                  </div>
                )}
              </>
            )}

            {isNotion && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontFamily: t.fontCN, fontSize: 13, color: t.inkSoft, lineHeight: 1.7 }}>
                  点击下方按钮将报告复制为 Notion 兼容的 Markdown 格式。
                </div>
                <div style={{ fontFamily: t.fontCN, fontSize: 12, color: t.mute, lineHeight: 1.7 }}>
                  1. 点击「复制 Markdown」<br/>
                  2. 在 Notion 中新建页面<br/>
                  3. 直接 <strong>Cmd+V</strong>（Mac）或 <strong>Ctrl+V</strong>（Win）粘贴<br/>
                  4. Notion 会自动解析标题和段落结构
                </div>
              </div>
            )}

            {/* Status feedback */}
            {status !== 'idle' && (
              <div style={{
                padding: '10px 14px', marginTop: 4,
                background: status === 'error' ? 'rgba(229,37,29,0.08)' : status === 'done' ? 'rgba(16,185,129,0.08)' : t.faint,
                border: `1px solid ${status === 'error' ? '#e5251d' : status === 'done' ? '#10b981' : t.rule}`,
                fontFamily: t.fontCN, fontSize: 12,
                color: status === 'error' ? '#e5251d' : status === 'done' ? '#10b981' : t.inkSoft,
                lineHeight: 1.5,
              }}>
                {status === 'loading'
                  ? (format === 'pdf' ? '⏳ 正在渲染页面并生成 PDF，首次约需 3–5 秒…' : '⏳ 正在处理，请稍候…')
                  : statusMsg}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: `1px solid ${t.rule}`, display: 'flex', gap: 8 }}>
              <span style={{ flex: 1 }}/>
              <Btn t={t} size="md" onClick={onClose}>取消 · Cancel</Btn>
              <Btn t={t} size="md" primary accent onClick={handleAction} disabled={status === 'loading'}>
                {btnLabel}
              </Btn>
            </div>
          </div>

          {/* Right: preview */}
          <div style={{ background: t.paperAlt, padding: '16px', borderLeft: `1px solid ${t.rule}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.4 }}>PREVIEW · 预览</div>
            <div style={{
              flex: 1, background: '#fff', border: `1px solid ${t.ink}`,
              boxShadow: `3px 3px 0 ${t.ink}`,
              padding: '13px 11px', display: 'flex', flexDirection: 'column', gap: 5,
            }}>
              {includeCover && !isLink && !isNotion ? (
                <>
                  <div style={{ fontFamily: 'Archivo', fontSize: 7, fontWeight: 700, letterSpacing: 2, color: '#888', textTransform: 'uppercase' }}>ATLAS · {d.meta?.issue||''}</div>
                  <div style={{ fontFamily: 'Archivo', fontSize: 16, fontWeight: 900, lineHeight: 0.95, letterSpacing: -0.5, color: '#0f0f0f', marginTop: 4 }}>{displayTitle.slice(0,30)}{displayTitle.length>30?'…':''}</div>
                  {d.subtitle && <div style={{ fontFamily: 'Noto Sans SC', fontSize: 8, lineHeight: 1.3, color: '#555', marginTop: 2 }}>{d.subtitle.slice(0,40)}</div>}
                  <div style={{ height: 1.5, background: '#0f0f0f', margin: '5px 0' }}/>
                </>
              ) : (
                <div style={{ fontFamily: 'Archivo', fontSize: 10, fontWeight: 800, color: '#0f0f0f', marginBottom: 4 }}>{displayTitle.slice(0,30)}</div>
              )}
              {(d.sections||[]).slice(0,3).map((s,i) => (
                <div key={i} style={{ marginBottom: 3 }}>
                  <div style={{ fontFamily: 'Archivo', fontSize: 7, fontWeight: 800, color: '#0f0f0f', letterSpacing: 0.5 }}>{s.en.slice(0,28)}</div>
                  <div style={{ background: '#f0eee9', height: 4, width: `${75 - i*10}%`, marginTop: 2 }}/>
                  <div style={{ background: '#f0eee9', height: 4, width: `${90 - i*5}%`, marginTop: 2 }}/>
                </div>
              ))}
              {includeMarginalia && !isLink && !isNotion && (
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 5.5, color: '#aaa', marginTop: 3 }}>§ marginalia · references</div>
              )}
            </div>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, lineHeight: 1.5 }}>
              {format === 'pdf' && `${pageSize} · ~480 KB`}
              {format === 'docx' && '~320 KB · Word/WPS'}
              {format === 'md' && `~${Math.round((_buildMarkdown(d).length/1024))}KB · UTF-8`}
              {format === 'notion' && 'Markdown 格式 · 可直接粘贴'}
              {format === 'link' && `有效期 30d · ${linkScope==='pwd'?'密码保护':'公开访问'}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionToggle({ t, label, value, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: onChange ? 'pointer' : 'default' }}>
      <span style={{
        width: 36, height: 20, border: `1.5px solid ${t.ink}`,
        background: value ? t.ink : t.paper, position: 'relative', flexShrink: 0,
      }}>
        <span style={{
          position: 'absolute', top: 1, left: value ? 17 : 1,
          width: 14, height: 14, background: value ? t.paper : t.ink, transition: 'left 0.12s',
        }}/>
      </span>
      <span style={{ fontFamily: t.fontCN, fontSize: 13, color: t.ink, flex: 1 }}>{label}</span>
      <input type="checkbox" checked={value} onChange={onChange ? (e => onChange(e.target.checked)) : undefined}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}/>
    </label>
  );
}

function OptionRadio({ t, label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontFamily: t.fontCN, fontSize: 13, color: t.ink, flex: 1 }}>{label}</span>
      <div style={{ display: 'flex', border: `1.5px solid ${t.ink}` }}>
        {options.map(([k, l], i) => (
          <button key={k}
            type="button"
            onClick={() => onChange(k)}
            style={{
              padding: '5px 10px', border: 'none',
              borderLeft: i === 0 ? 'none' : `1px solid ${t.ink}`,
              background: value === k ? t.ink : t.paper,
              color: value === k ? t.paper : t.ink,
              fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1, cursor: 'pointer',
            }}>{l}</button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Sources, ExportModal, SOURCES, SOURCE_CATEGORIES });
// Root app — route state + Tweaks integration.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "red",
  "theme": "cream",
  "density": "editorial",
  "marginalia": true,
  "headerLarge": true
}/*EDITMODE-END*/;

const FOOTER_CONTEXT = {
  home:    { page: '01', section: 'COVER · 封面' },
  outline: { page: '02', section: 'OUTLINE · 大纲确认' },
  running: { page: '03', section: 'IN PROGRESS · 撰写中' },
  report:  { page: '04', section: 'FEATURE · 正文' },
  library: { page: '05', section: 'ARCHIVE · 报告库' },
  sources: { page: '06', section: 'SOURCES · 数据源' },
};

const SAMPLE_FIRST_PROMPT = '梳理 2025 年 Q1 国内咖啡赛道的融资动态，重点说说 Manner、库迪和挪瓦的新动向，给一份 2000 字的内部分析。';

// ── Pet Widget (Rubber Hose Retro) ───────────────────────────────────────────
const PET_W = 100;

const PET_QA_KB = [
  { kw:/导出|export/i,          ans:'点击右上角的 Export 按钮，支持 PDF、Markdown 和 HTML 三种格式～' },
  { kw:/数据源|source/i,        ans:'目前支持手动输入，正在接入 Google 数据和 RSS 源，敬请期待！' },
  { kw:/图表|chart|可视化/i,     ans:'报告里会自动生成 Fig. 标注区域，图表渲染功能在路线图上～' },
  { kw:/模型|model|claude|gpt/i,ans:'可以在右上角 Model 选择器切换，支持 Claude 全系列和自定义 API！' },
  { kw:/保存|save/i,            ans:'报告生成后点击 Save 按钮，保存到左侧 Library 里随时查看。' },
  { kw:/收费|price|付费|免费/i,  ans:'Atlas 目前处于 Beta，完全免费！使用时需要自备 API Key。' },
  { kw:/api.?key|apikey|密钥/i, ans:'顶部栏 → Model 设置 → 填入你的 Anthropic API Key 即可开始。' },
  { kw:/多久|多长时间|speed|速度/i,ans:'根据报告长度约需 3–12 分钟。High 模式更细致，Low 模式更快！' },
  { kw:/模板|template/i,        ans:'在主页右下角点击 "＋ Add Template" 可以新建自己的提示词模板～' },
  { kw:/你好|hello|hi|嗨/i,     ans:'你好呀！我是 Atlas 的小助手，有什么可以帮你的吗？😊' },
];

function getPetReply(msg) {
  for (const q of PET_QA_KB) { if (q.kw.test(msg)) return q.ans; }
  return ['这个我暂时不清楚～可以去 GitHub Issues 提问！','好问题！我的知识库还在更新中，稍后再来问？','嗯……让我想想（其实我也不确定 😅）','这个问题好有深度，建议查看文档或联系支持！'][Math.floor(Math.random()*4)];
}

const CLICK_REACTIONS = [
  { w:28, mood:'jump',    bubble:'啊！吓我一跳！',    dur:800 },
  { w:18, mood:'idle',    bubble:'>///<',              dur:600 },
  { w:18, mood:'dance',   bubble:'嗨～找我有事？',     dur:700 },
  { w:16, mood:'think',   bubble:'？有什么需要~',      dur:700 },
  { w:12, mood:'wave',    bubble:'来找我啦，抱抱！',    dur:600 },
  { w:8,  mood:'scratch', bubble:'...说吧',            dur:500 },
];

function PetWidget({ t }) {
  const [mood, setMood] = React.useState('idle');
  const [blink, setBlink] = React.useState(false);
  const [eyeDir, setEyeDir] = React.useState(0);
  const [bubble, setBubble] = React.useState(null);
  const [inputOpen, setInputOpen] = React.useState(false);
  const [inputVal, setInputVal] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('cmd');
  const [chatHistory, setChatHistory] = React.useState([]);
  const [minimized, setMinimized] = React.useState(false);
  const [petLeft, setPetLeft] = React.useState(null);
  const [facingRight, setFacingRight] = React.useState(false);
  const animRef = React.useRef(null);
  const petPosRef = React.useRef({ x: 0, ready: false });
  const bubTimerRef = React.useRef(null);
  const autoTimerRef = React.useRef(null);
  const audioCtxRef = React.useRef(null);
  const chatEndRef = React.useRef(null);

  // ── init ───────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    petPosRef.current.x = window.innerWidth - PET_W - 24;
    petPosRef.current.ready = true;
  }, []);

  // blink
  React.useEffect(() => {
    let t; const lp = () => { t = setTimeout(() => { setBlink(true); setTimeout(() => { setBlink(false); lp(); }, 140); }, 1800 + Math.random() * 4200); }; lp();
    return () => clearTimeout(t);
  }, []);

  // eye wander
  React.useEffect(() => {
    let t; const lp = () => {
      t = setTimeout(() => {
        const d = [-1,-1,0,0,0,1,1][Math.floor(Math.random()*7)];
        setEyeDir(d);
        setTimeout(() => setEyeDir(0), 1100 + Math.random()*500);
        lp();
      }, 3500 + Math.random()*6000);
    }; lp();
    return () => clearTimeout(t);
  }, []);

  // autonomous behaviour scheduler
  React.useEffect(() => {
    if (!['idle','sleep'].includes(mood)) return;
    const sl = mood === 'sleep';
    const pool = sl
      ? [['sleep',4],['idle',1]]
      : [
          ['lookaround',2],['nod',1.8],['wave',1.5],['scratch',1.4],
          ['jump',1.4],['think',1.3],['fidget',1.2],['stretch',1],
          ['walk',1.8],['run',0.3],['sleep',0.15],
        ];
    const tot = pool.reduce((s,[,w])=>s+w,0);
    let rnd = Math.random()*tot, pick = pool[0][0];
    for (const [b,w] of pool) { rnd-=w; if(rnd<=0){pick=b;break;} }
    const delay = sl ? 8000+Math.random()*8000 : 900+Math.random()*2200;
    autoTimerRef.current = setTimeout(()=>exec(pick), delay);
    return () => clearTimeout(autoTimerRef.current);
  }, [mood]);

  // scroll chat to bottom
  React.useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // helpers
  const showBubble = (msg, ms=2600) => {
    if (bubTimerRef.current) clearTimeout(bubTimerRef.current);
    setBubble(msg);
    bubTimerRef.current = setTimeout(()=>setBubble(null), ms);
  };
  const stopAnim = () => { if(animRef.current){cancelAnimationFrame(animRef.current);animRef.current=null;} };

  const toCorner = () => {
    stopAnim();
    const tx = window.innerWidth - PET_W - 24;
    if (Math.abs(petPosRef.current.x - tx) < 5) { setPetLeft(null); setFacingRight(false); setMood('idle'); return; }
    setFacingRight(true); setMood('walk');
    const tick = () => {
      const d = tx - petPosRef.current.x;
      if (Math.abs(d) < 4) { petPosRef.current.x = tx; setPetLeft(null); setFacingRight(false); setMood('idle'); animRef.current=null; return; }
      petPosRef.current.x += (d>0?1:-1)*2.8; setPetLeft(petPosRef.current.x);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  };

  const startWalk = (fast) => {
    stopAnim();
    if (!petPosRef.current.ready) petPosRef.current.x = window.innerWidth - PET_W - 24;
    setMood(fast?'run':'walk'); setFacingRight(false);
    const spd=fast?3.4:1.9, steps=70+Math.floor(Math.random()*110);
    let dir=-1, i=0;
    const tick = () => {
      i++; petPosRef.current.x += dir*spd;
      const mn=16, mx=window.innerWidth-PET_W-16;
      if(petPosRef.current.x<=mn){petPosRef.current.x=mn;dir=1;setFacingRight(true);}
      if(petPosRef.current.x>=mx){petPosRef.current.x=mx;dir=-1;setFacingRight(false);}
      setPetLeft(petPosRef.current.x);
      if(i<steps){animRef.current=requestAnimationFrame(tick);}else{animRef.current=null;toCorner();}
    };
    animRef.current = requestAnimationFrame(tick);
  };

  const playGuitar = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext||window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      [220,277,330,415,554].forEach((freq,i) => {
        setTimeout(() => {
          const o=ctx.createOscillator(), g=ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type='sawtooth'; o.frequency.value=freq;
          g.gain.setValueAtTime(0.12,ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+1.4);
          o.start(ctx.currentTime); o.stop(ctx.currentTime+1.4);
        }, i*55);
      });
    } catch(e) {}
  };

  const exec = (b) => {
    if(b==='walk'){startWalk(false);return;}
    if(b==='run'){startWalk(true);return;}
    if(b==='lookaround'){
      // rapid left-right-up eye sweep
      const dirs = [1,0,-1,0,1,0,-1,0];
      dirs.forEach((d,i)=>setTimeout(()=>setEyeDir(d), i*220));
      return;
    }
    if(b==='nod'){
      // brief think posture → idle (head-look-up effect)
      setMood('think');
      setTimeout(()=>setMood('idle'), 900+Math.random()*300);
      return;
    }
    if(b==='fidget'){
      // quick wave arm raise then drop
      setMood('wave');
      setTimeout(()=>setMood('idle'), 500);
      return;
    }
    const cfg = {
      jump:    { msg:['嘿！','跳！','耶～'], dur:1800, msgMs:1600 },
      stretch: { msg:[], dur:2800, msgMs:0 },
      think:   { msg:['该写什么报告？🤔','数据有意思...','嗯嗯~'], dur:3200, msgMs:2800 },
      wave:    { msg:['👋 你好！','嗨！'], dur:2200, msgMs:2000 },
      scratch: { msg:[], dur:2200, msgMs:0 },
      sleep:   { msg:['呼呼... 💤'], dur:0, msgMs:8000 },
    };
    const c = cfg[b] || {}; const m = c.msg?.[Math.floor(Math.random()*(c.msg.length||1))];
    if(m) showBubble(m, c.msgMs||2600);
    setMood(b);
    if(c.dur) setTimeout(()=>setMood('idle'), c.dur);
  };

  const handleCmd = (raw) => {
    setInputVal('');
    const cmd = raw.trim(); if(!cmd) return;
    if(autoTimerRef.current) clearTimeout(autoTimerRef.current);
    stopAnim();
    if(/散步|走走|溜达/.test(cmd)){showBubble('好嘞，溜达一圈！🐾');setTimeout(()=>startWalk(false),400);}
    else if(/跑|冲|奔/.test(cmd)){showBubble('冲冲冲！💨');setTimeout(()=>startWalk(true),400);}
    else if(/睡觉|休息|困/.test(cmd)){exec('sleep');}
    else if(/起来|醒|起床/.test(cmd)){setMood('idle');showBubble('哈欠~ 起来啦！☀️');}
    else if(/吉他|弹|摇滚|guitar/.test(cmd)){setMood('guitar');playGuitar();showBubble('🎸 叮当当！',4500);setTimeout(()=>setMood('idle'),5200);}
    else if(/跳舞|舞|dance/.test(cmd)){setMood('dance');showBubble('🕺 嗨起来！',3500);setTimeout(()=>setMood('idle'),4000);}
    else if(/转圈|转/.test(cmd)){setMood('spin');showBubble('dizzy~ 😵',2200);setTimeout(()=>setMood('idle'),2700);}
    else if(/分析|报告|工作|帮我/.test(cmd)){setMood('work');showBubble('📊 正在分析...',3800);setTimeout(()=>{setMood('idle');showBubble('✨ 完成！');},4400);}
    else if(/挥手|摆手|打招呼/.test(cmd)){exec('wave');showBubble('👋 你好！',2200);}
    else if(/挠头|scratch|抓头/.test(cmd)){exec('scratch');}
    else if(/伸懒腰|懒腰/.test(cmd)){exec('stretch');}
    else if(/回来|回家|过来/.test(cmd)){showBubble('回来啦！');toCorner();}
    else if(/跳|蹦/.test(cmd)){exec('jump');}
    else{showBubble(['好的！🐾','嗯！','收到！','啊？😅','知道啦~'][Math.floor(Math.random()*5)]);}
  };

  const handleQA = (question) => {
    if (!question.trim()) return;
    setInputVal('');
    const userMsg = question.trim();
    setChatHistory(h => [...h, { role:'user', text:userMsg }]);
    setMood('think');
    setTimeout(() => {
      const reply = getPetReply(userMsg);
      setChatHistory(h => [...h, { role:'pet', text:reply }]);
      setMood('idle');
      showBubble('回答好了！', 1400);
    }, 1200 + Math.random()*600);
  };

  // Click reaction handler
  const handlePetClick = () => {
    if (inputOpen) { setInputOpen(false); return; }
    const tot = CLICK_REACTIONS.reduce((s,r)=>s+r.w,0);
    let rnd = Math.random()*tot, react = CLICK_REACTIONS[0];
    for (const r of CLICK_REACTIONS) { rnd -= r.w; if (rnd <= 0) { react = r; break; } }
    stopAnim(); if(autoTimerRef.current) clearTimeout(autoTimerRef.current);
    showBubble(react.bubble, react.dur + 800);
    setMood(react.mood);
    setTimeout(() => { setMood('idle'); setTimeout(() => setInputOpen(true), 150); }, react.dur);
  };

  // ── derived animation values ──────────────────────────────────────────────
  const isWalk = mood==='walk' || mood==='run';
  const isSleep = mood==='sleep';
  const ws = mood==='run' ? '0.32s' : '0.6s';
  const halfDelay = mood==='run' ? '-0.16s' : '-0.3s';

  const driftAnim = ({
    walk:  `rh-walk-bounce ${ws} ease-in-out infinite`,
    run:   `rh-run-bounce ${ws} ease-in-out infinite`,
    dance: 'rh-dance-body 0.56s ease-in-out infinite',
    sleep: 'rh-sleep-drift 5s ease-in-out infinite',
    jump:  'rh-jump 0.65s ease forwards',
  })[mood] || 'rh-drift 2.6s ease-in-out infinite';

  const swayStyle = mood==='run'
    ? { animation:'none', transform:'rotate(-5deg)', transformOrigin:'55px 110px' }
    : mood==='sleep'
    ? { animation:'none', transform:'rotate(-4deg)', transformOrigin:'55px 110px' }
    : mood==='spin'
    ? { animation:'rh-spin 0.7s linear 3 forwards', transformOrigin:'55px 110px' }
    : isWalk
    ? { animation:'none', transformOrigin:'55px 110px' }
    : { animation:'rh-sway 7s ease-in-out infinite', transformOrigin:'55px 110px' };

  const armLAnim = isSleep           ? { animation:'none', transform:'rotate(12deg)' }
    : mood==='stretch'               ? { animation:'rh-arm-l-stretch 2.5s ease-in-out 1 forwards' }
    : mood==='dance'                 ? { animation:'rh-arm-l-dance 0.56s ease-in-out infinite' }
    : mood==='run'                   ? { animation:`rh-arm-l-run ${ws} ease-in-out ${halfDelay} infinite` }
    : isWalk                         ? { animation:`rh-arm-l-walk ${ws} ease-in-out ${halfDelay} infinite` }
    :                                  { animation:'rh-arm-l-idle 2.8s ease-in-out -0.9s infinite' };

  const armRAnim = isSleep           ? { animation:'none', transform:'rotate(-12deg)' }
    : mood==='stretch'               ? { animation:'rh-arm-r-stretch 2.5s ease-in-out 1 forwards' }
    : mood==='dance'                 ? { animation:'rh-arm-r-dance 0.56s ease-in-out infinite' }
    : mood==='wave'                  ? { animation:'rh-arm-wave 0.5s ease-in-out infinite' }
    : mood==='scratch'               ? { animation:'rh-arm-scratch 0.28s ease-in-out infinite' }
    : mood==='guitar'                ? { animation:'rh-arm-strum 0.38s ease-in-out infinite' }
    : mood==='run'                   ? { animation:`rh-arm-r-run ${ws} ease-in-out 0s infinite` }
    : isWalk                         ? { animation:`rh-arm-r-walk ${ws} ease-in-out 0s infinite` }
    :                                  { animation:'rh-arm-r-idle 2.8s ease-in-out 0s infinite' };

  const legLAnim = mood==='dance'    ? { animation:'rh-leg-l-dance 0.56s ease-in-out -0.28s infinite' }
    : isWalk                         ? { animation:`rh-leg-l-walk ${ws} ease-in-out ${halfDelay} infinite` }
    :                                  { animation:'rh-leg-idle 3.2s ease-in-out -1.1s infinite' };

  const legRAnim = mood==='dance'    ? { animation:'rh-leg-r-dance 0.56s ease-in-out 0s infinite' }
    : isWalk                         ? { animation:`rh-leg-r-walk ${ws} ease-in-out 0s infinite` }
    :                                  { animation:'rh-leg-idle 3.2s ease-in-out 0s infinite' };

  const eyeShX = mood==='think' ? 2 : eyeDir * 2;
  const eyeShY = mood==='think' ? -4 : 0;
  const blushOp = ['dance','run','jump','wave','guitar'].includes(mood) ? 0.65 : isSleep ? 0.18 : 0.3;

  const mouthD = ({
    idle:'M42 55 Q55 62 68 55',    walk:'M42 55 Q55 62 68 55',
    run:'M38 54 Q55 67 72 54',     dance:'M38 54 Q55 68 72 54',
    wave:'M40 55 Q55 64 70 55',    scratch:'M44 57 Q55 60 66 57',
    guitar:'M46 56 Q62 60 68 53',  work:'M44 56 Q55 59 66 56',
    think:'M46 57 Q56 54 66 56',   jump:'M40 54 Q55 65 70 54',
    spin:'M44 55 Q55 62 66 55',    stretch:'M42 54 Q55 61 68 54',
  })[mood] || 'M42 55 Q55 62 68 55';

  const browLd = ({
    run:'M30 18 Q41 12 52 17',     dance:'M30 19 Q41 13 52 18',
    scratch:'M30 22 Q41 20 52 24', work:'M30 24 Q41 28 52 24',
    think:'M30 21 Q41 15 52 20',   jump:'M30 19 Q41 13 52 18',
  })[mood] || 'M30 22 Q41 16 52 21';

  const browRd = ({
    run:'M58 17 Q69 12 80 18',     dance:'M58 18 Q69 13 80 19',
    scratch:'M58 24 Q69 20 80 22', work:'M58 24 Q69 28 80 24',
    think:'M58 20 Q69 15 80 21',   jump:'M58 18 Q69 13 80 19',
  })[mood] || 'M58 21 Q69 16 80 22';

  // ── minimized pill ────────────────────────────────────────────────────────
  if (minimized) return (
    <div onClick={()=>setMinimized(false)} title="唤醒宠物" style={{
      position:'fixed',bottom:24,right:24,zIndex:9990,width:46,height:46,borderRadius:'50%',
      background:'#f8f4ec',border:'2.5px solid #1c1c1c',cursor:'pointer',
      display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,
      boxShadow:'0 3px 14px rgba(0,0,0,0.22)',animation:'rh-breathe 3.8s ease-in-out infinite',
    }}>🐾</div>
  );

  const posStyle = petLeft!==null
    ? {position:'fixed',left:petLeft,bottom:22,zIndex:9990,userSelect:'none'}
    : {position:'fixed',right:22,bottom:22,zIndex:9990,userSelect:'none'};

  // shared panel styles
  const tabStyle = (active) => ({
    flex:1, padding:'5px 0', fontFamily:'monospace', fontSize:9, letterSpacing:1.2,
    textTransform:'uppercase', border:'none', borderBottom: active ? `2px solid ${t?.ink||'#111'}` : '2px solid transparent',
    background:'transparent', color: active ? (t?.ink||'#111') : (t?.mute||'#888'),
    cursor:'pointer',
  });

  return (
    <div style={posStyle}>
      {/* × button */}
      <button onClick={e=>{e.stopPropagation();setMinimized(true);}} style={{
        position:'absolute',top:-10,right:-10,zIndex:12,width:22,height:22,borderRadius:'50%',
        background:'rgba(0,0,0,0.22)',border:'none',cursor:'pointer',color:'#fff',
        fontSize:11,fontWeight:700,lineHeight:'22px',textAlign:'center',
      }}>×</button>

      {/* ── Upgraded 3-tab panel ── */}
      {inputOpen&&(
        <div onClick={e=>e.stopPropagation()} style={{
          position:'absolute',bottom:'106%',right:0,background:t?.paper||'#fff',
          border:`2px solid ${t?.ink||'#111'}`,width:256,
          boxShadow:`4px 4px 0 ${t?.ink||'#111'}`,animation:'essay-fadein 0.15s ease',zIndex:11,
        }}>
          {/* tab bar */}
          <div style={{ display:'flex', borderBottom:`1.5px solid ${t?.rule||'#ddd'}`, padding:'0 2px' }}>
            {[['cmd','发指令'],['qa','问问我'],['help','帮助']].map(([id,label])=>(
              <button key={id} onClick={()=>setActiveTab(id)} style={tabStyle(activeTab===id)}>{label}</button>
            ))}
          </div>

          {/* ── CMD tab ── */}
          {activeTab==='cmd'&&(
            <div style={{ padding:'10px 12px' }}>
              <div style={{ fontFamily:t?.fontMono||'monospace', fontSize:9, color:t?.mute||'#888', marginBottom:6, letterSpacing:1.5 }}>ATLAS PET · 发指令</div>
              <input autoFocus value={inputVal}
                onChange={e=>setInputVal(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter'){handleCmd(inputVal);setInputOpen(false);}if(e.key==='Escape')setInputOpen(false);}}
                placeholder="散步、弹吉他、跳舞、工作…"
                style={{ width:'100%', border:`1.5px solid ${t?.rule||'#ddd'}`, padding:'6px 8px',
                  fontFamily:t?.fontCN||'sans-serif', fontSize:12, color:t?.ink||'#111',
                  background:t?.faint||'#f9f9f9', outline:'none', boxSizing:'border-box' }}/>
              <div style={{ display:'flex', gap:4, marginTop:8, flexWrap:'wrap' }}>
                {['散步','跑步','弹吉他','跳舞','转圈','工作','挥手','睡觉','回来'].map(h=>(
                  <button key={h} onClick={()=>{handleCmd(h);setInputOpen(false);}} style={{
                    padding:'2px 6px', fontFamily:t?.fontMono||'monospace', fontSize:8,
                    border:`1px solid ${t?.rule||'#ddd'}`, background:'transparent',
                    cursor:'pointer', color:t?.inkSoft||'#555', letterSpacing:0.5,
                  }}>{h}</button>
                ))}
              </div>
            </div>
          )}

          {/* ── Q&A tab ── */}
          {activeTab==='qa'&&(
            <div style={{ display:'flex', flexDirection:'column', height:280 }}>
              <div style={{ flex:1, overflowY:'auto', padding:'10px 12px', display:'flex', flexDirection:'column', gap:8 }}>
                {chatHistory.length===0&&(
                  <div style={{ fontFamily:t?.fontCN||'sans-serif', fontSize:12, color:t?.mute||'#999', textAlign:'center', marginTop:28, lineHeight:1.7 }}>
                    有任何关于 Atlas 的问题<br/>都可以问我～
                  </div>
                )}
                {chatHistory.map((msg,i)=>(
                  <div key={i} style={{ display:'flex', justifyContent: msg.role==='user'?'flex-end':'flex-start' }}>
                    <div style={{
                      maxWidth:'80%', padding:'7px 10px',
                      background: msg.role==='user' ? (t?.ink||'#111') : (t?.faint||'#f5f5f5'),
                      color: msg.role==='user' ? (t?.paper||'#fff') : (t?.ink||'#111'),
                      fontFamily: t?.fontCN||'sans-serif', fontSize:12, lineHeight:1.5,
                      border: msg.role==='pet' ? `1px solid ${t?.rule||'#ddd'}` : 'none',
                    }}>{msg.text}</div>
                  </div>
                ))}
                {mood==='think'&&(
                  <div style={{ display:'flex', justifyContent:'flex-start' }}>
                    <div style={{ padding:'7px 10px', border:`1px solid ${t?.rule||'#ddd'}`, color:t?.mute||'#888', fontFamily:t?.fontMono||'monospace', fontSize:10, letterSpacing:1 }}>思考中 ···</div>
                  </div>
                )}
                <div ref={chatEndRef}/>
              </div>
              <div style={{ borderTop:`1px solid ${t?.rule||'#ddd'}`, padding:'8px 10px', display:'flex', gap:6 }}>
                <input autoFocus={activeTab==='qa'} value={inputVal} onChange={e=>setInputVal(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter')handleQA(inputVal);if(e.key==='Escape')setInputOpen(false);}}
                  placeholder="问我任何关于 Atlas 的问题…"
                  style={{ flex:1, border:`1.5px solid ${t?.rule||'#ddd'}`, padding:'5px 8px', fontFamily:t?.fontCN||'sans-serif', fontSize:12, color:t?.ink||'#111', background:t?.faint||'#f9f9f9', outline:'none' }}/>
                <button onClick={()=>handleQA(inputVal)} style={{ padding:'5px 10px', border:`1.5px solid ${t?.ink||'#111'}`, background:t?.ink||'#111', color:t?.paper||'#fff', fontFamily:t?.fontMono||'monospace', fontSize:9, cursor:'pointer', letterSpacing:1 }}>↵</button>
              </div>
            </div>
          )}

          {/* ── Help tab ── */}
          {activeTab==='help'&&(
            <div style={{ padding:'10px 12px', maxHeight:260, overflowY:'auto' }}>
              <div style={{ fontFamily:t?.fontMono||'monospace', fontSize:9, color:t?.mute||'#888', marginBottom:10, letterSpacing:1.5 }}>QUICK HELP · 常见问题</div>
              {[
                ['如何开始生成报告？','在主页输入框描述你的需求，选择模型后点击 Generate。'],
                ['支持哪些 AI 模型？','Claude 全系列（Opus/Sonnet/Haiku）及自定义 OpenAI 兼容 API。'],
                ['报告如何导出？','报告页右上角 Export 按钮，支持 PDF / Markdown / HTML。'],
                ['如何自定义模板？','主页"Or pick a starter"区域底部有"＋ Add Template"入口。'],
                ['API Key 在哪里填？','顶部工具栏 → Model 图标 → 对应模型的密钥输入框。'],
                ['遇到问题去哪里反馈？','GitHub Issues 或邮件联系我们。'],
              ].map(([q,a],i)=>(
                <HelpItem key={i} t={t} q={q} a={a}/>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Speech bubble */}
      {bubble&&!inputOpen&&(
        <div style={{
          position:'absolute',bottom:'106%',right:0,background:t?.paper||'#fff',
          border:`1.5px solid ${t?.ink||'#111'}`,padding:'8px 14px',fontSize:12.5,
          fontFamily:t?.fontCN||'sans-serif',whiteSpace:'nowrap',color:t?.ink||'#111',
          boxShadow:`3px 3px 0 ${t?.ink||'#111'}`,animation:'essay-fadein 0.15s ease',
          zIndex:10,pointerEvents:'none',maxWidth:226,
        }}>
          {bubble}
          <div style={{position:'absolute',bottom:-9,right:26,borderLeft:'7px solid transparent',borderRight:'7px solid transparent',borderTop:`9px solid ${t?.ink||'#111'}`}}/>
          <div style={{position:'absolute',bottom:-7,right:27,borderLeft:'6px solid transparent',borderRight:'6px solid transparent',borderTop:`8px solid ${t?.paper||'#fff'}`}}/>
        </div>
      )}

      {/* Direction flip + SVG pet */}
      <div style={{transform:`scaleX(${facingRight?-1:1})`,display:'inline-block',transformOrigin:'50% 100%'}}>
        <svg viewBox="0 0 110 152" width={PET_W} height="138" style={{display:'block',overflow:'visible',cursor:'pointer'}}
          onClick={handlePetClick} title="点击互动 💬">

          {/* shadow */}
          <ellipse cx="55" cy="150" rx="28" ry="4.5" fill="rgba(0,0,0,0.09)" style={{filter:'blur(3px)'}}/>

          {/* LAYER: breathe */}
          <g style={{animation:'rh-breathe 3.8s cubic-bezier(0.45,0,0.55,1) infinite',transformOrigin:'55px 110px'}}>
          {/* LAYER: drift / vertical motion */}
          <g style={{animation:driftAnim}}>
          {/* LAYER: sway / tilt */}
          <g style={swayStyle}>

            {/* Left leg – pivot (44,108) */}
            <g transform="translate(44,108)">
              <g style={{transformOrigin:'0px 0px',...legLAnim}}>
                <path d="M0 0 Q-5 10 -7 20" stroke="#f8f4ec" strokeWidth="12.5" fill="none" strokeLinecap="round"/>
                <path d="M0 0 Q-5 10 -7 20" stroke="#1c1c1c" strokeWidth="14.5" fill="none" strokeLinecap="round" opacity="0.1"/>
                <circle cx="-7" cy="20" r="9" fill="#f8f4ec" stroke="#1c1c1c" strokeWidth="2.5"/>
              </g>
            </g>
            {/* Right leg – pivot (66,108) */}
            <g transform="translate(66,108)">
              <g style={{transformOrigin:'0px 0px',...legRAnim}}>
                <path d="M0 0 Q5 10 7 20" stroke="#f8f4ec" strokeWidth="12.5" fill="none" strokeLinecap="round"/>
                <path d="M0 0 Q5 10 7 20" stroke="#1c1c1c" strokeWidth="14.5" fill="none" strokeLinecap="round" opacity="0.1"/>
                <circle cx="7" cy="20" r="9" fill="#f8f4ec" stroke="#1c1c1c" strokeWidth="2.5"/>
              </g>
            </g>

            {/* Body */}
            <ellipse cx="55" cy="85" rx="26" ry="27" fill="#f8f4ec" stroke="#1c1c1c" strokeWidth="2.8"/>

            {/* Guitar prop */}
            {mood==='guitar'&&(
              <g transform="translate(2,52) rotate(-10,16,28)">
                <rect x="14" y="0" width="5.5" height="36" rx="2.5" fill="#5c3320" stroke="#1c1c1c" strokeWidth="1.2"/>
                <ellipse cx="16.5" cy="47" rx="14" ry="11.5" fill="#c0392b" stroke="#1c1c1c" strokeWidth="1.5"/>
                <ellipse cx="16.5" cy="47" rx="10" ry="8" fill="#e74c3c"/>
                <circle cx="16.5" cy="47" r="4.5" fill="#8B0000"/>
                {[10,18,26].map(y=><line key={y} x1="12" y1={y} x2="21" y2={y} stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>)}
                {[13,16.5,20].map(x=><line key={x} x1={x} y1="1" x2={x} y2="37" stroke="rgba(220,220,220,0.6)" strokeWidth="0.7"/>)}
                {[[9,2],[14,0],[19,0],[24,2]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="2.2" fill="#f0a500"/>)}
              </g>
            )}

            {/* Work tablet */}
            {mood==='work'&&(
              <g>
                <rect x="25" y="88" width="60" height="40" rx="4" fill="#1e1e2e" stroke="#1c1c1c" strokeWidth="1.8"/>
                <rect x="41" y="84" width="28" height="8" rx="4" fill="#888" stroke="#1c1c1c" strokeWidth="1.5"/>
                <rect x="29" y="95" width="32" height="3" rx="1.5" fill="#4ade80" opacity="0.85"/>
                <rect x="29" y="101" width="44" height="3" rx="1.5" fill="#4ade80" opacity="0.7"/>
                <rect x="29" y="107" width="26" height="3" rx="1.5" fill="#22d3ee" opacity="0.85"/>
                <rect x="29" y="113" width="36" height="3" rx="1.5" fill="#4ade80" opacity="0.6"/>
                <rect x="29" y="119" width="20" height="3" rx="1.5" fill="#f59e0b" opacity="0.8"/>
                <circle cx="71" cy="98" r="5" fill="#f59e0b" opacity="0.9"/>
              </g>
            )}

            {/* Left arm – pivot (30,80) */}
            <g transform="translate(30,80)">
              <g style={{transformOrigin:'0px 0px',...armLAnim}}>
                <path d="M0 0 Q-2 12 0 23" stroke="#f8f4ec" strokeWidth="12.5" fill="none" strokeLinecap="round"/>
                <path d="M0 0 Q-2 12 0 23" stroke="#1c1c1c" strokeWidth="14.5" fill="none" strokeLinecap="round" opacity="0.1"/>
                <circle cx="0" cy="23" r="9" fill="#f8f4ec" stroke="#1c1c1c" strokeWidth="2.5"/>
              </g>
            </g>
            {/* Right arm – pivot (80,80) */}
            <g transform="translate(80,80)">
              <g style={{transformOrigin:'0px 0px',...armRAnim}}>
                <path d="M0 0 Q2 12 0 23" stroke="#f8f4ec" strokeWidth="12.5" fill="none" strokeLinecap="round"/>
                <path d="M0 0 Q2 12 0 23" stroke="#1c1c1c" strokeWidth="14.5" fill="none" strokeLinecap="round" opacity="0.1"/>
                <circle cx="0" cy="23" r="9" fill="#f8f4ec" stroke="#1c1c1c" strokeWidth="2.5"/>
              </g>
            </g>

            {/* Think bubble */}
            {mood==='think'&&(
              <>
                <circle cx="78" cy="30" r="3" fill="#f8f4ec" stroke="#1c1c1c" strokeWidth="1.5"/>
                <circle cx="86" cy="20" r="5" fill="#f8f4ec" stroke="#1c1c1c" strokeWidth="1.8"/>
                <circle cx="97" cy="8" r="10" fill="#f8f4ec" stroke="#1c1c1c" strokeWidth="2"/>
                <text x="93" y="13" fontSize="12" fill="#1c1c1c">?</text>
              </>
            )}

            {/* HEAD layer */}
            <g style={{animation:'rh-head 4s ease-in-out -0.7s infinite'}}>
              <circle cx="55" cy="41" r="34" fill="#f8f4ec" stroke="#1c1c1c" strokeWidth="2.8"/>

              {isSleep&&<>
                <text x="76" y="22" fontSize="11" fontFamily="Georgia,serif" fill="#b0b0b0">z</text>
                <text x="84" y="13" fontSize="16" fontFamily="Georgia,serif" fill="#a0a0a0">Z</text>
                <text x="93" y="4"  fontSize="20" fontFamily="Georgia,serif" fill="#909090">Z</text>
              </>}
              {isSleep&&<path d="M55 62 Q56.5 70 56 75" stroke="rgba(150,200,255,0.5)" strokeWidth="4" fill="none" strokeLinecap="round"/>}

              {!isSleep&&mood!=='dance'&&<>
                <g style={{transformOrigin:'41px 37px'}}>
                  <circle cx="41" cy="37" r="12.5" fill="white" stroke="#1c1c1c" strokeWidth="2"/>
                  <circle cx={41+eyeShX} cy={37+eyeShY} r="7" fill="#1c1c1c"/>
                  <circle cx={38+eyeShX} cy={35+eyeShY} r="3" fill="white"/>
                </g>
                <ellipse cx="41" cy="26" rx="13" ry="10" fill="#f8f4ec"
                  style={{transform:blink?'translateY(14px)':'translateY(0px)',transition:'transform 0.07s',transformOrigin:'41px 26px'}}/>
                <g style={{transformOrigin:'69px 37px'}}>
                  <circle cx="69" cy="37" r="12.5" fill="white" stroke="#1c1c1c" strokeWidth="2"/>
                  <circle cx={69+eyeShX} cy={37+eyeShY} r="7" fill="#1c1c1c"/>
                  <circle cx={66+eyeShX} cy={35+eyeShY} r="3" fill="white"/>
                </g>
                <ellipse cx="69" cy="26" rx="13" ry="10" fill="#f8f4ec"
                  style={{transform:blink?'translateY(14px)':'translateY(0px)',transition:'transform 0.07s',transformOrigin:'69px 26px'}}/>
              </>}

              {isSleep&&<>
                <path d="M28 40 Q41 54 54 40" fill="none" stroke="#1c1c1c" strokeWidth="3" strokeLinecap="round"/>
                <path d="M56 40 Q69 54 82 40" fill="none" stroke="#1c1c1c" strokeWidth="3" strokeLinecap="round"/>
              </>}

              {mood==='dance'&&<>
                <circle cx="41" cy="37" r="12.5" fill="white" stroke="#1c1c1c" strokeWidth="2"/>
                <text x="33" y="43" fontSize="14" fill="#1c1c1c">★</text>
                <circle cx="69" cy="37" r="12.5" fill="white" stroke="#1c1c1c" strokeWidth="2"/>
                <text x="61" y="43" fontSize="14" fill="#1c1c1c">★</text>
              </>}

              {mood==='guitar'&&<>
                <rect x="27" y="28" width="28" height="16" rx="8" fill="rgba(10,10,10,0.88)"/>
                <rect x="55" y="28" width="28" height="16" rx="8" fill="rgba(10,10,10,0.88)"/>
                <line x1="27" y1="36" x2="55" y2="36" stroke="rgba(10,10,10,0.88)" strokeWidth="5"/>
              </>}

              <path d={browLd} fill="none" stroke="#1c1c1c" strokeWidth="2.5" strokeLinecap="round"/>
              <path d={browRd} fill="none" stroke="#1c1c1c" strokeWidth="2.5" strokeLinecap="round"/>

              <ellipse cx="24" cy="50" rx="7" ry="4.5" fill="#ff9090" opacity={blushOp} style={{transition:'opacity 0.4s'}}/>
              <ellipse cx="86" cy="50" rx="7" ry="4.5" fill="#ff9090" opacity={blushOp} style={{transition:'opacity 0.4s'}}/>

              {!isSleep&&<path d={mouthD} fill="none" stroke="#1c1c1c" strokeWidth="2.2" strokeLinecap="round"/>}

              {mood==='guitar'&&<>
                <text x="88" y="20" fontFamily="Georgia,serif" fontSize="18" fill="rgba(200,140,30,0.85)"
                  style={{animation:'rh-drift 0.5s ease-in-out infinite'}}>♪</text>
                <text x="96" y="11" fontFamily="Georgia,serif" fontSize="13" fill="rgba(200,140,30,0.7)"
                  style={{animation:'rh-drift 0.5s ease-in-out -0.25s infinite'}}>♩</text>
              </>}

            </g>

          </g>
          </g>
          </g>

        </svg>
      </div>
    </div>
  );
}

function HelpItem({ t, q, a }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ borderBottom:`1px solid ${t?.rule||'#eee'}`, paddingBottom:6, marginBottom:6 }}>
      <button onClick={()=>setOpen(o=>!o)} style={{ width:'100%', textAlign:'left', background:'none', border:'none', cursor:'pointer', padding:'3px 0', display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
        <span style={{ fontFamily:t?.fontCN||'sans-serif', fontSize:11.5, color:t?.ink||'#111', lineHeight:1.4 }}>{q}</span>
        <span style={{ fontFamily:t?.fontMono||'monospace', fontSize:10, color:t?.mute||'#888', flexShrink:0 }}>{open?'▲':'▼'}</span>
      </button>
      {open&&<div style={{ fontFamily:t?.fontCN||'sans-serif', fontSize:11, color:t?.mute||'#888', lineHeight:1.6, paddingTop:4, paddingLeft:2 }}>{a}</div>}
    </div>
  );
}

// ── Saved Reports Store ──────────────────────────────────────────────────────
const SAVED_REPORTS_KEY = 'atlas_saved_reports';

function useSavedReports() {
  const { user } = useAuth();
  const [reports, setReports] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(SAVED_REPORTS_KEY) || '[]'); } catch { return []; }
  });

  // Helper: get current Supabase session token for API calls
  const getToken = React.useCallback(async () => {
    try {
      const { supabase } = await import('./lib/supabase.js');
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch { return null; }
  }, []);

  // On login: fetch cloud reports and merge with localStorage
  React.useEffect(() => {
    if (!user) return;
    (async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const res = await fetch('/api/reports', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const cloud = await res.json();
        setReports(prev => {
          const localIds = new Set(prev.map(r => r.id));
          const merged = [
            ...prev,
            ...cloud
              .filter(r => !localIds.has(r.id))
              .map(r => ({ ...r, savedAt: r.created_at, meta: r.meta || {} })),
          ].sort((a, b) => new Date(b.savedAt || b.created_at) - new Date(a.savedAt || a.created_at));
          try { localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(merged)); } catch {}
          return merged;
        });
      } catch {}
    })();
  }, [user, getToken]);

  React.useEffect(() => {
    const handler = () => {
      try { setReports(JSON.parse(localStorage.getItem(SAVED_REPORTS_KEY) || '[]')); } catch {}
    };
    window.addEventListener('atlas-reports-updated', handler);
    return () => window.removeEventListener('atlas-reports-updated', handler);
  }, []);

  const save = React.useCallback((report) => {
    setReports(prev => {
      const next = [report, ...prev.filter(r => r.id !== report.id)];
      try { localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    // Async cloud sync — fire and forget
    (async () => {
      const token = await getToken();
      if (!token) return;
      try {
        await fetch('/api/reports', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: report.id, prompt: report.prompt, title: report.title,
            content: report.content, meta: report.meta || {},
          }),
        });
      } catch {}
    })();
  }, [getToken]);

  const toggleFav = React.useCallback((id) => {
    setReports(prev => {
      const next = prev.map(r => r.id === id ? { ...r, favorited: !r.favorited } : r);
      try { localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(next)); } catch {}
      // Sync favorited state to cloud meta
      const updated = next.find(r => r.id === id);
      if (updated) (async () => {
        const token = await getToken();
        if (!token) return;
        try {
          await fetch(`/api/reports/${id}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ meta: { ...(updated.meta || {}), favorited: updated.favorited } }),
          });
        } catch {}
      })();
      return next;
    });
  }, [getToken]);

  const setRating = React.useCallback((id, rating) => {
    setReports(prev => {
      const next = prev.map(r => r.id === id ? { ...r, rating: r.rating === rating ? null : rating } : r);
      try { localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(next)); } catch {}
      const updated = next.find(r => r.id === id);
      if (updated) (async () => {
        const token = await getToken();
        if (!token) return;
        try {
          await fetch(`/api/reports/${id}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ meta: { ...(updated.meta || {}), rating: updated.rating } }),
          });
        } catch {}
      })();
      return next;
    });
  }, [getToken]);

  const removeReports = React.useCallback((ids) => {
    const idSet = new Set(ids);
    setReports(prev => {
      const next = prev.filter(r => !idSet.has(r.id));
      try { localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    // Delete from cloud
    (async () => {
      const token = await getToken();
      if (!token) return;
      await Promise.allSettled([...idSet].map(id =>
        fetch(`/api/reports/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      ));
    })();
  }, [getToken]);

  return { reports, save, toggleFav, setRating, removeReports };
}

class ReportErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(err) { return { error: err }; }
  componentDidCatch(err, info) { console.error('[ReportErrorBoundary]', err, info); }
  render() {
    if (this.state.error) {
      const t = this.props.t || {};
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40, background: t.paper || '#f9f6f1' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#c53030', fontWeight: 700 }}>⚠ 报告渲染出错</div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#718096', maxWidth: 520, wordBreak: 'break-all', textAlign: 'center', lineHeight: 1.6 }}>
            {this.state.error?.message || String(this.state.error)}
          </div>
          <button onClick={() => this.setState({ error: null })}
            style={{ padding: '8px 20px', border: '1.5px solid currentColor', background: 'transparent', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Benchmark ────────────────────────────────────────────────────────────────
const BENCH_PROMPTS = [
  { id: 'industry', tag: '行业研究', target: 2000, prompt: '梳理 2025 年中国新能源汽车行业的竞争格局与关键趋势，给一份结构完整、数据可溯源的深度分析。' },
  { id: 'compete',  tag: '竞品对比', target: 2000, prompt: '对比 Notion 与飞书在团队协作场景下的产品策略、定价与适用团队，并给出选型建议。' },
  { id: 'data',     tag: '数据洞察', target: 2000, prompt: '分析国内咖啡连锁赛道近两年的门店扩张与单店模型变化，指出关键信号与拐点。' },
  { id: 'strategy', tag: '战略建议', target: 2000, prompt: '为一家中型 SaaS 公司制定进入东南亚市场的进入策略、节奏与主要风险评估。' },
  { id: 'weekly',   tag: '内部周报', target: 1200, prompt: '把以下零散信息整理成结构清晰的部门周报：本周完成 A、B；遇到 C 问题；下周计划 D、E。' },
];

function scoreColor(s, t) { return s >= 75 ? '#2a8c5c' : s >= 50 ? '#b45309' : s > 0 ? '#b04040' : t.mute; }

function BenchmarkPanel({ t, modelStore }) {
  const [tab, setTab] = React.useState('leaderboard');
  const [runs, setRuns] = React.useState(() => { try { return JSON.parse(localStorage.getItem('atlas_benchmark_runs') || '[]'); } catch { return []; } });
  const [selModels, setSelModels] = React.useState({});
  const [selPrompts, setSelPrompts] = React.useState(() => Object.fromEntries(BENCH_PROMPTS.map(p => [p.id, true])));
  const [mode, setMode] = React.useState('balanced');
  const [running, setRunning] = React.useState(false);
  const [progress, setProgress] = React.useState({ done: 0, total: 0, current: '' });

  const usableModels = (modelStore?.allModels || []).filter(m => m.apiKey || m.provider);

  // ── Passive leaderboard from saved reports ──────────────────────────────
  const leaderboard = React.useMemo(() => {
    let reports = []; try { reports = JSON.parse(localStorage.getItem('atlas_saved_reports') || '[]'); } catch {}
    const by = {};
    reports.forEach(r => {
      const name = r.meta?.model || '未知'; if (!r.text) return;
      const sc = scoreReport(r.text, r.meta?.length || parseInt(String(r.meta?.words || '0').replace(/,/g, ''), 10) || 2000);
      (by[name] ||= { name, n: 0, score: 0, words: 0, dur: [], good: 0, rated: 0, struct: 0, trunc: 0 });
      const b = by[name];
      b.n++; b.score += sc.score; b.words += sc.words; b.struct += sc.structureOk ? 1 : 0; b.trunc += sc.truncated ? 1 : 0;
      if (r.meta?.durationMs > 0) b.dur.push(r.meta.durationMs);
      if (r.rating === 'good') { b.good++; b.rated++; } else if (r.rating === 'bad') b.rated++;
    });
    return Object.values(by).map(b => ({
      name: b.name, n: b.n, avgScore: Math.round(b.score / b.n), avgWords: Math.round(b.words / b.n),
      avgDur: b.dur.length ? b.dur.reduce((a, c) => a + c, 0) / b.dur.length : 0,
      structRate: Math.round((b.struct / b.n) * 100), truncRate: Math.round((b.trunc / b.n) * 100),
      goodRate: b.rated ? Math.round((b.good / b.rated) * 100) : null,
    })).sort((a, b) => b.avgScore - a.avgScore);
  }, [tab]);

  // ── Active bake-off ─────────────────────────────────────────────────────
  const chosenModels = usableModels.filter(m => selModels[m.id]);
  const chosenPrompts = BENCH_PROMPTS.filter(p => selPrompts[p.id]);
  const estCost = React.useMemo(() => chosenModels.reduce((sum, m) => sum + chosenPrompts.reduce((s, p) => s + estimateGeneration(p.prompt.length, p.target, m.provider).usd, 0), 0), [chosenModels, chosenPrompts]);

  const runOne = (model, p) => new Promise(resolve => {
    let text = ''; const start = Date.now();
    const mp = GENERATION_MODES.find(g => g.id === mode) || {};
    streamReport({
      model, prompt: p.prompt,
      toolbarConfig: { length: p.target, temperature: mp.temperature, topP: mp.topP, frequencyPenalty: mp.frequencyPenalty },
      onChunk: c => { text += c; },
      onDone: (tokens) => resolve({ ok: true, text, tokens: tokens || 0, durationMs: Date.now() - start }),
      onError: (msg) => resolve({ ok: false, error: msg, text, durationMs: Date.now() - start }),
      onStatus: () => {},
    });
  });

  const runBenchmark = async () => {
    if (!chosenModels.length || !chosenPrompts.length) return;
    if (!confirm(`将运行 ${chosenModels.length} 模型 × ${chosenPrompts.length} 题 = ${chosenModels.length * chosenPrompts.length} 次真实生成，粗估成本 ≈$${estCost.toFixed(3)}。确认开始？`)) return;
    setRunning(true);
    const total = chosenModels.length * chosenPrompts.length;
    let done = 0; const fresh = [];
    for (const m of chosenModels) {
      for (const p of chosenPrompts) {
        setProgress({ done, total, current: `${m.name} · ${p.tag}` });
        const res = await runOne(m, p);
        const sc = res.ok ? scoreReport(res.text, p.target) : { score: 0, words: 0, sections: 0, citations: 0, truncated: true, structureOk: false };
        fresh.push({ at: Date.now(), model: m.name, provider: m.provider || '', promptId: p.id, promptTag: p.tag, mode, ok: res.ok, error: res.error || '', durationMs: res.durationMs, tokens: res.tokens || 0, ...sc });
        done++; setProgress({ done, total, current: `${m.name} · ${p.tag}` });
      }
    }
    const next = [...fresh, ...runs].slice(0, 200);
    setRuns(next); try { localStorage.setItem('atlas_benchmark_runs', JSON.stringify(next)); } catch {}
    setRunning(false); setTab('results');
  };

  // results grid: latest run per (model, promptId)
  const latestByCell = React.useMemo(() => {
    const map = {}; runs.forEach(r => { const k = r.model + '|' + r.promptId; if (!map[k]) map[k] = r; }); return map;
  }, [runs]);
  const resultModels = [...new Set(runs.map(r => r.model))];

  const cardBtn = { padding: '6px 14px', fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 10, letterSpacing: 1, cursor: 'pointer', border: 'none', textTransform: 'uppercase' };
  const th = { fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 0.5, textAlign: 'left', padding: '7px 10px', borderBottom: `1.5px solid ${t.ink}` };
  const td = { fontFamily: t.fontMono, fontSize: 11, color: t.ink, padding: '7px 10px', borderBottom: `1px solid ${t.rule}` };
  const fmtDur = (ms) => ms ? (ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`) : '—';

  return (
    <div style={{ flex: 1, background: t.paper, color: t.ink, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto' }}>
      {/* Masthead */}
      <div style={{ padding: '32px 44px 22px', borderBottom: `2px solid ${t.ink}` }}>
        <Tag t={t} accent>◆ BENCHMARK · 模型评测</Tag>
        <div style={{ fontFamily: t.fontDisplay, fontWeight: 900, fontSize: 46, letterSpacing: -1.5, lineHeight: 1, marginTop: 12 }}>
          Which model writes <span style={{ fontFamily: t.fontSerif, fontStyle: 'italic', color: t.accent }}>better</span>?
        </div>
        <div style={{ fontFamily: t.fontCN, fontSize: 13, color: t.mute, marginTop: 8 }}>客观打分(结构 / 字数达标 / 截断 / 引用)横评模型,叠加你的好评率,得出最适合你的配置。</div>
      </div>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${t.rule}`, padding: '0 44px', gap: 4 }}>
        {[['leaderboard', '历史榜单'], ['run', '主动横评'], ['results', '评测结果']].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: '12px 18px', fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 11, letterSpacing: 1, background: 'transparent', border: 'none', cursor: 'pointer', textTransform: 'uppercase', color: tab === k ? t.ink : t.mute, borderBottom: tab === k ? `2.5px solid ${t.accent}` : '2.5px solid transparent', marginBottom: -1 }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: '26px 44px 56px', maxWidth: 1120, width: '100%' }}>
        {/* ── Leaderboard (passive) ───────────────────────────── */}
        {tab === 'leaderboard' && (
          leaderboard.length === 0
            ? <div style={{ padding: '40px 16px', border: `1px dashed ${t.rule}`, fontFamily: t.fontCN, fontSize: 14, color: t.mute, textAlign: 'center' }}>暂无历史数据 · 生成几篇报告后,这里会按模型给出质量榜单</div>
            : <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={th}>#</th><th style={th}>模型</th><th style={{ ...th, textAlign: 'right' }}>质量分</th><th style={{ ...th, textAlign: 'right' }}>篇数</th><th style={{ ...th, textAlign: 'right' }}>平均字数</th><th style={{ ...th, textAlign: 'right' }}>平均耗时</th><th style={{ ...th, textAlign: 'right' }}>结构合格</th><th style={{ ...th, textAlign: 'right' }}>好评率</th></tr></thead>
                <tbody>{leaderboard.map((r, i) => (
                  <tr key={r.name}>
                    <td style={{ ...td, color: t.mute }}>{i + 1}</td>
                    <td style={{ ...td, fontFamily: t.fontCN, fontSize: 13, fontWeight: 600 }}>{r.name}</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: scoreColor(r.avgScore, t), fontSize: 14 }}>{r.avgScore}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{r.n}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{r.avgWords.toLocaleString()}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{fmtDur(r.avgDur)}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{r.structRate}%</td>
                    <td style={{ ...td, textAlign: 'right', color: r.goodRate == null ? t.mute : scoreColor(r.goodRate, t) }}>{r.goodRate == null ? '—' : r.goodRate + '%'}</td>
                  </tr>
                ))}</tbody>
              </table>
        )}

        {/* ── Run (active bake-off) ───────────────────────────── */}
        {tab === 'run' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
              <div>
                <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.4, marginBottom: 10 }}>选择模型 · MODELS</div>
                {usableModels.length === 0 && <div style={{ fontFamily: t.fontCN, fontSize: 12, color: t.mute }}>没有可用模型,请先在 设置→模型 配置密钥</div>}
                {usableModels.map(m => (
                  <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!selModels[m.id]} onChange={e => setSelModels(s => ({ ...s, [m.id]: e.target.checked }))}/>
                    <span style={{ fontFamily: t.fontCN, fontSize: 13 }}>{m.name}</span>
                    <span style={{ fontFamily: t.fontMono, fontSize: 9, color: m.apiKey ? '#2a8c5c' : t.mute }}>{m.apiKey ? 'KEY ✓' : '服务端密钥'}</span>
                  </label>
                ))}
              </div>
              <div>
                <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.4, marginBottom: 10 }}>评测题 · PROMPTS</div>
                {BENCH_PROMPTS.map(p => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!selPrompts[p.id]} onChange={e => setSelPrompts(s => ({ ...s, [p.id]: e.target.checked }))}/>
                    <span style={{ fontFamily: t.fontCN, fontSize: 13 }}>{p.tag}</span>
                    <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>{p.target}字</span>
                  </label>
                ))}
                <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.4, margin: '14px 0 8px' }}>生成模式</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {GENERATION_MODES.map(g => (
                    <button key={g.id} onClick={() => setMode(g.id)} style={{ padding: '4px 12px', fontFamily: t.fontMono, fontSize: 10, border: `1px solid ${mode === g.id ? t.accent : t.rule}`, background: mode === g.id ? t.accent : 'transparent', color: mode === g.id ? '#fff' : t.ink, cursor: 'pointer' }}>{g.cn}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 24, paddingTop: 18, borderTop: `1px solid ${t.rule}`, display: 'flex', alignItems: 'center', gap: 14 }}>
              <button onClick={runBenchmark} disabled={running || !chosenModels.length || !chosenPrompts.length}
                style={{ ...cardBtn, background: t.accent, color: '#fff', padding: '10px 22px', opacity: (running || !chosenModels.length || !chosenPrompts.length) ? 0.5 : 1 }}>
                {running ? `评测中… ${progress.done}/${progress.total}` : '▶ 开始评测'}
              </button>
              {!running && chosenModels.length > 0 && chosenPrompts.length > 0 && (
                <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>{chosenModels.length}×{chosenPrompts.length} = {chosenModels.length * chosenPrompts.length} 次 · 粗估 ≈${estCost.toFixed(3)}</span>
              )}
              {running && <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.accent }}>正在生成：{progress.current}</span>}
            </div>
          </div>
        )}

        {/* ── Results grid ────────────────────────────────────── */}
        {tab === 'results' && (
          runs.length === 0
            ? <div style={{ padding: '40px 16px', border: `1px dashed ${t.rule}`, fontFamily: t.fontCN, fontSize: 14, color: t.mute, textAlign: 'center' }}>还没有评测结果 · 去「主动横评」跑一轮</div>
            : <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                  <thead><tr><th style={th}>评测题</th>{resultModels.map(m => <th key={m} style={{ ...th, textAlign: 'center' }}>{m}</th>)}</tr></thead>
                  <tbody>
                    {BENCH_PROMPTS.filter(p => runs.some(r => r.promptId === p.id)).map(p => (
                      <tr key={p.id}>
                        <td style={{ ...td, fontFamily: t.fontCN, fontSize: 12 }}>{p.tag}</td>
                        {resultModels.map(m => { const c = latestByCell[m + '|' + p.id]; return (
                          <td key={m} style={{ ...td, textAlign: 'center' }} title={c ? `${c.words}字 · ${c.sections}章 · ${c.citations}引用 · ${fmtDur(c.durationMs)}${c.error ? ' · ' + c.error : ''}` : ''}>
                            {c ? <span style={{ fontWeight: 700, color: scoreColor(c.score, t) }}>{c.score}</span> : <span style={{ color: t.mute }}>—</span>}
                          </td>
                        ); })}
                      </tr>
                    ))}
                    <tr>
                      <td style={{ ...td, fontFamily: t.fontMono, fontSize: 10, color: t.mute, fontWeight: 700 }}>平均分</td>
                      {resultModels.map(m => { const rs = runs.filter(r => r.model === m); const avg = rs.length ? Math.round(rs.reduce((a, c) => a + c.score, 0) / rs.length) : 0; return (
                        <td key={m} style={{ ...td, textAlign: 'center', fontWeight: 800, color: scoreColor(avg, t), fontSize: 14 }}>{avg}</td>
                      ); })}
                    </tr>
                  </tbody>
                </table>
                <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginTop: 10 }}>格子为综合质量分(0–100),悬停看字数/章节/引用/耗时。</div>
              </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const { user, team, loading: authLoading } = useAuth();
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const t = essayTokens({ theme: tweaks.theme, accent: tweaks.accent });

  const modelStore = useModelStore();
  const toolbarStore = useToolbarStore();
  const savedReports = useSavedReports();
  const teamKnowledge = useTeamKnowledge();
  const [activeReportId, setActiveReportId] = React.useState(null);

  // Sync team languages into toolbarStore
  React.useEffect(() => {
    toolbarStore.setTeamLanguages(teamKnowledge.languages);
  }, [teamKnowledge.languages]);

  // Deep-link & invite-link: read URL params on startup
  const [deepLinkId] = React.useState(() => new URLSearchParams(window.location.search).get('r') || null);
  const [inviteToken] = React.useState(() => new URLSearchParams(window.location.search).get('invite') || null);
  const deepLinkHandled = React.useRef(false);
  React.useEffect(() => {
    if (!deepLinkId || deepLinkHandled.current) return;
    const found = savedReports.reports.find(r => r.id === deepLinkId);
    if (found) {
      deepLinkHandled.current = true;
      setActiveReportId(found.id);
      setRoute('report');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [deepLinkId, savedReports.reports]);

  // MCP OAuth callback (untested e2e) — exchange ?code if it matches a pending MCP state
  const mcpOAuthHandled = React.useRef(false);
  React.useEffect(() => {
    if (mcpOAuthHandled.current || !user) return;
    mcpOAuthHandled.current = true;
    completeMcpOAuth().catch(() => {});
  }, [user]);

  const inviteHandled = React.useRef(false);
  React.useEffect(() => {
    if (!inviteToken || inviteHandled.current || !user) return;
    inviteHandled.current = true;
    window.history.replaceState({}, '', window.location.pathname);
    import('./lib/supabase.js').then(({ supabase }) =>
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.access_token) return;
        return fetch(`/api/teams/invite?token=${encodeURIComponent(inviteToken)}`, {
          method: 'POST', headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        }).then(r => r.json()).then(data => {
          if (data.success) { alert('成功加入团队！'); window.location.reload(); }
          else alert(data.error || '邀请链接无效或已过期');
        }).catch(() => alert('加入团队失败，请稍后重试'));
      })
    );
  }, [inviteToken, user]);

  const [route, setRoute] = React.useState('home');
  const [prompt, setPrompt] = React.useState(SAMPLE_FIRST_PROMPT);
  const [showExport, setShowExport] = React.useState(false);
  const [runKey, setRunKey] = React.useState(0);
  const [runDone, setRunDone] = React.useState(false);
  const [parallelSections, setParallelSections] = React.useState(null);
  const [outlineMode, setOutlineModeState] = React.useState(
    () => localStorage.getItem('atlas_outline_mode') === 'true'
  );
  const setOutlineMode = (v) => {
    setOutlineModeState(v);
    localStorage.setItem('atlas_outline_mode', String(v));
  };
  const [researchMode, setResearchModeState] = React.useState(
    () => localStorage.getItem('atlas_research_mode') === 'true'
  );
  const setResearchMode = (v) => {
    setResearchModeState(v);
    localStorage.setItem('atlas_research_mode', String(v));
  };

  const goRun = () => {
    if (!allowDailyGen()) return;
    setActiveReportId(null); setRunKey(k => k + 1); setRunDone(false);
    setParallelSections(null);
    const hasTemplate = !!toolbarStore.activeTemplate;
    const hasModel = !!modelStore.selected;
    setRoute(outlineMode && !hasTemplate && hasModel ? 'outline' : 'running');
  };

  const [bgTaskStatus, setBgTaskStatus] = React.useState(null); // null | 'queued' | 'running' | 'done' | 'failed'
  const [bgTaskId, setBgTaskId] = React.useState(null);

  const goBackground = React.useCallback(async () => {
    if (!prompt.trim()) return;
    if (!allowDailyGen()) return;
    setBgTaskStatus('queued');
    try {
      const { supabase } = await import('./lib/supabase.js');
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { setBgTaskStatus('failed'); return; }

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'full',
          input: {
            prompt,
            model: modelStore.selected?.id,
            provider: modelStore.selected?.provider,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 8000,
            temperature: modelStore.temperature,
          },
        }),
      });
      if (!res.ok) { setBgTaskStatus('failed'); return; }
      const { taskId } = await res.json();
      setBgTaskId(taskId);
      setBgTaskStatus('running');

      // Poll for completion
      const poll = setInterval(async () => {
        const r = await fetch(`/api/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) return;
        const task = await r.json();
        setBgTaskStatus(task.status);
        if (task.status === 'done' || task.status === 'failed') {
          clearInterval(poll);
          if (task.status === 'done') {
            // Reload reports from cloud to pick up new report
            window.dispatchEvent(new Event('atlas-reports-updated'));
          }
        }
      }, 3000);
    } catch { setBgTaskStatus('failed'); }
  }, [prompt, modelStore]);


  const goWorkflow = () => {
    if (!prompt.trim()) return;
    if (!allowDailyGen()) return;
    setWfMode('linear');
    setRoute('workflow');
  };
  const goWorkflowCanvas = () => { setWfMode('canvas'); setRoute('workflow'); };

  const { workflows, saving: wfSaving, running: wfRunning, runStatus: wfRunStatus,
          saveWorkflow, runWorkflow } = useWorkflow();
  const [wfMode, setWfMode] = React.useState('linear');
  const [activeWfId, setActiveWfId] = React.useState(null);

  const handleOutlineConfirm = (sections) => {
    const withIds = sections.map((s, i) => ({ ...s, id: `outline_${i}` }));
    setParallelSections(withIds);
    setActiveReportId(null);
    setRoute('parallel');
  };

  const handleSaveReport = React.useCallback((report) => {
    savedReports.save(report);
    setActiveReportId(report.id);
  }, [savedReports]);

  const activeReport = activeReportId ? savedReports.reports.find(r => r.id === activeReportId) : null;
  const reportData = activeReport ? { id: activeReport.id, meta: activeReport.meta, metrics: [], sections: activeReport.sections, refs: activeReport.refs || [], attachments: activeReport.attachments || [] } : null;

  const handleShareToTeam = React.useCallback(async () => {
    if (!activeReport || !team) return;
    try {
      const { supabase } = await import('./lib/supabase.js');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const title = activeReport.meta?.titleEn || activeReport.meta?.title?.en || activeReport.prompt?.slice(0, 60) || '无标题';
      const wordCount = parseInt((activeReport.meta?.words || '0').replace(/,/g, ''), 10) || 0;
      const res = await fetch('/api/teams/reports', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          prompt: activeReport.prompt || '',
          content: { text: activeReport.text || '', sections: activeReport.sections || [] },
          wordCount,
          sharedByEmail: user?.email || '',
        }),
      });
      if (res.ok) alert('报告已分享到团队报告库');
      else {
        let msg = `分享失败 (${res.status})`;
        try { const d = await res.json(); msg = d.error || d.message || msg; } catch {}
        alert(msg);
      }
    } catch (e) { alert('分享失败：' + (e?.message || '网络错误')); }
  }, [activeReport, team, user]);

  const footer = FOOTER_CONTEXT[route] || FOOTER_CONTEXT.home;

  // Map tweak accent (named) → hex (already keyed in essayTokens)
  const accentSwatches = [
    { v: 'red',    swatch: '#e5251d', label: 'Red' },
    { v: 'amber',  swatch: '#c2540a', label: 'Amber' },
    { v: 'forest', swatch: '#1f6f44', label: 'Sage' },
    { v: 'cobalt', swatch: '#1d4ed8', label: 'Blue' },
  ];

  // Auth loading splash
  if (authLoading) return (
    <div style={{ width: '100vw', height: '100vh', background: '#fbf9f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#767368', letterSpacing: 1.4 }}>ATLAS …</span>
    </div>
  );

  // Not logged in — show login modal (uses computed theme so user's theme pref is respected)
  if (!user) return <LoginModal t={t} />;

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: t.paper, color: t.ink,
    }}>
      <TopBar t={t} route={route} setRoute={setRoute}
        onNavClick={(k) => { if (k === 'workflow') { setWfMode('canvas'); setRoute('workflow'); } else setRoute(k); }}
        runState={route === 'running' && !runDone ? 'running' : 'idle'}
        tweaks={tweaks} setTweak={setTweak} modelStore={modelStore} toolbarStore={toolbarStore}
        outlineMode={outlineMode} setOutlineMode={setOutlineMode}
        researchMode={researchMode} setResearchMode={setResearchMode}/>
      <main style={{ flex: 1, minHeight: 0, display: 'flex', position: 'relative' }}>
        {route === 'home' && (
          <Home t={t} prompt={prompt} setPrompt={setPrompt}
            onStart={goRun} onBackground={goBackground} onWorkflow={goWorkflow} bgTaskStatus={bgTaskStatus}
            density={tweaks.density} modelStore={modelStore}
            toolbarStore={toolbarStore} onNavigateSources={() => setRoute('sources')}
            teamTemplates={teamKnowledge.templates}/>
        )}
        {route === 'team' && (
          <TeamPanel t={t} modelStore={modelStore} onBack={() => setRoute('home')}/>
        )}
        {route === 'outline' && (
          <OutlineStep t={t} prompt={prompt} modelStore={modelStore}
            toolbarConfig={{
              language: toolbarStore.currentLanguage,
            }}
            onConfirm={handleOutlineConfirm}
            onSkip={() => { setActiveReportId(null); setRunKey(k => k + 1); setRunDone(false); setRoute('running'); }}/>
        )}
        {route === 'parallel' && parallelSections && (
          <ParallelDraft t={t} topic={prompt} sections={parallelSections}
            modelStore={modelStore}
            toolbarConfig={{
              tone: toolbarStore.currentTone,
              language: toolbarStore.currentLanguage,
              style: toolbarStore.currentStyle,
              length: toolbarStore.effectiveLength,
              urlContexts: toolbarStore.urlContexts,
              searchContexts: toolbarStore.searchContexts,
            }}
            onSaveReport={handleSaveReport}
            onDone={() => setRoute('report')}
            onBack={() => setRoute('outline')}/>
        )}
        {route === 'running' && (
          <Running key={runKey} t={t} prompt={prompt}
            onDone={() => setRoute('report')}
            onTimelineComplete={() => setRunDone(true)}
            marginaliaOn={tweaks.marginalia} density={tweaks.density}
            researchMode={researchMode}
            modelStore={modelStore} toolbarConfig={{
              tone: toolbarStore.currentTone,
              language: toolbarStore.currentLanguage,
              style: toolbarStore.currentStyle,
              length: toolbarStore.effectiveLength,
              selectedSources: toolbarStore.selectedSources,
              attachments: toolbarStore.attachments,
              urlContexts: toolbarStore.urlContexts,
              searchContexts: toolbarStore.searchContexts,
              temperature: modelStore.temperature,
              systemPromptExtra: [modelStore.systemPromptExtra, ...teamKnowledge.promptExtras].filter(Boolean).join('\n\n'),
              topP: modelStore.topP,
              frequencyPenalty: modelStore.frequencyPenalty,
              presencePenalty: modelStore.presencePenalty,
              maxTokensOverride: modelStore.maxTokensOverride,
              templateSections: toolbarStore.activeTemplate?.sections,
            }}
            onSaveReport={handleSaveReport}/>
        )}
        {route === 'report' && (
          <ReportErrorBoundary t={t}>
            <Report t={t} onExport={() => setShowExport(true)}
              marginaliaOn={tweaks.marginalia} density={tweaks.density}
              reportData={reportData}
              modelStore={modelStore}
              isFavorited={activeReport?.favorited || false}
              onToggleFavorite={activeReport ? () => savedReports.toggleFav(activeReportId) : null}
              rating={activeReport?.rating || null}
              onRate={activeReport ? (r) => savedReports.setRating(activeReportId, r) : null}
              onRerun={activeReport ? () => { setPrompt(activeReport.prompt); goRun(); } : null}
              toolbarStore={toolbarStore}
              onSaveReport={activeReport ? (updated) => savedReports.save({ ...updated, id: activeReport.id }) : null}
              onShareToTeam={activeReport && team ? handleShareToTeam : null}
              onUpdate={activeReport ? () => {
                const outline = (activeReport.sections || []).map(s => `- ${s.en}`).join('\n');
                setPrompt(`【增量更新】请基于下面这篇已有报告，用最新数据/进展更新，保留原章节结构，并在相应处明确标注「新增」或「变化」。\n\n原主题：${activeReport.prompt || ''}\n原章节结构：\n${outline}`);
                goRun();
              } : null}
              onFollowUp={(followText) => {
                const base = activeReport?.prompt || prompt;
                setPrompt(`【追问】在下面的报告基础上：${base}\n\n【新要求】${followText}`);
                goRun();
              }}/>
          </ReportErrorBoundary>
        )}
        {route === 'library' && (
          <Library t={t}
            savedReports={savedReports.reports}
            onToggleFavorite={savedReports.toggleFav}
            onRate={savedReports.setRating}
            onOpen={(entry) => {
              if (entry._id) setActiveReportId(entry._id);
              else setActiveReportId(null);
              setRoute('report');
            }}/>
        )}
        {route === 'workflow' && wfMode === 'linear' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
            <WorkflowView t={t} topic={prompt}
              modelStore={modelStore}
              toolbarConfig={{ language: toolbarStore.currentLanguage }}
              onSaveReport={handleSaveReport}
              onBack={(dest) => { setRoute(dest || 'home'); }}/>
            <button onClick={() => setWfMode('canvas')}
              style={{ position: 'absolute', top: 10, right: 16, fontSize: 11, padding: '3px 10px',
                       border: '1px solid #ccc', borderRadius: 4, background: '#fff',
                       color: '#767368', cursor: 'pointer', zIndex: 10 }}>
              切换画布模式
            </button>
          </div>
        )}
        {route === 'workflow' && wfMode === 'canvas' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ padding: '8px 20px', borderBottom: '1px solid #e0ddd6', background: '#faf9f6', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <button onClick={() => setRoute('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10, color: '#999', letterSpacing: 0.8 }}>← 返回</button>
              <span style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: 1.5, color: '#999' }}>WORKFLOW CANVAS</span>
              <span style={{ flex: 1 }}/>
              <button onClick={() => setWfMode('linear')} style={{ fontSize: 11, padding: '3px 10px', border: '1px solid #ddd', borderRadius: 4, background: '#fff', color: '#767368', cursor: 'pointer' }}>切换线性模式</button>
            </div>
            <WorkflowCanvas t={t}
              workflow={activeWfId ? workflows.find(w => w.id === activeWfId) : null}
              saving={wfSaving} running={wfRunning} runStatus={wfRunStatus}
              loggedIn={!!user}
              onSave={async (def) => {
                const id = await saveWorkflow({ id: activeWfId, ...def });
                if (!activeWfId) setActiveWfId(id);
              }}
              onRun={async (def) => {
                let id = activeWfId;
                if (!id) { id = await saveWorkflow(def); setActiveWfId(id); }
                await runWorkflow(id);
              }}
            />
          </div>
        )}
        {route === 'sources' && <Sources t={t}/>}
        {route === 'benchmark' && <BenchmarkPanel t={t} modelStore={modelStore}/>}
        {showExport && (
          <ExportModal t={t} onClose={() => setShowExport(false)}
            exportData={activeReport ? {
              id: activeReport.id,
              title: activeReport.meta?.titleEn || activeReport.meta?.title?.en || activeReport.prompt?.slice(0,40),
              subtitle: activeReport.meta?.subtitle || activeReport.prompt?.slice(0,80),
              sections: activeReport.sections,
              refs: activeReport.refs || [],
              meta: activeReport.meta,
            } : {
              id: 'static-241',
              title: 'Cold brew, hotter capital.',
              subtitle: '2025 Q1 国内咖啡赛道融资速记',
              sections: REPORT_SECTIONS,
              refs: REPORT_REFS,
              meta: REPORT_META,
            }}/>
        )}
      </main>
      <IssueFooter t={t} page={footer.page} section={footer.section}/>
      <PetWidget t={t}/>

      <TweaksPanel title="Tweaks · 微调">
        <TweakSection label="Color · 颜色">
          <div style={{ padding: '4px 0' }}>
            <SwatchPicker t={t} label="Accent · 主色"
              value={tweaks.accent}
              options={accentSwatches}
              onChange={v => setTweak('accent', v)}/>
          </div>
          <TweakRadio label="Theme · 主题" value={tweaks.theme}
            options={[
              { value: 'cream', label: 'Cream' },
              { value: 'slate', label: 'Slate' },
            ]}
            onChange={v => setTweak('theme', v)}/>
        </TweakSection>

        <TweakSection label="Density · 密度">
          <TweakRadio label="Type scale" value={tweaks.density}
            options={[
              { value: 'editorial', label: 'Editorial' },
              { value: 'compact',   label: 'Compact' },
            ]}
            onChange={v => setTweak('density', v)}/>
          <TweakToggle label="Marginalia · 边注列" value={tweaks.marginalia}
            onChange={v => setTweak('marginalia', v)}/>
        </TweakSection>

        <TweakSection label="Demo · 跳转">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: '4px 0' }}>
            <DemoBtn onClick={() => setRoute('home')}>① Home 主页</DemoBtn>
            <DemoBtn onClick={goRun}>② Running 运行</DemoBtn>
            <DemoBtn onClick={() => setRoute('report')}>③ Report 报告</DemoBtn>
            <DemoBtn onClick={() => setRoute('library')}>④ Library 库</DemoBtn>
            <DemoBtn onClick={() => setRoute('sources')}>⑤ Sources 数据源</DemoBtn>
            <DemoBtn onClick={() => setShowExport(true)}>⑥ Export 导出</DemoBtn>
          </div>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

// Custom swatch picker (TweakColor wants hex options but I'm keying by name)
function SwatchPicker({ t, label, value, options, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
      <div style={{
        fontSize: 11, color: '#555', letterSpacing: 0.3, fontFamily: 'inherit',
      }}>{label}</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {options.map(o => (
          <button key={o.v} type="button" onClick={() => onChange(o.v)}
            title={o.label}
            style={{
              width: 32, height: 32, border: value === o.v ? '2px solid #111' : '1px solid #ccc',
              background: o.swatch, cursor: 'pointer', padding: 0,
              boxShadow: value === o.v ? '0 0 0 2px #fff inset' : 'none',
            }}/>
        ))}
      </div>
    </div>
  );
}

function DemoBtn({ children, onClick }) {
  return (
    <button type="button" onClick={onClick}
      style={{
        padding: '7px 8px', fontSize: 11, fontFamily: 'inherit',
        border: '1px solid #d4d4d4', background: '#fff', color: '#111',
        cursor: 'pointer', textAlign: 'left',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
      onMouseLeave={e => e.currentTarget.style.background = '#fff'}>{children}</button>
  );
}



export default App;
