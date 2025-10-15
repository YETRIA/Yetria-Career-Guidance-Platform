"""
FastAPI Dependencies for Yetria Career Guidance Platform
JWT token validation and user authentication dependencies
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from ..core.database import get_db
from ..core.security import verify_token
from ..crud.user_crud import get_user_by_email
from ..models import User as UserModel

# HTTP Bearer token scheme
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserModel:
    """
    Get current authenticated user from JWT token
    
    Args:
        credentials: HTTP Bearer token credentials
        db: Database session
        
    Returns:
        User: Authenticated user object
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Clean token - remove Bearer prefix if present
    token = credentials.credentials
    if token.startswith("Bearer "):
        token = token[7:]  # Remove "Bearer " prefix
    
    # Verify the JWT token
    email = verify_token(token)
    
    if email is None:
        raise credentials_exception
    
    # Get user from database
    user = get_user_by_email(db, email=email)
    
    if user is None:
        raise credentials_exception
    
    return user


def get_current_active_user(
    current_user: UserModel = Depends(get_current_user)
) -> UserModel:
    """
    Get current active user (all users are considered active)
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: Active user object
    """
    # Note: is_active field doesn't exist in current table
    # All users are considered active
    return current_user


def get_current_verified_user(
    current_user: UserModel = Depends(get_current_active_user)
) -> UserModel:
    """
    Get current verified user (all users are considered verified)
    
    Args:
        current_user: Current active user
        
    Returns:
        User: Verified user object
    """
    # Note: is_verified field doesn't exist in current table
    # All users are considered verified
    return current_user


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[UserModel]:
    """
    Get current user if token is provided (optional authentication)
    
    Args:
        credentials: Optional HTTP Bearer token credentials
        db: Database session
        
    Returns:
        Optional[User]: User object if authenticated, None otherwise
    """
    if not credentials:
        return None
    
    try:
        email = verify_token(credentials.credentials)
        if email is None:
            return None
        
        user = get_user_by_email(db, email=email)
        return user  # All users are considered active
    except:
        return None