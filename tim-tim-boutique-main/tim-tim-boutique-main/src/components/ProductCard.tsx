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
    <Card className="flex flex-col overflow-hidden border-border/50 bg-card group shadow-card relative h-full product-card-optimized transition-all duration-300 hover:-translate-y-2 hover:shadow-premium active:scale-95">
      <Link
        to={`/produto/${product.id}`}
        className="flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded-lg"
        aria-label={`Ver detalhes de ${product.name}, ${product.category}, R$ ${product.price.toFixed(2)}`}
      >
        {/* Imagem do Produto - Aspect ratio fixo */}
        <div className="aspect-[3/4] overflow-hidden bg-gradient-card relative flex-shrink-0 w-full">
          <OptimizedImage
            src={product.image}
            alt={`${product.name} - ${product.category}`}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" aria-hidden="true" />
        </div>

        {/* Conteúdo do Card */}
        <div className="p-3 sm:p-4 md:p-4 lg:p-5 bg-gradient-card flex flex-col flex-grow">
          {/* Categoria e País */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <p
              className="text-[10px] sm:text-xs md:text-xs lg:text-xs uppercase tracking-wide font-body font-normal leading-tight"
              style={{ color: 'hsl(0 60% 45%)' }}
              aria-label={`Categoria: ${product.category}`}
            >
              {product.category}
            </p>
            <span
              className="text-[10px] sm:text-xs md:text-xs lg:text-xs text-muted-foreground font-body leading-tight text-right flex-shrink-0"
              aria-label={`País: ${product.country}`}
            >
              {product.country}
            </span>
          </div>

          {/* Nome do Produto */}
          <h3 className="font-heading text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base mb-2 sm:mb-3 group-hover:text-secondary transition-all duration-300 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3rem] lg:min-h-[2.8rem] xl:min-h-[3.5rem] leading-tight">
            {product.name}
          </h3>

          {/* Preço */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 mt-auto">
            <span
              className="price-text text-lg sm:text-xl md:text-xl lg:text-xl xl:text-2xl font-heading text-secondary font-bold"
              aria-label={`Preço: R$ ${product.price.toFixed(2)}`}
            >
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Botão Adicionar */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-full h-9 sm:h-10 md:h-10 lg:h-11 xl:h-12 gradient-wine text-white hover:opacity-90 uppercase tracking-wide transition-all duration-300 text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base flex-shrink-0 focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-2 sm:px-3 md:px-3 lg:px-3 xl:px-4"
            aria-label={product.stock <= 0 ? `${product.name} sem estoque` : `Adicionar ${product.name} ao carrinho`}
          >
            <ShoppingCart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            <span className="truncate">{product.stock <= 0 ? 'Sem Estoque' : 'Adicionar'}</span>
          </Button>
        </div>
      </Link>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
