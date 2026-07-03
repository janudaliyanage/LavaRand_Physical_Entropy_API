from fastapi import APIRouter
from entropy_engine import engine

router = APIRouter()

@router.get("/entropy/status")
async def get_entropy_status():
    """
    Returns current entropy engine status.
    Use this to monitor your lava lamp system.
    """
    status = engine.status()

    return {
        "status":          "online" if status["running"] else "offline",
        "pool_level":      status["pool_level"],
        "pool_size":       status["pool_size"],
        "entropy_score":   status["last_score"],
        "frames_analyzed": status["frames_analyzed"],
        "frames_accepted": status["frames_accepted"],
        "acceptance_rate": status["acceptance_rate"],
        "camera_fps":      status["camera_fps"],
        "camera_ready":    status["camera_ready"],
        "entropy_source":  "lava_lamp",
    }