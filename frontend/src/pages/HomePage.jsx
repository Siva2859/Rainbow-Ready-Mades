import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Truck, RefreshCw, ShieldCheck, CreditCard, Sparkles, MapPin, Eye } from 'lucide-react';
import { productService } from '../services/productService';
import { storeService } from '../services/storeService';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import { SHOP_INFO } from '../utils/constants';

export const HomePage = ({ onOpenChat }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [storeAssets, setStoreAssets] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [prods, assets] = await Promise.allSettled([
          productService.getProducts({ limit: 8 }),
          storeService.getStoreAssets()
        ]);

        if (prods.status === 'fulfilled') {
          setFeaturedProducts(prods.value || []);
        }
        if (assets.status === 'fulfilled') {
          setStoreAssets(assets.value);
        }
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand-navy text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 shadow-2xl">
        {/* Background gradient & decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent-600/20 via-transparent to-transparent"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-24 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-accent-300">
              <Sparkles className="w-3.5 h-3.5 text-accent-400" />
              <span>Verified Retail Collection • 10-Day Returns</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
              Quality Menswear & <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-amber-300 to-white">
                Everyday Readymades
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed mx-auto lg:mx-0">
              Discover authentic readymade garments from <strong>{SHOP_INFO.name}</strong>. From premium cotton formal shirts and printed casual wear to festive kurtas — directly sourced from our local shop racks.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                to="/products"
                className="px-6 py-3.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-slate-950 font-bold text-sm shadow-lg shadow-accent-500/25 transition-all flex items-center justify-center gap-2 group"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Collections</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/gallery"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/10 backdrop-blur-md transition flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>View Store Gallery</span>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <Truck className="w-4 h-4 text-accent-400 shrink-0" />
                <span>10 km Local Delivery</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <RefreshCw className="w-4 h-4 text-accent-400 shrink-0" />
                <span>10-Day Exchanges</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start col-span-2 sm:col-span-1">
                <ShieldCheck className="w-4 h-4 text-accent-400 shrink-0" />
                <span>Verified Pricing</span>
              </div>
            </div>
          </div>

          {/* Hero Right Visual: Real store model photograph */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
              <img
                src={storeAssets?.models?.[1] || "/assets/models/model-navy-shirt.jpg"}
                alt="Rainbow Ready Mades Men's Collection"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.target.src = "/assets/store/storefront-main.jpg";
                }}
              />
              {/* Overlay Glass Card */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-brand-navy/85 backdrop-blur-md border border-white/15 text-white text-xs">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-accent-300 uppercase tracking-wider font-bold">Featured Lookbook</span>
                    <h2 className="font-bold text-sm text-white">Rainbow Ready Mades</h2>
                  </div>
                  <Link
                    to="/products"
                    className="px-3 py-1.5 bg-accent-500 hover:bg-accent-600 text-slate-950 font-bold text-[11px] rounded-lg transition"
                  >
                    Explore
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">
              From Our Store Racks
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mt-1">
              Featured Readymade Garments
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real inventory with verified sizing, fabric details, and pricing.
            </p>
          </div>

          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-accent-600 hover:text-accent-700 flex items-center gap-1 group"
          >
            <span>View Complete Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <ProductGrid
            products={featuredProducts}
            emptyTitle="Garments Loading"
            emptyDescription="Products are being loaded from the store inventory."
          />
        )}
      </section>

      {/* Verified Store Tour / Interior Section */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Real Store Images Grid */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                <img
                  src={storeAssets?.store?.storefront_main || "/assets/store/storefront-main.jpg"}
                  alt="Rainbow Ready Mades Storefront"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white mt-6">
                <img
                  src={storeAssets?.store?.interior_1 || "/assets/store/store-interior-1.jpg"}
                  alt="Rainbow Ready Mades Interior Apparel"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Store Information Content */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">
                  Physical Storefront
                </span>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mt-1">
                  Visit Us at {SHOP_INFO.address}
                </h2>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                  Experience our warm retail atmosphere in person. Located {SHOP_INFO.landmark}, our store houses extensive menswear, ethnic garments, festive collections, and children's readymades.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-700 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-accent-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 text-sm">Store Address</strong>
                    <span>{SHOP_INFO.address}, {SHOP_INFO.landmark}, {SHOP_INFO.city}, {SHOP_INFO.state}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-slate-100">
                  <Truck className="w-4 h-4 text-accent-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 text-sm">Local Delivery Radius</strong>
                    <span>{SHOP_INFO.delivery.policy}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-slate-100">
                  <CreditCard className="w-4 h-4 text-accent-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 text-sm">Accepted Payment Modes</strong>
                    <span>Cash, UPI, PhonePe, Google Pay, Debit/Credit Card, and Cash on Delivery.</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow"
                >
                  Get Store Directions & Hours
                </Link>
                <Link
                  to="/gallery"
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold transition"
                >
                  View Lookbook Gallery
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RAG Assistant Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-brand-navy to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/20 text-accent-300 text-xs font-semibold border border-accent-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grounded Store AI Support</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Have Questions About Garments, Sizing, or Policies?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Our AI Assistant is strictly trained on authentic Rainbow Ready Mades business records. Get instant verified answers on size availability, 10-day returns, delivery zones, or store hours.
            </p>
            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-500 hover:bg-accent-600 text-slate-950 font-bold text-sm shadow-md transition"
              >
                <span>Ask Store Assistant Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
