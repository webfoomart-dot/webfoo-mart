'use client';

import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export function DeliveryBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 20,
        delay: 0.1 
      }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CCFF00] text-black lime-glow"
    >
      <motion.div
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        <Zap className="w-4 h-4 fill-current" />
      </motion.div>
      <span className="font-black text-sm tracking-wide">10 MIN</span>
      <span className="font-medium text-sm">DELIVERY</span>
    </motion.div>
  );
}
