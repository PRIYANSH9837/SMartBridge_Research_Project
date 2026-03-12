from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from models.user import User
from models.workspace import Workspace
from models.paper import Paper
from schemas.user import UserResponse
from utils.auth import get_current_user, get_db

router = APIRouter(prefix="/api", tags=["Dashboard"])

@router.get("/dashboard")
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    workspaces = db.query(Workspace).filter(Workspace.owner_id == current_user.id).all()
    
    total_papers = db.query(Paper).filter(Paper.owner_id == current_user.id).count()
    
    papers_analyzed = db.query(Paper).filter(
        Paper.owner_id == current_user.id,
        Paper.analyses.any()
    ).count()
    
    workspace_list = []
    for ws in workspaces:
        workspace_list.append({
            "id": ws.id,
            "name": ws.name,
            "description": ws.description,
            "color": ws.color,
            "created": ws.created_at.strftime("%m/%d/%Y"),
            "papers": len(ws.papers)
        })
    
    return {
        "user": {
            "full_name": current_user.full_name,
            "email": current_user.email,
            "username": current_user.username
        },
        "stats": {
            "total_workspaces": len(workspaces),
            "total_papers": total_papers,
            "papers_analyzed": papers_analyzed
        },
        "workspaces": workspace_list
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user