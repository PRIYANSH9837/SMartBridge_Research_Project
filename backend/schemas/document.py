from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class DocumentBase(BaseModel):
    name: str
    content: str = ""
    document_type: str = "document"
    is_starred: bool = False
    parent_id: Optional[int] = None
    workspace_id: Optional[int] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    is_starred: Optional[bool] = None
    parent_id: Optional[int] = None

class DocumentResponse(DocumentBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True