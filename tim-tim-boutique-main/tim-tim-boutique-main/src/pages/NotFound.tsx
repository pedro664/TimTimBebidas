import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wine, Home, Search } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Wine className="h-24 w-24 mx-auto mb-6 text-muted-foreground opacity-50" />
          
          <h1 className="font-heading text-8xl mb-4 text-secondary">404</h1>
          
          <h2 className="font-heading text-3xl md:text-4xl mb-4">
            Página Não Encontrada
          </h2>
          
          <p className="text-muted-foreground text-lg mb-8">
            Parece que esta página não existe ou foi movida. 
            Que tal explorar nosso catálogo de bebidas premium?
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button size="lg" className="bg-primary hover:bg-accent w-full sm:w-auto">
                <Home className="mr-2 h-5 w-5" />
                Voltar ao Início
              </Button>
            </Link>
            
            <Link to="/catalogo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto hover-glow">
                <Search className="mr-2 h-5 w-5" />
                Explorar Catálogo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
