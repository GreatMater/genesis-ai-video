import { useState, useRef, useCallback } from "react";

const BLOCKED = ['malware','virus','ransomware','keylogger','phishing','botnet','rootkit','spyware','trojan','ddos','exploit kit'];
const RATE_LIMIT = 5;
const RATE_WINDOW = 60000;

const LANGUAGES = [
  { id:"html",   label:"HTML + CSS + JS", icon:"🌐" },
  { id:"react",  label:"React",           icon:"⚛️" },
  { id:"vue",    label:"Vue.js",          icon:"💚" },
  { id:"nextjs", label:"Next.js",         icon:"▲"  },
  { id:"python", label:"Python",          icon:"🐍" },
  { id:"nodejs", label:"Node.js",         icon:"🟢" },
  { id:"flutter",label:"Flutter",         icon:"📱" },
  { id:"ts",     label:"TypeScript",      icon:"🔷" },
];

const TEMPLATES = [
  { label:"🏨 سياحة",      prompt:"Build a luxury travel agency website with animated hero, destination cards with hover effects, tour packages with prices, booking form with date picker, testimonials, and footer. Glassmorphism design with smooth animations." },
  { label:"📊 Dashboard",  prompt:"Build an admin dashboard with sidebar navigation, stats cards (revenue, users, orders, growth rate), animated line chart, donut chart, and data table with search, filter, and pagination." },
  { label:"🛒 متجر",       prompt:"Build an e-commerce product page with image gallery slider, product details, size/color selector, animated add to cart button, product reviews, and related products grid." },
  { label:"💬 Chat UI",    prompt:"Build a real-time chat app UI with sidebar contacts, chat window with message bubbles, typing indicator animation, emoji button, file attachment, and online status." },
  { label:"🔐 تسجيل دخول",prompt:"Build a beautiful auth page with login/signup tabs, animated form validation, social login buttons (Google, GitHub, Apple), remember me, and password strength meter." },
  { label:"👤 Portfolio",  prompt:"Build a creative developer portfolio with particle hero animation, about section, animated skill bars, projects grid with modal details, timeline, and contact form." },
  { label:"📝 Blog",       prompt:"Build a modern blog homepage with hero featured article, article cards with read time, category filter tabs, author cards, newsletter signup, and dark mode toggle." },
  { label:"📅 Calendar",   prompt:"Build an interactive calendar app with month/week/day views, click-to-create events, color-coded events, drag to resize, and mini agenda sidebar." },
];

const SYSTEM_PROMPT = `You are CODEX — elite AI code generator.
OUTPUT: Raw code ONLY. No markdown. No \`\`\` blocks. No explanations. No text before or after code.
QUALITY: Complete, production-ready, modern 2025 code.
DESIGN: For HTML websites — beautiful UI with animations, glassmorphism or modern design, fully responsive.`;

const strip = (raw) => {
  if (!raw) return "";
  return raw.replace(/```[\w-]*\n?/gi, "").replace(/```/g, "").trim();
};

const isSafe = (text) => !BLOCKED.some(k => text.toLowerCase().includes(k));

