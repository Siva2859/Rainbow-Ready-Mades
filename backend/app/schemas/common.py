from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Standard success API response envelope matching docs/api-contract.md."""
    success: bool = True
    data: T
    message: Optional[str] = None


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None


class APIErrorResponse(BaseModel):
    """Standard error API response envelope matching docs/api-contract.md."""
    success: bool = False
    error: ErrorDetail
