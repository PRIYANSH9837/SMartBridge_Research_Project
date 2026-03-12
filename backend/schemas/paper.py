from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict

class PaperBase(BaseModel):
    title: str
    authors: List[str] = []
    abstract: Optional[str] = None
    source: Optional[str] = None
    source_url: Optional[str] = None
    doi: Optional[str] = None
    publication_date: Optional[datetime] = None
    tags: List[str] = []

class PaperCreate(PaperBase):
    workspace_ids: Optional[List[int]] = []

class PaperResponse(PaperBase):
    id: int
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    owner_id: int
    is_public: bool
    created_at: datetime
    citation_count: int
    
    class Config:
        from_attributes = True

class PaperDetailResponse(PaperResponse):
    extracted_text: Optional[str] = None
    
class PaperSearchParams(BaseModel):
    query: str
    source: Optional[str] = None
    year_from: Optional[int] = None
    year_to: Optional[int] = None
    author: Optional[str] = None
    max_results: int = 20