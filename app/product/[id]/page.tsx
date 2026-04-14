"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ShoppingBag, Minus, Plus, Zap, Info, ShieldCheck, MessageCircle, PhoneCall } from "lucide-react"

import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export default function ProductDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [isMounted, setIsMounted] = React.useState(false)
  const [activeImage, setActiveImage] = React.useState<string>("")

  const { 
    products, cart, addToCart, updateQuantity, 
    isStoreOpen, triggerStoreClosedAlert, getCartCount
  } = useAppStore() as any

  React.useEffect(() => {
    setIsMounted(true)
    window.scrollTo(0, 0)
  }, [])

  // 🔥 FIX 1: ID ko strictly String banake match kiya taaki Number/String ka clash na ho
  const product = products?.find((p: any) => String(p.id) === String(productId))
  const cartItem = cart?.find((item: any) => String(item.id) === String(productId))
  const cartCount = getCartCount()

  // Set default main image when product loads
  React.useEffect(() => {
    if (product && !activeImage) {
      setActiveImage(product.image || "/placeholder.jpg")
    }
  }, [product, activeImage])

  if (!isMounted) return <div className="min-h-screen bg-[#050505]" />

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center p-6 space-y-6">
        <Zap className="w-16 h-16 text-[#00FFFF] opacity-50" />
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white mb-2">Item Not Found</h1>
          <p className="text-muted-foreground text-sm">Ye item ya toh delete ho gaya hai ya link galat hai.</p>
        </div>
        <Button onClick={() => router.push('/')} className="bg-[#CCFF00] text-black font-black uppercase tracking-widest px-8">Back to Store</Button>
      </div>
    )
  }

  // 🔥 SERVICE CATEGORIES LIST 🔥
  const serviceCategories = ['notes', 'assignment', 'assignments', 'handwritten', 'projects', 'service'];
  const isService = serviceCategories.some(sc => 
    product.category.toLowerCase().includes(sc) || 
    (product.subcategory && product.subcategory.toLowerCase().includes(sc))
  );

  // Combine main image with gallery images for the thumbnail slider
  const allImages = [product.image, ...(product.galleryImages || [])].filter(Boolean)

  const handleAddToCart = () => {
    // 🔥 FIX 2: Strictly check for 'false' taaki undefined pe silent fail na ho
    if (isStoreOpen === false) {
      if (triggerStoreClosedAlert) triggerStoreClosedAlert();
      else alert("Store is currently closed!");
      return;
    }
    addToCart(product);
  }

  const handlePlusClick = (currentQuantity: number) => {
    if (isStoreOpen === false) {
      if (triggerStoreClosedAlert) triggerStoreClosedAlert();
      else alert("Store is currently closed!");
      return;
    }
    updateQuantity(product.id, currentQuantity + 1);
  }

  const handleMinusClick = (currentQuantity: number) => {
    updateQuantity(product.id, currentQuantity - 1);
  }

  // Calculate discount percentage
  const discountPercent = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-[#050505] text-foreground font-sans pb-32">
      
      {/* FLOATING TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <Button onClick={() => router.back()} size="icon" className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-[#00FFFF] hover:text-black pointer-events-auto transition-all shadow-lg">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        {!isService && (
          <Link href="/cart" className="pointer-events-auto">
            <div className="relative w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-all shadow-lg">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF0055] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-black animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>
        )}
      </header>

      <main>
        {/* BIG HERO IMAGE SECTION - Rounded Bottom */}
        <div className="relative w-full h-[50vh] sm:h-[60vh] bg-black rounded-b-[2rem] overflow-hidden border-b border-white/5">
          <AnimatePresence mode="wait">
            <motion.img 
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={activeImage} 
              alt={product.name} 
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          </AnimatePresence>
          
          {/* 🔥 SHADOW POORI TARAH GAYAB KAR DIYA 🔥 */}

          {/* TAGS ON IMAGE */}
          <div className="absolute bottom-6 left-4 flex gap-2 z-20">
            {discountPercent > 0 && (
              <Badge className="bg-[#FF0055] text-white border-none font-black px-3 py-1 text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(255,0,85,0.4)]">
                {discountPercent}% OFF
              </Badge>
            )}
          </div>

          {!product.inStock && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30">
              <span className="bg-red-500 text-white font-black text-xl px-6 py-2 uppercase tracking-widest rounded-xl shadow-[0_0_30px_rgba(255,0,0,0.5)] border border-red-400/50">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="px-4 sm:px-6 max-w-2xl mx-auto -mt-4 relative z-20 space-y-6">
          
          {/* THUMBNAIL GALLERY */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {allImages.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(img)}
                  className={`relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeImage === img ? 'border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.3)] scale-105' : 'border-white/10 opacity-50 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                </button>
              ))}
            </div>
          )}

          {/* MAIN INFO SECTION */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-[#00FFFF] font-bold text-[10px] uppercase tracking-widest border border-[#00FFFF]/30 px-2 py-0.5 rounded bg-[#00FFFF]/5">
                {product.subcategory || product.category}
              </span>
              
              {/* ORIGINAL FSSAI LOGOS (Official rectangular frames) */}
              {!isService && product.foodPref === 'veg' && (
                <div className="bg-white p-[2px] rounded-sm shadow-sm flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                    <path stroke="#008000" strokeWidth="1.5" fill="none" d="M 0.5,0.5 H 15.5 V 15.5 H 0.5 Z" />
                    <circle fill="#008000" cx="8" cy="8" r="4.5" />
                  </svg>
                </div>
              )}
              {!isService && product.foodPref === 'non-veg' && (
                <div className="bg-white p-[2px] rounded-sm shadow-sm flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                    <path stroke="#8B4513" strokeWidth="1.5" fill="none" d="M 0.5,0.5 H 15.5 V 15.5 H 0.5 Z" />
                    <path fill="#8B4513" d="M 8,3 L 13.5,12.5 H 2.5 Z" />
                  </svg>
                </div>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-end gap-3 pt-2">
              <span className="text-4xl font-black font-mono text-[#CCFF00] tracking-tighter">₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="text-lg text-muted-foreground line-through font-mono mb-1">₹{product.mrp}</span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#00FFFF]" /> Price inclusive of all taxes
            </p>
          </div>

          <div className="h-px w-full bg-white/10"></div>

          {/* DESCRIPTION SECTION */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Info className="w-4 h-4 text-[#00FFFF]" /> Description & Details
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-white/80 text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {product.description ? product.description : "No details available for this product yet."}
            </div>
          </div>

        </div>
      </main>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-center">
        <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {isService ? (
            // 🔥 SERVICE MODE ACTION BAR 🔥
            <>
              <div className="w-full sm:w-auto text-left">
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Pricing</p>
                <p className="text-xl font-black text-white font-mono">₹{product.price}</p>
              </div>
              
              <div className="w-full sm:flex-1 grid grid-cols-2 gap-3">
                <a 
                  href={`https://wa.me/919142267442?text=${encodeURIComponent(`Hi Vineet, I want to discuss and order "${product.name}". \n\nMy details are: `)}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full"
                >
                  <Button className="w-full h-14 bg-[#25D366] text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl hover:bg-[#25D366]/90 shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all">
                    <MessageCircle className="w-5 h-5 mr-2" /> WHATSAPP
                  </Button>
                </a>
                <a href="tel:9142267442" className="w-full">
                  <Button className="w-full h-14 bg-[#00FFFF] text-black font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl hover:bg-[#00FFFF]/90 shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all">
                    <PhoneCall className="w-5 h-5 mr-2" /> CALL NOW
                  </Button>
                </a>
              </div>
            </>
          ) : (
            // 🔥 REGULAR FOOD/PRODUCT ACTION BAR 🔥
            <>
              <div className="flex-1 w-full text-left">
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Total Price</p>
                <p className="text-xl font-black text-white font-mono">₹{cartItem ? product.price * cartItem.quantity : product.price}</p>
              </div>
              
              <div className="flex-shrink-0 w-full sm:w-48">
                {cartItem ? (
                  <div className="flex items-center justify-between bg-[#CCFF00]/10 border-2 border-[#CCFF00] rounded-xl h-14 px-2 shadow-[0_0_15px_rgba(204,255,0,0.15)]">
                    <button onClick={() => handleMinusClick(cartItem.quantity)} className="w-10 h-10 flex items-center justify-center text-[#CCFF00] hover:bg-[#CCFF00]/20 rounded-lg transition-colors"><Minus className="w-5 h-5" /></button>
                    <span className="text-lg font-black w-8 text-center text-[#CCFF00]">{cartItem.quantity}</span>
                    <button onClick={() => handlePlusClick(cartItem.quantity)} className="w-10 h-10 flex items-center justify-center text-[#CCFF00] hover:bg-[#CCFF00]/20 rounded-lg transition-colors"><Plus className="w-5 h-5" /></button>
                  </div>
                ) : (
                  <Button 
                    disabled={!product.inStock} 
                    onClick={handleAddToCart} 
                    className="w-full h-14 bg-[#CCFF00] text-black font-black text-sm uppercase tracking-widest rounded-xl hover:bg-[#CCFF00]/90 disabled:bg-white/10 disabled:text-white/30 shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all"
                  >
                    ADD TO CART
                  </Button>
                )}
              </div>
            </>
          )}

        </div>
      </div>
      
    </div>
  )
}
