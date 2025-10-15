import React, { useState, useEffect, useRef } from 'react';
import { ImageIcon, AlertCircle, Upload, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { uploadProductImage } from '@/services/imageService';

interface ProductImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
  id?: string;
}

export const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  value,
  onChange,
  error,
  id,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(value);
    if (value) {
      validateImageUrl(value);
    } else {
      setImageError(false);
      setIsLoading(false);
    }
  }, [value]);

  const validateImageUrl = (url: string) => {
    setIsLoading(true);
    setImageError(false);

    const img = new Image();
    
    img.onload = () => {
      setIsLoading(false);
      setImageError(false);
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setImageError(true);
    };
    
    img.src = url;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setUploadError(null);
    setImageError(false);

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload to Supabase
      const result = await uploadProductImage(file);
      
      // Update form with uploaded URL
      onChange(result.url);
      
      // Clean up object URL
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erro ao fazer upload');
      setPreviewUrl(value); // Restore previous value
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    setPreviewUrl('');
    setImageError(false);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        Imagem do Produto <span className="text-red-500">*</span>
      </Label>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Selecionar imagem do produto"
      />
      
      {/* Upload button */}
      {!previewUrl && (
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={isLoading}
          className="w-full h-32 border-2 border-dashed"
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8" />
            <span>Clique para fazer upload</span>
            <span className="text-xs text-muted-foreground">
              JPG, PNG ou WebP (máx. 5MB)
            </span>
          </div>
        </Button>
      )}
      
      {/* Error messages */}
      {error && (
        <Alert variant="destructive" id={`${id}-error`}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
      
      {imageError && !error && !uploadError && (
        <Alert variant="destructive" id={`${id}-error`}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Não foi possível carregar a imagem.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="mt-4 border rounded-lg p-8 bg-muted/50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="h-8 w-8 animate-pulse" />
            <p className="text-sm">Fazendo upload...</p>
          </div>
        </div>
      )}
      
      {/* Image preview */}
      {previewUrl && !isLoading && (
        <div className="mt-4">
          <Label>Preview da Imagem</Label>
          <div className="mt-2 border rounded-lg p-4 bg-muted/50 relative">
            <img
              src={previewUrl}
              alt="Preview do produto"
              className="max-w-full h-auto max-h-64 mx-auto rounded-md object-contain"
              onError={() => setImageError(true)}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4 mr-1" />
              Remover
            </Button>
          </div>
          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleButtonClick}
              disabled={isLoading}
            >
              <Upload className="h-4 w-4 mr-1" />
              Trocar imagem
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
