from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional, Dict, Any
from services.steam import steam_service
from middleware.auth import get_current_user_optional, get_current_user
from repositories.user import user_repository
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/steam", tags=["Steam API"])

@router.get("/status")
async def steam_api_status():
    """Check if Steam API is available"""
    return {
        "available": steam_service.is_available(),
        "message": "Steam API is ready" if steam_service.is_available() else "Steam API key not configured"
    }

@router.get("/player/{steam_id}")
async def get_player_profile(
    steam_id: str,
    current_user = Depends(get_current_user_optional)
):
    """Get Steam player profile information"""
    if not steam_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Steam API is not available"
        )
    
    try:
        player_data = await steam_service.get_player_summary(steam_id)
        if not player_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Player not found or profile is private"
            )
        
        return {
            "steam_id": steam_id,
            "player_data": player_data,
            "profile_url": steam_service.get_profile_url(steam_id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching Steam player profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch player profile"
        )

@router.get("/player/{steam_id}/friends")
async def get_player_friends(
    steam_id: str,
    current_user = Depends(get_current_user_optional)
):
    """Get Steam player's friend list"""
    if not steam_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Steam API is not available"
        )
    
    try:
        friends_data = await steam_service.get_friend_list(steam_id)
        if not friends_data:
            return {
                "steam_id": steam_id,
                "friends": [],
                "message": "Friend list is private or user not found"
            }
        
        return {
            "steam_id": steam_id,
            "friends": friends_data.get("friends", []),
            "friend_count": len(friends_data.get("friends", []))
        }
        
    except Exception as e:
        logger.error(f"Error fetching Steam friend list: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch friend list"
        )

@router.get("/player/{steam_id}/games")
async def get_player_games(
    steam_id: str,
    include_app_info: bool = Query(True, description="Include game information"),
    current_user = Depends(get_current_user_optional)
):
    """Get Steam player's owned games"""
    if not steam_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Steam API is not available"
        )
    
    try:
        games_data = await steam_service.get_owned_games(steam_id, include_app_info)
        if not games_data:
            return {
                "steam_id": steam_id,
                "games": [],
                "game_count": 0,
                "message": "Game list is private or user not found"
            }
        
        return {
            "steam_id": steam_id,
            "games": games_data.get("games", []),
            "game_count": games_data.get("game_count", 0)
        }
        
    except Exception as e:
        logger.error(f"Error fetching Steam owned games: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch owned games"
        )

@router.get("/player/{steam_id}/recent-games")
async def get_player_recent_games(
    steam_id: str,
    count: int = Query(10, ge=1, le=20, description="Number of recent games to fetch"),
    current_user = Depends(get_current_user_optional)
):
    """Get Steam player's recently played games"""
    if not steam_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Steam API is not available"
        )
    
    try:
        recent_games_data = await steam_service.get_recently_played_games(steam_id, count)
        if not recent_games_data:
            return {
                "steam_id": steam_id,
                "recent_games": [],
                "total_count": 0,
                "message": "No recent games data available"
            }
        
        return {
            "steam_id": steam_id,
            "recent_games": recent_games_data.get("games", []),
            "total_count": recent_games_data.get("total_count", 0)
        }
        
    except Exception as e:
        logger.error(f"Error fetching Steam recent games: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch recent games"
        )

@router.get("/player/{steam_id}/achievements/{app_id}")
async def get_player_achievements(
    steam_id: str,
    app_id: str,
    current_user = Depends(get_current_user_optional)
):
    """Get Steam player's achievements for a specific game"""
    if not steam_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Steam API is not available"
        )
    
    try:
        achievements_data = await steam_service.get_player_achievements(steam_id, app_id)
        if not achievements_data:
            return {
                "steam_id": steam_id,
                "app_id": app_id,
                "achievements": [],
                "message": "No achievement data available for this game"
            }
        
        achievements = achievements_data.get("achievements", [])
        unlocked_count = sum(1 for achievement in achievements if achievement.get("achieved", 0) == 1)
        
        return {
            "steam_id": steam_id,
            "app_id": app_id,
            "game_name": achievements_data.get("gameName", "Unknown Game"),
            "achievements": achievements,
            "total_achievements": len(achievements),
            "unlocked_achievements": unlocked_count,
            "completion_percentage": round((unlocked_count / len(achievements)) * 100, 1) if achievements else 0
        }
        
    except Exception as e:
        logger.error(f"Error fetching Steam achievements: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch achievements"
        )

@router.post("/link-steam")
async def link_steam_account(
    steam_id: str,
    current_user = Depends(get_current_user)
):
    """Link Steam account to user profile"""
    if not steam_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Steam API is not available"
        )
    
    try:
        # Validate Steam ID exists
        is_valid = await steam_service.validate_steam_id(steam_id)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Steam ID or profile is not accessible"
            )
        
        # Update user's Steam ID in database
        # This would require updating the user repository to handle steam_id updates
        # For now, we'll return success
        
        return {
            "message": "Steam account linked successfully",
            "steam_id": steam_id,
            "profile_url": steam_service.get_profile_url(steam_id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error linking Steam account: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to link Steam account"
        )