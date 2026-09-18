import os
import json
from pathlib import Path
from fastapi import APIRouter
from app.schemas.common import APIResponse

router = APIRouter(prefix="/store", tags=["Store"])

# Path to store_assets.json
DATA_FILE = Path(__file__).resolve().parents[2] / "data" / "store_assets.json"


@router.get("/assets", response_model=APIResponse[dict])
def get_store_assets():
    """
    Returns verified store images (storefront, interior, model photos).
    Available for frontend Home, About, and Contact sections without touching ProductImage table.
    """
    fallback_data = {
        "store": {
            "storefront_main": "/assets/store/storefront-main.jpg",
            "storefront_alt": "/assets/store/storefront-alt.jpg",
            "interior_1": "/assets/store/store-interior-1.jpg",
            "interior_2": "/assets/store/store-interior-2.jpg"
        },
        "models": [
            "/assets/models/model-red-check-shirt.jpg",
            "/assets/models/model-navy-shirt.jpg",
            "/assets/models/model-white-shirt.jpg",
            "/assets/models/model-maroon-shirt.jpg"
        ],
        "gallery": [
            "/assets/store/storefront-main.jpg",
            "/assets/store/storefront-alt.jpg",
            "/assets/store/store-interior-1.jpg",
            "/assets/store/store-interior-2.jpg"
        ]
    }

    if DATA_FILE.exists():
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            return APIResponse(success=True, data=data)
        except Exception:
            pass

    return APIResponse(success=True, data=fallback_data)
