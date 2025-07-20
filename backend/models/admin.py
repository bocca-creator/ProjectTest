from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class DonationTier(str, Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"
    DIAMOND = "diamond"
    ELITE = "elite"

class AdminDashboardStats(BaseModel):
    total_users: int
    active_players: int
    matches_tracked: int
    leaderboard_status: str
    donation_stats: Dict[str, int]
    recent_activity_count: int

class UserManagementFilter(BaseModel):
    role: Optional[str] = None
    tier: Optional[DonationTier] = None
    is_active: Optional[bool] = None
    search_query: Optional[str] = None
    page: int = 1
    limit: int = 20

class UserRoleUpdate(BaseModel):
    role: str = Field(..., regex="^(admin|moderator|member|banned)$")

class UserTierUpdate(BaseModel):
    tier: DonationTier
    expires_at: Optional[datetime] = None
    notes: Optional[str] = None

class UserStatusUpdate(BaseModel):
    is_active: bool
    reason: Optional[str] = None

class ManualStatsUpdate(BaseModel):
    user_id: str
    stats: Dict[str, Any]
    reason: str

class ManualMatchCreate(BaseModel):
    user_id: str
    map_name: str
    result: str = Field(..., regex="^(win|loss|draw)$")
    kills: int
    deaths: int
    assists: int
    headshots: int
    damage: int
    is_mvp: bool = False
    notes: Optional[str] = None

class DonationRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    tier: DonationTier
    amount: float
    currency: str = "USD"
    payment_method: str
    transaction_id: Optional[str] = None
    status: str = "completed"  # pending, completed, failed, refunded
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = None

class DonationRecordCreate(BaseModel):
    user_id: str
    tier: DonationTier
    amount: float
    currency: str = "USD"
    payment_method: str
    transaction_id: Optional[str] = None
    expires_at: Optional[datetime] = None
    notes: Optional[str] = None

class TierBenefits(BaseModel):
    tier: DonationTier
    name: str
    description: str
    price: float
    currency: str = "USD"
    benefits: List[str]
    cosmetics: List[str]
    badge_url: Optional[str] = None
    color_scheme: Dict[str, str]
    duration_days: Optional[int] = None  # None for lifetime
    is_featured: bool = False
    display_order: int

class AdminActivityLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    admin_user_id: str
    admin_username: str
    action: str
    target_type: str  # user, match, stats, tier
    target_id: str
    details: Dict[str, Any]
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AdminActivityLogCreate(BaseModel):
    action: str
    target_type: str
    target_id: str
    details: Dict[str, Any]
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None