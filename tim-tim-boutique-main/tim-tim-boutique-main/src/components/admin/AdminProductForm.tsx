import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types';
import { useProducts } from '@/contexts/ProductContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagInput } from './TagInput';
import { ProductImageUpload } from './ProductImageUpload';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AdminProductFormProps {
  mode: 'add' | 'edit';
  productId?: string;
}

interface FormData {
  name: string;
  category: string;
  country: string;
  region: string;
  price: string;
  image: string;
  description: string;
  alcoholContent: string;
  volume: string;
  tastingNotes: string[];
  pairing: string[];
  grapes: string[];
  stock: string;
}

interface FormErrors {
  name?: string;
  category?: string;
  country?: string;
  price?: string;
  image?: string;
  description?: string;
  alcoholContent?: string;
  volume?: string;
}

const CATEGORIES = [
  'Cerveja',
  'Whisky',
  'Vinho Tinto',
  'Vinho Branco',
  'Vodka',
  'Rum',
  'Gin',
  'Cachaça',
  'Licor',
  'Aperitivo',
  'Vermute',
  'Espumante',
  'Vinho Rosé',
];

const initialFormData: FormData = {
  name: '',
  category: '',
  country: '',
  region: '',
  price: '',
  image: '',
  description: '',
  alcoholContent: '',
  volume: '',
  tastingNotes: [],
  pairing: [],
  grapes: [],
  stock: '0',
};

export const AdminProductForm: React.FC<AdminProductFormProps> = ({ mode, productId }) => {
  const navigate = useNavigate();
  const { addProduct, updateProduct, getProductById } = useProducts();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(mode === 'edit');

  // Load product data for edit mode
  useEffect(() => {
    if (mode === 'edit' && productId) {
      const product = getProductById(productId);
      
      if (product) {
        setFormData({
          name: product.name,
          category: product.category,
          country: product.country,
          region: product.region || '',
          price: product.price.toString(),
          image: product.image,
          description: product.description,
          alcoholContent: product.alcoholContent,
          volume: product.volume,
          tastingNotes: product.tastingNotes || [],
          pairing: product.pairing || [],
          grapes: product.grapes || [],
          stock: product.stock.toString(),
        });
        setIsLoading(false);
      } else {
        toast.error('Produto não encontrado');
        navigate('/admin/produtos');
      }
    }
  }, [mode, productId, getProductById, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
    
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'País de origem é obrigatório';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Preço é obrigatório';
    } else {
      const priceValue = parseFloat(formData.price);
      if (isNaN(priceValue) || priceValue <= 0) {
        newErrors.price = 'Preço deve ser maior que 0';
      }
    }

    if (!formData.image.trim()) {
      newErrors.image = 'URL da imagem é obrigatória';
    } else {
      // Basic URL validation
      try {
        new URL(formData.image);
      } catch {
        newErrors.image = 'URL da imagem inválida';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.alcoholContent.trim()) {
      newErrors.alcoholContent = 'Teor alcoólico é obrigatório';
    }

    if (!formData.volume.trim()) {
      newErrors.volume = 'Volume é obrigatório';
    }

    // Stock validation
    const stockValue = parseInt(formData.stock);
    if (isNaN(stockValue) || stockValue < 0) {
      newErrors.price = 'Estoque não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name.trim(),
        category: formData.category,
        country: formData.country.trim(),
        region: formData.region.trim() || undefined,
        price: parseFloat(formData.price),
        image: formData.image.trim(),
        description: formData.description.trim(),
        alcoholContent: formData.alcoholContent.trim(),
        volume: formData.volume.trim(),
        tastingNotes: formData.tastingNotes,
        pairing: formData.pairing,
        grapes: formData.grapes.length > 0 ? formData.grapes : undefined,
        stock: parseInt(formData.stock),
      };

      let success = false;

      if (mode === 'add') {
        success = await addProduct(productData);
      } else if (mode === 'edit' && productId) {
        success = await updateProduct(productId, productData);
      }

      if (success) {
        navigate('/admin/produtos');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Erro ao salvar produto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/produtos');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Informações Básicas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nome do produto"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-red-500">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Categoria <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.category} onValueChange={handleSelectChange}>
              <SelectTrigger
                id="category"
                aria-invalid={!!errors.category}
                aria-describedby={errors.category ? 'category-error' : undefined}
              >
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p id="category-error" className="text-sm text-red-500">
                {errors.category}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">
              Preço (R$) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.00"
              aria-invalid={!!errors.price}
              aria-describedby={errors.price ? 'price-error' : undefined}
            />
            {errors.price && (
              <p id="price-error" className="text-sm text-red-500">
                {errors.price}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Estoque</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Detalhes do Produto */}
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Detalhes do Produto</h2>
        
        <div className="space-y-2">
          <Label htmlFor="description">
            Descrição <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Descrição detalhada do produto"
            rows={4}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          {errors.description && (
            <p id="description-error" className="text-sm text-red-500">
              {errors.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">
              País de Origem <span className="text-red-500">*</span>
            </Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="Ex: Brasil, França, Escócia"
              aria-invalid={!!errors.country}
              aria-describedby={errors.country ? 'country-error' : undefined}
            />
            {errors.country && (
              <p id="country-error" className="text-sm text-red-500">
                {errors.country}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Região</Label>
            <Input
              id="region"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              placeholder="Ex: Bordeaux, Speyside (opcional)"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="alcoholContent">
              Teor Alcoólico <span className="text-red-500">*</span>
            </Label>
            <Input
              id="alcoholContent"
              name="alcoholContent"
              value={formData.alcoholContent}
              onChange={handleInputChange}
              placeholder="Ex: 40%, 13.5%"
              aria-invalid={!!errors.alcoholContent}
              aria-describedby={errors.alcoholContent ? 'alcoholContent-error' : undefined}
            />
            {errors.alcoholContent && (
              <p id="alcoholContent-error" className="text-sm text-red-500">
                {errors.alcoholContent}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="volume">
              Volume <span className="text-red-500">*</span>
            </Label>
            <Input
              id="volume"
              name="volume"
              value={formData.volume}
              onChange={handleInputChange}
              placeholder="Ex: 750ml, 1L"
              aria-invalid={!!errors.volume}
              aria-describedby={errors.volume ? 'volume-error' : undefined}
            />
            {errors.volume && (
              <p id="volume-error" className="text-sm text-red-500">
                {errors.volume}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Características */}
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Características</h2>
        
        <TagInput
          id="tastingNotes"
          label="Notas de Degustação"
          value={formData.tastingNotes}
          onChange={(tags) => setFormData(prev => ({ ...prev, tastingNotes: tags }))}
          placeholder="Digite uma nota e pressione Enter"
        />

        <TagInput
          id="pairing"
          label="Harmonização"
          value={formData.pairing}
          onChange={(tags) => setFormData(prev => ({ ...prev, pairing: tags }))}
          placeholder="Digite uma harmonização e pressione Enter"
        />

        {(formData.category.includes('Vinho') || formData.category === 'Espumante') && (
          <TagInput
            id="grapes"
            label="Uvas (opcional)"
            value={formData.grapes}
            onChange={(tags) => setFormData(prev => ({ ...prev, grapes: tags }))}
            placeholder="Digite uma uva e pressione Enter"
          />
        )}
      </div>

      {/* Imagem */}
      <div className="bg-card rounded-lg border p-6">
        <ProductImageUpload
          id="image"
          value={formData.image}
          onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
          error={errors.image}
        />
      </div>

      {/* Ações */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            mode === 'add' ? 'Adicionar Produto' : 'Salvar Alterações'
          )}
        </Button>
      </div>
    </form>
  );
};
