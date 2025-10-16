import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import ShippingCalculator from "@/components/ShippingCalculator";
import CartItem from "@/components/CartItem";

const Cart = () => {
  const { items, removeItem, updateQuantity, total, itemCount, shipping, setShipping, grandTotal } = useCart();
  const navigate = useNavigate();

  const handleShippingCalculated = (cost: number, isFree: boolean, city?: string, cep?: string) => {
    setShipping({
      cost,
      isFree,
      city,
      cep,
      isValid: true
    });
  };

  const handleCheckout = () => {
    if (!shipping || !shipping.isValid) {
      toast.error("Por favor, calcule o frete antes de finalizar a compra");
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-40 pb-20">
        <div className="container mx-auto px-6">
          <div className="text-center py-20">
            <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
            <h1 className="font-heading text-3xl mb-4">Seu carrinho está vazio</h1>
            <p className="text-muted-foreground mb-8">
              Adicione produtos ao carrinho para começar sua compra
            </p>
            <Link to="/catalogo">
              <Button size="lg" className="gradient-wine text-white hover:opacity-90 font-semibold">
                Explorar Catálogo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40 pb-8 sm:pb-12 md:pb-16 lg:pb-20">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-6 max-w-7xl">
        {/* Título */}
        <h1 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-4 sm:mb-6 md:mb-8">
          Carrinho de Compras
        </h1>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-6 lg:gap-6">
          {/* Lista de Produtos - 8 colunas em desktop */}
          <div className="lg:col-span-8 space-y-3 sm:space-y-3 md:space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={removeItem}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </div>

          {/* Resumo do Pedido - 4 colunas em desktop */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-20">
              <Card className="p-4 sm:p-4 md:p-5 lg:p-5 xl:p-6 bg-card border-border overflow-hidden">
                {/* Título do Resumo */}
                <h2 className="font-heading text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl mb-3 sm:mb-4 md:mb-5">
                  Resumo do Pedido
                </h2>
                
                {/* Calculadora de Frete */}
                <div className="mb-3 sm:mb-4 md:mb-5">
                  <ShippingCalculator 
                    subtotal={total}
                    onShippingCalculated={handleShippingCalculated}
                  />
                </div>

                {/* Valores */}
                <div className="space-y-2 sm:space-y-2 md:space-y-2.5 mb-3 sm:mb-4 md:mb-5">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-xs sm:text-sm md:text-sm lg:text-sm text-foreground/90">
                    <span>Produtos ({itemCount})</span>
                    <span className="font-medium">R$ {total.toFixed(2)}</span>
                  </div>
                  
                  {/* Frete */}
                  <div className="flex justify-between items-center text-xs sm:text-sm md:text-sm lg:text-sm text-foreground/90">
                    <span>Frete</span>
                    {shipping && shipping.isValid ? (
                      <span className={shipping.isFree ? "text-green-600 font-semibold" : "text-foreground font-medium"}>
                        {shipping.isFree ? "GRÁTIS" : `R$ ${shipping.cost.toFixed(2)}`}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs sm:text-sm">Calcule acima</span>
                    )}
                  </div>
                  
                  {/* Linha divisória */}
                  <div className="border-t border-border pt-2 sm:pt-2 md:pt-2.5 mt-2 sm:mt-2 md:mt-2.5">
                    <div className="flex justify-between items-center font-heading text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl">
                      <span className="font-semibold">Total</span>
                      <span className="text-secondary font-bold">
                        R$ {shipping && shipping.isValid ? grandTotal.toFixed(2) : total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="space-y-2 sm:space-y-2 md:space-y-2.5">
                  <Button 
                    size="lg" 
                    onClick={handleCheckout}
                    className="w-full gradient-wine text-white hover:opacity-90 font-semibold text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base h-9 sm:h-10 md:h-11 lg:h-11 xl:h-12"
                  >
                    Finalizar Compra
                  </Button>
                  
                  <Link to="/catalogo" className="block">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="w-full text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base h-9 sm:h-10 md:h-11 lg:h-11 xl:h-12"
                    >
                      Continuar Comprando
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
