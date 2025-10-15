import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { storageService } from "@/services/localStorage";
import { Product } from "@/types";

// Mock product for testing
const mockProduct: Product = {
  id: "test-1",
  name: "Test Product",
  price: 99.99,
  description: "Test description",
  image: "/test.jpg",
  category: "test",
  inStock: true,
};

describe("Cart Persistence", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it("should load cart from localStorage on initialization", () => {
    // Setup: Save a cart to localStorage
    const savedCart = [{ ...mockProduct, quantity: 2 }];
    storageService.saveCart(savedCart);

    // Render hook
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    // Verify cart was loaded from localStorage
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe(mockProduct.id);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it("should save cart to localStorage when adding item", async () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    // Add item to cart
    act(() => {
      result.current.addItem(mockProduct);
    });

    // Wait for useEffect to run
    await waitFor(() => {
      const savedCart = storageService.getCart();
      expect(savedCart).toHaveLength(1);
      expect(savedCart[0].id).toBe(mockProduct.id);
      expect(savedCart[0].quantity).toBe(1);
    });
  });

  it("should update localStorage when updating quantity", async () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    // Add item first
    act(() => {
      result.current.addItem(mockProduct);
    });

    // Update quantity
    act(() => {
      result.current.updateQuantity(mockProduct.id, 5);
    });

    // Verify localStorage was updated
    await waitFor(() => {
      const savedCart = storageService.getCart();
      expect(savedCart[0].quantity).toBe(5);
    });
  });

  it("should update localStorage when removing item", async () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    // Add item first
    act(() => {
      result.current.addItem(mockProduct);
    });

    // Remove item
    act(() => {
      result.current.removeItem(mockProduct.id);
    });

    // Verify localStorage was updated
    await waitFor(() => {
      const savedCart = storageService.getCart();
      expect(savedCart).toHaveLength(0);
    });
  });

  it("should clear localStorage when clearing cart", async () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    // Add items first
    act(() => {
      result.current.addItem(mockProduct);
      result.current.addItem({ ...mockProduct, id: "test-2" });
    });

    // Clear cart
    act(() => {
      result.current.clearCart();
    });

    // Verify localStorage was cleared
    await waitFor(() => {
      const savedCart = storageService.getCart();
      expect(savedCart).toHaveLength(0);
    });
  });

  it("should persist cart across page reloads", () => {
    // First render: add items
    const { result: result1 } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result1.current.addItem(mockProduct);
      result1.current.addItem({ ...mockProduct, id: "test-2" });
    });

    // Simulate page reload by creating new hook instance
    const { result: result2 } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    // Verify cart was restored
    expect(result2.current.items).toHaveLength(2);
    expect(result2.current.itemCount).toBe(2);
  });

  it("should handle empty localStorage gracefully", () => {
    // Ensure localStorage is empty
    localStorage.clear();

    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    // Should initialize with empty cart
    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it("should handle corrupted localStorage data gracefully", () => {
    // Set invalid JSON in localStorage
    localStorage.setItem("timtim_cart", "invalid json");

    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    // Should initialize with empty cart
    expect(result.current.items).toHaveLength(0);
  });
});
