# ⚡ CODEX — مولّد الكود الذكي

## 🗂️ هيكل الملفات
```
codex-generator/
├── index.html          ← نقطة الدخول
├── package.json        ← الـ dependencies
├── vite.config.js      ← إعدادات Vite
├── netlify.toml        ← إعدادات Netlify
├── .gitignore
└── src/
    ├── main.jsx        ← يشغّل الـ App
    └── App.jsx         ← الكود الأساسي
```

---

## 🚀 تشغيل محلياً (على جهازك)

> متطلب: Node.js مثبت → [nodejs.org](https://nodejs.org)

```bash
# 1. افتح Terminal في مجلد المشروع
cd codex-generator

# 2. ثبّت الـ packages
npm install

# 3. شغّل المشروع
npm run dev
```

ثم افتح المتصفح على: **http://localhost:3000**

---

## ☁️ رفع على Vercel (مجاني)

1. ارفع المجلد على GitHub
2. روح [vercel.com](https://vercel.com) → Import Project
3. Vercel هيعمل `npm run build` تلقائياً ✅

## ☁️ رفع على Netlify (مجاني)

**طريقة 1 — Drag & Drop:**
```bash
npm run build   # بيعمل مجلد dist/
```
ثم اسحب مجلد `dist/` على [netlify.com/drop](https://netlify.com/drop)

**طريقة 2 — GitHub:**
1. ارفع على GitHub
2. Netlify → New Site → Import → اختار الـ repo
3. Build command: `npm run build` | Publish dir: `dist`

---

## 🔑 API Key

عند فتح الموقع أول مرة، هيطلب منك Anthropic API Key.

احصل عليه من: [console.anthropic.com](https://console.anthropic.com)
- مجاني للاستخدام المحدود
- الـ Key بيتحفظ في المتصفح فقط (localStorage) — مش بيتبعت لأي سيرفر

---

## ⚙️ Build للـ Production

```bash
npm run build
# الناتج في مجلد dist/
```
