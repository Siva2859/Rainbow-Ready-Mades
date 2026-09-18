import uuid
from typing import Optional, TYPE_CHECKING
from decimal import Decimal
from sqlalchemy import String, Numeric, Integer, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.product import Product


class ProductVariant(Base, TimestampMixin):
    __tablename__ = "product_variants"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    product_id: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    size: Mapped[str] = mapped_column(String(20), nullable=False)    # e.g., "S", "M", "L", "XL", "38", "42"
    color: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g., "Indigo Blue", "Maroon"
    sku: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    price_override: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)

    __table_args__ = (
        UniqueConstraint("product_id", "size", "color", name="uq_product_variant_size_color"),
    )

    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="variants")
    inventory: Mapped[Optional["Inventory"]] = relationship("Inventory", back_populates="variant", uselist=False, cascade="all, delete-orphan")


class Inventory(Base, TimestampMixin):
    __tablename__ = "inventory"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    product_id: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    variant_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("product_variants.id", ondelete="SET NULL"),
        nullable=True
    )
    size: Mapped[str] = mapped_column(String(20), nullable=False)
    color: Mapped[str] = mapped_column(String(50), nullable=False)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    __table_args__ = (
        CheckConstraint("stock_quantity >= 0", name="chk_inventory_stock_non_negative"),
        UniqueConstraint("product_id", "size", "color", name="uq_inventory_product_size_color"),
    )

    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="inventory")
    variant: Mapped[Optional["ProductVariant"]] = relationship("ProductVariant", back_populates="inventory")
