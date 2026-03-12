# schemas/common.py

from pydantic import BaseModel

class BackgroundTaskResponse(BaseModel):
    message: str
    status: str