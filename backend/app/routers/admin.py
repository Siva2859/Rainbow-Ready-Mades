from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.order import Order
from app.models.return_exchange import ReturnExchangeRequest
from app.models.inventory import Inventory
from app.models.category import Category
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.schemas.inventory import InventoryUpdate, VariantResponse
from app.schemas.order import OrderResponse, OrderStatusUpdate
from app.schemas.return_exchange import ReturnResponse, ReturnStatusUpdate
from app.schemas.common import APIResponse
from app.services.product_service import ProductService
from app.services.order_service import OrderService
from app.services.return_service import ReturnService
from app.services.seed_service import SeedService

router = APIRouter(prefix="/admin", tags=["Admin Operations"], dependencies=[Depends(require_admin)])


# ------------------------------------------------------------------------------
# 1. Product Management
# ------------------------------------------------------------------------------
@router.post("/products", response_model=APIResponse[ProductResponse], status_code=status.HTTP_201_CREATED)
def admin_create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    """Creates a new garment in the catalog with variants and inventory."""
    prod = ProductService.create_product(db, product_in)
    return APIResponse(success=True, data=prod, message="Product created successfully")


@router.put("/products/{product_id}", response_model=APIResponse[ProductResponse])
def admin_update_product(product_id: str, product_in: ProductUpdate, db: Session = Depends(get_db)):
    """Updates product attributes (pricing, fabric details, description, active status)."""
    prod = ProductService.update_product(db, product_id, product_in)
    return APIResponse(success=True, data=prod, message="Product updated successfully")


@router.delete("/products/{product_id}", response_model=APIResponse[dict])
def admin_delete_product(product_id: str, db: Session = Depends(get_db)):
    """Removes a product from the catalog."""
    ProductService.delete_product(db, product_id)
    return APIResponse(success=True, data={"product_id": product_id, "deleted": True})


# ------------------------------------------------------------------------------
# 2. Category Management
# ------------------------------------------------------------------------------
@router.post("/categories", response_model=APIResponse[CategoryResponse], status_code=status.HTTP_201_CREATED)
def admin_create_category(cat_in: CategoryCreate, db: Session = Depends(get_db)):
    """Creates a new apparel category."""
    existing = db.query(Category).filter(Category.id == cat_in.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category already exists")
    
    category = Category(id=cat_in.id, name=cat_in.name, description=cat_in.description, is_active=cat_in.is_active)
    db.add(category)
    db.commit()
    db.refresh(category)
    return APIResponse(success=True, data=CategoryResponse(
        id=category.id, name=category.name, description=category.description,
        is_active=category.is_active, created_at=category.created_at, product_count=0
    ))


@router.put("/categories/{category_id}", response_model=APIResponse[CategoryResponse])
def admin_update_category(category_id: str, cat_in: CategoryUpdate, db: Session = Depends(get_db)):
    """Updates an apparel category."""
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    if cat_in.name is not None:
        cat.name = cat_in.name
    if cat_in.description is not None:
        cat.description = cat_in.description
    if cat_in.is_active is not None:
        cat.is_active = cat_in.is_active

    db.commit()
    db.refresh(cat)
    return APIResponse(success=True, data=CategoryResponse(
        id=cat.id, name=cat.name, description=cat.description,
        is_active=cat.is_active, created_at=cat.created_at, product_count=len(cat.products)
    ))


# ------------------------------------------------------------------------------
# 3. Inventory Stock Control
# ------------------------------------------------------------------------------
@router.patch("/inventory/{inventory_id}", response_model=APIResponse[VariantResponse])
def admin_update_inventory_stock(inventory_id: str, inv_in: InventoryUpdate, db: Session = Depends(get_db)):
    """Adjusts variant stock quantity."""
    inv = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory record not found")
    
    inv.stock_quantity = inv_in.stock_quantity
    db.commit()
    db.refresh(inv)
    return APIResponse(
        success=True,
        data=VariantResponse(
            id=inv.id, size=inv.size, color=inv.color,
            sku=inv.variant.sku if inv.variant else None, stock_quantity=inv.stock_quantity
        ),
        message=f"Stock updated to {inv.stock_quantity}"
    )


# ------------------------------------------------------------------------------
# 4. Order Management & Fulfillment
# ------------------------------------------------------------------------------
@router.get("/orders", response_model=APIResponse[List[OrderResponse]])
def admin_list_orders(
    status_filter: Optional[str] = Query(None, description="Filter by status e.g. PENDING, CONFIRMED"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Lists all store orders across all customers."""
    query = db.query(Order)
    if status_filter:
        query = query.filter(Order.status == status_filter.upper())
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return APIResponse(success=True, data=[OrderService.format_order_response(o) for o in orders])


@router.patch("/orders/{order_id}/status", response_model=APIResponse[OrderResponse])
def admin_update_order_status(order_id: str, update_in: OrderStatusUpdate, db: Session = Depends(get_db)):
    """
    Transitions order through the fulfillment pipeline:
    PENDING -> CONFIRMED -> PREPARING -> READY -> OUT_FOR_DELIVERY -> DELIVERED / CANCELLED
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Order '{order_id}' not found")
    
    order.status = update_in.status.upper()
    if update_in.notes:
        order.order_notes = f"{order.order_notes or ''}\n[Admin note]: {update_in.notes}".strip()
    
    db.commit()
    db.refresh(order)
    return APIResponse(
        success=True,
        data=OrderService.format_order_response(order),
        message=f"Order status transitioned to {order.status}"
    )


# ------------------------------------------------------------------------------
# 5. Return & Exchange Review
# ------------------------------------------------------------------------------
@router.get("/returns", response_model=APIResponse[List[ReturnResponse]])
def admin_list_returns(
    status_filter: Optional[str] = Query(None, description="REQUESTED, APPROVED, REJECTED, COMPLETED"),
    db: Session = Depends(get_db)
):
    """Lists all customer return and exchange tickets."""
    query = db.query(ReturnExchangeRequest)
    if status_filter:
        query = query.filter(ReturnExchangeRequest.status == status_filter.upper())
    returns = query.order_by(ReturnExchangeRequest.created_at.desc()).all()
    return APIResponse(success=True, data=[ReturnService.format_return_response(r) for r in returns])


@router.patch("/returns/{return_id}/status", response_model=APIResponse[ReturnResponse])
def admin_update_return_status(return_id: str, update_in: ReturnStatusUpdate, db: Session = Depends(get_db)):
    """Approves, rejects, or completes a customer return or exchange ticket."""
    ret = db.query(ReturnExchangeRequest).filter(ReturnExchangeRequest.id == return_id).first()
    if not ret:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Return request '{return_id}' not found")
    
    ret.status = update_in.status.upper()
    if update_in.admin_notes:
        ret.admin_notes = update_in.admin_notes

    db.commit()
    db.refresh(ret)
    return APIResponse(
        success=True,
        data=ReturnService.format_return_response(ret),
        message=f"Return request status updated to {ret.status}"
    )


# ------------------------------------------------------------------------------
# 6. Verified Data Ingestion Trigger
# ------------------------------------------------------------------------------
@router.post("/seed-verified-data", response_model=APIResponse[dict])
def admin_seed_verified_data(db: Session = Depends(get_db)):
    """
    Ingests verified business data from business-data/ directory.
    Strictly ignores placeholder templates. Does NOT inject fake products.
    """
    count = SeedService.import_verified_business_data(db)
    return APIResponse(
        success=True,
        data={"imported_real_products": count},
        message=f"Import completed. Ingested {count} verified garments."
    )