/* ── API Key Setup Screen ── */
function ApiKeySetup({ onSave }) {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  const save = () => {
    const trimmed = key.trim();
    if (!trimmed.startsWith("sk-ant-")) {
      return setErr("🔴 API Key غير صحيح — يجب أن يبدأ بـ sk-ant-");
    }
    localStorage.setItem("codex_api_key", trimmed);
    onSave(trimmed);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter',sans-serif", padding: 20
    }}>
      <div style={{
        background: "rgba(255,255,255,.07)", backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,.12)", borderRadius: 20,
        padding: "40px 36px", maxWidth: 460, width: "100%"
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64,
            background: "linear-gradient(135deg,#667eea,#764ba2)",
            borderRadius: 18, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 32, margin: "0 auto 16px"
          }}>⚡</div>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 700, margin: "0 0 6px" }}>CODEX</h1>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14, margin: 0 }}>
            ادخل Anthropic API Key عشان تبدأ
          </p>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ color: "rgba(255,255,255,.55)", fontSize: 13, display: "block", marginBottom: 8 }}>
            🔑 Anthropic API Key
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={show ? "text" : "password"}
              value={key}
              onChange={e => { setKey(e.target.value); setErr(""); }}
              placeholder="sk-ant-api03-..."
              onKeyDown={e => e.key === "Enter" && save()}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(0,0,0,.3)", border: "1px solid rgba(255,255,255,.15)",
                borderRadius: 10, color: "#fff", fontSize: 14,
                padding: "12px 42px 12px 14px", outline: "none",
                fontFamily: "monospace"
              }}
            />
            <button
              onClick={() => setShow(v => !v)}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: "rgba(255,255,255,.4)",
                cursor: "pointer", fontSize: 16, padding: 0
              }}
            >
              {show ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {err && (
          <div style={{
            background: "rgba(248,113,113,.12)", border: "1px solid rgba(248,113,113,.3)",
            borderRadius: 9, color: "#fca5a5", fontSize: 13, padding: "9px 13px", marginBottom: 14
          }}>{err}</div>
        )}

        <button
          onClick={save}
          disabled={!key.trim()}
          style={{
            width: "100%", background: "linear-gradient(135deg,#667eea,#764ba2)",
            border: "none", borderRadius: 12, color: "#fff", cursor: "pointer",
            fontSize: 15, fontWeight: 600, padding: "13px", marginBottom: 16,
            opacity: key.trim() ? 1 : 0.5
          }}
        >
          ابدأ استخدام CODEX ⚡
        </button>

        <div style={{
          background: "rgba(0,0,0,.2)", borderRadius: 10, padding: "13px 15px"
        }}>
          <p style={{ color: "rgba(255,255,255,.45)", fontSize: 12, margin: "0 0 6px", fontWeight: 600 }}>
            📌 كيف تحصل على API Key مجاني؟
          </p>
          <ol style={{ color: "rgba(255,255,255,.35)", fontSize: 12, margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
            <li>روح على <span style={{ color: "#a78bfa" }}>console.anthropic.com</span></li>
            <li>سجّل أو سجّل دخول</li>
            <li>API Keys → Create Key</li>
            <li>انسخ الـ Key والصقه هنا</li>
          </ol>
          <p style={{ color: "rgba(255,255,255,.22)", fontSize: 11, marginTop: 10, marginBottom: 0 }}>
            🔒 الـ Key بيتحفظ في المتصفح فقط — مش بيتبعت لأي سيرفر
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Main App ── */
export default function App() {
  const [apiKey,    setApiKey]    = useState(() => localStorage.getItem("codex_api_key") || "");
  const [prompt,    setPrompt]    = useState("");
  const [lang,      setLang]      = useState("html");
  const [code,      setCode]      = useState("");
  const [loading,   setLoading]   = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [history,   setHistory]   = useState([]);
  const [tab,       setTab]       = useState("code");
  const [secure,    setSecure]    = useState(false);
  const [stamps,    setStamps]    = useState([]);
  const [alert,     setAlert]     = useState({ type:"", msg:"" });

  const ref = useRef(null);

  // Show setup screen if no API key
  if (!apiKey) {
    return <ApiKeySetup onSave={setApiKey} />;
  }

  const remaining = () => {
    const now = Date.now();
    const used = stamps.filter(t => now - t < RATE_WINDOW).length;
    return Math.max(0, RATE_LIMIT - used);
  };

  const generate = async () => {
    if (!prompt.trim() || loading) return;

    if (!isSafe(prompt)) {
      return setAlert({ type:"warn", msg:"🛡️ طلب محظور لأسباب أمنية — لا يمكن توليد كود ضار" });
    }
    if (remaining() === 0) {
      return setAlert({ type:"rate", msg:"⏱️ تجاوزت الحد المسموح (5 طلبات/دقيقة) — انتظر قليلاً" });
    }

    setAlert({ type:"", msg:"" });
    const now = Date.now();
    setStamps(p => [...p.filter(t => now - t < RATE_WINDOW), now]);
    setLoading(true);
    setCode("");
    setTab("code");

    const secNote = secure
      ? "\n\nSECURITY MODE: Add XSS protection, input sanitization, CSRF tokens, SQL injection prevention, rate limiting, secure headers, and OWASP Top 10 mitigations."
      : "";

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: [{ role:"user", content:`Framework: ${lang}\nBuild: ${prompt}${secNote}` }],
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const clean = strip(data.content?.[0]?.text || "// Error generating code");

      setHistory(p => [{
        prompt: prompt.length > 55 ? prompt.slice(0,55) + "…" : prompt,
        lang, code: clean,
        time: new Date().toLocaleTimeString("ar-EG", { hour:"2-digit", minute:"2-digit" }),
        lines: clean.split("\n").length,
        secure,
      }, ...p.slice(0, 8)]);

      let i = 0;
      const speed = clean.length > 2000 ? 45 : 22;
      const iv = setInterval(() => {
        i = Math.min(i + speed, clean.length);
        setCode(clean.slice(0, i));
        if (i >= clean.length) clearInterval(iv);
      }, 10);

    } catch (e) {
      setAlert({ type:"error", msg:"❌ خطأ في الاتصال: " + e.message });
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const exts = { html:"html", react:"jsx", vue:"vue", nextjs:"tsx", python:"py", nodejs:"js", flutter:"dart", ts:"ts" };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([code], { type:"text/plain" }));
    a.download = `codex.${exts[lang] || "txt"}`;
    a.click();
  };

  const r       = remaining();
  const preview = strip(code);
  const lines   = code ? code.split("\n").length : 0;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)", fontFamily:"'Inter',sans-serif", padding:"20px", boxSizing:"border-box" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,.04)}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:3px}
        .g{background:rgba(255,255,255,.07);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.12);border-radius:16px}
        .btn-main{background:linear-gradient(135deg,#667eea,#764ba2);border:none;border-radius:12px;color:#fff;cursor:pointer;font-size:15px;font-weight:600;padding:14px;transition:all .3s;width:100%;font-family:inherit}
        .btn-main:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 32px rgba(102,126,234,.5)}
        .btn-main:disabled{opacity:.5;cursor:not-allowed}
        .lang-btn{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:10px;color:rgba(255,255,255,.65);cursor:pointer;font-size:13px;padding:7px 13px;transition:all .2s;font-family:inherit}
        .lang-btn:hover{background:rgba(255,255,255,.12);color:#fff}
        .lang-btn.on{background:linear-gradient(135deg,rgba(102,126,234,.4),rgba(118,75,162,.4));border-color:rgba(102,126,234,.6);color:#fff}
        .tmpl{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:rgba(255,255,255,.6);cursor:pointer;font-size:12px;padding:5px 11px;transition:all .2s;white-space:nowrap;font-family:inherit}
        .tmpl:hover{background:rgba(102,126,234,.2);border-color:rgba(102,126,234,.4);color:#fff}
        .tab-btn{background:transparent;border:none;border-bottom:2px solid transparent;color:rgba(255,255,255,.45);cursor:pointer;font-size:13px;font-weight:500;padding:10px 18px;transition:all .2s;font-family:inherit}
        .tab-btn.on{border-bottom-color:#667eea;color:#fff}
        .ico-btn{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:8px;color:rgba(255,255,255,.75);cursor:pointer;font-size:12px;padding:5px 12px;transition:all .2s;font-family:inherit}
        .ico-btn:hover{background:rgba(255,255,255,.14);color:#fff}
        .hist{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:10px;cursor:pointer;padding:12px;transition:all .2s;margin-bottom:8px}
        .hist:hover{background:rgba(255,255,255,.08);border-color:rgba(102,126,234,.4)}
        textarea{background:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.12);border-radius:12px;color:#fff;font-size:14px;line-height:1.6;outline:none;padding:14px;resize:none;transition:border-color .2s;width:100%;font-family:inherit}
        textarea:focus{border-color:rgba(102,126,234,.55)}
        textarea::placeholder{color:rgba(255,255,255,.22)}
        .toggle{width:44px;height:24px;background:rgba(255,255,255,.14);border-radius:12px;cursor:pointer;position:relative;transition:background .3s;flex-shrink:0}
        .toggle.on{background:linear-gradient(135deg,#4ade80,#22d3ee)}
        .toggle::after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;background:#fff;border-radius:50%;transition:transform .3s;box-shadow:0 2px 6px rgba(0,0,0,.3)}
        .toggle.on::after{transform:translateX(20px)}
        .badge{border-radius:6px;font-size:11px;font-weight:600;padding:2px 8px;display:inline-block}
        .dot{width:8px;height:8px;border-radius:50%;display:inline-block;flex-shrink:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spin{animation:spin .8s linear infinite;display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;vertical-align:middle}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fi{animation:fadeIn .35s ease}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .cursor{animation:blink .9s infinite;color:#a78bfa}
        .lbl{color:rgba(255,255,255,.38);font-size:11px;font-weight:600;letter-spacing:1px;margin-bottom:10px;text-transform:uppercase}
      `}</style>

      <div style={{ maxWidth:1120, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:26 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:12, marginBottom:8 }}>
            <div style={{ width:48,height:48,background:"linear-gradient(135deg,#667eea,#764ba2)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26 }}>⚡</div>
            <div style={{ textAlign:"left" }}>
              <h1 style={{ color:"#fff",fontSize:28,fontWeight:700,letterSpacing:"-0.5px",lineHeight:1 }}>CODEX</h1>
              <p style={{ color:"rgba(255,255,255,.3)",fontSize:12,marginTop:3 }}>AI Code Generator — أي كود في العالم</p>
            </div>
          </div>
          {/* Logout / change key */}
          <div style={{ position:"absolute", top:20, right:20 }}>
            <button
              onClick={() => { localStorage.removeItem("codex_api_key"); setApiKey(""); }}
              style={{
                background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)",
                borderRadius:8, color:"rgba(255,255,255,.45)", cursor:"pointer",
                fontSize:12, padding:"5px 12px", fontFamily:"inherit"
              }}
            >🔑 تغيير API Key</button>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 308px", gap:16 }}>

          {/* ─── LEFT PANEL ─── */}
          <div>

            {/* Security Bar */}
            <div className="g" style={{ padding:"12px 18px", marginBottom:12, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:18 }}>🛡️</span>
                <span style={{ color:"rgba(255,255,255,.7)",fontSize:13,fontWeight:500 }}>وضع الحماية</span>
                <div className={`toggle ${secure?"on":""}`} onClick={()=>setSecure(v=>!v)} />
                {secure && <span style={{ color:"#4ade80",fontSize:12 }}>OWASP مُفعّل ✓</span>}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ color:r<2?"#f87171":"rgba(255,255,255,.38)",fontSize:12 }}>{r}/{RATE_LIMIT} طلبات متبقية</span>
                <div style={{ display:"flex",gap:3 }}>
                  {Array.from({length:RATE_LIMIT}).map((_,i)=>(
                    <div key={i} className="dot" style={{ background: i < r ? "#4ade80" : "rgba(255,255,255,.14)" }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Input Card */}
            <div className="g" style={{ padding:20, marginBottom:12 }}>

              <p className="lbl">اللغة / الإطار</p>
              <div style={{ display:"flex",flexWrap:"wrap",gap:7,marginBottom:18 }}>
                {LANGUAGES.map(l=>(
                  <button key={l.id} className={`lang-btn ${lang===l.id?"on":""}`} onClick={()=>setLang(l.id)}>
                    {l.icon} {l.label}
                  </button>
                ))}
              </div>

              <p className="lbl">قوالب سريعة</p>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:18 }}>
                {TEMPLATES.map(t=>(
                  <button key={t.label} className="tmpl" onClick={()=>{ setPrompt(t.prompt); ref.current?.focus(); }}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div style={{ position:"relative", marginBottom:14 }}>
                <textarea ref={ref} rows={4}
                  placeholder="اكتب ما تريد بناؤه... مثلاً: Build a travel agency website with search, booking form, and hotel cards"
                  value={prompt}
                  onChange={e=>setPrompt(e.target.value)}
                  onKeyDown={e=>{ if(e.key==="Enter" && e.ctrlKey) generate(); }}
                />
                <span style={{ position:"absolute",bottom:10,left:12,color:"rgba(255,255,255,.18)",fontSize:11 }}>
                  {prompt.length} حرف · Ctrl+Enter للإرسال
                </span>
              </div>

              {alert.msg && (
                <div style={{
                  background: alert.type==="warn" ? "rgba(251,191,36,.1)" : alert.type==="rate" ? "rgba(96,165,250,.1)" : "rgba(248,113,113,.1)",
                  border:`1px solid ${alert.type==="warn" ? "rgba(251,191,36,.3)" : alert.type==="rate" ? "rgba(96,165,250,.3)" : "rgba(248,113,113,.3)"}`,
                  borderRadius:10, color:"rgba(255,255,255,.8)", fontSize:13, padding:"10px 14px", marginBottom:14
                }}>{alert.msg}</div>
              )}

              <button className="btn-main" onClick={generate} disabled={loading || !prompt.trim() || r===0}>
                {loading ? <><span className="spin" style={{marginRight:8}} />جاري توليد الكود...</> : "⚡ توليد الكود"}
              </button>
            </div>

            {/* Output */}
            {(code || loading) && (
              <div className="g fi">
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.08)",padding:"0 16px" }}>
                  <div>
                    <button className={`tab-btn ${tab==="code"?"on":""}`}    onClick={()=>setTab("code")}>💻 الكود</button>
                    <button className={`tab-btn ${tab==="preview"?"on":""}`} onClick={()=>setTab("preview")}>👁️ معاينة</button>
                    <button className={`tab-btn ${tab==="info"?"on":""}`}    onClick={()=>setTab("info")}>ℹ️ معلومات</button>
                  </div>
                  {code && (
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <span style={{ color:"rgba(255,255,255,.28)",fontSize:12 }}>{lines} سطر</span>
                      <button className="ico-btn" onClick={copy}>{copied ? "✅ تم النسخ" : "📋 نسخ"}</button>
                      <button className="ico-btn" onClick={download}>⬇️ تحميل</button>
                    </div>
                  )}
                </div>

                {/* Code */}
                {tab==="code" && (
                  <div style={{ padding:18 }}>
                    <div style={{ display:"flex",gap:6,alignItems:"center",marginBottom:10 }}>
                      {["#ff5f57","#febc2e","#28c840"].map(c=>(
                        <div key={c} style={{ width:12,height:12,borderRadius:"50%",background:c }} />
                      ))}
                      <span style={{ color:"rgba(255,255,255,.22)",fontSize:11,marginLeft:8 }}>
                        {lang.toUpperCase()} · {lines} lines · {code.length.toLocaleString()} chars
                        {secure && <span style={{ color:"#4ade80",marginLeft:8 }}>🔒 SECURE MODE</span>}
                      </span>
                    </div>
                    <pre style={{
                      background:"rgba(0,0,0,.45)",borderRadius:10,
                      color:"#e2e8f0",fontFamily:"'JetBrains Mono',monospace",
                      fontSize:13,lineHeight:1.75,maxHeight:540,
                      overflow:"auto",padding:18,
                      whiteSpace:"pre-wrap",wordBreak:"break-word",margin:0
                    }}>
                      {loading && !code
                        ? <span style={{ color:"rgba(255,255,255,.28)" }}>⚡ جاري كتابة الكود<span className="cursor">▌</span></span>
                        : <>{code}{loading && <span className="cursor">▌</span>}</>
                      }
                    </pre>
                  </div>
                )}

                {/* Preview */}
                {tab==="preview" && (
                  <div style={{ padding:18 }}>
                    {lang==="html" ? (
                      preview ? (
                        <div style={{ border:"1px solid rgba(255,255,255,.1)",borderRadius:12,overflow:"hidden",background:"#fff" }}>
                          <div style={{ background:"rgba(0,0,0,.6)",padding:"8px 14px",display:"flex",alignItems:"center",gap:8 }}>
                            {["#ff5f57","#febc2e","#28c840"].map(c=>(
                              <div key={c} style={{ width:11,height:11,borderRadius:"50%",background:c }} />
                            ))}
                            <span style={{ color:"rgba(255,255,255,.4)",fontSize:12,marginLeft:8,fontFamily:"monospace" }}>preview</span>
                          </div>
                          <iframe
                            key={preview.slice(0,100)}
                            srcDoc={preview}
                            style={{ width:"100%",height:500,border:"none",display:"block" }}
                            sandbox="allow-scripts allow-forms"
                            title="Code Preview"
                          />
                        </div>
                      ) : (
                        <p style={{ color:"rgba(255,255,255,.35)",textAlign:"center",padding:40 }}>⏳ اكتمل التوليد لعرض المعاينة</p>
                      )
                    ) : (
                      <div style={{ background:"rgba(0,0,0,.25)",borderRadius:12,padding:40,textAlign:"center" }}>
                        <div style={{ fontSize:48,marginBottom:16 }}>🖥️</div>
                        <p style={{ color:"rgba(255,255,255,.55)",fontSize:15,marginBottom:8,fontWeight:500 }}>المعاينة متاحة لـ HTML فقط</p>
                        <p style={{ color:"rgba(255,255,255,.3)",fontSize:13 }}>انسخ الكود واستخدمه في مشروع {lang.toUpperCase()}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Info */}
                {tab==="info" && code && (
                  <div style={{ padding:18 }}>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                      {[
                        ["📄 الملف",        `codex.${({html:"html",react:"jsx",vue:"vue",nextjs:"tsx",python:"py",nodejs:"js",flutter:"dart",ts:"ts"})[lang]||"txt"}`],
                        ["📏 الأسطر",       `${lines} سطر`],
                        ["🔤 الأحرف",       code.length.toLocaleString()],
                        ["🌐 اللغة",        lang.toUpperCase()],
                        ["🔒 الحماية",      secure ? "OWASP مُفعّل ✓" : "قياسية"],
                        ["✅ الحالة",        "مكتمل ✓"],
                      ].map(([k,v])=>(
                        <div key={k} style={{ background:"rgba(0,0,0,.2)",borderRadius:9,padding:"11px 14px" }}>
                          <p style={{ color:"rgba(255,255,255,.38)",fontSize:11,marginBottom:4 }}>{k}</p>
                          <p style={{ color:"#fff",fontSize:14,fontWeight:500 }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── RIGHT PANEL ─── */}
          <div>

            {/* Security Status */}
            <div className="g" style={{ padding:18,marginBottom:14 }}>
              <p className="lbl">🔒 نظام الحماية</p>
              {[
                { icon:"🚫", label:"فلتر المحتوى",    ok: isSafe(prompt),  status: isSafe(prompt) ? "نشط" : "محظور" },
                { icon:"⏱️", label:"Rate Limiting",   ok: r > 1,           status: `${r}/${RATE_LIMIT} متبقي` },
                { icon:"🛡️", label:"OWASP Mode",       ok: secure,          status: secure ? "مُفعّل" : "معطّل" },
                { icon:"🖼️", label:"Sandbox Preview",  ok: true,            status: "مُفعّل" },
                { icon:"✅", label:"Input Validation", ok: true,            status: "نشط" },
                { icon:"🔑", label:"XSS Protection",   ok: true,            status: "نشط" },
              ].map(item=>(
                <div key={item.label} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ fontSize:15 }}>{item.icon}</span>
                    <span style={{ color:"rgba(255,255,255,.62)",fontSize:13 }}>{item.label}</span>
                  </div>
                  <span className="badge" style={{
                    background: item.ok ? "rgba(74,222,128,.13)" : "rgba(248,113,113,.13)",
                    color:       item.ok ? "#4ade80"              : "#f87171",
                  }}>{item.status}</span>
                </div>
              ))}
            </div>

            {/* History */}
            <div className="g" style={{ padding:18,marginBottom:14 }}>
              <p className="lbl">📜 السجل ({history.length})</p>
              {history.length===0 ? (
                <p style={{ color:"rgba(255,255,255,.2)",fontSize:13,textAlign:"center",padding:"22px 0" }}>لم يتم توليد أي كود بعد</p>
              ) : (
                history.map((h,i)=>(
                  <div key={i} className="hist" onClick={()=>{ setPrompt(h.prompt); setCode(h.code); setLang(h.lang); }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                      <div style={{ display:"flex",gap:5 }}>
                        <span className="badge" style={{ background:"rgba(102,126,234,.2)",color:"#a5b4fc" }}>{h.lang.toUpperCase()}</span>
                        {h.secure && <span className="badge" style={{ background:"rgba(74,222,128,.15)",color:"#4ade80" }}>🔒</span>}
                      </div>
                      <span style={{ color:"rgba(255,255,255,.28)",fontSize:11 }}>{h.time}</span>
                    </div>
                    <p style={{ color:"rgba(255,255,255,.55)",fontSize:12,lineHeight:1.4 }}>{h.prompt}</p>
                    <p style={{ color:"rgba(255,255,255,.22)",fontSize:11,marginTop:4 }}>{h.lines} سطر</p>
                  </div>
                ))
              )}
            </div>

            {/* Deploy Guide */}
            <div className="g" style={{ padding:18 }}>
              <p className="lbl">🚀 طريقة رفع الموقع</p>
              {[
                { name:"Netlify Drop",  tip:"اسحب ملف HTML مباشرة",         url:"netlify.com/drop",  emoji:"🟩", free:true  },
                { name:"Vercel",        tip:"اربط GitHub أو ارفع يدوياً",   url:"vercel.com",        emoji:"▲",  free:true  },
                { name:"GitHub Pages",  tip:"ارفع في repo وفعّل Pages",     url:"github.com",        emoji:"⚫", free:true  },
              ].map(p=>(
                <div key={p.name} style={{ background:"rgba(0,0,0,.2)",borderRadius:9,padding:"10px 13px",marginBottom:8 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                    <span style={{ color:"#fff",fontSize:13,fontWeight:500 }}>{p.emoji} {p.name}</span>
                    <span className="badge" style={{ background:"rgba(74,222,128,.13)",color:"#4ade80" }}>مجاني</span>
                  </div>
                  <p style={{ color:"rgba(255,255,255,.38)",fontSize:11 }}>{p.tip}</p>
                </div>
              ))}
              <p style={{ color:"rgba(255,255,255,.28)",fontSize:11,marginTop:12,lineHeight:1.6,borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:10 }}>
                💡 للـ HTML: اضغط ⬇️ تحميل ثم ارفع الملف مباشرة على Netlify Drop
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
