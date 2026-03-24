"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Zap, MoonStar, TicketPercent, Plus, Minus } from "lucide-react"

import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"

// EXACT WAHI 3 CATEGORY JO TUNE BOLI
const HOME_CATEGORIES = ["HK Fast Food", "Fast Food", "Cold Drink"]

export default function HomePage() {
  const [isMounted, setIsMounted] = React.useState(false)
  const { 
    products, cart, addToCart, removeFromCart, updateQuantity,
    fetchData, storeConfig, fetchStoreConfig, checkIfStoreOpen,
    triggerStoreClosedAlert 
  } = useAppStore() as any

  const [searchQuery, setSearchQuery] = React.useState("") 
  const [isStoreOpen, setIsStoreOpen] = React.useState(true)

  React.useEffect(() => {
    setIsMounted(true)
    if (fetchStoreConfig) fetchStoreConfig()
    if (fetchData) fetchData()
  }, [fetchData, fetchStoreConfig])

  React.useEffect(() => {
    const checkTime = () => {
      if (checkIfStoreOpen) {
        setIsStoreOpen(checkIfStoreOpen());
      }
    };
    checkTime(); 
    const interval = setInterval(checkTime, 60000); 
    return () => clearInterval(interval);
  }, [storeConfig, checkIfStoreOpen]);

  if (!isMounted) return <div className="min-h-screen bg-[#050505]" />

  const getCartItem = (id: string) => cart.find((item: any) => item.id === id)

  // Sirf search ke liye filter, category button wala logic hata diya
  const filteredProducts = products.filter((p: any) => {
    return p.name.toLowerCase().includes(searchQuery.toLowerCase());
  })

  const handleAddToCart = (product: any) => {
    if (!isStoreOpen) {
      triggerStoreClosedAlert();
      return;
    }
    addToCart(product);
  }

  const handlePlusClick = (productId: string, currentQuantity: number) => {
    if (!isStoreOpen) {
      triggerStoreClosedAlert();
      return;
    }
    updateQuantity(productId, currentQuantity + 1);
  }

  // PRODUCT CARD ENGINE
  const renderProductCard = (product: any, isHorizontalMode: boolean = false) => {
    const cartItem = getCartItem(product.id)
    return (
      <motion.div 
        key={product.id} 
        layout 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className={`bg-white/5 p-3 rounded-[1.5rem] border border-white/10 flex flex-col gap-3 relative transition-all duration-300 hover:border-[#00FFFF]/40 hover:bg-white/10 group ${!product.inStock ? 'opacity-60 grayscale' : ''} ${isHorizontalMode ? 'min-w-[160px] max-w-[160px] sm:min-w-[190px] sm:max-w-[190px] snap-start shrink-0' : ''}`}
      >
        <div className="relative h-36 sm:h-44 w-full rounded-xl overflow-hidden flex items-center justify-center p-0 border border-white/5 bg-black/20">
          <Image 
            src={product.image || "/placeholder.jpg"} 
            alt={product.name} 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-500" 
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
              <span className="bg-red-500 text-white font-black text-[10px] px-3 py-1.5 uppercase tracking-widest rounded-md shadow-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-1 flex-1 flex flex-col justify-start space-y-1">
          <p className="text-[#00FFFF] font-bold text-[9px] uppercase tracking-widest opacity-80">{product.category}</p>
          <p className="font-bold text-white text-xs leading-tight line-clamp-2">{product.name}</p>
        </div>

        <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/10">
          <div className="flex flex-col">
            <span className="font-mono font-black text-[#00FFFF] text-base">₹{product.price}</span>
            {product.mrp > product.price && <span className="text-[10px] text-muted-foreground line-through font-mono">₹{product.mrp}</span>}
          </div>
          
          {cartItem ? (
            <div className="flex items-center gap-2 bg-[#00FFFF]/10 border border-[#00FFFF]/30 rounded-lg p-1">
              <button onClick={() => updateQuantity(product.id, cartItem.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-[#00FFFF] hover:bg-[#00FFFF]/20 rounded-md transition-colors"><Minus className="w-3 h-3" /></button>
              <span className="text-sm font-black w-4 text-center text-white">{cartItem.quantity}</span>
              <button onClick={() => handlePlusClick(product.id, cartItem.quantity)} className="w-7 h-7 flex items-center justify-center text-[#00FFFF] hover:bg-[#00FFFF]/20 rounded-md transition-colors"><Plus className="w-3 h-3" /></button>
            </div>
          ) : (
            <Button 
              disabled={!product.inStock} 
              onClick={() => handleAddToCart(product)} 
              size="sm"
              className="h-9 bg-[#CCFF00] text-black font-black text-[11px] uppercase tracking-widest rounded-lg px-4 hover:bg-[#CCFF00]/80 disabled:bg-white/10 disabled:text-white/30 shadow-[0_0_15px_rgba(204,255,0,0.15)] hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]"
            >
              ADD
            </Button>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-foreground font-sans selection:bg-[#00FFFF]/30 pb-32 pt-24">
      
      <Header />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        
        {/* 🔥 STATIC WEBFOO MART TEXT - AB BANNER KE UPAR AAGAYA */}
        <div className="mb-2 pl-2">
          <h2 className="text-3xl font-black uppercase tracking-widest text-white not-italic drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">WebFoo Mart</h2>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#00FFFF] mt-1 not-italic drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]">Delivering Desires</p>
        </div>

        <AnimatePresence mode="wait">
          {!storeConfig ? (
            <Skeleton className="h-40 sm:h-52 w-full rounded-[1.5rem] bg-white/5 border border-white/10" />
          ) : isStoreOpen ? (
            <motion.div 
              key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="relative h-40 sm:h-52 w-full overflow-hidden rounded-[1.5rem] bg-[#0A0A0A] border-2 border-[#00FFFF]/40 shadow-[0_0_30px_rgba(0,255,255,0.1)] group flex items-center px-6 sm:px-8"
            >
              {storeConfig.bannerImageUrlOpen ? (
                <Image src={storeConfig.bannerImageUrlOpen} alt="Store open offer" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
              ) : (
                <>
                  <TicketPercent className="absolute w-40 h-40 text-[#00FFFF]/10 -right-5 -bottom-5 rotate-12" />
                  <Zap className="absolute w-32 h-32 text-[#CCFF00]/10 -left-5 -top-5 -rotate-12" />
                </>
              )}
              <div className="relative z-10 max-w-xl space-y-2">
                <p className="text-xl sm:text-3xl font-extrabold text-white uppercase tracking-tight leading-tight [text-shadow:0_0_15px_#fff]">
                  {storeConfig.bannerTextOpen}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="relative h-40 sm:h-52 w-full overflow-hidden rounded-[1.5rem] bg-[#100000] border-2 border-[#FF0055]/50 shadow-[0_0_30px_rgba(255,0,85,0.1)] group flex items-center px-6 sm:px-8"
            >
              {storeConfig.bannerImageUrlClosed ? (
                <Image src={storeConfig.bannerImageUrlClosed} alt="Store closed" fill className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" priority />
              ) : (
                <MoonStar className="absolute w-40 h-40 text-[#FF0055]/10 -right-5 -bottom-5 rotate-12" />
              )}
              <div className="relative z-10 max-w-xl space-y-2">
                <Badge className="bg-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest px-3 py-0.5 border border-red-500/30">STATUS</Badge>
                <p className="text-lg sm:text-2xl font-bold text-red-300 uppercase tracking-tight leading-tight">
                  {storeConfig.bannerTextClosed}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <div className="relative mt-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input 
              type="search" 
              placeholder="Search for snacks, drinks & more..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-14 pr-6 bg-white/5 border-white/10 rounded-full text-sm text-white focus-visible:border-[#00FFFF] shadow-inner w-full"
            />
          </div>
        </div>

        {/* LOADING STATE */}
        {(!products || products.length === 0) ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
            {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-72 rounded-[1.5rem] bg-white/5" />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* EMPTY SEARCH RESULT */
          <div className="py-20 text-center border border-dashed border-white/10 rounded-[1.5rem] bg-white/5">
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No items found for "{searchQuery}"</p>
          </div>
        ) : (
          searchQuery.trim() !== "" ? (
            // GRID VIEW FOR SEARCH RESULTS
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
              {filteredProducts.map((product: any) => renderProductCard(product, false))}
            </div>
          ) : (
            // SWIPE VIEW: Sirf wo 3 categories jo tune maangi
            <div className="space-y-8 pt-2">
              {HOME_CATEGORIES.map((category: string) => {
                // Case-insensitive match taaki "Cold Drink" aur "Cold Drinks" dono chal jayein
                const categoryProducts = products.filter((p: any) => 
                  String(p.category).toLowerCase() === category.toLowerCase() || 
                  String(p.category).toLowerCase() === category.toLowerCase() + 's'
                );
                
                if (categoryProducts.length === 0) return null;
                
                return (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase tracking-widest text-white pl-3 border-l-4 border-[#CCFF00] leading-none">
                        {category}
                      </h3>
                    </div>
                    {/* Horizontal Scroll Container */}
                    <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {categoryProducts.map((p: any) => renderProductCard(p, true))}
                    </div>
                  </div>
                )
              })}

              {/* VIEW ALL CATEGORIES BUTTON - Scroll Fix Added Here */}
              <div className="pt-6 pb-4">
                <Button asChild className="w-full h-14 bg-white/5 text-white border border-white/20 font-black uppercase tracking-widest text-lg rounded-xl hover:bg-[#00FFFF] hover:text-black hover:border-[#00FFFF] transition-all">
                  <Link href="/categories" onClick={() => window.scrollTo(0, 0)}>View All Categories</Link>
                </Button>
              </div>
            </div>
          )
        )}
      </main>

      <BottomNav />
      
    </div>
  )
}
