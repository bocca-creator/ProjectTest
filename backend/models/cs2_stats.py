from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid
from enum import Enum

class CS2Rank(str, Enum):
    SILVER_I = "Silver I"
    SILVER_II = "Silver II"
    SILVER_III = "Silver III"
    SILVER_IV = "Silver IV"
    SILVER_ELITE = "Silver Elite"
    SILVER_ELITE_MASTER = "Silver Elite Master"
    GOLD_NOVA_I = "Gold Nova I"
    GOLD_NOVA_II = "Gold Nova II"
    GOLD_NOVA_III = "Gold Nova III"
    GOLD_NOVA_MASTER = "Gold Nova Master"
    MASTER_GUARDIAN_I = "Master Guardian I"
    MASTER_GUARDIAN_II = "Master Guardian II"
    MASTER_GUARDIAN_ELITE = "Master Guardian Elite"
    DISTINGUISHED_MASTER_GUARDIAN = "Distinguished Master Guardian"
    LEGENDARY_EAGLE = "Legendary Eagle"
    LEGENDARY_EAGLE_MASTER = "Legendary Eagle Master"
    SUPREME_MASTER_FIRST_CLASS = "Supreme Master First Class"
    GLOBAL_ELITE = "Global Elite"
    UNRANKED = "Unranked"

class CS2GameMode(str, Enum):
    COMPETITIVE = "competitive"
    CASUAL = "casual"
    DEATHMATCH = "deathmatch"
    ARMS_RACE = "arms_race"
    DEMOLITION = "demolition"
    WINGMAN = "wingman"

class CS2Map(str, Enum):
    DUST2 = "de_dust2"
    MIRAGE = "de_mirage"
    INFERNO = "de_inferno"
    CACHE = "de_cache"
    OVERPASS = "de_overpass"
    TRAIN = "de_train"
    NUKE = "de_nuke"
    VERTIGO = "de_vertigo"
    ANCIENT = "de_ancient"
    ANUBIS = "de_anubis"

class CS2WeaponStats(BaseModel):
    weapon_name: str
    kills: int = 0
    headshots: int = 0
    shots_fired: int = 0
    shots_hit: int = 0
    damage_dealt: int = 0

class CS2MapStats(BaseModel):
    map_name: CS2Map
    matches_played: int = 0
    wins: int = 0
    losses: int = 0
    draws: int = 0
    kills: int = 0
    deaths: int = 0
    assists: int = 0
    adr: float = 0.0  # Average Damage per Round
    win_rate: float = 0.0

class CS2PlayerStats(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    
    # Overall Statistics
    total_kills: int = 0
    total_deaths: int = 0
    total_assists: int = 0
    kd_ratio: float = 0.0
    headshot_percentage: float = 0.0
    accuracy: float = 0.0
    
    # Match Statistics
    matches_played: int = 0
    matches_won: int = 0
    matches_lost: int = 0
    matches_drawn: int = 0
    win_rate: float = 0.0
    
    # Ranking
    current_rank: CS2Rank = CS2Rank.UNRANKED
    rank_rating: int = 0
    peak_rank: CS2Rank = CS2Rank.UNRANKED
    
    # Performance Metrics
    average_score: float = 0.0
    mvp_count: int = 0
    adr: float = 0.0  # Average Damage per Round
    kast: float = 0.0  # Kill/Assist/Survive/Trade percentage
    
    # Time Statistics
    total_playtime_hours: float = 0.0
    last_match_date: Optional[datetime] = None
    
    # Advanced Stats
    clutch_wins: int = 0
    clutch_attempts: int = 0
    first_kills: int = 0
    first_deaths: int = 0
    flashbang_assists: int = 0
    
    # Map Statistics
    favorite_map: Optional[CS2Map] = None
    map_stats: List[CS2MapStats] = []
    
    # Weapon Statistics
    weapon_stats: List[CS2WeaponStats] = []
    
    # Recent Performance
    recent_matches: List[str] = []  # List of recent match IDs
    current_streak: int = 0  # Win/loss streak
    streak_type: str = "none"  # "win", "loss", "none"
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CS2Match(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    
    # Match Info
    match_date: datetime
    game_mode: CS2GameMode
    map_name: CS2Map
    duration_minutes: int
    
    # Match Result
    result: str  # "win", "loss", "draw"
    team_score: int = 0
    enemy_score: int = 0
    
    # Personal Performance
    kills: int = 0
    deaths: int = 0
    assists: int = 0
    score: int = 0
    mvp: bool = False
    
    # Detailed Stats
    headshots: int = 0
    damage_dealt: int = 0
    utility_damage: int = 0
    enemies_flashed: int = 0
    
    # Economic Stats
    money_spent: int = 0
    equipment_value: int = 0
    
    # Round Stats
    rounds_won: int = 0
    rounds_lost: int = 0
    first_kill_rounds: int = 0
    first_death_rounds: int = 0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CS2StatsResponse(BaseModel):
    user_id: str
    username: str
    stats: CS2PlayerStats
    recent_matches: List[CS2Match] = []
    rank_progression: List[dict] = []

class CS2StatsUpdate(BaseModel):
    kills: Optional[int] = None
    deaths: Optional[int] = None
    assists: Optional[int] = None
    matches_played: Optional[int] = None
    matches_won: Optional[int] = None
    current_rank: Optional[CS2Rank] = None
    rank_rating: Optional[int] = None

class CS2MatchCreate(BaseModel):
    game_mode: CS2GameMode
    map_name: CS2Map
    duration_minutes: int
    result: str
    team_score: int = 0
    enemy_score: int = 0
    kills: int = 0
    deaths: int = 0
    assists: int = 0
    score: int = 0
    mvp: bool = False
    headshots: int = 0
    damage_dealt: int = 0