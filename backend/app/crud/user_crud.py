"""
User CRUD operations for Yetria Career Guidance Platform
"""

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional
from fastapi import HTTPException, status

from ..models import User
from ..api.schemas import UserCreate, UserUpdate
from ..core.security import get_password_hash, verify_password


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """
    Get user by ID
    
    Args:
        db: Database session
        user_id: User ID
        
    Returns:
        Optional[User]: User object if found, None otherwise
    """
    return db.query(User).filter(User.userid == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Get user by email address
    
    Args:
        db: Database session
        email: User email address
        
    Returns:
        Optional[User]: User object if found, None otherwise
    """
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_create: UserCreate) -> User:
    """
    Create a new user
    
    Args:
        db: Database session
        user_create: User creation schema
        
    Returns:
        User: Created user object
        
    Raises:
        HTTPException: If email already exists
    """
    # Check if user already exists
    existing_user = get_user_by_email(db, email=user_create.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash the password
    hashed_password = get_password_hash(user_create.password)
    
    # Create user object
    db_user = User(
        name=user_create.name,
        email=user_create.email,
        passwordhash=hashed_password,
        age=user_create.age,
        usertypeid=user_create.usertypeid,
        educationlevelid=user_create.educationlevelid
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )


def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
    """
    Update user information
    
    Args:
        db: Database session
        user_id: User ID to update
        user_update: User update schema
        
    Returns:
        Optional[User]: Updated user object if found, None otherwise
    """
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    # Update fields if provided
    update_data = user_update.dict(exclude_unset=True)
    
    if "email" in update_data:
        # Check if new email already exists
        existing_user = get_user_by_email(db, email=update_data["email"])
        if existing_user and existing_user.userid != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        db_user.email = update_data["email"]
    
    if "password" in update_data:
        db_user.passwordhash = get_password_hash(update_data["password"])
    
    try:
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )


def delete_user(db: Session, user_id: int) -> bool:
    """
    Delete user from database
    
    Note: This performs a hard delete as is_active field doesn't exist in current table
    
    Args:
        db: Database session
        user_id: User ID to delete
        
    Returns:
        bool: True if user was found and deleted, False otherwise
    """
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return False
    
    # Hard delete - is_active field doesn't exist in current table
    db.delete(db_user)
    db.commit()
    return True


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate user with email and password
    
    Args:
        db: Database session
        email: User email
        password: User password
        
    Returns:
        Optional[User]: User object if authentication successful, None otherwise
    """
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.passwordhash):
        return None
    # Note: is_active field doesn't exist in current table
    # All users are considered active
    return user


def get_active_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    """
    Get list of users (all users are considered active)
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        list[User]: List of users
    """
    return db.query(User).offset(skip).limit(limit).all()


def verify_user_email(db: Session, user_id: int) -> Optional[User]:
    """
    Mark user email as verified (placeholder - is_verified field doesn't exist)
    
    Args:
        db: Database session
        user_id: User ID to verify
        
    Returns:
        Optional[User]: User object if found, None otherwise
    """
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    # Note: is_verified field doesn't exist in current table
    # Just return the user as verified
    return db_user