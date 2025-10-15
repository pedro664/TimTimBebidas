import { CartItem, User, Order, ContactMessage } from "@/types";
import { handleStorageError, isQuotaExceededError } from "@/lib/errorHandling";
import { toast } from "sonner";

/**
 * ⚠️ DEPRECATED - This service is no longer used for cart management
 * 
 * Cart functionality has been migrated to sessionService (src/services/sessionService.ts)
 * to provide better session isolation and prevent data sharing between different users
 * on the same device.
 * 
 * Migration Details:
 * - Cart data now uses sessionStorage instead of localStorage (Requirement 3.1)
 * - Each browser session has a unique ID to isolate cart data (Requirement 2.1)
 * - Automatic migration from localStorage to sessionStorage on first load (Requirement 3.2)
 * - Old localStorage data is cleaned up after migration (Requirement 3.3)
 * 
 * This file is kept for reference and for non-cart related functionality
 * (users, orders, contact messages) which still use localStorage.
 * 
 * For cart operations, use:
 * - sessionService.saveCart() instead of storageService.saveCart()
 * - sessionService.getCart() instead of storageService.getCart()
 * - sessionService.clearCart() instead of storageService.clearCart()
 * 
 * See: src/services/sessionService.ts
 * See: src/lib/migration.ts for migration logic
 */

// Storage keys
const STORAGE_KEYS = {
  CART: "timtim_cart", // ⚠️ DEPRECATED - Use sessionService for cart
  USER: "timtim_user",
  USERS: "timtim_users",
  ORDERS: "timtim_orders",
  CONTACT_MESSAGES: "timtim_contact_messages",
} as const;

/**
 * Centralized localStorage service for managing all data persistence
 * with enhanced error handling and recovery mechanisms
 * 
 * ⚠️ NOTE: Cart methods are deprecated. Use sessionService instead.
 */
