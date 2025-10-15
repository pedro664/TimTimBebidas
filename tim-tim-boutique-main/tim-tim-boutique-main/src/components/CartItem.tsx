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
    <Card className="p-4 sm:p-6 bg-card border-border">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <OptimizedImage
          src={item.image}
          alt={item.name}
          className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg mx-auto sm:mx-0"
          sizes="112px"
        />
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <Link to={`/produto/${item.id}`}>
              <h3 className="font-heading text-lg sm:text-xl hover:text-secondary transition-smooth">
                {item.name}
              </h3>
            </Link>
          </div>
          <p className="text-muted-foreground text-sm mb-1">
            {item.country} • {item.volume}
          </p>
          {item.stock <= 5 && (
            <p className="text-xs text-orange-600 mb-2">
              {item.stock === 0 ? 'Sem estoque' : `Apenas ${item.stock} em estoque`}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className="h-12 w-12 sm:h-10 sm:w-10 touch-target"
                aria-label="Diminuir quantidade"
              >
                <Minus className="h-5 w-5 sm:h-4 sm:w-4" />
              </Button>
              <span className="font-body text-lg sm:text-base w-10 sm:w-8 text-center">
                {item.quantity}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleIncreaseQuantity}
                disabled={item.quantity >= item.stock}
                className="h-12 w-12 sm:h-10 sm:w-10 touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Aumentar quantidade"
              >
                <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
              </Button>
            </div>

            <div className="text-center sm:text-right">
              <p className="font-heading text-xl sm:text-2xl text-secondary">
                R$ {(item.price * item.quantity).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                R$ {item.price.toFixed(2)} cada
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={removingItemId === item.id}
          className="text-muted-foreground hover:text-destructive touch-target h-12 w-12 sm:h-10 sm:w-10"
          aria-label="Remover produto"
        >
          {removingItemId === item.id ? (
            <Loader2 className="h-6 w-6 sm:h-5 sm:w-5 animate-spin" />
          ) : (
            <Trash2 className="h-6 w-6 sm:h-5 sm:w-5" />
          )}
        </Button>
      </div>
    </Card>
  );
});

CartItem.displayName = 'CartItem';

export default CartItem;
