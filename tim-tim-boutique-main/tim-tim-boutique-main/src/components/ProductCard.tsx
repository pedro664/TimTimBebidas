import { memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types";
import OptimizedImage from "@/components/OptimizedImage";

const ProductCard = memo((product: Product) => {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check stock before adding (Requirement 6.3)
    if (product.stock <= 0) {
      toast({
        title: "Produto indisponível",
        description: "Este produto está sem estoque no momento.",
        variant: "destructive",
      });
      return;
    }
    
    const success = addItem(product);
    
    if (success) {
      toast({
        title: "Produto adicionado!",
        description: `${product.name} foi adicionado ao carrinho.`,
      });
    } else {
      toast({
        title: "Limite de estoque atingido",
        description: `Você já tem a quantidade máxima disponível de ${product.name} no carrinho.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden border-border/50 bg-card hover-lift group shadow-card relative hover:scale-105 md:hover:scale-110 lg:hover:scale-110 active:scale-95 h-full product-card-optimized">
      <Link 
        to={`/produto/${product.id}`} 
        className="flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded-lg"
        aria-label={`Ver detalhes de ${product.name}, ${product.category}, R$ ${product.price.toFixed(2)}`}
      >
        <div className="aspect-[3/4] overflow-hidden bg-gradient-card relative flex-shrink-0 w-full">
          <OptimizedImage
            src={product.image}
            alt={`${product.name} - ${product.category}`}
            className="w-full h-full object-cover transition-smooth group-hover:scale-110 group-hover:brightness-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth" aria-hidden="true" />
        </div>
        <div className="p-3 sm:p-4 md:p-4 lg:p-4 bg-gradient-card flex flex-col flex-grow">
          <div className="flex items-start justify-between gap-1 mb-1.5 md:mb-2 lg:mb-2">
            <p className="text-[10px] sm:text-xs md:text-xs lg:text-xs uppercase tracking-wide font-body font-normal leading-tight" style={{ color: 'hsl(0 60% 45%)' }} aria-label={`Categoria: ${product.category}`}>{product.category}</p>
            <span className="text-[10px] sm:text-xs md:text-xs lg:text-xs text-muted-foreground font-body leading-tight text-right" aria-label={`País: ${product.country}`}>{product.country}</span>
          </div>
          <h3 className="font-heading text-sm sm:text-base md:text-lg lg:text-lg mb-2 md:mb-2 lg:mb-2 group-hover:text-secondary transition-fast line-clamp-2">{product.name}</h3>
          <div className="flex items-center justify-between mb-2.5 md:mb-2.5 lg:mb-2.5 mt-auto">
            <span className="price-text text-lg sm:text-xl md:text-2xl lg:text-2xl font-heading text-secondary font-bold" aria-label={`Preço: R$ ${product.price.toFixed(2)}`}>
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <Button 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-full h-9 sm:h-10 md:h-10 lg:h-10 gradient-wine text-white hover:opacity-90 uppercase tracking-wide transition-fast text-xs sm:text-sm md:text-sm lg:text-sm flex-shrink-0 focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            size="sm"
            aria-label={product.stock <= 0 ? `${product.name} sem estoque` : `Adicionar ${product.name} ao carrinho`}
          >
            <ShoppingCart className="mr-1.5 sm:mr-2 md:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4 md:w-4" aria-hidden="true" />
            {product.stock <= 0 ? 'Sem Estoque' : 'Adicionar'}
          </Button>
        </div>
      </Link>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
