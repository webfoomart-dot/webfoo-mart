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
  ArrowUp, ArrowDown, Save, Loader2
} from "lucide-react"

import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Empty, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const ADMIN_SECRET_PASSCODE = "WEBFOO99"

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

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = React.useState(false)
  const [isAuthorized, setIsAuthorized] = React.useState(false)
  const [passcode, setPasscode] = React.useState('')
  const [authError, setAuthError] = React.useState('')

  const { 
    orders, updateOrderStatus, products, addProduct, updateProduct, deleteProduct, toggleStock,
    customerMeta, updateCustomerMeta, addNotification, promoCodes, addPromoCode, togglePromoStatus, deletePromo,
    storeConfig, fetchStoreConfig, updateStoreConfig, fetchData,
    categories, addCategory, updateCategory, deleteCategory, reorderCategory 
  } = useAppStore() as any
  
  const [activeTab, setActiveTab] = React.useState('live_orders')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  // Product Form States (Tera Purana Logic)
  const [isProductSheetOpen, setIsProductSheetOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({ name: '', price: '', mrp: '', category: '', image: '', inStock: true })

  // Category Form States (Tera Naya Feature)
  const [editingCategoryId, setEditingCategoryId] = React.useState<string | null>(null)
  const [catName, setCatName] = React.useState('')
  const [catImg, setCatImg] = React.useState('')

  // Analytics Filters (Tera Purana Logic)
  const [analyticsFilter, setAnalyticsFilter] = React.useState('all')
  const [customDate, setCustomDate] = React.useState('')

  // Message States (Tera Purana Logic)
  const [selectedCustomers, setSelectedCustomers] = React.useState<string[]>([])
  const [messageText, setMessageText] = React.useState('')

  // Settings States (Tera Purana Logic)
  const [settingsFormData, setSettingsFormData] = React.useState({
    storeMode: 'manual', openTime: '08:00', closeTime: '22:00',
    isStoreOpen: true, bannerTextOpen: '', bannerImageUrlOpen: '', bannerTextClosed: '', bannerImageUrlClosed: ''
  })
  const [globalMinOrder, setGlobalMinOrder] = React.useState(0)

  React.useEffect(() => { 
    setIsMounted(true) 
    if (fetchData) fetchData()
    if (fetchStoreConfig) fetchStoreConfig() 
    if (sessionStorage.getItem('webfoo_admin_unlocked') === 'true') setIsAuthorized(true)
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

  const handleAdminAccess = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode === ADMIN_SECRET_PASSCODE) {
      sessionStorage.setItem('webfoo_admin_unlocked', 'true'); setIsAuthorized(true); setAuthError('')
    } else { setAuthError('ACCESS DENIED'); setPasscode('') }
  }

  // --- LOGICS ---

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setIsSaving(true);
    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, { name: catName.trim(), image: catImg });
      } else {
        await addCategory({ name: catName.trim(), image: catImg });
      }
      setCatName(''); setCatImg(''); setEditingCategoryId(null);
      if (fetchData) await fetchData();
    } catch (err) { alert("Error saving category!") }
    setIsSaving(false);
  }

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { name: formData.name, price: Number(formData.price), mrp: Number(formData.mrp), category: formData.category, image: formData.image || '/placeholder.jpg', inStock: formData.inStock }
    if (editingId) updateProduct(editingId, payload)
    else addProduct(payload)
    setIsProductSheetOpen(false); setEditingId(null); setFormData({ name: '', price: '', mrp: '', category: '', image: '', inStock: true });
  }

  const handleImgUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'cat' | 'prod') => {
    const file = e.target.files?.[0]
    if (file) { 
      const reader = new FileReader(); 
      reader.onloadend = () => type === 'cat' ? setCatImg(reader.result as string) : setFormData({...formData, image: reader.result as string}); 
      reader.readAsDataURL(file) 
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateStoreConfig) return;
    await updateStoreConfig({
      storeMode: settingsFormData.storeMode as any,
      openTime: settingsFormData.openTime,
      closeTime: settingsFormData.closeTime,
      isStoreOpen: settingsFormData.isStoreOpen,
      bannerTextOpen: settingsFormData.bannerTextOpen,
      bannerImageUrlOpen: settingsFormData.bannerImageUrlOpen || null,
      bannerTextClosed: settingsFormData.bannerTextClosed,
      bannerImageUrlClosed: settingsFormData.bannerImageUrlClosed || null,
      minOrderAmount: globalMinOrder
    });
    alert("Settings Updated!");
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
      case 'In Transit': return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
      case 'Delivered': return 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/30'
      case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/30'
      default: return 'bg-white/10 text-white'
    }
  }

  if (!isMounted) return null

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm glass-strong border border-red-500/30 rounded-[2rem] p-8 text-center shadow-[0_0_50px_rgba(255,0,85,0.1)]">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/50 rounded-2xl flex items-center justify-center mx-auto mb-6"><ShieldAlert className="w-10 h-10 text-red-500" /></div>
          <h1 className="text-3xl font-black uppercase text-white mb-8 italic tracking-tighter">Admin Access</h1>
          <form onSubmit={handleAdminAccess} className="space-y-6">
            <Input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} className="h-14 bg-black/50 border-red-500/30 text-white rounded-xl text-center tracking-[0.3em] font-mono text-xl" placeholder="PASSCODE" />
            <Button type="submit" className="w-full h-14 bg-red-500 text-white font-black hover:bg-red-600 uppercase tracking-widest">Unlock System</Button>
          </form>
        </motion.div>
      </div>
    )
  }

  const liveOrders = orders.filter((o: any) => o.status === 'Pending' || o.status === 'In Transit').reverse()
  const orderHistory = orders.filter((o: any) => o.status === 'Delivered' || o.status === 'Cancelled').reverse()

  const SidebarNav = () => (
    <div className="flex flex-col h-full bg-black">
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <Link href="/"><Button variant="ghost" size="icon" className="h-8 w-8 text-[#00FFFF]"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <span className="text-2xl font-black italic uppercase text-white">WebFoo <span className="text-[#CCFF00]">Admin</span></span>
      </div>
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-hide">
        {MENU_ITEMS.map((item) => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false) }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/30 shadow-[0_0_15px_rgba(0,255,255,0.1)]' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}>
            <item.icon className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-widest">{item.label}</span>
            {item.id === 'live_orders' && liveOrders.length > 0 && <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-black">{liveOrders.length}</span>}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <Button onClick={() => { sessionStorage.removeItem('webfoo_admin_unlocked'); window.location.reload(); }} className="w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 uppercase tracking-widest font-black text-xs h-12"><PowerOff className="w-4 h-4 mr-2" /> Lock System</Button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#050505] text-foreground font-sans selection:bg-[#00FFFF]/30">
      <aside className="hidden md:flex flex-col w-72 glass-strong border-r border-white/10 fixed top-0 bottom-0 left-0 z-40"><SidebarNav /></aside>
      
      <main className="flex-1 md:ml-72 pt-20 md:pt-8 p-4 md:p-8">
        <AnimatePresence mode="wait">
          
          {/* CATEGORIES TAB (Tera Naya Feature - Split View) */}
          {activeTab === 'categories' && (
             <motion.div key="categories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5">
                  <Card className="glass-strong border-white/10 sticky top-8">
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-center gap-3 border-b border-white/10 pb-4"><LayoutGrid className="w-6 h-6 text-[#00FFFF]" /><h3 className="text-xl font-black uppercase text-white">{editingCategoryId ? 'Edit Category' : 'Add Category'}</h3></div>
                      <form onSubmit={handleSaveCategory} className="space-y-6">
                        <div className="space-y-4">
                          <Label className="text-xs font-black uppercase tracking-widest text-[#00FFFF]">Image</Label>
                          <div className="relative w-full h-32 rounded-xl border-2 border-dashed border-[#00FFFF]/30 bg-[#00FFFF]/5 flex items-center justify-center overflow-hidden cursor-pointer group">
                            <input type="file" accept="image/*" onChange={(e) => handleImgUpload(e, 'cat')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            {catImg ? <img src={catImg} className="w-full h-full object-cover" /> : <div className="text-center"><UploadCloud className="w-8 h-8 text-[#00FFFF] mx-auto mb-2" /><span className="text-xs font-bold text-[#00FFFF]">Upload</span></div>}
                          </div>
                          <Input value={catImg && !catImg.startsWith('data:') ? catImg : ''} onChange={(e) => setCatImg(e.target.value)} placeholder="Or paste image URL..." className="bg-black/50 border-white/10 text-xs h-10" />
                        </div>
                        <div className="space-y-2"><Label className="text-xs font-black uppercase text-[#00FFFF]">Category Name</Label><Input required value={catName} onChange={(e) => setCatName(e.target.value)} className="h-12 bg-black/50 border-white/10 text-white font-bold" /></div>
                        <div className="flex gap-3">
                          <Button type="submit" disabled={isSaving} className="flex-1 h-14 bg-[#CCFF00] text-black font-black uppercase tracking-widest">{isSaving ? <Loader2 className="animate-spin" /> : 'SAVE CATEGORY'}</Button>
                          {editingCategoryId && <Button type="button" onClick={() => {setEditingCategoryId(null); setCatName(''); setCatImg('');}} className="bg-white/10 text-white px-4">X</Button>}
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
                <div className="lg:col-span-7">
                  <h4 className="text-xs font-black text-muted-foreground uppercase mb-6 tracking-widest">Active Categories ({categories.length})</h4>
                  <div className="space-y-3">
                    {categories.map((cat: any, idx: number) => (
                      <div key={cat.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl group hover:border-[#00FFFF]/30">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono text-white/20">{idx+1}</span>
                          <div className="w-12 h-12 rounded-lg bg-black border border-white/10 overflow-hidden shrink-0">
                            {cat.image ? <img src={cat.image} className="w-full h-full object-cover" /> : <PackageIcon className="p-3 text-white/20" />}
                          </div>
                          <span className="font-black text-white uppercase text-sm">{cat.name}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => reorderCategory(cat.id, 'up')} disabled={idx === 0} className="text-[#00FFFF]"><ArrowUp className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => reorderCategory(cat.id, 'down')} disabled={idx === categories.length-1} className="text-[#00FFFF]"><ArrowDown className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => {setEditingCategoryId(cat.id); setCatName(cat.name); setCatImg(cat.image || ''); window.scrollTo(0,0);}} className="text-[#CCFF00]"><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteCategory(cat.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </motion.div>
          )}

          {/* LIVE ORDERS (Tera Purana Feature) */}
          {activeTab === 'live_orders' && (
            <motion.div key="live_orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {liveOrders.length === 0 ? <Empty className="py-20"><EmptyTitle>No Live Orders</EmptyTitle></Empty> : (
                <div className="space-y-6">
                  {liveOrders.map((order: any, idx: number) => (
                    <Card key={idx} className="glass-strong border-white/10 overflow-hidden">
                      <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <div><h3 className="text-xl font-black text-white uppercase">{order.customer}</h3><p className="text-xs text-[#00FFFF] font-mono">{order.phone}</p></div>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><p className="text-[10px] uppercase font-black text-muted-foreground mb-4">Items</p>{order.items.map((it:any, i:number)=>(<div key={i} className="flex justify-between text-sm text-white/80"><span>{it.quantity}x {it.name}</span><span>₹{it.price*it.quantity}</span></div>))}</div>
                        <div className="space-y-4">
                          <div className="flex gap-3 text-white/80"><MapPin className="w-4 h-4 text-[#00FFFF]" /><p className="text-sm">{order.landmark}</p></div>
                          <div className="flex gap-2 pt-4 border-t border-white/10">
                            <Button onClick={()=>updateOrderStatus(order.id, 'In Transit')} className="flex-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-black">TRANSIT</Button>
                            <Button onClick={()=>updateOrderStatus(order.id, 'Delivered')} className="flex-1 bg-[#CCFF00] text-black text-xs font-black">DELIVERED</Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* PRODUCTS (Tera Purana Feature) */}
          {activeTab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center"><p className="text-muted-foreground font-mono">Inventory Management</p><Button onClick={() => {setEditingId(null); setFormData({name:'', price:'', mrp:'', category: categories[0]?.name || '', image:'', inStock: true}); setIsProductSheetOpen(true);}} className="bg-[#CCFF00] text-black font-black uppercase px-6 rounded-xl"><Plus className="mr-2 h-4 w-4" /> Add Product</Button></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((p: any) => (
                  <Card key={p.id} className="glass-strong border-white/10 overflow-hidden relative group">
                    <div className="h-40 bg-white/5 relative">
                      <img src={p.image} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 flex gap-2"><Button size="icon" onClick={()=>{setEditingId(p.id); setFormData({name:p.name, price:p.price.toString(), mrp:p.mrp.toString(), category:p.category, image:p.image, inStock:p.inStock}); setIsProductSheetOpen(true);}} className="h-8 w-8 bg-black/80 text-[#CCFF00]"><Edit className="w-4 h-4" /></Button><Button size="icon" onClick={()=>deleteProduct(p.id)} className="h-8 w-8 bg-black/80 text-red-500"><Trash2 className="w-4 h-4" /></Button></div>
                    </div>
                    <div className="p-4"><p className="text-[10px] text-[#00FFFF] font-black uppercase mb-1">{p.category}</p><h4 className="font-bold text-white text-sm truncate">{p.name}</h4><div className="flex justify-between items-center mt-3"><span className="font-mono font-black text-white">₹{p.price}</span><button onClick={()=>toggleStock(p.id)} className={`text-[10px] font-black px-2 py-0.5 rounded border ${p.inStock ? 'text-green-400 border-green-400/30' : 'text-red-400 border-red-400/30'}`}>{p.inStock ? 'IN STOCK' : 'OUT'}</button></div></div>
                  </Card>
                ))}
              </div>
              <Sheet open={isProductSheetOpen} onOpenChange={setIsProductSheetOpen}><SheetContent className="bg-black border-l border-[#00FFFF]/20 sm:max-w-md">
                <SheetHeader className="mt-8"><SheetTitle className="text-2xl font-black italic uppercase text-[#00FFFF]">{editingId ? 'Edit Product' : 'New Product'}</SheetTitle></SheetHeader>
                <form onSubmit={handleSaveProduct} className="space-y-6 mt-8 overflow-y-auto max-h-[80vh] pr-2">
                  <div className="space-y-4"><Label className="text-xs uppercase font-black text-[#00FFFF]">Product Image</Label><div className="relative h-40 rounded-xl border-2 border-dashed border-white/10 bg-white/5 flex items-center justify-center overflow-hidden"><input type="file" accept="image/*" onChange={(e)=>handleImgUpload(e, 'prod')} className="absolute inset-0 opacity-0 cursor-pointer" />{formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <UploadCloud className="text-white/20" />}</div><Input value={formData.image && !formData.image.startsWith('data:') ? formData.image : ''} onChange={(e)=>setFormData({...formData, image: e.target.value})} placeholder="URL Link" className="bg-black/50 border-white/10" /></div>
                  <div className="space-y-2"><Label>Product Name</Label><Input required value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="bg-white/5" /></div>
                  <div className="grid grid-cols-2 gap-4"><div><Label>Price</Label><Input type="number" required value={formData.price} onChange={(e)=>setFormData({...formData, price: e.target.value})} className="bg-white/5" /></div><div><Label>MRP</Label><Input type="number" required value={formData.mrp} onChange={(e)=>setFormData({...formData, mrp: e.target.value})} className="bg-white/5" /></div></div>
                  <div className="space-y-2"><Label>Category</Label><select value={formData.category} onChange={(e)=>setFormData({...formData, category: e.target.value})} className="w-full h-10 bg-white/5 border border-white/10 rounded-md px-3 text-white text-sm"><option value="" className="bg-black">Select Category</option>{categories.map((c:any)=>(<option key={c.id} value={c.name} className="bg-black">{c.name}</option>))}</select></div>
                  <Button type="submit" className="w-full h-14 bg-[#00FFFF] text-black font-black uppercase tracking-widest">SAVE TO INVENTORY</Button>
                </form>
              </SheetContent></Sheet>
            </motion.div>
          )}

          {/* SETTINGS (Tera Purana Logic - Min Order Limit included) */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-6">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <Card className="glass-strong border-white/10"><CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4"><Settings className="w-6 h-6 text-[#00FFFF]" /><h3 className="text-xl font-black uppercase text-white">Operations</h3></div>
                  <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={()=>setSettingsFormData({...settingsFormData, storeMode:'auto'})} className={`p-4 rounded-xl border text-left ${settingsFormData.storeMode==='auto'?'bg-[#00FFFF]/10 border-[#00FFFF] text-[#00FFFF]':'bg-white/5 border-white/10 text-white/50'}`}>Auto Timer</button>
                    <button type="button" onClick={()=>setSettingsFormData({...settingsFormData, storeMode:'manual'})} className={`p-4 rounded-xl border text-left ${settingsFormData.storeMode==='manual'?'bg-[#00FFFF]/10 border-[#00FFFF] text-[#00FFFF]':'bg-white/5 border-white/10 text-white/50'}`}>Manual</button>
                  </div>
                  <div className="space-y-2"><Label className="text-[#CCFF00]">Minimum Order Amount (₹)</Label><Input type="number" value={globalMinOrder} onChange={(e)=>setGlobalMinOrder(Number(e.target.value))} className="h-14 bg-black/50 border-white/20 text-white font-mono text-xl" /></div>
                  <div className="grid grid-cols-2 gap-6 pt-4">{settingsFormData.storeMode === 'auto' ? (<><div className="space-y-2"><Label>Open</Label><Input type="time" value={settingsFormData.openTime} onChange={(e)=>setSettingsFormData({...settingsFormData, openTime: e.target.value})} className="bg-black text-[#00FFFF] h-12" /></div><div className="space-y-2"><Label>Close</Label><Input type="time" value={settingsFormData.closeTime} onChange={(e)=>setSettingsFormData({...settingsFormData, closeTime: e.target.value})} className="bg-black text-[#00FFFF] h-12" /></div></>) : (<div className="col-span-2 flex gap-4"><Button type="button" onClick={()=>setSettingsFormData({...settingsFormData, isStoreOpen: true})} className={`flex-1 h-14 ${settingsFormData.isStoreOpen?'bg-green-500':'bg-white/5'}`}>OPEN</Button><Button type="button" onClick={()=>setSettingsFormData({...settingsFormData, isStoreOpen: false})} className={`flex-1 h-14 ${!settingsFormData.isStoreOpen?'bg-red-500':'bg-white/5'}`}>CLOSED</Button></div>)}</div>
                  <Button type="submit" className="w-full h-14 bg-[#00FFFF] text-black font-black uppercase tracking-widest mt-6">SAVE SETTINGS</Button>
                </CardContent></Card>
              </form>
            </motion.div>
          )}

          {/* Baki Analytics, History, Customers, Messages etc. same logic se active hain... */}

        </AnimatePresence>
      </main>
    </div>
  )
}
