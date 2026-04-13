"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Zap, MoonStar, TicketPercent, Plus, Minus, UserCircle, Phone, Mail, Bike, ClipboardCheck, ChevronRight, CheckCircle2 } from "lucide-react"

import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"

// 🔥 CUSTOM PREPARING ICON (BARTAN + SPOON + SMOKE) 🔥
const PreparingIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Smoke/Steam */}
    <path d="M9 3v4" />
    <path d="M15 3v4" />
    <path d="M12 5v2" />
    {/* Spoon Sticking Out */}
    <path d="M19 13V7a2 2 0 0 0-2-2h-1" />
    {/* Cooking Pot */}
    <path d="M4 11h16a1 1 0 0 1 1 1v2a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-2a1 1 0 0 1 1-1Z" />
    {/* Pot Lid/Rim Line */}
    <path d="M2 11h20" />
  </svg>
);

export default function HomePage() {
  const [isMounted, setIsMounted] = React.useState(false)
  const router = useRouter() 

  const { 
    orders, products, cart, addToCart, removeFromCart, updateQuantity,
    fetchData, storeConfig, fetchStoreConfig, checkIfStoreOpen,
    triggerStoreClosedAlert, categories, user
  } = useAppStore() as any

  const [searchQuery, setSearchQuery] = React.useState("") 
  const [isStoreOpen, setIsStoreOpen] = React.useState(true)
  
  // LIVE TRACKING STATES
  const [activeOrder, setActiveOrder] = React.useState<any>(null)
  const [isTrackingOpen, setIsTrackingOpen] = React.useState(false)

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

  // FIND ACTIVE ORDER FOR LIVE TRACKING
  React.useEffect(() => {
    if (isMounted && orders && orders.length > 0) {
      let myPhone = user?.phone;
      
      if (!myPhone) {
        try {
          const localProfile = JSON.parse(localStorage.getItem('webfoo_profile') || '{}');
          if (localProfile && localProfile.phone) {
            myPhone = localProfile.phone;
          }
        } catch(e) {}
      }

      if (myPhone) {
        const myPhoneStr = String(myPhone).trim();
        const userOrders = orders.filter((o: any) => String(o.phone).trim() === myPhoneStr && (o.status === 'Pending' || o.status === 'In Transit'));
        
        if (userOrders.length > 0) {
          setActiveOrder(userOrders[userOrders.length - 1])
        } else {
          setActiveOrder(null)
          setIsTrackingOpen(false)
        }
      }
    }
  }, [orders, isMounted, user])

  if (!isMounted) return <div className="min-h-screen bg-[#050505]" />

  const getCartItem = (id: string) => cart.find((item: any) => item.id === id)

  const filteredProducts = products.filter((p: any) => {
    return p.name.toLowerCase().includes(searchQuery.toLowerCase());
  })

  const rawCategories: string[] = products.map((p: any) => String(p.category || ''));
  const uniqueCategories: string[] = [...new Set(rawCategories)].sort((a: string, b: string) => {
    const catA = (categories || []).find((c: any) => c.name.toLowerCase() === a.toLowerCase());
    const catB = (categories || []).find((c: any) => c.name.toLowerCase() === b.toLowerCase());
    const orderA = catA ? (catA.sortOrder || 0) : 999;
    const orderB = catB ? (catB.sortOrder || 0) : 999;
    return orderA - orderB;
  });

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation() 
    if (!isStoreOpen) {
      triggerStoreClosedAlert();
      return;
    }
    addToCart(product);
  }

  const handlePlusClick = (e: React.MouseEvent, productId: string, currentQuantity: number) => {
    e.stopPropagation() 
    if (!isStoreOpen) {
      triggerStoreClosedAlert();
      return;
    }
    updateQuantity(productId, currentQuantity + 1);
  }

  const handleMinusClick = (e: React.MouseEvent, productId: string, currentQuantity: number) => {
    e.stopPropagation() 
    updateQuantity(productId, currentQuantity - 1);
  }

  const renderProductCard = (product: any, isHorizontalMode: boolean = false) => {
    const cartItem = getCartItem(product.id)
    return (
      <motion.div 
        key={product.id} 
        layout 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        onClick={() => router.push(`/product/${product.id}`)} 
        className={`cursor-pointer bg-white/5 p-3 rounded-[1.5rem] border border-white/10 flex flex-col gap-3 relative transition-all duration-300 hover:border-[#00FFFF]/40 hover:bg-white/10 group ${!product.inStock ? 'opacity-60 grayscale' : ''} ${isHorizontalMode ? 'min-w-[160px] max-w-[160px] sm:min-w-[190px] sm:max-w-[190px] snap-start shrink-0' : ''}`}
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
          
          <div className="pt-0.5">
            {product.foodPref === 'veg' && (
              <div className="bg-white p-[2px] rounded-sm shadow-sm w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16">
                  <path stroke="#008000" strokeWidth="1.5" fill="none" d="M 0.5,0.5 H 15.5 V 15.5 H 0.5 Z" />
                  <circle fill="#008000" cx="8" cy="8" r="4.5" />
                </svg>
              </div>
            )}
            {product.foodPref === 'non-veg' && (
              <div className="bg-white p-[2px] rounded-sm shadow-sm w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16">
                  <path stroke="#8B4513" strokeWidth="1.5" fill="none" d="M 0.5,0.5 H 15.5 V 15.5 H 0.5 Z" />
                  <path fill="#8B4513" d="M 8,3 L 13.5,12.5 H 2.5 Z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col">
            <span className="font-mono font-black text-[#00FFFF] text-base">₹{product.price}</span>
            {product.mrp > product.price && <span className="text-[10px] text-muted-foreground line-through font-mono">₹{product.mrp}</span>}
          </div>
          
          {cartItem ? (
            <div className="flex items-center gap-2 bg-[#00FFFF]/10 border border-[#00FFFF]/30 rounded-lg p-1">
              <button onClick={(e) => handleMinusClick(e, product.id, cartItem.quantity)} className="w-7 h-7 flex items-center justify-center text-[#00FFFF] hover:bg-[#00FFFF]/20 rounded-md transition-colors"><Minus className="w-3 h-3" /></button>
              <span className="text-sm font-black w-4 text-center text-white">{cartItem.quantity}</span>
              <button onClick={(e) => handlePlusClick(e, product.id, cartItem.quantity)} className="w-7 h-7 flex items-center justify-center text-[#00FFFF] hover:bg-[#00FFFF]/20 rounded-md transition-colors"><Plus className="w-3 h-3" /></button>
            </div>
          ) : (
            <Button 
              disabled={!product.inStock} 
              onClick={(e) => handleAddToCart(e, product)} 
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
    <div className="min-h-screen bg-[#050505] text-foreground font-sans selection:bg-[#00FFFF]/30 pb-32 pt-24 relative">
      
      <Header />

      <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">

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

        {(!products || products.length === 0) ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
            {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-72 rounded-[1.5rem] bg-white/5" />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-[1.5rem] bg-white/5">
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No items found for "{searchQuery}"</p>
          </div>
        ) : (
          searchQuery.trim() !== "" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
              {filteredProducts.map((product: any) => renderProductCard(product, false))}
            </div>
          ) : (
            <div className="space-y-8 pt-2">
              {uniqueCategories.map((categoryName: string) => {
                const categoryProducts = products.filter((p: any) => 
                  String(p.category).toLowerCase() === categoryName.toLowerCase()
                );
                
                if (categoryProducts.length === 0) return null;
                
                return (
                  <div key={categoryName} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black uppercase tracking-widest text-white pl-3 border-l-4 border-[#CCFF00] leading-none">
                        {categoryName}
                      </h3>
                    </div>
                    <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {categoryProducts.map((p: any) => renderProductCard(p, true))}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {storeConfig && storeConfig.ownerName && (
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="max-w-md mx-auto glass-strong p-6 rounded-[2rem] border border-white/5 text-center flex flex-col items-center gap-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-[#CCFF00]/5 to-transparent pointer-events-none"></div>
              
              {storeConfig.ownerPhoto ? (
                <div className="relative w-20 h-20 rounded-full border-2 border-[#CCFF00]/30 p-1 bg-black overflow-hidden z-10 group-hover:scale-105 transition-transform duration-300">
                  <Image src={storeConfig.ownerPhoto} alt={storeConfig.ownerName} fill className="object-cover rounded-full" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full border-2 border-[#CCFF00]/30 bg-[#CCFF00]/10 flex items-center justify-center z-10">
                  <UserCircle className="w-8 h-8 text-[#CCFF00]" />
                </div>
              )}
              
              <div className="space-y-1 z-10">
                <Badge variant="outline" className="text-[#00FFFF] border-[#00FFFF]/30 bg-[#00FFFF]/10 mb-2 uppercase tracking-widest text-[9px] font-black">Founder & Owner</Badge>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{storeConfig.ownerName}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Behind WebFoo</p>
              </div>

              <div className="flex gap-4 w-full mt-2 z-10">
                {storeConfig.ownerPhone && (
                  <a href={`tel:${storeConfig.ownerPhone}`} className="flex-1">
                    <Button variant="outline" className="w-full h-10 border-white/10 hover:border-[#CCFF00]/50 hover:bg-[#CCFF00]/10 hover:text-[#CCFF00] text-muted-foreground transition-all">
                      <Phone className="w-4 h-4 mr-2" /> Call
                    </Button>
                  </a>
                )}
                {storeConfig.ownerEmail && (
                  <a href={`mailto:${storeConfig.ownerEmail}`} className="flex-1">
                    <Button variant="outline" className="w-full h-10 border-white/10 hover:border-[#00FFFF]/50 hover:bg-[#00FFFF]/10 hover:text-[#00FFFF] text-muted-foreground transition-all">
                      <Mail className="w-4 h-4 mr-2" /> Mail
                    </Button>
                  </a>
                )}
              </div>
            </div>
            
            <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground/50 mt-6 font-bold">
              © {new Date().getFullYear()} WebFoo Mart. Built for speed.
            </p>
          </div>
        )}

      </main>

      {/* 🔥 ULTRA-PREMIUM DYNAMIC ISLAND TRACKER (LIVE ANIMATED ICONS) 🔥 */}
      <AnimatePresence>
        {activeOrder && (
          <motion.div 
            initial={{ y: 150, opacity: 0, scale: 0.8 }} 
            animate={{ y: 0, opacity: 1, scale: 1 }} 
            exit={{ y: 150, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-[85px] left-0 right-0 z-50 px-4 flex justify-center pointer-events-none"
          >
            <div 
              onClick={() => setIsTrackingOpen(true)} 
              className="pointer-events-auto w-full max-w-[340px] bg-[#0A0A0A]/95 backdrop-blur-2xl rounded-[2rem] p-2 pr-4 flex items-center gap-4 cursor-pointer border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden relative group"
            >
              {/* Subtle Progress Bar Edge */}
              <div className={`absolute bottom-0 left-0 h-[3px] ${activeOrder.status === 'Pending' ? 'bg-[#00FFFF] w-[40%]' : 'bg-[#CCFF00] w-[85%]'} transition-all duration-1000 ease-in-out`}></div>

              {/* Glowing Background */}
              <div className={`absolute inset-0 opacity-20 ${activeOrder.status === 'Pending' ? 'bg-gradient-to-r from-[#00FFFF] to-transparent' : 'bg-gradient-to-r from-[#CCFF00] to-transparent'}`} />

              <div className="flex items-center gap-3 relative z-10">
                {/* 👨‍🍳 SMOOTH WOBBLING/BOBBING ICONS */}
                <div className={`w-12 h-12 shrink-0 rounded-[1.2rem] flex items-center justify-center bg-black border ${activeOrder.status === 'Pending' ? 'border-[#00FFFF]/50 text-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.3)]' : 'border-[#CCFF00]/50 text-[#CCFF00] shadow-[0_0_10px_rgba(204,255,0,0.3)]'}`}>
                  {activeOrder.status === 'Pending' ? (
                    <motion.div animate={{ rotate: [-4, 4, -4], y: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                      <PreparingIcon className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div animate={{ y: [-1, 2, -1], x: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
                      <Bike className="w-5 h-5" />
                    </motion.div>
                  )}
                </div>
                
                <div className="flex flex-col justify-center">
                  <span className="font-black text-white text-sm tracking-tight leading-none mb-1">
                    {activeOrder.status === 'Pending' ? 'Preparing Order' : 'On the Way'}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${activeOrder.status === 'Pending' ? 'text-[#00FFFF]/70' : 'text-[#CCFF00]/70'}`}>
                    Arriving in {activeOrder.status === 'Pending' ? '25-30' : '10-15'} mins
                  </span>
                </div>
              </div>
              
              <div className="ml-auto shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors z-10 relative">
                 <ChevronRight className="w-4 h-4 text-white/50" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔥 CLEAN & MINIMAL LIVE TRACKING SHEET 🔥 */}
      <Sheet open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
        <SheetContent side="bottom" className="h-[80vh] sm:max-w-md mx-auto bg-[#050505] border-t border-white/10 rounded-t-[2rem] p-0 overflow-hidden flex flex-col">
          {activeOrder && (
            <>
              {/* CLEAN HEADER WITH ITEMS */}
              <SheetHeader className="p-6 border-b border-white/5 bg-[#0A0A0A] shrink-0">
                <div className="text-left flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`bg-transparent border-white/10 ${activeOrder.status === 'Pending' ? 'text-[#00FFFF]' : 'text-[#CCFF00]'} text-[9px] uppercase tracking-widest font-black px-2 py-0.5`}>
                      Live Status
                    </Badge>
                  </div>
                  <span className="text-xl font-black text-white leading-tight line-clamp-2">
                    {activeOrder?.items?.map((item: any) => `${item.quantity}x ${item.name}`).join(', ')}
                  </span>
                </div>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-8 relative">
                {/* TIMELINE LINE */}
                <div className="absolute left-[47px] top-10 bottom-20 w-[2px] bg-white/5"></div>

                <div className="space-y-12 relative z-10">
                  {/* STEP 1: PLACED */}
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 rounded-full bg-black border-[3px] border-[#00FFFF]/30 text-[#00FFFF] flex items-center justify-center shrink-0 z-10 shadow-sm">
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div className="pt-2">
                      <h4 className="text-white font-bold text-lg leading-none">Order Accepted</h4>
                      <p className="text-xs text-muted-foreground mt-1">We have received your order.</p>
                    </div>
                  </div>

                  {/* STEP 2: PREPARING */}
                  <div className="flex items-start gap-6">
                    <div className={`w-12 h-12 rounded-full bg-black border-[3px] flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${activeOrder.status === 'Pending' ? 'border-[#00FFFF] text-[#00FFFF] shadow-[0_0_20px_rgba(0,255,255,0.2)] scale-110' : activeOrder.status === 'In Transit' ? 'border-white/20 text-white scale-100' : 'border-white/5 text-white/20'}`}>
                      <motion.div animate={activeOrder.status === 'Pending' ? { rotate: [-4, 4, -4], y: [-1, 1, -1] } : {}} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                        <PreparingIcon className="w-5 h-5" />
                      </motion.div>
                    </div>
                    <div className="pt-2">
                      <h4 className={`font-bold text-lg leading-none transition-colors ${activeOrder.status === 'Pending' ? 'text-[#00FFFF]' : activeOrder.status === 'In Transit' ? 'text-white' : 'text-white/30'}`}>Food is being prepared</h4>
                      <p className="text-xs text-muted-foreground mt-1">Our chef is on it.</p>
                    </div>
                  </div>

                  {/* STEP 3: ON THE WAY */}
                  <div className="flex items-start gap-6">
                    <div className={`w-12 h-12 rounded-full bg-black border-[3px] flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${activeOrder.status === 'In Transit' ? 'border-[#CCFF00] text-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.2)] scale-110' : 'border-white/5 text-white/20 scale-100'}`}>
                      <motion.div animate={activeOrder.status === 'In Transit' ? { y: [-1, 2, -1], x: [-1, 1, -1] } : {}} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
                        <Bike className="w-5 h-5" />
                      </motion.div>
                    </div>
                    <div className="pt-2">
                      <h4 className={`font-bold text-lg leading-none transition-colors ${activeOrder.status === 'In Transit' ? 'text-[#CCFF00]' : 'text-white/30'}`}>On the Way</h4>
                      <p className="text-xs text-muted-foreground mt-1">Rider is heading to your location.</p>
                    </div>
                  </div>

                  {/* STEP 4: DELIVERED */}
                  <div className="flex items-start gap-6 opacity-30">
                    <div className="w-12 h-12 rounded-full bg-black border-[3px] border-white/5 text-white/20 flex items-center justify-center shrink-0 z-10">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="pt-2">
                      <h4 className="font-bold text-lg leading-none text-white">Delivered</h4>
                      <p className="text-xs text-muted-foreground mt-1">Enjoy your meal!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SHEET FOOTER - CALL SUPPORT */}
              <div className="p-6 border-t border-white/5 bg-[#0A0A0A] shrink-0">
                <a href={`tel:${storeConfig?.ownerPhone || ''}`}>
                  <Button className="w-full h-14 bg-white/5 text-white hover:bg-white/10 border border-white/10 rounded-xl font-bold uppercase tracking-widest transition-all">
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
