'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import type { Item } from '@/lib/types';

interface ProductCardProps {
  item: Item;
}

export function ProductCard({ item }: ProductCardProps) {
  const { addToCart, cart } = useAppStore();
  const [isAdded, setIsAdded] = useState(false);
  
  const cartItem = cart.find((i) => i.id === item.id);
  const isInCart = !!cartItem;

  const handleAdd = () => {
    if (!item.inStock) return;
    
    addToCart(item);
    setIsAdded(true);
    
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  useEffect(() => {
    if (isInCart) {
      setIsAdded(true);
      const timer = setTimeout(() => setIsAdded(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isInCart]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      // 🔥 THE FIX: Ye line phone (touch) ke liye add ki hai
      whileTap={{ scale: 0.96, y: -2 }}
      className="glass rounded-3xl overflow-hidden group"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-white/5 to-white/0 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <ShoppingBag className="w-16 h-16 text-white/20" />
        </div>
        
        {/* Discount Badge */}
        {item.originalPrice && item.originalPrice > item.price && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute top-3 left-3 px-3 py-1 bg-[#CCFF00] text-black text-xs font-bold rounded-full"
          >
            {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
          </motion.div>
        )}

        {/* Out of Stock Overlay */}
        {!item.inStock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white/70 font-bold text-sm">OUT OF STOCK</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1 min-h-[40px]">
          {item.name}
        </h3>
        
        <p className="text-white/50 text-xs mb-3 line-clamp-1">
          {item.description || item.category}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-[#00FFFF] font-bold text-lg">
              ₹{item.price}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-white/40 text-sm line-through">
                ₹{item.originalPrice}
              </span>
            )}
          </div>

          {/* Add Button with Animation */}
          <motion.button
            whileHover={{ scale: item.inStock ? 1.1 : 1 }}
            whileTap={{ scale: item.inStock ? 0.9 : 1 }}
            onClick={handleAdd}
            disabled={!item.inStock}
            className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all overflow-hidden ${
              !item.inStock
                ? 'bg-white/10 cursor-not-allowed'
                : isAdded
                ? 'bg-[#CCFF00] lime-glow'
                : 'bg-[#00FFFF] neon-glow'
            }`}
          >
            <AnimatePresence mode="wait">
              {isAdded ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Check className="w-5 h-5 text-black" />
                </motion.div>
              ) : (
                <motion.div
                  key="plus"
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -180 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Plus className={`w-5 h-5 ${item.inStock ? 'text-black' : 'text-white/50'}`} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Quantity Badge */}
        {cartItem && cartItem.quantity > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-center"
          >
            <span className="text-[#CCFF00] text-xs font-medium">
              {cartItem.quantity} in cart
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
