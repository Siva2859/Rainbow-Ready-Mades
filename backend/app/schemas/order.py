from typing import List, Optional, Union, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class DeliveryAddressSchema(BaseModel):
    street: str = Field(..., examples=["12 Gandhi Road, Near Clock Tower"])
    city: str = Field(..., examples=["Shop Local City"])
    postal_code: str = Field(..., examples=["600001"])
    phone: str = Field(..., examples=["+919876543210"])
    customer_name: Optional[str] = Field(None, examples=["Priya Sharma"])


class OrderCreate(BaseModel):
    delivery_address: Union[str, DeliveryAddressSchema, Dict[str, Any]]
    payment_method: str = Field("CASH_ON_DELIVERY", examples=["CASH_ON_DELIVERY"])
    order_notes: Optional[str] = Field(None, examples=["Please call before delivery"])
    customer_phone: Optional[str] = None
    customer_name: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    title: str
    size: str
    color: str
    quantity: int
    unit_price: float
    total_price: float
    image_url: Optional[str] = None


class TimelineStep(BaseModel):
    status: str
    label: str
    completed: bool
    timestamp: Optional[str] = None


class OrderResponse(BaseModel):
    order_id: str
    tracking_code: str
    status: str
    total_amount: float
    delivery_fee: float
    payment_method: str
    shipping_address: str
    customer_name: str
    customer_phone: str
    order_notes: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse] = []


class OrderTrackingResponse(BaseModel):
    order_id: str
    tracking_code: str
    status: str
    current_stage: str
    timeline: List[TimelineStep] = []
    items: List[OrderItemResponse] = []
    total_amount: float
    shipping_address: str
    created_at: datetime


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., examples=["CONFIRMED"])
    notes: Optional[str] = None
