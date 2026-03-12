from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from models import Base

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    content = Column(Text, default="")
    document_type = Column(String, default="document")  # document, folder
    parent_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    is_starred = Column(Boolean, default=False)
    
    
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=True)
    
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
   
    owner = relationship("User", back_populates="documents")
    workspace = relationship("Workspace", back_populates="documents")
    parent = relationship("Document", remote_side=[id], backref="children")