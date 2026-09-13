import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Search, SlidersHorizontal, LayoutGrid, List,
  ChevronLeft, ChevronRight, X, Sparkles
} from 'lucide-react';
import { Select, ItemCardSkeleton, EmptyState } from '../components/ui';
import { ItemCard } from '../components/items/ItemCard';
import { itemsApi } from '../api/client';
import type { Item, ItemFilters, ItemCategory, ItemType } from '../types';
import { clsx } from 'clsx';

const CATEGORIES: ItemCategory[] = [
  'Electronics', 'Bags & Wallets', 'Keys', 'Clothing', 'Jewelry',
  'Documents', 'Pets', 'Books', 'Sports', 'Toys', 'Musical Instruments', 'Vehicles', 'Other'
];

const SORT_OPTIONS = [
  { value: 'newest',      label: 'Newest First' },
  { value: 'oldest',      label: 'Oldest First' },
  { value: 'most-viewed', label: 'Most Viewed' },
];

const Browse: React.FC = () => {
  const [params, setParams]               = useSearchParams();
  const [filtersOpen, setFiltersOpen]     = useState(false);
  const [viewMode, setViewMode]           = useState<'grid' | 'list'>('grid');
  const [searchInput, setSearchInput]     = useState(params.get('q') || '');

  const [filters, setFilters] = useState<ItemFilters>({
    type:     (params.get('type') as ItemType) || undefined,
    category: (params.get('category') as ItemCategory) || undefined,
    search:   params.get('q') || undefined,
    sortBy:   'newest',
    page:     1,
    limit:    12,
  });

  // ── Sync params → filters ──────────────────────────────────────────────
  useEffect(() => {
    setFilters((f) => ({
      ...f,
      search:   params.get('q') || undefined,
      type:     (params.get('type') as ItemType) || undefined,
      category: (params.get('category') as ItemCategory) || undefined,
      page: 1,
    }));
    setSearchInput(params.get('q') || '');
  }, [params]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['items', filters],
    queryFn:  () => itemsApi.getAll(filters).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const items: Item[]   = data?.data || [];
  const pagination      = data?.pagination;
  const totalPages      = pagination?.pages || 1;

  const updateFilter = useCallback((key: keyof ItemFilters, value: any) => {
    setFilters((f) => ({ ...f, [key]: value || undefined, page: 1 }));
  }, []);

  const clearFilters = () => {
    setFilters({ sortBy: 'newest', page: 1, limit: 12 });
    setSearchInput('');
    setParams({});
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchInput.trim() || undefined);
    const p = new URLSearchParams(params);
    searchInput.trim() ? p.set('q', searchInput.trim()) : p.delete('q');
    setParams(p);
  };

  const activeFilterCount = [filters.type, filters.category, filters.hasReward, filters.dateFrom].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[--color-bg] pt-16">
      {/* ── Search Header ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-navy-900 py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white mb-2">Browse Campus Items</h1>
          <p className="text-white/70 text-sm mb-6">Search through campus lost and found reports</p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="browse-search-input"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder='e.g. "black iPhone" or use AI: "lost near Library yesterday"'
                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-navy-900 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 dark:text-white placeholder-gray-400 shadow-lg text-sm"
              />
              {searchInput && (
                <button type="button" onClick={() => setSearchInput('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button type="submit" id="browse-search-btn" className="px-6 py-3.5 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-colors shadow-lg text-sm whitespace-nowrap">
              Search
            </button>
          </form>

          {/* AI Search badge */}
          <div className="flex items-center justify-center gap-1.5 mt-3 text-white/60 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-accent-300" />
            <span>AI-powered natural language search enabled</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Type Tabs ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            {([undefined, 'lost', 'found'] as const).map((type) => (
              <button
                key={type ?? 'all'}
                id={`filter-tab-${type ?? 'all'}`}
                onClick={() => updateFilter('type', type)}
                className={clsx(
                  'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                  filters.type === type
                    ? type === 'lost'  ? 'bg-red-500 text-white'
                      : type === 'found' ? 'bg-emerald-500 text-white'
                      : 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-700 text-gray-600 dark:text-gray-400 hover:border-primary-400'
                )}
              >
                {type === undefined ? 'All Items' : type === 'lost' ? '🔴 Lost' : '🟢 Found'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              id="browse-sort-select"
              className="input-field py-2 text-sm w-auto pr-8"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Filter toggle */}
            <button
              id="browse-filter-btn"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all',
                filtersOpen || activeFilterCount > 0
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white dark:bg-navy-900 border-gray-200 dark:border-navy-700 text-gray-600 dark:text-gray-400'
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-white/20 rounded-full text-xs flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View mode */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-navy-700">
              <button id="view-grid-btn" onClick={() => setViewMode('grid')} className={clsx('p-2.5', viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-navy-900 text-gray-400')}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button id="view-list-btn" onClick={() => setViewMode('list')} className={clsx('p-2.5', viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-navy-900 text-gray-400')}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Filter Panel ──────────────────────────────────────────── */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 p-5 shadow-card">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                  <Select
                    label="Category"
                    value={filters.category || ''}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    id="filter-category"
                    options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                    placeholder="All categories"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date From</label>
                    <input
                      type="date"
                      id="filter-date-from"
                      value={filters.dateFrom || ''}
                      onChange={(e) => updateFilter('dateFrom', e.target.value)}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date To</label>
                    <input
                      type="date"
                      id="filter-date-to"
                      value={filters.dateTo || ''}
                      onChange={(e) => updateFilter('dateTo', e.target.value)}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Campus Location</label>
                    <input
                      type="text"
                      id="filter-city"
                      value={filters.city || ''}
                      onChange={(e) => updateFilter('city', e.target.value)}
                      placeholder="e.g. Library, Canteen, Lab..."
                      className="input-field text-sm"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <label className="flex items-center gap-2 cursor-pointer pb-3">
                      <input
                        type="checkbox"
                        id="filter-reward"
                        checked={filters.hasReward || false}
                        onChange={(e) => updateFilter('hasReward', e.target.checked ? true : undefined)}
                        className="w-4 h-4 rounded text-primary-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Has Reward</span>
                    </label>
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} id="clear-filters-btn" className="btn-ghost text-sm py-2 px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 mb-0.5">
                        <X className="w-4 h-4" /> Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isFetching ? 'Searching…' : (
              <>
                <span className="font-semibold text-gray-900 dark:text-white">{pagination?.total ?? 0}</span> items found
                {filters.search && <> for "<span className="text-primary-600 dark:text-primary-400">{filters.search}</span>"</>}
              </>
            )}
          </p>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium">
              <X className="w-3 h-3" /> Clear all filters
            </button>
          )}
        </div>

        {/* ── Items Grid ────────────────────────────────────────────── */}
        {isLoading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5' : 'space-y-3'}>
            {[...Array(8)].map((_, i) => <ItemCardSkeleton key={i} />)}
          </div>
        ) : !items.length ? (
          <EmptyState
            icon={<Search className="w-10 h-10" />}
            title="No items found"
            description={
              filters.search
                ? `No results for "${filters.search}". Try different keywords or clear filters.`
                : "No items match your current filters. Try adjusting them."
            }
            action={<button onClick={clearFilters} className="btn-primary text-sm">Clear Filters</button>}
          />
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5' : 'space-y-3'}>
            <AnimatePresence>
              {items.map((item) => (
                <ItemCard key={item._id} item={item} view={viewMode} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              id="page-prev-btn"
              onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))}
              disabled={filters.page === 1}
              className="btn-secondary py-2 px-3 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min((filters.page || 1) - 2, totalPages - 4));
              const p = start + i;
              return (
                <button
                  key={p}
                  id={`page-${p}-btn`}
                  onClick={() => setFilters((f) => ({ ...f, page: p }))}
                  className={clsx(
                    'w-10 h-10 rounded-xl text-sm font-semibold transition-all',
                    filters.page === p
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-700 text-gray-700 dark:text-gray-300 hover:border-primary-400'
                  )}
                >
                  {p}
                </button>
              );
            })}
            <button
              id="page-next-btn"
              onClick={() => setFilters((f) => ({ ...f, page: Math.min(totalPages, (f.page || 1) + 1) }))}
              disabled={filters.page === totalPages}
              className="btn-secondary py-2 px-3 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
