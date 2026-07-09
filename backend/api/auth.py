from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db.database import (
    create_api_key, validate_api_key,
    get_all_keys, get_recent_logs
)
import hashlib
import os
import requests
from datetime import datetime

router = APIRouter()

RESEND_API_KEY   = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")


def send_key_receipt_email(to_email: str, name: str, key: str):
    if not RESEND_API_KEY or not to_email:
        return
    try:
        requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": RESEND_FROM_EMAIL,
                "to": [to_email],
                "subject": "Your LavaRand API key was created",
                "html": f"""
                    <p>Hi {name},</p>
                    <p>A new LavaRand API key was just created for your account.</p>
                    <p><b>Key:</b> {key[:10]}...{key[-4:]}</p>
                    <p>If you didn't request this, you can ignore this email —
                    the key shown on screen at the time of creation is the only
                    place the full key is displayed.</p>
                """,
            },
            timeout=5,
        )
    except Exception as e:
        print(f"[Email] Failed to send key receipt: {e}")

class GenerateKeyRequest(BaseModel):
    name:  str
    email: str = None

class ValidateKeyRequest(BaseModel):
    key: str

def generate_key() -> str:
    random_bytes = os.urandom(32)
    key_hash = hashlib.sha256(random_bytes).hexdigest()
    return f"lr_{key_hash}"

@router.post("/auth/generate-key")
async def generate_api_key(request: GenerateKeyRequest):
    if not request.name or len(request.name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters")

    key = generate_key()

    try:
        create_api_key(key=key, name=request.name.strip(), email=request.email)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create key: {str(e)}")

    if request.email:
        send_key_receipt_email(request.email, request.name.strip(), key)

    return {
        "key":        key,
        "name":       request.name,
        "message":    "Store this key safely — it won't be shown again.",
        "usage":      f"Add to every request header: X-API-Key: {key}",
        "created_at": datetime.utcnow().isoformat()
    }

@router.post("/auth/validate-key")
async def validate_key(request: ValidateKeyRequest):
    is_valid = validate_api_key(request.key)
    return {"valid": is_valid, "key": request.key[:10] + "..." if request.key else ""}

@router.get("/admin/keys")
async def list_keys():
    keys = get_all_keys()
    for k in keys:
        k['key'] = k['key'][:10] + "..." + k['key'][-4:]
    return {"keys": keys, "total": len(keys)}

@router.get("/admin/logs")
async def list_logs(limit: int = 20):
    logs = get_recent_logs(limit)
    for log in logs:
        if log.get('api_key'):
            log['api_key'] = log['api_key'][:10] + "..."
    return {"logs": logs, "total": len(logs)}