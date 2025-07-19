from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
import uuid
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    MODERATOR = "moderator"
    MEMBER = "member"
    BANNED = "banned"

class UserPreferences(BaseModel):
    language: str = "en"
    theme: str = "darkNeon"
    custom_theme: Optional[dict] = None
    notifications: bool = True
    steam_profile_public: bool = False

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    password_hash: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    role: UserRole = UserRole.MEMBER
    steam_id: Optional[str] = None
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    login_count: int = 0

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(..., min_length=8)
    display_name: Optional[str] = None
    language: str = "en"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[UserPreferences] = None

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    display_name: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    role: UserRole
    steam_id: Optional[str]
    preferences: UserPreferences
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime]
    login_count: int

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class CustomTheme(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None
    category: str = "Custom"
    variables: dict
    is_public: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CustomThemeCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None
    category: str = "Custom"
    variables: dict
    is_public: bool = False

class CustomThemeResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str]
    category: str
    variables: dict
    is_public: bool
    created_at: datetime
    updated_at: datetime