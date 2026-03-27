"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation" // 🔥 NAYA: Router import kiya page change karne ke liye
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, Search, ShoppingBasket, Plus, Lock, Zap, 
  User as UserIcon, Phone as PhoneIcon, X, Minus
} from "lucide-react"

import { useAppStore } from "@/lib/store"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function CategoriesPage() {
  const [isMounted, setIsMounted] = React.useState(false)
  const router = useRouter() // 🔥 NAYA: Router initialize kiya
  
  const { 
    products, cart, addToCart, updateQuantity, user, login, register,
    storeConfig, fetchStoreConfig, checkIfStoreOpen, triggerStoreClosedAlert,
    categories, fetchData
  } = useAppStore() as any

  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<any>(null)
  
  const [isStoreOpen, setIsStoreOpen] = React.useState(true)

  const [showAuthModal, setShowAuthModal] = React.useState(false)
  const [authMode, setAuthMode] = React.useState<'login' | 'register'>('login')
  const [authData, setAuthData] = React.useState({ phone: '', password: '', name: '' })
  const [pendingProduct, setPendingProduct] = React.useState<any>(null)
  const [authError, setAuthError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
    if (fetchStoreConfig) fetchStoreConfig()
    if (fetchData) fetchData() 
  }, [fetchStoreConfig, fetchData])

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

  const displayCategories = React.useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    
    return categories.map((dbCat: any) => ({
      id: dbCat.id,
      name: dbCat.name,
      image: dbCat.image || null,
      sortOrder: dbCat.sortOrder ?? 0
    })).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories]);

  const getCartItem = (id: string) => cart.find((item: any) => String(item.id) === String(id))

  const filteredCategories = displayCategories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categoryProducts = selectedCategory 
    ? products.filter((p: any) => p.category.toLowerCase() === selectedCategory.name.toLowerCase())
    : []

  // 🔥 UPDATE: Event 'e' aur stopPropagation add kiya
  const handleCartClick = (e: React.MouseEvent, product: any) => {
    e.stopPropagation()
    if (!isStoreOpen) { triggerStoreClosedAlert(); return; }
    if (!user) { setPendingProduct(product); setShowAuthModal(true); return; }
    addToCart(product)
  }

  // 🔥 UPDATE: Event 'e' aur stopPropagation add kiya
  const handlePlusClick = (e: React.MouseEvent, productId: string, currentQuantity: number) => {
    e.stopPropagation()
    if (!isStoreOpen) { triggerStoreClosedAlert(); return; }
    updateQuantity(productId, currentQuantity + 1);
  }

  // 🔥 NAYA: Minus button ke liye bhi alag function with stopPropagation
  const handleMinusClick = (e: React.MouseEvent, productId: string, currentQuantity: number) => {
    e.stopPropagation()
    updateQuantity(productId, currentQuantity - 1);
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError(''); setIsLoading(true);
    const result = authMode === 'login' ? await login(authData.phone, authData.password) : await register(authData.phone, authData.name, authData.password);
    setIsLoading(false);
    if (result.success) {
      setShowAuthModal(false); setAuthData({ phone: '', password: '', name: '' });
      if (pendingProduct) {
        if (!isStoreOpen) triggerStoreClosedAlert(); else addToCart(pendingProduct);
        setPendingProduct(null);
      }
    } else { setAuthError(result.message); }
  }

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-[#050505] text-foreground font-sans selection:bg-[#00FFFF]/30">
      <Header />
      <main className="container mx-auto pb-40 pt-24 px-4 max-w-7xl">
        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            <motion.div key="categories-view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <Link href="/"><Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-[#00FFFF]"><ArrowLeft className="h-6 w-6" /></Button></Link>
                <h1 className="text-3xl font-black tracking-tighter uppercase text-[#00FFFF]">Categories</h1>
              </div>

              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Search your categories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 h-14 bg-white/5 border-white/10 focus-visible:border-[#00FFFF] rounded-2xl font-bold text-white" />
              </div>

              {filteredCategories.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {filteredCategories.map((category, index) => (
                    <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                      <Card onClick={() => setSelectedCategory(category)} className="group glass-strong border-white/10 overflow-hidden cursor-pointer transition-all hover:border-[#00FFFF]/30 hover:-translate-y-1">
                        <CardContent className="p-3 flex flex-col items-center justify-between text-center h-full aspect-[4/5] relative">
                          {category.image ? (
                            <div className="w-[95%] aspect-square rounded-2xl overflow-hidden border border-white/10 mb-2 mt-1 transition-transform group-hover:scale-110 shadow-lg">
                              <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-[95%] aspect-square rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-2 mt-1 transition-transform group-hover:scale-110">
                              <ShoppingBasket className="w-12 h-12 text-[#00FFFF]" />
                            </div>
                          )}
                          <h3 className="font-black text-white uppercase tracking-wider text-xs sm:text-sm line-clamp-2 mt-auto">{category.name}</h3>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                  <ShoppingBasket className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No categories found.<br/>Add them from Admin Panel!</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="products-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="flex items-center gap-4 mb-8">
                <Button onClick={() => setSelectedCategory(null)} variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-[#00FFFF]"><ArrowLeft className="h-6 w-6" /></Button>
                <div>
                  <h1 className="text-3xl font-black tracking-tighter uppercase text-white">{selectedCategory.name}</h1>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#00FFFF]">{categoryProducts.length} Items Found</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
                {categoryProducts.map((product: any) => {
                  const cartItem = getCartItem(product.id)
                  return (
                    <motion.div 
                      key={product.id} 
                      layout 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      onClick={() => router.push(`/product/${product.id}`)} // 🔥 NAYA: Pura card clickable kar diya
                      className={`cursor-pointer bg-white/5 p-3 rounded-[1.5rem] border border-white/10 flex flex-col gap-3 relative transition-all duration-300 hover:border-[#00FFFF]/40 hover:bg-white/10 group ${!product.inStock ? 'opacity-60 grayscale' : ''}`}
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
                        
                        {/* 🔥 NAYA: Asli FSSAI Logo, theek naam ke neeche */}
                        <div className="pt-0.5">
                          {product.foodPref === 'veg' && (
                            <div className="bg-white p-[2px] rounded-sm shadow-sm w-fit">
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="1" y="1" width="14" height="14" stroke="#008000" strokeWidth="1.5"/>
                                <circle cx="8" cy="8" r="4" fill="#008000"/>
                              </svg>
                            </div>
                          )}
                          {product.foodPref === 'non-veg' && (
                            <div className="bg-white p-[2px] rounded-sm shadow-sm w-fit">
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="1" y="1" width="14" height="14" stroke="#8B4513" strokeWidth="1.5"/>
                                <path d="M8 4L12 10H4L8 4Z" fill="#8B4513"/>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 🔥 UPDATE: is div pe stopPropagation lagaya */}
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
                            onClick={(e) => handleCartClick(e, product)} 
                            size="sm"
                            className="h-9 bg-[#CCFF00] text-black font-black text-[11px] uppercase tracking-widest rounded-lg px-4 hover:bg-[#CCFF00]/80 disabled:bg-white/10 disabled:text-white/30 shadow-[0_0_15px_rgba(204,255,0,0.15)] hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                          >
                            ADD
                          </Button>
                        )}
                      </div>
                    </motion.div>
                )})}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
      
      <AnimatePresence>
        {showAuthModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-md bg-[#050505] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden shadow-[0_0_50px_rgba(0,255,255,0.05)]">
              <button onClick={() => { setShowAuthModal(false); setPendingProduct(null); setAuthError(''); }} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-10"><X className="w-6 h-6" /></button>
              <div className="relative z-10 text-center mb-8"><div className="w-16 h-16 bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-2xl flex items-center justify-center mx-auto mb-4"><Lock className="w-8 h-8 text-[#CCFF00]" /></div><h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">{authMode === 'login' ? 'Welcome Back' : 'Join Squad'}</h2></div>
              {authError && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black text-center uppercase tracking-widest">{authError}</div>}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'register' && (<div className="relative"><UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" /><Input required placeholder="Full Name" value={authData.name} onChange={(e) => setAuthData({...authData, name: e.target.value})} className="pl-12 h-14 bg-white/5 border-white/10 text-white rounded-xl font-bold" /></div>)}
                <div className="relative"><PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" /><Input required type="tel" placeholder="Phone Number" value={authData.phone} onChange={(e) => setAuthData({...authData, phone: e.target.value})} className="pl-12 h-14 bg-white/5 border-white/10 text-white rounded-xl font-bold font-mono" /></div>
                <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" /><Input required type="password" placeholder="Password" value={authData.password} onChange={(e) => setAuthData({...authData, password: e.target.value})} className="pl-12 h-14 bg-white/5 border-white/10 text-white rounded-xl font-bold" /></div>
                <Button type="submit" disabled={isLoading} className={`w-full h-14 font-black text-lg mt-4 ${authMode === 'login' ? 'bg-[#CCFF00] text-black' : 'bg-[#00FFFF] text-black'}`}>{isLoading ? 'PROCESSING...' : (authMode === 'login' ? 'Login' : 'CREATE ACCOUNT')}</Button>
              </form>
              <div className="mt-8 text-center border-t border-white/10 pt-6"><button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="text-sm font-black uppercase tracking-widest text-[#00FFFF]">{authMode === 'login' ? 'Register Now' : 'Login Here'}</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
