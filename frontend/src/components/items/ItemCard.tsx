import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Calendar, Eye, Bookmark, BookmarkCheck,
  Tag, Award, Clock
} from 'lucide-react';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui';
import type { Item } from '../../types';
import { itemsApi } from '../../api/client';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

interface ItemCardProps {
  item: Item;
  view?: 'grid' | 'list';
  onBookmarkToggle?: (id: string, bookmarked: boolean) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, view = 'grid', onBookmarkToggle }) => {
  const { isAuthenticated } = useAuthStore();
  const [bookmarked, setBookmarked] = useState(item.isBookmarked ?? false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const mainImage = item.images?.[0];
  const dateStr = item.date ? formatDistanceToNow(new Date(item.date), { addSuffix: true }) : '';

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please sign in to bookmark items'); return; }
    setBookmarkLoading(true);
    try {
      await itemsApi.bookmark(item._id);
      setBookmarked(!bookmarked);
      onBookmarkToggle?.(item._id, !bookmarked);
    } catch {
      toast.error('Failed to bookmark');
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
      >
        <Link
          to={`/items/${item._id}`}
          className="flex gap-4 p-4 bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 hover:shadow-card-hover hover:border-primary-200 dark:hover:border-primary-800/50 transition-all duration-300 group"
        >
          {/* Image */}
          <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-navy-800">
            {mainImage ? (
              <img src={mainImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                {getCategoryEmoji(item.category)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant={item.type === 'lost' ? 'lost' : 'found'} dot>
                    {item.type === 'lost' ? 'Lost' : 'Found'}
                  </Badge>
                  <Badge variant={item.status === 'resolved' ? 'resolved' : 'active'}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                  {item.reward && item.reward > 0 && (
                    <Badge variant="warning">
                      <Award className="w-3 h-3" />
                      ₹{item.reward} Reward
                    </Badge>
                  )}
                </div>
                <h3 className="font-display font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                  {item.title}
                </h3>
              </div>
              <button
                onClick={handleBookmark}
                disabled={bookmarkLoading}
                className="flex-shrink-0 p-1.5 text-gray-400 hover:text-primary-500 transition-colors"
                aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark item'}
              >
                {bookmarked
                  ? <BookmarkCheck className="w-5 h-5 text-primary-500 fill-primary-100" />
                  : <Bookmark className="w-5 h-5" />
                }
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{item.description}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1 text-primary-500 dark:text-primary-400 font-medium">
                <MapPin className="w-3 h-3" />{item.location?.address || item.location?.city || 'Campus'}
              </span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{dateStr}</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.views} views</span>
              {item.category && (
                <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{item.category}</span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // ─── Grid View ───────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
    >
      <Link
        to={`/items/${item._id}`}
        className="block bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 overflow-hidden hover:shadow-card-hover hover:border-primary-200 dark:hover:border-primary-800/50 transition-all duration-300 group h-full"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-navy-800">
          {mainImage ? (
            <img
              src={mainImage}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30">
              {getCategoryEmoji(item.category)}
            </div>
          )}

          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <Badge variant={item.type === 'lost' ? 'lost' : 'found'} dot>
              {item.type === 'lost' ? 'Lost' : 'Found'}
            </Badge>
            {item.status === 'resolved' && (
              <Badge variant="resolved">Resolved</Badge>
            )}
          </div>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            disabled={bookmarkLoading}
            className={clsx(
              'absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md border transition-all duration-200',
              bookmarked
                ? 'bg-primary-600 border-primary-500 text-white'
                : 'bg-white/80 dark:bg-navy-900/80 border-white/20 text-gray-500 hover:text-primary-600 hover:bg-white'
            )}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            {bookmarked
              ? <BookmarkCheck className="w-4 h-4" />
              : <Bookmark className="w-4 h-4" />
            }
          </button>

          {/* Reward badge */}
          {item.reward && item.reward > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-accent-500 text-white text-xs font-bold rounded-full shadow-md">
              <Award className="w-3 h-3" />
              ₹{item.reward}
            </div>
          )}

          {/* Multiple images indicator */}
          {item.images?.length > 1 && (
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 text-white text-xs font-medium rounded-lg backdrop-blur-sm">
              +{item.images.length - 1} photos
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4">
          <h3 className="font-display font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1 text-base">
            {item.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>

          {/* Tags */}
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-navy-800 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1 truncate max-w-[65%] text-gray-600 dark:text-gray-300 font-medium">
              <MapPin className="w-3 h-3 flex-shrink-0 text-primary-500" />
              <span className="truncate">{item.location?.address || item.location?.city || 'Campus'}</span>
            </span>
            <span className="flex items-center gap-1 flex-shrink-0"><Clock className="w-3 h-3" />{dateStr}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    'Electronics': '📱',
    'Bags & Wallets': '👜',
    'Keys': '🔑',
    'Clothing': '👕',
    'Jewelry': '💍',
    'Documents': '📄',
    'Pets': '🐾',
    'Books': '📚',
    'Sports': '⚽',
    'Toys': '🧸',
    'Musical Instruments': '🎸',
    'Vehicles': '🚗',
    'Other': '📦',
  };
  return map[category] || '📦';
}
