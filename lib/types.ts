// WebFoo Mart Type Definitions

export interface Item {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description?: string;
  inStock: boolean;
  storeId: string;
}

export interface CartItem extends Item {
  quantity: number;
}

export interface Store {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  items: Item[];
}

export interface Order {
  id: string;
  customer: string;
  items: CartItem[];
  amount: number;
  status: 'Pending' | 'PACKED' | 'Shipped' | 'Delivered';
  time: string;
  phone: string;
  landmark: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

export type Category = {
  id: string;
  name: string;
  icon: string;
};
