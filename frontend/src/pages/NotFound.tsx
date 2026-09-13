import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';

const NotFound: React.FC = () => (
  <div className="min-h-screen bg-[--color-bg] flex items-center justify-center px-6 pt-16">
    <div className="text-center max-w-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="text-8xl mb-6"
      >
        🔍
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h1 className="text-6xl font-display font-black text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-display font-bold text-gray-700 dark:text-gray-300 mb-3">Page Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          Looks like this page got lost too! Let's help you find your way back.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" id="notfound-home-btn" className="btn-primary">
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link to="/browse" id="notfound-browse-btn" className="btn-secondary">
            <Search className="w-4 h-4" /> Browse Items
          </Link>
        </div>
      </motion.div>
    </div>
  </div>
);

export default NotFound;
