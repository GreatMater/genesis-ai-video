import os
import time
import uuid
from typing import Optional, Dict, Any

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN", "").strip()
REPLICATE_MODEL = os.getenv("REPLICATE_MODEL", "luma/ray").strip()

JOBS: Dict[str, Dict[str, Any]] = {}

app = FastAPI(title="GENESIS AI Video Studio", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════
# MODELS
# ═══════════════════════════════════════════

class GenerateIn(BaseModel):
    prompt: str = Field(min_length=1, max_length=2000)
    width: int = Field(ge=128, le=1920)
    height: int = Field(ge=128, le=1920)
    seconds: int = Field(ge=1, le=20)
    fps: int = Field(ge=8, le=60)
    seed: Optional[int] = None
    model: str = "luma"

class GenerateOut(BaseModel):
    job_id: str

class EnhanceIn(BaseModel):
    prompt: str = Field(min_length=1, max_length=2000)

class EnhanceOut(BaseModel):
    enhanced: str

class DualGenerateIn(BaseModel):
    prompt: str = Field(min_length=1, max_length=2000)
    width: int = Field(ge=128, le=1920)
    height: int = Field(ge=128, le=1920)
    seconds: int = Field(ge=1, le=20)
    fps: int = Field(ge=8, le=60)
    seed: Optional[int] = None
    mode: str = "both"  # "canvas" | "replicate" | "both"
    api_key: Optional[str] = None

# ═══════════════════════════════════════════
# REPLICATE HELPERS
# ═══════════════════════════════════════════

def replicate_headers():
    if not REPLICATE_API_TOKEN:
        raise HTTPException(500, "Missing REPLICATE_API_TOKEN")
    return {
        "Authorization": f"Token {REPLICATE_API_TOKEN}",
        "Content-Type": "application/json",
    }

def replicate_create_prediction(payload: dict) -> dict:
    r = requests.post(
        "https://api.replicate.com/v1/predictions",
        headers=replicate_headers(),
        json=payload,
        timeout=60,
    )
    if r.status_code >= 400:
        raise HTTPException(r.status_code, r.text)
    return r.json()

def replicate_get_prediction(pred_id: str) -> dict:
    r = requests.get(
        f"https://api.replicate.com/v1/predictions/{pred_id}",
        headers=replicate_headers(),
        timeout=60,
    )
    if r.status_code >= 400:
        raise HTTPException(r.status_code, r.text)
    return r.json()

# ═══════════════════════════════════════════
# CLAUDE PROXY (for enhance without CORS)
# ═══════════════════════════════════════════

@app.post("/api/enhance", response_model=EnhanceOut)
async def enhance_prompt(inp: EnhanceIn):
    """Proxy prompt enhancement through backend to avoid CORS"""
    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(500, "ANTHROPIC_API_KEY not set on server")

    try:
        r = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "Content-Type": "application/json",
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "anthropic-dangerous-direct-browser-access": "true"
            },
            json={
                "model": "claude-sonnet-4-6",
                "max_tokens": 400,
                "system": "أنت مدير إبداعي لمقاطع فيديو سينمائية. تُحسّن الأفكار وتُضيف عليها تفاصيل بصرية غنية. اكتب الوصف المحسّن فقط بدون أي مقدمة.",
                "messages": [{"role": "user", "content": f"حسّن فكرة الفيديو التالية وأضف تفاصيل سينمائية: ألوان، إضاءة، حركة، أجواء (2-3 جمل):\n{inp.prompt}"}]
            },
            timeout=30,
        )
        if r.status_code != 200:
            raise HTTPException(r.status_code, r.text)
        d = r.json()
        text = " ".join(b.get("text", "") for b in d.get("content", []))
        return EnhanceOut(enhanced=text.strip())
    except requests.RequestException as e:
        raise HTTPException(500, f"Claude API error: {str(e)}")

# ═══════════════════════════════════════════
# GENERATE ENDPOINTS
# ═══════════════════════════════════════════

@app.post("/api/generate", response_model=GenerateOut)
def generate(inp: GenerateIn):
    """Generate video via Replicate (Luma Ray)"""
    job_id = str(uuid.uuid4())

    replicate_payload = {
        "model": REPLICATE_MODEL,
        "input": {
            "prompt": inp.prompt,
            "width": inp.width,
            "height": inp.height,
            "num_frames": inp.seconds * inp.fps,
            "fps": inp.fps,
        },
    }
    if inp.seed is not None:
        replicate_payload["input"]["seed"] = inp.seed

    pred = replicate_create_prediction(replicate_payload)

    JOBS[job_id] = {
        "created_at": time.time(),
        "status": "processing",
        "provider": "replicate",
        "prediction_id": pred.get("id"),
        "last": pred,
    }
    return {"job_id": job_id}

