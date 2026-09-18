import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, X, SlidersHorizontal } from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSort, setSelectedSort] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data || []);
      } catch {
        // Fallback categories if empty
        setCategories([]);
      }
    };
    fetchCats();
  }, []);

  // Fetch Products based on filters
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (inStockOnly) params.in_stock_only = true;
      if (selectedSort && selectedSort !== 'featured') params.sort = selectedSort;

      const data = await productService.getProducts(params);
      setProducts(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedSort, inStockOnly]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync URL search params
  const handleCategorySelect = (catId) => {
    const newCat = selectedCategory === catId ? '' : catId;
    setSelectedCategory(newCat);
    if (newCat) {
      searchParams.set('category', newCat);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchParams.set('search', searchTerm.trim());
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
    fetchProducts();
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSort('featured');
    setInStockOnly(false);
    setSearchParams({});
  };

  const hasActiveFilters = !!searchTerm || !!selectedCategory || inStockOnly || selectedSort !== 'featured';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">
            Rainbow Ready Mades Collection
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mt-1">
            Browse Clothing Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real garments, authentic photos, and verified in-store stock.
          </p>
        </div>

        {/* Total counts & Mobile Filter trigger */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <span className="text-xs font-medium text-slate-500">
            Showing <strong>{products.length}</strong> {products.length === 1 ? 'garment' : 'garments'}
          </span>
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-700 shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 items-start">
        
        {/* Desktop Filter Sidebar */}
        <aside className={`md:block ${mobileFilterOpen ? 'block' : 'hidden'} md:col-span-1 lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6`}>
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-accent-600" />
              <span>Filters</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-accent-600 hover:text-accent-700 font-semibold"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Keywords, fabric..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-accent-500 outline-none transition"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </form>

          {/* Categories Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Categories
            </label>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => handleCategorySelect('')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${
                  selectedCategory === ''
                    ? 'bg-accent-50 text-accent-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Apparel
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition flex justify-between items-center ${
                    selectedCategory === cat.id
                      ? 'bg-accent-50 text-accent-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {cat.product_count !== undefined && (
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                      {cat.product_count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sorting Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort By</span>
            </label>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-accent-500 outline-none"
            >
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>

          {/* In Stock Only Checkbox */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-accent-600 focus:ring-accent-500 border-slate-300"
              />
              <span>In-Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Products Grid Content Area */}
        <div className="md:col-span-3 lg:col-span-4">
          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs text-slate-400">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-slate-200 text-slate-800">
                  Keyword: "{searchTerm}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-accent-100 text-accent-800">
                  Category: {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleCategorySelect('')} />
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800">
                  In Stock Only
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setInStockOnly(false)} />
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-accent-600 hover:underline ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid / Loading / Error */}
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchProducts} />
          ) : (
            <ProductGrid
              products={products}
              emptyTitle="No garments match your criteria"
              emptyDescription="Try clearing your filters or searching for another garment style."
            />
          )}
        </div>
      </div>
    </div>
  );
};
