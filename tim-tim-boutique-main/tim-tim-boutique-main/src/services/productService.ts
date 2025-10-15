import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

// Database product type (matches Supabase schema)
interface DbProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  tags: string[];
  featured: boolean;
  discount: number;
  alcohol_content?: string;
  volume?: string;
  pairing?: string[];
  tasting_notes?: string[];
  grapes?: string[];
  country?: string;
  region?: string;
  producer?: string;
  vintage?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: 'vinho' | 'whisky' | 'destilado' | 'espumante';
  image_url: string;
  stock: number;
  tags?: string[];
  featured?: boolean;
  discount?: number;
  alcohol_content?: string;
  volume?: string;
  pairing?: string[];
  tasting_notes?: string[];
  grapes?: string[];
  country?: string;
  region?: string;
  producer?: string;
  vintage?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

/**
 * Convert database product to app Product type
 */
function mapDbProductToProduct(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description,
    price: dbProduct.price,
    category: dbProduct.category,
    image: dbProduct.image_url,
    stock: dbProduct.stock,
    tastingNotes: dbProduct.tasting_notes || dbProduct.tags || [],
    pairing: dbProduct.pairing || [],
    country: dbProduct.country || 'Brasil',
    region: dbProduct.region || '',
    alcoholContent: dbProduct.alcohol_content || '',
    volume: dbProduct.volume || '',
    grapes: dbProduct.grapes || [],
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
  };
}

/**
 * Buscar todos os produtos
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      throw new Error(`Erro ao carregar produtos: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    return data.map(mapDbProductToProduct);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Não foi possível carregar os produtos. Verifique sua conexão.');
  }
}

/**
 * Buscar produto por ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar produto:', error);
    return null;
  }

  return mapDbProductToProduct(data);
}

/**
 * Buscar produtos por categoria
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar produtos por categoria:', error);
    throw new Error('Não foi possível carregar os produtos');
  }

  return (data || []).map(mapDbProductToProduct);
}

/**
 * Buscar produtos em destaque
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar produtos em destaque:', error);
    throw new Error('Não foi possível carregar os produtos em destaque');
  }

  return (data || []).map(mapDbProductToProduct);
}

/**
 * Criar novo produto (apenas admin)
 */
export async function createProduct(productData: CreateProductData): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar produto:', error);
      
      // Handle specific error cases
      if (error.code === '23505') {
        throw new Error('Produto com este nome já existe');
      }
      
      throw new Error(`Erro ao criar produto: ${error.message}`);
    }

    if (!data) {
      throw new Error('Nenhum dado retornado ao criar produto');
    }

    return mapDbProductToProduct(data);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Não foi possível criar o produto. Tente novamente.');
  }
}

/**
 * Atualizar produto (apenas admin)
 */
export async function updateProduct(productData: UpdateProductData): Promise<Product> {
  try {
    const { id, ...updateData } = productData;

    const { data, error } = await supabase
      .from('products')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      throw new Error(`Erro ao atualizar produto: ${error.message}`);
    }

    if (!data) {
      throw new Error('Produto não encontrado');
    }

    return mapDbProductToProduct(data);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Não foi possível atualizar o produto. Tente novamente.');
  }
}

/**
 * Deletar produto (apenas admin)
 */
export async function deleteProduct(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar produto:', error);
      
      // Handle foreign key constraints
      if (error.code === '23503') {
        throw new Error('Não é possível deletar este produto pois ele está sendo usado');
      }
      
      throw new Error(`Erro ao deletar produto: ${error.message}`);
    }
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Não foi possível deletar o produto. Tente novamente.');
  }
}

/**
 * Atualizar estoque do produto
 */
export async function updateProductStock(id: string, quantity: number): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ 
      stock: quantity,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar estoque:', error);
    throw new Error('Não foi possível atualizar o estoque');
  }
}

/**
 * Decrementar estoque do produto
 */
export async function decrementProductStock(id: string, quantity: number): Promise<void> {
  // Primeiro buscar o produto atual
  const product = await getProductById(id);
  
  if (!product) {
    throw new Error('Produto não encontrado');
  }

  const newStock = product.stock - quantity;

  if (newStock < 0) {
    throw new Error('Estoque insuficiente');
  }

  await updateProductStock(id, newStock);
}

/**
 * Buscar produtos com filtros
 */
export async function searchProducts(filters: {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
}): Promise<Product[]> {
  let query = supabase.from('products').select('*');

  // Aplicar filtros
  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }

  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }

  if (filters.query) {
    query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    throw new Error('Não foi possível buscar os produtos');
  }

  return (data || []).map(mapDbProductToProduct);
}