class LocalStorageService {
  /**
   * Generic method to safely get data from localStorage
   */
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      handleStorageError(error, `ler ${key}`);
      return defaultValue;
    }
  }

  /**
   * Generic method to safely set data in localStorage with quota handling
   */
  private setItem<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      
      // Check if we're approaching quota limit
      const estimatedSize = new Blob([serialized]).size;
      const currentSize = this.getStorageSize();
      const maxSize = 5 * 1024 * 1024; // 5MB typical limit
      
      if (currentSize + estimatedSize > maxSize * 0.9) {
        console.warn('Approaching localStorage quota limit');
        toast.warning('Espaço de armazenamento quase cheio', {
          description: 'Considere limpar dados antigos.',
        });
      }
      
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
      
      // Handle quota exceeded error with recovery
      if (isQuotaExceededError(error)) {
        console.error("LocalStorage quota exceeded - attempting recovery");
        
        // Try to free up space by clearing old data
        const recovered = this.attemptQuotaRecovery(key, value);
        if (recovered) {
          toast.success('Espaço liberado com sucesso');
          return true;
        }
        
        handleStorageError(error, `salvar ${key}`);
      } else {
        handleStorageError(error, `salvar ${key}`);
      }
      
      return false;
    }
  }

  /**
   * Attempt to recover from quota exceeded error
   */
  private attemptQuotaRecovery<T>(key: string, value: T): boolean {
    try {
      // Strategy 1: Clear old contact messages (least critical data)
      const messages = this.getContactMessages();
      if (messages.length > 10) {
        const recentMessages = messages.slice(-10);
        this.setItemForce(STORAGE_KEYS.CONTACT_MESSAGES, recentMessages);
        
        // Try again
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch {
          // Continue to next strategy
        }
      }
      
      // Strategy 2: Clear old orders (keep last 20)
      const orders = this.getAllOrders();
      if (orders.length > 20) {
        const recentOrders = orders
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 20);
        this.setItemForce(STORAGE_KEYS.ORDERS, recentOrders);
        
        // Try again
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch {
          // Recovery failed
        }
      }
      
      return false;
    } catch (error) {
      console.error('Recovery attempt failed:', error);
      return false;
    }
  }

  /**
   * Force set item without error handling (used in recovery)
   */
  private setItemForce<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Force set failed for ${key}:`, error);
    }
  }

  /**
   * Generic method to remove data from localStorage
   */
  private removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      handleStorageError(error, `remover ${key}`);
    }
  }

  // ==================== CART METHODS ====================
  // ⚠️ DEPRECATED - These methods are no longer used
  // Use sessionService from src/services/sessionService.ts instead

  /**
   * @deprecated Use sessionService.getCart() instead
   * Get cart items from localStorage
   * 
   * This method is deprecated as cart functionality has been migrated
   * to sessionStorage for better session isolation (Requirement 3.1).
   */
  getCart(): CartItem[] {
    console.warn('⚠️ DEPRECATED: storageService.getCart() is deprecated. Use sessionService.getCart() instead.');
    return this.getItem<CartItem[]>(STORAGE_KEYS.CART, []);
  }

  /**
   * @deprecated Use sessionService.saveCart() instead
   * Save cart items to localStorage
   * 
   * This method is deprecated as cart functionality has been migrated
   * to sessionStorage for better session isolation (Requirement 3.1).
   */
  saveCart(items: CartItem[]): boolean {
    console.warn('⚠️ DEPRECATED: storageService.saveCart() is deprecated. Use sessionService.saveCart() instead.');
    return this.setItem(STORAGE_KEYS.CART, items);
  }

  /**
   * @deprecated Use sessionService.clearCart() instead
   * Clear cart from localStorage
   * 
   * This method is deprecated as cart functionality has been migrated
   * to sessionStorage for better session isolation (Requirement 3.1).
   */
  clearCart(): void {
    console.warn('⚠️ DEPRECATED: storageService.clearCart() is deprecated. Use sessionService.clearCart() instead.');
    this.removeItem(STORAGE_KEYS.CART);
  }

  // ==================== AUTH METHODS ====================

  /**
   * Get current authenticated user
   */
  getUser(): User | null {
    return this.getItem<User | null>(STORAGE_KEYS.USER, null);
  }

  /**
   * Save current authenticated user
   */
  saveUser(user: User): boolean {
    return this.setItem(STORAGE_KEYS.USER, user);
  }

  /**
   * Remove current authenticated user (logout)
   */
  removeUser(): void {
    this.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Get all registered users
   */
  getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, []);
  }

  /**
   * Save all registered users
   */
  saveUsers(users: User[]): boolean {
    return this.setItem(STORAGE_KEYS.USERS, users);
  }

  /**
   * Check if email already exists
   */
  emailExists(email: string): boolean {
    const users = this.getUsers();
    return users.some((user) => user.email === email);
  }

  // ==================== ORDER METHODS ====================

  /**
   * Get all orders
   */
  getAllOrders(): Order[] {
    return this.getItem<Order[]>(STORAGE_KEYS.ORDERS, []);
  }

  /**
   * Get orders for a specific user
   */
  getOrders(userId: string): Order[] {
    const allOrders = this.getAllOrders();
    return allOrders.filter((order) => order.userId === userId);
  }

  /**
   * Save a new order
   */
  saveOrder(order: Order): boolean {
    const orders = this.getAllOrders();
    orders.push(order);
    return this.setItem(STORAGE_KEYS.ORDERS, orders);
  }

  /**
   * Get order by ID
   */
  getOrderById(orderId: string): Order | undefined {
    const orders = this.getAllOrders();
    return orders.find((order) => order.id === orderId);
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, status: Order["status"]): boolean {
    const orders = this.getAllOrders();
    const orderIndex = orders.findIndex((order) => order.id === orderId);
    
    if (orderIndex === -1) return false;
    
    orders[orderIndex] = {
      ...orders[orderIndex],
      status,
      updatedAt: new Date().toISOString(),
    };
    
    return this.setItem(STORAGE_KEYS.ORDERS, orders);
  }

  // ==================== CONTACT MESSAGES METHODS ====================

  /**
   * Get all contact messages
   */
  getContactMessages(): ContactMessage[] {
    return this.getItem<ContactMessage[]>(STORAGE_KEYS.CONTACT_MESSAGES, []);
  }

  /**
   * Save a new contact message
   */
  saveContactMessage(message: ContactMessage): boolean {
    const messages = this.getContactMessages();
    messages.push(message);
    return this.setItem(STORAGE_KEYS.CONTACT_MESSAGES, messages);
  }

  /**
   * Mark contact message as read
   */
  markMessageAsRead(messageId: string): boolean {
    const messages = this.getContactMessages();
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    
    if (messageIndex === -1) return false;
    
    messages[messageIndex] = {
      ...messages[messageIndex],
      read: true,
    };
    
    return this.setItem(STORAGE_KEYS.CONTACT_MESSAGES, messages);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Clear all application data from localStorage
   */
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      this.removeItem(key);
    });
  }

  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const test = "__localStorage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get approximate localStorage usage
   */
  getStorageSize(): number {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }
}

// Export singleton instance
export const storageService = new LocalStorageService();
