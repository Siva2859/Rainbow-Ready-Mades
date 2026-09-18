import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { SHOP_INFO } from '../utils/constants';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-4">
        <span className="font-display font-black text-6xl text-accent-600 block">
          404
        </span>
        <h1 className="font-display font-bold text-2xl text-slate-900">
          Page Not Found
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          The page or garment collection you are looking for does not exist or has been moved in the {SHOP_INFO.name} catalog.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-accent-600 text-white font-bold text-xs shadow transition"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition"
          >
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
