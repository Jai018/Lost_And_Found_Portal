import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Calendar, Eye, Bookmark, BookmarkCheck, Share2,
  Flag, Award, MessageSquare, ChevronLeft, ChevronRight,
  Shield, CheckCircle, CheckCircle2, AlertCircle, Clock, Tag, Send
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';
import { Badge, Button, Modal } from '../components/ui';
import { ItemCard } from '../components/items/ItemCard';
import { itemsApi } from '../api/client';
import { useAuthStore } from '../store';
import type { Item } from '../types';

const ItemDetail: React.FC = () => {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [imageIdx, setImageIdx]   = useState(0);
  const [tipOpen, setTipOpen]     = useState(false);
  const [tipText, setTipText]     = useState('');
  const [bookmarked, setBookmarked] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['item', id],
    queryFn: () => itemsApi.getById(id!).then((r) => r.data.data as Item),
    enabled: !!id,
  });

  const { data: relatedData } = useQuery({
    queryKey: ['related', id],
    queryFn: () => itemsApi.getRelated(id!).then((r) => r.data.data as Item[]),
    enabled: !!id,
  });

  useEffect(() => { if (id) { itemsApi.incrementView(id).catch(() => {}); } }, [id]);
  useEffect(() => { if (data) { setBookmarked(data.isBookmarked ?? false); } }, [data]);

  const queryClient = useQueryClient();

  // ── Finder tip mutation ───────────────────────────────────────────────────
  const tipMutation = useMutation({
    mutationFn: (tip: string) => itemsApi.submitTip(id!, { tip: tip }),
    onSuccess: () => {
      toast.success('Your tip has been sent to the admin privately!');
      setTipOpen(false);
      setTipText('');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to send tip. Please try again.'),
  });

  // ── Resolve mutation (owner marks item as found) ──────────────────────────
  const resolveMutation = useMutation({
    mutationFn: () => itemsApi.resolve(id!),
    onSuccess: () => {
      toast.success('🎉 Congratulations! Your item is marked as found.');
      queryClient.invalidateQueries({ queryKey: ['item', id] });
      queryClient.invalidateQueries({ queryKey: ['board-items'] });
      queryClient.invalidateQueries({ queryKey: ['my-reports'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to mark item as resolved.'),
  });

  const handleTip = () => {
    if (!tipText.trim()) { toast.error('Please describe where you spotted the item.'); return; }
    tipMutation.mutate(tipText.trim());
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) { toast.error('Please sign in to bookmark'); return; }
    try {
      await itemsApi.bookmark(id!);
      setBookmarked(!bookmarked);
    } catch { toast.error('Failed to bookmark'); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const item   = data;
  const owner  = item && typeof item.reportedBy === 'object' ? item.reportedBy : null;
  const ownerId = item ? (typeof item.reportedBy === 'object' ? (item.reportedBy as any)?._id : item.reportedBy) : null;
  const currentUserId = user?._id || (user as any)?.id;
  const isOwner = !!(currentUserId && ownerId && String(currentUserId) === String(ownerId));
  const images = item?.images || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[--color-bg] pt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-[4/3] bg-gray-200 dark:bg-navy-800 rounded-2xl animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-navy-800 rounded-xl animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-navy-800 rounded-xl animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 dark:bg-navy-800 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Item not found</h2>
          <Link to="/browse" className="btn-primary mt-4">Browse Items</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--color-bg] pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Breadcrumb ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link to="/browse" className="hover:text-primary-600 dark:hover:text-primary-400">Browse</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium line-clamp-1">{item.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Left: Images + Details ──────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Image Gallery */}
            <div className="relative bg-gray-100 dark:bg-navy-900 rounded-3xl overflow-hidden">
              <div className="aspect-[4/3] relative">
                {images.length > 0 ? (
                  <>
                    <motion.img
                      key={imageIdx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={images[imageIdx]}
                      alt={`${item.title} - photo ${imageIdx + 1}`}
                      className="w-full h-full object-contain bg-gray-50 dark:bg-navy-950"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          id="gallery-prev-btn"
                          onClick={() => setImageIdx((i) => (i - 1 + images.length) % images.length)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/80 dark:bg-navy-900/80 backdrop-blur-sm rounded-xl hover:bg-white dark:hover:bg-navy-800 transition-colors shadow-md"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          id="gallery-next-btn"
                          onClick={() => setImageIdx((i) => (i + 1) % images.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/80 dark:bg-navy-900/80 backdrop-blur-sm rounded-xl hover:bg-white dark:hover:bg-navy-800 transition-colors shadow-md"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setImageIdx(i)}
                              className={`w-2 h-2 rounded-full transition-all ${i === imageIdx ? 'bg-white w-5' : 'bg-white/50'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950/20 dark:to-accent-950/20">
                    📦
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImageIdx(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === imageIdx ? 'border-primary-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-80'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Item Info */}
            <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 p-6 shadow-card space-y-5">
              {/* Title row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant={item.type === 'lost' ? 'lost' : 'found'} dot>
                      {item.type === 'lost' ? 'Lost' : 'Found'}
                    </Badge>
                    <Badge variant={item.status === 'resolved' ? 'resolved' : 'active'}>
                      {item.status}
                    </Badge>
                    {item.reward && item.reward > 0 && (
                      <Badge variant="warning">
                        <Award className="w-3 h-3" />₹{item.reward} Reward
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-display font-black text-gray-900 dark:text-white">{item.title}</h1>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    id="detail-bookmark-btn"
                    onClick={handleBookmark}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-navy-700 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-all"
                  >
                    {bookmarked ? <BookmarkCheck className="w-5 h-5 text-primary-500" /> : <Bookmark className="w-5 h-5 text-gray-500" />}
                  </button>
                  <button
                    id="detail-share-btn"
                    onClick={copyLink}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-navy-700 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-all"
                  >
                    <Share2 className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary-400" />{item.location?.address || item.location?.city || 'Campus Location'}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary-400" />{item.date ? format(new Date(item.date), 'dd MMM yyyy') : '—'}</span>
                <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-primary-400" />{item.views} views</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary-400" />{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{item.description}</p>
              </div>

              {/* AI Description */}
              {item.aiDescription && (
                <div className="p-4 bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-900/50 rounded-2xl">
                  <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1.5 mb-2">
                    ✨ AI-Enhanced Description
                  </p>
                  <p className="text-sm text-primary-800 dark:text-primary-300">{item.aiDescription}</p>
                </div>
              )}

              {/* Tags */}
              {item.tags?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-2"><Tag className="w-4 h-4" />Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <Link key={tag} to={`/browse?q=${tag}`} className="px-2.5 py-1 bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-400 text-xs rounded-full hover:bg-primary-100 dark:hover:bg-primary-950/30 hover:text-primary-600 transition-colors">
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>



            {/* Related Items */}
            {relatedData && relatedData.length > 0 && (
              <div>
                <h3 className="font-display font-bold text-gray-900 dark:text-white mb-4">Related Items</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedData.slice(0, 4).map((relItem) => (
                    <ItemCard key={relItem._id} item={relItem} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right Sidebar ────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Reporter Card */}
            <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 p-5 shadow-card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                {item.type === 'lost' ? 'Reported By' : 'Found By'}
              </h3>
              {owner ? (
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900 dark:text-white">{owner.name}</p>
                  {owner.department && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{owner.department}</p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Member since {owner.createdAt ? format(new Date(owner.createdAt), 'MMM yyyy') : '—'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Reporter info hidden for privacy</p>
              )}
            </div>

            {/* Action Card: I Found This */}
            {!isOwner && item.status === 'active' && (
              <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 p-5 shadow-card space-y-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Spotted this item?
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  If you've seen or found this item on campus, alert the admin privately. They'll verify and help return it to the owner.
                </p>
                <Button
                  id="tip-btn"
                  fullWidth
                  size="lg"
                  onClick={() => {
                    if (!isAuthenticated) { toast.error('Please sign in first'); navigate('/login'); return; }
                    setTipOpen(true);
                  }}
                >
                  <MessageSquare className="w-4 h-4" /> I Found This
                </Button>
              </div>
            )}

            {/* Owner actions */}
            {isOwner && (
              <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-900/50 rounded-3xl p-5 space-y-3">
                <p className="text-sm font-semibold text-primary-800 dark:text-primary-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary-600" /> This is your listing
                </p>

                {item.status === 'active' ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      Did you find your item? Mark it as found to announce the recovery and remove it from the active board.
                    </p>
                    <button
                      onClick={() => resolveMutation.mutate()}
                      disabled={resolveMutation.isPending}
                      className="w-full btn-primary bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {resolveMutation.isPending ? 'Marking Found…' : '🎉 I Found It! (Mark as Resolved)'}
                    </button>
                  </div>
                ) : item.status === 'resolved' ? (
                  <div className="p-3 bg-emerald-100/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-center">
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1.5">
                      🎉 Recovered & Resolved
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                      This item has been successfully recovered.
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-col gap-2 pt-1">
                  <Link to={`/report?edit=${id}`} className="btn-secondary text-sm py-2 justify-center">Edit Item</Link>
                  {item.claims?.length > 0 && (
                    <Link to={`/dashboard?claims=true`} className="btn-primary text-sm py-2 justify-center">
                      Review {item.claims.length} Claim{item.claims.length > 1 ? 's' : ''}
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Safety Tips */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-3xl p-5">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4" /> Safety Tips
              </p>
              <ul className="space-y-2 text-xs text-amber-700 dark:text-amber-500">
                <li>• Meet in a public, well-lit location</li>
                <li>• Verify ownership before handing over</li>
                <li>• Never share personal info publicly</li>
                <li>• Report suspicious behavior immediately</li>
              </ul>
            </div>

            {/* Report button */}
            <button
              id="report-item-btn"
              onClick={() => toast.success('Report submitted for admin review.')}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              <Flag className="w-4 h-4" /> Report this listing
            </button>
          </div>
        </div>
      </div>

      {/* ── "I Found This" Tip Modal ─────────────────────────────────── */}
      <Modal
        open={tipOpen}
        onClose={() => { setTipOpen(false); setTipText(''); }}
        title="Send a Finder Tip"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl">
            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Your tip is sent <strong>privately to the admin only</strong>. They will verify and arrange the return. Your details are never shared publicly.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Where did you spot it? *
            </label>
            <textarea
              id="tip-text"
              value={tipText}
              onChange={(e) => setTipText(e.target.value)}
              rows={4}
              placeholder="e.g. I found a blue laptop bag near the Library entrance, 2nd floor…"
              className="input-field text-sm resize-none w-full"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" fullWidth onClick={() => { setTipOpen(false); setTipText(''); }}>Cancel</Button>
            <Button
              id="submit-tip-btn"
              fullWidth
              loading={tipMutation.isPending}
              onClick={handleTip}
              icon={<Send className="w-4 h-4" />}
            >
              Send Tip
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ItemDetail;
