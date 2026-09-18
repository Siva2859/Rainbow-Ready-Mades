from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ProductImageSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    image_url: str
    is_primary: bool
    display_order: int


class ProductBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200, examples=["Pure Cotton Embroidered Anarkali Kurti"])
    category_id: str = Field(..., examples=["womens-ethnic"])
    description: str = Field(..., min_length=5, examples=["Authentic hand-embroidered kurti designed for daily and festive wear."])
    price: Decimal = Field(..., gt=0, examples=[1299.00])
    discount_price: Optional[Decimal] = Field(None, gt=0, examples=[1099.00])
    material: str = Field(..., examples=["100% Breathable Cotton"])
    care_instructions: Optional[str] = Field(None, examples=["Hand wash in cold water. Do not bleach."])
    is_featured: bool = False
    is_active: bool = True


class ProductCreate(ProductBase):
    id: Optional[str] = None  # If not provided, generates automatically
    images: Optional[List[str]] = []
    sizes: Optional[List[str]] = ["M", "L", "XL"]
    colors: Optional[List[str]] = ["Indigo Blue"]
    initial_stock: Optional[int] = 10


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    category_id: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    discount_price: Optional[Decimal] = None
    material: Optional[str] = None
    care_instructions: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    name: Optional[str] = None
    category: str
    category_id: str
    price: float
    discount_price: Optional[float] = None
    material: str
    primary_image_url: Optional[str] = None
    images: List[str] = []
    in_stock: bool
    stock_count: int
    sizes: List[str] = []
    colors: List[str] = []
    is_featured: bool
    created_at: datetime


class ProductDetailResponse(ProductResponse):
    description: str
    care_instructions: Optional[str] = None
    images: List[str] = []
    verified_at: Optional[str] = None
