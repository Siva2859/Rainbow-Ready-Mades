"""
Data loaders for Rainbow Ready Mades business data.
Extracts verified information from products, shop-info, policies, and FAQs.
Excludes empty template placeholders.
"""

from pathlib import Path
import json
import re
from typing import List, Dict, Any


def is_template_or_placeholder(val: Any) -> bool:
    """Check if value is an unfilled template placeholder."""
    if isinstance(val, str):
        return "ENTER_" in val or "[ENTER" in val or "YYYY-MM-DD" in val
    return False


def load_products(products_dir: Path) -> List[Dict[str, Any]]:
    """
    Load verified product catalog JSON files.
    Skips template files and unpopulated entries.
    """
    docs = []
    if not products_dir.exists():
        return docs

    for file_path in products_dir.glob("*.json"):
        if "template" in file_path.name.lower():
            continue
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            if isinstance(data, list):
                items = data
            else:
                items = [data]

            for item in items:
                if is_template_or_placeholder(item.get("product_name", "")) or is_template_or_placeholder(item.get("product_id", "")):
                    continue

                prod_id = item.get("product_id", file_path.stem)
                name = item.get("product_name", "Unknown Garment")
                category = item.get("category", "General")
                price = item.get("price", 0.0)
                orig_price = item.get("original_price")
                sizes = ", ".join(item.get("sizes", []))
                colors = ", ".join(item.get("colors", []))
                material = item.get("material", "Cotton")
                desc = item.get("description", "")
                care = item.get("care_instructions", "")
                stock = item.get("stock", 0)
                availability = "In Stock" if stock > 0 else "Out of Stock"

                content = (
                    f"Product Name: {name}\n"
                    f"Product ID: {prod_id}\n"
                    f"Category: {category}\n"
                    f"Price: ₹{price:g}"
                    + (f" (Original Price: ₹{orig_price:g})" if orig_price else "") + "\n"
                    f"Availability: {availability} ({stock} units currently on rack)\n"
                    f"Available Sizes: {sizes}\n"
                    f"Available Colors: {colors}\n"
                    f"Fabric & Material: {material}\n"
                    f"Description: {desc}\n"
                    f"Washing & Care Instructions: {care}"
                )

                docs.append({
                    "id": f"prod_{prod_id}",
                    "content": content,
                    "metadata": {
                        "type": "product",
                        "product_id": prod_id,
                        "product_name": name,
                        "category": category,
                        "price": float(price),
                        "source": str(file_path.relative_to(file_path.parents[2])).replace("\\", "/"),
                        "date_verified": item.get("date_verified", "2026-09-18")
                    }
                })
        except Exception as e:
            print(f"Warning: Failed to load product file {file_path}: {e}")

    return docs


def load_shop_info(shop_info_dir: Path) -> List[Dict[str, Any]]:
    """
    Load shop operational coordinates, timings, address, and contact numbers.
    """
    docs = []
    if not shop_info_dir.exists():
        return docs

    for file_path in shop_info_dir.glob("*.json"):
        if "template" in file_path.name.lower():
            continue
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            if is_template_or_placeholder(data.get("address", "")) or is_template_or_placeholder(data.get("phone", "")):
                continue

            shop_name = data.get("shop_name", "Rainbow Ready Mades")
            address = data.get("address", "")
            landmark = data.get("landmark", "")
            city = data.get("city", "")
            phone = data.get("phone", "")
            whatsapp = data.get("whatsapp", "")
            hours = data.get("opening_hours", {})
            mon_sat = hours.get("monday_to_saturday", "10:00 AM to 09:00 PM")
            sun = hours.get("sunday", "11:00 AM to 08:00 PM")
            delivery_areas = ", ".join(data.get("delivery_areas", []))
            radius = data.get("delivery_radius_km", 15)
            delivery_terms = data.get("delivery_terms", "")
            payment_methods = ", ".join(data.get("payment_methods", []))
            return_summary = data.get("return_policy_summary", "")
            alter_summary = data.get("alteration_summary", "")

            # Shop Overview chunk
            overview_content = (
                f"Shop Name: {shop_name}\n"
                f"Physical Address: {address}, {landmark}, {city}, Postal Code: {data.get('postal_code', '600001')}\n"
                f"Phone Contact: {phone}\n"
                f"WhatsApp Contact: {whatsapp}\n"
                f"Store Timings: Monday to Saturday: {mon_sat}; Sunday: {sun}\n"
                f"Accepted Payment Methods: {payment_methods}"
            )
            docs.append({
                "id": "shop_overview",
                "content": overview_content,
                "metadata": {
                    "type": "shop_info",
                    "subtype": "overview",
                    "source": str(file_path.relative_to(file_path.parents[2])).replace("\\", "/"),
                    "date_verified": data.get("date_verified", "2026-09-18")
                }
            })

            # Delivery & Shipping chunk
            delivery_content = (
                f"Shop Name: {shop_name}\n"
                f"Delivery Coverage Radius: Up to {radius} km from physical shop at {address}\n"
                f"Covered Local Areas: {delivery_areas}\n"
                f"Delivery Terms & Fees: {delivery_terms}\n"
                f"Pickup Option: In-Store Pickup available at no charge during opening hours ({mon_sat})"
            )
            docs.append({
                "id": "shop_delivery",
                "content": delivery_content,
                "metadata": {
                    "type": "shop_info",
                    "subtype": "delivery",
                    "source": str(file_path.relative_to(file_path.parents[2])).replace("\\", "/"),
                    "date_verified": data.get("date_verified", "2026-09-18")
                }
            })

            # Services & Summary chunk
            services_content = (
                f"Shop Name: {shop_name}\n"
                f"Return & Exchange Policy Summary: {return_summary}\n"
                f"Tailoring & Alteration Service: {alter_summary}"
            )
            docs.append({
                "id": "shop_services",
                "content": services_content,
                "metadata": {
                    "type": "shop_info",
                    "subtype": "services",
                    "source": str(file_path.relative_to(file_path.parents[2])).replace("\\", "/"),
                    "date_verified": data.get("date_verified", "2026-09-18")
                }
            })
        except Exception as e:
            print(f"Warning: Failed to load shop info file {file_path}: {e}")

    return docs


