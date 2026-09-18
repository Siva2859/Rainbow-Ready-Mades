import React, { useState, useEffect } from 'react';
import { Package, Search, RefreshCw } from 'lucide-react';
import { orderService } from '../services/orderService';
import { OrderCard } from '../components/order/OrderCard';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingSearch, setTrackingSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrders();
      setOrders(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleTrackSearch = async (e) => {
    e.preventDefault();
    if (!trackingSearch.trim()) return;

    try {
      setSearchLoading(true);
      setSearchError(null);
      const res = await orderService.trackOrder(trackingSearch.trim());
      setSearchResult(res);
    } catch (err) {
      setSearchError(err.message || 'Tracking code not found.');
      setSearchResult(null);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
            My Orders & Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review order history, live fulfillment timeline, and file 10-day exchange requests.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Public / Quick Tracking Code Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Track Any Order by Tracking Code
        </label>
        <form onSubmit={handleTrackSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="e.g. RRM-TRK-7841"
              value={trackingSearch}
              onChange={(e) => setTrackingSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-accent-500 outline-none transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <button
            type="submit"
            disabled={searchLoading || !trackingSearch.trim()}
            className="px-5 py-2 bg-slate-900 hover:bg-accent-600 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition"
          >
            {searchLoading ? 'Tracking...' : 'Track'}
          </button>
        </form>

        {searchError && (
          <p className="text-xs text-rose-600 font-medium">{searchError}</p>
        )}

        {searchResult && (
          <div className="mt-4 p-4 rounded-xl bg-accent-50/70 border border-accent-200 text-xs text-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <strong className="text-accent-900 text-sm">Tracking: {searchResult.tracking_code}</strong>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-white text-accent-800 border border-accent-200 text-[11px]">
                Status: {searchResult.status}
              </span>
            </div>
            <p>Current Fulfillment Stage: <strong className="text-slate-900">{searchResult.current_stage || searchResult.status}</strong></p>
          </div>
        )}
      </div>

      {/* User's Orders List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Order History ({orders.length})
        </h2>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Loading your orders...
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchOrders} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders placed yet"
            description="You have not placed any orders with Rainbow Ready Mades yet. Check out our fresh menswear collections!"
            actionLabel="Browse Apparel"
            actionLink="/products"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.order_id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
