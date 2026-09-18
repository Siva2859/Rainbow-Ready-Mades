from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class VariantCreate(BaseModel):
    size: str = Field(..., examples=["L"])
    color: str = Field(..., examples=["Indigo Blue"])
    sku: Optional[str] = None
    stock_quantity: int = Field(0, ge=0)


class VariantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    size: str
    color: str
    sku: Optional[str] = None
    stock_quantity: int


class InventoryUpdate(BaseModel):
    stock_quantity: int = Field(..., ge=0, examples=[15])
