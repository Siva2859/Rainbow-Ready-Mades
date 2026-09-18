import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ShieldCheck, RefreshCw, Truck, CreditCard } from 'lucide-react';
import { SHOP_INFO, PAYMENT_METHODS } from '../../utils/constants';

export const Footer = () => {
  return (
    <footer className="bg-brand-navy text-slate-300 border-t border-slate-800 mt-20">
      {/* Policy reassurance banner */}
      <div className="border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <Truck className="w-6 h-6 text-accent-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white text-sm">Local Delivery</h3>
              <p className="text-xs text-slate-400 mt-0.5">Available within 10 km radius from our retail store</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <RefreshCw className="w-6 h-6 text-accent-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white text-sm">10-Day Returns & Exchanges</h3>
              <p className="text-xs text-slate-400 mt-0.5">Refunds and size exchanges permitted for 10 days</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <CreditCard className="w-6 h-6 text-accent-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white text-sm">Multiple Payment Modes</h3>
              <p className="text-xs text-slate-400 mt-0.5">Cash, UPI, PhonePe, Google Pay, Card & COD</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <ShieldCheck className="w-6 h-6 text-accent-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white text-sm">Verified Local Shop</h3>
              <p className="text-xs text-slate-400 mt-0.5">Physical store presence with authentic readymades</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer contents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Store Branding & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent-600 flex items-center justify-center text-white font-display font-bold text-lg">
                R
              </div>
              <span className="font-display font-bold text-lg text-white">
                {SHOP_INFO.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {SHOP_INFO.tagline}. Authentic men's readymade apparel, formal wear, casual shirts, and everyday essentials curated directly from our local shop racks.
            </p>
            <div className="pt-1">
              <span className="inline-block px-2.5 py-1 text-[11px] font-semibold text-accent-400 bg-accent-950/60 border border-accent-800/60 rounded-full">
                Men's Fashion & Readymades
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Explore</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products" className="hover:text-accent-400 transition">All Clothing Collections</Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-accent-400 transition">Store Gallery & Lookbook</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-accent-400 transition">About Our Shop</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-accent-400 transition">Store Directions & Timings</Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-accent-400 transition">Order Tracking & History</Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-accent-400 transition">10-Day Return & Exchange</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Verified Store Information */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Visit Store</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
                <span>
                  {SHOP_INFO.address},<br />
                  {SHOP_INFO.landmark},<br />
                  {SHOP_INFO.city}, {SHOP_INFO.state} - {SHOP_INFO.postalCode}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent-400 shrink-0" />
                <span>{SHOP_INFO.phone} (Call / WhatsApp)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent-400 shrink-0" />
                <span>{SHOP_INFO.email}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
                <div>
                  <p>{SHOP_INFO.hours.weekdays}</p>
                  <p>{SHOP_INFO.hours.sunday}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Verified Policies & Payment Badges */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Accepted Payments</h3>
            <p className="text-xs text-slate-400 mb-3">
              We offer multiple verified payment options for your convenience:
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {PAYMENT_METHODS.map((pm) => (
                <span
                  key={pm.id}
                  className="px-2 py-1 text-[11px] bg-slate-800/80 border border-slate-700/60 rounded text-slate-300 font-medium"
                >
                  {pm.label.split('(')[0].trim()}
                </span>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <strong className="text-slate-200 block mb-0.5">Need Help Choosing Garments?</strong>
              Use our AI Store Assistant in the bottom right corner for verified stock, size, and policy guidance!
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} {SHOP_INFO.name}. All rights reserved.</p>
          <p className="text-slate-500">Verified Local Business • Real Clothing Retail Platform</p>
        </div>
      </div>
    </footer>
  );
};
