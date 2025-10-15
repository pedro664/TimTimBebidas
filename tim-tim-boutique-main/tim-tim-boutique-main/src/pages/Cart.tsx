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
    <div className="min-h-screen pt-40 pb-20">
      <div className="container mx-auto px-6">
        <h1 className="font-heading text-4xl mb-8">Carrinho de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32 lg:pb-0">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={removeItem}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="
              fixed bottom-0 left-0 right-0 
              lg:static
              p-4 lg:p-6 
              bg-card border-border
              border-t-2 lg:border-t
              rounded-t-xl lg:rounded-xl
              shadow-2xl lg:shadow-sm
              z-50
              max-h-[90vh] overflow-y-auto
            ">
              <h2 className="font-heading text-xl lg:text-2xl mb-4 lg:mb-6">Resumo do Pedido</h2>
              
              {/* Shipping Calculator */}
              <div className="mb-6">
                <ShippingCalculator 
                  subtotal={total}
                  onShippingCalculated={handleShippingCalculated}
                />
              </div>

              <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
                <div className="flex justify-between text-sm lg:text-base text-foreground/90">
                  <span>Produtos ({itemCount})</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm lg:text-base text-foreground/90">
                  <span>Frete</span>
                  {shipping && shipping.isValid ? (
                    <span className={shipping.isFree ? "text-green-600 font-semibold" : "text-foreground"}>
                      {shipping.isFree ? "GRÁTIS" : `R$ ${shipping.cost.toFixed(2)}`}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Calcule acima</span>
                  )}
                </div>
                <div className="border-t border-border pt-2 lg:pt-3 mt-2 lg:mt-3">
                  <div className="flex justify-between font-heading text-lg lg:text-xl">
                    <span>Total</span>
                    <span className="text-secondary">
                      R$ {shipping && shipping.isValid ? grandTotal.toFixed(2) : total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Button 
                size="lg" 
                onClick={handleCheckout}
                className="w-full gradient-wine text-white hover:opacity-90 mb-2 lg:mb-3 font-semibold h-12 lg:h-11"
              >
                Finalizar Compra
              </Button>
              
              <Link to="/catalogo" className="hidden lg:block">
                <Button size="lg" variant="outline" className="w-full">
                  Continuar Comprando
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
