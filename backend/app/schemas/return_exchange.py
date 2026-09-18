from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ReturnCreate(BaseModel):
    order_id: str = Field(..., examples=["ord_8841"])
    request_type: str = Field("EXCHANGE", examples=["EXCHANGE"])  # "RETURN" or "EXCHANGE"
    reason: str = Field(..., examples=["SIZE_FIT_ISSUE"])
    customer_note: Optional[str] = Field(None, examples=["Size L is slightly loose, requesting size M in exchange."])
    desired_size: Optional[str] = Field(None, examples=["M"])
    item_id: Optional[str] = Field(None, examples=["ci_101"])


class ReturnResponse(BaseModel):
    return_id: str
    order_id: str
    request_type: str
    status: str
    reason: str
    customer_note: Optional[str] = None
    desired_size: Optional[str] = None
    admin_notes: Optional[str] = None
    message: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ReturnStatusUpdate(BaseModel):
    status: str = Field(..., examples=["APPROVED"])  # REQUESTED, APPROVED, REJECTED, PROCESSING, COMPLETED
    admin_notes: Optional[str] = None
