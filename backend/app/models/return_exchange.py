import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.order import Order, OrderItem


class ReturnExchangeRequest(Base, TimestampMixin):
    __tablename__ = "return_exchange_requests"

    id: Mapped[str] = mapped_column(
        String(50),
        primary_key=True,
        default=lambda: f"ret_{uuid.uuid4().hex[:8]}"
    )
    order_id: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    request_type: Mapped[str] = mapped_column(String(20), nullable=False)  # "RETURN" or "EXCHANGE"
    status: Mapped[str] = mapped_column(
        String(30),
        default="REQUESTED",
        nullable=False,
        index=True
    )  # REQUESTED, APPROVED, REJECTED, PROCESSING, COMPLETED
    reason: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    desired_size: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    admin_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="return_requests")
    order: Mapped["Order"] = relationship("Order", back_populates="return_requests")
    items: Mapped[List["ReturnItem"]] = relationship("ReturnItem", back_populates="return_request", cascade="all, delete-orphan")


class ReturnItem(Base, TimestampMixin):
    __tablename__ = "return_items"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    return_id: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("return_exchange_requests.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    order_item_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("order_items.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    reason_code: Mapped[str] = mapped_column(String(50), nullable=False)
    desired_exchange_size: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Relationships
    return_request: Mapped["ReturnExchangeRequest"] = relationship("ReturnExchangeRequest", back_populates="items")
    order_item: Mapped["OrderItem"] = relationship("OrderItem", back_populates="return_items")
