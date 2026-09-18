import os
import json
import logging
from decimal import Decimal
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User
from app.models.category import Category
from app.models.product import Product, ProductImage
from app.models.inventory import ProductVariant, Inventory

logger = logging.getLogger(__name__)


class SeedService:
    @staticmethod
    def seed_initial_admin(db: Session) -> User:
        """Seeds the default admin user if one does not already exist."""
        admin = db.query(User).filter(User.email == settings.ADMIN_INITIAL_EMAIL.lower()).first()
        if not admin:
            admin = User(
                email=settings.ADMIN_INITIAL_EMAIL.lower(),
                full_name="Rainbow Ready Mades Admin",
                hashed_password=get_password_hash(settings.ADMIN_INITIAL_PASSWORD),
                phone_number="+919876543210",
                role="ADMIN",
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            logger.info(f"Seeded initial admin user: {admin.email}")
        return admin

    @staticmethod
    def seed_default_categories(db: Session):
        """Initializes standard retail garment categories for Rainbow Ready Mades."""
        categories = [
            {"id": "womens-ethnic", "name": "Women's Ethnic", "description": "Sarees, Kurtis, Salwar Suits & Festive Wear"},
            {"id": "mens-formal", "name": "Men's Formal", "description": "Linen Shirts, Cotton Trousers & Blazers"},
            {"id": "mens-casual", "name": "Men's Casual", "description": "Polo T-shirts, Casual Shirts & Jeans"},
            {"id": "kids-wear", "name": "Kids' Festive & Casual", "description": "Comfortable readymade ethnic & daily wear for children"},
        ]
        for cat in categories:
            existing = db.query(Category).filter(Category.id == cat["id"]).first()
            if not existing:
                db.add(Category(**cat))
        db.commit()

    @staticmethod
    def import_verified_business_data(db: Session, business_data_dir: str = "../business-data") -> int:
        """
        Ingests authentic verified product JSON files from business-data/products/
        Ignoring template files. Does NOT inject fake data.
        """
        products_dir = os.path.join(business_data_dir, "products")
        if not os.path.exists(products_dir):
            return 0

        imported_count = 0
        for filename in os.listdir(products_dir):
            if filename.endswith(".json") and "template" not in filename.lower():
                filepath = os.path.join(products_dir, filename)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        data = json.load(f)

                    prod_id = data.get("product_id")
                    if not prod_id or prod_id.startswith("ENTER_"):
                        continue  # Skip unpopulated templates

                    # Check if already in DB
                    existing = db.query(Product).filter(Product.id == prod_id).first()
                    if existing:
                        continue

                    # Ensure category
                    category_id = data.get("category", "womens-ethnic").lower().replace(" ", "-")
                    category = db.query(Category).filter(Category.id == category_id).first()
                    if not category:
                        category = Category(id=category_id, name=data.get("category", "Apparel"))
                        db.add(category)
                        db.flush()

                    product = Product(
                        id=prod_id,
                        category_id=category.id,
                        title=data.get("product_name", "Garment"),
                        description=data.get("description", ""),
                        price=Decimal(str(data.get("price", 0.0))),
                        discount_price=Decimal(str(data["discount"])) if data.get("discount") else None,
                        material=data.get("material", "Cotton"),
                        care_instructions=data.get("care_instructions", ""),
                        is_featured=True,
                        is_active=True
                    )
                    db.add(product)
                    db.flush()

                    # Add image
                    if data.get("image"):
                        img = ProductImage(
                            product_id=product.id,
                            image_url=data["image"],
                            is_primary=True,
                            display_order=0
                        )
                        db.add(img)

                    # Add sizes and stock
                    sizes = data.get("sizes", ["M", "L"])
                    colors = data.get("colors", ["Standard"])
                    total_stock = int(data.get("stock", 10))
                    variant_stock = max(1, total_stock // max(1, len(sizes) * len(colors)))

                    for s in sizes:
                        for c in colors:
                            var = ProductVariant(product_id=product.id, size=s, color=c)
                            db.add(var)
                            db.flush()

                            inv = Inventory(product_id=product.id, variant_id=var.id, size=s, color=c, stock_quantity=variant_stock)
                            db.add(inv)

                    imported_count += 1
                except Exception as e:
                    logger.warning(f"Failed to import verified product from {filename}: {e}")

        db.commit()
        return imported_count
