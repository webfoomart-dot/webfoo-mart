import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

export interface Product { 
  id: string; 
  name: string; 
  price: number; 
  mrp: number; 
  cost_price?: number; 
  category: string; 
  image: string; 
  inStock: boolean;
  description?: string;
  galleryImages?: string[];
  foodPref?: 'veg' | 'non-veg' | 'none';
}

export interface AppNotification { id: string; phone: string; message: string; time: string; read: boolean }
export interface PromoCode { id: string; code: string; type: 'flat' | 'percent'; value: number; minOrder: number; isActive: boolean }

export interface DeliveryZone { id: string | number; areaName: string; fee: number; isActive: boolean }

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
  // Footer Profile Fields
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerPhoto: string;
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
  addNotification: (phone: string, message: string) => Promise<void>
  markNotificationRead: (id: string) => Promise<void>
  promoCodes: PromoCode[]
  addPromoCode: (promo: Omit<PromoCode, 'id'>) => void
  togglePromoStatus: (id: string) => void
  deletePromo: (id: string) => void
  user: { phone: string, name: string } | null
  login: (phone: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (phone: string, name: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  
  // 🔥 FIX: Added startTime and endTime here 🔥
  categories: { id: string, name: string, sortOrder?: number, image?: string, subcategories?: string[], isActive?: boolean, startTime?: string, endTime?: string }[]
  addCategory: (catData: any) => Promise<void>
  updateCategory: (id: string, catData: any) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  reorderCategory: (id: string, direction: 'up' | 'down') => Promise<void>
  
  deliveryZones: DeliveryZone[]
  addDeliveryZone: (zone: Omit<DeliveryZone, 'id'>) => Promise<void>
  updateDeliveryZone: (id: string | number, zone: Partial<DeliveryZone>) => Promise<void>
  deleteDeliveryZone: (id: string | number) => Promise<void>
  toggleDeliveryZoneStatus: (id: string | number) => Promise<void>
}

const defaultProducts: Product[] = [
  { id: '1', name: 'Cyberpunk Energy Drink', price: 99, mrp: 149, cost_price: 50, category: 'Drinks', image: '/placeholder.jpg', inStock: true, description: '', galleryImages: [], foodPref: 'veg' }
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
            minOrderAmount: data.min_order_amount || 0,
            ownerName: data.owner_name || 'Vineet Kumar',
            ownerPhone: data.owner_phone || '',
            ownerEmail: data.owner_email || '',
            ownerPhoto: data.owner_photo || ''
          }})
        }
      },
      
      updateStoreConfig: async (newConfig) => {
        set((state) => ({ storeConfig: state.storeConfig ? { ...state.storeConfig, ...newConfig } : null }))
        
        const updatePayload: any = { updated_at: new Date() }
        if (newConfig.isStoreOpen !== undefined) updatePayload.is_store_open = newConfig.isStoreOpen
        if (newConfig.bannerTextOpen !== undefined) updatePayload.banner_text_open = newConfig.bannerTextOpen
        if (newConfig.bannerImageUrlOpen !== undefined) updatePayload.banner_image_url_open = newConfig.bannerImageUrlOpen
        if (newConfig.bannerTextClosed !== undefined) updatePayload.banner_text_closed = newConfig.bannerTextClosed
        if (newConfig.bannerImageUrlClosed !== undefined) updatePayload.banner_image_url_closed = newConfig.bannerImageUrlClosed
        if (newConfig.storeMode !== undefined) updatePayload.store_mode = newConfig.storeMode
        if (newConfig.openTime !== undefined) updatePayload.open_time = newConfig.openTime
        if (newConfig.closeTime !== undefined) updatePayload.close_time = newConfig.closeTime
        if (newConfig.minOrderAmount !== undefined) updatePayload.min_order_amount = newConfig.minOrderAmount
        
        if (newConfig.ownerName !== undefined) updatePayload.owner_name = newConfig.ownerName
        if (newConfig.ownerPhone !== undefined) updatePayload.owner_phone = newConfig.ownerPhone
        if (newConfig.ownerEmail !== undefined) updatePayload.owner_email = newConfig.ownerEmail
        if (newConfig.ownerPhoto !== undefined) updatePayload.owner_photo = newConfig.ownerPhoto

        await supabase.from('webfoo_configs').update(updatePayload).eq('id', 1)
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
          set({ products: prods.map(p => ({ 
            id: p.id, name: p.name, price: p.price, mrp: p.mrp, cost_price: p.cost_price || 0, category: p.category, image: p.image, inStock: p.in_stock,
            description: p.description || '', galleryImages: p.gallery_images || [], foodPref: p.food_pref || 'none', subcategory: p.subcategory || ''
          })) })
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

        // 🔥 FIX: Now fetching startTime and endTime 🔥
        const { data: cats } = await supabase.from('webfoo_categories').select('*').order('sort_order', { ascending: true })
        if (cats) set({ categories: cats.map(c => ({ 
          id: c.id, 
          name: c.name, 
          sortOrder: c.sort_order || 0, 
          image: c.image, 
          subcategories: c.subcategories || [], 
          isActive: c.is_active !== false,
          startTime: c.startTime || null,
          endTime: c.endTime || null
        })) })

        const { data: notifs } = await supabase.from('user_notifications').select('*').order('created_at', { ascending: false })
        if (notifs) {
          set({ notifications: notifs.map(n => ({ id: String(n.id), phone: n.phone, message: n.message, time: new Date(n.created_at).toLocaleString(), read: n.is_read })) })
        }

        const { data: zones } = await supabase.from('delivery_zones').select('*').order('created_at', { ascending: true })
        if (zones) {
          set({ deliveryZones: zones.map(z => ({ id: z.id, areaName: z.area_name, fee: z.fee, isActive: z.is_active })) })
        }
      },

      products: defaultProducts,
      addProduct: async (prod) => {
        const tempId = Date.now().toString()
        set((state) => ({ products: [{ ...prod, id: tempId }, ...state.products] })) 
        
        const { data } = await supabase.from('products').insert({ 
          name: prod.name, price: prod.price, mrp: prod.mrp, cost_price: prod.cost_price || 0, category: prod.category, image: prod.image, in_stock: prod.inStock,
          description: prod.description || '', gallery_images: prod.galleryImages || [], food_pref: prod.foodPref || 'none', subcategory: (prod as any).subcategory || ''
        }).select().single()
        
        if (data) set((state) => ({ products: state.products.map(p => p.id === tempId ? { ...p, id: data.id } : p) })) 
      },
      updateProduct: async (id, updatedProd) => {
        set((state) => ({ products: state.products.map(p => p.id === id ? { ...p, ...updatedProd } : p) }))
        
        const updatePayload: any = {}
        if (updatedProd.name !== undefined) updatePayload.name = updatedProd.name
        if (updatedProd.price !== undefined) updatePayload.price = updatedProd.price
        if (updatedProd.mrp !== undefined) updatePayload.mrp = updatedProd.mrp
        if (updatedProd.cost_price !== undefined) updatePayload.cost_price = updatedProd.cost_price
        if (updatedProd.category !== undefined) updatePayload.category = updatedProd.category
        if ((updatedProd as any).subcategory !== undefined) updatePayload.subcategory = (updatedProd as any).subcategory
        if (updatedProd.image !== undefined) updatePayload.image = updatedProd.image
        if (updatedProd.inStock !== undefined) updatePayload.in_stock = updatedProd.inStock
        if (updatedProd.description !== undefined) updatePayload.description = updatedProd.description
        if (updatedProd.galleryImages !== undefined) updatePayload.gallery_images = updatedProd.galleryImages
        if (updatedProd.foodPref !== undefined) updatePayload.food_pref = updatedProd.foodPref

        await supabase.from('products').update(updatePayload).eq('id', id)
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
      addNotification: async (phone, message) => {
        const tempId = Date.now().toString()
        const time = new Date().toLocaleString()
        set((state) => ({ notifications: [{ id: tempId, phone, message, time, read: false }, ...state.notifications] }))
        const { data } = await supabase.from('user_notifications').insert({ phone, message, is_read: false }).select().single()
        if (data) set((state) => ({ notifications: state.notifications.map(n => n.id === tempId ? { ...n, id: String(data.id) } : n) }))
      },
      markNotificationRead: async (id) => {
        set((state) => ({ notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n) }))
        await supabase.from('user_notifications').update({ is_read: true }).eq('id', parseInt(id))
      },

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
      addCategory: async (catData) => {
        const tempId = Date.now().toString();
        const current = get().categories;
        const sOrder = current.length > 0 ? Math.max(...current.map(c => c.sortOrder || 0)) + 1 : 0;
        
        // Ensure subcategories defaults to empty array on new add
        set((state) => ({ categories: [...state.categories, { id: tempId, name: catData.name, image: catData.image, sortOrder: sOrder, subcategories: catData.subcategories || [], isActive: true, startTime: catData.startTime || null, endTime: catData.endTime || null }] }))
        
        const { data, error } = await supabase.from('webfoo_categories')
          .insert({ name: catData.name, image: catData.image, sort_order: sOrder, subcategories: catData.subcategories || [], startTime: catData.startTime || null, endTime: catData.endTime || null })
          .select().single()
        
        if (error) { console.error(error); return; }
        if (data) set((state) => ({ categories: state.categories.map(c => c.id === tempId ? { ...c, id: data.id } : c) }))
      },
      
      // 🔥 FIX: Now sending startTime and endTime to DB 🔥
      updateCategory: async (id, catData) => {
        set((state) => ({ categories: state.categories.map(c => c.id === id ? { ...c, ...catData } : c) }))
        
        const updatePayload: any = {}
        if (catData.name !== undefined) updatePayload.name = catData.name
        if (catData.image !== undefined) updatePayload.image = catData.image
        if (catData.subcategories !== undefined) updatePayload.subcategories = catData.subcategories
        if (catData.isActive !== undefined) updatePayload.is_active = catData.isActive
        if (catData.startTime !== undefined) updatePayload.startTime = catData.startTime
        if (catData.endTime !== undefined) updatePayload.endTime = catData.endTime

        await supabase.from('webfoo_categories').update(updatePayload).eq('id', id)
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

      deliveryZones: [],
      addDeliveryZone: async (zone) => {
        const tempId = Date.now().toString()
        set((state) => ({ deliveryZones: [...state.deliveryZones, { ...zone, id: tempId }] }))
        const { data } = await supabase.from('delivery_zones').insert({ area_name: zone.areaName, fee: zone.fee, is_active: zone.isActive }).select().single()
        if (data) set((state) => ({ deliveryZones: state.deliveryZones.map(z => z.id === tempId ? { id: data.id, areaName: data.area_name, fee: data.fee, isActive: data.is_active } : z) }))
      },
      updateDeliveryZone: async (id, zone) => {
        set((state) => ({ deliveryZones: state.deliveryZones.map(z => z.id === id ? { ...z, ...zone } : z) }))
        const updateData: any = {}
        if (zone.areaName !== undefined) updateData.area_name = zone.areaName
        if (zone.fee !== undefined) updateData.fee = zone.fee
        if (zone.isActive !== undefined) updateData.is_active = zone.isActive
        await supabase.from('delivery_zones').update(updateData).eq('id', id)
      },
      deleteDeliveryZone: async (id) => {
        set((state) => ({ deliveryZones: state.deliveryZones.filter(z => z.id !== id) }))
        await supabase.from('delivery_zones').delete().eq('id', id)
      },
      toggleDeliveryZoneStatus: async (id) => {
        const zone = get().deliveryZones.find(z => z.id === id)
        if (!zone) return
        set((state) => ({ deliveryZones: state.deliveryZones.map(z => z.id === id ? { ...z, isActive: !z.isActive } : z) }))
        await supabase.from('delivery_zones').update({ is_active: !zone.isActive }).eq('id', id)
      },

    }),
    { name: 'webfoo-storage' }
  )
)

if (typeof window !== 'undefined') {
  useAppStore.getState().fetchStoreConfig() 
  useAppStore.getState().fetchData()
}
