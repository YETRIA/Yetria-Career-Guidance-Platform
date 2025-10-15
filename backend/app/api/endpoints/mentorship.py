"""
Mentorship endpoints: recommend mentors and manage mentorship requests
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List

from ...core.database import get_db
from ...api.dependencies import get_current_active_user
from ...models import (
    User as UserModel,
    MentorProfile,
    MatchStatus,
    Occupation,
    MentorMatch,
)
from ...api.schemas import (
    MentorProfileSchema,
    MentorshipRequestCreate,
    MentorshipRequestSchema,
    MentorshipRequestDetailSchema,
)

router = APIRouter()


@router.get("/mentors/recommend", response_model=List[MentorProfileSchema])
def recommend_mentors(
    occupation_title: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Return all mentors for the given occupation title.
    Note: mentorprofile table has NO statusid - all mentors are shown.
    """
    occupation = db.query(Occupation).filter(Occupation.title == occupation_title).first()
    if not occupation:
        return []

    # No status filtering - mentorprofile has no statusid column
    mentors = db.query(MentorProfile).filter(
        MentorProfile.occupationid == occupation.occupationid
    ).all()
    
    # enrich with username from User table
    result = []
    for m in mentors:
        item = {
            "mentorprofileid": m.mentorprofileid,
            "userid": m.userid,
            "occupationid": m.occupationid,
            "statusid": None,  # No statusid in mentorprofile table
            "company": m.company,
            "title": m.title,
            "photourl": m.photourl,
            "bio": m.bio,
            "supporttopics": m.supporttopics,
            "quote": m.quote,
            "username": db.query(UserModel.name).filter(UserModel.userid == m.userid).scalar()
        }
        result.append(item)
    return result


@router.post("/mentorship/requests", response_model=MentorshipRequestSchema)
def create_mentorship_request(
    body: MentorshipRequestCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Create a mentorship request (mentormatch) for the current user.
    Default status is 'Talep Gönderildi' (id=1), matchscore is 0.0
    """
    pending_status = db.query(MatchStatus).filter(MatchStatus.statusname.ilike('%Talep%')).first()
    status_id = pending_status.matchstatusid if pending_status else 1

    req = MentorMatch(
        studentuserid=current_user.userid,
        mentorprofileid=body.mentorprofileid,
        matchstatusid=status_id,
        matchscore=0.0,  # Default matchscore for new requests
        requestdate=func.now()
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.get("/mentorship/requests", response_model=List[MentorshipRequestDetailSchema])
def list_my_mentorship_requests(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    List all mentorship requests (mentormatch) for the current user with detailed info
    Includes mentor name, company, title, photo and status name
    """
    # Query mentormatch table with JOIN to get mentor and status info
    requests = db.query(MentorMatch).filter(
        MentorMatch.studentuserid == current_user.userid
    ).all()
    
    result = []
    for req in requests:
        # Get mentor profile
        mentor_profile = db.query(MentorProfile).filter(
            MentorProfile.mentorprofileid == req.mentorprofileid
        ).first()
        
        # Get mentor user info
        mentor_user = None
        if mentor_profile:
            mentor_user = db.query(UserModel).filter(
                UserModel.userid == mentor_profile.userid
            ).first()
        
        # Get status name
        status = db.query(MatchStatus).filter(
            MatchStatus.matchstatusid == req.matchstatusid
        ).first()
        
        # Build detailed response (keeping old field names for frontend compatibility)
        detail = {
            "mentorshiprequestid": req.mentormatchid,
            "userid": req.studentuserid,
            "mentorprofileid": req.mentorprofileid,
            "statusid": req.matchstatusid,
            "createdat": req.requestdate,
            "mentor_name": mentor_user.name if mentor_user else None,
            "mentor_company": mentor_profile.company if mentor_profile else None,
            "mentor_title": mentor_profile.title if mentor_profile else None,
            "mentor_photourl": mentor_profile.photourl if mentor_profile else None,
            "status_name": status.statusname if status else None
        }
        result.append(detail)
    
    return result