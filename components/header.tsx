// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Bell } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';

export function Header() {
  const [isMounted, setIsMounted] = useState(false);
  
  const { user, getCartCount, notifications } = useAppStore() as any;
  const cartCount = getCartCount();

  const unreadCount = notifications ? notifications.filter((n: any) => !n.read).length : 0;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-2xl rounded-b-[40px] border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-3"> {/* 🔥 Gap badhaya taaki logo aur text me space rahe */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3" /* 🔥 Yahan gap-3 diya jisse logo aur text ek line me rahenge */
            >
              <Image 
                src="/logo.png" 
                alt="WebFoo Mart" 
                width={44} 
                height={44} 
                className="rounded-full object-cover shadow-[0_0_15px_rgba(0,255,255,0.3)] shrink-0" /* 🔥 shrink-0 add kiya taaki logo daba na jaye */
              />
              {/* 🔥 NAYA TEXT ADD KIYA EKDUM MAST STYLE MEIN */}
              <span className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-white whitespace-nowrap">
                WebFoo <span className="text-[#00FFFF]">Mart</span>
              </span>
            </motion.div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Home</Link>
            <Link href="/products" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Products</Link>
            {user?.isAdmin && (
              <Link href="/admin" className="text-[#CCFF00] hover:text-[#CCFF00]/80 transition-colors text-sm font-medium">Admin</Link>
            )}
          </nav>

          {user && (
            <div className="flex items-center gap-3">
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
