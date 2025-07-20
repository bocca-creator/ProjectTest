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

# Load environment variables BEFORE importing modules that use them
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import new modules AFTER loading environment variables
from database.mysql import mysql_db
from routes.auth import router as auth_router
from routes.themes import router as themes_router
from routes.steam import router as steam_router
from routes.cs2_stats import router as cs2_router
from routes.admin import router as admin_router
from routes.tiers import router as tiers_router

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

# Include authentication, theme, Steam, CS2, admin, and tier routes
api_router.include_router(auth_router)
api_router.include_router(themes_router)
api_router.include_router(steam_router)
api_router.include_router(cs2_router)
api_router.include_router(admin_router)
api_router.include_router(tiers_router)

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
    
    # Initialize CS2 tables and admin user
    try:
        from database.init_cs2_tables import create_cs2_tables, create_admin_user
        await create_cs2_tables()
        await create_admin_user()
    except Exception as e:
        logger.warning(f"Could not initialize CS2 tables or admin user: {e}")
    
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
