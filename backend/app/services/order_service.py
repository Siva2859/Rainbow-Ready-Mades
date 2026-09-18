import uuid
from decimal import Decimal
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.order import Order, OrderItem
from app.models.cart import Cart
from app.models.inventory import Inventory
from app.models.user import User
from app.schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderItemResponse,
    OrderTrackingResponse,
    TimelineStep
)


class OrderService:
    ORDER_STAGES = ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"]

    @staticmethod
    def _format_address(address_val: Any) -> str:
        if isinstance(address_val, dict):
            parts = [
                address_val.get("street", ""),
                address_val.get("city", ""),
                address_val.get("postal_code", "")
            ]
            return ", ".join(p for p in parts if p)
        return str(address_val)

    @staticmethod
    def _build_timeline(current_status: str, created_at) -> List[TimelineStep]:
        """Generates a 4-to-6 stage chronological visual timeline."""
        stage_labels = {
            "PENDING": "Order Placed",
            "CONFIRMED": "Order Confirmed",
            "PREPARING": "Packing Garments",
            "READY": "Ready for Dispatch",
            "OUT_FOR_DELIVERY": "Out for Delivery",
            "DELIVERED": "Delivered to Customer",
            "CANCELLED": "Order Cancelled"
        }

        if current_status == "CANCELLED":
            return [
                TimelineStep(status="PENDING", label="Order Placed", completed=True, timestamp=created_at.isoformat() if created_at else None),
                TimelineStep(status="CANCELLED", label="Order Cancelled", completed=True, timestamp=created_at.isoformat() if created_at else None)
            ]

        # Standard linear flow
        standard_flow = ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"]
        try:
            curr_idx = standard_flow.index(current_status)
        except ValueError:
            curr_idx = 0

        timeline: List[TimelineStep] = []
        for idx, stage in enumerate(standard_flow):
            is_completed = idx <= curr_idx
            timeline.append(TimelineStep(
                status=stage,
                label=stage_labels.get(stage, stage.title()),
                completed=is_completed,
                timestamp=created_at.isoformat() if (is_completed and idx == 0 and created_at) else None
            ))

        return timeline

    @staticmethod
    def format_order_response(order: Order) -> OrderResponse:
        """Converts an Order model to an OrderResponse schema."""
        items: List[OrderItemResponse] = []
        for item in order.items:
            img_url = None
            if item.product and item.product.images:
                for img in sorted(item.product.images, key=lambda x: (not x.is_primary, x.display_order)):
                    img_url = img.image_url
                    break
            
            items.append(OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                title=item.product.title if item.product else "Garment Item",
                size=item.size,
                color=item.color,
                quantity=item.quantity,
                unit_price=float(item.unit_price),
                total_price=float(item.total_price),
                image_url=img_url
            ))

        return OrderResponse(
            order_id=order.id,
            tracking_code=order.tracking_code,
            status=order.status,
            total_amount=float(order.total_amount),
            delivery_fee=float(order.delivery_fee),
            payment_method=order.payment_method,
            shipping_address=order.shipping_address,
            customer_name=order.customer_name,
            customer_phone=order.customer_phone,
            order_notes=order.order_notes,
            created_at=order.created_at,
            items=items
        )

    @staticmethod
    def create_order(db: Session, user: User, order_in: OrderCreate) -> OrderResponse:
        """Atomically validates cart, calculates totals, updates stock, and creates order."""
        cart = db.query(Cart).filter(Cart.user_id == user.id).first()
        if not cart or not cart.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Your shopping cart is empty. Please add items before checking out."
            )

        # 1. Validate items and calculate server-side totals
        total_amount = Decimal("0.00")
        order_items_to_create = []

        for cart_item in cart.items:
            product = cart_item.product
            if not product or not product.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product '{cart_item.product_id}' is no longer available"
                )

            # Stock check
            inv = db.query(Inventory).filter(
                Inventory.product_id == cart_item.product_id,
                Inventory.size == cart_item.size,
                Inventory.color == cart_item.color
            ).first()

            if inv and inv.stock_quantity < cart_item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Not enough stock for '{product.title}' (Size: {cart_item.size}). Available: {inv.stock_quantity}"
                )

            # Verified price directly from database
            unit_price = Decimal(str(product.discount_price if product.discount_price else product.price))
            line_total = unit_price * cart_item.quantity
            total_amount += line_total

            order_items_to_create.append({
                "product_id": product.id,
                "size": cart_item.size,
                "color": cart_item.color,
                "quantity": cart_item.quantity,
                "unit_price": unit_price,
                "total_price": line_total,
                "inventory_ref": inv
            })

        # Delivery fee calculation
        delivery_fee = Decimal("0.00")
        grand_total = total_amount + delivery_fee

        # Generate unique order id & tracking code
        order_id = f"ord_{uuid.uuid4().hex[:8]}"
        tracking_code = f"RRM-TRK-{uuid.uuid4().hex[:6].upper()}"

        customer_phone = order_in.customer_phone or user.phone_number or "N/A"
        customer_name = order_in.customer_name or user.full_name
        address_str = OrderService._format_address(order_in.delivery_address)

        # 2. Create Order
        new_order = Order(
            id=order_id,
            tracking_code=tracking_code,
            user_id=user.id,
            status="PENDING",
            total_amount=grand_total,
            delivery_fee=delivery_fee,
            payment_method=order_in.payment_method,
            shipping_address=address_str,
            customer_name=customer_name,
            customer_phone=customer_phone,
            order_notes=order_in.order_notes
        )
        db.add(new_order)
        db.flush()

        # 3. Create OrderItems and decrement inventory
        for item_data in order_items_to_create:
            oi = OrderItem(
                order_id=new_order.id,
                product_id=item_data["product_id"],
                size=item_data["size"],
                color=item_data["color"],
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                total_price=item_data["total_price"]
            )
            db.add(oi)

            # Decrement inventory
            inv = item_data["inventory_ref"]
            if inv:
                inv.stock_quantity = max(0, inv.stock_quantity - item_data["quantity"])

        # 4. Clear Cart
        for cart_item in list(cart.items):
            db.delete(cart_item)

        db.commit()
        db.refresh(new_order)
        return OrderService.format_order_response(new_order)

    @staticmethod
    def get_user_orders(db: Session, user_id: str) -> List[OrderResponse]:
        """Retrieves order history for an authenticated customer."""
        orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
        return [OrderService.format_order_response(o) for o in orders]

    @staticmethod
    def get_order_by_id(db: Session, order_id: str, user: User) -> OrderResponse:
        """Retrieves a single order ensuring privacy isolation."""
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order '{order_id}' was not found"
            )

        if user.role.upper() != "ADMIN" and order.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to access this order"
            )

        return OrderService.format_order_response(order)

    @staticmethod
    def track_order(db: Session, query_code: str) -> OrderTrackingResponse:
        """Retrieves real-time tracking details and visual timeline by order ID or tracking code."""
        order = db.query(Order).filter(
            (Order.tracking_code == query_code) | (Order.id == query_code)
        ).first()

        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No order found matching tracking identifier '{query_code}'"
            )

        timeline = OrderService._build_timeline(order.status, order.created_at)
        formatted_order = OrderService.format_order_response(order)

        return OrderTrackingResponse(
            order_id=order.id,
            tracking_code=order.tracking_code,
            status=order.status,
            current_stage=order.status.replace("_", " ").title(),
            timeline=timeline,
            items=formatted_order.items,
            total_amount=formatted_order.total_amount,
            shipping_address=order.shipping_address,
            created_at=order.created_at
        )
