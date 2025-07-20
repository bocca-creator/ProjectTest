from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models.admin import TierBenefits, DonationRecord, DonationRecordCreate
from repositories.admin import admin_repository
from middleware.auth import get_current_user_optional
from models.user import User
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tiers", tags=["Donation Tiers"])

@router.get("/benefits", response_model=List[TierBenefits])
async def get_all_tier_benefits():
    """Get all donation tier benefits and pricing (public access)"""
    try:
        benefits = await admin_repository.get_tier_benefits()
        return benefits
    except Exception as e:
        logger.error(f"Error getting tier benefits: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch tier benefits"
        )

@router.post("/purchase/{tier}")
async def initiate_tier_purchase(
    tier: str,
    current_user: User = Depends(get_current_user_optional)
):
    """Initiate a tier purchase (placeholder for payment integration)"""
    try:
        # For now, this is a placeholder endpoint
        # In a real implementation, this would integrate with payment processors
        # like Stripe, PayPal, etc.
        
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required to purchase tiers"
            )
        
        # Get tier benefits to validate
        benefits = await admin_repository.get_tier_benefits()
        tier_info = None
        for benefit in benefits:
            if benefit.tier.value == tier.lower():
                tier_info = benefit
                break
        
        if not tier_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid tier specified"
            )
        
        # Return purchase information for frontend to handle payment
        return {
            "tier": tier_info.tier.value,
            "name": tier_info.name,
            "price": tier_info.price,
            "currency": tier_info.currency,
            "benefits": tier_info.benefits,
            "message": "Payment integration required - contact admin for tier assignment",
            "payment_methods": [
                "stripe", "paypal", "crypto", "bank_transfer"
            ],
            "note": "This is a placeholder. Implement payment integration for production."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error initiating tier purchase: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate tier purchase"
        )

@router.get("/my-tier")
async def get_my_current_tier(current_user: User = Depends(get_current_user_optional)):
    """Get current user's tier information"""
    try:
        if not current_user:
            return {"tier": None, "message": "Authentication required"}
        
        tier_info = await admin_repository.get_user_tier_info(current_user.id)
        
        if not tier_info:
            return {
                "tier": None,
                "message": "No active tier subscription"
            }
        
        return {
            "tier": tier_info["tier"],
            "expires_at": tier_info.get("expires_at"),
            "purchased_at": tier_info.get("purchased_at"),
            "amount_paid": tier_info.get("amount_paid"),
            "is_lifetime": tier_info.get("expires_at") is None
        }
        
    except Exception as e:
        logger.error(f"Error getting user tier: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch tier information"
        )