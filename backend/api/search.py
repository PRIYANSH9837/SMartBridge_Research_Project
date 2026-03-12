from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import httpx
import xml.etree.ElementTree as ET
from datetime import datetime

from models.user import User
from schemas.paper import PaperSearchParams, PaperCreate
from utils.auth import get_current_user, get_db
from services.search_service import search_arxiv, search_crossref

router = APIRouter(prefix="/api/search", tags=["Search"])

@router.post("/papers")
async def search_papers(
    params: PaperSearchParams,
    current_user: User = Depends(get_current_user)
):
    results = []
    
   
    if not params.source or params.source == "All Sources" or params.source == "arXiv":
        arxiv_results = await search_arxiv(params)
        results.extend(arxiv_results)
    
    
    if not params.source or params.source == "All Sources":
        crossref_results = await search_crossref(params)
        results.extend(crossref_results)
    
    return {"results": results[:params.max_results]}

@router.post("/import")
async def import_paper(
    paper_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from models.paper import Paper
    from models.workspace import Workspace

    workspace_id = paper_data.get("workspace_id")

   
    db_paper = Paper(
        title=paper_data.get("title"),
        authors=paper_data.get("authors", []),
        abstract=paper_data.get("abstract"),
        source=paper_data.get("source"),
        source_url=paper_data.get("url"),
        doi=paper_data.get("doi"),
        publication_date=datetime.strptime(
            paper_data.get("date"), "%Y-%m-%d"
        ) if paper_data.get("date") else None,
        citation_count=paper_data.get("citations", 0),
        tags=paper_data.get("tags", []),
        owner_id=current_user.id
    )

    
    if workspace_id:
        workspace = db.query(Workspace).filter(
            Workspace.id == workspace_id,
            Workspace.owner_id == current_user.id
        ).first()

        if workspace:
            db_paper.workspaces.append(workspace)

    db.add(db_paper)
    db.commit()
    db.refresh(db_paper)

    return db_paper