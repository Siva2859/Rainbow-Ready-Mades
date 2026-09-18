import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Check } from 'lucide-react';
import { formatCurrency, getAssetUrl } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';

export const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const [adding, setAdding] = React.useState(false);
  const [added, setAdded] = React.useState(false);

  // Fallback image if product image is empty
  const imageUrl = getAssetUrl(product.primary_image_url || (product.images && product.images[0]));
  const title = product.title || product.name || "Garment";
  const inStock = product.in_stock !== false && (product.stock_count === undefined || product.stock_count > 0);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock || adding) return;

    try {
      setAdding(true);
      await addItem({
        product_id: product.id,
        selected_size: (product.sizes && product.sizes[0]) || "M",
        selected_color: (product.colors && product.colors[0]) || "Standard",
        quantity: 1
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch {
      // Error handled by cart context toast
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      {/* Product Image Frame */}
      <Link to={`/products/${product.id}`} className="relative aspect-[4/5] bg-slate-100 overflow-hidden block">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = "/assets/store/storefront-main.jpg";
          }}
        />

        {/* Stock status badge */}
        {!inStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 bg-slate-900 text-white text-xs font-semibold rounded-full shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Featured badge */}
        {product.is_featured && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-amber-500 text-white text-[11px] font-bold rounded-full shadow-md tracking-wider uppercase">
              Featured
            </span>
          </div>
        )}

        {/* Category Pill */}
        {product.category && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-slate-700 text-[11px] font-medium rounded-full shadow-sm">
              {product.category}
            </span>
          </div>
        )}

        {/* Quick View Hover overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="px-4 py-2 bg-white/90 text-slate-900 text-xs font-semibold rounded-full shadow flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> View Garment
          </span>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <Link to={`/products/${product.id}`}>
            <h3 className="font-semibold text-slate-900 text-sm hover:text-accent-600 transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
          </Link>

          {/* Material composition if provided */}
          {product.material && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              {product.material}
            </p>
          )}

          {/* Sizes availability chips preview */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.sizes.slice(0, 4).map((s) => (
                <span key={s} className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded border border-slate-200">
                  {s}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="text-[10px] text-slate-400 self-center">
                  +{product.sizes.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-slate-900 text-base sm:text-lg">
                {formatCurrency(product.price)}
              </span>
              {product.discount_price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(product.discount_price)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={!inStock || adding}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              added
                ? 'bg-emerald-600 text-white'
                : inStock
                ? 'bg-slate-900 hover:bg-accent-600 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            title={inStock ? "Add to Cart" : "Currently Unavailable"}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
