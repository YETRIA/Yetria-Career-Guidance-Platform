"""
Course CRUD operations for Yetria Career Guidance Platform
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..models import Course


def get_all_courses(db: Session) -> List[Course]:
    """
    Get all courses from the database
    """
    return db.query(Course).all()


def get_course_by_id(db: Session, course_id: int) -> Optional[Course]:
    """
    Get a specific course by ID
    """
    return db.query(Course).filter(Course.courseid == course_id).first()


def get_courses_by_keywords(db: Session, keywords: List[str]) -> List[Course]:
    """
    Get courses that match specific keywords in title or description
    This will be used to match courses with competencies
    """
    if not keywords:
        return []
    
    query = db.query(Course)
    
    # Build search conditions for each keyword
    conditions = []
    for keyword in keywords:
        keyword_lower = keyword.lower()
        conditions.append(
            Course.title.ilike(f"%{keyword_lower}%") |
            Course.description.ilike(f"%{keyword_lower}%")
        )
    
    # Combine all conditions with OR
    if conditions:
        query = query.filter(or_(*conditions))
    
    return query.all()


def get_courses_by_competency_keywords(db: Session, competency_keywords: List[str], limit: int = 7) -> List[Course]:
    """
    Get courses that match competency keywords
    This is the main function for course recommendations based on development areas
    """
    if not competency_keywords:
        return []
    
    # Define competency to course mapping
    competency_course_mapping = {
        # Sayısal Zeka
        "numerical": ["matematik", "mathematical", "sayısal", "hesaplama"],
        "analytical": ["analitik", "analytical", "eleştirel", "critical", "düşünme", "thinking"],
        "stress_management": ["stres", "stress", "duygu", "emotion", "yönetim", "management"],
        "empathy": ["empati", "empathy", "anlayış", "understanding"],
        "teamwork": ["takım", "team", "ekip", "işbirliği", "collaboration"],
        "decision_making": ["problem", "karar", "decision", "çözme", "solving"],
        "resilience": ["dayanıklılık", "resilience", "direnç", "resistance"]
    }
    
    # Get all courses first
    all_courses = get_all_courses(db)
    
    # Score courses based on keyword matches
    course_scores = {}
    
    for course in all_courses:
        score = 0
        course_text = f"{course.title} {course.description or ''}".lower()
        
        for competency in competency_keywords:
            if competency in competency_course_mapping:
                keywords = competency_course_mapping[competency]
                for keyword in keywords:
                    if keyword.lower() in course_text:
                        score += 1
        
        if score > 0:
            course_scores[course.courseid] = {
                'course': course,
                'score': score
            }
    
    # Sort by score and return top courses
    sorted_courses = sorted(
        course_scores.values(), 
        key=lambda x: x['score'], 
        reverse=True
    )
    
    return [item['course'] for item in sorted_courses[:limit]]