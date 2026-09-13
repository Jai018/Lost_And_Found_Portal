import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin, Calendar, Shield, Package,
  CheckCircle, Clock, TrendingUp, MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge, StatCard, ItemCardSkeleton, EmptyState } from '../components/ui';
import { ItemCard } from '../components/items/ItemCard';
import { usersApi } from '../api/client';
import { useAuthStore } from '../store';
import type { User, Item } from '../types';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const isMe = currentUser?._id === id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => usersApi.getById(id!).then((r) => r.data.data as User),
    enabled: !!id,
  });

  const { data: userItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['user-items', id],
    queryFn: () => usersApi.getMyItems({ userId: id, limit: 6 }).then((r) => r.data.data as Item[]),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[--color-bg] pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="h-48 bg-gray-200 dark:bg-navy-800 rounded-3xl animate-pulse" />
          <div className="h-32 bg-gray-200 dark:bg-navy-800 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <EmptyState
          icon={<Shield className="w-10 h-10" />}
          title="Profile not found"
          description="This user profile doesn't exist or has been removed."
          action={<Link to="/browse" className="btn-primary">Browse Items</Link>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--color-bg] pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Profile Header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-card overflow-hidden"
        >
          {/* Cover gradient */}
          <div className="h-28 bg-gradient-to-br from-primary-600 via-primary-700 to-navy-900 relative">
            <div className="absolute inset-0 bg-dot-pattern opacity-20" />
          </div>

          <div className="px-6 pb-6">
            {/* Name and Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-display font-black text-gray-900 dark:text-white">{profile.name}</h1>
                  {profile.isVerified && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-900/50">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
                  <Badge variant={profile.role === 'admin' ? 'info' : 'active'}>
                    {profile.role}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {profile.location && (
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.location}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {format(new Date(profile.joinedAt), 'MMM yyyy')}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 sm:self-end">
                {!isMe && (
                  <Link
                    to={`/chat?user=${id}`}
                    id="message-user-btn"
                    className="btn-primary text-sm py-2 px-4"
                  >
                    <MessageSquare className="w-4 h-4" /> Message
                  </Link>
                )}
                {isMe && (
                  <Link to="/settings" id="edit-profile-btn" className="btn-secondary text-sm py-2 px-4">
                    Edit Profile
                  </Link>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl">{profile.bio}</p>
            )}
          </div>
        </motion.div>

        {/* ── Stats ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title="Items Reported"     value={profile.stats?.itemsReported ?? 0}      icon={<Package className="w-5 h-5" />}      color="primary" />
          <StatCard title="Items Found"        value={profile.stats?.itemsFound ?? 0}          icon={<TrendingUp className="w-5 h-5" />}   color="green" />
          <StatCard title="Successful Returns" value={profile.stats?.successfulReturns ?? 0}   icon={<CheckCircle className="w-5 h-5" />}  color="accent" />
          <StatCard title="Response Rate"      value={`${profile.stats?.responseRate ?? 0}%`}  icon={<Clock className="w-5 h-5" />}        color="blue" />
        </div>

        {/* ── Items ───────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-navy-800">
            <h2 className="font-display font-bold text-gray-900 dark:text-white">
              {isMe ? 'My Items' : `${profile.name.split(' ')[0]}'s Items`}
            </h2>
          </div>
          <div className="p-5">
            {itemsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => <ItemCardSkeleton key={i} />)}
              </div>
            ) : !userItems?.length ? (
              <EmptyState
                icon={<Package className="w-8 h-8" />}
                title="No items yet"
                description="This user hasn't reported any items."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(userItems as Item[]).map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
