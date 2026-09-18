import React, { useState } from 'react';
import { getAssetUrl } from '../../utils/formatters';

export const ProductGallery = ({ images = [], title = "Garment" }) => {
  const validImages = images && images.length > 0 ? images : ["/assets/store/storefront-main.jpg"];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeImage = getAssetUrl(validImages[selectedIndex]);

  return (
    <div className="space-y-4">
      {/* Primary Image Viewport */}
      <div className="relative aspect-[4/5] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
        <img
          src={activeImage}
          alt={`${title} - view ${selectedIndex + 1}`}
          className="w-full h-full object-cover object-center transition-all duration-300"
          onError={(e) => {
            e.target.src = "/assets/store/storefront-main.jpg";
          }}
        />
      </div>

      {/* Thumbnail Selector Strip (if more than 1 image) */}
      {validImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                selectedIndex === idx
                  ? 'border-accent-500 ring-2 ring-accent-500/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100'
              }`}
            >
              <img
                src={getAssetUrl(img)}
                alt={`${title} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.target.src = "/assets/store/storefront-main.jpg";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
