// @ts-nocheck
'use client';

import { motion } from 'framer-motion';
import { Search, Mic } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useAppStore() as any;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative">
        <div className="glass rounded-3xl overflow-hidden neon-glow">
          <div className="flex items-center px-6 py-4">
            <Search className="w-5 h-5 text-[#00FFFF]" />
            <input
              type="text"
              placeholder="Search for snacks, drinks, essentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40 px-4 text-base"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Mic className="w-4 h-4 text-[#CCFF00]" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
