import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import OptimizedImage from "@/components/OptimizedImage";
import { toast } from "sonner";
import { CartItem as CartItemType } from "@/contexts/CartContext";

interface CartItemProps {
  item: CartItemType;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => boolean;
}

const CartItem = memo(({ item, onRemove, onUpdateQuantity }: CartItemProps) => {
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  const handleRemove = () => {
    setRemovingItemId(item.id);
    setTimeout(() => {
      onRemove(item.id);
      setRemovingItemId(null);
      toast.success("Produto removido do carrinho");
    }, 300);
  };

  const handleIncreaseQuantity = () => {
    const success = onUpdateQuantity(item.id, item.quantity + 1);
    if (!success) {
      toast.error(`Estoque máximo atingido. Disponível: ${item.stock} unidades`);
    }
  };

  return (
    <Card className="p-3 sm:p-3 md:p-4 lg:p-4 bg-card border-border">
      <div className="flex gap-2 sm:gap-3 md:gap-4">
        {/* Imagem do Produto */}
        <div className="flex-shrink-0">
          <OptimizedImage
            src={item.image}
            alt={item.name}
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-20 lg:h-20 xl:w-24 xl:h-24 object-cover rounded-md"
            sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, (max-width: 1280px) 80px, 96px"
          />
        </div>
        
        {/* Conteúdo */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header: Nome e Botão Remover */}
          <div className="flex justify-between items-start gap-2 mb-1">
            <Link to={`/produto/${item.id}`} className="flex-1 min-w-0">
              <h3 className="font-heading text-sm sm:text-sm md:text-base lg:text-sm xl:text-base hover:text-secondary transition-colors line-clamp-2 leading-tight">
                {item.name}
              </h3>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={removingItemId === item.id}
              className="text-muted-foreground hover:text-destructive h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0 -mt-1"
              aria-label="Remover produto"
            >
              {removingItemId === item.id ? (
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
            </Button>
          </div>
          
          {/* Informações do Produto */}
          <p className="text-muted-foreground text-[10px] sm:text-xs md:text-xs mb-1 truncate">
            {item.country} • {item.volume}
          </p>
          
          {/* Aviso de Estoque Baixo */}
          {item.stock <= 5 && (
            <p className="text-[10px] sm:text-xs text-orange-600 mb-2">
              {item.stock === 0 ? 'Sem estoque' : `Apenas ${item.stock} em estoque`}
            </p>
          )}
          
          {/* Footer: Quantidade e Preço */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-2">
            {/* Controles de Quantidade */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className="flex-shrink-0 p-0 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-8 lg:w-8 xl:h-9 xl:w-9"
                style={{ minWidth: '28px', minHeight: '28px' }}
                aria-label="Diminuir quantidade"
              >
                <Minus className="flex-shrink-0 h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4" />
              </Button>
              <span className="font-body text-xs sm:text-sm md:text-base lg:text-sm xl:text-base w-5 sm:w-6 md:w-8 lg:w-6 xl:w-8 text-center font-medium flex-shrink-0">
                {item.quantity}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleIncreaseQuantity}
                disabled={item.quantity >= item.stock}
                className="flex-shrink-0 p-0 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-8 lg:w-8 xl:h-9 xl:w-9 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minWidth: '28px', minHeight: '28px' }}
                aria-label="Aumentar quantidade"
              >
                <Plus className="flex-shrink-0 h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4" />
              </Button>
            </div>

            {/* Preço */}
            <div className="text-right">
              <p className="font-heading text-sm sm:text-base md:text-lg lg:text-base xl:text-lg text-secondary font-bold leading-tight">
                R$ {(item.price * item.quantity).toFixed(2)}
              </p>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground leading-tight">
                R$ {item.price.toFixed(2)} cada
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});

CartItem.displayName = 'CartItem';

export default CartItem;
