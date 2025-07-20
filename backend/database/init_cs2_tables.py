"""
Initialize CS2 statistics tables in MySQL database
"""
import asyncio
import logging
from database.mysql import mysql_db

logger = logging.getLogger(__name__)

async def create_cs2_tables():
    """Create CS2 statistics tables"""
    if not mysql_db.pool:
        logger.warning("MySQL not available, tables will be created when connection is established")
        return False
    
    try:
        async with mysql_db.pool.acquire() as conn:
            # Create cs2_player_stats table
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS cs2_player_stats (
                    id VARCHAR(36) PRIMARY KEY,
                    user_id VARCHAR(36) NOT NULL UNIQUE,
                    total_kills INT DEFAULT 0,
                    total_deaths INT DEFAULT 0,
                    total_assists INT DEFAULT 0,
                    kd_ratio DECIMAL(5,2) DEFAULT 0.00,
                    headshot_percentage DECIMAL(5,2) DEFAULT 0.00,
                    accuracy DECIMAL(5,2) DEFAULT 0.00,
                    matches_played INT DEFAULT 0,
                    matches_won INT DEFAULT 0,
                    matches_lost INT DEFAULT 0,
                    matches_drawn INT DEFAULT 0,
                    win_rate DECIMAL(5,2) DEFAULT 0.00,
                    current_rank VARCHAR(50) DEFAULT 'Unranked',
                    rank_rating INT DEFAULT 0,
                    peak_rank VARCHAR(50) DEFAULT 'Unranked',
                    average_score DECIMAL(5,2) DEFAULT 0.00,
                    mvp_count INT DEFAULT 0,
                    adr DECIMAL(5,2) DEFAULT 0.00,
                    kast DECIMAL(5,2) DEFAULT 0.00,
                    total_playtime_hours DECIMAL(10,2) DEFAULT 0.00,
                    last_match_date DATETIME NULL,
                    clutch_wins INT DEFAULT 0,
                    clutch_attempts INT DEFAULT 0,
                    first_kills INT DEFAULT 0,
                    first_deaths INT DEFAULT 0,
                    flashbang_assists INT DEFAULT 0,
                    favorite_map VARCHAR(20) NULL,
                    map_stats TEXT NULL,
                    weapon_stats TEXT NULL,
                    recent_matches TEXT NULL,
                    current_streak INT DEFAULT 0,
                    streak_type VARCHAR(10) DEFAULT 'none',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_user_id (user_id),
                    INDEX idx_kd_ratio (kd_ratio),
                    INDEX idx_win_rate (win_rate),
                    INDEX idx_rank_rating (rank_rating),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            ''')
            
            # Create cs2_matches table
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS cs2_matches (
                    id VARCHAR(36) PRIMARY KEY,
                    user_id VARCHAR(36) NOT NULL,
                    match_date DATETIME NOT NULL,
                    game_mode VARCHAR(20) NOT NULL,
                    map_name VARCHAR(20) NOT NULL,
                    duration_minutes INT NOT NULL,
                    result VARCHAR(10) NOT NULL,
                    team_score INT DEFAULT 0,
                    enemy_score INT DEFAULT 0,
                    kills INT DEFAULT 0,
                    deaths INT DEFAULT 0,
                    assists INT DEFAULT 0,
                    score INT DEFAULT 0,
                    mvp BOOLEAN DEFAULT FALSE,
                    headshots INT DEFAULT 0,
                    damage_dealt INT DEFAULT 0,
                    utility_damage INT DEFAULT 0,
                    enemies_flashed INT DEFAULT 0,
                    money_spent INT DEFAULT 0,
                    equipment_value INT DEFAULT 0,
                    rounds_won INT DEFAULT 0,
                    rounds_lost INT DEFAULT 0,
                    first_kill_rounds INT DEFAULT 0,
                    first_death_rounds INT DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_user_id (user_id),
                    INDEX idx_match_date (match_date),
                    INDEX idx_map_name (map_name),
                    INDEX idx_result (result),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            ''')
            
            logger.info("CS2 statistics tables created successfully")
            return True
            
    except Exception as e:
        logger.error(f"Error creating CS2 tables: {e}")
        return False

async def create_admin_user():
    """Create admin test user"""
    from repositories.user import user_repository
    from models.user import UserCreate, UserRole
    
    try:
        # Check if admin user already exists
        existing_admin = await user_repository.get_user_by_email("admin@admin.com")
        if existing_admin:
            logger.info("Admin user already exists")
            return existing_admin
        
        # Create admin user
        admin_data = UserCreate(
            username="admin",
            email="admin@admin.com",
            password="admin123"
        )
        
        admin_user = await user_repository.create_user(admin_data)
        if admin_user:
            # Update role to admin if using MySQL
            if mysql_db.pool:
                from models.user import UserUpdate
                await user_repository.update_user(admin_user.id, UserUpdate())
                # Manually set role (since UserUpdate doesn't include role)
                async with mysql_db.pool.acquire() as conn:
                    await conn.execute(
                        "UPDATE users SET role = ? WHERE id = ?",
                        (UserRole.ADMIN.value, admin_user.id)
                    )
            else:
                # Update role to admin in MongoDB
                from repositories.user import mongo_db as user_mongo_db
                if user_mongo_db:
                    await user_mongo_db.users.update_one(
                        {"id": admin_user.id},
                        {"$set": {"role": UserRole.ADMIN.value}}
                    )
            
            logger.info("Admin user created successfully - admin@admin.com / admin123")
            return admin_user
        
    except Exception as e:
        logger.error(f"Error creating admin user: {e}")
        return None

if __name__ == "__main__":
    async def main():
        await mysql_db.connect()
        await create_cs2_tables()
        await create_admin_user()
        await mysql_db.disconnect()
    
    asyncio.run(main())