import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { uploadProductImage } from '@/services/imageService';
import { toast } from 'sonner';

export const QuickImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; name: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        try {
          const result = await uploadProductImage(file);
          return { url: result.url, name: file.name, success: true };
        } catch (error) {
          console.error(`Erro ao fazer upload de ${file.name}:`, error);
          return { url: '', name: file.name, success: false };
        }
      });

      const results = await Promise.all(uploadPromises);
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length > 0) {
        setUploadedImages(prev => [...prev, ...successful]);
        toast.success(`${successful.length} imagem(ns) enviada(s) com sucesso!`);
      }

      if (failed.length > 0) {
        toast.error(`Falha ao enviar ${failed.length} imagem(ns)`);
      }
    } catch (error) {
      toast.error('Erro ao fazer upload das imagens');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiada para a área de transferência!');
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="admin-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 admin-text">
          <ImageIcon className="h-5 w-5 admin-icon-primary" />
          Upload Rápido de Imagens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload button */}
        <Button
          onClick={handleButtonClick}
          disabled={isUploading}
          className="w-full"
          variant="outline"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Selecionar Imagens
            </>
          )}
        </Button>

        <p className="text-xs admin-text-muted text-center">
          JPG, PNG ou WebP (máx. 5MB cada)
        </p>

        {/* Uploaded images list */}
        {uploadedImages.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <p className="text-sm font-medium admin-text">
              Imagens enviadas ({uploadedImages.length})
            </p>
            {uploadedImages.map((image, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-[hsl(var(--admin-card-hover))] rounded-lg border admin-border"
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium admin-text truncate">
                    {image.name}
                  </p>
                  <button
                    onClick={() => copyToClipboard(image.url)}
                    className="text-xs admin-icon-primary hover:text-[hsl(var(--admin-primary-hover))]"
                  >
                    Copiar URL
                  </button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="h-8 w-8 p-0 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {uploadedImages.length === 0 && !isUploading && (
          <div className="text-center py-8 admin-text-muted">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma imagem enviada ainda</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
