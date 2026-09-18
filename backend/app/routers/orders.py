from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse, OrderTrackingResponse
from app.schemas.common import APIResponse
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=APIResponse[OrderResponse], status_code=status.HTTP_201_CREATED)
def place_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Submits checkout order.
    Atomically creates order record, reserves and decrements stock, and empties user cart.
    """
    order = OrderService.create_order(db, current_user, order_in)
    return APIResponse(
        success=True,
        data=order,
        message=f"Order placed successfully! Tracking code: {order.tracking_code}"
    )


@router.get("", response_model=APIResponse[List[OrderResponse]])
def list_my_orders(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lists order history for the authenticated customer."""
    orders = OrderService.get_user_orders(db, current_user.id)
    return APIResponse(success=True, data=orders)


@router.get("/track/{tracking_code}", response_model=APIResponse[OrderTrackingResponse])
def track_order_status(
    tracking_code: str,
    db: Session = Depends(get_db)
):
    """
    Public or customer order tracking endpoint.
    Returns real-time status and visual multi-stage timeline.
    """
    tracking_info = OrderService.track_order(db, tracking_code)
    return APIResponse(success=True, data=tracking_info)


@router.get("/{order_id}", response_model=APIResponse[OrderResponse])
def get_order_details(
    order_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Retrieves full details of a specific order belonging to the user."""
    order = OrderService.get_order_by_id(db, order_id, current_user)
    return APIResponse(success=True, data=order)
