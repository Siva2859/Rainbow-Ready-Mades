import React from 'react';
import { Check, Clock, PackageCheck, Truck, Home } from 'lucide-react';

export const OrderTracker = ({ currentStatus, timeline = [] }) => {
  // Standard stages mapped to backend models
  const defaultStages = [
    { key: 'PENDING', label: 'Order Placed', icon: Clock },
    { key: 'CONFIRMED', label: 'Order Confirmed', icon: PackageCheck },
    { key: 'PREPARING', label: 'Preparing Garments', icon: PackageCheck },
    { key: 'READY', label: 'Ready for Dispatch', icon: PackageCheck },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: Home }
  ];

  const statusOrder = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  // If backend provided custom timeline array:
  const stagesToRender = timeline.length > 0
    ? timeline.map((item) => ({
        key: item.status,
        label: item.label,
        completed: item.completed,
        timestamp: item.timestamp,
        icon: item.status === 'DELIVERED' ? Home : item.status === 'OUT_FOR_DELIVERY' ? Truck : PackageCheck
      }))
    : defaultStages.map((stage, idx) => ({
        ...stage,
        completed: currentIndex >= idx,
        isCurrent: currentIndex === idx
      }));

  return (
    <div className="py-6 px-4 bg-slate-50 border border-slate-200 rounded-2xl">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
        Order Fulfillment Timeline
      </h4>

      {/* Desktop Horizontal Tracker */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Continuous connector bar */}
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 -translate-y-1/2 -z-0"></div>

        {stagesToRender.map((stage, idx) => {
          const isCompleted = stage.completed;
          const isCurrent = stage.isCurrent || (currentIndex === idx);

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center max-w-[100px]">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-md'
                    : isCurrent
                    ? 'bg-accent-600 text-white ring-4 ring-accent-500/20 shadow-md animate-bounce'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <stage.icon className="w-4 h-4" />}
              </div>
              <span className={`text-[11px] font-semibold mt-2 leading-tight ${
                isCompleted ? 'text-slate-900' : isCurrent ? 'text-accent-600 font-bold' : 'text-slate-400'
              }`}>
                {stage.label}
              </span>
              {stage.timestamp && (
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {stage.timestamp}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Tracker */}
      <div className="sm:hidden space-y-4 relative pl-4 border-l-2 border-slate-200 ml-2">
        {stagesToRender.map((stage, idx) => {
          const isCompleted = stage.completed;
          const isCurrent = stage.isCurrent || (currentIndex === idx);

          return (
            <div key={idx} className="relative flex items-start gap-3">
              <div
                className={`absolute -left-[25px] w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-accent-600 text-white ring-4 ring-accent-500/20'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-2 h-2 rounded-full bg-slate-300"></span>}
              </div>
              <div>
                <span className={`text-xs font-semibold block ${
                  isCompleted ? 'text-slate-900' : isCurrent ? 'text-accent-600 font-bold' : 'text-slate-400'
                }`}>
                  {stage.label}
                </span>
                {stage.timestamp && (
                  <span className="text-[11px] text-slate-400">
                    {stage.timestamp}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
