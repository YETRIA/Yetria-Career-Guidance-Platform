"""
CRUD operations for UserAssessmentResult
Handles saving and retrieving user assessment results
"""

import json
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session

from .. import models


def save_user_assessment_result(
    db: Session, 
    user_id: int, 
    prediction_result: Dict[str, Any]
) -> models.UserAssessmentResult:
    """
    Save user's complete assessment result to database
    
    Args:
        db: Database session
        user_id: User ID
        prediction_result: Complete prediction result from ML model
        
    Returns:
        UserAssessmentResult: Saved assessment result
    """
    try:
        # Check if user already has a result
        existing_result = db.query(models.UserAssessmentResult).filter(
            models.UserAssessmentResult.userid == user_id
        ).first()
        
        # Prepare data for saving
        result_data = {
            'userid': user_id,
            'recommended_occupation': prediction_result.get('kazanan_meslek'),
            'occupation_compatibility_score': None,  # Will be extracted from uyum_skorlari
            'competency_scores': json.dumps({
                comp['yetkinlik']: comp.get('kullanici_skoru', comp.get('grup_ortalamasi', 0))
                for comp in prediction_result.get('yetkinlik_karsilastirmasi', [])
            }),
            'strong_competencies': json.dumps([
                comp['yetkinlik'] for comp in prediction_result.get('yetkinlik_karsilastirmasi', [])
                if comp.get('kullanici_skoru', comp.get('grup_ortalamasi', 0)) >= 4.0  # 4.0 ve üzeri güçlü
            ]),
            'weak_competencies': json.dumps([
                comp['yetkinlik'] for comp in prediction_result.get('yetkinlik_karsilastirmasi', [])
                if comp.get('kullanici_skoru', comp.get('grup_ortalamasi', 0)) < 3.0  # 3.0'ın altı zayıf
            ]),
            'recommended_mentors': json.dumps([]),  # Will be populated later
            'recommended_courses': json.dumps([]),  # Will be populated later
            'occupation_compatibility_scores': json.dumps(prediction_result.get('uyum_skorlari', [])),
            'total_responses': 16,  # 4 stages * 4 scenarios each
            'is_final_result': True
        }
        
        # Extract compatibility score for recommended occupation
        winning_occupation = prediction_result.get('kazanan_meslek')
        compatibility_scores = prediction_result.get('uyum_skorlari', [])
        for score_data in compatibility_scores:
            if score_data.get('meslek') == winning_occupation:
                result_data['occupation_compatibility_score'] = score_data.get('uyum')
                break
        
        if existing_result:
            # Update existing result
            for key, value in result_data.items():
                if key != 'userid':  # Don't update userid
                    setattr(existing_result, key, value)
            db.commit()
            db.refresh(existing_result)
            return existing_result
        else:
            # Create new result
            db_result = models.UserAssessmentResult(**result_data)
            db.add(db_result)
            db.commit()
            db.refresh(db_result)
            return db_result
            
    except Exception as e:
        db.rollback()
        print(f"Error saving user assessment result: {str(e)}")
        raise e


def get_user_assessment_result(db: Session, user_id: int) -> Optional[models.UserAssessmentResult]:
    """
    Get user's assessment result from database
    
    Args:
        db: Database session
        user_id: User ID
        
    Returns:
        UserAssessmentResult or None if not found
    """
    try:
        return db.query(models.UserAssessmentResult).filter(
            models.UserAssessmentResult.userid == user_id
        ).first()
    except Exception as e:
        print(f"Error retrieving user assessment result: {str(e)}")
        raise e


def get_user_assessment_result_as_dict(db: Session, user_id: int) -> Optional[Dict[str, Any]]:
    """
    Get user's assessment result as dictionary with parsed JSON fields
    
    Args:
        db: Database session
        user_id: User ID
        
    Returns:
        Dictionary with parsed assessment result or None if not found
    """
    try:
        result = get_user_assessment_result(db, user_id)
        if not result:
            return None
            
        # Safe JSON parsing function
        def safe_json_parse(data, default=None):
            if not data:
                return default or []
            if isinstance(data, str):
                try:
                    return json.loads(data)
                except json.JSONDecodeError:
                    return default or []
            return data  # Already parsed
            
        # Parse JSON fields safely
        return {
            'id': result.id,
            'userid': result.userid,
            'recommended_occupation': result.recommended_occupation,
            'occupation_compatibility_score': result.occupation_compatibility_score,
            'competency_scores': safe_json_parse(result.competency_scores, {}),
            'strong_competencies': safe_json_parse(result.strong_competencies, []),
            'weak_competencies': safe_json_parse(result.weak_competencies, []),
            'recommended_mentors': safe_json_parse(result.recommended_mentors, []),
            'recommended_courses': safe_json_parse(result.recommended_courses, []),
            'occupation_compatibility_scores': safe_json_parse(result.occupation_compatibility_scores, []),
            'assessment_completed_at': result.assessment_completed_at,
            'total_responses': result.total_responses,
            'is_final_result': result.is_final_result,
            'last_updated': result.last_updated
        }
    except Exception as e:
        print(f"Error parsing user assessment result: {str(e)}")
        raise e


def delete_user_assessment_result(db: Session, user_id: int) -> bool:
    """
    Delete user's assessment result from database
    
    Args:
        db: Database session
        user_id: User ID
        
    Returns:
        bool: True if deleted, False if not found
    """
    try:
        result = db.query(models.UserAssessmentResult).filter(
            models.UserAssessmentResult.userid == user_id
        ).first()
        
        if result:
            db.delete(result)
            db.commit()
            return True
        return False
        
    except Exception as e:
        db.rollback()
        print(f"Error deleting user assessment result: {str(e)}")
        raise e


def update_recommendations(
    db: Session, 
    user_id: int, 
    mentors: List[Dict[str, Any]], 
    courses: List[Dict[str, Any]]
) -> Optional[models.UserAssessmentResult]:
    """
    Update mentor and course recommendations for user
    
    Args:
        db: Database session
        user_id: User ID
        mentors: List of mentor recommendations
        courses: List of course recommendations
        
    Returns:
        Updated UserAssessmentResult or None if not found
    """
    try:
        result = get_user_assessment_result(db, user_id)
        if not result:
            return None
            
        result.recommended_mentors = json.dumps(mentors)
        result.recommended_courses = json.dumps(courses)
        
        db.commit()
        db.refresh(result)
        return result
        
    except Exception as e:
        db.rollback()
        print(f"Error updating recommendations: {str(e)}")
        raise e