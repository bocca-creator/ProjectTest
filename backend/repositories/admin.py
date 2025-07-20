from motor.motor_asyncio import AsyncIOMotorClient
from models.admin import (
    AdminDashboardStats, UserManagementFilter, DonationRecord, 
    DonationRecordCreate, TierBenefits, DonationTier, AdminActivityLog,
    AdminActivityLogCreate
)
from models.user import User, UserRole
from repositories.user import user_repository
from repositories.cs2_stats import cs2_stats_repository
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import os
import logging

logger = logging.getLogger(__name__)

class AdminRepository:
    def __init__(self):
        mongo_url = os.environ['MONGO_URL']
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client[os.environ['DB_NAME']]
        self.donations_collection = self.db.donations
        self.activity_logs_collection = self.db.admin_activity_logs

    async def get_dashboard_stats(self) -> AdminDashboardStats:
        """Get dashboard statistics for admin overview"""
        try:
            # Get total users
            total_users = await user_repository.get_total_users_count()
            
            # Get active players (users with recent activity)
            active_players = await user_repository.get_active_players_count()
            
            # Get matches tracked
            matches_tracked = await cs2_stats_repository.get_total_matches_count()
            
            # Get donation stats by tier
            donation_pipeline = [
                {"$match": {"status": "completed"}},
                {"$group": {"_id": "$tier", "count": {"$sum": 1}, "total_amount": {"$sum": "$amount"}}},
                {"$sort": {"_id": 1}}
            ]
            
            donation_stats = {}
            async for doc in self.donations_collection.aggregate(donation_pipeline):
                donation_stats[doc["_id"]] = {
                    "count": doc["count"],
                    "total_amount": doc["total_amount"]
                }
            
            # Get recent activity count (last 24 hours)
            yesterday = datetime.utcnow() - timedelta(days=1)
            recent_activity_count = await self.activity_logs_collection.count_documents({
                "created_at": {"$gte": yesterday}
            })
            
            return AdminDashboardStats(
                total_users=total_users,
                active_players=active_players,
                matches_tracked=matches_tracked,
                leaderboard_status="active",
                donation_stats=donation_stats,
                recent_activity_count=recent_activity_count
            )
            
        except Exception as e:
            logger.error(f"Error getting dashboard stats: {e}")
            # Return default stats on error
            return AdminDashboardStats(
                total_users=0,
                active_players=0,
                matches_tracked=0,
                leaderboard_status="error",
                donation_stats={},
                recent_activity_count=0
            )

    async def get_users_for_management(self, filters: UserManagementFilter) -> Dict[str, Any]:
        """Get users for admin management with filtering and pagination"""
        try:
            # Build query
            query = {}
            
            if filters.role:
                query["role"] = filters.role
            
            if filters.is_active is not None:
                query["is_active"] = filters.is_active
            
            if filters.search_query:
                query["$or"] = [
                    {"username": {"$regex": filters.search_query, "$options": "i"}},
                    {"email": {"$regex": filters.search_query, "$options": "i"}},
                    {"display_name": {"$regex": filters.search_query, "$options": "i"}}
                ]
            
            # Get total count
            total_count = await user_repository.users_collection.count_documents(query)
            
            # Get paginated results
            skip = (filters.page - 1) * filters.limit
            users_cursor = user_repository.users_collection.find(query).skip(skip).limit(filters.limit).sort("created_at", -1)
            
            users = []
            async for user_doc in users_cursor:
                # Get user's current tier
                tier_info = await self.get_user_tier_info(user_doc["id"])
                user_doc["current_tier"] = tier_info
                users.append(user_doc)
            
            return {
                "users": users,
                "total_count": total_count,
                "page": filters.page,
                "limit": filters.limit,
                "total_pages": (total_count + filters.limit - 1) // filters.limit
            }
            
        except Exception as e:
            logger.error(f"Error getting users for management: {e}")
            return {
                "users": [],
                "total_count": 0,
                "page": filters.page,
                "limit": filters.limit,
                "total_pages": 0
            }

    async def get_user_tier_info(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's current tier information"""
        try:
            # Find the most recent active donation
            donation = await self.donations_collection.find_one(
                {
                    "user_id": user_id,
                    "status": "completed",
                    "$or": [
                        {"expires_at": {"$gt": datetime.utcnow()}},
                        {"expires_at": None}  # Lifetime tiers
                    ]
                },
                sort=[("created_at", -1)]
            )
            
            if donation:
                return {
                    "tier": donation["tier"],
                    "expires_at": donation.get("expires_at"),
                    "purchased_at": donation["created_at"],
                    "amount_paid": donation["amount"]
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting user tier info: {e}")
            return None

    async def assign_user_tier(self, user_id: str, tier: DonationTier, admin_id: str, expires_at: Optional[datetime] = None, notes: Optional[str] = None) -> bool:
        """Manually assign a tier to a user (admin action)"""
        try:
            # Create a donation record for admin assignment
            donation_record = DonationRecord(
                user_id=user_id,
                tier=tier,
                amount=0.0,  # Admin assignment
                payment_method="admin_assignment",
                status="completed",
                expires_at=expires_at,
                notes=f"Admin assignment by {admin_id}. {notes or ''}"
            )
            
            result = await self.donations_collection.insert_one(donation_record.dict())
            
            # Log admin activity
            await self.log_admin_activity(
                admin_id,
                "assign_tier",
                "user",
                user_id,
                {"tier": tier, "expires_at": expires_at, "notes": notes}
            )
            
            return result.inserted_id is not None
            
        except Exception as e:
            logger.error(f"Error assigning user tier: {e}")
            return False

    async def record_donation(self, donation_data: DonationRecordCreate) -> Optional[DonationRecord]:
        """Record a donation/purchase"""
        try:
            donation_record = DonationRecord(**donation_data.dict())
            result = await self.donations_collection.insert_one(donation_record.dict())
            
            if result.inserted_id:
                return donation_record
            
            return None
            
        except Exception as e:
            logger.error(f"Error recording donation: {e}")
            return None

    async def get_tier_benefits(self) -> List[TierBenefits]:
        """Get all tier benefits and pricing"""
        return [
            TierBenefits(
                tier=DonationTier.BRONZE,
                name="Bronze Supporter",
                description="Support the community and get basic benefits",
                price=5.0,
                benefits=[
                    "Bronze badge next to your username",
                    "Access to supporter chat channels",
                    "Special bronze name color"
                ],
                cosmetics=["Bronze Badge", "Bronze Name Color"],
                color_scheme={"primary": "#CD7F32", "bg": "#8B4513"},
                duration_days=30,
                display_order=1
            ),
            TierBenefits(
                tier=DonationTier.SILVER,
                name="Silver Supporter",
                description="Enhanced support with additional perks",
                price=10.0,
                benefits=[
                    "Silver badge and name color",
                    "Priority matchmaking queue",
                    "Custom avatar frames",
                    "Access to exclusive statistics"
                ],
                cosmetics=["Silver Badge", "Silver Name Color", "Avatar Frame"],
                color_scheme={"primary": "#C0C0C0", "bg": "#708090"},
                duration_days=30,
                display_order=2
            ),
            TierBenefits(
                tier=DonationTier.GOLD,
                name="Gold Supporter",
                description="Premium support with exclusive features",
                price=25.0,
                benefits=[
                    "Gold badge and premium name styling",
                    "Custom game tags and titles",
                    "Priority customer support",
                    "Advanced match analytics",
                    "Access to beta features"
                ],
                cosmetics=["Gold Badge", "Premium Name Style", "Custom Tags", "Game Titles"],
                color_scheme={"primary": "#FFD700", "bg": "#B8860B"},
                duration_days=30,
                display_order=3
            ),
            TierBenefits(
                tier=DonationTier.PLATINUM,
                name="Platinum VIP",
                description="VIP treatment with premium benefits",
                price=50.0,
                benefits=[
                    "Platinum VIP badge and styling",
                    "Custom profile themes",
                    "Private match hosting",
                    "Detailed performance reports",
                    "Direct line to developers",
                    "Monthly exclusive content"
                ],
                cosmetics=["Platinum Badge", "Custom Profile Themes", "VIP Styling"],
                color_scheme={"primary": "#E5E4E2", "bg": "#696969"},
                duration_days=30,
                display_order=4
            ),
            TierBenefits(
                tier=DonationTier.DIAMOND,
                name="Diamond Elite",
                description="Elite status with maximum benefits",
                price=100.0,
                benefits=[
                    "Diamond elite badge and effects",
                    "Animated profile elements",
                    "Tournament hosting privileges",
                    "Custom weapon skins preview",
                    "Admin consultation sessions",
                    "Lifetime statistics backup"
                ],
                cosmetics=["Diamond Badge", "Animated Effects", "Elite Styling", "Custom Elements"],
                color_scheme={"primary": "#B9F2FF", "bg": "#4682B4"},
                duration_days=90,
                display_order=5,
                is_featured=True
            ),
            TierBenefits(
                tier=DonationTier.ELITE,
                name="Elite Lifetime",
                description="Lifetime supporter status - the ultimate tier",
                price=250.0,
                benefits=[
                    "Lifetime Elite status",
                    "All cosmetic unlocks",
                    "Personal developer contact",
                    "Feature request priority",
                    "Beta testing access",
                    "Community management tools",
                    "Custom server access",
                    "Exclusive events invitations"
                ],
                cosmetics=["Elite Badge", "All Cosmetics", "Lifetime Effects", "Custom Everything"],
                color_scheme={"primary": "#FF6B6B", "bg": "#8B0000"},
                duration_days=None,  # Lifetime
                display_order=6,
                is_featured=True
            )
        ]

    async def log_admin_activity(self, admin_id: str, action: str, target_type: str, target_id: str, details: Dict[str, Any], ip_address: Optional[str] = None, user_agent: Optional[str] = None):
        """Log admin activity for audit trail"""
        try:
            # Get admin username
            admin_user = await user_repository.get_user_by_id(admin_id)
            admin_username = admin_user.username if admin_user else "unknown"
            
            activity_log = AdminActivityLog(
                admin_user_id=admin_id,
                admin_username=admin_username,
                action=action,
                target_type=target_type,
                target_id=target_id,
                details=details,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            await self.activity_logs_collection.insert_one(activity_log.dict())
            
        except Exception as e:
            logger.error(f"Error logging admin activity: {e}")

    async def get_admin_activity_logs(self, limit: int = 100) -> List[AdminActivityLog]:
        """Get recent admin activity logs"""
        try:
            logs_cursor = self.activity_logs_collection.find().sort("created_at", -1).limit(limit)
            
            logs = []
            async for log_doc in logs_cursor:
                logs.append(AdminActivityLog(**log_doc))
            
            return logs
            
        except Exception as e:
            logger.error(f"Error getting admin activity logs: {e}")
            return []

    async def delete_user_account(self, user_id: str, admin_id: str) -> bool:
        """Delete a user account (admin action)"""
        try:
            # First disable the user
            success = await user_repository.update_user_status(user_id, False)
            
            if success:
                # Log the action
                await self.log_admin_activity(
                    admin_id,
                    "delete_user",
                    "user",
                    user_id,
                    {"action": "account_deletion"}
                )
                
                # Note: In a production system, you might want to anonymize
                # rather than fully delete to maintain data integrity
                # For now, we just disable the account
                
            return success
            
        except Exception as e:
            logger.error(f"Error deleting user account: {e}")
            return False

    async def get_recent_matches_all(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent matches across all users (admin view)"""
        try:
            return await cs2_stats_repository.get_all_recent_matches(limit)
        except Exception as e:
            logger.error(f"Error getting recent matches: {e}")
            return []

admin_repository = AdminRepository()