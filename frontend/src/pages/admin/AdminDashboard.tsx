import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard, FileText, Clipboard, Users,
  CheckCircle, XCircle, Eye, MessageSquare,
  Clock, AlertTriangle, ChevronRight,
  X, ShieldCheck, Package
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/client';

type Tab = 'overview' | 'reports' | 'board' | 'users';

// ── Stat Card ─────────────────────────────────────────────────────────────
const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string; note?: string }> =
  ({ title, value, icon, color, note }) => (
  <div className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 p-5 shadow-card">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    </div>
    <p className="text-3xl font-display font-black text-gray-900 dark:text-white">{value}</p>
    {note && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{note}</p>}
  </div>
);

// ── Publish Modal ─────────────────────────────────────────────────────────
const PublishModal: React.FC<{
  report: any;
  onClose: () => void;
  onPublish: (id: string, note: string) => void;
  loading: boolean;
}> = ({ report, onClose, onPublish, loading }) => {
  const [note, setNote] = useState('');
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-navy-900 rounded-3xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-gray-900 dark:text-white text-lg">Publish to Board</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{report.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-800"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-3 mb-4">
          <p className="text-xs text-emerald-700 dark:text-emerald-400">This will create a public post on the organisation board. All members will be able to see it and submit tips.</p>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note to the reporter (e.g. 'Your item has been posted to the board')..."
          rows={3}
          className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-navy-700 rounded-xl bg-gray-50 dark:bg-navy-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => onPublish(report._id, note)} disabled={loading} className="btn-primary flex-1">
            {loading ? 'Publishing…' : 'Publish to Board'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Reject Modal ──────────────────────────────────────────────────────────
const RejectModal: React.FC<{
  report: any;
  onClose: () => void;
  onReject: (id: string, reason: string) => void;
  loading: boolean;
}> = ({ report, onClose, onReject, loading }) => {
  const [reason, setReason] = useState('');
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-navy-900 rounded-3xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-gray-900 dark:text-white text-lg">Reject Report</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{report.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-800"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection (shown to the reporter)..."
          rows={3}
          required
          className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-navy-700 rounded-xl bg-gray-50 dark:bg-navy-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => onReject(report._id, reason)} disabled={loading || !reason.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50">
            {loading ? 'Rejecting…' : 'Reject Report'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Main Admin Dashboard ──────────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
  const [tab, setTab]             = useState<Tab>('overview');
  const [publishModal, setPublishModal] = useState<any>(null);
  const [rejectModal, setRejectModal]   = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const qc = useQueryClient();

  const { data: stats }   = useQuery({ queryKey: ['admin-stats'],   queryFn: () => adminApi.getStats().then((r) => r.data.data), refetchInterval: 30000 });
  const { data: reports } = useQuery({ queryKey: ['admin-reports'],  queryFn: () => adminApi.getReports({ status: 'pending', limit: 50 }).then((r) => r.data.data), enabled: tab === 'reports' });
  const { data: items }   = useQuery({ queryKey: ['admin-board'],    queryFn: () => adminApi.getItems({ status: 'active', limit: 50 }).then((r) => r.data.data), refetchInterval: 30000 });
  const { data: users }   = useQuery({ queryKey: ['admin-users'],    queryFn: () => adminApi.getUsers({ limit: 50 }).then((r) => r.data.data), enabled: tab === 'users' });
  const { data: tips }    = useQuery({ queryKey: ['admin-tips', selectedItem?._id], queryFn: () => adminApi.getItemTips(selectedItem._id).then((r) => r.data.data), enabled: !!selectedItem });

  // Count new (unread) tips across all board items
  const newTipsCount = (items as any[] | undefined)?.reduce((sum: number, item: any) => {
    return sum + (item.finderTips?.filter((t: any) => t.status === 'new').length || 0);
  }, 0) ?? 0;

  const publishMut = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => adminApi.publishReport(id, note),
    onSuccess: () => { toast.success('Report published to the board!'); setPublishModal(null); qc.invalidateQueries({ queryKey: ['admin-reports'] }); qc.invalidateQueries({ queryKey: ['admin-stats'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to publish.'),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.rejectReport(id, reason),
    onSuccess: () => { toast.success('Report rejected.'); setRejectModal(null); qc.invalidateQueries({ queryKey: ['admin-reports'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to reject.'),
  });

  const resolveMut = useMutation({
    mutationFn: (id: string) => adminApi.resolveItem(id),
    onSuccess: () => { toast.success('Item marked as returned!'); qc.invalidateQueries({ queryKey: ['admin-board'] }); qc.invalidateQueries({ queryKey: ['admin-stats'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed.'),
  });

  const tipMut = useMutation({
    mutationFn: ({ tipId, status }: { tipId: string; status: string }) =>
      adminApi.updateTipStatus(selectedItem._id, tipId, status),
    onSuccess: () => { toast.success('Tip status updated.'); qc.invalidateQueries({ queryKey: ['admin-tips', selectedItem?._id] }); },
  });

  const banMut = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? adminApi.unbanUser(id) : adminApi.banUser(id),
    onSuccess: (_data, vars) => {
      toast.success(vars.active ? 'User re-activated.' : 'User banned.');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed.'),
  });

  const TABS = [
    { id: 'overview', label: 'Overview',      icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'reports',  label: 'Report Queue',  icon: <FileText className="w-4 h-4" />,      badge: stats?.pendingReports },
    { id: 'board',    label: 'Active Board',  icon: <Clipboard className="w-4 h-4" />,     badge: newTipsCount || undefined },
    { id: 'users',    label: 'Members',       icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[--color-bg] pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-primary-500" />
            <h1 className="text-2xl font-display font-black text-gray-900 dark:text-white">Admin Dashboard</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Review reports, manage the board, and verify lost item returns.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-navy-800 rounded-2xl p-1 mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center ${
                tab === t.id
                  ? 'bg-white dark:bg-navy-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t.icon} {t.label}
              {t.badge ? (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{t.badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Pending Reports"   value={stats?.pendingReports ?? '–'}  icon={<Clock className="w-4 h-4 text-amber-600" />}   color="bg-amber-100 dark:bg-amber-950/30"  note="Awaiting your review" />
              <StatCard title="Active on Board"   value={stats?.activeItems ?? '–'}     icon={<Package className="w-4 h-4 text-primary-600" />} color="bg-primary-100 dark:bg-primary-950/30" note="Visible to members" />
              <StatCard title="Items Returned"    value={stats?.resolvedItems ?? '–'}   icon={<CheckCircle className="w-4 h-4 text-emerald-600" />} color="bg-emerald-100 dark:bg-emerald-950/30" note="Successfully closed" />
              <StatCard title="Total Members"     value={stats?.totalUsers ?? '–'}      icon={<Users className="w-4 h-4 text-blue-600" />}     color="bg-blue-100 dark:bg-blue-950/30" />
            </div>

            {/* New Tips Alert */}
            {newTipsCount > 0 && (
              <div className="flex items-center justify-between gap-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900 dark:text-amber-300 text-sm">
                      {newTipsCount} new finder tip{newTipsCount !== 1 ? 's' : ''} waiting
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-500">
                      Members have spotted items and sent you private tips. Review them in Active Board.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTab('board')}
                  className="flex-shrink-0 text-xs font-semibold px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors"
                >
                  View Tips →
                </button>
              </div>
            )}

            <div className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 p-5 shadow-card">
              <h2 className="font-display font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { step: '1', title: 'Member Reports', desc: 'A member submits a lost item report privately via the app.', icon: <FileText className="w-5 h-5 text-primary-500" /> },
                  { step: '2', title: 'You Review & Post', desc: 'You review the report and publish it to the organisation board.', icon: <Eye className="w-5 h-5 text-amber-500" /> },
                  { step: '3', title: 'Finder Tips → Verify', desc: 'Members submit tips. You verify, arrange handoff, mark resolved.', icon: <ShieldCheck className="w-5 h-5 text-emerald-500" /> },
                ].map((s) => (
                  <div key={s.step} className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-navy-800">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-navy-700 border border-gray-200 dark:border-navy-600 flex items-center justify-center text-xs font-bold text-gray-500">{s.step}</div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">{s.icon}<p className="text-sm font-semibold text-gray-900 dark:text-white">{s.title}</p></div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── REPORT QUEUE ─────────────────────────────────────────────── */}
        {tab === 'reports' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {!reports?.length ? (
              <div className="text-center py-16">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white">All caught up!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">No pending reports.</p>
              </div>
            ) : (
              (reports as any[]).map((r: any) => (
                <div key={r._id} className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 shadow-card overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">Pending</span>
                          <span className="text-xs text-gray-400">{r.category}</span>
                        </div>
                        <h3 className="font-display font-bold text-gray-900 dark:text-white text-base">{r.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{r.description}</p>
                      </div>
                      {r.images?.[0] && (
                        <img src={r.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 dark:text-gray-500 mb-4">
                      <span>📍 {r.locationDetails}</span>
                      <span>📅 {format(new Date(r.dateOccurred), 'dd MMM yyyy')}</span>
                      <span>👤 {r.reportedBy?.name} {r.reportedBy?.department ? `(${r.reportedBy.department})` : ''}</span>
                      <span>🕐 Submitted {format(new Date(r.createdAt), 'dd MMM, h:mm a')}</span>
                    </div>

                    {r.reportedBy?.avatar && (
                      <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-navy-800 rounded-xl">
                        <img src={r.reportedBy.avatar} className="w-7 h-7 rounded-full" alt="" />
                        <div>
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{r.reportedBy.name}</p>
                          <p className="text-xs text-gray-400">{r.reportedBy.email}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setPublishModal(r)}
                        className="btn-primary text-sm flex-1 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> Publish to Board
                      </button>
                      <button
                        onClick={() => setRejectModal(r)}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* ── ACTIVE BOARD ─────────────────────────────────────────────── */}
        {tab === 'board' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Items list */}
              <div className="space-y-3">
                <h2 className="font-display font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider mb-2">Active Items</h2>
                {!items?.length ? (
                  <div className="text-center py-12 text-gray-400 text-sm">No active items on the board.</div>
                ) : (
                  (items as any[]).map((item: any) => (
                    <button
                      key={item._id}
                      onClick={() => setSelectedItem(selectedItem?._id === item._id ? null : item)}
                      className={`w-full text-left bg-white dark:bg-navy-900 rounded-2xl border p-4 transition-all ${
                        selectedItem?._id === item._id
                          ? 'border-primary-400 shadow-glow'
                          : 'border-gray-100 dark:border-navy-800 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{item.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">📍 {item.location?.building || item.location?.address}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                              {item.finderTips?.length || 0} tip{item.finderTips?.length !== 1 ? 's' : ''}
                            </span>
                            <span className="text-xs text-gray-400">{format(new Date(item.approvedAt || item.createdAt), 'dd MMM')}</span>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${selectedItem?._id === item._id ? 'rotate-90' : ''}`} />
                      </div>

                      {selectedItem?._id === item._id && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-navy-800 flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); resolveMut.mutate(item._id); }}
                            disabled={resolveMut.isPending}
                            className="btn-primary text-xs py-1.5 flex-1 flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Mark Returned
                          </button>
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Tips panel */}
              <div>
                <h2 className="font-display font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider mb-2">Finder Tips</h2>
                {!selectedItem ? (
                  <div className="bg-white dark:bg-navy-900 rounded-2xl border border-dashed border-gray-200 dark:border-navy-700 p-10 text-center">
                    <MessageSquare className="w-8 h-8 text-gray-300 dark:text-navy-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">Select an item on the left to see tips from members.</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 divide-y divide-gray-100 dark:divide-navy-800">
                    <div className="p-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedItem.title}</p>
                    </div>
                    {!tips?.length ? (
                      <div className="p-8 text-center">
                        <AlertTriangle className="w-7 h-7 text-gray-300 dark:text-navy-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No tips yet for this item.</p>
                      </div>
                    ) : (
                      (tips as any[]).map((tip: any) => (
                        <div key={tip._id} className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/30 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-400">
                                {tip.submittedBy?.name?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{tip.submittedBy?.name}</p>
                                <p className="text-xs text-gray-400">{tip.submittedBy?.email}</p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              tip.status === 'verified' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                              tip.status === 'reviewed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' :
                              'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                            }`}>
                              {tip.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-navy-800 rounded-xl p-3 mb-2">{tip.message}</p>
                          {tip.contact && <p className="text-xs text-gray-400">Contact: {tip.contact}</p>}
                          {tip.status === 'new' && (
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => tipMut.mutate({ tipId: tip._id, status: 'reviewed' })}
                                className="text-xs px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors">
                                Mark Reviewed
                              </button>
                              <button onClick={() => tipMut.mutate({ tipId: tip._id, status: 'verified' })}
                                className="text-xs px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors">
                                Verified – Arrange Return
                              </button>
                            </div>
                          )}
                          {tip.status === 'reviewed' && (
                            <button onClick={() => tipMut.mutate({ tipId: tip._id, status: 'verified' })}
                              className="text-xs mt-2 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors">
                              Mark Verified
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── MEMBERS ──────────────────────────────────────────────────── */}
        {tab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 shadow-card overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-navy-800">
                <h2 className="font-display font-bold text-gray-900 dark:text-white">Organisation Members</h2>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-navy-800">
                {(users as any[] | undefined)?.map((u: any) => (
                  <div key={u._id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950/30 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-400">
                        {u.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email} {u.department ? `• ${u.department}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' : 'bg-gray-100 text-gray-600 dark:bg-navy-800 dark:text-gray-400'}`}>
                        {u.role}
                      </span>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => banMut.mutate({ id: u._id, active: u.isActive })}
                          disabled={banMut.isPending}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                            u.isActive
                              ? 'border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
                              : 'border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                          }`}
                        >
                          {u.isActive ? 'Ban' : 'Unban'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {publishModal && (
          <PublishModal
            report={publishModal}
            onClose={() => setPublishModal(null)}
            onPublish={(id, note) => publishMut.mutate({ id, note })}
            loading={publishMut.isPending}
          />
        )}
        {rejectModal && (
          <RejectModal
            report={rejectModal}
            onClose={() => setRejectModal(null)}
            onReject={(id, reason) => rejectMut.mutate({ id, reason })}
            loading={rejectMut.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
