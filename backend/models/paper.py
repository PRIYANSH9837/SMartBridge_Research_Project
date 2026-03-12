from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from models import Base

class Paper(Base):
    __tablename__ = "papers"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    authors = Column(JSON, default=list)  
    abstract = Column(Text)
    source = Column(String)  
    source_url = Column(String)
    pdf_url = Column(String)
    doi = Column(String, unique=True, index=True)
    publication_date = Column(DateTime)
    citation_count = Column(Integer, default=0)
    tags = Column(JSON, default=list)
    
    
    file_path = Column(String)
    extracted_text = Column(Text)
    file_size = Column(Integer)
    
    
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    
    owner = relationship("User", back_populates="papers")
    workspaces = relationship("Workspace", secondary="workspace_papers", back_populates="papers")
    analyses = relationship("Analysis", back_populates="paper", cascade="all, delete-orphan")