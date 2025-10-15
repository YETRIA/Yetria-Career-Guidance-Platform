"""
Responses endpoints for Yetria Career Guidance Platform
User response submission and prediction endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ...core.database import get_db
from ...crud.response_crud import save_user_responses, get_user_response_count
from ...crud.assessment_result_crud import save_user_assessment_result, get_user_assessment_result_as_dict
from ...services.transformation_service import transform_responses_to_scores
from ...services.prediction_service import PredictionService
from ...api.schemas import ResponseIn, PredictionResultSchema
from ...api.dependencies import get_current_active_user
from ...models import User as UserModel
from ... import models

router = APIRouter()

# Initialize prediction service
prediction_service = PredictionService()


@router.post("/responses", response_model=PredictionResultSchema)
def submit_responses_and_predict(
    responses: List[ResponseIn],
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Submit user responses to scenarios and get career prediction
    
    Args:
        responses: List of user responses
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        PredictionResultSchema: Career prediction result
    """
    try:
        # 1. Save responses to database
        saved_count = save_user_responses(db=db, responses=responses, user_id=current_user.userid)
        
        # 2. Get ALL user responses from database (not just current stage)
        # Query all responses for this user from database
        q = db.query(
            models.ScenarioOption.score,
            models.Competency.name,
            models.Scenario.scenarioid,
            models.ScenarioOption.scenariooptionid
        ).join(
            models.UserResponse, models.UserResponse.scenariooptionid == models.ScenarioOption.scenariooptionid
        ).join(
            models.Scenario, models.Scenario.scenarioid == models.ScenarioOption.scenarioid
        ).join(
            models.Competency, models.Competency.competencyid == models.Scenario.competencyid
        ).filter(models.UserResponse.userid == current_user.userid)
        
        rows = q.all()
        
        # Calculate competency scores from ALL responses
        totals = {}
        counts = {}
        for score, comp_name, scenario_id, option_id in rows:
            # Clean competency name (remove extra spaces, quotes, etc.)
            comp_name_clean = str(comp_name).strip().replace("'", "").replace('"', '')
            totals[comp_name_clean] = totals.get(comp_name_clean, 0) + float(score)
            counts[comp_name_clean] = counts.get(comp_name_clean, 0) + 1
        
        user_scores = {k: round(totals[k] / counts[k], 1) for k in totals}
        
        # 3. Get prediction from ML model
        prediction_result = prediction_service.predict_and_analyze(user_scores)
        
        # 4. Check for errors in prediction
        if "error" in prediction_result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=prediction_result["error"]
            )
        
        # 5. Save complete assessment result to database
        try:
            save_user_assessment_result(db=db, user_id=current_user.userid, prediction_result=prediction_result)
        except Exception as save_error:
            print(f"Warning: Could not save assessment result: {str(save_error)}")
            # Don't fail the request if saving result fails
        
        return prediction_result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing responses: {str(e)}"
        )


@router.get("/responses/progress")
def get_user_progress(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Return user's assessment progress.
    total_responses: toplam verilen cevap sayısı
    current_stage: sıradaki aşama (1-4, hepsi bitti ise 4)
    completed_stages: biten aşamaların dizisi
    """
    try:
        total = get_user_response_count(db, current_user.userid)
        # Each stage has 4 scenarios
        completed = total // 4
        if completed > 4:
            completed = 4
        current_stage = completed + 1 if completed < 4 else 4
        completed_stages = list(range(1, completed + 1))
        return {
            "total_responses": total,
            "current_stage": current_stage,
            "completed_stages": completed_stages
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving progress: {str(e)}"
        )


@router.get("/responses/result", response_model=PredictionResultSchema)
def get_result_from_saved_responses(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Compute prediction result using the user's saved responses in DB.
    """
    try:
        # Join UserResponse -> ScenarioOption -> Scenario -> Competency to compute scores
        q = db.query(
            models.ScenarioOption.score,
            models.Competency.name
        ).join(
            models.UserResponse, models.UserResponse.scenariooptionid == models.ScenarioOption.scenariooptionid
        ).join(
            models.Scenario, models.Scenario.scenarioid == models.ScenarioOption.scenarioid
        ).join(
            models.Competency, models.Competency.competencyid == models.Scenario.competencyid
        ).filter(models.UserResponse.userid == current_user.userid)

        rows = q.all()
        if not rows:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No responses found for user")

        # Average score per competency
        totals = {}
        counts = {}
        for score, comp_name in rows:
            totals[comp_name] = totals.get(comp_name, 0) + float(score)
            counts[comp_name] = counts.get(comp_name, 0) + 1

        user_scores = {k: totals[k] / counts[k] for k in totals}

        prediction_result = prediction_service.predict_and_analyze(user_scores)
        if "error" in prediction_result:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=prediction_result["error"])
        return prediction_result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error computing result: {str(e)}")


@router.get("/assessment-result")
def get_user_assessment_result(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Get user's saved assessment result from database
    This includes complete results: occupation match, competency scores, etc.
    """
    try:
        result = get_user_assessment_result_as_dict(db=db, user_id=current_user.userid)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment result not found. Please complete the assessment first."
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving assessment result: {str(e)}"
        )


@router.get("/assessment-status")
def get_assessment_status(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Check if user has completed assessment and can view results
    """
    try:
        result = get_user_assessment_result_as_dict(db=db, user_id=current_user.userid)
        
        response = {
            "has_completed_assessment": result is not None,
            "can_view_results": result is not None,
            "assessment_completed_at": result["assessment_completed_at"] if result else None,
            "recommended_occupation": result["recommended_occupation"] if result else None
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking assessment status: {str(e)}"
        )