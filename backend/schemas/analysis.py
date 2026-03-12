from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

class AnalysisBase(BaseModel):
    analysis_type: str
    title: str
    content: str
    analysis_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class AnalysisCreate(BaseModel):
    paper_ids: Optional[List[int]] = Field(default_factory=list)

class AnalysisResponse(AnalysisBase):
    id: int
    user_id: int
    paper_id: Optional[int] = None
    created_at: Optional[datetime] = None
    
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True
    )