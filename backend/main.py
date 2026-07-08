from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from api.random  import router as random_router
from api.entropy import router as entropy_router
from api.auth    import router as auth_router
from entropy_engine import engine
from db.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[API] Initializing database...")
    init_db()
    print("[API] Starting entropy engine...")
    engine.start()
    print("[API] Ready to serve requests")
    yield
    print("[API] Shutting down...")
    engine.stop()

app = FastAPI(
    title="LavaRand API",
    description="Physical entropy API powered by a lava lamp",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
        allow_origins=[
        "http://localhost:3000",
        "https://lava-rand-1.vercel.app",  # ← add this
        "*"  # ← or just allow all for now
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(random_router,  prefix="/api/v1")
app.include_router(entropy_router, prefix="/api/v1")
app.include_router(auth_router,    prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "name":    "LavaRand API",
        "version": "1.0.0",
        "status":  "online",
        "docs":    "/docs"
    }