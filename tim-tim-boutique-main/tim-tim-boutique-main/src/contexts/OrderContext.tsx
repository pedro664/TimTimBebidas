import { createContext, useContext, useState, ReactNode } from "react";

/**
 * Simplified OrderContext - Only for temporary order confirmation
 * No database persistence, no localStorage, just temporary state
 * Orders are finalized via WhatsApp, not stored in database
 */

export interface OrderData {
  id: string;
  date: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  subtotal: number;
  shippingCost: number;
  shippingIsFree: boolean;
  total: number;
  estimatedDelivery: string;
  shippingAddress: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  customerInfo: {
    name: string;
    email?: string;
    phone: string;
  };
  status: string;
}

interface OrderContextType {
  lastOrder: OrderData | null;
  setLastOrder: (order: OrderData | null) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [lastOrder, setLastOrder] = useState<OrderData | null>(null);

  return (
    <OrderContext.Provider
      value={{
        lastOrder,
        setLastOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within OrderProvider");
  }
  return context;
};
