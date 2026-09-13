import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Package, CheckCircle, CheckCircle2, Clock,
  Search, ChevronRight, FileText,
  Eye, XCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { reportsApi, itemsApi } from '../api/client';
import { useAuthStore } from '../store';

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active:   { label: 'Live on Board',  color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  pending:  { label: 'Pending',        color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',         icon: <Clock className="w-3.5 h-3.5" /> },
  resolved: { label: 'Resolved',       color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',                icon: <CheckCircle className="w-3.5 h-3.5" /> },
  rejected: { label: 'Removed',        color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',                 icon: <XCircle className="w-3.5 h-3.5" /> },
};

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({ queryKey: ['my-reports'], queryFn: () => reportsApi.getMine().then((r) => r.data.data) });

  const resolveMutation = useMutation({
    mutationFn: (itemId: string) => itemsApi.resolve(itemId),
    onSuccess: () => {
      toast.success('🎉 Marked as found! Your listing has been resolved.');
      queryClient.invalidateQueries({ queryKey: ['my-reports'] });
      queryClient.invalidateQueries({ queryKey: ['board-items'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to mark item as resolved.');
    },
  });

  const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

  const active   = (reports as any[] | undefined)?.filter((r) => r.status === 'active').length || 0;
  const resolved = (reports as any[] | undefined)?.filter((r) => r.status === 'resolved').length || 0;

  return (
    <div className="min-h-screen bg-[--color-bg] pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Header ────────────────────────────────────────────────── */}
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <motion.div variants={fadeIn} className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-display font-black text-gray-900 dark:text-white">
                Welcome back, {user?.name?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.department ? `${user.department}` : 'Organisation Member'}
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeIn} className="flex gap-3">
            <Link to="/board" id="view-board-btn" className="btn-secondary text-sm py-2.5 px-4 flex items-center gap-2">
              <Eye className="w-4 h-4" /> View Board
            </Link>
            <Link to="/report" id="report-lost-btn" className="btn-primary text-sm py-2.5 px-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Report Lost Item
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Stats Row ─────────────────────────────────────────────── */}
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: 'My Reports',  value: (reports as any[] | undefined)?.length ?? 0, icon: <FileText className="w-5 h-5 text-primary-600" />,  color: 'bg-primary-100 dark:bg-primary-950/30' },
            { label: 'Live on Board', value: active,    icon: <CheckCircle className="w-5 h-5 text-emerald-600" />, color: 'bg-emerald-100 dark:bg-emerald-950/30' },
            { label: 'Resolved',      value: resolved,  icon: <Clock className="w-5 h-5 text-gray-500" />,          color: 'bg-gray-100 dark:bg-gray-800' },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeIn}
              className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 p-4 shadow-card flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
              <div>
                <p className="text-2xl font-display font-black text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── My Reports List ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-gray-900 dark:text-white text-lg">My Reports</h2>
            <Link to="/report" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              + New report
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-navy-800 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 dark:bg-navy-800 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 dark:bg-navy-800 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !reports?.length ? (
            <div className="bg-white dark:bg-navy-900 rounded-2xl border border-dashed border-gray-200 dark:border-navy-700 p-12 text-center">
              <Package className="w-10 h-10 text-gray-300 dark:text-navy-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No reports yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Lost something? Report it and it will be posted to the board instantly for others to see.
              </p>
              <Link to="/report" className="btn-primary">Report a Lost Item</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {(reports as any[]).map((report) => {
                const s = STATUS_MAP[report.status] || STATUS_MAP.pending;
                return (
                  <div key={report._id} className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 p-4 shadow-card">
                    <div className="flex items-start gap-3">
                      {report.images?.[0] ? (
                        <img src={report.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-navy-800 flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{report.title}</h3>
                          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${s.color}`}>
                            {s.icon} {s.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-1.5">{report.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                          <span>📍 {report.locationDetails}</span>
                          <span>🕐 {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}</span>
                        </div>

                        {/* Admin note / reply */}
                        {report.adminNote && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                            <p className="text-xs text-blue-700 dark:text-blue-400">
                              <span className="font-semibold">Admin: </span>{report.adminNote}
                            </p>
                          </div>
                        )}

                        {/* Actions for report */}
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          {report.status === 'active' && (
                            <>
                              <Link to={`/items/${report._id}`}
                                className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
                                <Eye className="w-3.5 h-3.5" /> View on board <ChevronRight className="w-3 h-3" />
                              </Link>
                              <button
                                onClick={() => resolveMutation.mutate(report._id)}
                                disabled={resolveMutation.isPending}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                {resolveMutation.isPending ? 'Marking…' : 'I Found It! (Mark Resolved)'}
                              </button>
                            </>
                          )}
                          {report.status === 'resolved' && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="w-3.5 h-3.5" /> Successfully Recovered
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── Quick links ──────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-8">
          <h2 className="font-display font-bold text-gray-900 dark:text-white text-lg mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: <Search className="w-5 h-5 text-primary-600" />, label: 'Browse the Board', to: '/board', color: 'bg-primary-50 dark:bg-primary-950/20' },
              { icon: <Plus className="w-5 h-5 text-emerald-600" />,   label: 'Report Lost Item',  to: '/report', color: 'bg-emerald-50 dark:bg-emerald-950/20' },
              { icon: <FileText className="w-5 h-5 text-purple-600" />, label: 'My Profile',       to: `/profile/${user?._id}`, color: 'bg-purple-50 dark:bg-purple-950/20' },
            ].map((q) => (
              <Link key={q.label} to={q.to}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 dark:border-navy-800 text-center hover:border-primary-300 transition-all ${q.color}`}
              >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-navy-900 flex items-center justify-center shadow-sm">{q.icon}</div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{q.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;
