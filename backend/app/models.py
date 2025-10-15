"""
ORM Models for Yetria Career Guidance Platform
Maps to existing database tables
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, ForeignKey, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()


class User(Base):
    """
    User model mapping to existing User table
    """
    __tablename__ = "User"  # Existing table name

    userid = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    passwordhash = Column(String(255), nullable=False)
    age = Column(Integer, nullable=True)
    usertypeid = Column(Integer, nullable=False)  # NOT NULL according to schema
    educationlevelid = Column(Integer, nullable=True)
    createdat = Column(DateTime, nullable=True)

    # Note: is_active and is_verified columns don't exist in the current table
    # We'll handle authentication logic without these fields
    
    # Relationships
    responses = relationship("UserResponse", back_populates="user")

    def __repr__(self):
        return f"<User(userid={self.userid}, email='{self.email}')>"


class Scenario(Base):
    """
    Scenario model mapping to existing scenario table
    """
    __tablename__ = "scenario"
    
    scenarioid = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    competencyid = Column(Integer, ForeignKey("competency.competencyid"), nullable=False)
    
    # Relationships
    competency = relationship("Competency", back_populates="scenarios")
    options = relationship("ScenarioOption", back_populates="scenario")


class ScenarioOption(Base):
    """
    ScenarioOption model mapping to existing scenariooption table
    """
    __tablename__ = "scenariooption"
    
    scenariooptionid = Column(Integer, primary_key=True, index=True)
    scenarioid = Column(Integer, ForeignKey("scenario.scenarioid"), nullable=False)
    optiontext = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    
    # Relationships
    scenario = relationship("Scenario", back_populates="options")


class Competency(Base):
    """
    Competency model mapping to existing competency table
    """
    __tablename__ = "competency"
    
    competencyid = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    
    # Relationships
    scenarios = relationship("Scenario", back_populates="competency")


class UserResponse(Base):
    """
    UserResponse model for storing user answers to scenarios
    Maps to existing scenarioresponse table
    """
    __tablename__ = 'scenarioresponse'
    
    scenarioresponseid = Column(Integer, primary_key=True, index=True)
    userid = Column(Integer, ForeignKey('User.userid'), nullable=False)
    scenariooptionid = Column(Integer, ForeignKey('scenariooption.scenariooptionid'), nullable=False)
    responsetime = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="responses")
    scenario_option = relationship("ScenarioOption")
    
    __table_args__ = (UniqueConstraint('userid', 'scenariooptionid', name='_user_scenariooption_uc'),)


# --- Mentorship & Occupation related tables ---

class Occupation(Base):
    """Maps to occupation table"""
    __tablename__ = "occupation"

    occupationid = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)


class MatchStatus(Base):
    """Maps to matchstatus table (1: Request Sent, 2: Accepted, 3: Rejected)"""
    __tablename__ = "matchstatus"

    matchstatusid = Column(Integer, primary_key=True, index=True)
    statusname = Column(String(50), nullable=False)


class MentorProfile(Base):
    """Maps to mentorprofile table - NO statusid column here!"""
    __tablename__ = "mentorprofile"

    mentorprofileid = Column(Integer, primary_key=True, index=True)
    userid = Column(Integer, nullable=False)
    occupationid = Column(Integer, ForeignKey("occupation.occupationid"), nullable=False)
    company = Column(String(255), nullable=True)
    title = Column(String(255), nullable=True)
    photourl = Column(String(255), nullable=True)
    bio = Column(String, nullable=True)
    supporttopics = Column(String, nullable=True)
    quote = Column(String, nullable=True)

    occupation = relationship("Occupation")


class OccupationProfile(Base):
    """Maps to occupationprofile table (ideal competency scores per occupation)"""
    __tablename__ = "occupationprofile"

    occupationprofileid = Column(Integer, primary_key=True, index=True)
    occupationid = Column(Integer, ForeignKey("occupation.occupationid"), nullable=False)
    competencyid = Column(Integer, ForeignKey("competency.competencyid"), nullable=False)
    idealscore = Column(Float, nullable=True)


class MentorMatch(Base):
    """Maps to mentormatch table for student-mentor matching/requests"""
    __tablename__ = "mentormatch"

    mentormatchid = Column(Integer, primary_key=True, index=True)
    studentuserid = Column(Integer, ForeignKey('User.userid'), nullable=False)
    mentorprofileid = Column(Integer, ForeignKey('mentorprofile.mentorprofileid'), nullable=False)
    matchscore = Column(Float, nullable=False, default=0.0)  # Changed to nullable=False with default
    matchstatusid = Column(Integer, ForeignKey('matchstatus.matchstatusid'), nullable=False)
    requestdate = Column(DateTime(timezone=True), nullable=True)
    responsedate = Column(DateTime(timezone=True), nullable=True)

    status = relationship("MatchStatus")
    mentor = relationship("MentorProfile")


class Course(Base):
    """
    Course model mapping to existing course table
    """
    __tablename__ = "course"
    
    courseid = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    provider = Column(String(255), nullable=True)
    durationtext = Column(String(100), nullable=True)
    description = Column(String, nullable=True)
    imageurl = Column(String(512), nullable=True)
    courseurl = Column(String(512), nullable=False)
    
    def __repr__(self):
        return f"<Course(courseid={self.courseid}, title='{self.title}')>"


class UserAssessmentResult(Base):
    """
    UserAssessmentResult model for storing user's complete assessment results
    Maps to existing user_assessment_results table
    """
    __tablename__ = 'user_assessment_results'
    
    id = Column(Integer, primary_key=True, index=True)
    userid = Column(Integer, ForeignKey('User.userid'), nullable=False)
    
    # Occupation Matching
    recommended_occupation = Column(String(255), nullable=True)
    occupation_compatibility_score = Column(Float, nullable=True)
    
    # Competency Scores (in JSON format)
    competency_scores = Column(String, nullable=False)  # Store as JSON string
    
    # Strong and Weak Competencies
    strong_competencies = Column(String, nullable=True)  # JSON string array
    weak_competencies = Column(String, nullable=True)    # JSON string array
    
    # Recommended Mentors and Courses (in JSON format)
    recommended_mentors = Column(String, nullable=True)  # JSON string
    recommended_courses = Column(String, nullable=True)  # JSON string
    
    # Compatibility Scores (for all occupations)
    occupation_compatibility_scores = Column(String, nullable=True)  # JSON string
    
    # Metadata
    assessment_completed_at = Column(DateTime(timezone=True), server_default=func.now())
    total_responses = Column(Integer, nullable=True)
    is_final_result = Column(Boolean, default=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    
    __table_args__ = (UniqueConstraint('userid', name='unique_user_assessment_result'),)