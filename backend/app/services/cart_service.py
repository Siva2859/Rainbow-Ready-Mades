from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.inventory import Inventory
from app.schemas.cart import CartItemCreate, CartResponse, CartItemResponse


class CartService:
    @staticmethod
    def get_or_create_cart(db: Session, user_id: Optional[str] = None, session_id: Optional[str] = None) -> Cart:
        """Finds or creates a shopping cart for an authenticated user or guest session."""
        cart = None
        if user_id:
            cart = db.query(Cart).filter(Cart.user_id == user_id).first()
            if not cart:
                cart = Cart(user_id=user_id)
                db.add(cart)
                db.commit()
                db.refresh(cart)
        elif session_id:
            cart = db.query(Cart).filter(Cart.session_id == session_id).first()
            if not cart:
                cart = Cart(session_id=session_id)
                db.add(cart)
                db.commit()
                db.refresh(cart)
        else:
            cart = Cart()
            db.add(cart)
            db.commit()
            db.refresh(cart)
            
        return cart

    @staticmethod
    def format_cart_response(cart: Cart) -> CartResponse:
        """Formats a Cart model into a validated CartResponse calculating real prices."""
        items: list[CartItemResponse] = []
        subtotal = 0.0

        for item in cart.items:
            product = item.product
            if not product or not product.is_active:
                continue
            
            # Use real verified price (discount_price if available, else standard price)
            unit_price = float(product.discount_price if product.discount_price else product.price)
            item_total = unit_price * item.quantity
            subtotal += item_total

            # Primary image
            image_url = None
            if product.images:
                for img in sorted(product.images, key=lambda x: (not x.is_primary, x.display_order)):
                    image_url = img.image_url
                    break

            items.append(CartItemResponse(
                item_id=item.id,
                product_id=product.id,
                title=product.title,
                selected_size=item.size,
                selected_color=item.color,
                unit_price=unit_price,
                quantity=item.quantity,
                total_item_price=item_total,
                image_url=image_url
            ))

        # Delivery fee calculation (Free above ₹999, else 0 for MVP)
        delivery_fee = 0.0
        total = subtotal + delivery_fee

        return CartResponse(
            cart_id=cart.id,
            items=items,
            subtotal=round(subtotal, 2),
            delivery_fee=round(delivery_fee, 2),
            total=round(total, 2)
        )

    @staticmethod
    def add_item_to_cart(db: Session, cart: Cart, item_in: CartItemCreate) -> CartResponse:
        """Adds an item to cart or increments quantity after verifying inventory."""
        # 1. Verify product
        product = db.query(Product).filter(Product.id == item_in.product_id, Product.is_active.is_(True)).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product '{item_in.product_id}' was not found or is inactive"
            )

        # 2. Verify inventory
        inv = db.query(Inventory).filter(
            Inventory.product_id == item_in.product_id,
            Inventory.size == item_in.selected_size,
            Inventory.color == item_in.selected_color
        ).first()

        # If inventory record exists, check available stock
        available_stock = inv.stock_quantity if inv else 10
        if inv and available_stock < item_in.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for size {item_in.selected_size} ({available_stock} remaining)"
            )

        # 3. Check if existing item in cart
        existing_item = db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == item_in.product_id,
            CartItem.size == item_in.selected_size,
            CartItem.color == item_in.selected_color
        ).first()

        if existing_item:
            new_qty = existing_item.quantity + item_in.quantity
            if inv and available_stock < new_qty:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot add {item_in.quantity} more. Only {available_stock} in stock."
                )
            existing_item.quantity = new_qty
        else:
            new_item = CartItem(
                cart_id=cart.id,
                product_id=item_in.product_id,
                size=item_in.selected_size,
                color=item_in.selected_color,
                quantity=item_in.quantity
            )
            db.add(new_item)

        db.commit()
        db.refresh(cart)
        return CartService.format_cart_response(cart)

    @staticmethod
    def update_cart_item(db: Session, cart: Cart, item_id: str, quantity: int) -> CartResponse:
        """Updates the quantity of a cart item."""
        item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found"
            )

        # Check inventory
        inv = db.query(Inventory).filter(
            Inventory.product_id == item.product_id,
            Inventory.size == item.size,
            Inventory.color == item.color
        ).first()

        if inv and inv.stock_quantity < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {inv.stock_quantity} available in stock for this variant."
            )

        item.quantity = quantity
        db.commit()
        db.refresh(cart)
        return CartService.format_cart_response(cart)

    @staticmethod
    def remove_cart_item(db: Session, cart: Cart, item_id: str) -> CartResponse:
        """Removes an item from cart."""
        item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found"
            )
        db.delete(item)
        db.commit()
        db.refresh(cart)
        return CartService.format_cart_response(cart)

    @staticmethod
    def clear_cart(db: Session, cart: Cart) -> None:
        """Empties all items from the cart."""
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
