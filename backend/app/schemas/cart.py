from typing import List, Optional
from pydantic import BaseModel, Field


class CartItemCreate(BaseModel):
    product_id: str = Field(..., examples=["prod_001"])
    selected_size: str = Field(..., examples=["L"])
    selected_color: str = Field(..., examples=["Indigo Blue"])
    quantity: int = Field(1, ge=1, le=100, examples=[1])


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1, le=100, examples=[2])


class CartItemResponse(BaseModel):
    item_id: str
    product_id: str
    title: str
    selected_size: str
    selected_color: str
    unit_price: float
    quantity: int
    total_item_price: float
    image_url: Optional[str] = None


class CartResponse(BaseModel):
    cart_id: str
    items: List[CartItemResponse] = []
    subtotal: float
    delivery_fee: float = 0.0
    total: float
