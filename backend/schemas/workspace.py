from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class WorkspaceBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: str = "purple"

class WorkspaceCreate(WorkspaceBase):
    pass

class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None

class WorkspaceResponse(WorkspaceBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    papers_count: Optional[int] = 0
    
    class Config:
        from_attributes = True