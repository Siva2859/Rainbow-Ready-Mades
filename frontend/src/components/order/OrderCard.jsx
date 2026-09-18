import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, RefreshCw, Calendar, MapPin } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUS_LABELS } from '../../utils/constants';

export const OrderCard = ({ order }) => {
  const statusConfig = ORDER_STATUS_LABELS[order.status] || {
    label: order.status,
    color: 'bg-slate-100 text-slate-700 border-slate-300'
  };

  const isDelivered = order.status === 'DELIVERED';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
      {/* Order Header */}
      <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-accent-600" />
            <span className="font-bold text-slate-900 text-sm">
              Order #{order.order_id}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Placed {formatDate(order.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          <span className="font-bold text-slate-900 text-base">
            {formatCurrency(order.total_amount)}
          </span>
        </div>
      </div>

      {/* Items Snippet */}
      <div className="p-4 sm:p-5 space-y-3">
        {order.items && order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                {item.quantity}x
              </div>
              <div className="truncate">
                <span className="font-medium text-slate-800 truncate block">{item.title}</span>
                <span className="text-xs text-slate-400">
                  Size: {item.size} • Color: {item.color}
                </span>
              </div>
            </div>
            <span className="font-medium text-slate-700 text-xs shrink-0 ml-2">
              {formatCurrency(item.total_price || item.unit_price * item.quantity)}
            </span>
          </div>
        ))}

        {/* Shipping address summary */}
        {order.shipping_address && (
          <div className="pt-3 border-t border-slate-100 flex items-start gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{order.shipping_address}</span>
          </div>
        )}
      </div>

      {/* Order Actions */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
        <span className="text-slate-500 font-mono text-[11px]">
          Tracking: <strong className="text-slate-800">{order.tracking_code}</strong>
        </span>

        <div className="flex items-center gap-2">
          {isDelivered && (
            <Link
              to={`/returns?order_id=${order.order_id}`}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-white flex items-center gap-1 font-medium transition"
            >
              <RefreshCw className="w-3 h-3" />
              Return / Exchange
            </Link>
          )}

          <Link
            to={`/orders/${order.order_id}`}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-accent-600 text-white flex items-center gap-1 font-medium transition"
          >
            <span>View Details & Timeline</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
