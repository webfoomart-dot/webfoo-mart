// @ts-nocheck
"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, Search, Pizza, CupSoda, Cookie, 
  ShoppingBasket, Cake, Milk, BookOpen, PartyPopper, 
  Shirt, Smartphone, Plus, Lock, Zap, User as UserIcon, Phone as PhoneIcon, X, Minus
} from "lucide-react"

import { useAppStore } from "@/lib/store"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const CATEGORIES = [
  { id: 'groceries', name: 'Groceries & Staples', desc: 'Chawal, Atta, Masale, Rasan', icon: ShoppingBasket, color: 'text-[#00FFFF]', border: 'group-hover:border-[#00FFFF]', bg: 'bg-[#00FFFF]/10' },
  { id: 'fast-food', name: 'Fast Food', desc: 'Pizza, Momos, Samosa, Bread Pakoda', icon: Pizza, color: 'text-[#CCFF00]', border: 'group-hover:border-[#CCFF00]', bg: 'bg-[#CCFF00]/10' },
  { id: 'snacks', name: 'Snacks & Namkeen', desc: 'Chips, Kurkure, Mixture, Biscuits', icon: Cookie, color: 'text-[#00FFFF]', border: 'group-hover:border-[#00FFFF]', bg: 'bg-[#00FFFF]/10' },
  { id: 'drinks', name: 'Cold Drinks', desc: 'Cold drinks, Juices, Sodas', icon: CupSoda, color: 'text-[#CCFF00]', border: 'group-hover:border-[#CCFF00]', bg: 'bg-[#CCFF00]/10' },
  { id: 'dairy', name: 'Dairy & Milk', desc: 'Milk, Dahi, Butter', icon: Milk, color: 'text-[#00FFFF]', border: 'group-hover:border-[#00FFFF]', bg: 'bg-[#00FFFF]/10' },
  { id: 'sweets', name: 'Chocolates & Cakes', desc: 'Chocolates, Cakes, Desserts', icon: Cake, color: 'text-[#CCFF00]', border: 'group-hover:border-[#CCFF00]', bg: 'bg-[#CCFF00]/10' },
  { id: 'stationery', name: 'Stationery', desc: 'Copy, Books, Pen, Pencil, Eraser', icon: BookOpen, color: 'text-[#00FFFF]', border: 'group-hover:border-[#00FFFF]', bg: 'bg-[#00FFFF]/10' },
  { id: 'party', name: 'Party & Birthdays', desc: 'Birthday Items, Decorations', icon: PartyPopper, color: 'text-[#CCFF00]', border: 'group-hover:border-[#CCFF00]', bg: 'bg-[#CCFF00]/10' },
  { id: 'clothes', name: 'Fashion & Clothes', desc: 'Clothes, Wearables', icon: Shirt, color: 'text-[#00FFFF]', border: 'group-hover:border-[#00FFFF]', bg: 'bg-[#00FFFF]/10' },
  { id: 'electronics', name: 'Electronics', desc: 'Gadgets, Accessories', icon: Smartphone, color: 'text-[#CCFF00]', border: 'group-hover:border-[#CCFF00]', bg: 'bg-[#CCFF00]/10' },
]

