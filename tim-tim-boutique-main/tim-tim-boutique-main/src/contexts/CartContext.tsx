import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import { sessionService, ShippingInfo } from "@/services/sessionService";
import { migrateFromLocalStorage } from "@/lib/migration";
import { CartItem, Product } from "@/types";
import { toast } from "sonner";
import { handleStorageError } from "@/lib/errorHandling";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => boolean;
  clearCart: () => void;
  total: number;
  itemCount: number;
  shipping: ShippingInfo | null;
  setShipping: (shipping: ShippingInfo | null) => void;
  grandTotal: number;
  isLoading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize state from sessionStorage with automatic migration
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      // Migrate data from localStorage to sessionStorage (Requirement 3.1, 3.4)
      migrateFromLocalStorage();

      // Load cart from session (Requirements 1.1, 1.2, 1.3)
      const savedCart = sessionService.getCart();
      return savedCart;
    } catch (error) {
      console.error('Error loading cart from session:', error);
      handleStorageError(error, 'carregar carrinho');
      setError('Erro ao carregar carrinho');
      return [];
    } finally {
      setIsLoading(false);
    }
  });

  // Initialize shipping from session
  const [shipping, setShipping] = useState<ShippingInfo | null>(() => {
    try {
      return sessionService.getShipping();
    } catch (error) {
      console.error('Error loading shipping from session:', error);
      return null;
    }
  });

  // Memoize addItem function to prevent unnecessary re-renders (Requirement 9.2, 9.3)
  const addItem = useCallback((product: Product): boolean => {
    try {
      // Check if product has stock available (Requirement 6.3)
      if (product.stock <= 0) {
        toast.error('Produto sem estoque', {
          description: 'Este produto está temporariamente indisponível'
        });
        return false;
      }

      // Check current cart state before adding
      setItems(current => {
        const existing = current.find(item => item.id === product.id);
        if (existing && existing.quantity >= product.stock) {
          toast.warning('Estoque limitado', {
            description: `Apenas ${product.stock} unidades disponíveis`
          });
          return current;
        }

        const existingItem = current.find(item => item.id === product.id);
        if (existingItem) {
          // Double-check stock limit (Requirement 6.3)
          if (existingItem.quantity >= product.stock) {
            return current;
          }
          return current.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        // Ensure stock property is included (default to 0 if not present)
        return [...current, { ...product, stock: product.stock ?? 0, quantity: 1 }];
      });

      toast.success('Produto adicionado ao carrinho', {
        description: product.name
      });
      return true;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      handleStorageError(error, 'adicionar produto');
      return false;
    }
  }, []); // No dependencies needed as we use functional setState

  // Memoize removeItem function (Requirement 9.2, 9.3)
  const removeItem = useCallback((productId: string) => {
    try {
      setItems(current => current.filter(item => item.id !== productId));
      toast.success('Produto removido do carrinho');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      handleStorageError(error, 'remover produto');
    }
  }, []);

  // Memoize updateQuantity function (Requirement 9.2, 9.3)
  const updateQuantity = useCallback((productId: string, quantity: number): boolean => {
    try {
      if (quantity <= 0) {
        setItems(current => current.filter(item => item.id !== productId));
        toast.success('Produto removido do carrinho');
        return true;
      }

      let stockExceeded = false;
      setItems(current => {
        // Find the item to check stock (Requirement 6.3)
        const item = current.find(i => i.id === productId);
        if (!item) {
          toast.error('Produto não encontrado no carrinho');
          return current;
        }

        // Check if requested quantity exceeds stock (Requirement 6.3)
        if (quantity > item.stock) {
          stockExceeded = true;
          toast.warning('Estoque insuficiente', {
            description: `Apenas ${item.stock} unidades disponíveis`
          });
          return current;
        }

        return current.map(item =>
          item.id === productId ? { ...item, quantity } : item
        );
      });

      return !stockExceeded;
    } catch (error) {
      console.error('Error updating quantity:', error);
      handleStorageError(error, 'atualizar quantidade');
      return false;
    }
  }, []);

  // Memoize clearCart function (Requirement 9.2, 9.3)
  const clearCart = useCallback(() => {
    try {
      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      handleStorageError(error, 'limpar carrinho');
    }
  }, []);

  // Sync cart with sessionStorage whenever items change (Requirements 1.1, 1.3)
  useEffect(() => {
    try {
      sessionService.saveCart(items);
    } catch (error) {
      console.error('Error saving cart to session:', error);
      handleStorageError(error, 'salvar carrinho');
      setError('Erro ao salvar carrinho');
    }
  }, [items]);

  // Sync shipping with sessionStorage whenever it changes
  useEffect(() => {
    try {
      if (shipping) {
        sessionService.saveShipping(shipping);
      } else {
        sessionService.clearShipping();
      }
    } catch (error) {
      console.error('Error saving shipping to session:', error);
      handleStorageError(error, 'salvar frete');
    }
  }, [shipping]);

  // Memoize expensive calculations to prevent unnecessary recalculations (Requirement 9.2, 9.3)
  const total = useMemo(() =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(() =>
    items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const grandTotal = useMemo(() =>
    total + (shipping?.cost || 0),
    [total, shipping]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        shipping,
        setShipping,
        grandTotal,
        isLoading,
        error
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
