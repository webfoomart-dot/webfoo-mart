import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

export interface Product { id: string; name: string; price: number; mrp: number; category: string; image: string; inStock: boolean }
export interface AppNotification { id: string; phone: string; message: string; time: string; read: boolean }
export interface PromoCode { id: string; code: string; type: 'flat' | 'percent'; value: number; minOrder: number; isActive: boolean }

export interface StoreConfig {
  id: number;
  isStoreOpen: boolean;
  bannerTextOpen: string;
  bannerImageUrlOpen: string | null;
  bannerTextClosed: string;
  bannerImageUrlClosed: string | null;
  storeMode: 'auto' | 'manual'; 
  openTime: string; 
  closeTime: string; 
  minOrderAmount: number;
}

interface AppState {
  fetchData: () => Promise<void>
  storeConfig: StoreConfig | null
  fetchStoreConfig: () => Promise<void>
  updateStoreConfig: (config: Partial<Omit<StoreConfig, 'id'>>) => Promise<void>
  checkIfStoreOpen: () => boolean
  storeClosedAlert: boolean;
  triggerStoreClosedAlert: () => void;
  products: Product[]
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  toggleStock: (id: string) => void
  cart: any[]
  addToCart: (item: any) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getCartCount: () => number
  getCartTotal: () => number
  orders: any[]
  addOrder: (order: any) => void
  updateOrderStatus: (orderId: string | number, status: string) => void
  customerMeta: Record<string, any>
  updateCustomerMeta: (phone: string, meta: any) => void
  notifications: AppNotification[]
  addNotification: (phone: string, message: string) => void
  markNotificationRead: (id: string) => void
  promoCodes: PromoCode[]
  addPromoCode: (promo: Omit<PromoCode, 'id'>) => void
  togglePromoStatus: (id: string) => void
  deletePromo: (id: string) => void
  user: { phone: string, name: string } | null
  login: (phone: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (phone: string, name: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  categories: { id: string, name: string, sortOrder?: number, image?: string }[]
  addCategory: (catData: {name: string, image: string}) => Promise<void>
  updateCategory: (id: string, catData: {name: string, image: string}) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  reorderCategory: (id: string, direction: 'up' | 'down') => Promise<void>
}

const defaultProducts: Product[] = [
  { id: '1', name: 'Cyberpunk Energy Drink', price: 99, mrp: 149, category: 'Drinks', image: '/placeholder.jpg', inStock: true }
]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      storeConfig: null,
      storeClosedAlert: false,
      triggerStoreClosedAlert: () => {
        set({ storeClosedAlert: true })
        setTimeout(() => set({ storeClosedAlert: false }), 3000)
      },

      fetchStoreConfig: async () => {
        const { data } = await supabase.from('webfoo_configs').select('*').eq('id', 1).single()
        if (data) {
          set({ storeConfig: {
            id: data.id,
            isStoreOpen: data.is_store_open,
            bannerTextOpen: data.banner_text_open,
            bannerImageUrlOpen: data.banner_image_url_open,
            bannerTextClosed: data.banner_text_closed,
            bannerImageUrlClosed: data.banner_image_url_closed,
            storeMode: data.store_mode || 'manual',
            openTime: data.open_time || '08:00',
            closeTime: data.close_time || '22:00',
            minOrderAmount: data.min_order_amount || 0
          }})
        }
      },
      
      updateStoreConfig: async (newConfig) => {
        set((state) => ({ storeConfig: state.storeConfig ? { ...state.storeConfig, ...newConfig } : null }))
        await supabase.from('webfoo_configs').update({
          is_store_open: newConfig.isStoreOpen,
          banner_text_open: newConfig.bannerTextOpen,
          banner_image_url_open: newConfig.bannerImageUrlOpen,
          banner_text_closed: newConfig.bannerTextClosed,
          banner_image_url_closed: newConfig.bannerImageUrlClosed,
          store_mode: newConfig.storeMode,
          open_time: newConfig.openTime,
          close_time: newConfig.closeTime,
          min_order_amount: newConfig.minOrderAmount,
          updated_at: new Date()
        }).eq('id', 1)
      },

      checkIfStoreOpen: () => {
        const config = get().storeConfig;
        if (!config) return true; 
        if (config.storeMode === 'manual') return config.isStoreOpen;
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [openH, openM] = (config.openTime || '08:00').split(':').map(Number);
        const openMinutes = openH * 60 + openM;
        const [closeH, closeM] = (config.closeTime || '22:00').split(':').map(Number);
        const closeMinutes = closeH * 60 + closeM;
        if (closeMinutes < openMinutes) return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
        return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
      },

      fetchData: async () => {
        const { data: prods } = await supabase.from('products').select('*').order('created_at', { ascending: false })
        if (prods && prods.length > 0) {
          set({ products: prods.map(p => ({ id: p.id, name: p.name, price: p.price, mrp: p.mrp, category: p.category, image: p.image, inStock: p.in_stock })) })
        } else {
          set({ products: defaultProducts }) 
        }

        const { data: promos } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false })
        if (promos) set({ promoCodes: promos.map(p => ({ id: p.id, code: p.code, type: p.type, value: p.value, minOrder: p.min_order, isActive: p.is_active })) })

