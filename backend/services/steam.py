import httpx
import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from models.user import User

logger = logging.getLogger(__name__)

class SteamAPIService:
    def __init__(self):
        self.api_key = os.environ.get('STEAM_API_KEY')
        self.base_url = "https://api.steampowered.com"
        self.cache_duration = timedelta(hours=24)  # Cache data for 24 hours
    
    def is_available(self) -> bool:
        """Check if Steam API key is available"""
        return bool(self.api_key and self.api_key != "your_steam_api_key_here")
    
    async def get_player_summary(self, steam_id: str) -> Optional[Dict[str, Any]]:
        """Get Steam user profile information"""
        if not self.is_available():
            return None
        
        try:
            url = f"{self.base_url}/ISteamUser/GetPlayerSummaries/v0002/"
            params = {
                "key": self.api_key,
                "steamids": steam_id
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                players = data.get("response", {}).get("players", [])
                
                if players:
                    return players[0]
                else:
                    logger.warning(f"No player data found for Steam ID: {steam_id}")
                    return None
                    
        except httpx.HTTPError as e:
            logger.error(f"Error fetching Steam player summary for {steam_id}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching Steam player summary: {e}")
            return None
    
    async def get_friend_list(self, steam_id: str) -> Optional[Dict[str, Any]]:
        """Get Steam user's friend list"""
        if not self.is_available():
            return None
        
        try:
            url = f"{self.base_url}/ISteamUser/GetFriendList/v0001/"
            params = {
                "key": self.api_key,
                "steamid": steam_id,
                "relationship": "friend"
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                return data.get("friendslist", {})
                
        except httpx.HTTPError as e:
            if response.status_code == 401:
                logger.info(f"Private friend list for Steam ID: {steam_id}")
            else:
                logger.error(f"Error fetching Steam friend list for {steam_id}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching Steam friend list: {e}")
            return None
    
    async def get_owned_games(self, steam_id: str, include_app_info: bool = True) -> Optional[Dict[str, Any]]:
        """Get Steam user's owned games"""
        if not self.is_available():
            return None
        
        try:
            url = f"{self.base_url}/IPlayerService/GetOwnedGames/v0001/"
            params = {
                "key": self.api_key,
                "steamid": steam_id,
                "format": "json",
                "include_appinfo": "1" if include_app_info else "0",
                "include_played_free_games": "1"
            }
            
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                return data.get("response", {})
                
        except httpx.HTTPError as e:
            logger.error(f"Error fetching Steam owned games for {steam_id}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching Steam owned games: {e}")
            return None
    
    async def get_player_achievements(self, steam_id: str, app_id: str) -> Optional[Dict[str, Any]]:
        """Get player achievements for a specific game"""
        if not self.is_available():
            return None
        
        try:
            url = f"{self.base_url}/ISteamUserStats/GetPlayerAchievements/v0001/"
            params = {
                "key": self.api_key,
                "steamid": steam_id,
                "appid": app_id,
                "l": "english"
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                return data.get("playerstats", {})
                
        except httpx.HTTPError as e:
            logger.error(f"Error fetching Steam achievements for {steam_id}, app {app_id}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching Steam achievements: {e}")
            return None
    
    async def get_recently_played_games(self, steam_id: str, count: int = 10) -> Optional[Dict[str, Any]]:
        """Get recently played games for a user"""
        if not self.is_available():
            return None
        
        try:
            url = f"{self.base_url}/IPlayerService/GetRecentlyPlayedGames/v0001/"
            params = {
                "key": self.api_key,
                "steamid": steam_id,
                "format": "json",
                "count": count
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                return data.get("response", {})
                
        except httpx.HTTPError as e:
            logger.error(f"Error fetching recently played games for {steam_id}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching recently played games: {e}")
            return None
    
    async def validate_steam_id(self, steam_id: str) -> bool:
        """Validate if a Steam ID exists and is accessible"""
        try:
            player_data = await self.get_player_summary(steam_id)
            return player_data is not None
        except Exception:
            return False
    
    def get_profile_url(self, steam_id: str) -> str:
        """Get Steam profile URL from Steam ID"""
        return f"https://steamcommunity.com/profiles/{steam_id}"
    
    def get_avatar_url(self, avatar_hash: str, size: str = "full") -> str:
        """Get avatar URL from avatar hash"""
        if not avatar_hash:
            return ""
        
        size_suffix = {
            "small": ".jpg",
            "medium": "_medium.jpg", 
            "full": "_full.jpg"
        }.get(size, "_full.jpg")
        
        return f"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/{avatar_hash[:2]}/{avatar_hash}{size_suffix}"

# Global Steam service instance
steam_service = SteamAPIService()