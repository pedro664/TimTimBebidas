// Shared TypeScript types for the application

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Only for localStorage, not exposed in context
  phone?: string;
  address?: Address;
  createdAt: string;
}

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  country: string;
  region?: string;
  price: number;
  image: string;
  description: string;
  alcoholContent: string;
  volume: string;
  tastingNotes: string[];
  pairing: string[];
  grapes?: string[];
  stock: number; // Available stock quantity
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: Address;
  customerInfo: {
    name: string;
    email?: string;
    phone: string;
  };
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

// Admin types for administrative panel
export interface Admin {
  id: string;
  email: string;
  name: string;
}

export interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  featuredProducts: number;
  lowStockProducts: number;
}
