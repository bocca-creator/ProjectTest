from typing import Optional, List
import json
from datetime import datetime
from models.user import User, UserCreate, UserUpdate, UserPreferences, CustomTheme, CustomThemeCreate
from database.mysql import mysql_db
from services.auth import auth_service
import logging
import os
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

# MongoDB connection setup
def get_mongo_db():
    """Get MongoDB connection"""
    try:
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/projecttest')
        client = AsyncIOMotorClient(mongo_url)
        return client[os.environ.get('DB_NAME', 'projecttest')]
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        return None

# MongoDB connection will be set by server.py
mongo_db = None

def set_mongo_db(db):
    """Set MongoDB connection from server.py"""
    global mongo_db
    mongo_db = db

class UserRepository:
    async def create_user(self, user_data: UserCreate) -> Optional[User]:
        """Create a new user in MySQL database or MongoDB as fallback"""
        # Try MySQL first
        if mysql_db.pool:
            return await self._create_user_mysql(user_data)
        else:
            # Fall back to MongoDB
            return await self._create_user_mongodb(user_data)
    
    async def _create_user_mysql(self, user_data: UserCreate) -> Optional[User]:
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
                    
                logger.info(f"User created successfully in MySQL: {user.username}")
                return user
                
        except Exception as e:
            logger.error(f"Error creating user in MySQL: {e}")
            return None
    
    async def _create_user_mongodb(self, user_data: UserCreate) -> Optional[User]:
        """Create a new user in MongoDB as fallback"""
        try:
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
            
            # Convert to dict for MongoDB
            user_dict = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "password_hash": user.password_hash,
                "display_name": user.display_name,
                "avatar_url": user.avatar_url,
                "bio": user.bio,
                "role": user.role.value,
                "steam_id": user.steam_id,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
                "created_at": user.created_at,
                "updated_at": user.updated_at,
                "last_login": user.last_login,
                "login_count": user.login_count,
                "preferences": {
                    "language": user.preferences.language,
                    "theme": user.preferences.theme,
                    "custom_theme": user.preferences.custom_theme,
                    "notifications": user.preferences.notifications,
                    "steam_profile_public": user.preferences.steam_profile_public
                }
            }
            
            # Insert into MongoDB
            mongo_db = get_mongo_db()
            if mongo_db:
                await mongo_db.users.insert_one(user_dict)
            
            logger.info(f"User created successfully in MongoDB: {user.username}")
            return user
            
        except Exception as e:
            logger.error(f"Error creating user in MongoDB: {e}")
            return None

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email from MySQL database or MongoDB as fallback"""
        # Try MySQL first
        if mysql_db.pool:
            return await self._get_user_by_email_mysql(email)
        else:
            # Fall back to MongoDB
            return await self._get_user_by_email_mongodb(email)
    
    async def _get_user_by_email_mysql(self, email: str) -> Optional[User]:
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
            logger.error(f"Error getting user by email from MySQL: {e}")
            return None
    
    async def _get_user_by_email_mongodb(self, email: str) -> Optional[User]:
        """Get user by email from MongoDB as fallback"""
        try:
            mongo_db = get_mongo_db()
            if not mongo_db:
                return None
            user_doc = await mongo_db.users.find_one({"email": email})
            if not user_doc:
                return None
            
            return self._doc_to_user(user_doc)
            
        except Exception as e:
            logger.error(f"Error getting user by email from MongoDB: {e}")
            return None

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID from MySQL database or MongoDB as fallback"""
        # Try MySQL first
        if mysql_db.pool:
            return await self._get_user_by_id_mysql(user_id)
        else:
            # Fall back to MongoDB
            return await self._get_user_by_id_mongodb(user_id)
    
    async def _get_user_by_id_mysql(self, user_id: str) -> Optional[User]:
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
            logger.error(f"Error getting user by ID from MySQL: {e}")
            return None
    
    async def _get_user_by_id_mongodb(self, user_id: str) -> Optional[User]:
        """Get user by ID from MongoDB as fallback"""
        try:
            mongo_db = get_mongo_db()
            if not mongo_db:
                return None
            user_doc = await mongo_db.users.find_one({"id": user_id})
            if not user_doc:
                return None
            
            return self._doc_to_user(user_doc)
            
        except Exception as e:
            logger.error(f"Error getting user by ID from MongoDB: {e}")
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
        from models.user import UserRole
        
        preferences = UserPreferences(
            language=row[15] or "en",
            theme=row[16] or "darkNeon",
            custom_theme=json.loads(row[17]) if row[17] else None,
            notifications=row[18] if row[18] is not None else True,
            steam_profile_public=row[19] if row[19] is not None else False
        )
        
        # Convert role string to UserRole enum
        role_str = row[7] or "member"
        try:
            role = UserRole(role_str)
        except ValueError:
            role = UserRole.MEMBER
        
        return User(
            id=row[0],
            username=row[1],
            email=row[2],
            password_hash=row[3],
            display_name=row[4],
            avatar_url=row[5],
            bio=row[6],
            role=role,
            steam_id=row[8],
            is_active=row[9],
            is_verified=row[10],
            created_at=row[11],
            updated_at=row[12],
            last_login=row[13],
            login_count=row[14],
            preferences=preferences
        )
    
    def _doc_to_user(self, doc) -> User:
        """Convert MongoDB document to User object"""
        from models.user import UserRole
        
        prefs = doc.get("preferences", {})
        preferences = UserPreferences(
            language=prefs.get("language", "en"),
            theme=prefs.get("theme", "darkNeon"),
            custom_theme=prefs.get("custom_theme"),
            notifications=prefs.get("notifications", True),
            steam_profile_public=prefs.get("steam_profile_public", False)
        )
        
        # Convert role string to UserRole enum
        role_str = doc.get("role", "member")
        try:
            role = UserRole(role_str)
        except ValueError:
            role = UserRole.MEMBER
        
        return User(
            id=doc["id"],
            username=doc["username"],
            email=doc["email"],
            password_hash=doc["password_hash"],
            display_name=doc.get("display_name"),
            avatar_url=doc.get("avatar_url"),
            bio=doc.get("bio"),
            role=role,
            steam_id=doc.get("steam_id"),
            is_active=doc.get("is_active", True),
            is_verified=doc.get("is_verified", False),
            created_at=doc.get("created_at"),
            updated_at=doc.get("updated_at"),
            last_login=doc.get("last_login"),
            login_count=doc.get("login_count", 0),
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