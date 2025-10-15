import { supabase } from '@/lib/supabase';

/**
 * Image Upload Service
 * Handles image uploads to Supabase Storage
 */

const BUCKET_NAME = 'product-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Validate image file
 */
function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato não suportado. Use JPG, PNG ou WebP.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Tamanho máximo: 5MB.',
    };
  }

  return { valid: true };
}

/**
 * Generate unique filename
 */
function generateFileName(file: File): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = file.name.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadProductImage(file: File): Promise<UploadResult> {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Generate unique filename
  const fileName = generateFileName(file);
  const filePath = `products/${fileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error('Erro ao fazer upload da imagem');
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteProductImage(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error('Erro ao deletar imagem');
  }
}

/**
 * Update product image (delete old, upload new)
 */
export async function updateProductImage(
  oldPath: string | null,
  newFile: File
): Promise<UploadResult> {
  // Upload new image
  const result = await uploadProductImage(newFile);

  // Delete old image if exists
  if (oldPath) {
    try {
      await deleteProductImage(oldPath);
    } catch (error) {
      console.warn('Failed to delete old image:', error);
      // Don't throw error, new image is already uploaded
    }
  }

  return result;
}
