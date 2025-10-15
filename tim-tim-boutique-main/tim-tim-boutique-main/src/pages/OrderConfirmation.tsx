import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Package, MapPin, User, Phone, Mail, Home } from "lucide-react";

// Order type for confirmation page (read from sessionStorage)
interface OrderData {
  id: string;
  date: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  subtotal: number;
  shippingCost: number;
  shippingIsFree: boolean;
  total: number;
  estimatedDelivery: string;
  shippingAddress: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  customerInfo: {
    name: string;
    email?: string;
    phone: string;
  };
  status: string;
}

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    // Redirect to home if no order ID
    if (!orderId) {
      navigate("/");
      return;
    }

    // Get order details from sessionStorage (Requirements 1.4, 1.5)
    try {
      const orderJson = sessionStorage.getItem("tim-tim-last-order");
      if (!orderJson) {
        navigate("/");
        return;
      }

      const orderData = JSON.parse(orderJson) as OrderData;
      
      // Verify order ID matches
      if (orderData.id !== orderId) {
        navigate("/");
        return;
      }

      setOrder(orderData);
    } catch (error) {
      console.error("Error loading order:", error);
      navigate("/");
    }
  }, [orderId, navigate]);

  if (!order) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl mb-2">
            Pedido Confirmado!
          </h1>
          <p className="text-muted-foreground text-lg">
            Obrigado pela sua compra. Seu pedido foi recebido com sucesso.
          </p>
        </div>

        {/* Order Number */}
        <Card className="p-6 mb-6 bg-secondary/10 border-secondary">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Número do Pedido</p>
            <p className="font-heading text-2xl text-secondary">{order.id}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </Card>

        {/* Order Items */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-secondary" />
            <h2 className="font-heading text-xl">Itens do Pedido</h2>
          </div>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantidade: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-medium">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>R$ {order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frete</span>
              <span>R$ {order.shippingCost.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-heading text-lg">
              <span>Total</span>
              <span className="text-secondary">R$ {order.total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Customer Info */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-secondary" />
            <h2 className="font-heading text-xl">Informações do Cliente</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{order.customerInfo.name}</span>
            </div>
            {order.customerInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{order.customerInfo.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{order.customerInfo.phone}</span>
            </div>
          </div>
        </Card>

        {/* Shipping Address */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-secondary" />
            <h2 className="font-heading text-xl">Endereço de Entrega</h2>
          </div>
          <div className="text-muted-foreground">
            <p>{order.shippingAddress.street}, {order.shippingAddress.number}</p>
            {order.shippingAddress.complement && (
              <p>{order.shippingAddress.complement}</p>
            )}
            <p>{order.shippingAddress.neighborhood}</p>
            <p>
              {order.shippingAddress.city} - {order.shippingAddress.state}
            </p>
            <p>CEP: {order.shippingAddress.cep}</p>
          </div>
        </Card>

        {/* Payment Method */}
        <Card className="p-6 mb-8">
          <h2 className="font-heading text-xl mb-2">Forma de Pagamento</h2>
          <p className="text-muted-foreground">{order.paymentMethod}</p>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate("/perfil")}
            variant="outline"
            className="flex-1"
          >
            Ver Meus Pedidos
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="flex-1 gradient-wine text-white"
          >
            <Home className="mr-2 h-4 w-4" />
            Voltar para Home
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Você receberá atualizações sobre seu pedido por WhatsApp.
            <br />
            Em caso de dúvidas, entre em contato conosco.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
