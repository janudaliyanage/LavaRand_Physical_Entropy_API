from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from api.random  import router as random_router
from api.entropy import router as entropy_router
from api.auth    import router as auth_router
from entropy_engine import engine
from db.database import init_db, key_exists, create_api_key
from dotenv import load_dotenv
import os

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[API] Initializing database...")
    init_db()

    demo_key = os.getenv("DEMO_API_KEY")
    if demo_key and not key_exists(demo_key):
        create_api_key(key=demo_key, name="Public Demo (rate-limited)", email=None)
        print("[API] Seeded public demo key")

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
        "https://lava-rand-1.vercel.app",
        "*"
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