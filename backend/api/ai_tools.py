from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from models.user import User
from models.paper import Paper
from models.analysis import Analysis
from schemas.analysis import AnalysisCreate, AnalysisResponse
from schemas.common import BackgroundTaskResponse
from utils.auth import get_current_user, get_db
from services.ai_service import (
    generate_summaries,
    extract_insights,
    generate_literature_review
)
from database import SessionLocal

router = APIRouter(prefix="/api/ai-tools", tags=["AI Tools"])


@router.post("/summaries", response_model=BackgroundTaskResponse)
async def create_summaries(
    analysis_data: AnalysisCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    papers = db.query(Paper).filter(
        Paper.id.in_(analysis_data.paper_ids),
        Paper.owner_id == current_user.id
    ).all()

    if not papers:
        raise HTTPException(status_code=404, detail="No valid papers found")

    texts = [p.extracted_text or p.abstract for p in papers if p.extracted_text or p.abstract]

    if not texts:
        raise HTTPException(status_code=400, detail="Papers have no text content")

    def generate_and_save(paper_ids, user_id, titles, texts):
        db_session = SessionLocal()
        try:
            summary = generate_summaries(texts, titles)

            db_analysis = Analysis(
                analysis_type="summary",
                title=f"Summary of {len(paper_ids)} papers",
                content=summary,
                analysis_metadata={  
                    "paper_ids": paper_ids,
                    "paper_titles": titles
                },
                user_id=user_id
            )

            db_session.add(db_analysis)
            db_session.commit()

        except Exception as e:
            print(f"Error generating summary: {e}")
            db_session.rollback()
        finally:
            db_session.close()

    background_tasks.add_task(
        generate_and_save,
        analysis_data.paper_ids,
        current_user.id,
        [p.title for p in papers],
        texts
    )

    return {
        "message": "Summary generation started",
        "status": "processing"
    }


@router.post("/insights", response_model=BackgroundTaskResponse)
async def extract_paper_insights(
    analysis_data: AnalysisCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    papers = db.query(Paper).filter(
        Paper.id.in_(analysis_data.paper_ids),
        Paper.owner_id == current_user.id
    ).all()

    if not papers:
        raise HTTPException(status_code=404, detail="No valid papers found")

    texts = [p.extracted_text or p.abstract for p in papers if p.extracted_text or p.abstract]

    if not texts:
        raise HTTPException(status_code=400, detail="Papers have no text content")

    def generate_and_save(paper_ids, user_id, titles, texts):
        db_session = SessionLocal()
        try:
            insights = extract_insights(texts, titles)

            db_analysis = Analysis(
                analysis_type="insights",
                title=f"Insights from {len(paper_ids)} papers",
                content=insights,
                analysis_metadata={  
                    "paper_ids": paper_ids,
                    "paper_titles": titles
                },
                user_id=user_id
            )

            db_session.add(db_analysis)
            db_session.commit()

        except Exception as e:
            print(f"Error generating insights: {e}")
            db_session.rollback()
        finally:
            db_session.close()

    background_tasks.add_task(
        generate_and_save,
        analysis_data.paper_ids,
        current_user.id,
        [p.title for p in papers],
        texts
    )

    return {
        "message": "Insights extraction started",
        "status": "processing"
    }




@router.post("/literature-review", response_model=BackgroundTaskResponse)
async def create_literature_review(
    analysis_data: AnalysisCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    papers = db.query(Paper).filter(
        Paper.id.in_(analysis_data.paper_ids),
        Paper.owner_id == current_user.id
    ).all()

    if len(papers) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 papers")

    paper_data = [{
        "title": p.title,
        "authors": p.authors,
        "abstract": p.abstract,
        "text": p.extracted_text or "",
        "year": p.publication_date.year if p.publication_date else None
    } for p in papers]

    def generate_and_save(paper_ids, user_id, paper_data):
        db_session = SessionLocal()
        try:
            review = generate_literature_review(paper_data)

            db_analysis = Analysis(
                analysis_type="literature_review",
                title=f"Literature Review of {len(paper_ids)} papers",
                content=review,
                analysis_metadata={  
                    "paper_ids": paper_ids,
                    "paper_count": len(paper_ids)
                },
                user_id=user_id
            )

            db_session.add(db_analysis)
            db_session.commit()

        except Exception as e:
            print(f"Error generating literature review: {e}")
            db_session.rollback()
        finally:
            db_session.close()

    background_tasks.add_task(
        generate_and_save,
        analysis_data.paper_ids,
        current_user.id,
        paper_data
    )

    return {
        "message": "Literature review generation started",
        "status": "processing"
    }



@router.get("/analyses", response_model=List[AnalysisResponse])
async def get_recent_analyses(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analyses = db.query(Analysis).filter(
        Analysis.user_id == current_user.id
    ).order_by(Analysis.created_at.desc()).limit(limit).all()
    
    return analyses


@router.get("/analyses/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == current_user.id
    ).first()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return analysis

@router.delete("/analyses/{analysis_id}")
async def delete_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == current_user.id
    ).first()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    db.delete(analysis)
    db.commit()
    
    return {"message": "Analysis deleted successfully"}