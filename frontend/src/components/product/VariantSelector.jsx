import React from 'react';
import { Minus, Plus } from 'lucide-react';

export const VariantSelector = ({
  sizes = [],
  colors = [],
  selectedSize,
  onSelectSize,
  selectedColor,
  onSelectColor,
  quantity = 1,
  onChangeQuantity,
  maxStock = 50
}) => {
  return (
    <div className="space-y-6 pt-4 border-t border-slate-200">
      {/* Size Selector */}
      {sizes && sizes.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Select Size
            </span>
            <span className="text-xs text-slate-500">
              Selected: <strong className="text-slate-800">{selectedSize || 'None'}</strong>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onSelectSize(size)}
                className={`min-w-[48px] h-11 px-3.5 rounded-xl text-sm font-semibold border transition-all ${
                  selectedSize === size
                    ? 'border-accent-600 bg-accent-50 text-accent-700 shadow-sm ring-2 ring-accent-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {colors && colors.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Select Color
            </span>
            <span className="text-xs text-slate-500">
              Selected: <strong className="text-slate-800">{selectedColor || 'None'}</strong>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onSelectColor(color)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  selectedColor === color
                    ? 'border-accent-600 bg-accent-50 text-accent-700 shadow-sm ring-2 ring-accent-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Stepper */}
      {onChangeQuantity && (
        <div>
          <span className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
            Quantity
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => onChangeQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="p-3 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-sm font-bold text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onChangeQuantity(Math.min(maxStock, quantity + 1))}
                disabled={quantity >= maxStock}
                className="p-3 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs text-slate-500">
              Verified local in-store inventory
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
