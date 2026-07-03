from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db.database import (
    create_api_key, validate_api_key,
    get_all_keys, get_recent_logs
)
import hashlib
import os
from datetime import datetime

router = APIRouter()

# ── Request Models ────────────────────────────────────────

class GenerateKeyRequest(BaseModel):
    name:  str
    email: str = None

class ValidateKeyRequest(BaseModel):
    key: str

# ── Helper ────────────────────────────────────────────────

def generate_key() -> str:
    random_bytes = os.urandom(32)
    key_hash = hashlib.sha256(random_bytes).hexdigest()
    return f"lr_{key_hash}"

# ── Endpoints ─────────────────────────────────────────────

@router.post("/auth/generate-key")
async def generate_api_key(request: GenerateKeyRequest):
    if not request.name or len(request.name.strip()) < 2:
        raise HTTPException(
            status_code=400,
            detail="Name must be at least 2 characters"
        )

    key = generate_key()

    try:
        create_api_key(
            key=key,
            name=request.name.strip(),
            email=request.email
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create key: {str(e)}"
        )

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
    return {
        "valid": is_valid,
        "key":   request.key[:10] + "..." if request.key else ""
    }


@router.get("/admin/keys")
async def list_keys():
    keys = get_all_keys()
    for k in keys:
        k['key'] = k['key'][:10] + "..." + k['key'][-4:]
    return { "keys": keys, "total": len(keys) }


@router.get("/admin/logs")
async def list_logs(limit: int = 20):
    logs = get_recent_logs(limit)
    for log in logs:
        if log.get('api_key'):
            log['api_key'] = log['api_key'][:10] + "..."
    return { "logs": logs, "total": len(logs) }