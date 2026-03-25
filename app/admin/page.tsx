"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Menu, LayoutDashboard, Zap, History, Tag, Package as PackageIcon, 
  MessageSquare, Users, IndianRupee, Clock, CheckCircle2, ArrowLeft,
  MapPin, Phone, Truck, XCircle, Plus, UploadCloud, Trash2, Edit, PowerOff, Power,
  Star, Ban, MessageCircle, FileText, Send, CheckSquare, Square, Smartphone,
  TrendingUp, Target, BarChart, ShieldAlert, LockKeyhole, Calendar, Settings, AlertTriangle, MoonStar, LayoutGrid,
  ArrowUp, ArrowDown, Palette // 🔥 PALETTE ICON ADD KIYA
} from "lucide-react"
import { createClient } from '@supabase/supabase-js' // 🔥 SUPABASE IMPORT

import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Empty, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const MENU_ITEMS = [
  { id: 'analytics', label: 'Analytics', icon: LayoutDashboard },
  { id: 'live_orders', label: 'Live Orders', icon: Zap },
  { id: 'order_history', label: 'Order History', icon: History }, 
  { id: 'products', label: 'Products', icon: PackageIcon },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'offers', label: 'Offers', icon: Tag },
  { id: 'categories', label: 'Categories', icon: LayoutGrid }, 
  { id: 'settings', label: 'Settings', icon: Settings }, 
]

const ADMIN_CATEGORIES = [
  "Groceries & Staples", "Fast Food", "Snacks & Namkeen", "Cold Drinks", 
  "Dairy & Milk", "Chocolates & Cakes", "Stationery", "Party & Birthdays", 
  "Fashion & Clothes", "Electronics"
]

const ADMIN_SECRET_PASSCODE = "WEBFOO99"

