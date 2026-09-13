import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Search, Filter, MapPin, Calendar, Eye, X,
  MessageSquare, CheckCircle, AlertTriangle, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { itemsApi } from '../api/client';
import { useAuthStore } from '../store';
import type { Item } from '../types';

const CATEGORIES = [
  'All', 'Electronics', 'Bags & Wallets', 'Keys', 'Clothing',
  'Jewelry', 'Documents', 'Pets', 'Books', 'Sports', 'Other',
];

// ── Finder Tip Modal ──────────────────────────────────────────────────────
const TipModal: React.FC<{ item: Item; onClose: () => void }> = ({ item, onClose }) => {
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');

  const mutation = useMutation({
    mutationFn: () => itemsApi.submitTip(item._id, { message, contact }),
    onSuccess: () => {
      toast.success('Your tip has been sent to the admin. They will contact you to arrange the return.');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to submit tip.');
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="bg-white dark:bg-navy-900 rounded-3xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white">I Found This Item</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-3 mb-4">
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            Your message will be sent <strong>privately to the admin</strong>. They will verify your tip and contact the owner. Please do not share personal information publicly.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Where did you find it / where is it now? *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. I found it near the library entrance. I currently have it with me at the admin office."
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-navy-700 rounded-xl bg-white dark:bg-navy-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Your contact (optional)
            </label>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Phone / email — only shared with admin for verification"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-navy-700 rounded-xl bg-white dark:bg-navy-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!message.trim() || mutation.isPending}
            className="btn-primary flex-1"
          >
            {mutation.isPending ? 'Sending…' : 'Send Tip to Admin'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Item Card for Board ───────────────────────────────────────────────────
const BoardItemCard: React.FC<{ item: Item; onTip: () => void; isLoggedIn: boolean; userId?: string }> = ({ item, onTip, isLoggedIn, userId }) => {
  const daysAgo = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 86400000);
  const ownerId = typeof item.reportedBy === 'object' ? (item.reportedBy as any)?._id : item.reportedBy;
  const isOwner = !!(userId && ownerId && String(userId) === String(ownerId));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 shadow-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Image */}
      {item.images && item.images.length > 0 ? (
        <div className="aspect-video overflow-hidden bg-gray-50 dark:bg-navy-800">
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-primary-50 to-primary-100 dark:from-navy-800 dark:to-navy-700 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-primary-300 dark:text-primary-700" />
        </div>
      )}

      <div className="p-4">
        {/* Status badge */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 uppercase tracking-wide">
            Lost
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <Clock className="w-3 h-3" />
            {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`}
          </span>
        </div>

        <h3 className="font-display font-bold text-gray-900 dark:text-white text-base mb-1 line-clamp-1">{item.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{item.description}</p>

        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mb-4">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location?.building || item.location?.address || 'Campus'}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(item.date), 'dd MMM')}</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.views}</span>
        </div>

        <div className="flex gap-2">
          <Link to={`/items/${item._id}`} className="btn-secondary text-xs py-1.5 flex-1 text-center">
            View Details
          </Link>
          {isLoggedIn && !isOwner ? (
            <button onClick={onTip} className="btn-primary text-xs py-1.5 flex-1 flex items-center justify-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> I Found This
            </button>
          ) : isLoggedIn && isOwner ? (
            <span className="text-xs py-1.5 flex-1 flex items-center justify-center gap-1 text-gray-400 dark:text-gray-500">
              Your item
            </span>
          ) : (
            <Link to="/login" className="btn-primary text-xs py-1.5 flex-1 text-center">
              Sign In to Help
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Board Page ───────────────────────────────────────────────────────
const Board: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const [tipItem, setTipItem]     = useState<Item | null>(null);
  const [page, setPage]           = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['board-items', { search, category, page }],
    queryFn: () => itemsApi.getAll({
      search:   search || undefined,
      category: category === 'All' ? undefined : category,
      page,
      limit: 12,
    }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const items: Item[]  = data?.data  || [];
  const pagination     = data?.pagination;

  return (
    <div className="min-h-screen bg-[--color-bg] pt-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-navy-900 text-white pt-10 pb-14 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-4 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Admin-verified items only</span>
          </div>
          <h1 className="text-4xl font-display font-black mb-2">Organisation Lost & Found Board</h1>
          <p className="text-white/70 max-w-md mx-auto">All items here have been verified and posted by the admin. Spotted something? Hit <strong>"I Found This"</strong> to alert the admin.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6">
        {/* Search & Filters */}
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 shadow-card p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by item name, description..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-navy-700 rounded-xl bg-gray-50 dark:bg-navy-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 dark:border-navy-700 rounded-xl bg-gray-50 dark:bg-navy-800 text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-100 dark:bg-navy-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 dark:bg-navy-800 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 dark:bg-navy-800 rounded w-full" />
                  <div className="h-3 bg-gray-100 dark:bg-navy-800 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-navy-800 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No items found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {search || category !== 'All' ? 'Try adjusting your filters.' : 'The board is currently empty — check back later.'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {pagination?.total ?? items.length} item{(pagination?.total ?? items.length) !== 1 ? 's' : ''} on the board
              </p>
              {!isAuthenticated && (
                <Link to="/login" className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">
                  Sign in to report a lost item →
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {items.map((item) => (
                <BoardItemCard
                  key={item._id}
                  item={item}
                  onTip={() => setTipItem(item)}
                  isLoggedIn={isAuthenticated}
                  userId={user?._id}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 pb-10">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-navy-700 disabled:opacity-40 hover:border-primary-400 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400 px-3">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  disabled={page === pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-navy-700 disabled:opacity-40 hover:border-primary-400 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Tip Modal */}
      <AnimatePresence>
        {tipItem && <TipModal item={tipItem} onClose={() => setTipItem(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default Board;
