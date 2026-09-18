import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { SHOP_INFO } from '../../utils/constants';

export const CartSummary = ({
  subtotal = 0,
  deliveryFee = 0,
  total = 0,
  itemCount = 0,
  checkoutDisabled = false,
  onProceed
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24 space-y-6">
      <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">
        Order Summary
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-slate-400" />
            Local Delivery
          </span>
          <span className="font-medium text-emerald-700">
            {deliveryFee === 0 ? 'Verified at checkout' : formatCurrency(deliveryFee)}
          </span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
          <p className="font-medium text-slate-800 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-accent-600" />
            {SHOP_INFO.delivery.policy}
          </p>
          <p className="text-[11px] text-slate-500">
            Covers addresses within 10 km of 12 Gandhi Road. In-store pickup also available.
          </p>
        </div>

        <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
          <div>
            <span className="font-bold text-slate-900 text-base">Estimated Total</span>
            <span className="block text-[11px] text-slate-400">Includes all applicable taxes</span>
          </div>
          <span className="font-display font-extrabold text-slate-900 text-2xl">
            {formatCurrency(total || subtotal)}
          </span>
        </div>
      </div>

      {/* Checkout Action Button */}
      {onProceed ? (
        <button
          onClick={onProceed}
          disabled={checkoutDisabled || itemCount === 0}
          className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-accent-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <Link
          to="/checkout"
          className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-accent-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}

      {/* Reassurance Badge */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 justify-center">
        <ShieldCheck className="w-4 h-4 text-accent-600" />
        <span>10-Day Exchanges & Returns Permitted</span>
      </div>
    </div>
  );
};
