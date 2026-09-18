import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.return_exchange import ReturnExchangeRequest, ReturnItem
from app.models.order import Order
from app.models.user import User
from app.schemas.return_exchange import ReturnCreate, ReturnResponse


class ReturnService:
    @staticmethod
    def format_return_response(ret: ReturnExchangeRequest) -> ReturnResponse:
        """Formats a ReturnExchangeRequest model to ReturnResponse schema."""
        action_name = "exchange" if ret.request_type.upper() == "EXCHANGE" else "return"
        message = (
            f"Your {action_name} request has been logged. Rainbow Ready Mades staff will review it."
            if ret.status == "REQUESTED" else f"Request is currently {ret.status}."
        )

        return ReturnResponse(
            return_id=ret.id,
            order_id=ret.order_id,
            request_type=ret.request_type,
            status=ret.status,
            reason=ret.reason,
            customer_note=ret.description,
            desired_size=ret.desired_size,
            admin_notes=ret.admin_notes,
            message=message,
            created_at=ret.created_at,
            updated_at=ret.updated_at
        )

    @staticmethod
    def create_return_request(db: Session, user: User, return_in: ReturnCreate) -> ReturnResponse:
        """Files a new return or size-exchange request for an eligible order."""
        # 1. Verify order exists and belongs to user
        order = db.query(Order).filter(Order.id == return_in.order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order '{return_in.order_id}' was not found"
            )

        if user.role.upper() != "ADMIN" and order.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only submit return/exchange requests for your own orders"
            )

        # 2. Check if a request already exists
        existing = db.query(ReturnExchangeRequest).filter(
            ReturnExchangeRequest.order_id == return_in.order_id,
            ReturnExchangeRequest.status.in_(["REQUESTED", "APPROVED", "PROCESSING"])
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"An active {existing.request_type.lower()} request ({existing.id}) already exists for this order"
            )

        # 3. Create request
        return_id = f"ret_{uuid.uuid4().hex[:8]}"
        req = ReturnExchangeRequest(
            id=return_id,
            order_id=return_in.order_id,
            user_id=user.id,
            request_type=return_in.request_type.upper(),
            status="REQUESTED",
            reason=return_in.reason,
            description=return_in.customer_note,
            desired_size=return_in.desired_size
        )
        db.add(req)

        # 4. Optional link to specific item
        if return_in.item_id:
            ri = ReturnItem(
                return_id=return_id,
                order_item_id=return_in.item_id,
                reason_code=return_in.reason,
                desired_exchange_size=return_in.desired_size
            )
            db.add(ri)

        db.commit()
        db.refresh(req)
        return ReturnService.format_return_response(req)

    @staticmethod
    def get_user_returns(db: Session, user: User) -> List[ReturnResponse]:
        """Lists all returns submitted by the current user."""
        returns = db.query(ReturnExchangeRequest).filter(
            ReturnExchangeRequest.user_id == user.id
        ).order_by(ReturnExchangeRequest.created_at.desc()).all()
        return [ReturnService.format_return_response(r) for r in returns]

    @staticmethod
    def get_return_by_id(db: Session, return_id: str, user: User) -> ReturnResponse:
        """Fetches return request detail ensuring privacy check."""
        ret = db.query(ReturnExchangeRequest).filter(ReturnExchangeRequest.id == return_id).first()
        if not ret:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Return request '{return_id}' not found"
            )

        if user.role.upper() != "ADMIN" and ret.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view this return request"
            )

        return ReturnService.format_return_response(ret)
