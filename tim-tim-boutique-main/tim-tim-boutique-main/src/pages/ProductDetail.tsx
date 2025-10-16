import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/contexts/ProductContext";
import { ArrowLeft, MessageCircle, ShoppingCart, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import OptimizedImage from "@/components/OptimizedImage";
import { useState } from "react";

const ProductDetail = () => {
  const { id } = useParams();
  // ✅ Usar ProductContext para obter produtos em tempo real
  const { products } = useProducts();
  const product = products.find(p => p.id === id);
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Default stock to 10 if not specified
  const availableStock = product?.stock ?? 10;
  const isOutOfStock = availableStock === 0;

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-3xl mb-4">Produto não encontrado</h1>
          <Link to="/catalogo">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Catálogo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleWhatsAppContact = () => {
    const message = `Olá! Tenho interesse no produto: ${product.name}`;
    const whatsappUrl = `https://wa.me/5581995985278?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;

    setIsAdding(true);
    
    // Add items based on selected quantity (Requirement 6.3)
    let addedCount = 0;
    for (let i = 0; i < quantity; i++) {
      const success = addItem(product);
      if (success) {
        addedCount++;
      } else {
        // Stock limit reached
        break;
      }
    }
    
    if (addedCount > 0) {
      toast({
        title: "Produto adicionado!",
        description: `${addedCount}x ${product.name} ${addedCount > 1 ? 'foram adicionados' : 'foi adicionado'} ao carrinho.`,
      });
    }
    
    if (addedCount < quantity) {
      toast({
        title: "Limite de estoque atingido",
        description: `Apenas ${addedCount} unidades puderam ser adicionadas. Estoque máximo: ${availableStock}`,
        variant: "destructive",
      });
    }

    // Reset quantity and show visual feedback
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
    }, 300);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      setQuantity(1);
    } else if (newQuantity > availableStock) {
      setQuantity(availableStock);
      toast({
        title: "Estoque limitado",
        description: `Apenas ${availableStock} unidades disponíveis.`,
        variant: "destructive",
      });
    } else {
      setQuantity(newQuantity);
    }
  };

  const incrementQuantity = () => {
    handleQuantityChange(quantity + 1);
  };

  const decrementQuantity = () => {
    handleQuantityChange(quantity - 1);
  };

  return (
    <div className="min-h-screen pt-40 pb-20">
      <div className="container mx-auto px-6">
        <Link to="/catalogo" className="inline-flex items-center text-muted-foreground hover:text-secondary transition-smooth mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Catálogo
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-muted shadow-premium">
            <OptimizedImage
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={true}
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="mb-4">
              <Badge variant="outline" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="font-heading text-4xl mb-2">{product.name}</h1>
              <p className="text-muted-foreground text-lg">
                {product.country} {product.region && `• ${product.region}`}
              </p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-heading text-secondary">
                R$ {product.price.toFixed(2)}
              </span>
            </div>

            <p className="text-foreground/90 mb-6 leading-relaxed">
              {product.description}
            </p>

            <Card className="p-6 mb-6 bg-card border-border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Teor Alcoólico</p>
                  <p className="font-body font-semibold">{product.alcoholContent}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Volume</p>
                  <p className="font-body font-semibold">{product.volume}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 mb-6 bg-card border-border">
              <h3 className="font-heading text-lg mb-3">Notas de Degustação</h3>
              <ul className="space-y-2">
                {product.tastingNotes.map((note, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-secondary mr-2">•</span>
                    <span className="text-foreground/90">{note}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 mb-8 bg-card border-border">
              <h3 className="font-heading text-lg mb-3">Harmonização</h3>
              <ul className="space-y-2">
                {product.pairing.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-secondary mr-2">•</span>
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Stock and Quantity Section */}
            <Card className="p-6 mb-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg">Disponibilidade</h3>
                {isOutOfStock ? (
                  <Badge variant="destructive" className="text-sm">
                    Fora de Estoque
                  </Badge>
                ) : availableStock <= 5 ? (
                  <Badge variant="outline" className="text-sm border-orange-500 text-orange-500">
                    Apenas {availableStock} unidades
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-sm border-green-500 text-green-500">
                    Em Estoque
                  </Badge>
                )}
              </div>

              {!isOutOfStock && (
                <div className="space-y-3">
                  <label className="text-sm text-muted-foreground">Quantidade</label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="h-10 w-10 rounded-full"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max={availableStock}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-20 text-center"
                      aria-label="Quantidade"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={incrementQuantity}
                      disabled={quantity >= availableStock}
                      className="h-10 w-10 rounded-full"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {availableStock <= 5 && (
                    <p className="text-xs text-orange-500">
                      Últimas unidades disponíveis!
                    </p>
                  )}
                </div>
              )}
            </Card>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className={`h-10 sm:h-11 md:h-11 lg:h-11 gradient-wine text-white uppercase tracking-wider text-xs sm:text-sm md:text-sm ${
                  isAdding ? 'animate-pulse' : 'hover:opacity-90'
                }`}
                aria-label={isOutOfStock ? "Produto fora de estoque" : "Adicionar ao carrinho"}
              >
                <ShoppingCart className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {isOutOfStock ? 'Fora de Estoque' : isAdding ? 'Adicionando...' : 'Adicionar ao Carrinho'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleWhatsAppContact}
                className="h-10 sm:h-11 md:h-11 lg:h-11 font-body uppercase tracking-wider text-xs sm:text-sm md:text-sm"
              >
                <MessageCircle className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                WhatsApp
              </Button>
            </div>
            
            <Link to="/carrinho">
              <Button
                variant="secondary"
                className="w-full h-10 sm:h-11 md:h-11 lg:h-11 font-body uppercase tracking-wider text-xs sm:text-sm md:text-sm"
              >
                Ver Carrinho
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
