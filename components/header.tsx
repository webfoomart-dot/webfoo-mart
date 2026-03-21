'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Bell } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';

export function Header() {
  // Hydration Fix State
  const [isMounted, setIsMounted] = useState(false);
  
  const { user, getCartCount, notifications } = useAppStore() as any;
  const cartCount = getCartCount();

  const unreadCount = notifications ? notifications.filter((n: any) => !n.read).length : 0;

  // Run this once when the component mounts on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo - WEBFOO MART */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <span className="text-xl md:text-2xl font-black italic tracking-tighter text-white">
                WEBFOO
              </span>
              <span className="text-xl md:text-2xl font-black italic tracking-tighter text-[#00FFFF]">
                MART
              </span>
            </motion.div>
          </Link>

          {/* Desktop Nav (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Home</Link>
            <Link href="/products" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Products</Link>
            {user?.isAdmin && (
              <Link href="/admin" className="text-[#CCFF00] hover:text-[#CCFF00]/80 transition-colors text-sm font-medium">Admin</Link>
            )}
          </nav>

          {/* 🔥 BROWSE MODE LOCK: Cart & Notifications tabhi dikhenge jab user logged in hoga */}
          {user && (
            <div className="flex items-center gap-3">
              
              {/* Notification Icon */}
              <Link href="/notifications">
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  className="relative p-3 rounded-2xl glass hover:neon-glow transition-all"
                >
                  <Bell className="w-5 h-5 text-white" />
                  
                  {isMounted && unreadCount > 0 && (
                    <span className="absolute top-[8px] right-[10px] w-2.5 h-2.5 bg-[#CCFF00] rounded-full shadow-[0_0_8px_#CCFF00]" />
                  )}
                </motion.button>
              </Link>

              {/* Cart Icon */}
              <Link href="/cart">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-3 rounded-2xl glass hover:neon-glow transition-all"
                >
                  <ShoppingCart className="w-5 h-5 text-white" />
                  
                  {isMounted && cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-[#00FFFF] text-black text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_10px_#00FFFF]"
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </motion.span>
                  )}
                </motion.button>
              </Link>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}