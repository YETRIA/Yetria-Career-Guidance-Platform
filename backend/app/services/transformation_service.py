"""
Transformation service for Yetria Career Guidance Platform
Converts user responses to competency scores for ML model
"""

import logging
from sqlalchemy.orm import Session, joinedload
from typing import List, Dict
from .. import models
from ..api import schemas

logger = logging.getLogger(__name__)


def transform_responses_to_scores(db: Session, responses: List[schemas.ResponseIn]) -> Dict[str, float]:
    """
    Transform user responses to competency scores
    
    Args:
        db: Database session
        responses: List of user responses
        
    Returns:
        Dict[str, float]: Competency scores
    """
    logger.info("="*60)
    logger.info("TRANSFORMATION STARTED")
    logger.info("="*60)
    logger.info(f"Processing {len(responses)} responses")
    
    # Log all user responses
    for i, resp in enumerate(responses, 1):
        logger.debug(f"  {i}. Scenario {resp.scenario_id} -> Option '{resp.option_letter}'")
    
    # Get all scenario options with their scores and competency information
    all_options = db.query(models.ScenarioOption).options(
        joinedload(models.ScenarioOption.scenario).joinedload(models.Scenario.competency)
    ).all()
    
    logger.debug(f"Found {len(all_options)} scenario options in database")
    
    # Create a mapping from (scenario_id, option_letter) to (competency_name, score)
    score_map = {}
    for opt in all_options:
        # Generate letter for this option based on its position
        scenario_options = db.query(models.ScenarioOption).filter(
            models.ScenarioOption.scenarioid == opt.scenarioid
        ).order_by(models.ScenarioOption.scenariooptionid).all()
        
        option_index = scenario_options.index(opt)
        letter = chr(65 + option_index)  # A=65, B=66, C=67, D=68
        
        key = (opt.scenarioid, letter)
        score_map[key] = (opt.scenario.competency.name, opt.score)
    
    logger.debug(f"Created score map with {len(score_map)} entries")
    
    # Calculate competency scores based on user responses
    competency_scores = {}
    competency_counts = {}
    
    logger.debug("Processing user responses:")
    for response in responses:
        key = (response.scenario_id, response.option_letter)
        
        if key in score_map:
            competency_name, score = score_map[key]
            competency_scores[competency_name] = competency_scores.get(competency_name, 0) + score
            competency_counts[competency_name] = competency_counts.get(competency_name, 0) + 1
            logger.debug(f"  ✓ Scenario {response.scenario_id} option '{response.option_letter}' -> {competency_name} = {score}")
        else:
            logger.warning(f"  ✗ No match for Scenario {response.scenario_id} option '{response.option_letter}'")
    
    # Calculate average scores for each competency
    final_scores = {}
    for competency_name in competency_scores:
        if competency_counts[competency_name] > 0:
            final_scores[competency_name] = round(competency_scores[competency_name] / competency_counts[competency_name], 1)
    
    logger.info("===== COMPUTED SCORES =====")
    logger.info("Final scores calculated from responses:")
    for comp_name, score in final_scores.items():
        logger.debug(f"  - {comp_name}: {score}")
    
    # Get actual competency names from database (dynamic approach)
    db_competencies = db.query(models.Competency.name).distinct().all()
    db_competency_names = [comp[0] for comp in db_competencies]
    logger.debug(f"All competencies in database: {db_competency_names}")
    
    missing_competencies = [comp for comp in db_competency_names if comp not in final_scores]
    if missing_competencies:
        logger.warning("⚠️  MISSING COMPETENCIES DETECTED!")
        logger.warning(f"Missing: {missing_competencies}")
        logger.warning("Adding default score 0.5 for missing competencies")
        logger.warning("⚠️  THIS WILL CAUSE IDENTICAL RESULTS IF USERS HAVE SAME MISSING COMPETENCIES!")
        # Add default scores for missing competencies
        for comp in missing_competencies:
            final_scores[comp] = 0.5  # Default neutral score
            logger.debug(f"  - {comp}: 0.5 (default)")
    
    logger.info("===== FINAL SCORES =====")
    for comp_name, score in sorted(final_scores.items()):
        logger.debug(f"  - {comp_name}: {score}")
    
    logger.info("="*60)
    logger.info("TRANSFORMATION COMPLETE")
    logger.info("="*60)
    
    return final_scores