import { useState, memo } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useProducts } from '@/contexts/ProductContext';
import { toast } from 'sonner';
import OptimizedImage from '@/components/OptimizedImage';

interface AdminProductCardProps {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const AdminProductCard = memo(function AdminProductCard({
  product,
  onEdit,
  onDelete,
}: AdminProductCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteProduct } = useProducts();

  const handleDelete = async () => {
    const success = await deleteProduct(product.id);
    
    if (success) {
      toast.success('Produto excluído com sucesso!');
      onDelete(product.id);
    } else {
      toast.error('Erro ao excluir produto. Tente novamente.');
    }
    
    setShowDeleteDialog(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(product.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  return (
    <>
      <Card className="flex flex-col overflow-hidden border-border/50 bg-card hover-lift group shadow-card relative hover:scale-105 md:hover:scale-110 lg:hover:scale-110 active:scale-95 h-full product-card-optimized">
        <div className="flex flex-col h-full">
          {/* Image - Identical to ProductCard */}
          <div className="aspect-[3/4] overflow-hidden bg-gradient-card relative flex-shrink-0 w-full">
            <OptimizedImage
              src={product.image}
              alt={`${product.name} - ${product.category}`}
              className="w-full h-full object-cover transition-smooth group-hover:scale-110 group-hover:brightness-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth" aria-hidden="true" />
            
            {/* Stock badge */}
            {product.stock === 0 && (
              <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-semibold">
                Esgotado
              </div>
            )}
            {product.stock > 0 && product.stock < 5 && (
              <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-semibold">
                Estoque Baixo
              </div>
            )}
          </div>

          {/* Content - Identical to ProductCard */}
          <div className="p-3 sm:p-4 md:p-4 lg:p-4 bg-gradient-card flex flex-col flex-grow">
            <div className="flex items-start justify-between gap-1 mb-1.5 md:mb-2 lg:mb-2">
              <p className="text-[10px] sm:text-xs md:text-xs lg:text-xs uppercase tracking-wide font-body font-normal leading-tight" style={{ color: 'hsl(0 60% 45%)' }}>
                {product.category}
              </p>
              <span className="text-[10px] sm:text-xs md:text-xs lg:text-xs text-muted-foreground font-body leading-tight text-right">
                {product.country}
              </span>
            </div>

            <h3 className="font-heading text-sm sm:text-base md:text-lg lg:text-lg mb-2 md:mb-2 lg:mb-2 group-hover:text-secondary transition-fast line-clamp-2">
              {product.name}
            </h3>

            <div className="flex items-center justify-between mb-2.5 md:mb-2.5 lg:mb-2.5 mt-auto">
              <span className="price-text text-lg sm:text-xl md:text-2xl lg:text-2xl font-heading text-secondary font-bold">
                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Stock info */}
            <div className="text-xs text-muted-foreground mb-2">
              Estoque: <span className={product.stock < 5 ? 'text-yellow-500 font-semibold' : 'text-foreground font-medium'}>{product.stock} un.</span>
            </div>

            {/* Admin Actions - Replacing Add to Cart button */}
            <div className="flex gap-2 flex-shrink-0">
              <Button 
                onClick={handleEdit}
                className="flex-1 h-9 sm:h-10 md:h-10 lg:h-10 gradient-wine text-white hover:opacity-90 uppercase tracking-wide transition-fast text-xs sm:text-sm md:text-sm lg:text-sm focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                size="sm"
              >
                <Edit className="mr-1.5 sm:mr-2 md:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4 md:w-4" aria-hidden="true" />
                Editar
              </Button>
              <Button 
                onClick={handleDeleteClick}
                variant="outline"
                className="h-9 sm:h-10 md:h-10 lg:h-10 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-fast text-xs sm:text-sm md:text-sm lg:text-sm focus:ring-2 focus:ring-destructive focus:ring-offset-2"
                size="sm"
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4 md:w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-heading">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja excluir o produto <span className="text-secondary font-semibold">"{product.name}"</span>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border hover:bg-muted">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Excluir Produto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

export default AdminProductCard;
