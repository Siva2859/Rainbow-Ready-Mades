from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from fastapi import HTTPException, status

from app.models.product import Product, ProductImage
from app.models.category import Category
from app.models.inventory import Inventory, ProductVariant
from app.schemas.product import ProductResponse, ProductDetailResponse, ProductCreate, ProductUpdate


class ProductService:
    @staticmethod
    def format_product_response(product: Product) -> ProductResponse:
        """Converts a Product model instance into a clean contract-compliant ProductResponse."""
        # Calculate stock and available sizes/colors
        total_stock = sum(inv.stock_quantity for inv in product.inventory) if product.inventory else 0
        in_stock = total_stock > 0

        # Unique sizes and colors preserving order
        sizes = list(dict.fromkeys(inv.size for inv in product.inventory if inv.size))
        colors = list(dict.fromkeys(inv.color for inv in product.inventory if inv.color))

        # Fallback to variants if inventory table is empty
        if not sizes and product.variants:
            sizes = list(dict.fromkeys(v.size for v in product.variants if v.size))
        if not colors and product.variants:
            colors = list(dict.fromkeys(v.color for v in product.variants if v.color))

        # Determine primary image URL and all images
        primary_img = None
        images = []
        if product.images:
            sorted_imgs = sorted(product.images, key=lambda x: (not x.is_primary, x.display_order))
            primary_img = sorted_imgs[0].image_url
            images = [img.image_url for img in sorted_imgs]
        
        category_name = product.category.name if product.category else product.category_id

        return ProductResponse(
            id=product.id,
            title=product.title,
            name=product.title,
            category=category_name,
            category_id=product.category_id,
            price=float(product.price),
            discount_price=float(product.discount_price) if product.discount_price else None,
            material=product.material,
            primary_image_url=primary_img,
            images=images,
            in_stock=in_stock,
            stock_count=total_stock,
            sizes=sizes,
            colors=colors,
            is_featured=product.is_featured,
            created_at=product.created_at
        )

    @staticmethod
    def format_product_detail_response(product: Product) -> ProductDetailResponse:
        """Converts a Product model instance into a ProductDetailResponse with all gallery images."""
        base_resp = ProductService.format_product_response(product)
        data = base_resp.model_dump()
        data["description"] = product.description
        data["care_instructions"] = product.care_instructions
        data["images"] = [img.image_url for img in sorted(product.images, key=lambda x: (not x.is_primary, x.display_order))]
        data["verified_at"] = product.created_at.strftime("%Y-%m-%d") if product.created_at else None
        
        return ProductDetailResponse(**data)

    @staticmethod
    def get_products(
        db: Session,
        category: Optional[str] = None,
        search: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        in_stock_only: Optional[bool] = None,
        size: Optional[str] = None,
        color: Optional[str] = None,
        featured_only: Optional[bool] = None,
        sort: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[ProductResponse]:
        """Retrieves and filters products according to query parameters."""
        query = db.query(Product).filter(Product.is_active.is_(True))

        # Category filter (by id or name)
        if category:
            query = query.join(Product.category).filter(
                or_(
                    Product.category_id == category,
                    Category.id == category,
                    func.lower(Category.name) == category.lower()
                )
            )

        # Keyword search on title, description, material
        if search:
            search_term = f"%{search.lower()}%"
            query = query.filter(
                or_(
                    func.lower(Product.title).like(search_term),
                    func.lower(Product.description).like(search_term),
                    func.lower(Product.material).like(search_term)
                )
            )

        # Price range filter
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)

        # Featured filter
        if featured_only:
            query = query.filter(Product.is_featured.is_(True))

        # Size and Color filter via inventory
        if size or color or (in_stock_only is True):
            query = query.join(Product.inventory)
            if size:
                query = query.filter(func.lower(Inventory.size) == size.lower())
            if color:
                query = query.filter(func.lower(Inventory.color) == color.lower())
            if in_stock_only:
                query = query.filter(Inventory.stock_quantity > 0)

        # Distinct products
        query = query.distinct()

        # Sorting
        if sort == "price_asc":
            query = query.order_by(Product.price.asc())
        elif sort == "price_desc":
            query = query.order_by(Product.price.desc())
        elif sort == "newest":
            query = query.order_by(Product.created_at.desc())
        else:
            query = query.order_by(Product.is_featured.desc(), Product.created_at.desc())

        products = query.offset(skip).limit(limit).all()
        return [ProductService.format_product_response(p) for p in products]

    @staticmethod
    def get_product_by_id(db: Session, product_id: str) -> ProductDetailResponse:
        """Fetches product detail by ID or raises 404."""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID '{product_id}' was not found"
            )
        return ProductService.format_product_detail_response(product)

    @staticmethod
    def create_product(db: Session, product_in: ProductCreate) -> ProductResponse:
        """Admin helper: creates a new product and initial inventory."""
        import uuid
        prod_id = product_in.id or f"prod_{uuid.uuid4().hex[:6]}"
        
        # Verify category
        category = db.query(Category).filter(Category.id == product_in.category_id).first()
        if not category:
            # Auto-create category if missing for convenience
            category = Category(id=product_in.category_id, name=product_in.category_id.replace("-", " ").title())
            db.add(category)
            db.flush()

        product = Product(
            id=prod_id,
            category_id=category.id,
            title=product_in.title,
            description=product_in.description,
            price=product_in.price,
            discount_price=product_in.discount_price,
            material=product_in.material,
            care_instructions=product_in.care_instructions,
            is_featured=product_in.is_featured,
            is_active=product_in.is_active
        )
        db.add(product)
        db.flush()

        # Add images
        if product_in.images:
            for idx, img_url in enumerate(product_in.images):
                img = ProductImage(
                    product_id=product.id,
                    image_url=img_url,
                    is_primary=(idx == 0),
                    display_order=idx
                )
                db.add(img)

        # Add variants and inventory
        sizes = product_in.sizes or ["M"]
        colors = product_in.colors or ["Default"]
        stock_per_variant = max(1, (product_in.initial_stock or 10) // (len(sizes) * len(colors)))

        for size in sizes:
            for color in colors:
                variant = ProductVariant(
                    product_id=product.id,
                    size=size,
                    color=color
                )
                db.add(variant)
                db.flush()

                inv = Inventory(
                    product_id=product.id,
                    variant_id=variant.id,
                    size=size,
                    color=color,
                    stock_quantity=stock_per_variant
                )
                db.add(inv)

        db.commit()
        db.refresh(product)
        return ProductService.format_product_response(product)

    @staticmethod
    def update_product(db: Session, product_id: str, product_in: ProductUpdate) -> ProductResponse:
        """Admin helper: updates an existing product."""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product '{product_id}' not found"
            )

        update_data = product_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(product, key, value)

        db.commit()
        db.refresh(product)
        return ProductService.format_product_response(product)

    @staticmethod
    def delete_product(db: Session, product_id: str) -> None:
        """Admin helper: deletes a product."""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product '{product_id}' not found"
            )
        db.delete(product)
        db.commit()
