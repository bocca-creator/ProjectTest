import aiomysql
import os
import logging
from contextlib import asynccontextmanager
from typing import Optional

logger = logging.getLogger(__name__)

class MySQLDatabase:
    def __init__(self):
        self.pool = None
        self.host = os.environ.get('MYSQL_HOST', 'localhost')
        self.port = int(os.environ.get('MYSQL_PORT', 3306))
        self.user = os.environ.get('MYSQL_USER', 'root')
        self.password = os.environ.get('MYSQL_PASSWORD', 'password')
        self.database = os.environ.get('MYSQL_DATABASE', 'projecttest_sql')

    async def connect(self):
        """Initialize the connection pool"""
        try:
            self.pool = await aiomysql.create_pool(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                db=self.database,
                autocommit=True,
                minsize=1,
                maxsize=10
            )
            logger.info("MySQL connection pool created successfully")
            await self.create_tables()
        except Exception as e:
            logger.error(f"Failed to create MySQL connection pool: {e}")
            # Don't raise the exception - let the app run with MongoDB only
            self.pool = None

    async def disconnect(self):
        """Close the connection pool"""
        if self.pool:
            self.pool.close()
            await self.pool.wait_closed()
            logger.info("MySQL connection pool closed")

    @asynccontextmanager
    async def get_connection(self):
        """Get a connection from the pool"""
        if not self.pool:
            yield None
            return
        
        async with self.pool.acquire() as conn:
            yield conn

    async def create_tables(self):
        """Create necessary tables for user authentication and custom themes"""
        if not self.pool:
            return
            
        async with self.get_connection() as conn:
            if not conn:
                return
                
            async with conn.cursor() as cursor:
                # Users table for authentication data
                await cursor.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id VARCHAR(36) PRIMARY KEY,
                        username VARCHAR(30) UNIQUE NOT NULL,
                        email VARCHAR(255) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        display_name VARCHAR(100),
                        avatar_url TEXT,
                        bio TEXT,
                        role ENUM('admin', 'moderator', 'member', 'banned') DEFAULT 'member',
                        steam_id VARCHAR(50),
                        is_active BOOLEAN DEFAULT TRUE,
                        is_verified BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        last_login TIMESTAMP NULL,
                        login_count INT DEFAULT 0,
                        INDEX idx_email (email),
                        INDEX idx_username (username),
                        INDEX idx_steam_id (steam_id)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)

                # User preferences table
                await cursor.execute("""
                    CREATE TABLE IF NOT EXISTS user_preferences (
                        user_id VARCHAR(36) PRIMARY KEY,
                        language VARCHAR(10) DEFAULT 'en',
                        theme VARCHAR(50) DEFAULT 'darkNeon',
                        custom_theme_data JSON,
                        notifications BOOLEAN DEFAULT TRUE,
                        steam_profile_public BOOLEAN DEFAULT FALSE,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)

                # Custom themes table
                await cursor.execute("""
                    CREATE TABLE IF NOT EXISTS custom_themes (
                        id VARCHAR(36) PRIMARY KEY,
                        user_id VARCHAR(36) NOT NULL,
                        name VARCHAR(50) NOT NULL,
                        description TEXT,
                        category VARCHAR(50) DEFAULT 'Custom',
                        variables JSON NOT NULL,
                        is_public BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                        INDEX idx_user_id (user_id),
                        INDEX idx_public (is_public),
                        INDEX idx_category (category)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)

                # User sessions table (for refresh tokens)
                await cursor.execute("""
                    CREATE TABLE IF NOT EXISTS user_sessions (
                        id VARCHAR(36) PRIMARY KEY,
                        user_id VARCHAR(36) NOT NULL,
                        refresh_token_hash VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        expires_at TIMESTAMP NOT NULL,
                        user_agent TEXT,
                        ip_address VARCHAR(45),
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                        INDEX idx_user_id (user_id),
                        INDEX idx_expires (expires_at)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)

                logger.info("MySQL tables created successfully")

# Global MySQL database instance
mysql_db = MySQLDatabase()