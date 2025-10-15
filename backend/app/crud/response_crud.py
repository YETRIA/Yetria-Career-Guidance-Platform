"""
Response CRUD operations for Yetria Career Guidance Platform
"""

from sqlalchemy.orm import Session
from typing import List

from .. import models
from ..api import schemas


def convert_option_letter_to_scenariooptionid(db: Session, scenario_id: int, option_letter: str) -> int:
    """
    Convert option letter (A, B, C, ... up to number of options) to scenariooptionid
    
    Args:
        db: Database session
        scenario_id: Scenario ID
        option_letter: Option letter (case-insensitive)
        
    Returns:
        int: ScenarioOption ID
    """
    # Get all options for this scenario ordered by scenariooptionid
    options = db.query(models.ScenarioOption).filter(
        models.ScenarioOption.scenarioid == scenario_id
    ).order_by(models.ScenarioOption.scenariooptionid).all()
    
    if not options:
        raise ValueError(f"No options found for scenario {scenario_id}")
    
    # Normalize letter and convert to 0-based index
    if not option_letter or len(option_letter) != 1:
        raise ValueError(f"Invalid option letter: {option_letter}")
    letter = option_letter.upper()
    option_index = ord(letter) - ord('A')  # A->0, B->1, ...
    
    if option_index < 0 or option_index >= len(options):
        raise ValueError(f"Option letter {letter} out of range for scenario {scenario_id}")
    
    return options[option_index].scenariooptionid


def save_user_responses(db: Session, responses: List[schemas.ResponseIn], user_id: int) -> int:
    """
    Save user responses to database
    
    Args:
        db: Database session
        responses: List of user responses
        user_id: User ID
        
    Returns:
        int: Number of saved responses
    """
    try:
        # Remove duplicate responses within the current payload by scenario_id
        unique_responses = {}
        for response in responses:
            unique_responses[response.scenario_id] = response

        # For each scenario in the payload, delete any existing response of this user
        # This way, we only replace the scenarios being submitted (stage-based),
        # and keep previously answered scenarios intact.
        for scenario_id in unique_responses.keys():
            option_ids_for_scenario = db.query(models.ScenarioOption.scenariooptionid).\
                filter(models.ScenarioOption.scenarioid == scenario_id).all()
            option_ids_for_scenario = [row[0] for row in option_ids_for_scenario]
            if option_ids_for_scenario:
                db.query(models.UserResponse).\
                    filter(
                        models.UserResponse.userid == user_id,
                        models.UserResponse.scenariooptionid.in_(option_ids_for_scenario)
                    ).delete(synchronize_session=False)

        # Insert new/updated responses
        db_responses = []
        for response in unique_responses.values():
            scenariooptionid = convert_option_letter_to_scenariooptionid(
                db, response.scenario_id, response.option_letter
            )
            db_responses.append(models.UserResponse(
                userid=user_id,
                scenariooptionid=scenariooptionid
            ))

        if db_responses:
            db.add_all(db_responses)
        db.commit()

        return len(db_responses)

    except Exception as e:
        db.rollback()
        print(f"Error saving user responses: {str(e)}")
        raise e


def get_user_response_count(db: Session, user_id: int) -> int:
    """
    Return total number of responses saved for the given user.
    """
    return db.query(models.UserResponse).filter(models.UserResponse.userid == user_id).count()