export default function CategoriesPage() {
  const [isMounted, setIsMounted] = React.useState(false)
  
  const { 
    products, cart, addToCart, updateQuantity, user, login, register,
    storeConfig, fetchStoreConfig, checkIfStoreOpen, triggerStoreClosedAlert 
  } = useAppStore()

  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState(null)
  
  const [isStoreOpen, setIsStoreOpen] = React.useState(true)

  const [showAuthModal, setShowAuthModal] = React.useState(false)
  const [authMode, setAuthMode] = React.useState('login')
  const [authData, setAuthData] = React.useState({ phone: '', password: '', name: '' })
  const [pendingProduct, setPendingProduct] = React.useState(null)
  const [authError, setAuthError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
    if (fetchStoreConfig) fetchStoreConfig()
  }, [fetchStoreConfig])

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

  if (!isMounted) return null

  const getCartItem = (id) => cart.find((item) => item.id === id)

  const filteredCategories = CATEGORIES.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cat.desc.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categoryProducts = selectedCategory 
    ? products.filter((p) => p.category.toLowerCase() === selectedCategory.name.toLowerCase())
    : []

  const handleCartClick = (product) => {
    if (!isStoreOpen) {
      triggerStoreClosedAlert();
      return;
    }
    
    if (!user) {
      setPendingProduct(product)
      setShowAuthModal(true)
      return
    }
    addToCart(product)
  }

  const handlePlusClick = (productId, currentQuantity) => {
    if (!isStoreOpen) {
      triggerStoreClosedAlert();
      return;
    }
    updateQuantity(productId, currentQuantity + 1);
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')
    setIsLoading(true)
    const result = authMode === 'login' 
      ? await login(authData.phone, authData.password)
      : await register(authData.phone, authData.name, authData.password)
    setIsLoading(false)

    if (result.success) {
      setShowAuthModal(false)
      setAuthData({ phone: '', password: '', name: '' })
      if (pendingProduct) {
        if (!isStoreOpen) {
          triggerStoreClosedAlert();
        } else {
          addToCart(pendingProduct)
        }
        setPendingProduct(null)
      }
    } else {
      setAuthError(result.message)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#00FFFF]/30">
      <Header />

      <main className="container mx-auto pb-40 pt-24 px-4 max-w-7xl">
        <AnimatePresence mode="wait">
          
          {!selectedCategory ? (
            <motion.div 
              key="categories-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-4 mb-6">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-[#00FFFF]">
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                </Link>
                <h1 className="text-3xl font-black italic tracking-tighter uppercase text-[#00FFFF]">
                  Categories
                </h1>
              </div>

              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search categories..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-white/5 border-white/10 focus-visible:border-[#00FFFF] rounded-2xl font-bold text-white placeholder:font-normal"
                />
              </div>

              <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 gap-4">
                {filteredCategories.map((category) => {
                  const Icon = category.icon
                  return (
                    <motion.div key={category.id} variants={itemVariants}>
                      <Card 
                        onClick={() => setSelectedCategory(category)}
                        className={`group glass-strong border-white/10 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] hover:-translate-y-1 ${category.border}`}
                      >
                        <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full aspect-square relative">
                          <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${category.bg}`} />
                          <div className={`w-16 h-16 rounded-2xl ${category.bg} border border-white/5 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 shadow-lg`}>
                            <Icon className={`w-8 h-8 ${category.color}`} />
                          </div>
                          <h3 className="font-black text-white uppercase tracking-wider text-sm mb-1 line-clamp-1">{category.name}</h3>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest line-clamp-2 leading-tight">{category.desc}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </motion.div>

              {filteredCategories.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">No categories found matching "{searchQuery}"</p>
                </div>
              )}
            </motion.div>
          ) : (

            <motion.div 
              key="products-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <Button 
                  onClick={() => setSelectedCategory(null)} 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full hover:bg-white/10 text-[#00FFFF]"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <div>
                  <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">
                    {selectedCategory.name}
                  </h1>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#00FFFF]">{categoryProducts.length} Items Found</p>
                </div>
              </div>

              {categoryProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {categoryProducts.map((product) => {
                    const cartItem = getCartItem(product.id)
                    return (
                    <motion.div key={product.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Card className="glass-strong border-white/10 overflow-hidden hover:border-[#00FFFF]/30 flex flex-col h-full group">
                        <div className="relative h-32 sm:h-40 w-full bg-white/5 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={product.image || "/placeholder.jpg"} alt={product.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform" onError={(e) => { e.currentTarget.src = '/placeholder.jpg' }} />
                          {!product.inStock && (
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
                              <span className="bg-red-500 text-white font-black text-[10px] px-3 py-1.5 uppercase tracking-widest rounded-md shadow-lg">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3 flex flex-col flex-1 justify-between gap-3">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{product.category}</p>
                            <h3 className="font-bold text-white text-sm leading-tight line-clamp-2">{product.name}</h3>
                          </div>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="font-mono font-black text-[#CCFF00] text-lg">₹{product.price}</span>
                            
                            {cartItem ? (
                              <div className="flex items-center gap-2 bg-[#00FFFF]/10 border border-[#00FFFF]/30 rounded-lg p-1">
                                <button onClick={() => updateQuantity(product.id, cartItem.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-[#00FFFF] hover:bg-[#00FFFF]/20 rounded-md transition-colors"><Minus className="w-4 h-4" /></button>
                                <span className="text-sm font-black w-4 text-center text-white">{cartItem.quantity}</span>
                                <button onClick={() => handlePlusClick(product.id, cartItem.quantity)} className="w-7 h-7 flex items-center justify-center text-[#00FFFF] hover:bg-[#00FFFF]/20 rounded-md transition-colors"><Plus className="w-4 h-4" /></button>
                              </div>
                            ) : (
                              <Button 
                                disabled={!product.inStock} 
                                onClick={() => handleCartClick(product)} 
                                size="icon" 
                                className="h-9 w-9 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-[#00FFFF] hover:text-black active:scale-90 transition-all disabled:opacity-50 disabled:hover:bg-white/10 disabled:hover:text-white"
                              >
                                <Plus className="w-5 h-5" />
                              </Button>
                            )}

                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )})}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ShoppingBasket className="w-16 h-16 text-white/20 mb-4" />
                  <h2 className="text-xl font-black uppercase text-white">Aisle is Empty</h2>
                  <p className="text-muted-foreground text-sm mt-2">No items have been teleported to this category yet.</p>
                  <Button onClick={() => setSelectedCategory(null)} className="mt-6 bg-[#CCFF00] text-black font-black uppercase rounded-xl">
                    Browse Other Categories
                  </Button>
                </div>
              )}
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
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-2xl flex items-center justify-center mx-auto mb-4"><Lock className="w-8 h-8 text-[#CCFF00]" /></div>
                  <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">{authMode === 'login' ? 'Welcome Back' : 'Join Squad'}</h2>
                </div>
                {authError && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black text-center uppercase tracking-widest">{authError}</div>}
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === 'register' && (
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <Input required placeholder="Full Name" value={authData.name} onChange={(e) => setAuthData({...authData, name: e.target.value})} className="pl-12 h-14 bg-white/5 border-white/10 text-white rounded-xl font-bold" />
                    </div>
                  )}
                  <div className="relative">
                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input required type="tel" placeholder="Phone Number" value={authData.phone} onChange={(e) => setAuthData({...authData, phone: e.target.value})} className="pl-12 h-14 bg-white/5 border-white/10 text-white rounded-xl font-bold font-mono" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input required type="password" placeholder="Password" value={authData.password} onChange={(e) => setAuthData({...authData, password: e.target.value})} className="pl-12 h-14 bg-white/5 border-white/10 text-white rounded-xl font-bold" />
                  </div>
                  <Button type="submit" disabled={isLoading} className={`w-full h-14 font-black text-lg mt-4 ${authMode === 'login' ? 'bg-[#CCFF00] text-black' : 'bg-[#00FFFF] text-black'}`}>{isLoading ? 'PROCESSING...' : (authMode === 'login' ? 'ENTER MATRIX' : 'CREATE ACCOUNT')}</Button>
                </form>
                <div className="mt-8 text-center border-t border-white/10 pt-6">
                  <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="text-sm font-black uppercase tracking-widest text-[#00FFFF]">{authMode === 'login' ? 'Register Now' : 'Login Here'}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}