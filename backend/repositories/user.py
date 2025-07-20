from typing import Optional, List
import json
from datetime import datetime
from models.user import User, UserCreate, UserUpdate, UserPreferences, CustomTheme, CustomThemeCreate
from database.mysql import mysql_db
from services.auth import auth_service
import logging
from motor.motor_asyncio import AsyncIOMotorClient
import os

logger = logging.getLogger(__name__)

# MongoDB connection for fallback
mongo_url = os.environ['MONGO_URL']
mongo_client = AsyncIOMotorClient(mongo_url)
mongo_db = mongo_client[os.environ['DB_NAME']]

class UserRepository:
    async def create_user(self, user_data: UserCreate) -> Optional[User]:
        """Create a new user in MySQL database"""
        try:
            async with mysql_db.get_connection() as conn:
                if not conn:
                    return None
                    
                # Hash the password
                password_hash = auth_service.hash_password(user_data.password)
                
                # Create user object
                user = User(
                    username=user_data.username,
                    email=user_data.email,
                    password_hash=password_hash,
                    display_name=user_data.display_name or user_data.username,
                    preferences=UserPreferences(language=user_data.language)
                )
                
                async with conn.cursor() as cursor:
                    # Insert user
                    await cursor.execute("""
                        INSERT INTO users (id, username, email, password_hash, display_name, 
                                         role, is_active, is_verified, created_at, updated_at, login_count)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        user.id, user.username, user.email, user.password_hash,
                        user.display_name, user.role.value, user.is_active, 
                        user.is_verified, user.created_at, user.updated_at, user.login_count
                    ))
                    
                    # Insert user preferences
                    await cursor.execute("""
                        INSERT INTO user_preferences (user_id, language, theme, notifications, steam_profile_public)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (
                        user.id, user.preferences.language, user.preferences.theme,
                        user.preferences.notifications, user.preferences.steam_profile_public
                    ))
                    
                logger.info(f"User created successfully: {user.username}")
                return user
                
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return None

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email from MySQL database"""
        try:
            async with mysql_db.get_connection() as conn:
                if not conn:
                    return None
                    
                async with conn.cursor() as cursor:
                    await cursor.execute("""
                        SELECT u.id, u.username, u.email, u.password_hash, u.display_name,
                               u.avatar_url, u.bio, u.role, u.steam_id, u.is_active, u.is_verified,
                               u.created_at, u.updated_at, u.last_login, u.login_count,
                               p.language, p.theme, p.custom_theme_data, p.notifications, p.steam_profile_public
                        FROM users u
                        LEFT JOIN user_preferences p ON u.id = p.user_id
                        WHERE u.email = %s
                    """, (email,))
                    
                    row = await cursor.fetchone()
                    if not row:
                        return None
                    
                    return self._row_to_user(row)
                    
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            return None

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID from MySQL database"""
        try:
            async with mysql_db.get_connection() as conn:
                if not conn:
                    return None
                    
                async with conn.cursor() as cursor:
                    await cursor.execute("""
                        SELECT u.id, u.username, u.email, u.password_hash, u.display_name,
                               u.avatar_url, u.bio, u.role, u.steam_id, u.is_active, u.is_verified,
                               u.created_at, u.updated_at, u.last_login, u.login_count,
                               p.language, p.theme, p.custom_theme_data, p.notifications, p.steam_profile_public
                        FROM users u
                        LEFT JOIN user_preferences p ON u.id = p.user_id
                        WHERE u.id = %s
                    """, (user_id,))
                    
                    row = await cursor.fetchone()
                    if not row:
                        return None
                    
                    return self._row_to_user(row)
                    
        except Exception as e:
            logger.error(f"Error getting user by ID: {e}")
            return None

    async def update_user_login(self, user_id: str) -> bool:
        """Update user's last login and increment login count"""
        try:
            async with mysql_db.get_connection() as conn:
                if not conn:
                    return False
                    
                async with conn.cursor() as cursor:
                    await cursor.execute("""
                        UPDATE users 
                        SET last_login = %s, login_count = login_count + 1, updated_at = %s
                        WHERE id = %s
                    """, (datetime.utcnow(), datetime.utcnow(), user_id))
                    
                    return cursor.rowcount > 0
                    
        except Exception as e:
            logger.error(f"Error updating user login: {e}")
            return False

    async def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[User]:
        """Update user information"""
        try:
            async with mysql_db.get_connection() as conn:
                if not conn:
                    return None
                    
                async with conn.cursor() as cursor:
                    # Update user basic info
                    update_fields = []
                    update_values = []
                    
                    if user_data.display_name is not None:
                        update_fields.append("display_name = %s")
                        update_values.append(user_data.display_name)
                    
                    if user_data.bio is not None:
                        update_fields.append("bio = %s")
                        update_values.append(user_data.bio)
                    
                    if user_data.avatar_url is not None:
                        update_fields.append("avatar_url = %s")
                        update_values.append(user_data.avatar_url)
                    
                    if update_fields:
                        update_fields.append("updated_at = %s")
                        update_values.extend([datetime.utcnow(), user_id])
                        
                        query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
                        await cursor.execute(query, update_values)
                    
                    # Update preferences if provided
                    if user_data.preferences:
                        await cursor.execute("""
                            UPDATE user_preferences 
                            SET language = %s, theme = %s, custom_theme_data = %s, 
                                notifications = %s, steam_profile_public = %s
                            WHERE user_id = %s
                        """, (
                            user_data.preferences.language,
                            user_data.preferences.theme,
                            json.dumps(user_data.preferences.custom_theme) if user_data.preferences.custom_theme else None,
                            user_data.preferences.notifications,
                            user_data.preferences.steam_profile_public,
                            user_id
                        ))
                    
                    # Return updated user
                    return await self.get_user_by_id(user_id)
                    
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            return None

    def _row_to_user(self, row) -> User:
        """Convert database row to User object"""
        preferences = UserPreferences(
            language=row[15] or "en",
            theme=row[16] or "darkNeon",
            custom_theme=json.loads(row[17]) if row[17] else None,
            notifications=row[18] if row[18] is not None else True,
            steam_profile_public=row[19] if row[19] is not None else False
        )
        
        return User(
            id=row[0],
            username=row[1],
            email=row[2],
            password_hash=row[3],
            display_name=row[4],
            avatar_url=row[5],
            bio=row[6],
            role=row[7],
            steam_id=row[8],
            is_active=row[9],
            is_verified=row[10],
            created_at=row[11],
            updated_at=row[12],
            last_login=row[13],
            login_count=row[14],
            preferences=preferences
        )

