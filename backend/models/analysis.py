from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from models import Base

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_type = Column(String)  
    title = Column(String)
    content = Column(Text)
    
    analysis_metadata = Column("metadata", JSON, default=dict)  
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    paper_id = Column(Integer, ForeignKey("papers.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    

    user = relationship("User", back_populates="analyses")
    paper = relationship("Paper", back_populates="analyses")