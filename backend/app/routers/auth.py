from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.schemas.user import UserResponse
from app.schemas.common import APIResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=APIResponse[UserResponse], status_code=status.HTTP_201_CREATED)
def register(user_in: RegisterRequest, db: Session = Depends(get_db)):
    """Customer registration endpoint."""
    user = AuthService.register_user(db, user_in)
    return APIResponse(
        success=True,
        data=UserResponse.model_validate(user),
        message="Registration successful"
    )


@router.post("/login", response_model=APIResponse[TokenResponse])
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    """Customer & Admin login endpoint returning JWT access token."""
    user = AuthService.authenticate_user(db, login_in.email, login_in.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is currently inactive"
        )
        
    token_resp = AuthService.create_token_for_user(user)
    return APIResponse(
        success=True,
        data=token_resp,
        message="Login successful"
    )


@router.get("/me", response_model=APIResponse[UserResponse])
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """Retrieves authenticated user profile."""
    return APIResponse(
        success=True,
        data=UserResponse.model_validate(current_user)
    )
