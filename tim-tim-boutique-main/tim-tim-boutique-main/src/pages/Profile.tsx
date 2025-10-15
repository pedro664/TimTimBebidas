import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Package, Search } from "lucide-react";
import { toast } from "sonner";

// Temporary simplified Profile page - will be converted to order tracking in Task 9
const Profile = () => {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");

  const handleTrackOrder = () => {
    if (!orderNumber || !email) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    // TODO: Task 9 - Implement order tracking with Supabase
    toast.info("Funcionalidade de rastreamento será implementada na Task 9");
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-secondary/10 p-4">
              <Package className="h-16 w-16 text-secondary" />
            </div>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl mb-2">
            Rastrear Pedido
          </h1>
          <p className="text-muted-foreground text-lg">
            Acompanhe o status do seu pedido
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="orderNumber">Número do Pedido</Label>
              <Input
                id="orderNumber"
                placeholder="Ex: TIM-2024-001"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email usado na compra</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button
              onClick={handleTrackOrder}
              className="w-full gradient-wine text-white"
            >
              <Search className="mr-2 h-4 w-4" />
              Rastrear Pedido
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Esta funcionalidade será implementada na Task 9.
              <br />
              Por enquanto, você pode navegar pelo site sem necessidade de login.
            </p>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
          >
            Voltar para Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
