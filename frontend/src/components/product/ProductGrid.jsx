import React from 'react';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../common/EmptyState';

export const ProductGrid = ({ products = [], emptyTitle, emptyDescription }) => {
  if (!products || products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle || "No products found"}
        description={emptyDescription || "Try adjusting your filters or search terms."}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
