from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.product import ProductResponse, ProductDetailResponse
from app.schemas.common import APIResponse
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=APIResponse[List[ProductResponse]])
def list_products(
    category: Optional[str] = Query(None, description="Category slug or name e.g. 'womens-ethnic'"),
    search: Optional[str] = Query(None, description="Search keyword in title, material, or description"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    in_stock: Optional[bool] = Query(None, description="Filter only in-stock items"),
    size: Optional[str] = Query(None, description="Garment size e.g. 'L', 'XL'"),
    color: Optional[str] = Query(None, description="Color e.g. 'Indigo Blue'"),
    featured: Optional[bool] = Query(None, description="Filter featured products"),
    sort: Optional[str] = Query(None, description="'price_asc', 'price_desc', 'newest'"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Catalog browsing with multi-attribute filtering.
    Fully unblocks React frontend catalog view.
    """
    products = ProductService.get_products(
        db=db,
        category=category,
        search=search,
        min_price=min_price,
        max_price=max_price,
        in_stock_only=in_stock,
        size=size,
        color=color,
        featured_only=featured,
        sort=sort,
        skip=skip,
        limit=limit
    )
    return APIResponse(success=True, data=products)


@router.get("/search", response_model=APIResponse[List[ProductResponse]])
def search_products(
    q: str = Query(..., min_length=1, description="Keyword search query"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Convenience search endpoint matching GET /api/v1/products/search."""
    products = ProductService.get_products(
        db=db,
        search=q,
        skip=skip,
        limit=limit
    )
    return APIResponse(success=True, data=products)


@router.get("/{product_id}", response_model=APIResponse[ProductDetailResponse])
def get_product(product_id: str, db: Session = Depends(get_db)):
    """Fetches complete garment specifications, size matrix, and gallery image URLs."""
    product_detail = ProductService.get_product_by_id(db, product_id)
    return APIResponse(success=True, data=product_detail)
