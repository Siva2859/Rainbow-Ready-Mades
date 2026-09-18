import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, ShieldCheck, Truck, RefreshCw, Check, Sparkles } from 'lucide-react';
import { productService } from '../services/productService';
import { ProductGallery } from '../components/product/ProductGallery';
import { VariantSelector } from '../components/product/VariantSelector';
import { DetailSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import { formatCurrency } from '../utils/formatters';
import { SHOP_INFO } from '../utils/constants';
import { useCart } from '../context/CartContext';

export const ProductDetailPage = ({ onOpenChat }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Variant selection state
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProductById(id);
      setProduct(data);

      // Pre-select default size & color
      if (data.sizes && data.sizes.length > 0) {
        setSelectedSize(data.sizes[0]);
      }
      if (data.colors && data.colors.length > 0) {
        setSelectedColor(data.colors[0]);
      }
    } catch (err) {
      setError(err.message || "Failed to load product details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || adding) return;

    try {
      setAdding(true);
      await addItem({
        product_id: product.id,
        selected_size: selectedSize || (product.sizes?.[0] || 'M'),
        selected_color: selectedColor || (product.colors?.[0] || 'Standard'),
        quantity
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      // Toast handles error in CartContext
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/checkout');
  };

  if (loading) return <DetailSkeleton />;
  if (error || !product) {
    return (
      <div className="py-12">
        <ErrorState
          title="Product Not Found"
          message={error || "The requested clothing item could not be retrieved from the store catalog."}
          onRetry={fetchProductDetail}
        />
      </div>
    );
  }

  const inStock = product.in_stock !== false && (product.stock_count === undefined || product.stock_count > 0);
  const galleryImages = (product.images && product.images.length > 0)
    ? product.images
    : [product.primary_image_url || "/assets/store/storefront-main.jpg"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/products" className="hover:text-slate-900 flex items-center gap-1 transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Collections</span>
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium truncate">{product.category || 'Garment'}</span>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate">{product.title}</span>
      </div>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6">
          <ProductGallery images={galleryImages} title={product.title} />
        </div>

        {/* Right Column: Garment Information & Order Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            {/* Category & Verified Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 text-xs font-semibold bg-accent-50 text-accent-700 rounded-full border border-accent-200">
                {product.category || 'Retail Garment'}
              </span>
              {product.verified_at && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Store Record
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">
              {product.title}
            </h1>

            {/* Price section */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
                {formatCurrency(product.price)}
              </span>
              {product.discount_price && (
                <span className="text-sm text-slate-400 line-through">
                  {formatCurrency(product.discount_price)}
                </span>
              )}
              {inStock ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  In Stock ({product.stock_count || 10} available)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p>{product.description}</p>
            </div>
          )}

          {/* Fabric & Material Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Fabric / Material</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{product.material || "Quality Combed Cotton"}</span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Care Instructions</span>
              <span className="font-semibold text-slate-800 mt-0.5 block truncate">{product.care_instructions || "Hand or machine wash gentle"}</span>
            </div>
          </div>

          {/* Variant Selection (Size, Color, Quantity) */}
          <VariantSelector
            sizes={product.sizes || ["M", "L", "XL"]}
            colors={product.colors || ["Standard"]}
            selectedSize={selectedSize}
            onSelectSize={setSelectedSize}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
            quantity={quantity}
            onChangeQuantity={setQuantity}
            maxStock={product.stock_count || 20}
          />

          {/* Action Buttons: Add to Cart & Buy Now */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || adding}
              className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                added
                  ? 'bg-emerald-600 text-white'
                  : inStock
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{inStock ? "Add to Cart" : "Out of Stock"}</span>
                </>
              )}
            </button>

            {inStock && (
              <button
                onClick={handleBuyNow}
                className="py-3.5 px-6 rounded-xl bg-accent-500 hover:bg-accent-600 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Buy Now</span>
              </button>
            )}
          </div>

          {/* Policy Badges Reassurance */}
          <div className="pt-6 border-t border-slate-200 space-y-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-accent-600 shrink-0" />
              <span>{SHOP_INFO.delivery.policy}</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-accent-600 shrink-0" />
              <span>{SHOP_INFO.returns.policy}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent-600 shrink-0" />
              <span>In-store pickup available at 12 Gandhi Road.</span>
            </div>
          </div>

          {/* Chatbot prompt shortcut */}
          {onOpenChat && (
            <div className="p-3 bg-accent-50 border border-accent-200 rounded-xl flex items-center justify-between gap-3 text-xs">
              <span className="text-accent-900 font-medium">Have sizing or fitting questions about this garment?</span>
              <button
                onClick={onOpenChat}
                className="px-3 py-1 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-lg shrink-0 transition"
              >
                Ask Assistant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
