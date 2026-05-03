"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, Zap, MoonStar, TicketPercent, Plus, Minus, 
  UserCircle, Phone, Mail, ChefHat, Bike, ClipboardCheck, 
  ChevronRight, CheckCircle2, Clock, Lock
} from "lucide-react"

import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"

// 🔥 ZOMATO STYLE CUSTOM ANIMATED ICON 🔥
const PreparingIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <motion.path d="M9 5v2" animate={{ opacity: [0, 1, 0], y: [0, -3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} />
    <motion.path d="M15 5v2" animate={{ opacity: [0, 1, 0], y: [0, -3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.6 }} />
    <motion.path d="M12 3v3" animate={{ opacity: [0, 1, 0], y: [0, -4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }} />
    <motion.g animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 0.25, ease: "easeInOut" }}>
      <path d="M3 11h18" /> 
      <path d="M7 11a5 5 0 0 1 10 0" /> 
      <path d="M11 6h2" /> 
      <path d="M12 6v1" /> 
    </motion.g>
    <path d="M5 11v4a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-4" />
  </svg>
);

export default function HomePage() {
  const [isMounted, setIsMounted] = React.useState(false)
  const router = useRouter() 

  const { 
    orders, products, cart, addToCart, updateQuantity,
    fetchData, storeConfig, fetchStoreConfig, checkIfStoreOpen,
    triggerStoreClosedAlert, categories, user
  } = useAppStore() as any

  const [searchQuery, setSearchQuery] = React.useState("") 
  const [isStoreOpen, setIsStoreOpen] = React.useState(true)
  
  // LIVE TRACKING STATES
  const [activeOrder, setActiveOrder] = React.useState<any>(null)
  const [isTrackingOpen, setIsTrackingOpen] = React.useState(false)
  
  // CURRENT TIME FOR CATEGORY CHECK
  const [currentTimeStr, setCurrentTimeStr] = React.useState("00:00")

  React.useEffect(() => {
    setIsMounted(true)
    if (fetchStoreConfig) fetchStoreConfig()
    if (fetchData) fetchData()
    
    const updateTime = () => {
      const now = new Date()
      setCurrentTimeStr(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`)
    }
    updateTime()
    const timeInterval = setInterval(updateTime, 10000) 
    return () => clearInterval(timeInterval)
  }, [fetchData, fetchStoreConfig])

  React.useEffect(() => {
    if (!storeConfig) return;
    const checkTime = () => {
      if (checkIfStoreOpen) {
        setIsStoreOpen(checkIfStoreOpen());
      }
    };
    checkTime(); 
    const interval = setInterval(checkTime, 60000); 
    return () => clearInterval(interval);
  }, [storeConfig, checkIfStoreOpen]);

  React.useEffect(() => {
    if (isMounted && orders && orders.length > 0) {
      let myPhone = user?.phone;
      if (!myPhone) {
        try {
          const localProfile = JSON.parse(localStorage.getItem('webfoo_profile') || '{}');
          if (localProfile && localProfile.phone) myPhone = localProfile.phone;
        } catch(e) {}
      }
      if (myPhone) {
        const myPhoneStr = String(myPhone).trim();
        const userOrders = orders.filter((o: any) => 
          String(o.phone).trim() === myPhoneStr && 
          (o.status === 'Pending' || o.status === 'Preparing' || o.status === 'In Transit')
        );
        if (userOrders.length > 0) setActiveOrder(userOrders[userOrders.length - 1])
        else { setActiveOrder(null); setIsTrackingOpen(false); }
      }
    }
  }, [orders, isMounted, user])

  if (!isMounted) return <div className="min-h-screen bg-background transition-colors duration-300" />

  const getCartItem = (id: string) => cart.find((item: any) => item.id === id)

  const filteredProducts = products.filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const rawCategories: string[] = products.map((p: any) => String(p.category || ''));
  const uniqueCategories: string[] = [...new Set(rawCategories)].sort((a: string, b: string) => {
    const catA = (categories || []).find((c: any) => c.name.toLowerCase() === a.toLowerCase());
    const catB = (categories || []).find((c: any) => c.name.toLowerCase() === b.toLowerCase());
    const orderA = catA ? (catA.sortOrder || 0) : 999;
    const orderB = catB ? (catB.sortOrder || 0) : 999;
    return orderA - orderB;
  });

  const checkCategoryStatus = (categoryName: string) => {
    if (!categoryName) return { isOpen: true, message: '' };

    const cat = (categories || []).find((c: any) => 
      c.name?.trim().toLowerCase() === categoryName.trim().toLowerCase()
    );
    
    if (!cat) return { isOpen: true, message: '' };
    if (cat.isActive === false) return { isOpen: false, message: 'Currently Unavailable' };
    if (!cat.startTime || !cat.endTime) return { isOpen: true, message: '' };

    const getMins = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return (h * 60) + (m || 0);
    };

    const currentMins = getMins(currentTimeStr);
    const startMins = getMins(cat.startTime);
    const endMins = getMins(cat.endTime);

    let isOpen = false;
    if (startMins <= endMins) {
      isOpen = (currentMins >= startMins && currentMins <= endMins);
    } else {
      isOpen = (currentMins >= startMins || currentMins <= endMins); 
    }

    const formatTime = (time24: string) => {
      const [h, m] = time24.split(':');
      const hh = parseInt(h, 10);
      const ampm = hh >= 12 ? 'PM' : 'AM';
      const h12 = hh % 12 || 12;
      return `${h12}:${m} ${ampm}`;
    };

    return { 
      isOpen, 
      message: isOpen ? '' : `Opens at ${formatTime(cat.startTime)}`
    };
  }

  const handleAddToCart = (e: React.MouseEvent, product: any, isCatOpen: boolean) => {
    e.stopPropagation() 
    if (!isStoreOpen) return triggerStoreClosedAlert();
    if (!isCatOpen) return alert("This item is currently not available for order due to timings.");
    addToCart(product);
  }

  const handlePlusClick = (e: React.MouseEvent, productId: string, currentQuantity: number, isCatOpen: boolean) => {
    e.stopPropagation() 
    if (!isStoreOpen) return triggerStoreClosedAlert();
    if (!isCatOpen) return;
    updateQuantity(productId, currentQuantity + 1);
  }

  const handleMinusClick = (e: React.MouseEvent, productId: string, currentQuantity: number) => {
    e.stopPropagation() 
    updateQuantity(productId, currentQuantity - 1);
  }

  const renderProductCard = (product: any, isHorizontalMode: boolean = false, isCatOpen: boolean = true) => {
    const cartItem = getCartItem(product.id)
    const itemLocked = !product.inStock || !isCatOpen

    return (
      <motion.div 
        key={product.id} 
        layout 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        onClick={() => { if(!itemLocked) router.push(`/product/${product.id}`) }} 
        className={`cursor-pointer bg-card/50 dark:bg-white/5 p-3 rounded-[1.5rem] border border-border flex flex-col gap-3 relative transition-all duration-300 hover:border-theme-accent/40 hover:bg-black/5 dark:hover:bg-white/10 group ${itemLocked ? 'opacity-60 grayscale cursor-not-allowed pointer-events-none' : ''} ${isHorizontalMode ? 'min-w-[160px] max-w-[160px] sm:min-w-[190px] sm:max-w-[190px] snap-start shrink-0' : ''}`}
      >
        <div className="relative h-36 sm:h-44 w-full rounded-xl overflow-hidden flex items-center justify-center p-0 border border-border bg-black/5 dark:bg-black/20">
          <Image 
            src={product.image || "/placeholder.jpg"} 
            alt={product.name} 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-500" 
          />
          {itemLocked && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-2 text-center gap-1">
              {!isCatOpen ? (
                <Lock className="w-4 h-4 text-white opacity-80 mb-1" />
              ) : null}
              {/* 🔥 CUSTOM DISCOUNT/OUT OF STOCK COLOR 🔥 */}
              <span className={`text-white font-black text-[10px] px-3 py-1.5 uppercase tracking-widest rounded-md shadow-lg ${!isCatOpen ? 'bg-orange-500' : 'bg-theme-discount'}`}>
                {!isCatOpen ? 'Closed' : (product.customStockMessage || 'Out of Stock')}
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-1 flex-1 flex flex-col justify-start space-y-1">
          {/* 🔥 CUSTOM ACCENT COLOR 🔥 */}
          <p className="text-theme-accent font-bold text-[9px] uppercase tracking-widest opacity-80">{product.category}</p>
          {/* 🔥 CUSTOM TITLE COLOR 🔥 */}
          <p className="font-bold text-theme-title text-xs leading-tight line-clamp-2">{product.name}</p>
          
          <div className="pt-0.5">
            {product.foodPref === 'veg' && (
              <div className="bg-white p-[2px] rounded-sm shadow-sm border border-black/10 w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16"><path stroke="#008000" strokeWidth="1.5" fill="none" d="M 0.5,0.5 H 15.5 V 15.5 H 0.5 Z" /><circle fill="#008000" cx="8" cy="8" r="4.5" /></svg>
              </div>
            )}
            {product.foodPref === 'non-veg' && (
              <div className="bg-white p-[2px] rounded-sm shadow-sm border border-black/10 w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16"><path stroke="#8B4513" strokeWidth="1.5" fill="none" d="M 0.5,0.5 H 15.5 V 15.5 H 0.5 Z" /><path fill="#8B4513" d="M 8,3 L 13.5,12.5 H 2.5 Z" /></svg>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-1 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col">
            {/* 🔥 CUSTOM PRICE COLOR 🔥 */}
            <span className="font-mono font-black text-theme-price text-base">₹{product.price}</span>
            {/* 🔥 CUSTOM DISCOUNT COLOR (MRP) 🔥 */}
            {product.mrp > product.price && <span className="text-[10px] text-theme-discount opacity-80 line-through font-mono">₹{product.mrp}</span>}
          </div>
          
          {cartItem ? (
            <div className={`flex items-center gap-2 bg-theme-accent/10 border border-theme-accent/30 rounded-lg p-1 ${itemLocked ? 'pointer-events-none opacity-50' : ''}`}>
              <button onClick={(e) => handleMinusClick(e, product.id, cartItem.quantity)} className="w-7 h-7 flex items-center justify-center text-theme-accent hover:bg-theme-accent/20 rounded-md transition-colors"><Minus className="w-3 h-3" /></button>
              <span className="text-sm font-black w-4 text-center text-foreground">{cartItem.quantity}</span>
              <button onClick={(e) => handlePlusClick(e, product.id, cartItem.quantity, isCatOpen)} className="w-7 h-7 flex items-center justify-center text-theme-accent hover:bg-theme-accent/20 rounded-md transition-colors"><Plus className="w-3 h-3" /></button>
            </div>
          ) : (
            <Button 
              disabled={itemLocked} 
              onClick={(e) => handleAddToCart(e, product, isCatOpen)} 
              size="sm" 
              // 🔥 CUSTOM BUTTON/ACCENT COLOR 🔥
              className="h-9 bg-theme-accent text-black font-black text-[11px] uppercase tracking-widest rounded-lg px-4 hover:opacity-80 disabled:bg-muted disabled:text-muted-foreground shadow-sm pointer-events-auto"
            >
              ADD
            </Button>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-theme-accent/30 pb-32 pt-24 relative transition-colors duration-300">
      <Header />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!storeConfig ? (
            <Skeleton className="h-40 sm:h-52 w-full rounded-[1.5rem] bg-muted border border-border" />
          ) : isStoreOpen ? (
            <motion.div key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-40 sm:h-52 w-full overflow-hidden rounded-[1.5rem] bg-black/5 dark:bg-[#0A0A0A] border-2 border-primary/40 shadow-[0_0_30px_rgba(0,139,139,0.1)] dark:shadow-[0_0_30px_rgba(0,255,255,0.1)] group flex items-center px-6 sm:px-8">
              {storeConfig.bannerImageUrlOpen ? (
                <Image src={storeConfig.bannerImageUrlOpen} alt="Store open" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
              ) : (
                <><TicketPercent className="absolute w-40 h-40 text-primary/10 -right-5 -bottom-5 rotate-12" /><Zap className="absolute w-32 h-32 text-theme-accent/10 -left-5 -top-5 -rotate-12" /></>
              )}
              <div className="relative z-10 max-w-xl space-y-2">
                <p className="text-xl sm:text-3xl font-extrabold text-white uppercase tracking-tight leading-tight [text-shadow:0_0_15px_#000] dark:[text-shadow:0_0_15px_#fff]">{storeConfig.bannerTextOpen}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-40 sm:h-52 w-full overflow-hidden rounded-[1.5rem] bg-black/5 dark:bg-[#100000] border-2 border-theme-discount/50 shadow-sm group flex items-center px-6 sm:px-8">
              {storeConfig.bannerImageUrlClosed ? (
                <Image src={storeConfig.bannerImageUrlClosed} alt="Store closed" fill className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" priority />
              ) : (
                <MoonStar className="absolute w-40 h-40 text-theme-discount/10 -right-5 -bottom-5 rotate-12" />
              )}
              <div className="relative z-10 max-w-xl space-y-2">
                <Badge className="bg-theme-discount/20 text-theme-discount font-black text-[10px] uppercase tracking-widest px-3 py-0.5 border border-theme-discount/30">STATUS</Badge>
                <p className="text-lg sm:text-2xl font-bold text-theme-discount uppercase tracking-tight leading-tight">{storeConfig.bannerTextClosed}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <div className="relative mt-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input type="search" placeholder="Search for snacks, drinks & more..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-14 pl-14 pr-6 bg-card border-border rounded-full text-sm text-foreground focus-visible:border-theme-accent shadow-inner w-full" />
          </div>
        </div>

        {(!products || products.length === 0) ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
            {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-72 rounded-[1.5rem] bg-muted" />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border rounded-[1.5rem] bg-card">
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No items found for "{searchQuery}"</p>
          </div>
        ) : (
          searchQuery.trim() !== "" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
              {filteredProducts.map((product: any) => {
                 const { isOpen } = checkCategoryStatus(product.category);
                 return renderProductCard(product, false, isOpen);
              })}
            </div>
          ) : (
            <div className="space-y-8 pt-2">
              {uniqueCategories.map((categoryName: string) => {
                const categoryProducts = products.filter((p: any) => String(p.category).toLowerCase() === categoryName.toLowerCase());
                if (categoryProducts.length === 0) return null;
                
                const { isOpen, message } = checkCategoryStatus(categoryName);

                return (
                  <div key={categoryName} className={`space-y-4 transition-all duration-500 ${!isOpen ? 'opacity-80' : ''}`}>
                    {/* 🔥 CUSTOM CATEGORY TITLE & BORDER 🔥 */}
                    <div className="flex items-center gap-3 pl-3 border-l-4 border-theme-accent">
                      <h3 className="text-xl font-black uppercase tracking-widest text-theme-title leading-none">{categoryName}</h3>
                      {!isOpen && message && (
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30 text-[10px] uppercase font-black tracking-widest px-2 py-0.5">
                          <Clock className="w-3 h-3 mr-1 inline" /> {message}
                        </Badge>
                      )}
                    </div>
                    <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {categoryProducts.map((p: any) => renderProductCard(p, true, isOpen))}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {storeConfig && storeConfig.ownerName && (
          <div className="mt-16 pt-8 border-t border-border">
            <div className="max-w-md mx-auto bg-card/50 p-6 rounded-[2rem] border border-border text-center flex flex-col items-center gap-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-theme-accent/5 to-transparent pointer-events-none"></div>
              {storeConfig.ownerPhoto ? (
                <div className="relative w-20 h-20 rounded-full border-2 border-theme-accent/30 p-1 bg-background overflow-hidden z-10 group-hover:scale-105 transition-transform duration-300">
                  <Image src={storeConfig.ownerPhoto} alt={storeConfig.ownerName} fill className="object-cover rounded-full" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full border-2 border-theme-accent/30 bg-theme-accent/10 flex items-center justify-center z-10">
                  <UserCircle className="w-8 h-8 text-theme-accent" />
                </div>
              )}
              <div className="space-y-1 z-10">
                <Badge variant="outline" className="text-theme-accent border-theme-accent/30 bg-theme-accent/10 mb-2 uppercase tracking-widest text-[9px] font-black">Founder & Owner</Badge>
                <h3 className="text-xl font-black text-theme-title uppercase tracking-tight">{storeConfig.ownerName}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Behind WebFoo</p>
              </div>
              <div className="flex gap-4 w-full mt-2 z-10">
                {storeConfig.ownerPhone && (
                  <a href={`tel:${storeConfig.ownerPhone}`} className="flex-1">
                    <Button variant="outline" className="w-full h-10 border-border hover:border-theme-accent/50 hover:bg-theme-accent/10 hover:text-theme-accent text-muted-foreground transition-all">
                      <Phone className="w-4 h-4 mr-2" /> Call
                    </Button>
                  </a>
                )}
                {storeConfig.ownerEmail && (
                  <a href={`mailto:${storeConfig.ownerEmail}`} className="flex-1">
                    <Button variant="outline" className="w-full h-10 border-border hover:border-theme-accent/50 hover:bg-theme-accent/10 hover:text-theme-accent text-muted-foreground transition-all">
                      <Mail className="w-4 h-4 mr-2" /> Mail
                    </Button>
                  </a>
                )}
              </div>
            </div>
            <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground/50 mt-6 font-bold">© {new Date().getFullYear()} WebFoo Mart. Built for speed.</p>
          </div>
        )}
      </main>

      <AnimatePresence>
        {activeOrder && (
          <motion.div 
            initial={{ y: 150, opacity: 0, scale: 0.8 }} 
            animate={{ y: 0, opacity: 1, scale: 1 }} 
            exit={{ y: 150, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-[85px] left-0 right-0 z-50 px-4 flex justify-center pointer-events-none"
          >
            <div onClick={() => setIsTrackingOpen(true)} className="pointer-events-auto w-full max-w-[340px] bg-background/95 backdrop-blur-2xl rounded-[2rem] p-2 pr-4 flex items-center gap-4 cursor-pointer border border-border shadow-xl overflow-hidden relative group">
              <div className={`absolute bottom-0 left-0 h-[3px] transition-all duration-1000 ease-in-out ${activeOrder.status === 'Pending' ? 'bg-orange-500 w-[20%]' : activeOrder.status === 'Preparing' ? 'bg-theme-price w-[50%]' : 'bg-theme-accent w-[85%]'}`}></div>
              <div className={`absolute inset-0 opacity-20 ${activeOrder.status === 'Pending' ? 'bg-gradient-to-r from-orange-500 to-transparent' : activeOrder.status === 'Preparing' ? 'bg-gradient-to-r from-theme-price to-transparent' : 'bg-gradient-to-r from-theme-accent to-transparent'}`} />

              <div className="flex items-center gap-3 relative z-10 w-full">
                <div className={`w-12 h-12 shrink-0 rounded-[1.2rem] flex items-center justify-center bg-card border relative overflow-hidden ${activeOrder.status === 'Pending' ? 'border-orange-500/50 text-orange-500' : activeOrder.status === 'Preparing' ? 'border-theme-price/50 text-theme-price' : 'border-theme-accent/50 text-theme-accent'}`}>
                  {activeOrder.status === 'Pending' ? (
                    <Clock className="w-6 h-6 animate-pulse" />
                  ) : activeOrder.status === 'Preparing' ? (
                    <PreparingIcon className="w-6 h-6" />
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <motion.div animate={{ x: [15, -20], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }} className="absolute top-3 right-0 w-3 h-[1px] bg-theme-accent rounded-full"></motion.div>
                      <motion.div animate={{ x: [15, -20], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.2, ease: "linear" }} className="absolute bottom-3 right-0 w-4 h-[1px] bg-theme-accent rounded-full"></motion.div>
                      <motion.div animate={{ y: [0, -2, 0], rotate: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.3, ease: "linear" }} className="z-10 bg-card rounded-full"><Bike className="w-5 h-5" /></motion.div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col justify-center flex-1">
                  <span className="font-black text-theme-title text-sm tracking-tight leading-none mb-1">
                    {activeOrder.status === 'Pending' ? 'Waiting for Acceptance' : activeOrder.status === 'Preparing' ? 'Preparing Order' : 'On the Way'}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${activeOrder.status === 'Pending' ? 'text-orange-500/70' : activeOrder.status === 'Preparing' ? 'text-theme-price/70' : 'text-theme-accent/70'}`}>
                    {activeOrder.status === 'Pending' ? 'Please wait...' : activeOrder.status === 'Preparing' ? 'Arriving in 25-30 mins' : 'Arriving in 10-15 mins'}
                  </span>
                </div>
                <div className="shrink-0 w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors z-10"><ChevronRight className="w-4 h-4 text-muted-foreground" /></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
        <SheetContent side="bottom" className="h-[80vh] sm:max-w-md mx-auto bg-background border-t border-border rounded-t-[2rem] p-0 overflow-hidden flex flex-col">
          {activeOrder && (
            <>
              <SheetHeader className="p-6 border-b border-border bg-card/50 shrink-0">
                <div className="text-left flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`bg-transparent border-border ${activeOrder.status === 'Pending' ? 'text-orange-500' : activeOrder.status === 'Preparing' ? 'text-theme-price' : 'text-theme-accent'} text-[9px] uppercase tracking-widest font-black px-2 py-0.5`}>
                      Live Status
                    </Badge>
                  </div>
                  <span className="text-xl font-black text-theme-title leading-tight line-clamp-2">
                    {activeOrder?.items?.map((item: any) => `${item.quantity}x ${item.name}`).join(' • ')}
                  </span>
                </div>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-8 relative">
                <div className="absolute left-[47px] top-10 bottom-20 w-[2px] bg-border"></div>
                <div className="space-y-12 relative z-10">
                  <div className="flex items-start gap-6">
                    <div className={`w-12 h-12 rounded-full bg-card border-[3px] flex items-center justify-center shrink-0 z-10 shadow-sm transition-all duration-500 ${activeOrder.status === 'Pending' ? 'border-orange-500 text-orange-500 scale-110' : 'border-theme-price/30 text-theme-price scale-100'}`}><ClipboardCheck className="w-5 h-5" /></div>
                    <div className="pt-2"><h4 className={`font-bold text-lg leading-none ${activeOrder.status === 'Pending' ? 'text-orange-500' : 'text-theme-title'}`}>Order Placed</h4><p className="text-xs text-muted-foreground mt-1">{activeOrder.status === 'Pending' ? 'Waiting for restaurant to confirm...' : 'Restaurant accepted your order.'}</p></div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className={`w-12 h-12 rounded-full bg-card border-[3px] flex items-center justify-center shrink-0 z-10 transition-all duration-500 overflow-hidden ${activeOrder.status === 'Preparing' ? 'border-theme-price text-theme-price scale-110' : activeOrder.status === 'In Transit' ? 'border-foreground/20 text-foreground scale-100' : 'border-border text-muted-foreground/30'}`}>
                      {activeOrder.status === 'Preparing' ? <PreparingIcon className="w-6 h-6" /> : <ChefHat className="w-5 h-5" />}
                    </div>
                    <div className="pt-2"><h4 className={`font-bold text-lg leading-none transition-colors ${activeOrder.status === 'Preparing' ? 'text-theme-price' : activeOrder.status === 'In Transit' ? 'text-theme-title' : 'text-muted-foreground/30'}`}>Food is being prepared</h4><p className="text-xs text-muted-foreground mt-1">Our chef is on it.</p></div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className={`relative w-12 h-12 rounded-full bg-card border-[3px] flex items-center justify-center shrink-0 z-10 transition-all duration-500 overflow-hidden ${activeOrder.status === 'In Transit' ? 'border-theme-accent text-theme-accent scale-110' : 'border-border text-muted-foreground/30 scale-100'}`}>
                      {activeOrder.status === 'In Transit' ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <motion.div animate={{ x: [15, -20], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }} className="absolute top-4 right-0 w-2 h-[1px] bg-theme-accent rounded-full"></motion.div>
                          <motion.div animate={{ x: [15, -20], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.2, ease: "linear" }} className="absolute bottom-4 right-0 w-3 h-[1px] bg-theme-accent rounded-full"></motion.div>
                          <motion.div animate={{ y: [0, -2, 0], rotate: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.3, ease: "linear" }} className="z-10 bg-card rounded-full"><Bike className="w-5 h-5" /></motion.div>
                        </div>
                      ) : (<Bike className="w-5 h-5" />)}
                    </div>
                    <div className="pt-2"><h4 className={`font-bold text-lg leading-none transition-colors ${activeOrder.status === 'In Transit' ? 'text-theme-accent' : 'text-muted-foreground/30'}`}>On the Way</h4><p className="text-xs text-muted-foreground mt-1">Rider is heading to your location.</p></div>
                  </div>

                  <div className="flex items-start gap-6 opacity-30">
                    <div className="w-12 h-12 rounded-full bg-card border-[3px] border-border text-muted-foreground/50 flex items-center justify-center shrink-0 z-10"><CheckCircle2 className="w-5 h-5" /></div>
                    <div className="pt-2"><h4 className="font-bold text-lg leading-none text-theme-title">Delivered</h4><p className="text-xs text-muted-foreground mt-1">Enjoy your meal!</p></div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border bg-card/50 shrink-0">
                <a href={`tel:${storeConfig?.ownerPhone || ''}`}>
                  <Button className="w-full h-14 bg-black/5 dark:bg-white/5 text-foreground hover:bg-black/10 dark:hover:bg-white/10 border border-border rounded-xl font-bold uppercase tracking-widest transition-all">
                    <Phone className="w-4 h-4 mr-2" /> Contact Support
                  </Button>
                </a>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <BottomNav />
    </div>
  )
}
