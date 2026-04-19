"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag, ChevronRight, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAppStore } from "@/lib/store"

export default function FloatingCart() {
  const [isMounted, setIsMounted] = React.useState(false)
  const pathname = usePathname() 
  
  const { getCartCount, getCartTotal, storeConfig, checkIfStoreOpen, storeClosedAlert } = useAppStore() as any
  const [isStoreOpen, setIsStoreOpen] = React.useState(true)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    if (!isMounted || !storeConfig) return;
    const checkTime = () => {
      if (checkIfStoreOpen) setIsStoreOpen(checkIfStoreOpen());
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [storeConfig, checkIfStoreOpen, isMounted]);

  if (!isMounted) return null

  const hiddenPages = ['/checkout', '/cart', '/admin', '/success']
  if (hiddenPages.includes(pathname)) return null

  const count = getCartCount()
  const total = getCartTotal()

  // 🔥 SHOW CAPSULE LOGIC: 
  // 1. Agar store open hai aur cart mein item hai.
  // 2. Agar store closed hai aur cart mein item hai (taaki custom dekh sake par order nahi).
  // 3. Agar store closed hai aur usne "ADD" button dabaya (storeClosedAlert true ho gaya).
  const showCapsule = count > 0 || storeClosedAlert;

  return (
    <AnimatePresence>
      {showCapsule && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}
          className="fixed bottom-24 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none"
        >
          {isStoreOpen ? (
            /* 🟢 STORE OPEN WALA NORMAL CAPSULE */
            <Link href="/cart" className="w-full max-w-md pointer-events-auto">
              <div className="bg-black/85 backdrop-blur-xl border border-[#00FFFF]/50 p-3 sm:p-4 rounded-full flex items-center justify-between shadow-[0_0_30px_rgba(0,255,255,0.2)] hover:shadow-[0_0_40px_rgba(0,255,255,0.4)] hover:border-[#00FFFF] transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#00FFFF]/10 rounded-full flex items-center justify-center border border-[#00FFFF]/30 group-hover:bg-[#00FFFF] group-hover:text-black transition-colors">
                    <ShoppingBag className="w-5 h-5 text-[#00FFFF] group-hover:text-black" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-black text-sm uppercase tracking-widest leading-none mb-1">
                      {count} {count === 1 ? 'Item' : 'Items'}
                    </span>
                    <span className="text-[#00FFFF] font-mono font-bold text-xs">₹{total}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[#00FFFF] bg-[#00FFFF]/10 px-4 py-2 rounded-full border border-[#00FFFF]/20 group-hover:bg-[#00FFFF] group-hover:text-black transition-all">
                  <span className="font-black text-xs uppercase tracking-widest">View Cart</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ) : (
            /* 🔴 STORE CLOSED WALA CAPSULE (YE ALERT POPUP BHI HAI AB) */
            <div className="w-full max-w-md pointer-events-auto cursor-not-allowed opacity-95">
              <div className="bg-red-950/90 backdrop-blur-xl border border-red-500/50 p-3 sm:p-4 rounded-full flex items-center justify-between shadow-[0_0_30px_rgba(255,0,0,0.2)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/50 animate-pulse">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-red-500 font-black text-sm uppercase tracking-widest leading-none mb-1">
                      Store is Closed
                    </span>
                    <span className="text-red-400/80 font-bold text-[10px] uppercase tracking-widest truncate max-w-[150px] sm:max-w-[200px]">
                      {storeConfig?.bannerTextClosed || 'SHOP WILL OPEN AT 4PM EVERYDAY'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
                  <span className="font-black text-xs uppercase tracking-widest">Can't Order</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
