from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional, List
from models.admin import (
    AdminDashboardStats, UserManagementFilter, UserRoleUpdate, 
    UserTierUpdate, UserStatusUpdate, DonationRecord, DonationRecordCreate,
    TierBenefits, ManualStatsUpdate, ManualMatchCreate, AdminActivityLogCreate
)
from repositories.admin import admin_repository
from repositories.user import user_repository
from repositories.cs2_stats import cs2_stats_repository
from middleware.auth import get_current_user
from models.user import User, UserRole
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin Panel"])

async def require_admin_role(current_user: User = Depends(get_current_user)):
    """Dependency to ensure user has admin role"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.get("/dashboard", response_model=AdminDashboardStats)
async def get_admin_dashboard(admin_user: User = Depends(require_admin_role)):
    """Get admin dashboard statistics"""
    try:
        stats = await admin_repository.get_dashboard_stats()
        return stats
    except Exception as e:
        logger.error(f"Error getting admin dashboard: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch dashboard statistics"
        )

@router.get("/users")
async def get_users_for_management(
    role: Optional[str] = Query(None, description="Filter by role"),
    tier: Optional[str] = Query(None, description="Filter by donation tier"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search users by name/email"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    admin_user: User = Depends(require_admin_role)
):
    """Get users for admin management with filtering and pagination"""
    try:
        filters = UserManagementFilter(
            role=role,
            tier=tier,
            is_active=is_active,
            search_query=search,
            page=page,
            limit=limit
        )
        
        result = await admin_repository.get_users_for_management(filters)
        return result
    except Exception as e:
        logger.error(f"Error getting users for management: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch users"
        )

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role_update: UserRoleUpdate,
    admin_user: User = Depends(require_admin_role)
):
    """Update a user's role"""
    try:
        # Verify user exists
        target_user = await user_repository.get_user_by_id(user_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update role
        success = await user_repository.update_user_role(user_id, role_update.role)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user role"
            )
        
        # Log admin activity
        await admin_repository.log_admin_activity(
            admin_user.id,
            "update_role",
            "user",
            user_id,
            {"old_role": target_user.role.value, "new_role": role_update.role}
        )
        
        return {"success": True, "message": "User role updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user role: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user role"
        )

@router.put("/users/{user_id}/tier")
async def assign_user_tier(
    user_id: str,
    tier_update: UserTierUpdate,
    admin_user: User = Depends(require_admin_role)
):
    """Assign a donation tier to a user (admin manual assignment)"""
    try:
        # Verify user exists
        target_user = await user_repository.get_user_by_id(user_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Assign tier
        success = await admin_repository.assign_user_tier(
            user_id, 
            tier_update.tier, 
            admin_user.id,
            tier_update.expires_at,
            tier_update.notes
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to assign user tier"
            )
        
        return {"success": True, "message": "User tier assigned successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning user tier: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to assign user tier"
        )

@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    status_update: UserStatusUpdate,
    admin_user: User = Depends(require_admin_role)
):
    """Update a user's active status (enable/disable account)"""
    try:
        # Verify user exists
        target_user = await user_repository.get_user_by_id(user_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update status
        success = await user_repository.update_user_status(user_id, status_update.is_active)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user status"
            )
        
        # Log admin activity
        await admin_repository.log_admin_activity(
            admin_user.id,
            "update_status",
            "user",
            user_id,
            {
                "old_status": target_user.is_active,
                "new_status": status_update.is_active,
                "reason": status_update.reason
            }
        )
        
        status_text = "enabled" if status_update.is_active else "disabled"
        return {"success": True, "message": f"User account {status_text} successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user status"
        )

@router.delete("/users/{user_id}")
async def delete_user_account(
    user_id: str,
    admin_user: User = Depends(require_admin_role)
):
    """Delete a user account"""
    try:
        # Verify user exists
        target_user = await user_repository.get_user_by_id(user_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent admin from deleting themselves
        if target_user.id == admin_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own admin account"
            )
        
        # Delete user account (actually just disables it)
        success = await admin_repository.delete_user_account(user_id, admin_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete user account"
            )
        
        return {"success": True, "message": "User account deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user account: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user account"
        )

@router.get("/matches/recent")
async def get_recent_matches_all(
    limit: int = Query(50, ge=1, le=100, description="Number of recent matches"),
    admin_user: User = Depends(require_admin_role)
):
    """Get recent matches across all users (admin view)"""
    try:
        matches = await admin_repository.get_recent_matches_all(limit)
        return {
            "matches": matches,
            "total_count": len(matches)
        }
    except Exception as e:
        logger.error(f"Error getting recent matches: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch recent matches"
        )

@router.post("/matches/manual")
async def create_manual_match(
    match_data: ManualMatchCreate,
    admin_user: User = Depends(require_admin_role)
):
    """Manually create a match entry for testing/debugging"""
    try:
        # Verify user exists
        target_user = await user_repository.get_user_by_id(match_data.user_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Create match
        from models.cs2_stats import CS2MatchCreate
        match_create = CS2MatchCreate(
            map=match_data.map_name,
            result=match_data.result,
            kills=match_data.kills,
            deaths=match_data.deaths,
            assists=match_data.assists,
            headshots=match_data.headshots,
            damage=match_data.damage,
            is_mvp=match_data.is_mvp
        )
        
        match = await cs2_stats_repository.add_match(match_data.user_id, match_create)
        if not match:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create manual match"
            )
        
        # Log admin activity
        await admin_repository.log_admin_activity(
            admin_user.id,
            "create_manual_match",
            "match",
            match.id,
            {"target_user": match_data.user_id, "notes": match_data.notes}
        )
        
        return {"success": True, "match": match, "message": "Manual match created successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating manual match: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create manual match"
        )

@router.get("/tiers/benefits")
async def get_tier_benefits(admin_user: User = Depends(require_admin_role)):
    """Get all tier benefits and pricing information"""
    try:
        benefits = await admin_repository.get_tier_benefits()
        return {"benefits": [benefit.dict() for benefit in benefits]}
    except Exception as e:
        logger.error(f"Error getting tier benefits: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch tier benefits"
        )

@router.get("/activity-logs")
async def get_admin_activity_logs(
    limit: int = Query(100, ge=1, le=500, description="Number of logs to fetch"),
    admin_user: User = Depends(require_admin_role)
):
    """Get admin activity logs for audit trail"""
    try:
        logs = await admin_repository.get_admin_activity_logs(limit)
        return {
            "logs": [log.dict() for log in logs],
            "total_count": len(logs)
        }
    except Exception as e:
        logger.error(f"Error getting admin activity logs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch activity logs"
        )