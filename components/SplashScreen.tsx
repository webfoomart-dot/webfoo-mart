"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // 2.5 second baad splash screen fade out ho jayegi
    const timer = setTimeout(() => setShow(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] bg-[#050505] flex flex-col items-center justify-center"
        >
          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            {/* CSS-BASED LOGO (0% Pixelation) */}
            <h1 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2">
              WEBFOO <span className="text-[#CCFF00]">MART</span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-[#00FFFF] mt-3 text-xs sm:text-sm font-mono tracking-[0.3em] uppercase font-bold"
            >
              Delivering Desires...
            </motion.p>
          </motion.div>

          {/* Premium Loading Line */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
            className="h-1 bg-gradient-to-r from-[#00FFFF] to-[#CCFF00] mt-10 rounded-full shadow-[0_0_15px_rgba(0,255,255,0.5)]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