// ⚠️ WARNING: YAHAN APNA ASLI SUPABASE URL AUR ANON KEY DAALNA ⚠️
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'TERA_SUPABASE_URL_YAHAN_DAAL'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'TERA_SUPABASE_ANON_KEY_YAHAN_DAAL'
const supabase = createClient(supabaseUrl, supabaseKey)

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = React.useState(false)
  
  const [isAuthorized, setIsAuthorized] = React.useState(false)
  const [passcode, setPasscode] = React.useState('')
  const [authError, setAuthError] = React.useState('')

  const { 
    orders, updateOrderStatus, 
    products, addProduct, updateProduct, deleteProduct, toggleStock,
    customerMeta, updateCustomerMeta,
    addNotification,
    promoCodes, addPromoCode, togglePromoStatus, deletePromo,
    storeConfig, fetchStoreConfig, updateStoreConfig, 
    fetchData,
    categories, addCategory, updateCategory, deleteCategory, reorderCategory 
  } = useAppStore() as any
  
  const [activeTab, setActiveTab] = React.useState('live_orders')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const [analyticsFilter, setAnalyticsFilter] = React.useState('all')
  const [customDate, setCustomDate] = React.useState('')

  const [isProductSheetOpen, setIsProductSheetOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({
    name: '', price: '', mrp: '', category: '', image: '', inStock: true
  })

  const [selectedCustomers, setSelectedCustomers] = React.useState<string[]>([])
  const [messageText, setMessageText] = React.useState('')

  const [editingCategoryId, setEditingCategoryId] = React.useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = React.useState('')
  const [newCategoryImage, setNewCategoryImage] = React.useState('')

  const [settingsFormData, setSettingsFormData] = React.useState({
    storeMode: 'manual', openTime: '08:00', closeTime: '22:00',
    isStoreOpen: true, bannerTextOpen: '', bannerImageUrlOpen: '', bannerTextClosed: '', bannerImageUrlClosed: ''
  })
  const [isSettingsSaving, setIsSettingsSaving] = React.useState(false)
  const [globalMinOrder, setGlobalMinOrder] = React.useState(0)

  // 🔥 THEME COLORS STATE 
  const [themeColorData, setThemeColorData] = React.useState({
    primary_color: '#00FFFF', background_color: '#050505', text_color: '#ffffff', button_color: '#CCFF00'
  })
  const [isThemeSaving, setIsThemeSaving] = React.useState(false)

  React.useEffect(() => { 
    setIsMounted(true) 
    if (fetchData) fetchData()
    if (fetchStoreConfig) fetchStoreConfig() 
    
    const sessionAuth = sessionStorage.getItem('webfoo_admin_unlocked')
    if (sessionAuth === 'true') {
      setIsAuthorized(true)
    }

    // 🔥 LOAD THEME FROM SUPABASE ON MOUNT
    async function loadTheme() {
      const { data } = await supabase.from('theme_settings').select('*').eq('id', 1).single()
      if (data) setThemeColorData(data)
    }
    loadTheme()
  }, [fetchData, fetchStoreConfig])

  React.useEffect(() => {
    if (storeConfig) {
      setSettingsFormData({
        storeMode: storeConfig.storeMode || 'manual',
        openTime: storeConfig.openTime || '08:00',
        closeTime: storeConfig.closeTime || '22:00',
        isStoreOpen: storeConfig.isStoreOpen ?? true,
        bannerTextOpen: storeConfig.bannerTextOpen || '',
        bannerImageUrlOpen: storeConfig.bannerImageUrlOpen || '',
        bannerTextClosed: storeConfig.bannerTextClosed || '',
        bannerImageUrlClosed: storeConfig.bannerImageUrlClosed || ''
      })
      setGlobalMinOrder(storeConfig.minOrderAmount || 0) 
    }
  }, [storeConfig])

  const dbCategoryNames = categories ? categories.map((c: any) => c.name) : [];
  const displayCategories = Array.from(new Set([...ADMIN_CATEGORIES, ...dbCategoryNames]));

  React.useEffect(() => {
    if (!formData.category && !editingId) {
      setFormData(prev => ({ ...prev, category: displayCategories[0] }))
    }
  }, [displayCategories, formData.category, editingId])

  const filteredAnalyticsOrders = React.useMemo(() => {
    if (analyticsFilter === 'all') return orders;
    const getLocalYYYYMMDD = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().split('T')[0];
    }
    const today = new Date();
    const todayStr = getLocalYYYYMMDD(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalYYYYMMDD(yesterday);

    return orders.filter((o: any) => {
      let orderDateStr = o.date;
      if (!orderDateStr && o.id && !isNaN(Number(o.id))) {
        orderDateStr = getLocalYYYYMMDD(new Date(Number(o.id)));
      }
      if (analyticsFilter === 'today') return orderDateStr === todayStr;
      if (analyticsFilter === 'yesterday') return orderDateStr === yesterdayStr;
      if (analyticsFilter === 'custom') return orderDateStr === customDate;
      return true;
    });
  }, [orders, analyticsFilter, customDate]);

  const handleAdminAccess = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode === ADMIN_SECRET_PASSCODE) {
      sessionStorage.setItem('webfoo_admin_unlocked', 'true')
      setIsAuthorized(true)
      setAuthError('')
    } else {
      setAuthError('ACCESS DENIED. INTRUDER LOGGED.')
      setPasscode('')
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateStoreConfig) return;
    setIsSettingsSaving(true);
    try {
      await updateStoreConfig({
        storeMode: settingsFormData.storeMode as 'auto' | 'manual',
        openTime: settingsFormData.openTime,
        closeTime: settingsFormData.closeTime,
        isStoreOpen: settingsFormData.isStoreOpen,
        bannerTextOpen: settingsFormData.bannerTextOpen,
        bannerImageUrlOpen: settingsFormData.bannerImageUrlOpen || null,
        bannerTextClosed: settingsFormData.bannerTextClosed,
        bannerImageUrlClosed: settingsFormData.bannerImageUrlClosed || null,
      });
      alert("✅ Store Settings & Banners saved to Central Database!");
      if (fetchStoreConfig) fetchStoreConfig();
    } catch(e) { 
      alert("ERROR saving settings!") 
    }
    setIsSettingsSaving(false);
  }

  // 🔥 SAVE THEME TO SUPABASE FUNCTION
  const handleSaveTheme = async () => {
    setIsThemeSaving(true)
    const { error } = await supabase.from('theme_settings').update({
      primary_color: themeColorData.primary_color,
      background_color: themeColorData.background_color,
      text_color: themeColorData.text_color,
      button_color: themeColorData.button_color
    }).eq('id', 1)
    
    setIsThemeSaving(false)
    if (error) {
      alert("⚠️ Color update nahi hua: " + error.message)
    } else {
      alert("✅ Website Colors Successfully Updated! \nRefresh the website tab to see new colors.")
    }
  }

  const handleSaveGlobalMinOrder = async () => {
    if (!updateStoreConfig) return;
    try {
      await updateStoreConfig({ minOrderAmount: globalMinOrder });
      alert("✅ Global Minimum Order Limit Updated!");
      if (fetchStoreConfig) fetchStoreConfig();
    } catch(e) {
      alert("ERROR: Make sure min_order_amount column exists in your Supabase table!");
    }
  }

  const handleCategoryImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { 
      const reader = new FileReader(); 
      reader.onloadend = () => setNewCategoryImage(reader.result as string); 
      reader.readAsDataURL(file) 
    }
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return;

    if (editingCategoryId) {
      await updateCategory(editingCategoryId, { name: newCategoryName.trim(), image: newCategoryImage });
    } else {
      await addCategory({ name: newCategoryName.trim(), image: newCategoryImage });
    }
    
    setNewCategoryName('');
    setNewCategoryImage('');
    setEditingCategoryId(null);
  }

  const editCategoryUI = (cat: any) => {
    setEditingCategoryId(cat.id);
    setNewCategoryName(cat.name);
    setNewCategoryImage(cat.image || '');
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setNewCategoryName('');
    setNewCategoryImage('');
  }

  if (!isMounted) return null

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 selection:bg-[#FF0055]/30">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm glass-strong border border-red-500/30 rounded-[2rem] p-8 relative overflow-hidden shadow-[0_0_50px_rgba(255,0,85,0.1)] text-center">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(255,0,85,0.3)]"><ShieldAlert className="w-10 h-10 text-red-500" /></div>
          <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-2">RESTRICTED <span className="text-red-500">AREA</span></h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-8">Admin Authorization Required</p>
          <form onSubmit={handleAdminAccess} className="space-y-6 relative z-10">
            <div className="space-y-2 text-left">
              <Label className="text-[10px] uppercase tracking-[0.2em] text-red-500 font-black">Enter Passcode</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500/50" />
                <Input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} className={`pl-12 h-14 bg-black/50 border-red-500/30 text-white rounded-xl font-mono text-xl tracking-[0.3em] focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500 ${authError ? 'border-red-500 animate-shake' : ''}`} autoFocus />
              </div>
              {authError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2">{authError}</p>}
            </div>
            <Button type="submit" className="w-full h-14 bg-red-500 text-white font-black text-lg hover:bg-red-600 shadow-[0_0_20px_rgba(255,0,85,0.4)] tracking-widest uppercase transition-all">DECRYPT</Button>
            <Link href="/"><Button type="button" variant="ghost" className="w-full mt-4 text-muted-foreground hover:text-white uppercase tracking-widest text-xs font-bold"><ArrowLeft className="w-4 h-4 mr-2" /> Return to Safety</Button></Link>
          </form>
        </motion.div>
      </div>
    )
  }

  const liveOrders = orders.filter((o: any) => o.status === 'Pending' || o.status === 'In Transit').reverse()
  const orderHistory = orders.filter((o: any) => o.status === 'Delivered' || o.status === 'Cancelled').reverse()
  const analyticsDelivered = filteredAnalyticsOrders.filter((o: any) => o.status === 'Delivered')
  const analyticsCancelled = filteredAnalyticsOrders.filter((o: any) => o.status === 'Cancelled')
  const analyticsPending = filteredAnalyticsOrders.filter((o: any) => o.status === 'Pending' || o.status === 'In Transit')
  const totalRevenue = analyticsDelivered.reduce((acc: number, order: any) => acc + order.amount, 0)
  const totalOrdersCount = filteredAnalyticsOrders.length
  const avgOrderValue = analyticsDelivered.length > 0 ? Math.round(totalRevenue / analyticsDelivered.length) : 0
  const uniqueCustomersInAnalytics = new Set(filteredAnalyticsOrders.map((o: any) => o.phone)).size;

  const productSales = new Map()
  analyticsDelivered.forEach((order: any) => {
    order.items.forEach((item: any) => {
      const current = productSales.get(item.name) || { qty: 0, revenue: 0 }
      productSales.set(item.name, { qty: current.qty + item.quantity, revenue: current.revenue + (item.price * item.quantity) })
    })
  })
  const topProducts = Array.from(productSales.entries()).map(([name, data]) => ({ name, ...data as {qty: number, revenue: number} })).sort((a, b) => b.qty - a.qty).slice(0, 5)

  const customersMap = new Map()
  Object.keys(customerMeta).forEach(phone => {
    const meta = customerMeta[phone]
    customersMap.set(phone, {
      name: meta.name || 'Unknown', phone: phone, address: meta.address || 'Address not added', totalOrders: 0, totalSpent: 0, ordersList: []
    })
  })

  orders.forEach((order: any) => {
    if (!customersMap.has(order.phone)) {
      customersMap.set(order.phone, { name: order.customer, phone: order.phone, address: order.landmark, totalOrders: 0, totalSpent: 0, ordersList: [] })
    } else {
      if(order.landmark) customersMap.get(order.phone).address = order.landmark
    }
    const cust = customersMap.get(order.phone)
    cust.totalOrders += 1
    if (order.status === 'Delivered') cust.totalSpent += order.amount
    cust.ordersList.push(order)
  })

  const customersList = Array.from(customersMap.values()).sort((a, b) => {
    if (b.totalSpent !== a.totalSpent) return b.totalSpent - a.totalSpent
    return b.totalOrders - a.totalOrders
  })

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
      case 'In Transit': return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
      case 'Delivered': return 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/30'
      case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/30'
      default: return 'bg-white/10 text-white'
    }
  }

  const handleSelectCustomer = (phone: string) => { setSelectedCustomers(prev => prev.includes(phone) ? prev.filter(p => p !== phone) : [...prev, phone]) }
  const handleSelectAll = () => { if (selectedCustomers.length === customersList.length) setSelectedCustomers([]); else setSelectedCustomers(customersList.map(c => c.phone)) }
  const handleSendToApp = () => {
    if (selectedCustomers.length === 0) return alert("Select at least one customer!")
    if (!messageText.trim()) return alert("Message is empty!")
    selectedCustomers.forEach(phone => { addNotification(phone, messageText) })
    alert(`✅ Notification pushed to ${selectedCustomers.length} app(s) successfully!`)
    setSelectedCustomers([]); setMessageText('')
  }
  const handleSendToWhatsApp = () => {
    if (selectedCustomers.length === 0) return alert("Select at least one customer!")
    if (!messageText.trim()) return alert("Message is empty!")
    if (selectedCustomers.length === 1) {
      const phone = selectedCustomers[0].replace(/\D/g, '')
      window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(messageText)}`, '_blank')
    } else { alert(`⚠️ WhatsApp Bulk Send requires Business API integration.\nFor now, select 1 customer at a time to open WhatsApp Web.`) }
  }

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault()
    const productPayload = { name: formData.name, price: Number(formData.price), mrp: Number(formData.mrp), category: formData.category, image: formData.image || '/placeholder.jpg', inStock: formData.inStock }
    if (editingId) updateProduct(editingId, productPayload)
    else addProduct(productPayload)
    setIsProductSheetOpen(false); resetForm()
  }
  const openEdit = (product: any) => { setEditingId(product.id); setFormData({ name: product.name, price: product.price.toString(), mrp: product.mrp.toString(), category: product.category, image: product.image, inStock: product.inStock }); setIsProductSheetOpen(true) }
  const resetForm = () => { setEditingId(null); setFormData({ name: '', price: '', mrp: '', category: displayCategories[0], image: '', inStock: true }) }
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const reader = new FileReader(); reader.onloadend = () => setFormData({ ...formData, image: reader.result as string }); reader.readAsDataURL(file) }
  }

  const generateAIDesc = async () => {
    if (!formData.name) return alert("Pehle naam toh likho bhai!");
    try {
      const res = await fetch('/api/ai', { method: 'POST', body: JSON.stringify({ productName: formData.name }) });
      const data = await res.json();
      alert(`AI Suggestion:\n${data.description}`);
    } catch(e) { alert("Groq API error. Check backend!") }
  };

  const SidebarNav = () => (
    <div className="flex flex-col h-full bg-black">
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <Link href="/"><Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-[#00FFFF] hover:bg-white/10"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <span className="text-2xl font-black italic uppercase text-white">WebFoo <span className="text-[#CCFF00]">Admin</span></span>
      </div>
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-hide">
        {MENU_ITEMS.map((item) => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false) }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/30 shadow-[0_0_15px_rgba(0,255,255,0.1)]' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}>
            <item.icon className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-widest">{item.label}</span>
            {item.id === 'live_orders' && liveOrders.length > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#FF0055] text-[10px] font-black text-white">{liveOrders.length}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <Button onClick={() => { sessionStorage.removeItem('webfoo_admin_unlocked'); setIsAuthorized(false); }} className="w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 uppercase tracking-widest font-black text-xs h-12">
          <PowerOff className="w-4 h-4 mr-2" /> Lock System
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#050505] text-foreground font-sans selection:bg-[#00FFFF]/30">
      <aside className="hidden md:flex flex-col w-72 glass-strong border-r border-white/10 fixed top-0 bottom-0 left-0 z-40"><SidebarNav /></aside>

      <header className="md:hidden fixed top-0 left-0 right-0 h-16 glass-strong border-b border-white/10 z-40 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="text-white hover:bg-white/10"><Menu className="w-6 h-6" /></Button></SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-black border-r border-[#00FFFF]/30"><SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader><SidebarNav /></SheetContent>
          </Sheet>
          <span className="text-xl font-black italic uppercase text-white">Admin <span className="text-[#CCFF00]">Panel</span></span>
        </div>
      </header>

      <main className="flex-1 md:ml-72 pt-20 md:pt-8 p-4 md:p-8 overflow-y-auto min-h-screen">
        <div className="mb-8 hidden md:flex justify-between items-center">
          <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter flex items-center gap-2">
            {MENU_ITEMS.find(m => m.id === activeTab)?.label}
            {activeTab === 'live_orders' && liveOrders.length > 0 && <span className="w-3 h-3 rounded-full bg-[#FF0055] animate-pulse ml-2" />}
          </h2>
        </div>

        <AnimatePresence mode="wait">

          {/* 🗂️ CATEGORIES MANAGEMENT TAB */}
          {activeTab === 'categories' && (
             <motion.div key="categories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-2xl">
                <Card className="glass-strong border-white/10">
                  <CardContent className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                      <LayoutGrid className="w-6 h-6 text-[#00FFFF]" />
                      <h3 className="text-xl font-black uppercase text-white">Manage Store Categories</h3>
                    </div>
                    
                    <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
                      <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
                        <Label className="text-xs font-black uppercase tracking-widest text-[#00FFFF]">Category Image (Optional)</Label>
                        <div className="relative w-full h-24 rounded-xl border-2 border-dashed border-[#00FFFF]/40 bg-[#00FFFF]/5 flex items-center justify-center overflow-hidden cursor-pointer group">
                          <input type="file" accept="image/*" onChange={handleCategoryImgUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          {newCategoryImage && newCategoryImage.startsWith('data:') ? (
                            <img src={newCategoryImage} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center group-hover:scale-105 transition-transform"><UploadCloud className="w-6 h-6 text-[#00FFFF] mx-auto mb-1" /><span className="text-[10px] font-bold text-[#00FFFF]">Upload from Device</span></div>
                          )}
                        </div>
                        <div className="flex items-center gap-4"><div className="h-px bg-white/10 flex-1"></div><span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">OR</span><div className="h-px bg-white/10 flex-1"></div></div>
                        <div className="space-y-2">
                          <Label className="text-[10px] text-white/70">Paste Image Link (URL)</Label>
                          <Input type="url" placeholder="https://..." value={newCategoryImage && !newCategoryImage.startsWith('data:') ? newCategoryImage : ''} onChange={(e) => setNewCategoryImage(e.target.value)} className="bg-black/50 border-white/20 text-xs focus-visible:border-[#00FFFF] h-10" />
                          {newCategoryImage && !newCategoryImage.startsWith('data:') && (
                            <div className="mt-2 relative w-full h-20 rounded-lg overflow-hidden border border-white/10 bg-black/50">
                              <img src={newCategoryImage} alt="URL Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '' }} />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-4 items-end mt-2">
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs uppercase tracking-widest text-[#00FFFF]">
                            {editingCategoryId ? 'Edit Category Name' : 'New Category Name'}
                          </Label>
                          <Input required placeholder="e.g. Fresh Fruits" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="bg-black/50 border-white/20 text-white h-12" />
                        </div>
                        <Button type="submit" className="h-12 bg-[#CCFF00] text-black font-black uppercase tracking-widest px-6 hover:bg-[#CCFF00]/90">
                          {editingCategoryId ? 'UPDATE' : 'ADD'}
                        </Button>
                        {editingCategoryId && (
                          <Button type="button" onClick={resetCategoryForm} variant="outline" className="h-12 border-white/20 text-white hover:bg-white/10">CANCEL</Button>
                        )}
                      </div>
                    </form>

                    <div className="mt-6 space-y-3">
                      <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Active Categories (Order Control)</h4>
                      
                      {categories.map((cat: any, idx: number) => (
                        <div key={cat.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-xl">
                          <div className="flex items-center gap-3">
                             <span className="text-xs text-muted-foreground font-mono">{idx + 1}.</span>
                             {cat.image ? (
                               <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-md object-cover border border-white/10" />
                             ) : (
                               <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center border border-white/10"><PackageIcon className="w-4 h-4 text-white/50" /></div>
                             )}
                             <span className="font-bold text-white uppercase tracking-wider text-sm">{cat.name}</span>
                          </div>
                          
                          <div className="flex gap-1 items-center">
                             <Button variant="ghost" size="icon" onClick={() => editCategoryUI(cat)} className="w-8 h-8 text-[#CCFF00] hover:bg-[#CCFF00]/20"><Edit className="w-4 h-4" /></Button>
                             <Button variant="ghost" size="icon" onClick={() => reorderCategory(cat.id, 'up')} disabled={idx === 0} className="w-8 h-8 text-[#00FFFF] hover:bg-[#00FFFF]/20"><ArrowUp className="w-4 h-4" /></Button>
                             <Button variant="ghost" size="icon" onClick={() => reorderCategory(cat.id, 'down')} disabled={idx === categories.length - 1} className="w-8 h-8 text-[#00FFFF] hover:bg-[#00FFFF]/20"><ArrowDown className="w-4 h-4" /></Button>
                             <div className="w-px h-5 bg-white/10 mx-1"></div>
                             <Button variant="ghost" size="icon" onClick={() => { if(confirm("Delete this category?")) deleteCategory(cat.id) }} className="w-8 h-8 text-red-500 hover:text-white hover:bg-red-500"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      ))}
                      {categories.length === 0 && (
                         <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center py-4">
                           No categories added yet. Default ones are shown at bottom. <br/>Add a category here to control its rank & image!
                         </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
             </motion.div>
          )}

          {/* 🔥 ⚙️ SETTINGS TAB (YAHAN THEME KA FEATURE BHI AAGAYA) */}
          {activeTab === 'settings' && (
             <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-3xl">
                
                {/* 🎨 NAYA: THEME COLORS CARD - DIRECT COPY PASTE */}
                <Card className="glass-strong border-white/10 mb-8 border-[#00FFFF]/30">
                  <CardContent className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-[#00FFFF]/30 pb-4">
                      <Palette className="w-6 h-6 text-[#00FFFF]" />
                      <h3 className="text-xl font-black uppercase text-white">Website Theme Colors</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase font-bold text-muted-foreground">Background Color</Label>
                        <div className="flex gap-3 items-center">
                          <input type="color" value={themeColorData.background_color} onChange={(e) => setThemeColorData({...themeColorData, background_color: e.target.value})} className="w-12 h-12 rounded cursor-pointer border-0 bg-transparent" />
                          <Input value={themeColorData.background_color} onChange={(e) => setThemeColorData({...themeColorData, background_color: e.target.value})} className="font-mono bg-black/50 border-white/10 uppercase" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase font-bold text-muted-foreground">Main Text Color</Label>
                        <div className="flex gap-3 items-center">
                          <input type="color" value={themeColorData.text_color} onChange={(e) => setThemeColorData({...themeColorData, text_color: e.target.value})} className="w-12 h-12 rounded cursor-pointer border-0 bg-transparent" />
                          <Input value={themeColorData.text_color} onChange={(e) => setThemeColorData({...themeColorData, text_color: e.target.value})} className="font-mono bg-black/50 border-white/10 uppercase" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase font-bold text-muted-foreground">Primary Accent (Icons/Lines)</Label>
                        <div className="flex gap-3 items-center">
                          <input type="color" value={themeColorData.primary_color} onChange={(e) => setThemeColorData({...themeColorData, primary_color: e.target.value})} className="w-12 h-12 rounded cursor-pointer border-0 bg-transparent" />
                          <Input value={themeColorData.primary_color} onChange={(e) => setThemeColorData({...themeColorData, primary_color: e.target.value})} className="font-mono bg-black/50 border-white/10 uppercase" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase font-bold text-muted-foreground">Button Color</Label>
                        <div className="flex gap-3 items-center">
                          <input type="color" value={themeColorData.button_color} onChange={(e) => setThemeColorData({...themeColorData, button_color: e.target.value})} className="w-12 h-12 rounded cursor-pointer border-0 bg-transparent" />
                          <Input value={themeColorData.button_color} onChange={(e) => setThemeColorData({...themeColorData, button_color: e.target.value})} className="font-mono bg-black/50 border-white/10 uppercase" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-4 border-t border-[#00FFFF]/20">
                      <Button onClick={handleSaveTheme} disabled={isThemeSaving} className="h-12 bg-[#00FFFF] text-black hover:bg-[#00FFFF]/80 font-black uppercase tracking-widest px-8 rounded-full disabled:opacity-50">
                        {isThemeSaving ? 'Saving...' : 'Update Colors'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <Card className="glass-strong border-white/10">
                    <CardContent className="p-6 sm:p-8 space-y-6">
                      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                        <Settings className="w-6 h-6 text-[#00FFFF]" />
                        <h3 className="text-xl font-black uppercase text-white">Store Operations</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Operating Mode</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <button type="button" onClick={() => setSettingsFormData({...settingsFormData, storeMode: 'auto'})} className={`p-4 rounded-xl border text-left transition-all ${settingsFormData.storeMode === 'auto' ? 'bg-[#00FFFF]/10 border-[#00FFFF] text-[#00FFFF]' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}>
                            <Clock className="w-5 h-5 mb-2" />
                            <h4 className="font-bold uppercase tracking-widest">Auto Timer</h4>
                            <p className="text-[10px] mt-1 opacity-70">Follows open/close timings</p>
                          </button>
                          <button type="button" onClick={() => setSettingsFormData({...settingsFormData, storeMode: 'manual'})} className={`p-4 rounded-xl border text-left transition-all ${settingsFormData.storeMode === 'manual' ? 'bg-[#00FFFF]/10 border-[#00FFFF] text-[#00FFFF]' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}>
                            <Power className="w-5 h-5 mb-2" />
                            <h4 className="font-bold uppercase tracking-widest">Manual Override</h4>
                            <p className="text-[10px] mt-1 opacity-70">You decide when to open/close</p>
                          </button>
                        </div>
                      </div>

                      {settingsFormData.storeMode === 'auto' ? (
                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest">Opening Time</Label>
                            <Input type="time" value={settingsFormData.openTime} onChange={(e) => setSettingsFormData({...settingsFormData, openTime: e.target.value})} className="bg-black border-white/20 text-[#00FFFF] font-mono font-bold text-lg h-14" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest">Closing Time</Label>
                            <Input type="time" value={settingsFormData.closeTime} onChange={(e) => setSettingsFormData({...settingsFormData, closeTime: e.target.value})} className="bg-black border-white/20 text-[#00FFFF] font-mono font-bold text-lg h-14" />
                          </div>
                        </div>
                      ) : (
                        <div className="pt-4 border-t border-white/10 space-y-4">
                          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Manual Status Switch</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <button type="button" onClick={() => setSettingsFormData({...settingsFormData, isStoreOpen: true})} className={`p-6 rounded-[1.5rem] border flex items-center gap-4 transition-all ${settingsFormData.isStoreOpen ? 'bg-[#00FF55]/10 border-[#00FF55] text-green-300' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}>
                              <Zap className={`w-10 h-10 ${settingsFormData.isStoreOpen ? 'text-[#00FF55] [filter:drop-shadow(0_0_10px_#00FF55)]' : 'text-white/30'}`} />
                              <div className="flex-1"><h4 className="font-extrabold uppercase tracking-tight text-xl">Online</h4><p className="text-xs uppercase font-bold tracking-widest mt-0.5 opacity-70">Orders Teleporting</p></div>
                              <CheckSquare className={`w-6 h-6 shrink-0 ${settingsFormData.isStoreOpen ? 'text-[#00FF55]' : 'text-white/10'}`} />
                            </button>
                            
                            <button type="button" onClick={() => setSettingsFormData({...settingsFormData, isStoreOpen: false})} className={`p-6 rounded-[1.5rem] border flex items-center gap-4 transition-all ${!settingsFormData.isStoreOpen ? 'bg-red-500/10 border-red-500 text-red-300' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}>
                              <AlertTriangle className={`w-10 h-10 ${!settingsFormData.isStoreOpen ? 'text-red-500 [filter:drop-shadow(0_0_10px_#ff0000)]' : 'text-white/30'}`} />
                              <div className="flex-1"><h4 className="font-extrabold uppercase tracking-tight text-xl">Closed</h4><p className="text-xs uppercase font-bold tracking-widest mt-0.5 opacity-70">Matrix Recalibrating</p></div>
                              <CheckSquare className={`w-6 h-6 shrink-0 ${!settingsFormData.isStoreOpen ? 'text-red-500' : 'text-white/10'}`} />
                            </button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="glass-strong border-white/10">
                    <CardContent className="p-6 sm:p-8 space-y-6">
                      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                        <Zap className="w-6 h-6 text-[#CCFF00]" />
                        <h3 className="text-xl font-black uppercase text-white">Open State Banner</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><Label>Banner Image URL</Label><Input value={settingsFormData.bannerImageUrlOpen} onChange={e => setSettingsFormData({...settingsFormData, bannerImageUrlOpen: e.target.value})} placeholder="https://...jpg" className="bg-black/50" /></div>
                        <div className="space-y-2"><Label>Banner Text (Offers / Quotes)</Label><textarea value={settingsFormData.bannerTextOpen} onChange={e => setSettingsFormData({...settingsFormData, bannerTextOpen: e.target.value})} placeholder="New deals now!" rows={3} className="w-full h-12 bg-black/50 border border-white/10 focus-visible:border-[#00FFFF] rounded-md p-3 text-sm text-white resize-none" /></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-strong border-white/10">
                    <CardContent className="p-6 sm:p-8 space-y-6">
                      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                        <MoonStar className="w-6 h-6 text-red-500" />
                        <h3 className="text-xl font-black uppercase text-white">Closed State Banner</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><Label>Banner Image URL (e.g., sleeping logo)</Label><Input value={settingsFormData.bannerImageUrlClosed} onChange={e => setSettingsFormData({...settingsFormData, bannerImageUrlClosed: e.target.value})} placeholder="https://...jpg" className="bg-black/50" /></div>
                        <div className="space-y-2"><Label>Closed Line (e.g., Sleeping right now...)</Label><textarea value={settingsFormData.bannerTextClosed} onChange={e => setSettingsFormData({...settingsFormData, bannerTextClosed: e.target.value})} placeholder="Sleeping right now..." rows={3} className="w-full h-12 bg-black/50 border border-white/10 focus-visible:border-[#00FFFF] rounded-md p-3 text-sm text-white resize-none" /></div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-end pt-4 border-t border-white/10">
                    <Button type="submit" disabled={isSettingsSaving} className="h-14 bg-[#00FFFF] text-black hover:bg-[#00FFFF]/80 font-black uppercase tracking-widest px-10 rounded-full disabled:opacity-50">
                      {isSettingsSaving ? 'Saving...' : 'Save All Settings'}
                    </Button>
                  </div>
                </form>
             </motion.div>
          )}

          {/* 📊 ANALYTICS DASHBOARD VIEW */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-strong p-4 rounded-xl border border-[#00FFFF]/20 shadow-[0_0_15px_rgba(0,255,255,0.05)]">
                <div className="flex items-center gap-2">
                   <Calendar className="w-5 h-5 text-[#00FFFF]" />
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">Performance Metrics</h3>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select value={analyticsFilter} onChange={(e) => setAnalyticsFilter(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg px-3 h-10 text-xs font-bold text-white focus:outline-none focus:border-[#00FFFF] w-full sm:w-auto uppercase tracking-wider">
                    <option value="all" className="bg-black">All Time</option>
                    <option value="today" className="bg-black">Today</option>
                    <option value="yesterday" className="bg-black">Yesterday</option>
                    <option value="custom" className="bg-black">Custom Date</option>
                  </select>
                  {analyticsFilter === 'custom' && (
                    <Input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="bg-black/50 border-white/10 h-10 text-xs w-full sm:w-auto text-white" />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-strong border-[#CCFF00]/30 hover:border-[#CCFF00]/50 transition-colors"><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="bg-[#CCFF00]/10 p-3 rounded-lg"><IndianRupee className="w-6 h-6 text-[#CCFF00]" /></div><Badge variant="outline" className="text-[#CCFF00] border-[#CCFF00]/30 font-bold uppercase tracking-widest text-[10px]">Revenue</Badge></div><p className="text-3xl font-black text-white font-mono tracking-tighter">₹{totalRevenue}</p><p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">From Delivered Orders</p></CardContent></Card>
                <Card className="glass-strong border-[#00FFFF]/30 hover:border-[#00FFFF]/50 transition-colors"><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="bg-[#00FFFF]/10 p-3 rounded-lg"><PackageIcon className="w-6 h-6 text-[#00FFFF]" /></div><Badge variant="outline" className="text-[#00FFFF] border-[#00FFFF]/30 font-bold uppercase tracking-widest text-[10px]">Orders</Badge></div><p className="text-3xl font-black text-white font-mono tracking-tighter">{totalOrdersCount}</p><p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Total Orders Received</p></CardContent></Card>
                <Card className="glass-strong border-white/10 hover:border-white/30 transition-colors"><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="bg-white/10 p-3 rounded-lg"><TrendingUp className="w-6 h-6 text-white" /></div><Badge variant="outline" className="text-white border-white/30 font-bold uppercase tracking-widest text-[10px]">A.O.V</Badge></div><p className="text-3xl font-black text-white font-mono tracking-tighter">₹{avgOrderValue}</p><p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Average Order Value</p></CardContent></Card>
                <Card className="glass-strong border-white/10 hover:border-white/30 transition-colors"><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="bg-white/10 p-3 rounded-lg"><Users className="w-6 h-6 text-white" /></div><Badge variant="outline" className="text-white border-white/30 font-bold uppercase tracking-widest text-[10px]">Customers</Badge></div><p className="text-3xl font-black text-white font-mono tracking-tighter">{uniqueCustomersInAnalytics}</p><p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Unique Buyers</p></CardContent></Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-strong border-white/10"><CardContent className="p-6"><div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4"><Target className="w-5 h-5 text-[#00FFFF]" /><h3 className="text-lg font-black text-white uppercase tracking-widest">Order Success Rate</h3></div><div className="space-y-4"><div><div className="flex justify-between text-sm mb-1"><span className="font-bold text-[#CCFF00] uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Delivered</span><span className="font-mono text-white">{analyticsDelivered.length}</span></div><div className="w-full bg-white/5 rounded-full h-2"><div className="bg-[#CCFF00] h-2 rounded-full" style={{ width: `${totalOrdersCount > 0 ? (analyticsDelivered.length / totalOrdersCount) * 100 : 0}%` }}></div></div></div><div><div className="flex justify-between text-sm mb-1"><span className="font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2"><Clock className="w-4 h-4"/> Pending / Transit</span><span className="font-mono text-white">{analyticsPending.length}</span></div><div className="w-full bg-white/5 rounded-full h-2"><div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${totalOrdersCount > 0 ? (analyticsPending.length / totalOrdersCount) * 100 : 0}%` }}></div></div></div><div><div className="flex justify-between text-sm mb-1"><span className="font-bold text-red-500 uppercase tracking-widest flex items-center gap-2"><XCircle className="w-4 h-4"/> Cancelled</span><span className="font-mono text-white">{analyticsCancelled.length}</span></div><div className="w-full bg-white/5 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{ width: `${totalOrdersCount > 0 ? (analyticsCancelled.length / totalOrdersCount) * 100 : 0}%` }}></div></div></div></div></CardContent></Card>
                <Card className="glass-strong border-white/10"><CardContent className="p-6"><div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4"><BarChart className="w-5 h-5 text-[#CCFF00]" /><h3 className="text-lg font-black text-white uppercase tracking-widest">Top Selling Products</h3></div>{topProducts.length === 0 ? (<div className="text-center py-8 opacity-50"><PackageIcon className="w-8 h-8 mx-auto mb-2" /><p className="text-xs uppercase tracking-widest font-bold">No delivered items in period</p></div>) : (<div className="space-y-4">{topProducts.map((product, idx) => (<div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5"><div className="flex items-center gap-3"><span className="w-6 h-6 rounded flex items-center justify-center bg-white/10 text-xs font-black text-white">{idx + 1}</span><span className="font-bold text-sm text-white">{product.name}</span></div><div className="text-right"><p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Sold: <span className="text-[#00FFFF] font-black font-mono">{product.qty}</span></p><p className="font-mono text-sm font-black text-[#CCFF00]">₹{product.revenue}</p></div></div>))}</div>)}</CardContent></Card>
              </div>
            </motion.div>
          )}

          {/* ⚡ LIVE ORDERS VIEW */}
          {activeTab === 'live_orders' && (
             <motion.div key="live_orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
               {liveOrders.length === 0 ? (
                 <Empty className="glass-strong border-[#00FFFF]/20 py-20 mt-10 max-w-md mx-auto"><EmptyContent><CheckCircle2 className="w-12 h-12 text-[#00FFFF] opacity-50 mb-4" /><EmptyTitle className="text-xl uppercase">All Clear</EmptyTitle></EmptyContent></Empty>
               ) : (
                 <div className="grid grid-cols-1 gap-6">
                   {liveOrders.map((order: any, idx: number) => {
                     const actualIndex = orders.findIndex((o: any) => o === order)
                     const orderIdToUpdate = order.id || actualIndex
                     const isBlocked = customerMeta[order.phone]?.isBlocked
                     return (
                     <Card key={idx} className={`glass-strong border-white/10 overflow-hidden relative ${isBlocked ? 'border-red-500/50' : ''}`}>
                       <div className="bg-white/5 p-4 sm:p-6 border-b border-white/10 flex justify-between">
                         <div>
                           <h3 className="text-xl font-black text-white uppercase flex items-center gap-2">{order.customer} {isBlocked && <Badge variant="destructive" className="text-[10px]">BLOCKED USER</Badge>}</h3>
                           <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground mt-1"><span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {order.time}</span><span className="flex items-center gap-1 text-[#00FFFF]"><Phone className="w-3 h-3" /> {order.phone}</span></div>
                         </div>
                         <span className={`px-4 py-1.5 rounded-md border text-[10px] font-black tracking-widest uppercase h-fit ${getStatusColor(order.status)}`}>{order.status}</span>
                       </div>
                       <CardContent className="p-0">
                         <div className="grid grid-cols-1 lg:grid-cols-2">
                           <div className="p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-white/5">
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Order Items</p>
                             <div className="space-y-3">
                               {order.items.map((item: any, i: number) => (
                                 <div key={i} className="flex justify-between items-center text-sm"><span className="text-white">{item.quantity}x {item.name}</span><span className="font-mono text-muted-foreground">₹{item.price * item.quantity}</span></div>
                               ))}
                             </div>
                             <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                               {order.discount > 0 && (
                                 <>
                                   <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
                                   <div className="flex justify-between items-center text-[10px] text-[#CCFF00] uppercase font-bold"><span>Discount ({order.promoCode})</span><span>-₹{order.discount}</span></div>
                                 </>
                               )}
                               <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-2"><span className="text-xs font-bold text-white uppercase tracking-widest">Final Paid</span><span className="font-mono font-black text-[#00FFFF] text-lg">₹{order.amount}</span></div>
                             </div>
                           </div>
                           <div className="p-4 sm:p-6 space-y-6">
                             <div className="flex gap-3"><MapPin className="w-5 h-5 text-[#00FFFF]" /><div><p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Drop Details</p><p className="text-sm text-white mt-1">{order.landmark}</p></div></div>
                             <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                                <Button onClick={() => updateOrderStatus(orderIdToUpdate, 'In Transit')} className="h-10 text-xs font-black border-blue-500/30 text-blue-400" variant="outline"><Truck className="w-4 h-4 mr-2"/> IN TRANSIT</Button>
                                <Button onClick={() => updateOrderStatus(orderIdToUpdate, 'Delivered')} className="h-10 text-xs font-black bg-[#CCFF00] text-black"><CheckCircle2 className="w-4 h-4 mr-2"/> DELIVERED</Button>
                                <Button onClick={() => updateOrderStatus(orderIdToUpdate, 'Cancelled')} className="h-10 text-xs font-black text-red-500 col-span-2" variant="ghost"><XCircle className="w-4 h-4 mr-2"/> CANCEL</Button>
                             </div>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   )})}
                 </div>
               )}
             </motion.div>
          )}

          {/* 📜 ORDER HISTORY VIEW */}
          {activeTab === 'order_history' && (
            <motion.div key="order_history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {orderHistory.length === 0 ? (
                <Empty className="glass-strong border-[#00FFFF]/20 py-20 mt-10 max-w-md mx-auto"><EmptyContent><History className="w-12 h-12 text-[#00FFFF] opacity-50 mb-4" /><EmptyTitle className="text-xl uppercase">No Past Orders</EmptyTitle><EmptyDescription className="text-muted-foreground">Delivered and Cancelled orders will appear here.</EmptyDescription></EmptyContent></Empty>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {orderHistory.map((order: any, idx: number) => {
                    const isBlocked = customerMeta[order.phone]?.isBlocked
                    return (
                      <Card key={idx} className={`glass-strong border-white/10 overflow-hidden relative ${isBlocked ? 'border-red-500/50' : ''}`}>
                        <div className="bg-white/5 p-4 sm:p-6 border-b border-white/10 flex justify-between items-center">
                          <div>
                            <h3 className="text-xl font-black text-white uppercase flex items-center gap-2">{order.customer} {isBlocked && <Badge variant="destructive" className="text-[10px]">BLOCKED</Badge>}</h3>
                            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground mt-1"><span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {order.time}</span><span className="flex items-center gap-1 text-[#00FFFF]"><Phone className="w-3 h-3" /> {order.phone}</span></div>
                          </div>
                          <span className={`px-4 py-1.5 rounded-md border text-[10px] font-black tracking-widest uppercase h-fit ${getStatusColor(order.status)}`}>{order.status}</span>
                        </div>
                        <CardContent className="p-0">
                          <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-white/5">
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Order Items</p>
                              <div className="space-y-3">
                                {order.items.map((item: any, i: number) => (
                                  <div key={i} className="flex justify-between items-center text-sm"><span className="text-white">{item.quantity}x {item.name}</span><span className="font-mono text-muted-foreground">₹{item.price * item.quantity}</span></div>
                                ))}
                              </div>
                              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                               {order.discount > 0 && (
                                 <>
                                   <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
                                   <div className="flex justify-between items-center text-[10px] text-[#CCFF00] uppercase font-bold"><span>Discount ({order.promoCode})</span><span>-₹{order.discount}</span></div>
                                 </>
                               )}
                               <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-2"><span className="text-xs font-bold text-white uppercase tracking-widest">Final Paid</span><span className="font-mono font-black text-[#00FFFF] text-lg">₹{order.amount}</span></div>
                              </div>
                            </div>
                            <div className="p-4 sm:p-6"><div className="flex gap-3"><MapPin className="w-5 h-5 text-muted-foreground" /><div><p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Drop Details</p><p className="text-sm text-muted-foreground mt-1">{order.landmark}</p></div></div></div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* 🏷️ OFFERS & PROMO CODES VIEW */}
          {activeTab === 'offers' && (
            <motion.div key="offers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <Card className="glass-strong border-[#CCFF00]/30 hover:border-[#CCFF00]/50 transition-all mb-6">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
                  <div>
                    <h3 className="text-lg font-black text-[#CCFF00] uppercase flex items-center gap-2"><LockKeyhole className="w-5 h-5"/> Global Minimum Order</h3>
                    <p className="text-xs text-muted-foreground mt-1">Set the strict minimum cart value required to checkout.</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Input type="number" value={globalMinOrder} onChange={e => setGlobalMinOrder(Number(e.target.value))} className="bg-black/50 border-white/10 w-full sm:w-32 text-center text-[#CCFF00] font-mono font-black text-lg" />
                    <Button onClick={handleSaveGlobalMinOrder} className="bg-[#CCFF00] text-black font-black hover:bg-[#CCFF00]/80 px-6 uppercase">Save Limit</Button>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between items-center gap-4 pt-4 border-t border-white/10">
                <div><p className="text-muted-foreground font-mono">Manage discount coupons for your customers.</p></div>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button className="bg-[#00FFFF] text-black font-black hover:bg-[#00FFFF]/90 shadow-[0_0_15px_rgba(0,255,255,0.3)] h-12 rounded-xl px-6">
                      <Plus className="w-5 h-5 mr-2" /> NEW OFFER
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-black/95 backdrop-blur-2xl border-l border-[#00FFFF]/30 sm:max-w-md w-full overflow-y-auto">
                    <SheetHeader className="text-left mb-8 mt-6"><SheetTitle className="text-3xl font-black italic uppercase text-[#00FFFF]">Create Coupon</SheetTitle></SheetHeader>
                    <form onSubmit={(e: any) => {
                      e.preventDefault(); const data = new FormData(e.target);
                      addPromoCode({ code: data.get('code')?.toString().toUpperCase() || '', type: data.get('type') as any, value: Number(data.get('value')), minOrder: Number(data.get('minOrder')), isActive: true });
                      e.target.reset();
                    }} className="flex flex-col gap-6">
                      <div className="space-y-2"><Label>Coupon Code (e.g. HOLI50)</Label><Input name="code" required className="bg-white/5 border-white/10 uppercase font-mono text-[#00FFFF]" placeholder="WEBFOO20" /></div>
                      <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Discount Type</Label><select name="type" className="w-full h-10 bg-white/5 border border-white/10 rounded-md px-3 text-sm text-white focus:outline-none focus:border-[#00FFFF]"><option value="flat" className="bg-black">Flat Amount (₹)</option><option value="percent" className="bg-black">Percentage (%)</option></select></div><div className="space-y-2"><Label>Discount Value</Label><Input name="value" type="number" required min="1" className="bg-white/5 border-white/10" placeholder="e.g. 50" /></div></div>
                      <div className="space-y-2"><Label>Minimum Order Amount (₹)</Label><Input name="minOrder" type="number" required min="0" className="bg-white/5 border-white/10" placeholder="e.g. 500" /></div>
                      <Button type="submit" className="w-full h-14 bg-[#00FFFF] text-black font-black hover:bg-[#00FFFF]/80">SAVE OFFER</Button>
                    </form>
                  </SheetContent>
                </Sheet>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {(!promoCodes || promoCodes.length === 0) ? (
                  <div className="col-span-full py-20 text-center opacity-30"><Tag className="w-12 h-12 mx-auto mb-4" /><p className="font-black uppercase tracking-widest text-xl">No Active Offers</p></div>
                ) : (
                  promoCodes.map((promo: any) => (
                    <Card key={promo.id} className={`glass-strong border-white/10 transition-all ${!promo.isActive ? 'opacity-50 grayscale' : 'hover:border-[#00FFFF]/30'}`}>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-4"><div className="flex items-center gap-2"><p className="text-xl font-black text-[#00FFFF] font-mono tracking-widest">{promo.code}</p>{promo.isActive && <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />}</div><Badge variant={promo.isActive ? "outline" : "secondary"} className={`text-[10px] font-black uppercase tracking-widest ${promo.isActive ? 'text-[#CCFF00] border-[#CCFF00]/30' : ''}`}>{promo.isActive ? 'ACTIVE' : 'OFF'}</Badge></div>
                        <div className="space-y-1 mb-6"><p className="font-bold text-white text-sm">{promo.type === 'flat' ? `₹${promo.value} Flat Off` : `${promo.value}% Instant Discount`}</p><p className="text-[10px] text-muted-foreground uppercase tracking-widest">Valid on orders above ₹{promo.minOrder}</p></div>
                        <div className="flex gap-2 pt-4 border-t border-white/10">
                          <Button variant="ghost" className={`flex-1 text-xs font-black border ${promo.isActive ? 'border-white/10 text-white hover:bg-white/10' : 'border-[#CCFF00]/30 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black'}`} onClick={() => togglePromoStatus(promo.id)}>{promo.isActive ? <PowerOff className="w-4 h-4 mr-2" /> : <Power className="w-4 h-4 mr-2" />}{promo.isActive ? 'TURN OFF' : 'ACTIVATE'}</Button>
                          <Button variant="ghost" size="icon" className="border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white" onClick={() => { if(confirm("Delete this promo code?")) deletePromo(promo.id) }}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* 📢 MESSAGES / IN-APP BROADCAST VIEW */}
          {activeTab === 'messages' && (
            <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glass-strong border-[#00FFFF]/20 lg:col-span-1 h-fit"><CardContent className="p-6 space-y-6"><div><h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#00FFFF]"/> Broadcast Center</h3><p className="text-xs text-muted-foreground">Select customers to push an alert to their app or send a direct WhatsApp text.</p></div><div className="space-y-3"><Label className="text-xs uppercase tracking-widest text-[#00FFFF]">Message Content</Label><textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Hey! Use code WEBFOO20 for 20% off your next neon drop... 🚀" className="w-full bg-black/50 border border-white/10 focus-visible:border-[#00FFFF] rounded-xl p-4 min-h-[200px] text-sm text-white resize-none shadow-[0_0_15px_rgba(0,255,255,0.05)]" /><div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest"><span>{messageText.length} characters</span><span>{selectedCustomers.length} selected</span></div></div><div className="flex flex-col gap-3"><Button onClick={handleSendToApp} disabled={selectedCustomers.length === 0 || !messageText.trim()} className="w-full h-12 bg-[#CCFF00] text-black font-black hover:bg-[#CCFF00]/80 shadow-[0_0_20px_rgba(204,255,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"><Smartphone className="w-4 h-4 mr-2" /> PUSH TO APP</Button><Button onClick={handleSendToWhatsApp} disabled={selectedCustomers.length === 0 || !messageText.trim()} className="w-full h-12 bg-[#25D366] text-white font-black hover:bg-[#25D366]/80 shadow-[0_0_20px_rgba(37,211,102,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"><MessageCircle className="w-4 h-4 mr-2" /> PUSH TO WHATSAPP</Button></div></CardContent></Card>
              <Card className="glass-strong border-white/10 lg:col-span-2">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4"><h3 className="text-sm font-black text-white uppercase tracking-widest">Select Recipients</h3><button onClick={handleSelectAll} className="flex items-center gap-2 text-xs font-bold text-[#00FFFF] hover:text-white transition-colors uppercase tracking-widest">{selectedCustomers.length === customersList.length && customersList.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />} {selectedCustomers.length === customersList.length && customersList.length > 0 ? 'Deselect All' : 'Select All'}</button></div>
                  {customersList.length === 0 ? (
                    <Empty className="py-12 border-none"><EmptyContent><Users className="w-12 h-12 text-muted-foreground mb-4 opacity-50" /><EmptyTitle className="text-lg uppercase">No customers to message</EmptyTitle></EmptyContent></Empty>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                      {customersList.map((cust: any) => {
                        const isSelected = selectedCustomers.includes(cust.phone); const isVip = customerMeta[cust.phone]?.isVip;
                        return (
                          <div key={cust.phone} onClick={() => handleSelectCustomer(cust.phone)} className={`p-3 rounded-xl border cursor-pointer flex items-center gap-4 transition-all ${isSelected ? 'bg-[#00FFFF]/10 border-[#00FFFF]/50 shadow-[0_0_15px_rgba(0,255,255,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}><div className={`shrink-0 transition-colors ${isSelected ? 'text-[#00FFFF]' : 'text-muted-foreground'}`}>{isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}</div><div className="flex-1 overflow-hidden"><div className="flex items-center gap-2"><p className={`font-bold uppercase truncate ${isSelected ? 'text-white' : 'text-white/80'}`}>{cust.name}</p>{isVip && <Star className="w-3 h-3 text-[#CCFF00] shrink-0" />}</div><p className="text-xs font-mono text-muted-foreground mt-0.5">{cust.phone}</p></div></div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 👥 CRM - CUSTOMERS LIST VIEW */}
          {activeTab === 'customers' && (
             <motion.div key="customers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
               {customersList.length === 0 ? (
                <Empty className="glass-strong border-white/10 py-20 mt-10 max-w-md mx-auto"><EmptyContent><Users className="w-12 h-12 text-muted-foreground mb-4 opacity-50" /><EmptyTitle className="text-xl uppercase tracking-tighter">No Customers Yet</EmptyTitle></EmptyContent></Empty>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {customersList.map((cust: any, idx) => {
                    const meta = customerMeta[cust.phone] || {}; const isVip = meta.isVip; const isBlocked = meta.isBlocked;
                    return (
                      <Card key={idx} className={`glass-strong border-white/10 overflow-hidden ${isBlocked ? 'opacity-50 grayscale' : ''}`}>
                        <div className="p-5 flex flex-col sm:flex-row justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3"><h3 className="text-xl font-black text-white uppercase tracking-tight">{cust.name}</h3>{isVip && <Badge className="bg-[#CCFF00] text-black hover:bg-[#CCFF00] font-black uppercase tracking-widest text-[10px]">VIP</Badge>}{isBlocked && <Badge variant="destructive" className="font-black uppercase tracking-widest text-[10px]">BLOCKED</Badge>}</div>
                            <div className="grid grid-cols-2 gap-4"><div><p className="text-[10px] text-muted-foreground uppercase tracking-widest">Total Spent</p><p className="font-mono text-xl font-black text-[#00FFFF]">₹{cust.totalSpent}</p></div><div><p className="text-[10px] text-muted-foreground uppercase tracking-widest">Total Orders</p><p className={`font-mono text-xl font-black ${cust.totalOrders > 0 ? 'text-white' : 'text-yellow-500'}`}>{cust.totalOrders}</p></div></div>
                          </div>
                          <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                            <a href={`https://wa.me/91${cust.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none"><Button className="w-full bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white border border-green-500/20"><MessageCircle className="w-4 h-4 mr-2" /> WhatsApp</Button></a>
                            <a href={`tel:${cust.phone}`} className="flex-1 sm:flex-none"><Button className="w-full bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20"><Phone className="w-4 h-4 mr-2" /> Call</Button></a>
                            <Sheet>
                              <SheetTrigger asChild><Button variant="outline" className="w-full flex-1 sm:flex-none border-white/10 hover:bg-white/10 text-white"><FileText className="w-4 h-4 mr-2" /> Details</Button></SheetTrigger>
                              <SheetContent className="bg-black/95 border-l border-[#00FFFF]/30 w-full sm:max-w-md overflow-y-auto">
                                <SheetHeader className="text-left mb-6 mt-6"><SheetTitle className="text-2xl font-black italic uppercase text-[#00FFFF]">Customer Details</SheetTitle></SheetHeader>
                                <div className="space-y-6">
                                  <div className="glass-strong p-4 rounded-xl border-white/10 space-y-2"><div><p className="font-bold text-white text-lg leading-tight">{cust.name}</p><p className="text-muted-foreground font-mono text-sm">{cust.phone}</p></div><div className="flex gap-2 items-start bg-white/5 p-3 rounded-lg border border-white/5"><MapPin className="w-4 h-4 text-[#00FFFF] shrink-0 mt-0.5" /><p className="text-sm text-white/80 leading-relaxed">{cust.address}</p></div></div>
                                  <div className="flex gap-2">
                                    <Button onClick={() => updateCustomerMeta(cust.phone, { isVip: !isVip })} className={`flex-1 ${isVip ? 'bg-white/10 text-white' : 'bg-[#CCFF00]/10 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black'} border border-[#CCFF00]/30`}><Star className="w-4 h-4 mr-2" /> {isVip ? 'Remove VIP' : 'Mark as VIP'}</Button>
                                    <Button onClick={() => updateCustomerMeta(cust.phone, { isBlocked: !isBlocked })} className={`flex-1 ${isBlocked ? 'bg-white/10 text-white' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'} border border-red-500/30`}><Ban className="w-4 h-4 mr-2" /> {isBlocked ? 'Unblock' : 'Block'}</Button>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Order History</h4>
                                    {cust.totalOrders === 0 ? (
                                      <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20 text-center"><p className="text-yellow-500 text-xs font-bold uppercase tracking-widest">Registered but no orders placed</p></div>
                                    ) : (
                                      <div className="space-y-3">
                                        {cust.ordersList.slice().reverse().map((o: any, i: number) => (
                                          <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/5 flex justify-between items-center"><div><p className="text-[10px] text-muted-foreground">{o.time}</p><p className="font-bold text-white text-sm">{o.items.length} Items</p></div><div className="text-right"><p className="font-mono font-black text-[#00FFFF]">₹{o.amount}</p><span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-widest font-black ${getStatusColor(o.status)}`}>{o.status}</span></div></div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </SheetContent>
                            </Sheet>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
             </motion.div>
          )}

          {/* 📦 PRODUCTS INVENTORY VIEW */}
          {activeTab === 'products' && (
             <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
               <div className="flex justify-between items-center gap-4">
                 <p className="text-muted-foreground font-mono">Live Sync: Changes reflect instantly on the website.</p>
                 <Sheet open={isProductSheetOpen} onOpenChange={(open) => { setIsProductSheetOpen(open); if(!open) resetForm() }}>
                   <SheetTrigger asChild><Button onClick={resetForm} className="bg-[#CCFF00] text-black font-black hover:bg-[#CCFF00]/90 shadow-[0_0_15px_rgba(204,255,0,0.3)] h-12 rounded-xl px-6"><Plus className="w-5 h-5 mr-2" /> ADD PRODUCT</Button></SheetTrigger>
                   <SheetContent className="bg-black/95 backdrop-blur-2xl border-l border-[#00FFFF]/30 sm:max-w-md w-full overflow-y-auto">
                     <SheetHeader className="text-left mb-8 mt-6"><SheetTitle className="text-3xl font-black italic uppercase text-[#00FFFF]">{editingId ? 'Edit Product' : 'New Product'}</SheetTitle></SheetHeader>
                     
                     <form onSubmit={handleSaveProduct} className="flex flex-col gap-6">
                       <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
                         <Label className="text-xs font-black uppercase tracking-widest text-[#00FFFF]">Product Image</Label>
                         <div className="relative w-full h-32 rounded-xl border-2 border-dashed border-[#00FFFF]/40 bg-[#00FFFF]/5 flex items-center justify-center overflow-hidden cursor-pointer group">
                           <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                           {formData.image && formData.image.startsWith('data:') ? (
                             <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                           ) : (
                             <div className="text-center group-hover:scale-105 transition-transform"><UploadCloud className="w-6 h-6 text-[#00FFFF] mx-auto mb-2" /><span className="text-xs font-bold text-[#00FFFF]">Upload from Device</span></div>
                           )}
                         </div>
                         <div className="flex items-center gap-4"><div className="h-px bg-white/10 flex-1"></div><span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">OR</span><div className="h-px bg-white/10 flex-1"></div></div>
                         <div className="space-y-2">
                           <Label className="text-[10px] text-white/70">Paste Image Link (URL)</Label>
                           <Input type="url" placeholder="https://..." value={formData.image && !formData.image.startsWith('data:') ? formData.image : ''} onChange={(e) => setFormData({...formData, image: e.target.value})} className="bg-black/50 border-white/20 text-xs focus-visible:border-[#00FFFF]" />
                           {formData.image && !formData.image.startsWith('data:') && (
                             <div className="mt-2 relative w-full h-24 rounded-lg overflow-hidden border border-white/10 bg-black/50">
                               <img src={formData.image} alt="URL Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.jpg' }} />
                             </div>
                           )}
                         </div>
                       </div>

                       <div className="space-y-4">
                         <div className="flex gap-2 items-end">
                           <div className="flex-1 space-y-2">
                             <Label>Product Name</Label>
                             <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-white/5 border-white/10" />
                           </div>
                           <Button type="button" onClick={generateAIDesc} className="bg-[#CCFF00] text-black h-10 px-3"><Zap className="w-4 h-4" /></Button>
                         </div>
                         <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Selling Price (₹)</Label><Input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-white/5 border-white/10" /></div><div className="space-y-2"><Label>MRP / Cut Price (₹)</Label><Input required type="number" value={formData.mrp} onChange={e => setFormData({...formData, mrp: e.target.value})} className="bg-white/5 border-white/10" /></div></div>
                         <div className="space-y-2">
                           <Label>Category</Label>
                           <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full h-10 bg-white/5 border border-white/10 rounded-md px-3 text-sm text-white focus:outline-none focus:border-[#00FFFF]">
                             {displayCategories.map((catName: string, idx: number) => (
                               <option key={idx} value={catName} className="bg-black text-white">{catName}</option>
                             ))}
                           </select>
                         </div>
                       </div>
                       <Button type="submit" className="w-full h-14 bg-[#00FFFF] text-black font-black hover:bg-[#00FFFF]/80">{editingId ? 'UPDATE PRODUCT' : 'SAVE TO INVENTORY'}</Button>
                     </form>
                   </SheetContent>
                 </Sheet>
               </div>
               
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                 {products.map((product: any) => (
                   <Card key={product.id} className={`glass-strong border-white/10 overflow-hidden group transition-all ${!product.inStock ? 'opacity-60 grayscale' : 'hover:border-[#00FFFF]/30'}`}>
                     <div className="relative h-40 w-full bg-white/5">
                       <img src={product.image || "/placeholder.jpg"} alt={product.name} className="object-cover w-full h-full" onError={(e) => { e.currentTarget.src = '/placeholder.jpg' }} />
                       {!product.inStock && <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10"><span className="bg-red-500 text-white font-black text-[10px] px-2 py-1 uppercase rounded">Out of Stock</span></div>}
                       <div className="absolute top-2 right-2 flex gap-2 z-20">
                         <button onClick={() => openEdit(product)} className="w-8 h-8 rounded-full bg-black/90 border border-[#00FFFF]/50 flex items-center justify-center text-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:bg-[#00FFFF] hover:text-black transition-all"><Edit className="w-4 h-4" /></button>
                         <button onClick={() => { if(confirm("Delete this product?")) deleteProduct(product.id) }} className="w-8 h-8 rounded-full bg-black/90 border border-red-500/50 flex items-center justify-center text-red-500 shadow-[0_0_10px_rgba(255,0,0,0.2)] hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                       </div>
                     </div>
                     <CardContent className="p-4">
                       <div className="flex justify-between items-start mb-2"><p className="text-[10px] text-muted-foreground uppercase tracking-widest">{product.category}</p><button onClick={() => toggleStock(product.id)} className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${product.inStock ? 'text-green-400 border-green-400/30 bg-green-400/10' : 'text-red-400 border-red-400/30 bg-red-400/10'}`}>{product.inStock ? 'In Stock' : 'Out'}</button></div>
                       <h3 className="font-bold text-white text-sm leading-tight truncate">{product.name}</h3>
                       <div className="flex items-center gap-2 mt-2"><span className="font-mono font-black text-[#00FFFF]">₹{product.price}</span>{product.mrp > product.price && <span className="text-xs text-muted-foreground line-through font-mono">₹{product.mrp}</span>}</div>
                     </CardContent>
                   </Card>
                 ))}
               </div>
             </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}
