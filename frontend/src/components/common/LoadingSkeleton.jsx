import React from 'react';

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-pulse">
    <div className="w-full aspect-[4/5] bg-slate-200"></div>
    <div className="p-4 space-y-2.5">
      <div className="h-3 w-1/3 bg-slate-200 rounded"></div>
      <div className="h-4.5 w-4/5 bg-slate-200 rounded"></div>
      <div className="h-5 w-1/4 bg-slate-200 rounded mt-3"></div>
      <div className="h-9 w-full bg-slate-200 rounded-lg mt-4"></div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const DetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="w-full aspect-[4/5] bg-slate-200 rounded-2xl"></div>
      <div className="space-y-4">
        <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
        <div className="h-8 w-3/4 bg-slate-200 rounded"></div>
        <div className="h-6 w-1/3 bg-slate-200 rounded"></div>
        <div className="h-24 w-full bg-slate-200 rounded"></div>
        <div className="h-10 w-1/2 bg-slate-200 rounded"></div>
        <div className="h-12 w-full bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  </div>
);
