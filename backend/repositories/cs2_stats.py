from typing import Optional, List
from models.cs2_stats import CS2PlayerStats, CS2Match, CS2StatsUpdate, CS2MatchCreate, CS2Rank, CS2Map, CS2MapStats, CS2WeaponStats
from database.mysql import mysql_db
import logging
from datetime import datetime, timedelta
import json
import random

logger = logging.getLogger(__name__)

class CS2StatsRepository:
    async def get_player_stats(self, user_id: str) -> Optional[CS2PlayerStats]:
        """Get CS2 statistics for a player"""
        if not mysql_db.pool:
            # Return mock data when MySQL is not available
            return await self._get_mock_stats(user_id)
        
        try:
            async with mysql_db.pool.acquire() as conn:
                # Get main stats
                result = await conn.fetchone(
                    "SELECT * FROM cs2_player_stats WHERE user_id = ?",
                    (user_id,)
                )
                
                if not result:
                    # Create default stats for new player
                    return await self._create_default_stats(user_id)
                
                # Convert result to CS2PlayerStats
                stats_data = dict(result)
                
                # Parse JSON fields
                if stats_data.get('map_stats'):
                    stats_data['map_stats'] = json.loads(stats_data['map_stats'])
                if stats_data.get('weapon_stats'):
                    stats_data['weapon_stats'] = json.loads(stats_data['weapon_stats'])
                if stats_data.get('recent_matches'):
                    stats_data['recent_matches'] = json.loads(stats_data['recent_matches'])
                
                return CS2PlayerStats(**stats_data)
                
        except Exception as e:
            logger.error(f"Error fetching CS2 stats for user {user_id}: {e}")
            return await self._get_mock_stats(user_id)

    async def update_player_stats(self, user_id: str, stats_update: CS2StatsUpdate) -> Optional[CS2PlayerStats]:
        """Update CS2 statistics for a player"""
        if not mysql_db.pool:
            # Return updated mock data
            stats = await self._get_mock_stats(user_id)
            return stats
        
        try:
            async with mysql_db.pool.acquire() as conn:
                # Get current stats
                current_stats = await self.get_player_stats(user_id)
                if not current_stats:
                    current_stats = await self._create_default_stats(user_id)
                
                # Update fields
                update_data = stats_update.dict(exclude_unset=True)
                for field, value in update_data.items():
                    setattr(current_stats, field, value)
                
                # Recalculate derived stats
                if current_stats.total_deaths > 0:
                    current_stats.kd_ratio = round(current_stats.total_kills / current_stats.total_deaths, 2)
                
                if current_stats.matches_played > 0:
                    current_stats.win_rate = round((current_stats.matches_won / current_stats.matches_played) * 100, 1)
                
                current_stats.updated_at = datetime.utcnow()
                
                # Save to database
                await self._save_stats_to_db(current_stats)
                return current_stats
                
        except Exception as e:
            logger.error(f"Error updating CS2 stats for user {user_id}: {e}")
            return await self._get_mock_stats(user_id)

    async def add_match(self, user_id: str, match_data: CS2MatchCreate) -> Optional[CS2Match]:
        """Add a new match and update player stats"""
        if not mysql_db.pool:
            # Create mock match
            match = CS2Match(
                user_id=user_id,
                match_date=datetime.utcnow(),
                **match_data.dict()
            )
            return match
        
        try:
            async with mysql_db.pool.acquire() as conn:
                # Create match record
                match = CS2Match(
                    user_id=user_id,
                    match_date=datetime.utcnow(),
                    **match_data.dict()
                )
                
                # Insert match into database
                await conn.execute(
                    """INSERT INTO cs2_matches 
                       (id, user_id, match_date, game_mode, map_name, duration_minutes, 
                        result, team_score, enemy_score, kills, deaths, assists, score, 
                        mvp, headshots, damage_dealt, utility_damage, enemies_flashed,
                        money_spent, equipment_value, rounds_won, rounds_lost, 
                        first_kill_rounds, first_death_rounds, created_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (match.id, match.user_id, match.match_date, match.game_mode.value, 
                     match.map_name.value, match.duration_minutes, match.result, 
                     match.team_score, match.enemy_score, match.kills, match.deaths, 
                     match.assists, match.score, match.mvp, match.headshots, 
                     match.damage_dealt, match.utility_damage, match.enemies_flashed,
                     match.money_spent, match.equipment_value, match.rounds_won, 
                     match.rounds_lost, match.first_kill_rounds, match.first_death_rounds,
                     match.created_at)
                )
                
                # Update player stats based on match
                await self._update_stats_from_match(user_id, match)
                
                return match
                
        except Exception as e:
            logger.error(f"Error adding CS2 match for user {user_id}: {e}")
            return None

    async def get_recent_matches(self, user_id: str, limit: int = 10) -> List[CS2Match]:
        """Get recent matches for a player"""
        if not mysql_db.pool:
            # Return mock matches
            return await self._get_mock_matches(user_id, limit)
        
        try:
            async with mysql_db.pool.acquire() as conn:
                results = await conn.fetchall(
                    "SELECT * FROM cs2_matches WHERE user_id = ? ORDER BY match_date DESC LIMIT ?",
                    (user_id, limit)
                )
                
                matches = []
                for result in results:
                    match_data = dict(result)
                    matches.append(CS2Match(**match_data))
                
                return matches
                
        except Exception as e:
            logger.error(f"Error fetching recent matches for user {user_id}: {e}")
            return await self._get_mock_matches(user_id, limit)

    async def get_leaderboard(self, stat_type: str = "kd_ratio", limit: int = 100) -> List[dict]:
        """Get leaderboard for specific stat"""
        if not mysql_db.pool:
            return await self._get_mock_leaderboard(stat_type, limit)
        
        try:
            async with mysql_db.pool.acquire() as conn:
                # Join with users table to get usernames
                query = f"""
                    SELECT cs2_stats.*, users.username, users.display_name 
                    FROM cs2_player_stats cs2_stats
                    JOIN users ON cs2_stats.user_id = users.id
                    ORDER BY cs2_stats.{stat_type} DESC
                    LIMIT ?
                """
                
                results = await conn.fetchall(query, (limit,))
                
                leaderboard = []
                for result in results:
                    leaderboard.append({
                        "user_id": result["user_id"],
                        "username": result["username"],
                        "display_name": result["display_name"],
                        "rank": len(leaderboard) + 1,
                        "value": result[stat_type],
                        "stat_type": stat_type
                    })
                
                return leaderboard
                
        except Exception as e:
            logger.error(f"Error fetching leaderboard: {e}")
            return await self._get_mock_leaderboard(stat_type, limit)

    async def _create_default_stats(self, user_id: str) -> CS2PlayerStats:
        """Create default statistics for a new player"""
        stats = CS2PlayerStats(user_id=user_id)
        
        if mysql_db.pool:
            await self._save_stats_to_db(stats)
        
        return stats

    async def _save_stats_to_db(self, stats: CS2PlayerStats):
        """Save statistics to database"""
        if not mysql_db.pool:
            return
        
        try:
            async with mysql_db.pool.acquire() as conn:
                # Serialize complex fields
                map_stats_json = json.dumps([stat.dict() for stat in stats.map_stats])
                weapon_stats_json = json.dumps([stat.dict() for stat in stats.weapon_stats])
                recent_matches_json = json.dumps(stats.recent_matches)
                
                await conn.execute(
                    """INSERT OR REPLACE INTO cs2_player_stats 
                       (id, user_id, total_kills, total_deaths, total_assists, kd_ratio,
                        headshot_percentage, accuracy, matches_played, matches_won, matches_lost,
                        matches_drawn, win_rate, current_rank, rank_rating, peak_rank,
                        average_score, mvp_count, adr, kast, total_playtime_hours,
                        last_match_date, clutch_wins, clutch_attempts, first_kills,
                        first_deaths, flashbang_assists, favorite_map, map_stats,
                        weapon_stats, recent_matches, current_streak, streak_type,
                        created_at, updated_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (stats.id, stats.user_id, stats.total_kills, stats.total_deaths,
                     stats.total_assists, stats.kd_ratio, stats.headshot_percentage,
                     stats.accuracy, stats.matches_played, stats.matches_won,
                     stats.matches_lost, stats.matches_drawn, stats.win_rate,
                     stats.current_rank.value, stats.rank_rating, stats.peak_rank.value,
                     stats.average_score, stats.mvp_count, stats.adr, stats.kast,
                     stats.total_playtime_hours, stats.last_match_date, stats.clutch_wins,
                     stats.clutch_attempts, stats.first_kills, stats.first_deaths,
                     stats.flashbang_assists, stats.favorite_map.value if stats.favorite_map else None,
                     map_stats_json, weapon_stats_json, recent_matches_json,
                     stats.current_streak, stats.streak_type, stats.created_at, stats.updated_at)
                )
                
        except Exception as e:
            logger.error(f"Error saving CS2 stats to database: {e}")

    async def _update_stats_from_match(self, user_id: str, match: CS2Match):
        """Update player statistics based on a completed match"""
        stats = await self.get_player_stats(user_id)
        if not stats:
            return
        
        # Update match counts
        stats.matches_played += 1
        if match.result == "win":
            stats.matches_won += 1
        elif match.result == "loss":
            stats.matches_lost += 1
        else:
            stats.matches_drawn += 1
        
        # Update kill/death stats
        stats.total_kills += match.kills
        stats.total_deaths += match.deaths
        stats.total_assists += match.assists
        
        # Update derived stats
        if stats.total_deaths > 0:
            stats.kd_ratio = round(stats.total_kills / stats.total_deaths, 2)
        
        if stats.matches_played > 0:
            stats.win_rate = round((stats.matches_won / stats.matches_played) * 100, 1)
        
        if match.mvp:
            stats.mvp_count += 1
        
        # Update headshot percentage
        if match.headshots > 0 and match.kills > 0:
            current_hs = (stats.headshot_percentage / 100) * (stats.total_kills - match.kills)
            new_hs = current_hs + match.headshots
            stats.headshot_percentage = round((new_hs / stats.total_kills) * 100, 1)
        
        stats.last_match_date = match.match_date
        stats.updated_at = datetime.utcnow()
        
        # Update recent matches list
        stats.recent_matches = ([match.id] + stats.recent_matches)[:10]
        
        await self._save_stats_to_db(stats)

    async def _get_mock_stats(self, user_id: str) -> CS2PlayerStats:
        """Generate realistic mock CS2 statistics"""
        # Generate realistic stats based on user_id for consistency
        random.seed(hash(user_id) % 2**32)
        
        # Generate base stats
        matches_played = random.randint(50, 500)
        win_rate = random.uniform(45, 65)
        matches_won = int(matches_played * win_rate / 100)
        matches_lost = matches_played - matches_won
        
        total_kills = random.randint(matches_played * 8, matches_played * 25)
        total_deaths = random.randint(matches_played * 8, matches_played * 20)
        total_assists = random.randint(matches_played * 2, matches_played * 8)
        
        kd_ratio = round(total_kills / max(total_deaths, 1), 2)
        headshot_percentage = random.uniform(25, 55)
        
        # Pick a random rank based on skill distribution
        ranks = list(CS2Rank)
        rank_weights = [0.1, 0.15, 0.15, 0.15, 0.1, 0.1, 0.08, 0.06, 0.04, 0.03, 0.02, 0.01, 0.005, 0.003, 0.002, 0.001, 0.0005, 0.0002]
        current_rank = random.choices(ranks[:-1], weights=rank_weights)[0]  # Exclude UNRANKED
        
        return CS2PlayerStats(
            user_id=user_id,
            total_kills=total_kills,
            total_deaths=total_deaths,
            total_assists=total_assists,
            kd_ratio=kd_ratio,
            headshot_percentage=round(headshot_percentage, 1),
            accuracy=round(random.uniform(15, 35), 1),
            matches_played=matches_played,
            matches_won=matches_won,
            matches_lost=matches_lost,
            win_rate=round(win_rate, 1),
            current_rank=current_rank,
            rank_rating=random.randint(1000, 25000),
            peak_rank=random.choice([current_rank] + [rank for rank in ranks if ranks.index(rank) <= ranks.index(current_rank) + 2]),
            average_score=round(random.uniform(18, 28), 1),
            mvp_count=random.randint(5, matches_played // 8),
            adr=round(random.uniform(65, 95), 1),
            kast=round(random.uniform(60, 80), 1),
            total_playtime_hours=round(random.uniform(100, 2000), 1),
            last_match_date=datetime.utcnow() - timedelta(hours=random.randint(1, 72)),
            clutch_wins=random.randint(5, 25),
            clutch_attempts=random.randint(15, 50),
            first_kills=random.randint(matches_played // 4, matches_played // 2),
            first_deaths=random.randint(matches_played // 4, matches_played // 2),
            favorite_map=random.choice(list(CS2Map)),
            current_streak=random.randint(-5, 8),
            streak_type=random.choice(["win", "loss", "none"])
        )

    async def _get_mock_matches(self, user_id: str, limit: int = 10) -> List[CS2Match]:
        """Generate mock recent matches"""
        random.seed(hash(user_id + "matches") % 2**32)
        matches = []
        
        for i in range(limit):
            match_date = datetime.utcnow() - timedelta(hours=random.randint(1, 168))  # Last week
            game_mode = random.choice(list(CS2GameMode))
            map_name = random.choice(list(CS2Map))
            result = random.choices(["win", "loss", "draw"], weights=[0.5, 0.45, 0.05])[0]
            
            if result == "win":
                team_score = random.randint(16, 19)
                enemy_score = random.randint(10, 15)
            elif result == "loss":
                team_score = random.randint(10, 15)
                enemy_score = random.randint(16, 19)
            else:
                team_score = enemy_score = 15
            
            kills = random.randint(8, 30)
            deaths = random.randint(8, 25)
            assists = random.randint(1, 8)
            
            matches.append(CS2Match(
                user_id=user_id,
                match_date=match_date,
                game_mode=game_mode,
                map_name=map_name,
                duration_minutes=random.randint(25, 65),
                result=result,
                team_score=team_score,
                enemy_score=enemy_score,
                kills=kills,
                deaths=deaths,
                assists=assists,
                score=kills * 2 + assists - deaths,
                mvp=random.choice([True] + [False] * 5),  # 1 in 6 chance
                headshots=random.randint(0, kills // 2),
                damage_dealt=random.randint(kills * 80, kills * 120)
            ))
        
        return matches

    async def _get_mock_leaderboard(self, stat_type: str, limit: int) -> List[dict]:
        """Generate mock leaderboard"""
        leaderboard = []
        for i in range(min(limit, 20)):  # Limit mock data to 20 entries
            user_id = f"mock_user_{i}"
            username = f"Player{i+1}"
            
            # Generate value based on stat type
            if stat_type == "kd_ratio":
                value = round(random.uniform(0.5, 3.0), 2)
            elif stat_type == "total_kills":
                value = random.randint(1000, 10000)
            elif stat_type == "win_rate":
                value = round(random.uniform(30, 85), 1)
            else:
                value = random.randint(100, 1000)
            
            leaderboard.append({
                "user_id": user_id,
                "username": username,
                "display_name": f"Display {username}",
                "rank": i + 1,
                "value": value,
                "stat_type": stat_type
            })
        
        # Sort by value descending
        leaderboard.sort(key=lambda x: x["value"], reverse=True)
        
        return leaderboard


# Global repository instance
cs2_stats_repository = CS2StatsRepository()