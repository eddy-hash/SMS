from fastapi import APIRouter, Depends
from typing import Dict
from api.v1.dependencies.auth import get_current_user

router = APIRouter(tags=["Actions"])

@router.get("/actions")
async def get_actions(current_user: Dict = Depends(get_current_user)):
    return {"actions": []}
