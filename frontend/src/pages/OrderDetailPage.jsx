import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Phone, RefreshCw, Calendar } from 'lucide-react';
import { orderService } from '../services/orderService';
import { OrderTracker } from '../components/order/OrderTracker';
import { ErrorState } from '../components/common/ErrorState';
import { formatCurrency, formatDate, getAssetUrl } from '../utils/formatters';
import { ORDER_STATUS_LABELS } from '../utils/constants';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-sm text-slate-500">
        Loading order details and live tracking...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-12">
        <ErrorState
          title="Order Not Found"
          message={error || "Could not retrieve order details."}
          onRetry={fetchOrder}
        />
      </div>
    );
  }

  const statusConfig = ORDER_STATUS_LABELS[order.status] || {
    label: order.status,
    color: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Title */}
      <div>
        <Link to="/orders" className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-3 transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Orders</span>
        </Link>
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
              Order #{order.order_id}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Placed on {formatDate(order.created_at)}</span>
              <span>•</span>
              <span>Tracking Code: <strong className="font-mono text-slate-800">{order.tracking_code}</strong></span>
            </p>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Visual Timeline Tracker */}
      <OrderTracker currentStatus={order.status} />

      {/* Grid: Items & Shipping */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left: Itemized purchased garments */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-accent-600" />
            <span>Garment Items ({order.items?.length || 0})</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-3 flex gap-3 items-center text-xs">
                {item.image_url && (
                  <img
                    src={getAssetUrl(item.image_url)}
                    alt={item.title}
                    className="w-12 h-14 rounded-lg object-cover bg-slate-100 shrink-0"
                    onError={(e) => { e.target.src = "/assets/store/storefront-main.jpg"; }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-slate-800 block truncate">{item.title}</span>
                  <span className="text-slate-400">
                    Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                  </span>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  {formatCurrency(item.total_price || item.unit_price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing breakdown */}
          <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatCurrency(order.total_amount - (order.delivery_fee || 0))}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Local Delivery Fee (10 km range)</span>
              <span>{order.delivery_fee ? formatCurrency(order.delivery_fee) : "Calculated"}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-100">
              <span>Total Paid / Payable</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Right: Delivery & Actions */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              Delivery & Contact
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-800">Shipping Address:</strong>
                  <span>{order.shipping_address}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <strong className="block text-slate-800">Customer Phone:</strong>
                  <span>{order.customer_phone || "On file"}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <strong className="block text-slate-800 mb-0.5">Selected Payment Mode:</strong>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded font-medium inline-block">
                  {order.payment_method}
                </span>
              </div>
            </div>
          </div>

          {/* 10-Day Return / Exchange Action */}
          <div className="bg-accent-50/70 p-5 rounded-2xl border border-accent-200 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-accent-900 font-bold text-sm">
              <RefreshCw className="w-4 h-4 text-accent-600" />
              <span>10-Day Exchange & Return Available</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              If any garment does not fit or has an issue, you can file a size exchange or return within 10 days. Both exchanges and refunds are permitted under our verified policy.
            </p>
            <Link
              to={`/returns?order_id=${order.order_id}`}
              className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl shadow transition"
            >
              Request Size Exchange or Return
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
