from typing import Optional
from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import get_optional_current_user
from app.models.user import User
from app.schemas.cart import CartResponse, CartItemCreate, CartItemUpdate
from app.schemas.common import APIResponse
from app.services.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["Cart"])


def _resolve_cart(
    db: Session,
    current_user: Optional[User],
    session_id: Optional[str]
):
    """Helper to locate or create a cart for the user or session."""
    user_id = current_user.id if current_user else None
    return CartService.get_or_create_cart(db, user_id=user_id, session_id=session_id)


@router.post("", response_model=APIResponse[CartResponse])
def create_or_initialize_cart(
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Initializes a new cart or fetches existing cart."""
    cart = _resolve_cart(db, current_user, x_session_id)
    return APIResponse(success=True, data=CartService.format_cart_response(cart))


@router.get("", response_model=APIResponse[CartResponse])
def get_cart(
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves current cart with itemized lines, subtotal, and validated pricing."""
    cart = _resolve_cart(db, current_user, x_session_id)
    return APIResponse(success=True, data=CartService.format_cart_response(cart))


@router.post("/items", response_model=APIResponse[CartResponse])
def add_item_to_cart(
    item_in: CartItemCreate,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Adds a garment to the shopping cart.
    Validates inventory availability and calculates price from database records.
    """
    cart = _resolve_cart(db, current_user, x_session_id)
    cart_resp = CartService.add_item_to_cart(db, cart, item_in)
    return APIResponse(
        success=True,
        data=cart_resp,
        message="Item added to cart"
    )


@router.patch("/items/{item_id}", response_model=APIResponse[CartResponse])
def update_cart_item_quantity(
    item_id: str,
    update_in: CartItemUpdate,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Updates the quantity of a specific cart item."""
    cart = _resolve_cart(db, current_user, x_session_id)
    cart_resp = CartService.update_cart_item(db, cart, item_id, update_in.quantity)
    return APIResponse(
        success=True,
        data=cart_resp,
        message="Cart updated"
    )


@router.delete("/items/{item_id}", response_model=APIResponse[CartResponse])
def remove_item_from_cart(
    item_id: str,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Removes an item from the cart."""
    cart = _resolve_cart(db, current_user, x_session_id)
    cart_resp = CartService.remove_cart_item(db, cart, item_id)
    return APIResponse(
        success=True,
        data=cart_resp,
        message="Item removed from cart"
    )


@router.delete("", response_model=APIResponse[dict])
def clear_cart(
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Clears all items from the shopping cart."""
    cart = _resolve_cart(db, current_user, x_session_id)
    CartService.clear_cart(db, cart)
    return APIResponse(
        success=True,
        data={"cart_id": cart.id, "cleared": True},
        message="Cart cleared"
    )
