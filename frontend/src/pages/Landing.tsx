import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
  Search, ArrowRight, Shield, Zap, Users, Star,
  MapPin, Bell, CheckCircle,
  Package, Heart, TrendingUp, Globe, Smartphone, Lock, Sparkles
} from 'lucide-react';

import { Footer } from '../components/layout/Footer';
import { ItemCardSkeleton } from '../components/ui';
import { ItemCard } from '../components/items/ItemCard';
import { itemsApi } from '../api/client';
import type { Item } from '../types';

// ─── Animation variants ───────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

// ─── Floating Particles ───────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x:  Math.random() * 100,
  y:  Math.random() * 100,
  size: Math.random() * 4 + 2,
  delay: Math.random() * 4,
  duration: Math.random() * 6 + 6,
}));

// ─── STATS ─────────────────────────────────────────────────────────────────
const STATS = [
  { value: 84,   suffix: '+', label: 'Items Reported',  icon: '📦', color: 'from-primary-500 to-primary-700' },
  { value: 68,   suffix: '+', label: 'Items Returned',  icon: '🎉', color: 'from-emerald-500 to-emerald-700' },
  { value: 96,   suffix: '%', label: 'Success Rate',    icon: '✨', color: 'from-accent-400 to-accent-600' },
  { value: 95,   suffix: '+', label: 'Happy Students',  icon: '❤️', color: 'from-rose-500 to-rose-700' },
];

// ─── HOW IT WORKS ──────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: '01',
    icon: <Package className="w-7 h-7" />,
    title: 'Report Your Item',
    desc: 'Describe what you lost or found on campus with photos, location, and details. Our AI helps you write a perfect description.',
    color: 'from-primary-500 to-primary-700',
    highlight: 'bg-primary-50 dark:bg-primary-950/30',
  },
  {
    step: '02',
    icon: <Search className="w-7 h-7" />,
    title: 'Smart Matching',
    desc: 'Our AI scans the database and finds potential matches based on visual similarity, location, and description.',
    color: 'from-purple-600 to-indigo-600',
    highlight: 'bg-gradient-to-br from-purple-50 via-indigo-50/70 to-purple-100/50 dark:from-purple-950/50 dark:via-indigo-950/40 dark:to-purple-900/30 border-purple-200/80 dark:border-purple-800/60 shadow-sm ring-1 ring-purple-400/20',
  },
  {
    step: '03',
    icon: <Shield className="w-7 h-7" />,
    title: 'Secure Verification',
    desc: 'Claimants answer verification questions only the real owner would know. We keep both parties safe.',
    color: 'from-emerald-500 to-emerald-700',
    highlight: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    step: '04',
    icon: <Heart className="w-7 h-7" />,
    title: 'Joyful Reunion',
    desc: 'Once verified, connect via secure in-app chat to arrange handoff. No personal contact info exposed.',
    color: 'from-rose-500 to-rose-700',
    highlight: 'bg-rose-50 dark:bg-rose-950/30',
  },
];

// ─── CATEGORIES ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { emoji: '📱', name: 'Electronics',     count: 234 },
  { emoji: '👜', name: 'Bags & Wallets',  count: 187 },
  { emoji: '🔑', name: 'Keys',            count: 312 },
  { emoji: '👕', name: 'Clothing',        count: 98  },
  { emoji: '💍', name: 'Jewelry',         count: 56  },
  { emoji: '📄', name: 'Documents',       count: 143 },
  { emoji: '📚', name: 'Books',           count: 67  },
  { emoji: '🎒', name: 'Stationery',      count: 45  },
];

// ─── FEATURES ──────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: <Zap className="w-5 h-5" />,         title: 'AI-Powered Matching',  desc: 'Computer vision matches lost and found items automatically',             color: 'text-primary-500' },
  { icon: <Shield className="w-5 h-5" />,       title: 'Secure Verification',  desc: 'Ownership proved through smart Q&A before contact is revealed',         color: 'text-emerald-500' },
  { icon: <Bell className="w-5 h-5" />,         title: 'Real-time Alerts',     desc: 'Get instant notifications when a match is found for your item',         color: 'text-accent-500' },
  { icon: <Globe className="w-5 h-5" />,        title: 'Location Mapping',     desc: 'Interactive maps show where items were lost or found',                  color: 'text-blue-500' },
  { icon: <Lock className="w-5 h-5" />,         title: 'Private Chat',         desc: 'Communicate safely without exposing personal contact info',             color: 'text-rose-500' },
  { icon: <Smartphone className="w-5 h-5" />,   title: 'Mobile Friendly',      desc: 'Fully responsive design works perfectly on any device',                 color: 'text-violet-500' },
];

