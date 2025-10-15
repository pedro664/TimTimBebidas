import { Admin, AdminStats, Product, Order } from "@/types";
import { handleStorageError } from "@/lib/errorHandling";
import { storageService } from "./localStorage";

// Storage keys for admin
const ADMIN_STORAGE_KEYS = {
  ADMIN_SESSION: "timtim_admin_session",
  PRODUCTS: "timtim_products",
} as const;

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  email: "admin@timtimbebidas.com",
  // Password: "admin123" - hashed using simple hash for demo purposes
  // In production, use bcrypt or similar
  passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // SHA-256 of "admin123"
  name: "Administrador",
  id: "admin-001",
} as const;

/**
 * Simple hash function for password validation
 * In production, use bcrypt or similar secure hashing
 */
async function hashPassword(password: string): Promise<string> {
  // Try to use crypto.subtle if available (secure contexts)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {
      console.warn('crypto.subtle not available, using fallback hash');
    }
  }
  
  // Fallback: simple hash for development (NOT secure for production)
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * Validate admin credentials
 * For development, also accepts plain password comparison
 */
async function validateCredentials(email: string, password: string): Promise<boolean> {
  if (email !== ADMIN_CREDENTIALS.email) {
    return false;
  }
  
  // For development: accept plain password "admin123"
  if (password === "admin123") {
    return true;
  }
  
  // Also check hashed password
  const hashedPassword = await hashPassword(password);
  return hashedPassword === ADMIN_CREDENTIALS.passwordHash;
}

/**
 * Admin storage service for managing administrative operations
 * Extends the base localStorage service with admin-specific functionality
 */
class AdminStorageService {
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
   * Generic method to safely set data in localStorage
   */
  private setItem<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
      handleStorageError(error, `salvar ${key}`);
      return false;
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

  // ==================== AUTHENTICATION METHODS ====================

  /**
   * Authenticate admin with email and password
   */
  async authenticateAdmin(email: string, password: string): Promise<Admin | null> {
    const isValid = await validateCredentials(email, password);
    
    if (!isValid) {
      return null;
    }

    const admin: Admin = {
      id: ADMIN_CREDENTIALS.id,
      email: ADMIN_CREDENTIALS.email,
      name: ADMIN_CREDENTIALS.name,
    };

    return admin;
  }

  /**
   * Save admin session to localStorage
   */
  saveAdminSession(admin: Admin): boolean {
    return this.setItem(ADMIN_STORAGE_KEYS.ADMIN_SESSION, admin);
  }

  /**
   * Get current admin session from localStorage
   */
  getAdminSession(): Admin | null {
    return this.getItem<Admin | null>(ADMIN_STORAGE_KEYS.ADMIN_SESSION, null);
  }

  /**
   * Clear admin session (logout)
   */
  clearAdminSession(): void {
    this.removeItem(ADMIN_STORAGE_KEYS.ADMIN_SESSION);
  }

  /**
   * Check if admin is authenticated
   */
  isAdminAuthenticated(): boolean {
    const session = this.getAdminSession();
    return session !== null;
  }

  // ==================== PRODUCT MANAGEMENT METHODS ====================

  /**
   * Get all products from localStorage
   */
  getProducts(): Product[] {
    return this.getItem<Product[]>(ADMIN_STORAGE_KEYS.PRODUCTS, []);
  }

  /**
   * Save products to localStorage
   */
  saveProducts(products: Product[]): boolean {
    return this.setItem(ADMIN_STORAGE_KEYS.PRODUCTS, products);
  }

  /**
   * Add a new product
   */
  addProduct(product: Product): boolean {
    const products = this.getProducts();
    products.push(product);
    return this.saveProducts(products);
  }

  /**
   * Update an existing product
   */
  updateProduct(id: string, updatedProduct: Partial<Product>): boolean {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      return false;
    }

    products[index] = {
      ...products[index],
      ...updatedProduct,
      updatedAt: new Date().toISOString(),
    };

    return this.saveProducts(products);
  }

  /**
   * Delete a product
   */
  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    
    if (filteredProducts.length === products.length) {
      return false; // Product not found
    }

    return this.saveProducts(filteredProducts);
  }

  /**
   * Get product by ID
   */
  getProductById(id: string): Product | undefined {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  }

  // ==================== STATISTICS METHODS ====================

  /**
   * Get admin dashboard statistics
   */
  getStats(): AdminStats {
    const orders = storageService.getAllOrders();
    const products = this.getProducts();

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((order: Order) => order.status === 'pending').length;
    const totalProducts = products.length;
    const featuredProducts = products.filter((product: Product) => product.stock > 0).length;
    const lowStockProducts = products.filter((product: Product) => product.stock > 0 && product.stock < 5).length;

    return {
      totalOrders,
      pendingOrders,
      totalProducts,
      featuredProducts,
      lowStockProducts,
    };
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Initialize products from hardcoded data if localStorage is empty
   * This will be used for migration
   */
  initializeProducts(defaultProducts: Product[]): boolean {
    const existingProducts = this.getProducts();
    
    if (existingProducts.length === 0) {
      // Add timestamps to products if not present
      const productsWithTimestamps = defaultProducts.map(product => ({
        ...product,
        stock: product.stock ?? 10, // Default stock if not present
        createdAt: product.createdAt ?? new Date().toISOString(),
        updatedAt: product.updatedAt ?? new Date().toISOString(),
      }));
      
      return this.saveProducts(productsWithTimestamps);
    }
    
    return true; // Products already initialized
  }
}

// Export singleton instance
export const adminStorageService = new AdminStorageService();

// Export utility functions for use in contexts
export { hashPassword, validateCredentials };
