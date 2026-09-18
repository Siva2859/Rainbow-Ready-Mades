import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ArrowRight, Camera, X } from 'lucide-react';
import { storeService } from '../services/storeService';
import { SHOP_INFO } from '../utils/constants';

export const GalleryPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [storeAssets, setStoreAssets] = useState(null);

  useEffect(() => {
    const loadAssets = async () => {
      const data = await storeService.getStoreAssets();
      setStoreAssets(data);
    };
    loadAssets();
  }, []);

  const galleryItems = [
    {
      url: '/assets/store/storefront-main.jpg',
      title: 'Main Storefront Entrance',
      category: 'store',
      description: 'Physical storefront of Rainbow Ready Mades on 12 Gandhi Road near Clock Tower.'
    },
    {
      url: '/assets/store/storefront-alt.jpg',
      title: 'Storefront Display & Signage',
      category: 'store',
      description: 'Street-facing facade displaying menswear and family apparel.'
    },
    {
      url: '/assets/store/store-interior-1.jpg',
      title: 'Interior Apparel Racks & Fitting Area',
      category: 'store',
      description: 'Extensive inventory of readymade shirts, casuals, and trousers.'
    },
    {
      url: '/assets/store/store-interior-2.jpg',
      title: 'Readymade Garments Section',
      category: 'store',
      description: 'Organized shelves featuring various sizes and colors for convenient browsing.'
    },
    {
      url: '/assets/models/model-navy-shirt.jpg',
      title: "Men's Navy Casual Lookbook",
      category: 'models',
      description: 'Tailored fit navy blue casual shirt made from breathable cotton.'
    },
    {
      url: '/assets/models/model-red-check-shirt.jpg',
      title: "Men's Classic Check Shirt Lookbook",
      category: 'models',
      description: 'Popular everyday check shirt with crisp collar and comfortable drape.'
    },
    {
      url: '/assets/models/model-white-shirt.jpg',
      title: "Men's Crisp White Shirt Lookbook",
      category: 'models',
      description: 'Essential formal and festive white shirt tailored for comfort.'
    },
    {
      url: '/assets/models/model-maroon-shirt.jpg',
      title: "Men's Maroon Festive Shirt Lookbook",
      category: 'models',
      description: 'Rich maroon shade suitable for both celebrations and evening gatherings.'
    },
    {
      url: '/assets/products/floral-shirt-pair-1.jpg',
      title: 'Floral Print Shirt Collection',
      category: 'products',
      description: 'Contemporary printed shirts displayed on store hangers.'
    },
    {
      url: '/assets/products/ultra-club-shirts-1.jpg',
      title: 'Ultra Club Casual Shirts',
      category: 'products',
      description: 'Packaged and hung casual shirts ready for in-store trial or local delivery.'
    },
    {
      url: '/assets/products/dark-check-shirt-pair.jpg',
      title: 'Dark Check Apparel Pair',
      category: 'products',
      description: 'Coordinated check patterns from our latest seasonal arrival.'
    },
    {
      url: '/assets/products/check-shirt-collection.jpg',
      title: 'Men\'s Check Shirt Assortment',
      category: 'products',
      description: 'Varied color palettes available across small to extra-large sizes.'
    }
  ];

  const filteredItems = activeCategory === 'all'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">
          Visual Tour & Lookbook
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900">
          Store Gallery & Apparel Lookbook
        </h1>
        <p className="text-slate-600 text-sm">
          Authentic store photographs, shop interior, and men's apparel lookbooks directly from {SHOP_INFO.name}.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center gap-2 flex-wrap">
        {[
          { id: 'all', label: 'All Photographs' },
          { id: 'store', label: 'Storefront & Interior' },
          { id: 'models', label: 'Lookbook Models' },
          { id: 'products', label: 'Apparel Displays' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
              activeCategory === tab.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map((item, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedPhoto(item)}
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
          >
            <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
              <img
                src={item.url}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = "/assets/store/storefront-main.jpg";
                }}
              />
              <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-3.5 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-slate-900 flex items-center gap-1 shadow">
                  <Eye className="w-3.5 h-3.5" /> View Photo
                </span>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-accent-600 transition">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="capitalize">{item.category}</span>
                <span className="text-accent-600 font-semibold group-hover:underline">Enlarge →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 sm:p-8 flex items-center justify-center animate-in fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-[4/3] bg-slate-100">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="w-full h-full object-contain bg-slate-900"
              />
            </div>

            <div className="p-6 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-slate-900">{selectedPhoto.title}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-100 text-accent-800 capitalize">
                  {selectedPhoto.category}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedPhoto.description}
              </p>
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Link
                  to="/products"
                  className="px-4 py-2 bg-slate-900 hover:bg-accent-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>Shop Similar Garments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
