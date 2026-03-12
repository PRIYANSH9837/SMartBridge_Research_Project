from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from models import Base


workspace_papers = Table(
    "workspace_papers",
    Base.metadata,
    Column("workspace_id", Integer, ForeignKey("workspaces.id")),
    Column("paper_id", Integer, ForeignKey("papers.id"))
)

class Workspace(Base):
    __tablename__ = "workspaces"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    color = Column(String, default="purple")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
   
    owner = relationship("User", back_populates="workspaces")
    papers = relationship("Paper", secondary=workspace_papers, back_populates="workspaces")
    documents = relationship("Document", back_populates="workspace")