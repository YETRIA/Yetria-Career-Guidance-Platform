"""
User management endpoints for Yetria Career Guidance Platform
User profile and management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ...core.database import get_db
from ...crud.user_crud import (
    get_user_by_id, 
    update_user, 
    delete_user, 
    get_active_users,
    verify_user_email
)
from ...api.schemas import User as UserSchema, UserUpdate
from ...api.dependencies import get_current_user, get_current_active_user
from ...models import User as UserModel

router = APIRouter()


@router.get("/me", response_model=UserSchema)
def get_current_user_profile(
    current_user: UserModel = Depends(get_current_user)
):
    """
    Get current user profile information
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: Current user profile
    """
    return current_user


@router.put("/me", response_model=UserSchema)
def update_current_user_profile(
    user_update: UserUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user profile
    
    Args:
        user_update: User update data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        User: Updated user profile
        
    Raises:
        HTTPException: If update fails
    """
    updated_user = update_user(db, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return updated_user


@router.delete("/me")
def delete_current_user(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete current user account (soft delete)
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        dict: Deletion confirmation message
    """
    success = delete_user(db, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User account deleted successfully"}


@router.get("/{user_id}", response_model=UserSchema)
def get_user_by_id_endpoint(
    user_id: int,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get user by ID (admin function)
    
    Args:
        user_id: User ID to retrieve
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        User: User information
        
    Raises:
        HTTPException: If user not found
    """
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.get("/", response_model=List[UserSchema])
def get_users_list(
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get list of users (admin function)
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List[User]: List of users
    """
    users = get_active_users(db, skip=skip, limit=limit)
    return users


@router.post("/verify-email/{user_id}")
def verify_user_email_endpoint(
    user_id: int,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Verify user email (admin function)
    
    Args:
        user_id: User ID to verify
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        User: Verified user information
        
    Raises:
        HTTPException: If user not found
    """
    verified_user = verify_user_email(db, user_id)
    if not verified_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return verified_user
