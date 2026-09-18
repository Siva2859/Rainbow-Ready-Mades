import { apiClient } from '../api/client';

export const storeService = {
  async getStoreAssets() {
    try {
      const res = await apiClient.get('/api/v1/store/assets');
      return res.data;
    } catch {
      // Clean fallback matching store_assets.json
      return {
        store: {
          storefront_main: "/assets/store/storefront-main.jpg",
          storefront_alt: "/assets/store/storefront-alt.jpg",
          interior_1: "/assets/store/store-interior-1.jpg",
          interior_2: "/assets/store/store-interior-2.jpg"
        },
        models: [
          "/assets/models/model-red-check-shirt.jpg",
          "/assets/models/model-navy-shirt.jpg",
          "/assets/models/model-white-shirt.jpg",
          "/assets/models/model-maroon-shirt.jpg"
        ],
        gallery: [
          "/assets/store/storefront-main.jpg",
          "/assets/store/storefront-alt.jpg",
          "/assets/store/store-interior-1.jpg",
          "/assets/store/store-interior-2.jpg"
        ]
      };
    }
  }
};
