import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, MapPin, Clock, ArrowRight } from 'lucide-react';
import { SHOP_INFO } from '../utils/constants';

export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">
          Local Retail Heritage
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900">
          About {SHOP_INFO.name}
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          {SHOP_INFO.tagline}. Rooted in quality fabrics, tailored cuts, and personal community service.
        </p>
      </div>

      {/* Main Story & Visual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <h2 className="font-display font-bold text-xl text-slate-900">
            Authentic Ready Made Garments Directly on Gandhi Road
          </h2>
          <p>
            At <strong>{SHOP_INFO.name}</strong>, we believe choosing clothing should be a transparent and tactile experience. Situated conveniently near the Clock Tower market district, our store curates a wide variety of men's formal shirts, breathable cotton casual wear, denim, trousers, and festive ethnic garments.
          </p>
          <p>
            Unlike mass e-commerce aggregators that use stock imagery and unpredictable sizing, every garment listed on our platform represents verified inventory in our physical shop racks.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-accent-600 text-white font-bold text-xs shadow transition"
            >
              <span>Explore Clothing Collections</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="aspect-[4/3] rounded-3xl overflow-hidden border-2 border-slate-200 shadow-lg bg-slate-100">
          <img
            src="/assets/store/storefront-main.jpg"
            alt="Rainbow Ready Mades Shopfront"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Verified Commitments Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <Truck className="w-6 h-6 text-accent-600 mb-2" />
          <h3 className="font-bold text-slate-900 text-sm">10 km Local Delivery</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {SHOP_INFO.delivery.policy} We prioritize neighborhood deliveries and in-person store pickups.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <RefreshCw className="w-6 h-6 text-accent-600 mb-2" />
          <h3 className="font-bold text-slate-900 text-sm">10-Day Exchanges & Refunds</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {SHOP_INFO.returns.policy}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <ShieldCheck className="w-6 h-6 text-accent-600 mb-2" />
          <h3 className="font-bold text-slate-900 text-sm">Verified In-Store Stock</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every product photo, price tag, and size matrix is backed by verified physical inventory on our racks.
          </p>
        </div>
      </div>
    </div>
  );
};
