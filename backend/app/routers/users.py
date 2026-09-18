from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdateRequest
from app.schemas.common import APIResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=APIResponse[UserResponse])
def read_user_me(current_user: User = Depends(get_current_active_user)):
    """Fetches details of the currently logged in customer."""
    return APIResponse(
        success=True,
        data=UserResponse.model_validate(current_user)
    )


@router.put("/me", response_model=APIResponse[UserResponse])
def update_user_me(
    update_in: UserUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Updates profile name and phone number."""
    if update_in.full_name is not None:
        current_user.full_name = update_in.full_name
    if update_in.phone_number is not None:
        current_user.phone_number = update_in.phone_number

    db.commit()
    db.refresh(current_user)
    return APIResponse(
        success=True,
        data=UserResponse.model_validate(current_user),
        message="Profile updated successfully"
    )
