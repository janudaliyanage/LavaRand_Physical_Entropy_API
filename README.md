LavaRand — Physical Entropy API
> A cryptographic API that generates true random values from a lava lamp — inspired by Cloudflare's LavaRand system.

![Python](https://img.shields.io/badge/Python-3.13-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![React](https://img.shields.io/badge/React-19-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

What is this?
Cloudflare uses a wall of 100 lava lamps in their San Francisco office to generate
physical entropy for encrypting internet traffic. LavaRand is my implementation
of the same concept — a REST API that:

1. **Captures** a live lava lamp via webcam (24fps)
2. **Extracts** entropy from pixel randomness using Shannon entropy analysis
3. **Derives** cryptographic keys via SHA-256 + PBKDF2
4. **Serves** true random values through a clean REST API

Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI, OpenCV, NumPy |
| Crypto | SHA-256, PBKDF2, AES-256-GCM |
| Frontend | React, Axios |
| Database | SQLite (API key management) |
| Entropy | Shannon entropy analysis |

API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/random/uuid` | UUID v4 from lava lamp entropy |
| GET | `/api/v1/random/otp?digits=6` | Numeric OTP |
| GET | `/api/v1/random/token` | 32-byte hex token |
| GET | `/api/v1/random/aes-key?bits=256` | AES-256 encryption key |
| GET | `/api/v1/random/bytes?length=32` | Raw random bytes |
| GET | `/api/v1/random/integer?min=1&max=100` | Random integer |
| GET | `/api/v1/entropy/status` | Live entropy pool status |
| POST | `/api/v1/auth/generate-key` | Generate API key |

Running Locally
Prerequisites
- Python 3.13+
- Node.js 18+
- A webcam
- A lava lamp (or lava lamp app on your phone 🌋)

Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Environment Variables

Create `backend/.env`:
