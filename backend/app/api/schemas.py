"""
Pydantic schemas for Yetria Career Guidance Platform API
"""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List, Dict, Any


class UserBase(BaseModel):
    """Base user schema with common fields"""
    email: EmailStr


class UserCreate(UserBase):
    """Schema for user creation"""
    password: str
    name: str  # Required field
    age: Optional[int] = None
    usertypeid: int  # Required field
    educationlevelid: Optional[int] = None


class UserUpdate(BaseModel):
    """Schema for user updates"""
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class User(UserBase):
    """Schema for user response"""
    userid: int
    name: Optional[str] = None
    age: Optional[int] = None
    usertypeid: Optional[int] = None
    educationlevelid: Optional[int] = None
    createdat: Optional[datetime] = None
    # Note: is_active and is_verified fields don't exist in current table
    # All users are considered active and verified

    class Config:
        from_attributes = True


class UserInDB(User):
    """Schema for user in database (includes hashed password)"""
    passwordhash: str


class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Schema for token data"""
    email: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


# Scenario and Response Schemas
class ScenarioOption(BaseModel):
    letter: str
    text: str
    
    class Config:
        from_attributes = True


class Scenario(BaseModel):
    id: int
    text: str
    competency_name: str
    options: List[ScenarioOption] = []
    
    class Config:
        from_attributes = True


class ResponseIn(BaseModel):
    scenario_id: int
    option_letter: str


class PredictionResultSchema(BaseModel):
    uyum_skorlari: List[Dict[str, Any]]
    kazanan_meslek: str
    yetkinlik_karsilastirmasi: List[Dict[str, Any]]


# --- Mentorship Schemas ---
class MentorProfileSchema(BaseModel):
    mentorprofileid: int
    userid: int
    occupationid: int
    statusid: Optional[int] = None  # mentorprofile table has no statusid column
    username: Optional[str] = None
    company: Optional[str] = None
    title: Optional[str] = None
    photourl: Optional[str] = None
    bio: Optional[str] = None
    supporttopics: Optional[str] = None
    quote: Optional[str] = None

    class Config:
        from_attributes = True


class MentorRecommendationRequest(BaseModel):
    occupation_title: str


class MentorshipRequestCreate(BaseModel):
    mentorprofileid: int


class MentorshipRequestSchema(BaseModel):
    mentorshiprequestid: int
    mentorprofileid: int
    statusid: int
    createdat: Optional[datetime]

    class Config:
        from_attributes = True


class MentorshipRequestDetailSchema(BaseModel):
    """Detailed mentorship request schema with mentor info and status name"""
    mentorshiprequestid: int
    userid: int
    mentorprofileid: int
    statusid: int
    createdat: Optional[datetime]
    # Mentor bilgileri
    mentor_name: Optional[str] = None
    mentor_company: Optional[str] = None
    mentor_title: Optional[str] = None
    mentor_photourl: Optional[str] = None
    # Status bilgisi
    status_name: Optional[str] = None
    
    class Config:
        from_attributes = True


# --- Course Schemas ---
class CourseSchema(BaseModel):
    courseid: int
    title: str
    provider: Optional[str] = None
    durationtext: Optional[str] = None
    description: Optional[str] = None
    imageurl: Optional[str] = None
    courseurl: str

    class Config:
        from_attributes = True


class CourseRecommendationRequest(BaseModel):
    competency_keywords: List[str]
    limit: Optional[int] = 7