        const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: true })
        if (ords) {
          set({ orders: ords.map(o => {
            const d = new Date(o.created_at);
            const offset = d.getTimezoneOffset() * 60000;
            const localDate = new Date(d.getTime() - offset).toISOString().split('T')[0];
            return { id: o.id, customer: o.customer_name, phone: o.phone, amount: o.amount, subtotal: o.subtotal, discount: o.discount, promoCode: o.promo_code, status: o.status, landmark: o.landmark, items: o.items, time: d.toLocaleTimeString(), date: localDate }
          }) })
        }

        const { data: custs } = await supabase.from('customers').select('*')
        if (custs) {
          const metaMap: Record<string, any> = {}
          custs.forEach(c => metaMap[c.phone] = { isVip: c.is_vip, isBlocked: c.is_blocked, name: c.name, phone: c.phone, address: c.address })
          set({ customerMeta: metaMap })
        }

        const { data: cats } = await supabase.from('webfoo_categories').select('*').order('sort_order', { ascending: true })
        if (cats) set({ categories: cats.map(c => ({ id: c.id, name: c.name, sortOrder: c.sort_order || 0, image: c.image })) })
      },

      products: defaultProducts,
      addProduct: async (prod) => {
        const tempId = Date.now().toString()
        set((state) => ({ products: [{ ...prod, id: tempId }, ...state.products] })) 
        const { data } = await supabase.from('products').insert({ name: prod.name, price: prod.price, mrp: prod.mrp, category: prod.category, image: prod.image, in_stock: prod.inStock }).select().single()
        if (data) set((state) => ({ products: state.products.map(p => p.id === tempId ? { ...p, id: data.id } : p) })) 
      },
      updateProduct: async (id, updatedProd) => {
        set((state) => ({ products: state.products.map(p => p.id === id ? { ...p, ...updatedProd } : p) }))
        await supabase.from('products').update({ name: updatedProd.name, price: updatedProd.price, mrp: updatedProd.mrp, category: updatedProd.category, image: updatedProd.image, in_stock: updatedProd.inStock }).eq('id', id)
      },
      deleteProduct: async (id) => {
        set((state) => ({ products: state.products.filter(p => p.id !== id) }))
        await supabase.from('products').delete().eq('id', id)
      },
      toggleStock: async (id) => {
        const prod = get().products.find(p => p.id === id)
        if (!prod) return
        set((state) => ({ products: state.products.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p) }))
        await supabase.from('products').update({ in_stock: !prod.inStock }).eq('id', id)
      },

      cart: [],
      addToCart: (item) => set((state) => {
        const sid = String(item.id)
        const exists = state.cart.find((i) => String(i.id) === sid)
        if (exists) return { cart: state.cart.map((i) => String(i.id) === sid ? { ...i, quantity: i.quantity + 1 } : i) }
        return { cart: [...state.cart, { ...item, quantity: 1 }] }
      }),
      removeFromCart: (id) => set((state) => ({ cart: state.cart.filter((i) => String(i.id) !== String(id)) })),
      updateQuantity: (id, quantity) => set((state) => ({ 
        cart: quantity <= 0 
          ? state.cart.filter((i) => String(i.id) !== String(id)) 
          : state.cart.map((i) => String(i.id) === String(id) ? { ...i, quantity } : i) 
      })),
      clearCart: () => set({ cart: [] }),
      getCartCount: () => get().cart.reduce((total, item) => total + item.quantity, 0),
      getCartTotal: () => get().cart.reduce((total, item) => total + (item.price * item.quantity), 0),
      
      orders: [],
      addOrder: async (order) => {
        const tempId = Date.now().toString();
        const d = new Date();
        const offset = d.getTimezoneOffset() * 60000;
        const localDate = new Date(d.getTime() - offset).toISOString().split('T')[0];
        set((state) => ({ orders: [...state.orders, { ...order, id: tempId, date: localDate }] }))
        const { data } = await supabase.from('orders').insert({
          customer_name: order.customer, phone: order.phone, amount: order.amount, subtotal: order.subtotal || order.amount, discount: order.discount || 0, promo_code: order.promoCode || null, status: order.status, landmark: order.landmark, items: order.items
        }).select().single()
        if (data) set((state) => ({ orders: state.orders.map(o => o.id === tempId ? { ...o, id: data.id } : o) }))
        await supabase.from('customers').upsert({ phone: order.phone, name: order.customer, address: order.landmark }, { onConflict: 'phone' })
      },
      updateOrderStatus: async (orderId, status) => {
        set((state) => {
          const idx = typeof orderId === 'number' ? orderId : state.orders.findIndex(o => o.id === orderId)
          if (idx === -1) return state
          const newOrders = [...state.orders]; newOrders[idx] = { ...newOrders[idx], status }
          return { orders: newOrders }
        })
        await supabase.from('orders').update({ status }).eq('id', orderId)
      },
      
      customerMeta: {},
      updateCustomerMeta: async (phone, meta) => {
        set((state) => ({ customerMeta: { ...state.customerMeta, [phone]: { ...(state.customerMeta[phone] || {}), ...meta } } }))
        await supabase.from('customers').update({ is_vip: meta.isVip, is_blocked: meta.isBlocked }).eq('phone', phone)
      },

      notifications: [],
      addNotification: (phone, message) => set((state) => ({ notifications: [{ id: Date.now().toString(), phone, message, time: new Date().toLocaleString(), read: false }, ...state.notifications] })),
      markNotificationRead: (id) => set((state) => ({ notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),

      promoCodes: [],
      addPromoCode: async (promo) => {
        const tempId = Date.now().toString()
        set((state) => ({ promoCodes: [{ ...promo, id: tempId }, ...(state.promoCodes || [])] }))
        const { data } = await supabase.from('promo_codes').insert({ code: promo.code, type: promo.type, value: promo.value, min_order: promo.minOrder, is_active: promo.isActive }).select().single()
        if (data) set((state) => ({ promoCodes: state.promoCodes.map(p => p.id === tempId ? { ...p, id: data.id } : p) }))
      },
      togglePromoStatus: async (id) => {
        const promo = get().promoCodes.find(p => p.id === id)
        if (!promo) return
        set((state) => ({ promoCodes: state.promoCodes.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p) }))
        await supabase.from('promo_codes').update({ is_active: !promo.isActive }).eq('id', id)
      },
      deletePromo: async (id) => {
        set((state) => ({ promoCodes: state.promoCodes.filter(p => p.id !== id) }))
        await supabase.from('promo_codes').delete().eq('id', id)
      },

      user: null,
      login: async (phone, password) => {
        const { data, error } = await supabase.from('customers').select('*').eq('phone', phone).single()
        if (error || !data) return { success: false, message: 'Number not found!' }
        if (data.password !== password) return { success: false, message: 'Wrong password!' }
        set({ user: { phone: data.phone, name: data.name } })
        return { success: true, message: 'Login successful!' }
      },
      register: async (phone, name, password) => {
        const { error } = await supabase.from('customers').insert({ phone, name, password })
        if (error) return { success: false, message: 'Registration failed.' }
        set({ user: { phone, name } })
        return { success: true, message: 'Account created!' }
      },
      logout: () => set({ user: null, cart: [] }),

      categories: [],
      // 🔥 TITANIUM FIXED: Full Data insertion
      addCategory: async (catData) => {
        const tempId = Date.now().toString();
        const current = get().categories;
        const sOrder = current.length > 0 ? Math.max(...current.map(c => c.sortOrder || 0)) + 1 : 0;
        set((state) => ({ categories: [...state.categories, { id: tempId, name: catData.name, image: catData.image, sortOrder: sOrder }] }))
        
        const { data, error } = await supabase.from('webfoo_categories')
          .insert({ name: catData.name, image: catData.image, sort_order: sOrder })
          .select().single()
        
        if (error) { console.error(error); return; }
        if (data) set((state) => ({ categories: state.categories.map(c => c.id === tempId ? { ...c, id: data.id } : c) }))
      },
      updateCategory: async (id, catData) => {
        set((state) => ({ categories: state.categories.map(c => c.id === id ? { ...c, name: catData.name, image: catData.image } : c) }))
        await supabase.from('webfoo_categories').update({ name: catData.name, image: catData.image }).eq('id', id)
      },
      deleteCategory: async (id) => {
        set((state) => ({ categories: state.categories.filter(c => c.id !== id) }))
        await supabase.from('webfoo_categories').delete().eq('id', id)
      },
      reorderCategory: async (id, direction) => {
        const cats = [...get().categories];
        const idx = cats.findIndex(c => c.id === id);
        if (idx === -1) return;
        if (direction === 'up' && idx === 0) return;
        if (direction === 'down' && idx === cats.length - 1) return;
        const sIdx = direction === 'up' ? idx - 1 : idx + 1;
        const temp = cats[idx]; cats[idx] = cats[sIdx]; cats[sIdx] = temp;
        const updated = cats.map((c, i) => ({ ...c, sortOrder: i }));
        set({ categories: updated });
        for (const c of updated) { await supabase.from('webfoo_categories').update({ sort_order: c.sortOrder }).eq('id', c.id); }
      },
    }),
    { name: 'webfoo-storage' }
  )
)

if (typeof window !== 'undefined') {
  useAppStore.getState().fetchStoreConfig() 
  useAppStore.getState().fetchData()
}
