from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryResponse
from app.schemas.common import APIResponse

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=APIResponse[List[CategoryResponse]])
def list_categories(db: Session = Depends(get_db)):
    """Lists all active apparel categories with product counts."""
    categories = db.query(Category).filter(Category.is_active.is_(True)).all()
    resp_list = []
    for cat in categories:
        resp = CategoryResponse(
            id=cat.id,
            name=cat.name,
            description=cat.description,
            is_active=cat.is_active,
            created_at=cat.created_at,
            product_count=len([p for p in cat.products if p.is_active])
        )
        resp_list.append(resp)

    return APIResponse(success=True, data=resp_list)


@router.get("/{category_id}", response_model=APIResponse[CategoryResponse])
def get_category(category_id: str, db: Session = Depends(get_db)):
    """Retrieves single category details by slug or ID."""
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category '{category_id}' not found"
        )
    return APIResponse(
        success=True,
        data=CategoryResponse(
            id=cat.id,
            name=cat.name,
            description=cat.description,
            is_active=cat.is_active,
            created_at=cat.created_at,
            product_count=len([p for p in cat.products if p.is_active])
        )
    )
