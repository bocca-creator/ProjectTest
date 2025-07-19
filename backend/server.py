from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime

# Import new modules
from database.mysql import mysql_db
from routes.auth import router as auth_router
from routes.themes import router as themes_router
from routes.steam import router as steam_router


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="ProjectTest API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models (keeping existing models for backwards compatibility)
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "ProjectTest API v1.0.0", "status": "running"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "mongodb": "connected",
        "mysql": "connected" if mysql_db.pool else "disconnected",
        "version": "1.0.0"
    }

# Include authentication, theme, and Steam routes
api_router.include_router(auth_router)
api_router.include_router(themes_router)
api_router.include_router(steam_router)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize database connections on startup"""
    logger.info("Starting ProjectTest API...")
    
    # Initialize MySQL connection
    await mysql_db.connect()
    logger.info("Database connections initialized")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up database connections on shutdown"""
    logger.info("Shutting down ProjectTest API...")
    
    # Close MongoDB connection
    client.close()
    
    # Close MySQL connection
    await mysql_db.disconnect()
    
    logger.info("Database connections closed")
