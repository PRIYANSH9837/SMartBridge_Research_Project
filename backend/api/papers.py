from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import json
from datetime import datetime

from models.user import User
from models.paper import Paper
from models.workspace import Workspace
from schemas.paper import PaperCreate, PaperResponse, PaperDetailResponse
from utils.auth import get_current_user, get_db
from config import settings
from services.pdf_extractor import extract_text_from_pdf

router = APIRouter(prefix="/api/papers", tags=["Papers"])

@router.post("/", response_model=PaperResponse)
async def create_paper(
    paper: PaperCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_paper = Paper(
        **paper.dict(exclude={"workspace_ids"}),
        owner_id=current_user.id
    )
    db.add(db_paper)
    db.commit()
    db.refresh(db_paper)
    
   
    if paper.workspace_ids:
        workspaces = db.query(Workspace).filter(
            Workspace.id.in_(paper.workspace_ids),
            Workspace.owner_id == current_user.id
        ).all()
        db_paper.workspaces.extend(workspaces)
        db.commit()
    
    return db_paper

@router.post("/upload", response_model=PaperResponse)
async def upload_paper(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    workspace_ids: str = Form("[]"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
   
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    
   
    user_upload_dir = os.path.join(settings.UPLOAD_DIR, str(current_user.id))
    os.makedirs(user_upload_dir, exist_ok=True)
    
    file_path = os.path.join(user_upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    extracted_text = extract_text_from_pdf(file_path)
    
    paper_title = title or file.filename.replace('.pdf', '')
    db_paper = Paper(
        title=paper_title,
        file_path=file_path,
        file_size=file_size,
        extracted_text=extracted_text,
        owner_id=current_user.id
    )
    db.add(db_paper)
    db.commit()
    db.refresh(db_paper)
    
    
    ws_ids = json.loads(workspace_ids)
    if ws_ids:
        workspaces = db.query(Workspace).filter(
            Workspace.id.in_(ws_ids),
            Workspace.owner_id == current_user.id
        ).all()
        db_paper.workspaces.extend(workspaces)
        db.commit()
    
    return db_paper

@router.get("/", response_model=List[PaperResponse])
async def get_papers(
    workspace_id: Optional[int] = Query(None, description="Filter papers by workspace ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Paper).filter(Paper.owner_id == current_user.id)
    
    if workspace_id:
       
        query = query.filter(Paper.workspaces.any(id=workspace_id))
    
    papers = query.all()
   
    for paper in papers:
        paper.analyzed = len(paper.analyses) > 0
    
    return papers

@router.get("/{paper_id}", response_model=PaperDetailResponse)
async def get_paper(
    paper_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    paper = db.query(Paper).filter(
        Paper.id == paper_id,
        Paper.owner_id == current_user.id
    ).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    paper.analyzed = len(paper.analyses) > 0
    return paper

@router.delete("/{paper_id}")
async def delete_paper(
    paper_id: int,
    workspace_id: Optional[int] = Query(None, description="Remove from workspace only"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    paper = db.query(Paper).filter(
        Paper.id == paper_id,
        Paper.owner_id == current_user.id
    ).first()
    
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    if workspace_id:
      
        workspace = db.query(Workspace).filter(
            Workspace.id == workspace_id,
            Workspace.owner_id == current_user.id
        ).first()
        
        if workspace:
            paper.workspaces.remove(workspace)
            db.commit()
            return {"message": "Paper removed from workspace successfully"}
    else:
        
        if paper.file_path and os.path.exists(paper.file_path):
            os.remove(paper.file_path)
        
        db.delete(paper)
        db.commit()
        return {"message": "Paper deleted successfully"}