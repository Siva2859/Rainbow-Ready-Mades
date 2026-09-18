from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import RegisterRequest, TokenResponse, UserTokenPayload


class AuthService:
    @staticmethod
    def register_user(db: Session, user_in: RegisterRequest) -> User:
        """Registers a new customer account."""
        existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists."
            )
        
        user = User(
            email=user_in.email.lower(),
            full_name=user_in.full_name,
            hashed_password=get_password_hash(user_in.password),
            phone_number=user_in.phone,
            role="USER",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticates user credentials."""
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def create_token_for_user(user: User) -> TokenResponse:
        """Generates JWT token response for authenticated user."""
        access_token = create_access_token(
            subject=user.id,
            role=user.role
        )
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserTokenPayload(
                id=user.id,
                full_name=user.full_name,
                email=user.email,
                role=user.role
            )
        )
