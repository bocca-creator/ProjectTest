from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional, List
from models.cs2_stats import CS2StatsResponse, CS2StatsUpdate, CS2MatchCreate, CS2Match
from repositories.cs2_stats import cs2_stats_repository
from middleware.auth import get_current_user, get_current_user_optional
from repositories.user import user_repository
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cs2", tags=["CS2 Statistics"])

@router.get("/stats/me", response_model=CS2StatsResponse)
async def get_my_cs2_stats(current_user = Depends(get_current_user)):
    """Get CS2 statistics for the current user"""
    try:
        stats = await cs2_stats_repository.get_player_stats(current_user.id)
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CS2 statistics not found"
            )
        
        recent_matches = await cs2_stats_repository.get_recent_matches(current_user.id, 5)
        
        return CS2StatsResponse(
            user_id=current_user.id,
            username=current_user.username,
            stats=stats,
            recent_matches=recent_matches,
            rank_progression=[]  # TODO: Implement rank progression tracking
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching CS2 stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch CS2 statistics"
        )

@router.get("/stats/{user_id}", response_model=CS2StatsResponse)
async def get_user_cs2_stats(
    user_id: str,
    current_user = Depends(get_current_user_optional)
):
    """Get CS2 statistics for a specific user"""
    try:
        # Check if user exists
        user = await user_repository.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        stats = await cs2_stats_repository.get_player_stats(user_id)
        if not stats:
            # Create default stats for the user
            stats = await cs2_stats_repository._create_default_stats(user_id)
        
        recent_matches = await cs2_stats_repository.get_recent_matches(user_id, 5)
        
        return CS2StatsResponse(
            user_id=user_id,
            username=user.username,
            stats=stats,
            recent_matches=recent_matches,
            rank_progression=[]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching CS2 stats for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch CS2 statistics"
        )

@router.put("/stats/me", response_model=CS2StatsResponse)
async def update_my_cs2_stats(
    stats_update: CS2StatsUpdate,
    current_user = Depends(get_current_user)
):
    """Update CS2 statistics for the current user"""
    try:
        stats = await cs2_stats_repository.update_player_stats(current_user.id, stats_update)
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update CS2 statistics"
            )
        
        recent_matches = await cs2_stats_repository.get_recent_matches(current_user.id, 5)
        
        return CS2StatsResponse(
            user_id=current_user.id,
            username=current_user.username,
            stats=stats,
            recent_matches=recent_matches,
            rank_progression=[]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating CS2 stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update CS2 statistics"
        )

@router.post("/matches", response_model=CS2Match)
async def add_match(
    match_data: CS2MatchCreate,
    current_user = Depends(get_current_user)
):
    """Add a new CS2 match"""
    try:
        match = await cs2_stats_repository.add_match(current_user.id, match_data)
        if not match:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add match"
            )
        
        return match
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding CS2 match: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add match"
        )

@router.get("/matches/me")
async def get_my_matches(
    limit: int = Query(10, ge=1, le=50),
    current_user = Depends(get_current_user)
):
    """Get recent matches for the current user"""
    try:
        matches = await cs2_stats_repository.get_recent_matches(current_user.id, limit)
        return {
            "matches": matches,
            "total_count": len(matches),
            "user_id": current_user.id
        }
        
    except Exception as e:
        logger.error(f"Error fetching matches: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch matches"
        )

@router.get("/leaderboard")
async def get_leaderboard(
    stat_type: str = Query("kd_ratio", description="Statistic to rank by"),
    limit: int = Query(100, ge=1, le=100),
    current_user = Depends(get_current_user_optional)
):
    """Get CS2 leaderboard"""
    try:
        # Validate stat type
        valid_stats = [
            "kd_ratio", "total_kills", "win_rate", "matches_played", 
            "headshot_percentage", "mvp_count", "adr", "rank_rating"
        ]
        
        if stat_type not in valid_stats:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid stat type. Must be one of: {', '.join(valid_stats)}"
            )
        
        leaderboard = await cs2_stats_repository.get_leaderboard(stat_type, limit)
        
        return {
            "leaderboard": leaderboard,
            "stat_type": stat_type,
            "total_entries": len(leaderboard)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching leaderboard: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch leaderboard"
        )

@router.get("/ranks")
async def get_cs2_ranks():
    """Get list of CS2 ranks"""
    from models.cs2_stats import CS2Rank
    
    ranks = []
    for rank in CS2Rank:
        ranks.append({
            "value": rank.value,
            "display_name": rank.value,
            "order": list(CS2Rank).index(rank)
        })
    
    return {"ranks": ranks}

@router.get("/maps")
async def get_cs2_maps():
    """Get list of CS2 maps"""
    from models.cs2_stats import CS2Map
    
    maps = []
    for map_enum in CS2Map:
        maps.append({
            "value": map_enum.value,
            "display_name": map_enum.value.replace("de_", "").title(),
            "category": "Defusal" if map_enum.value.startswith("de_") else "Other"
        })
    
    return {"maps": maps}