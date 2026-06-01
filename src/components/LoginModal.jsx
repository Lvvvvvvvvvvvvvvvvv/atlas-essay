import React from 'react';
import { useAuth } from '../hooks/useAuth';

const MODES = { signin: '登录', signup: '注册', magic: '邮件登录' };

export default function LoginModal({ t }) {
  const { signIn, signUp, signInMagic } = useAuth();
  const [mode,   setMode]   = React.useState('signin');
  const [email,  setEmail]  = React.useState('');
  const [pw,     setPw]     = React.useState('');
  const [status, setStatus] = React.useState('idle'); // idle | loading | error | sent
  const [errMsg, setErrMsg] = React.useState('');

  const inp = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', border: `1px solid ${t.rule}`,
    background: t.paper, color: t.ink,
    fontFamily: t.fontMono, fontSize: 12, outline: 'none',
    marginBottom: 10,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading'); setErrMsg('');
    let res;
    if (mode === 'magic') {
      res = await signInMagic(email);
      if (!res.error) { setStatus('sent'); return; }
    } else if (mode === 'signup') {
      res = await signUp(email, pw);
    } else {
      res = await signIn(email, pw);
    }
    if (res.error) { setErrMsg(res.error.message); setStatus('error'); }
    else setStatus('idle');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: t.paper,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 380, padding: '40px 0' }}>
        {/* Logo */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 22, letterSpacing: 3, textTransform: 'uppercase', color: t.ink }}>Atlas</div>
          <div style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 1.4, marginTop: 4 }}>ESSAYS · REPORT AGENT</div>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: `1px solid ${t.rule}` }}>
          {Object.entries(MODES).map(([k, label]) => (
            <button key={k} onClick={() => { setMode(k); setStatus('idle'); setErrMsg(''); }}
              style={{
                padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1,
                color: mode === k ? t.ink : t.mute,
                borderBottom: mode === k ? `2px solid ${t.accent}` : '2px solid transparent',
                marginBottom: -1,
              }}>
              {label}
            </button>
          ))}
        </div>

        {status === 'sent' ? (
          <div style={{ fontFamily: t.fontCN, fontSize: 14, color: t.ink, lineHeight: 1.8 }}>
            ✓ 邮件已发送<br/>
            <span style={{ fontSize: 12, color: t.mute }}>请查收 {email} 的登录链接</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1, marginBottom: 5 }}>EMAIL</div>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" style={inp}
              autoFocus
            />

            {mode !== 'magic' && (
              <>
                <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1, marginBottom: 5 }}>
                  {mode === 'signup' ? 'SET PASSWORD' : 'PASSWORD'}
                </div>
                <input
                  type="password" required value={pw} onChange={e => setPw(e.target.value)}
                  placeholder="••••••••" style={inp}
                />
              </>
            )}

            {errMsg && (
              <div style={{ fontFamily: t.fontMono, fontSize: 10, color: '#e5251d', marginBottom: 10 }}>
                ✕ {errMsg}
              </div>
            )}

            <button type="submit" disabled={status === 'loading'}
              style={{
                width: '100%', padding: '10px', border: 'none',
                background: status === 'loading' ? t.rule : t.ink,
                color: t.paper,
                fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 12, letterSpacing: 1.2,
                textTransform: 'uppercase', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              }}>
              {status === 'loading' ? '…' : MODES[mode]}
            </button>
          </form>
        )}

        <div style={{ marginTop: 20, fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 0.5 }}>
          {mode === 'signin' && <>还没有账户？<button onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', color: t.accent, cursor: 'pointer', fontFamily: t.fontMono, fontSize: 9 }}>注册</button></>}
          {mode === 'signup' && <>已有账户？<button onClick={() => setMode('signin')} style={{ background: 'none', border: 'none', color: t.accent, cursor: 'pointer', fontFamily: t.fontMono, fontSize: 9 }}>登录</button></>}
          {mode === 'magic'  && <>输入邮箱，我们发送无密码登录链接</>}
        </div>
      </div>
    </div>
  );
}
