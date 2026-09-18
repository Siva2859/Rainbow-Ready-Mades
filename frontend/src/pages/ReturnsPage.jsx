import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import { returnService } from '../services/returnService';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatters';
import { RETURN_REASONS, SHOP_INFO } from '../utils/constants';

export const ReturnsPage = () => {
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('order_id') || '';

  const { success, error: toastError } = useToast();
  const [returnsList, setReturnsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [orderId, setOrderId] = useState(initialOrderId);
  const [requestType, setRequestType] = useState('EXCHANGE'); // 'EXCHANGE' | 'RETURN'
  const [reason, setReason] = useState('SIZE_FIT_ISSUE');
  const [desiredSize, setDesiredSize] = useState('M');
  const [customerNote, setCustomerNote] = useState('');

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const data = await returnService.getReturns();
      setReturnsList(data || []);
    } catch {
      setReturnsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toastError("Please provide your Order ID.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        order_id: orderId.trim(),
        request_type: requestType,
        reason,
        customer_note: customerNote || undefined,
        desired_size: requestType === 'EXCHANGE' ? desiredSize : undefined
      };

      await returnService.createReturn(payload);
      success("Return / exchange request filed successfully with Rainbow Ready Mades!");
      setCustomerNote('');
      fetchReturns();
    } catch (err) {
      toastError(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">
          Customer Care & Quality Guarantee
        </span>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mt-1">
          10-Day Returns & Exchanges
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {SHOP_INFO.returns.policy}
        </p>
      </div>

      {/* Verified Policy Alert Card */}
      <div className="p-5 rounded-2xl bg-accent-50/80 border border-accent-200 text-xs sm:text-sm text-slate-700 space-y-2">
        <div className="flex items-center gap-2 font-bold text-accent-900">
          <ShieldCheck className="w-5 h-5 text-accent-600" />
          <span>Verified Rainbow Ready Mades Policy</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-1">
          <li><strong>10-Day Window:</strong> File within 10 days of receiving your order or buying in store.</li>
          <li><strong>Both Options Allowed:</strong> You may request a size/color <strong>Exchange</strong> or a <strong>Refund</strong>.</li>
          <li><strong>Damaged / Wrong Garment:</strong> Damaged garments or incorrect items delivered are immediately eligible for replacement.</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Request Submission Form */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-accent-600" />
            <span>File a New Request</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Order ID */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Order ID *
              </label>
              <input
                type="text"
                placeholder="e.g. ord_7841"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-accent-500 outline-none text-sm"
                required
              />
            </div>

            {/* Request Type Switcher */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Request Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRequestType('EXCHANGE')}
                  className={`py-2.5 px-3 rounded-xl font-bold border transition ${
                    requestType === 'EXCHANGE'
                      ? 'border-accent-600 bg-accent-50 text-accent-800 ring-2 ring-accent-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Size / Color Exchange
                </button>
                <button
                  type="button"
                  onClick={() => setRequestType('RETURN')}
                  className={`py-2.5 px-3 rounded-xl font-bold border transition ${
                    requestType === 'RETURN'
                      ? 'border-accent-600 bg-accent-50 text-accent-800 ring-2 ring-accent-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Return for Refund
                </button>
              </div>
            </div>

            {/* Reason Dropdown */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reason *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-accent-500 outline-none text-sm"
              >
                {RETURN_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Desired Size (for Exchange only) */}
            {requestType === 'EXCHANGE' && (
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Desired Exchange Size
                </label>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL', '38', '40', '42'].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setDesiredSize(sz)}
                      className={`px-3 py-1.5 rounded-lg border font-bold text-xs ${
                        desiredSize === sz
                          ? 'border-accent-600 bg-accent-50 text-accent-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description Notes */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Details / Notes
              </label>
              <textarea
                rows={3}
                placeholder="Explain the fit issue or garment condition..."
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-accent-500 outline-none text-sm"
              />
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-accent-600 disabled:bg-slate-300 text-white font-bold text-sm shadow transition"
            >
              {submitting ? 'Submitting Request...' : 'Submit 10-Day Request'}
            </button>
          </form>
        </div>

        {/* Right: Existing Returns Status */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="font-bold text-slate-900 text-base">
            Your Filed Requests ({returnsList.length})
          </h2>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Loading requests...
            </div>
          ) : returnsList.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl text-center text-xs text-slate-500 space-y-1">
              <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-800">No active return or exchange requests</p>
              <p>Requests filed within 10 days will be tracked here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {returnsList.map((req) => (
                <div key={req.return_id} className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-slate-900 text-sm block">
                        Ticket #{req.return_id}
                      </strong>
                      <span className="text-slate-400">Order: {req.order_id}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[11px]">
                      {req.status}
                    </span>
                  </div>

                  <div className="flex gap-4 pt-2 border-t border-slate-100 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Type</span>
                      <span className="font-medium text-slate-800">{req.request_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Reason</span>
                      <span className="font-medium text-slate-800">{req.reason}</span>
                    </div>
                    {req.desired_size && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">Requested Size</span>
                        <span className="font-bold text-accent-700">{req.desired_size}</span>
                      </div>
                    )}
                  </div>

                  {req.admin_notes && (
                    <div className="p-2 bg-slate-50 rounded border border-slate-100 text-slate-700">
                      <strong>Store Note:</strong> {req.admin_notes}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 block">
                    Updated {formatDate(req.updated_at || req.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
