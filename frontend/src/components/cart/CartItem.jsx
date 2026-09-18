import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency, getAssetUrl } from '../../utils/formatters';

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex gap-4 sm:gap-6 py-5 border-b border-slate-200 last:border-b-0 items-start">
      {/* Thumbnail */}
      <Link
        to={`/products/${item.product_id}`}
        className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 block group"
      >
        <img
          src={getAssetUrl(item.image_url)}
          alt={item.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
          onError={(e) => {
            e.target.src = "/assets/store/storefront-main.jpg";
          }}
        />
      </Link>

      {/* Details & Controls */}
      <div className="flex-1 flex flex-col justify-between self-stretch min-w-0">
        <div>
          <div className="flex justify-between items-start gap-2">
            <Link
              to={`/products/${item.product_id}`}
              className="font-semibold text-slate-900 text-sm sm:text-base hover:text-accent-600 transition truncate"
            >
              {item.title}
            </Link>
            <span className="font-bold text-slate-900 text-sm sm:text-base shrink-0">
              {formatCurrency(item.total_item_price || item.unit_price * item.quantity)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-1">
            {item.selected_size && (
              <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                Size: <strong>{item.selected_size}</strong>
              </span>
            )}
            {item.selected_color && (
              <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                Color: <strong>{item.selected_color}</strong>
              </span>
            )}
            <span className="text-slate-400 self-center">
              • {formatCurrency(item.unit_price)} each
            </span>
          </div>
        </div>

        {/* Quantity Controls & Remove Action */}
        <div className="flex justify-between items-center mt-3 pt-2">
          <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
            <button
              onClick={() => onUpdateQuantity(item.item_id, Math.max(1, item.quantity - 1))}
              disabled={item.quantity <= 1}
              className="p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition"
              title="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-slate-900">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.item_id, item.quantity + 1)}
              className="p-1.5 text-slate-500 hover:bg-slate-100 transition"
              title="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => onRemove(item.item_id)}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 transition p-1 hover:bg-rose-50 rounded"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};
