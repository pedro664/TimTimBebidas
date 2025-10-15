import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';
import * as productService from '@/services/productService';
import { toast } from 'sonner';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, 'id'>) => Promise<boolean>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  getProductById: (id: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
}

export function ProductProvider({ children }: ProductProviderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load products from Supabase database with retry logic
   */
  const loadProducts = async (isRetry: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
      console.log(`Loaded ${data.length} products from database`);
      
      if (isRetry) {
        toast.success('Produtos carregados com sucesso!');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar produtos';
      setError(errorMessage);
      
      // Show error with retry option
      toast.error('Erro ao carregar produtos', {
        description: errorMessage,
        action: {
          label: 'Tentar Novamente',
          onClick: () => loadProducts(true),
        },
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initialize products on mount
   */
  useEffect(() => {
    loadProducts();
  }, []);

  /**
   * Map category from display name to database value
   */
  const mapCategoryToDb = (category: string): 'vinho' | 'whisky' | 'destilado' | 'espumante' => {
    const categoryMap: Record<string, 'vinho' | 'whisky' | 'destilado' | 'espumante'> = {
      'Vinho Tinto': 'vinho',
      'Vinho Branco': 'vinho',
      'Vinho Rosé': 'vinho',
      'Whisky': 'whisky',
      'Vodka': 'destilado',
      'Rum': 'destilado',
      'Gin': 'destilado',
      'Cachaça': 'destilado',
      'Licor': 'destilado',
      'Cerveja': 'destilado',
      'Aperitivo': 'destilado',
      'Vermute': 'destilado',
      'Espumante': 'espumante',
    };

    return categoryMap[category] || 'destilado';
  };

  /**
   * Add a new product
   */
  const addProduct = async (productData: Omit<Product, 'id'>): Promise<boolean> => {
    try {
      // Map Product fields to CreateProductData
      const createData: productService.CreateProductData = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: mapCategoryToDb(productData.category),
        image_url: productData.image,
        stock: productData.stock ?? 0,
        tags: productData.tastingNotes || [],
        featured: false,
        discount: 0,
        alcohol_content: productData.alcoholContent || undefined,
        volume: productData.volume || undefined,
        pairing: productData.pairing && productData.pairing.length > 0 ? productData.pairing : undefined,
        tasting_notes: productData.tastingNotes && productData.tastingNotes.length > 0 ? productData.tastingNotes : undefined,
        grapes: productData.grapes && productData.grapes.length > 0 ? productData.grapes : undefined,
        country: productData.country || undefined,
        region: productData.region || undefined,
      };

      const newProduct = await productService.createProduct(createData);
      
      // Update local state
      setProducts(prev => [...prev, newProduct]);
      toast.success('Produto adicionado com sucesso!');
      return true;
    } catch (error) {
      console.error('Error adding product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao adicionar produto';
      
      toast.error('Erro ao adicionar produto', {
        description: errorMessage,
      });
      
      return false;
    }
  };

  /**
   * Update an existing product
   */
  const updateProduct = async (id: string, productData: Partial<Product>): Promise<boolean> => {
    try {
      // Map Product fields to UpdateProductData
      const updateData: productService.UpdateProductData = {
        id,
        ...(productData.name && { name: productData.name }),
        ...(productData.description && { description: productData.description }),
        ...(productData.price !== undefined && { price: productData.price }),
        ...(productData.category && { category: mapCategoryToDb(productData.category) }),
        ...(productData.image && { image_url: productData.image }),
        ...(productData.stock !== undefined && { stock: productData.stock }),
        ...(productData.tastingNotes && { tags: productData.tastingNotes }),
        ...(productData.alcoholContent && { alcohol_content: productData.alcoholContent }),
        ...(productData.volume && { volume: productData.volume }),
        ...(productData.pairing && { pairing: productData.pairing }),
        ...(productData.tastingNotes && { tasting_notes: productData.tastingNotes }),
        ...(productData.grapes && { grapes: productData.grapes }),
        ...(productData.country && { country: productData.country }),
        ...(productData.region && { region: productData.region }),
      };

      const updatedProduct = await productService.updateProduct(updateData);
      
      // Update local state
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? updatedProduct : product
        )
      );
      toast.success('Produto atualizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar produto';
      
      toast.error('Erro ao atualizar produto', {
        description: errorMessage,
      });
      
      return false;
    }
  };

  /**
   * Delete a product
   */
  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      await productService.deleteProduct(id);
      
      // Update local state
      setProducts(prev => prev.filter(product => product.id !== id));
      toast.success('Produto excluído com sucesso!');
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir produto';
      
      toast.error('Erro ao excluir produto', {
        description: errorMessage,
      });
      
      return false;
    }
  };

  /**
   * Get a product by ID
   */
  const getProductById = (id: string): Product | undefined => {
    return products.find(product => product.id === id);
  };

  /**
   * Refresh products from database
   */
  const refreshProducts = async () => {
    await loadProducts();
  };

  const value: ProductContextType = {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    refreshProducts,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

/**
 * Hook to use ProductContext
 */
export function useProducts() {
  const context = useContext(ProductContext);
  
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  
  return context;
}
