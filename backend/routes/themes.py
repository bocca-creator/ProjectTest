from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models.user import CustomThemeCreate, CustomThemeResponse
from repositories.user import theme_repository
from middleware.auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/themes", tags=["Custom Themes"])

@router.post("/", response_model=CustomThemeResponse)
async def create_custom_theme(
    theme_data: CustomThemeCreate,
    current_user = Depends(get_current_user)
):
    """Create a new custom theme"""
    try:
        theme = await theme_repository.create_theme(current_user.id, theme_data)
        if not theme:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create theme"
            )
        
        return CustomThemeResponse(
            id=theme.id,
            user_id=theme.user_id,
            name=theme.name,
            description=theme.description,
            category=theme.category,
            variables=theme.variables,
            is_public=theme.is_public,
            created_at=theme.created_at,
            updated_at=theme.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Theme creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create theme"
        )

@router.get("/my-themes", response_model=List[CustomThemeResponse])
async def get_my_themes(current_user = Depends(get_current_user)):
    """Get all themes created by current user"""
    try:
        themes = await theme_repository.get_user_themes(current_user.id)
        return [
            CustomThemeResponse(
                id=theme.id,
                user_id=theme.user_id,
                name=theme.name,
                description=theme.description,
                category=theme.category,
                variables=theme.variables,
                is_public=theme.is_public,
                created_at=theme.created_at,
                updated_at=theme.updated_at
            )
            for theme in themes
        ]
    except Exception as e:
        logger.error(f"Error getting user themes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get themes"
        )

@router.get("/public", response_model=List[CustomThemeResponse])
async def get_public_themes():
    """Get all public themes"""
    try:
        themes = await theme_repository.get_public_themes()
        return [
            CustomThemeResponse(
                id=theme.id,
                user_id=theme.user_id,
                name=theme.name,
                description=theme.description,
                category=theme.category,
                variables=theme.variables,
                is_public=theme.is_public,
                created_at=theme.created_at,
                updated_at=theme.updated_at
            )
            for theme in themes
        ]
    except Exception as e:
        logger.error(f"Error getting public themes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get public themes"
        )