def load_policies(policies_dir: Path) -> List[Dict[str, Any]]:
    """
    Load markdown store policies and split by section.
    """
    docs = []
    if not policies_dir.exists():
        return docs

    for file_path in policies_dir.glob("*.md"):
        if "template" in file_path.name.lower() or "readme" in file_path.name.lower():
            continue
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()

            if is_template_or_placeholder(text):
                continue

            # Split markdown by H2 (##)
            sections = re.split(r"\n(?=##\s+)", text)
            for idx, section in enumerate(sections):
                cleaned = section.strip()
                if not cleaned:
                    continue
                # Extract title
                match = re.match(r"^##\s+(.+)$", cleaned, re.MULTILINE)
                section_title = match.group(1).strip() if match else f"Policy Section {idx+1}"
                
                doc_id = f"policy_{re.sub(r'[^a-zA-Z0-9_]', '_', section_title.lower())[:30]}"
                docs.append({
                    "id": doc_id,
                    "content": cleaned,
                    "metadata": {
                        "type": "policy",
                        "section": section_title,
                        "source": str(file_path.relative_to(file_path.parents[2])).replace("\\", "/"),
                        "date_verified": "2026-09-18"
                    }
                })
        except Exception as e:
            print(f"Warning: Failed to load policy file {file_path}: {e}")

    return docs


def load_faqs(faq_dir: Path) -> List[Dict[str, Any]]:
    """
    Load verified customer FAQs.
    """
    docs = []
    if not faq_dir.exists():
        return docs

    for file_path in faq_dir.glob("*.json"):
        if "template" in file_path.name.lower():
            continue
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            if isinstance(data, dict):
                items = [data]
            elif isinstance(data, list):
                items = data
            else:
                items = []

            for item in items:
                q = item.get("question", "").strip()
                ans = item.get("verified_answer", "").strip()
                if not q or not ans or is_template_or_placeholder(q) or is_template_or_placeholder(ans):
                    continue

                faq_id = item.get("faq_id", f"faq_{len(docs)+1}")
                category = item.get("category", "GENERAL")

                content = (
                    f"Frequently Asked Question: {q}\n"
                    f"Verified Store Answer: {ans}\n"
                    f"Category: {category}"
                )

                docs.append({
                    "id": f"faq_{faq_id}",
                    "content": content,
                    "metadata": {
                        "type": "faq",
                        "faq_id": faq_id,
                        "question": q,
                        "category": category,
                        "source": str(file_path.relative_to(file_path.parents[2])).replace("\\", "/"),
                        "date_verified": item.get("date_verified", "2026-09-18")
                    }
                })
        except Exception as e:
            print(f"Warning: Failed to load FAQ file {file_path}: {e}")

    return docs


def load_all_business_data(data_root: Path) -> List[Dict[str, Any]]:
    """
    Ingest all verified business data from products, shop-info, policies, and faqs.
    """
    all_docs = []
    all_docs.extend(load_shop_info(data_root / "shop-info"))
    all_docs.extend(load_policies(data_root / "policies"))
    all_docs.extend(load_products(data_root / "products"))
    all_docs.extend(load_faqs(data_root / "faq"))
    return all_docs
