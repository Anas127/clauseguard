from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import contracts
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="ClauseGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(contracts.router, prefix="/api/contracts", tags=["contracts"])

@app.get("/health")
def health():
    return {"status": "ok"}