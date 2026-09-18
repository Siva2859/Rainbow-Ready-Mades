import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CartItem } from '../components/cart/CartItem';
import { CartSummary } from '../components/cart/CartSummary';
import { EmptyState } from '../components/common/EmptyState';

export const CartPage = () => {
  const { cart, cartCount, updateQuantity, removeItem, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleProceed = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (!loading && (!cart?.items || cart.items.length === 0)) {
    return (
      <div className="py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="You haven't added any garments to your cart yet. Explore our fresh menswear and ethnic collections!"
          actionLabel="Start Shopping"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review your selected readymade garments ({cartCount} {cartCount === 1 ? 'item' : 'items'}).
          </p>
        </div>

        {cart?.items?.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Empty Cart</span>
          </button>
        )}
      </div>

      {/* Main Cart Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Line Items */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="divide-y divide-slate-100">
            {cart?.items?.map((item) => (
              <CartItem
                key={item.item_id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center">
            <Link
              to="/products"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Sticky Summary Card */}
        <div className="lg:col-span-4">
          <CartSummary
            subtotal={cart?.subtotal || 0}
            deliveryFee={cart?.delivery_fee || 0}
            total={cart?.total || cart?.subtotal || 0}
            itemCount={cartCount}
            onProceed={handleProceed}
          />
        </div>
      </div>
    </div>
  );
};