@app.post("/api/generate-dual", response_model=GenerateOut)
def generate_dual(inp: DualGenerateIn):
    """Dual mode: send to Replicate with optional Claude-enhanced prompt"""
    job_id = str(uuid.uuid4())
    final_prompt = inp.prompt

    # If mode is "both" and we have API key, enhance first
    if inp.mode == "both":
        api_key = inp.api_key or os.getenv("ANTHROPIC_API_KEY", "").strip()
        if api_key:
            try:
                r = requests.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "Content-Type": "application/json",
                        "x-api-key": api_key,
                        "anthropic-version": "2023-06-01",
                        "anthropic-dangerous-direct-browser-access": "true"
                    },
                    json={
                        "model": "claude-sonnet-4-6",
                        "max_tokens": 400,
                        "system": "أنت خبير في كتابة برومبتات توليد الفيديو. حوّل الفكرة البسيطة إلى وصف سينمائي غني ومفصل يصلح لنماذج توليد الفيديو. اكتب الوصف المحسّن فقط بدون أي مقدمة أو شرح.",
                        "messages": [{"role": "user", "content": f"حسّن و detail الفكرة التالية لبرومبت فيديو AI (أضف تفاصيل بصرية: إضاءة، ألوان، حركة، أجواء، زاوية كاميرا):\n{inp.prompt}"}]
                    },
                    timeout=30,
                )
                if r.status_code == 200:
                    d = r.json()
                    final_prompt = " ".join(b.get("text", "") for b in d.get("content", [])).strip() or inp.prompt
            except Exception:
                pass  # fallback to original prompt

    replicate_payload = {
        "model": REPLICATE_MODEL,
        "input": {
            "prompt": final_prompt,
            "width": inp.width,
            "height": inp.height,
            "num_frames": inp.seconds * inp.fps,
            "fps": inp.fps,
        },
    }
    if inp.seed is not None:
        replicate_payload["input"]["seed"] = inp.seed

    pred = replicate_create_prediction(replicate_payload)

    JOBS[job_id] = {
        "created_at": time.time(),
        "status": "processing",
        "provider": "replicate",
        "mode": inp.mode,
        "enhanced_prompt": final_prompt if inp.mode == "both" else None,
        "prediction_id": pred.get("id"),
        "last": pred,
    }
    return {"job_id": job_id}

# ═══════════════════════════════════════════
# STATUS ENDPOINT
# ═══════════════════════════════════════════

@app.get("/api/status/{job_id}")
def status(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(404, "job not found")

    pred_id = job.get("prediction_id")
    if not pred_id:
        raise HTTPException(500, "missing prediction_id")

    pred = replicate_get_prediction(pred_id)
    job["last"] = pred

    st = pred.get("status")
    if st in ("starting", "processing"):
        job["status"] = "processing"
        return {
            "status": "processing",
            "progress": pred.get("logs"),
            "mode": job.get("mode"),
            "enhanced_prompt": job.get("enhanced_prompt"),
        }

    if st == "failed":
        job["status"] = "failed"
        return {"status": "failed", "error": pred.get("error")}

    if st == "canceled":
        job["status"] = "failed"
        return {"status": "failed", "error": "canceled"}

    if st == "succeeded":
        job["status"] = "succeeded"
        out = pred.get("output")

        video_url = None
        if isinstance(out, str):
            video_url = out
        elif isinstance(out, list) and out:
            video_url = out[-1]
        elif isinstance(out, dict):
            video_url = out.get("video") or out.get("url")

        if not video_url:
            return {"status": "failed", "error": "No video URL in output"}

        return {
            "status": "succeeded",
            "video_url": video_url,
            "mode": job.get("mode"),
            "enhanced_prompt": job.get("enhanced_prompt"),
        }

    return {"status": "processing"}

# ═══════════════════════════════════════════
# HEALTH & STATIC
# ═══════════════════════════════════════════

@app.get("/api/health")
def health():
    return {"ok": True, "time": int(time.time()), "replicate_configured": bool(REPLICATE_API_TOKEN)}

# Serve frontend
STATIC_DIR = os.path.dirname(os.path.abspath(__file__))
@app.get("/")
def serve_frontend():
    return FileResponse(os.path.join(STATIC_DIR, "genesis_merged.html"))
