"""
Scenarios endpoints for Yetria Career Guidance Platform
Scenario listing and management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ...core.database import get_db
from ...crud.scenario_crud import get_all_scenarios
from ...api.schemas import Scenario
from ...api.dependencies import get_current_active_user
from ...models import User as UserModel

router = APIRouter()


@router.get("/scenarios", response_model=List[Scenario])
def get_scenarios(
    stage: int = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Get scenarios with their options and competency information.
    If stage is provided, returns scenarios for that specific stage.
    Only authenticated users can access this endpoint.
    
    Args:
        stage: Optional stage number (1-4) to filter scenarios
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List[Scenario]: List of scenarios with options
    """
    try:
        scenarios = get_all_scenarios(db=db)
        
        # If stage is provided, filter scenarios by stage
        if stage is not None:
            if stage < 1 or stage > 4:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Stage must be between 1 and 4"
                )
            
            # Calculate scenario range for the stage
            # Each stage has 4 scenarios
            start_index = (stage - 1) * 4
            end_index = start_index + 4
            
            # Return only scenarios for this stage
            return scenarios[start_index:end_index]
        
        return scenarios
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving scenarios: {str(e)}"
        )
