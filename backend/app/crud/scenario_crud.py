"""
Scenario CRUD operations for Yetria Career Guidance Platform
"""

from sqlalchemy.orm import Session, joinedload
from typing import List
from .. import models
from ..api import schemas


def get_all_scenarios(db: Session) -> List[schemas.Scenario]:
    """
    Get all scenarios with their options and competency information
    
    Args:
        db: Database session
        
    Returns:
        List[Scenario]: List of scenarios with options
    """
    # This query efficiently loads scenarios with their related options and competency
    scenarios_db = db.query(models.Scenario).options(
        joinedload(models.Scenario.options),
        joinedload(models.Scenario.competency)
    ).order_by(models.Scenario.scenarioid).all()
    
    # Convert database objects to Pydantic schema format
    results = []
    for s in scenarios_db:
        # Generate letters for options (A, B, C, D, etc.)
        options_with_letters = []
        for i, option in enumerate(sorted(s.options, key=lambda x: x.scenariooptionid)):
            letter = chr(65 + i)  # A=65, B=66, C=67, D=68
            options_with_letters.append({
                "letter": letter,
                "text": option.optiontext
            })
        
        scenario_data = {
            "id": s.scenarioid,
            "text": s.description,  # Use description as the main text
            "competency_name": s.competency.name,
            "options": options_with_letters
        }
        results.append(scenario_data)
    
    return results
