from fastapi import APIRouter, HTTPException, Query, Header
from entropy_engine import engine
from datetime import datetime, timezone
from db.database import validate_api_key, log_request, increment_request_count
from typing import Optional

router = APIRouter()

def check_api_key(x_api_key: Optional[str], endpoint: str):
    if x_api_key is None:
        return
    if not validate_api_key(x_api_key):
        raise HTTPException(
            status_code=401,
            detail="Invalid API key. Get one at /api/v1/auth/generate-key"
        )
    increment_request_count(x_api_key)
    log_request(x_api_key, endpoint, 200)

def base_response(value, **extra):
    status = engine.status()
    return {
        "value":          value,
        "entropy_source": "lava_lamp",
        "entropy_score":  status["last_score"],
        "generated_at":   datetime.now(timezone.utc).isoformat(),
        "algorithm":      "SHA-256 + PBKDF2",
        "pool_level":     f"{status['pool_level']:.1f}%",
        **extra
    }

@router.get("/random/uuid")
async def get_uuid(x_api_key: Optional[str] = Header(default=None)):
    check_api_key(x_api_key, "/random/uuid")
    try:
        raw = engine.get_entropy(32)
        return base_response(engine.hasher.to_uuid(raw))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/random/otp")
async def get_otp(
    digits: int = Query(default=6, ge=4, le=12),
    x_api_key: Optional[str] = Header(default=None)
):
    check_api_key(x_api_key, "/random/otp")
    try:
        raw = engine.get_entropy(32)
        return base_response(engine.hasher.to_otp(raw, digits), digits=digits)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/random/token")
async def get_token(x_api_key: Optional[str] = Header(default=None)):
    check_api_key(x_api_key, "/random/token")
    try:
        raw = engine.get_entropy(32)
        return base_response(engine.hasher.to_hex_token(raw))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/random/aes-key")
async def get_aes_key(
    bits: int = Query(default=256, enum=[128, 192, 256]),
    x_api_key: Optional[str] = Header(default=None)
):
    check_api_key(x_api_key, "/random/aes-key")
    try:
        raw = engine.get_entropy(32)
        return base_response(engine.hasher.to_aes_key(raw, bits), bits=bits)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/random/bytes")
async def get_bytes(
    length: int = Query(default=32, ge=1, le=512),
    x_api_key: Optional[str] = Header(default=None)
):
    check_api_key(x_api_key, "/random/bytes")
    try:
        raw = engine.get_entropy(max(32, length))
        return base_response(engine.hasher.to_bytes_b64(raw, length), bytes=length)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/random/integer")
async def get_integer(
    min: int = Query(default=1),
    max: int = Query(default=100),
    x_api_key: Optional[str] = Header(default=None)
):
    if min >= max:
        raise HTTPException(status_code=400, detail="min must be less than max")
    check_api_key(x_api_key, "/random/integer")
    try:
        raw = engine.get_entropy(32)
        return base_response(engine.hasher.to_integer(raw, min, max), min=min, max=max)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/random/password")
async def get_password(
    length: int = Query(default=16, ge=8, le=64),
    x_api_key: Optional[str] = Header(default=None)
):
    import base64
    check_api_key(x_api_key, "/random/password")
    try:
        raw = engine.get_entropy(32)
        key = engine.hasher.derive_key(raw, length)
        password = base64.urlsafe_b64encode(key).decode()[:length]
        return base_response(password, length=length)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))