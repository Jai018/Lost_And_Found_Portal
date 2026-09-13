import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bell, Menu, X, Sun, Moon, User, LogOut,
  Plus, ChevronDown, Sparkles, Home,
  LayoutDashboard, MessageSquare, Settings, Shield
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore, useThemeStore, useNotificationStore } from '../../store';
import { Avatar } from '../ui';

const NAV_LINKS = [
  { href: '/',       label: 'Home',  icon: <Home className="w-4 h-4" /> },
  { href: '/board',  label: 'Board', icon: <Search className="w-4 h-4" /> },
];

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchVal, setSearchVal]       = useState('');

  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef  = useRef<HTMLInputElement>(null);

  // ── Scroll listener ──────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Close mobile on route change ─────────────────────────────────────────
  useEffect(() => { setMobileOpen(false); setNotifOpen(false); setProfileOpen(false); }, [location]);

  // ── Click outside ────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Focus search on open ─────────────────────────────────────────────────
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/board?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setSearchVal('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isLandingPage = location.pathname === '/';
  const navBg = scrolled || !isLandingPage
    ? 'bg-white/90 dark:bg-navy-950/90 backdrop-blur-xl shadow-sm border-b border-gray-100 dark:border-navy-800'
    : 'bg-transparent';

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className={clsx(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          navBg
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow duration-300">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className={clsx(
                'font-display font-bold text-xl tracking-tight transition-colors',
                isLandingPage && !scrolled ? 'text-white' : 'text-gray-900 dark:text-white'
              )}>
                Find<span className="text-primary-400">It</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  end={link.href === '/'}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400'
                      : isLandingPage && !scrolled
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-navy-800'
                  )}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                id="navbar-search-btn"
                onClick={() => setSearchOpen(true)}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  isLandingPage && !scrolled
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-navy-800'
                )}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme Toggle */}
              <button
                id="theme-toggle-btn"
                onClick={toggleTheme}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  isLandingPage && !scrolled
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-navy-800'
                )}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {isAuthenticated ? (
                <>
                  {/* Report Item CTA */}
                  <Link
                    to="/report"
                    id="navbar-report-btn"
                    className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-glow hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4" />
                    Report
                  </Link>

                  {/* Notifications */}
                  <div ref={notifRef} className="relative">
                    <button
                      id="notifications-btn"
                      onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                      className={clsx(
                        'relative p-2 rounded-lg transition-colors',
                        isLandingPage && !scrolled
                          ? 'text-white/80 hover:text-white hover:bg-white/10'
                          : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-navy-800'
                      )}
                      aria-label="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                      )}
                    </button>

                    <AnimatePresence>
                      {notifOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-navy-900 rounded-2xl shadow-floating border border-gray-100 dark:border-navy-800 overflow-hidden"
                        >
                          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-navy-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                            {unreadCount > 0 && (
                              <button onClick={markAllAsRead} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                                Mark all read
                              </button>
                            )}
                          </div>
                          <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="py-8 text-center text-gray-400 dark:text-gray-600">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                <p className="text-sm">No notifications yet</p>
                              </div>
                            ) : (
                              notifications.slice(0, 10).map((n) => (
                                <button
                                  key={n._id}
                                  onClick={() => { markAsRead(n._id); if (n.link) navigate(n.link); setNotifOpen(false); }}
                                  className={clsx(
                                    'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors',
                                    !n.read && 'bg-primary-50/50 dark:bg-primary-950/20'
                                  )}
                                >
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm">
                                    {n.avatar ? <img src={n.avatar} className="w-8 h-8 rounded-full object-cover" alt="" /> : '🔔'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{n.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{n.body}</p>
                                  </div>
                                  {!n.read && <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-1.5" />}
                                </button>
                              ))
                            )}
                          </div>
                          <div className="px-4 py-2 border-t border-gray-100 dark:border-navy-800">
                            <Link to="/notifications" onClick={() => setNotifOpen(false)} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                              View all notifications →
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Profile Dropdown */}
                  <div ref={profileRef} className="relative">
                    <button
                      id="profile-menu-btn"
                      onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                      className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors group"
                    >
                      <Avatar name={user?.name} size="sm" />
                      <ChevronDown className={clsx('w-4 h-4 transition-transform hidden sm:block', isLandingPage && !scrolled ? 'text-white/70' : 'text-gray-500', profileOpen && 'rotate-180')} />
                    </button>

                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-navy-900 rounded-2xl shadow-floating border border-gray-100 dark:border-navy-800 overflow-hidden py-1"
                        >
                          <div className="px-4 py-3 border-b border-gray-100 dark:border-navy-800">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                          </div>
                          {[
                            { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
                            { to: `/profile/${user?._id}`, label: 'My Profile', icon: <User className="w-4 h-4" /> },
                            { to: '/chat', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
                            { to: '/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
                            ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin Panel', icon: <Shield className="w-4 h-4" /> }] : []),
                          ].map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                              <span className="text-gray-400">{item.icon}</span>
                              {item.label}
                            </Link>
                          ))}
                          <div className="border-t border-gray-100 dark:border-navy-800 mt-1">
                            <button
                              id="logout-btn"
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className={clsx(
                      'px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200',
                      isLandingPage && !scrolled
                        ? 'text-white/90 hover:text-white hover:bg-white/10'
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-navy-800'
                    )}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    id="navbar-signup-btn"
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-glow hover:-translate-y-0.5"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                id="mobile-menu-btn"
                onClick={() => setMobileOpen(!mobileOpen)}
                className={clsx(
                  'md:hidden p-2 rounded-lg transition-colors',
                  isLandingPage && !scrolled
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800'
                )}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-navy-950 border-t border-gray-100 dark:border-navy-800 overflow-hidden"
            >
              <nav className="px-4 py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.href}
                    to={link.href}
                    end={link.href === '/'}
                    className={({ isActive }) => clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-800'
                    )}
                  >
                    {link.icon}
                    {link.label}
                  </NavLink>
                ))}
                {isAuthenticated ? (
                  <>
                    <NavLink to="/dashboard" className={({ isActive }) => clsx('flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium', isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-800')}>
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </NavLink>
                    <Link to="/report" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-primary-600 text-white">
                      <Plus className="w-4 h-4" /> Report Item
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <Link to="/login" className="flex-1 text-center px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-navy-700 rounded-xl text-gray-700 dark:text-gray-300">Sign In</Link>
                    <Link to="/register" className="flex-1 text-center px-4 py-2.5 text-sm font-semibold bg-primary-600 text-white rounded-xl">Get Started</Link>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Global Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              className="relative w-full max-w-2xl bg-white dark:bg-navy-900 rounded-2xl shadow-floating overflow-hidden"
            >
              <form onSubmit={handleSearch}>
                <div className="flex items-center gap-3 px-5 py-4">
                  <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    ref={searchRef}
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    placeholder='Try "black backpack lost near Chennai" …'
                    className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-base focus:outline-none"
                  />
                  {searchVal && (
                    <button type="button" onClick={() => setSearchVal('')} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <kbd className="hidden sm:block px-2 py-1 text-xs bg-gray-100 dark:bg-navy-800 text-gray-500 rounded-md border border-gray-200 dark:border-navy-700">ESC</kbd>
                </div>
              </form>
              <div className="border-t border-gray-100 dark:border-navy-800 px-5 py-3">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-3">Quick Filters</p>
                <div className="flex flex-wrap gap-2">
                  {['Lost items', 'Found items', 'Electronics', 'Bags & Wallets', 'Keys', 'Documents'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => { setSearchVal(tag); navigate(`/browse?q=${encodeURIComponent(tag)}`); setSearchOpen(false); setSearchVal(''); }}
                      className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-primary-100 dark:hover:bg-primary-950/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
