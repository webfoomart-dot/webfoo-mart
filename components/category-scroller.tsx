// @ts-nocheck
'use client';

import { motion } from 'framer-motion';
import { 
  ShoppingBasket, 
  Cookie, 
  Coffee, 
  Smartphone, 
  Pencil, 
  Sparkles 
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBasket,
  Cookie,
  Coffee,
  Smartphone,
  Pencil,
  Sparkles,
};

export function CategoryScroller() {
  const { categories, selectedCategory, setSelectedCategory } = useAppStore() as any;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full"
    >
      <div className="flex gap-3 overflow-x-auto hide-scrollbar py-2 px-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedCategory(null)}
          className={`flex-shrink-0 px-6 py-3 rounded-2xl transition-all ${
            selectedCategory === null
              ? 'bg-primary text-primary-foreground dark:text-black shadow-[0_0_15px_rgba(0,139,139,0.3)] dark:shadow-[0_0_15px_rgba(0,255,255,0.3)]'
              : 'glass text-foreground hover:bg-black/10 dark:hover:bg-white/10'
          }`}
        >
          <span className="font-semibold text-sm whitespace-nowrap">All</span>
        </motion.button>
        
        {(categories || []).map((category: any, index: number) => {
          const Icon = iconMap[category.icon] || ShoppingBasket;
          const isSelected = selectedCategory === category.name;
          
          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.name)}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground dark:text-black shadow-[0_0_15px_rgba(0,139,139,0.3)] dark:shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                  : 'glass text-foreground hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-semibold text-sm whitespace-nowrap">
                {category.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
