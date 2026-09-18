from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.inventory import Inventory
from app.models.product import Product
from app.schemas.inventory import VariantResponse
from app.schemas.common import APIResponse

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("/{product_id}", response_model=APIResponse[List[VariantResponse]])
def get_product_inventory(product_id: str, db: Session = Depends(get_db)):
    """Retrieves size, color, and real-time stock levels for a product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product '{product_id}' not found"
        )

    inventories = db.query(Inventory).filter(Inventory.product_id == product_id).all()
    resp = [
        VariantResponse(
            id=inv.id,
            size=inv.size,
            color=inv.color,
            sku=inv.variant.sku if inv.variant else None,
            stock_quantity=inv.stock_quantity
        )
        for inv in inventories
    ]
    return APIResponse(success=True, data=resp)
