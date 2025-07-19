from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from services.auth import auth_service
from repositories.user import user_repository
from models.user import User
import logging

logger = logging.getLogger(__name__)

# HTTP Bearer token security scheme
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get the current authenticated user from JWT token"""
    try:
        # Verify the access token
        payload = auth_service.verify_access_token(credentials.credentials)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user from database
        user = await user_repository.get_user_by_id(payload['user_id'])
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is deactivated",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_current_user: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[User]:
    """Get the current authenticated user (optional - for endpoints that work with or without auth)"""
    if not credentials:
        return None
    
    try:
        payload = auth_service.verify_access_token(credentials.credentials)
        if not payload:
            return None
        
        user = await user_repository.get_user_by_id(payload['user_id'])
        if not user or not user.is_active:
            return None
        
        return user
        
    except Exception as e:
        logger.error(f"Error in get_current_user_optional: {e}")
        return None

def require_role(*allowed_roles: str):
    """Decorator to require specific roles"""
    def decorator(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return decorator

# Common role dependencies
require_admin = require_role("admin")
require_moderator = require_role("admin", "moderator")
require_member = require_role("admin", "moderator", "member")