class CustomThemeRepository:
    async def create_theme(self, user_id: str, theme_data: CustomThemeCreate) -> Optional[CustomTheme]:
        """Create a new custom theme"""
        try:
            async with mysql_db.get_connection() as conn:
                if not conn:
                    return None
                    
                theme = CustomTheme(
                    user_id=user_id,
                    name=theme_data.name,
                    description=theme_data.description,
                    category=theme_data.category,
                    variables=theme_data.variables,
                    is_public=theme_data.is_public
                )
                
                async with conn.cursor() as cursor:
                    await cursor.execute("""
                        INSERT INTO custom_themes (id, user_id, name, description, category, variables, is_public, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        theme.id, theme.user_id, theme.name, theme.description,
                        theme.category, json.dumps(theme.variables), theme.is_public,
                        theme.created_at, theme.updated_at
                    ))
                    
                logger.info(f"Custom theme created: {theme.name} by user {user_id}")
                return theme
                
        except Exception as e:
            logger.error(f"Error creating custom theme: {e}")
            return None

    async def get_user_themes(self, user_id: str) -> List[CustomTheme]:
        """Get all themes created by a user"""
        try:
            async with mysql_db.get_connection() as conn:
                if not conn:
                    return []
                    
                async with conn.cursor() as cursor:
                    await cursor.execute("""
                        SELECT id, user_id, name, description, category, variables, is_public, created_at, updated_at
                        FROM custom_themes
                        WHERE user_id = %s
                        ORDER BY created_at DESC
                    """, (user_id,))
                    
                    rows = await cursor.fetchall()
                    return [self._row_to_theme(row) for row in rows]
                    
        except Exception as e:
            logger.error(f"Error getting user themes: {e}")
            return []

    async def get_public_themes(self) -> List[CustomTheme]:
        """Get all public themes"""
        try:
            async with mysql_db.get_connection() as conn:
                if not conn:
                    return []
                    
                async with conn.cursor() as cursor:
                    await cursor.execute("""
                        SELECT id, user_id, name, description, category, variables, is_public, created_at, updated_at
                        FROM custom_themes
                        WHERE is_public = TRUE
                        ORDER BY created_at DESC
                        LIMIT 100
                    """)
                    
                    rows = await cursor.fetchall()
                    return [self._row_to_theme(row) for row in rows]
                    
        except Exception as e:
            logger.error(f"Error getting public themes: {e}")
            return []

    def _row_to_theme(self, row) -> CustomTheme:
        """Convert database row to CustomTheme object"""
        return CustomTheme(
            id=row[0],
            user_id=row[1],
            name=row[2],
            description=row[3],
            category=row[4],
            variables=json.loads(row[5]) if isinstance(row[5], str) else row[5],
            is_public=row[6],
            created_at=row[7],
            updated_at=row[8]
        )

# Global repository instances
user_repository = UserRepository()
theme_repository = CustomThemeRepository()