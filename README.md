# GENESIS AI Video Studio Pro

نظام دمج بين Claude AI + Replicate لتوليد الفيديوهات

## الميزات

- **وضع Canvas:** Claude يحلل الفكرة + يعمل مشاهد JSON + Canvas يرسم + MediaRecorder يسجل فيديو WebM
- **وضع Replicate:** إرسال البرومبت مباشرة لـ Luma Ray عبر Backend
- **وضع DUAL (دمار):** Claude يحسن البرومبت أولاً وبعدين يبعته لـ Replicate
- واجهة عربية احترافية مع شاشة قفل
- تحسين البرومبت بـ Claude
- تحكم كامل بالأبعاد والمدة والجودة

## التثبيت

```bash
pip install -r requirements.txt
```

## التشغيل

### الحد الأدنى (Canvas فقط - بدون Backend):
افتح `genesis_merged.html` مباشرة في المتصفح

### مع Backend (Replicate):

```bash
set REPLICATE_API_TOKEN=your_replicate_token_here
python genesis_merged.py
```

أو على Linux/Mac:
```bash
export REPLICATE_API_TOKEN=your_replicate_token_here
python genesis_merged.py
```

افتح المتصفح على: `http://localhost:8000`

## الإعدادات المطلوبة

| المتغير | الوصف | مطلوب لـ |
|---------|-------|----------|
| `REPLICATE_API_TOKEN` | مفتاح Replicate API | وضع Replicate و DUAL |
| `sk-ant-...` (في الواجهة) | مفتاح Anthropic API | وضع Canvas و تحسين البرومبت |

## ملاحظات

- مفتاح Anthropic يُحفظ في localStorage على جهازك فقط
- مفتاح Replicate يُفضل كـ env variable على السيرفر
- كلمة المرور الافتراضية: `youssef`
