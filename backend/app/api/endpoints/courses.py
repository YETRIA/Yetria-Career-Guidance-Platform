"""
Course API endpoints for Yetria Career Guidance Platform
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...crud.course_crud import (
    get_all_courses,
    get_course_by_id,
    get_courses_by_competency_keywords,
    get_courses_by_keywords
)
from ...api.schemas import CourseSchema, CourseRecommendationRequest

router = APIRouter()


@router.get("/courses", response_model=List[CourseSchema])
def get_all_courses_endpoint(db: Session = Depends(get_db)):
    """
    Get all available courses
    """
    courses = get_all_courses(db)
    return courses


@router.get("/courses/{course_id}", response_model=CourseSchema)
def get_course_by_id_endpoint(course_id: int, db: Session = Depends(get_db)):
    """
    Get a specific course by ID
    """
    course = get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.post("/courses/recommendations", response_model=List[CourseSchema])
def get_course_recommendations(
    request: CourseRecommendationRequest,
    db: Session = Depends(get_db)
):
    """
    Get course recommendations based on competency keywords
    This endpoint is used to get courses that match specific competencies/development areas
    """
    if not request.competency_keywords:
        return []
    
    # Use limit from request or default to 7
    limit = request.limit if request.limit else 7
    
    courses = get_courses_by_competency_keywords(
        db, 
        request.competency_keywords, 
        limit
    )
    
    return courses


@router.get("/courses/by-keywords", response_model=List[CourseSchema])
def get_courses_by_keywords_endpoint(
    keywords: str,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """
    Get courses that match specific keywords
    Keywords should be comma-separated
    """
    keyword_list = [kw.strip() for kw in keywords.split(",") if kw.strip()]
    if not keyword_list:
        return []
    
    courses = get_courses_by_keywords(db, keyword_list)
    return courses[:limit]