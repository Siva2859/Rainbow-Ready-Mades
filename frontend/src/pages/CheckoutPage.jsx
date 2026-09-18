import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Phone, CreditCard, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import { formatCurrency } from '../utils/formatters';
import { PAYMENT_METHODS, SHOP_INFO } from '../utils/constants';

export const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientName: user?.full_name || '',
    phone: user?.phone || '',
    street: '',
    city: 'Shop Local City',
    postalCode: '600001',
    paymentMethod: 'CASH_ON_DELIVERY',
    orderNotes: ''
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.recipientName.trim()) errs.recipientName = 'Recipient name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.street.trim()) errs.street = 'Street address is required';
    if (!formData.postalCode.trim()) errs.postalCode = 'Postal code is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!cart?.items || cart.items.length === 0) {
      toastError("Your cart is empty. Please add garments before placing an order.");
      navigate('/products');
      return;
    }

    try {
      setLoading(true);
      const deliveryAddressString = `${formData.street}, ${formData.city} - ${formData.postalCode}`;

      const orderPayload = {
        delivery_address: deliveryAddressString,
        payment_method: formData.paymentMethod,
        order_notes: formData.orderNotes || undefined,
        customer_phone: formData.phone,
        customer_name: formData.recipientName
      };

      const newOrder = await orderService.createOrder(orderPayload);
      await clearCart();
      success(`Order #${newOrder.order_id} placed successfully! Tracking Code: ${newOrder.tracking_code}`);
      navigate(`/orders/${newOrder.order_id}`);
    } catch (err) {
      toastError(err.message || "Failed to place order. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <Link to="/cart" className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2 transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </Link>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
          Checkout & Order Placement
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Enter local delivery details and select your preferred verified payment mode.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Delivery & Payment Details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Contact Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <Phone className="w-4 h-4 text-accent-600" />
              <span>Contact Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  placeholder="e.g. Suresh Kumar"
                  className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:border-accent-500 outline-none transition ${
                    errors.recipientName ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                  }`}
                />
                {errors.recipientName && <span className="text-[11px] text-rose-600 mt-1 block">{errors.recipientName}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:border-accent-500 outline-none transition ${
                    errors.phone ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                  }`}
                />
                {errors.phone && <span className="text-[11px] text-rose-600 mt-1 block">{errors.phone}</span>}
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent-600" />
                <span>Delivery Address (Within 10 km Radius)</span>
              </h2>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <Truck className="w-4 h-4 text-accent-600 shrink-0 mt-0.5" />
              <div>
                <strong>Verified Local Delivery:</strong> {SHOP_INFO.delivery.policy} For addresses beyond 10 km, in-store pickup is recommended.
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Street Address & Flat / House No. *
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="e.g. Flat 3B, Sunshine Apts, Station Road"
                  className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:border-accent-500 outline-none transition ${
                    errors.street ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                  }`}
                />
                {errors.street && <span className="text-[11px] text-rose-600 mt-1 block">{errors.street}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-accent-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-accent-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Delivery Notes / Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={formData.orderNotes}
                  onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                  placeholder="e.g. Near Big Temple or ring doorbell twice"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-accent-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment Method Selection */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-4 h-4 text-accent-600" />
              <span>Select Payment Method</span>
            </h2>

            <div className="space-y-2.5">
              {PAYMENT_METHODS.map((pm) => (
                <label
                  key={pm.id}
                  className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition ${
                    formData.paymentMethod === pm.id
                      ? 'border-accent-600 bg-accent-50/60 ring-2 ring-accent-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.id}
                    checked={formData.paymentMethod === pm.id}
                    onChange={() => setFormData({ ...formData, paymentMethod: pm.id })}
                    className="mt-1 text-accent-600 focus:ring-accent-500"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                      {pm.label}
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      {pm.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              ℹ️ Payment mode will be recorded with your order and verified during handover/delivery.
            </p>
          </div>
        </div>

        {/* Right Column: Order Review & Place Order Button */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24 space-y-6">
          <h2 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            Garment Review ({cart?.items?.length || 0} {cart?.items?.length === 1 ? 'item' : 'items'})
          </h2>

          {/* Mini Items List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-2">
            {cart?.items?.map((item) => (
              <div key={item.item_id} className="pt-2 first:pt-0 flex justify-between items-center text-xs">
                <div className="min-w-0 pr-2">
                  <span className="font-semibold text-slate-800 block truncate">{item.title}</span>
                  <span className="text-slate-400">
                    Size: {item.selected_size} • Qty: {item.quantity}
                  </span>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  {formatCurrency(item.total_item_price || item.unit_price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="space-y-2.5 pt-3 border-t border-slate-200 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{formatCurrency(cart?.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Local Delivery (10 km)</span>
              <span className="font-semibold text-emerald-700">
                {cart?.delivery_fee ? formatCurrency(cart.delivery_fee) : "Calculated with Order"}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
              <span className="font-bold text-slate-900 text-sm">Order Total</span>
              <span className="font-display font-extrabold text-2xl text-slate-900">
                {formatCurrency(cart?.total || cart?.subtotal || 0)}
              </span>
            </div>
          </div>

          {/* Place Order CTA */}
          <button
            type="submit"
            disabled={loading || !cart?.items || cart.items.length === 0}
            className="w-full py-4 rounded-xl bg-slate-900 hover:bg-accent-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Placing Order with Store...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-accent-400" />
                <span>Confirm & Place Order</span>
              </>
            )}
          </button>

          <div className="text-[11px] text-slate-500 text-center space-y-1">
            <p className="flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-600" />
              <span>10-Day Exchanges and Returns Permitted</span>
            </p>
            <p className="text-slate-400">Directly recorded in Rainbow Ready Mades fulfillment system.</p>
          </div>
        </div>
      </form>
    </div>
  );
};
