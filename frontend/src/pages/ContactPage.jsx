import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Truck } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { SHOP_INFO } from '../utils/constants';

export const ContactPage = () => {
  const { success } = useToast();
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    success("Message sent to Rainbow Ready Mades store management! We will respond promptly.");
    setSent(true);
    setFormData({ name: '', phone: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">
          Visit or Reach Out
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900">
          Contact & Store Directions
        </h1>
        <p className="text-slate-600 text-sm">
          Have questions about sizing, fabric availability, or custom tailoring? Connect with us directly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Info Cards */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              Store Information
            </h2>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 text-sm">Physical Address</strong>
                  <p className="mt-0.5">
                    {SHOP_INFO.address},<br />
                    {SHOP_INFO.landmark},<br />
                    {SHOP_INFO.city}, {SHOP_INFO.state} - {SHOP_INFO.postalCode}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <Phone className="w-5 h-5 text-accent-600 shrink-0" />
                <div>
                  <strong className="block text-slate-900 text-sm">Phone & WhatsApp</strong>
                  <span className="font-medium text-slate-800">{SHOP_INFO.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <Mail className="w-5 h-5 text-accent-600 shrink-0" />
                <div>
                  <strong className="block text-slate-900 text-sm">Email Support</strong>
                  <span>{SHOP_INFO.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                <Clock className="w-5 h-5 text-accent-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 text-sm">Business Timings</strong>
                  <p className="mt-0.5">{SHOP_INFO.hours.weekdays}</p>
                  <p>{SHOP_INFO.hours.sunday}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                <Truck className="w-5 h-5 text-accent-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 text-sm">Delivery Radius</strong>
                  <span>{SHOP_INFO.delivery.policy}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Direct Customer Enquiry Form */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Send Store Enquiry</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Leave your contact details and message below; our shopkeeper will call or WhatsApp you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-accent-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone / WhatsApp Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-accent-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Message / Garment Requirement *
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Ask about shirt sizes, bulk family orders, or alteration requests..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-accent-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-slate-900 hover:bg-accent-600 text-white font-bold text-sm rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Store Enquiry</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
