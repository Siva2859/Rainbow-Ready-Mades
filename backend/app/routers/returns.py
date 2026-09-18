from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.return_exchange import ReturnCreate, ReturnResponse
from app.schemas.common import APIResponse
from app.services.return_service import ReturnService

router = APIRouter(prefix="/returns", tags=["Returns & Exchanges"])


@router.post("", response_model=APIResponse[ReturnResponse], status_code=status.HTTP_201_CREATED)
def request_return_or_exchange(
    return_in: ReturnCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Submits a return or size-exchange request for a delivered order.
    Validates ownership and creates a tracked support ticket.
    """
    return_resp = ReturnService.create_return_request(db, current_user, return_in)
    return APIResponse(
        success=True,
        data=return_resp,
        message=return_resp.message
    )


@router.get("", response_model=APIResponse[List[ReturnResponse]])
def list_my_return_requests(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lists all return and exchange requests filed by the authenticated customer."""
    returns = ReturnService.get_user_returns(db, current_user)
    return APIResponse(success=True, data=returns)


@router.get("/{return_id}", response_model=APIResponse[ReturnResponse])
def get_return_request_detail(
    return_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Retrieves status and administrative notes for a specific return ticket."""
    return_resp = ReturnService.get_return_by_id(db, return_id, current_user)
    return APIResponse(success=True, data=return_resp)