// ─── StatCounter Component ────────────────────────────────────────────────
const StatCounter: React.FC<typeof STATS[0]> = ({ value, suffix, label, icon, color }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <motion.div
      ref={ref}
      variants={scaleIn}
      className="flex flex-col items-center gap-3 p-6 bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20"
    >
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl shadow-lg`}>
        {icon}
      </div>
      <div className="text-center">
        <div className="text-3xl font-display font-black text-white counter-number">
          {value.toLocaleString()}{suffix}
        </div>
        <div className="text-sm text-white/70 font-medium mt-0.5">{label}</div>
      </div>
    </motion.div>
  );
};

// ─── MAIN LANDING PAGE ────────────────────────────────────────────────────
const Landing: React.FC = () => {
  const navigate  = useNavigate();
  const [query, setQuery]                   = useState('');
  const [activeItems, setActiveItems]   = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [activeTab, setActiveTab]       = useState<'lost' | 'found'>('lost');

  // ── Fetch recent items ───────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await itemsApi.getAll({ limit: 6, sortBy: 'newest', status: 'active' });
        setActiveItems(res.data?.data || []);
      } catch {
        // silently fail - show demo items
        setActiveItems(DEMO_ITEMS);
      } finally {
        setItemsLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/browse?q=${encodeURIComponent(query)}`);
  };

  const SEARCH_SUGGESTIONS = [
    'Blue backpack lost near Gallery',
    'iPhone 14 lost near Main Auditorium',
    'Black Nike backpack found at Library',
    'Scientific calculator missing in Lab 3',
  ];

  return (
    <div className="min-h-screen bg-[--color-bg] dark:bg-[--color-bg]">

      {/* ── HERO SECTION ───────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-hero-gradient">

        {/* Animated mesh background */}
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary-950/80" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-violet-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />

        {/* Floating particles */}
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white/20 pointer-events-none"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: Headline & CTA */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="text-center lg:text-left"
            >
              {/* Tagline pill */}
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span>🏫 College Campus Exclusive</span>
                <span className="text-white/50">·</span>
                <span className="text-accent-300">AI Lost & Found</span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-black text-white leading-[1.08] tracking-tight"
              >
                Helping campus{' '}
                <span className="relative inline-block">
                  <span className="gradient-text bg-gradient-to-r from-accent-300 via-accent-400 to-yellow-300 bg-clip-text text-transparent">
                    reconnect
                  </span>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-accent-400 to-yellow-300 rounded-full origin-left"
                  />
                </span>
                {' '}with what matters
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-6 text-lg sm:text-xl text-white/75 leading-relaxed max-w-xl mx-auto lg:mx-0">
                The smart college platform that uses AI to reunite students, faculty, and staff with their lost belongings across campus. 
                Secure, fast, and completely free.
              </motion.p>

              {/* Search Bar */}
              <motion.div variants={fadeUp} className="mt-8">
                <form onSubmit={handleSearch} className="relative max-w-xl mx-auto lg:mx-0">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/40 rounded-2xl p-2 transition-all duration-200 focus-within:border-white/50 focus-within:bg-white/15">
                    <Search className="w-5 h-5 text-white/50 ml-2 flex-shrink-0" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder='e.g. "blue backpack lost near gallery"'
                      className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none text-base py-1"
                      id="hero-search-input"
                    />
                    <button
                      type="submit"
                      id="hero-search-btn"
                      className="flex-shrink-0 px-5 py-2.5 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-colors text-sm"
                    >
                      Search
                    </button>
                  </div>
                  {/* Search suggestions */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {SEARCH_SUGGESTIONS.slice(0, 2).map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setQuery(s); navigate(`/browse?q=${encodeURIComponent(s)}`); }}
                        className="text-xs text-white/60 hover:text-white/90 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </form>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mt-8 justify-center lg:justify-start">
                <Link
                  to="/report/lost"
                  id="hero-report-lost-btn"
                  className="group flex items-center gap-2 px-7 py-4 bg-white text-primary-700 font-bold rounded-2xl hover:bg-primary-50 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg shadow-md text-base"
                >
                  <span>🔍</span>
                  Report Lost Item
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/report/found"
                  id="hero-report-found-btn"
                  className="group flex items-center gap-2 px-7 py-4 bg-accent-500 hover:bg-accent-400 text-white font-bold rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg shadow-md text-base"
                >
                  <span>✋</span>
                  Report Found Item
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-5 mt-8 justify-center lg:justify-start">
                {[
                  { icon: <CheckCircle className="w-4 h-4 text-emerald-400" />, text: 'Free forever' },
                  { icon: <Shield className="w-4 h-4 text-blue-400" />,         text: 'Privacy protected' },
                  { icon: <Star className="w-4 h-4 text-accent-400" fill="currentColor" />, text: '4.9/5 rating' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-white/70 text-sm">
                    {icon} {text}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Hero Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="hidden lg:block relative"
            >
              <HeroIllustration />
            </motion.div>
          </div>

          {/* ── Stats row ─────────────────────────────────────────────── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-20"
          >
            {STATS.map((s) => <StatCounter key={s.label} {...s} />)}
          </motion.div>
        </div>

        {/* Wave transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-16 fill-[var(--color-bg)]">
            <path d="M0 80L48 69.3C96 58.7 192 37.3 288 32C384 26.7 480 37.3 576 48C672 58.7 768 69.3 864 64C960 58.7 1056 37.3 1152 32C1248 26.7 1344 37.3 1392 42.7L1440 48V80H0Z" />
          </svg>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-[--color-bg]">
        <div className="section-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-semibold mb-4 border border-primary-100 dark:border-primary-900/50">
              <Zap className="w-4 h-4" /> How It Works
            </motion.div>
            <motion.h2 variants={fadeUp} className="section-title">Simple, secure, and effective</motion.h2>
            <motion.p variants={fadeUp} className="section-subtitle mx-auto">
              FindIt makes it easy to report, discover, and reclaim lost items in just a few steps.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className={`relative p-6 rounded-3xl ${step.highlight} border border-gray-100 dark:border-navy-800 group`}
              >
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-white dark:to-gray-200 rounded-xl flex items-center justify-center text-white dark:text-gray-900 text-xs font-black shadow-lg">
                  {step.step}
                </div>
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                </div>
                <h3 className="font-display font-bold text-gray-900 dark:text-white text-lg mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-navy-950/50">
        <div className="section-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="section-title">Browse by Category</motion.h2>
            <motion.p variants={fadeUp} className="section-subtitle mx-auto">Find items organized by type for faster discovery</motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4"
          >
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.name} variants={scaleIn}>
                <Link
                  to={`/browse?category=${encodeURIComponent(cat.name)}`}
                  className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-card-hover transition-all duration-300 group text-center"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{cat.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-tight">{cat.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{cat.count}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── RECENT ITEMS FEED ──────────────────────────────────────────── */}
      <section className="py-24 bg-[--color-bg]">
        <div className="section-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
          >
            <div>
              <motion.h2 variants={fadeUp} className="section-title">Recent Activity</motion.h2>
              <motion.p variants={fadeUp} className="section-subtitle">Latest lost and found reports from the community</motion.p>
            </div>
            <motion.div variants={fadeUp} className="flex items-center gap-2">
              <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-navy-700">
                {(['lost', 'found'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                      activeTab === tab
                        ? tab === 'lost'
                          ? 'bg-red-500 text-white'
                          : 'bg-emerald-500 text-white'
                        : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <Link to="/browse" className="btn-secondary text-sm py-2">View All →</Link>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {itemsLoading
              ? Array.from({ length: 6 }).map((_, i) => <ItemCardSkeleton key={i} />)
              : (activeItems.filter((item) => item.type === activeTab).length > 0
                  ? activeItems.filter((item) => item.type === activeTab).slice(0, 6)
                  : activeItems.slice(0, 6)
                ).map((item) => <ItemCard key={item._id} item={item} />)
            }
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ──────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-primary-950 via-navy-950 to-primary-900 dark:from-gray-950 dark:via-navy-950 dark:to-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

        <div className="relative section-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="section-title text-white">Everything you need</motion.h2>
            <motion.p variants={fadeUp} className="section-subtitle text-white/60 mx-auto">
              Powerful features that make FindIt the most trusted lost & found platform
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className={`inline-flex p-3 rounded-xl bg-white/10 ${f.color} mb-4 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-white mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* ── CTA SECTION ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-[--color-bg]">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary-600 via-primary-700 to-navy-900 p-12 md:p-16 text-center"
          >
            <div className="absolute inset-0 bg-dot-pattern opacity-20" />
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl" />

            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="text-6xl mb-6"
              >
                🎯
              </motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white mb-4 tracking-tight">
                Lost something? Found something?
              </h2>
              <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
                Join 50,000+ people who trust FindIt to reunite them with their belongings.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/register"
                  id="cta-join-btn"
                  className="flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-2xl hover:bg-primary-50 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg text-base shadow-md"
                >
                  Join for Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/browse"
                  id="cta-browse-btn"
                  className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all duration-200 hover:-translate-y-1 text-base border border-white/20"
                >
                  Browse Items
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// ─── Hero Illustration (SVG animated) ────────────────────────────────────
const HeroIllustration: React.FC = () => (
  <div className="relative w-full max-w-lg mx-auto">
    {/* Main phone mockup */}
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      className="relative z-10"
    >
      <div className="w-72 h-[520px] mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-[3rem] shadow-2xl overflow-hidden">
        {/* Phone screen */}
        <div className="h-full flex flex-col bg-gradient-to-b from-white/5 to-transparent p-5">
          {/* Status bar */}
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="text-white/60 text-xs font-mono">9:41</span>
            <div className="flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`h-1 bg-white/${70 - i * 20} rounded-full`} style={{ width: `${16 - i * 4}px` }} />
              ))}
            </div>
          </div>

          {/* FindIt logo */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold text-sm">FindIt</span>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5 mb-4 border border-white/10">
            <Search className="w-4 h-4 text-white/50" />
            <span className="text-white/40 text-xs">Search items...</span>
          </div>

          {/* Item cards */}
          {[
            { emoji: '📱', title: 'iPhone 14 Pro', loc: 'Chennai', type: 'lost', color: 'bg-red-500/20 border-red-500/30' },
            { emoji: '👜', title: 'Brown Leather Bag', loc: 'Bangalore', type: 'found', color: 'bg-green-500/20 border-green-500/30' },
            { emoji: '🔑', title: 'Car Keys - Honda', loc: 'Mumbai', type: 'lost', color: 'bg-red-500/20 border-red-500/30' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.2 }}
              className={`flex items-center gap-3 p-3 rounded-xl border mb-2 ${item.color}`}
            >
              <span className="text-xl flex-shrink-0">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{item.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-white/40" />
                  <p className="text-white/40 text-[10px]">{item.loc}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.type === 'lost' ? 'bg-red-500/40 text-red-200' : 'bg-green-500/40 text-green-200'}`}>
                {item.type}
              </span>
            </motion.div>
          ))}

          {/* AI match notification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="mt-auto bg-primary-500/20 border border-primary-500/30 rounded-xl p-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="text-white text-[10px] font-semibold">AI Match Found!</p>
                <p className="text-white/50 text-[9px]">94% similarity with your iPhone</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>

    {/* Floating cards */}
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      className="absolute -left-8 top-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-lg"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-white text-xs font-semibold">Item Returned</p>
          <p className="text-white/50 text-[10px]">2 hours ago</p>
        </div>
      </div>
    </motion.div>

    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
      className="absolute -right-4 bottom-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-lg"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
          <Users className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-white text-xs font-semibold">+127 users today</p>
          <p className="text-white/50 text-[10px]">Community growing</p>
        </div>
      </div>
    </motion.div>

    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      className="absolute left-4 bottom-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-lg"
    >
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-accent-400" />
        <div>
          <p className="text-white text-xs font-semibold">95% success rate</p>
          <p className="text-white/50 text-[10px]">Items returned</p>
        </div>
      </div>
    </motion.div>

    {/* Background glow */}
    <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-400 rounded-full" />
    </div>
  </div>
);

// ─── Demo items (fallback if API unavailable) ─────────────────────────────
const DEMO_ITEMS: Item[] = [
  {
    _id: '1', type: 'lost', title: 'iPhone 14 Pro Max - Space Black',
    description: 'Lost my iPhone 14 Pro Max near Central Library reading hall. Has a cracked screen protector and a red case.',
    category: 'Electronics', images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'],
    status: 'active', location: { address: 'Central Library, 2nd Floor', city: 'Campus', state: 'Library Block', country: 'India', coordinates: [80.2707, 13.0827] },
    date: new Date(Date.now() - 86400000).toISOString(), reward: 500, tags: ['iPhone', 'phone', 'Apple'],
    reportedBy: { _id: 'u1', name: 'Priya S', avatar: undefined, email: 'priya@campus.edu', role: 'user', isVerified: true, trustScore: 85, badges: [], achievements: [], stats: { itemsReported: 2, itemsFound: 1, successfulReturns: 1, responseRate: 90 }, joinedAt: '2024-01-01' },
    claims: [], views: 234, bookmarks: [], verificationQuestions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    _id: '2', type: 'found', title: 'Brown Leather Wallet with Student ID',
    description: 'Found a brown leather wallet near Canteen food counter. Contains student ID card and some cash.',
    category: 'Bags & Wallets', images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=400'],
    status: 'active', location: { address: 'Canteen / Cafeteria Counter', city: 'Campus', state: 'Student Center', country: 'India', coordinates: [77.6091, 12.9719] },
    date: new Date(Date.now() - 3600000).toISOString(), reward: 0, tags: ['wallet', 'leather', 'studentID'],
    reportedBy: { _id: 'u2', name: 'Arjun M', avatar: undefined, email: 'arjun@campus.edu', role: 'user', isVerified: false, trustScore: 72, badges: [], achievements: [], stats: { itemsReported: 3, itemsFound: 5, successfulReturns: 4, responseRate: 95 }, joinedAt: '2024-02-01' },
    claims: [], views: 89, bookmarks: [], verificationQuestions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    _id: '3', type: 'lost', title: 'Hostel Room Keys with Blue Keychain',
    description: 'Set of 2 keys with a blue rubber keychain shaped like a car. Lost somewhere near Main Auditorium.',
    category: 'Keys', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
    status: 'active', location: { address: 'Main Auditorium Entrance', city: 'Campus', state: 'Main Block', country: 'India', coordinates: [77.2090, 28.6315] },
    date: new Date(Date.now() - 7200000).toISOString(), reward: 200, tags: ['keys', 'hostel'],
    reportedBy: { _id: 'u3', name: 'Meera N', avatar: undefined, email: 'meera@campus.edu', role: 'user', isVerified: true, trustScore: 91, badges: [], achievements: [], stats: { itemsReported: 1, itemsFound: 0, successfulReturns: 0, responseRate: 100 }, joinedAt: '2024-03-01' },
    claims: [], views: 45, bookmarks: [], verificationQuestions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    _id: '4', type: 'found', title: 'Laptop Bag - Dell Brand',
    description: 'Found a Dell laptop bag in Computer Science Lab 302. Has a charger and lecture notebook inside.',
    category: 'Bags & Wallets', images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'],
    status: 'active', location: { address: 'CS Lab Block, Room 302', city: 'Campus', state: 'CS Dept', country: 'India', coordinates: [77.6389, 12.9719] },
    date: new Date(Date.now() - 14400000).toISOString(), reward: 0, tags: ['laptop', 'bag', 'Dell', 'cslab'],
    reportedBy: { _id: 'u4', name: 'Ravi K', avatar: undefined, email: 'ravi@campus.edu', role: 'user', isVerified: true, trustScore: 88, badges: [], achievements: [], stats: { itemsReported: 5, itemsFound: 8, successfulReturns: 7, responseRate: 88 }, joinedAt: '2024-04-01' },
    claims: [], views: 167, bookmarks: [], verificationQuestions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    _id: '5', type: 'lost', title: 'TI-84 Graphing Calculator',
    description: 'Lost my graphing calculator near the Science block 1st floor corridor. It has a blue sticker on the back.',
    category: 'Electronics', images: ['https://images.unsplash.com/photo-1574607407408-1e681c46041d?w=400'],
    status: 'active', location: { address: 'Science Block Corridor', city: 'Campus', state: 'Science Block', country: 'India', coordinates: [0, 0] },
    date: new Date(Date.now() - 21600000).toISOString(), reward: 0, tags: ['calculator', 'electronics', 'science'],
    reportedBy: { _id: 'u5', name: 'Suresh P', avatar: undefined, email: 'suresh@campus.edu', role: 'user', isVerified: true, trustScore: 79, badges: [], achievements: [], stats: { itemsReported: 1, itemsFound: 0, successfulReturns: 0, responseRate: 100 }, joinedAt: '2024-05-01' },
    claims: [], views: 89, bookmarks: [], verificationQuestions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    _id: '6', type: 'found', title: 'College ID Card & Lanyard',
    description: 'Found a student college ID card with a navy blue lanyard near Hostel Block B entrance.',
    category: 'Documents', images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'],
    status: 'active', location: { address: 'Hostel Block B Entrance', city: 'Campus', state: 'Hostels', country: 'India', coordinates: [77.7081, 13.1979] },
    date: new Date(Date.now() - 10800000).toISOString(), reward: 0, tags: ['idcard', 'documents', 'college'],
    reportedBy: { _id: 'u6', name: 'Anjali V', avatar: undefined, email: 'anjali@campus.edu', role: 'user', isVerified: false, trustScore: 65, badges: [], achievements: [], stats: { itemsReported: 2, itemsFound: 3, successfulReturns: 2, responseRate: 75 }, joinedAt: '2024-06-01' },
    claims: [], views: 92, bookmarks: [], verificationQuestions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
];

export default Landing;
