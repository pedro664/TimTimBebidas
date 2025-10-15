import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, ChevronDown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MobileMenu from "@/components/MobileMenu";
import SearchBar from "@/components/SearchBar";
import { useEffect, useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const { itemCount } = useCart();
  const [animate, setAnimate] = useState(false);
  
  // Trigger animation when itemCount changes
  useEffect(() => {
    if (itemCount > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);
  
  const isActive = (path: string) => location.pathname === path;
  
  const navLinks = [
    { path: "/", label: "Início" },
    { path: "/catalogo", label: "Catálogo" },
    { path: "/sobre", label: "Sobre" },
    { path: "/contato", label: "Contato" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="w-full max-w-[1400px] mx-auto px-4 py-3 md:px-6 md:py-4 lg:px-6 lg:py-4">
        
        {/* ========== MOBILE: < 768px ========== */}
        <div className="flex md:hidden items-center justify-between w-full relative">
          {/* Menu Hambúrguer - Esquerda */}
          <div className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2">
            <MobileMenu navLinks={navLinks} />
          </div>

          {/* Logo - Centro (absolute para centralizar) */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <img 
              src="/logo-timtim.png" 
              alt="Tim Tim" 
              className="h-10 sm:h-12 w-auto transition-smooth group-hover:opacity-80" 
            />
          </Link>

          {/* Carrinho - Direita */}
          <Link 
            to="/carrinho" 
            className="relative min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 ml-auto"
            aria-label={`Carrinho de compras${itemCount > 0 ? ` com ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}` : ' vazio'}`}
          >
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-foreground hover:text-secondary transition-smooth" aria-hidden="true" />
            {itemCount > 0 && (
              <Badge 
                variant="destructive" 
                className={`absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs transition-all duration-300 ${
                  animate ? 'scale-125' : 'scale-100'
                }`}
                aria-hidden="true"
              >
                {itemCount}
              </Badge>
            )}
          </Link>
        </div>

        {/* ========== TABLET: 768px - 1023px ========== */}
        <div className="hidden md:flex lg:hidden items-center justify-between w-full relative">
          {/* Menu Hambúrguer - Esquerda */}
          <div className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2">
            <MobileMenu navLinks={navLinks} />
          </div>

          {/* Logo - Centro (absolute para centralizar) */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <img 
              src="/logo-timtim.png" 
              alt="Tim Tim" 
              className="h-14 w-auto transition-smooth group-hover:opacity-80" 
            />
          </Link>

          {/* Carrinho - Direita */}
          <Link 
            to="/carrinho" 
            className="relative min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 ml-auto"
            aria-label={`Carrinho de compras${itemCount > 0 ? ` com ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}` : ' vazio'}`}
          >
            <ShoppingCart className="h-6 w-6 text-foreground hover:text-secondary transition-smooth" aria-hidden="true" />
            {itemCount > 0 && (
              <Badge 
                variant="destructive" 
                className={`absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs transition-all duration-300 ${
                  animate ? 'scale-125' : 'scale-100'
                }`}
                aria-hidden="true"
              >
                {itemCount}
              </Badge>
            )}
          </Link>
        </div>

        {/* ========== DESKTOP: >= 1024px ========== */}
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:relative">
          {/* Logo - Esquerda */}
          <Link to="/" className="flex-shrink-0">
            <img 
              src="/logo-timtim.png" 
              alt="Tim Tim" 
              className="h-10 xl:h-14 2xl:h-16 w-auto transition-smooth hover:opacity-80" 
            />
          </Link>

          {/* Links de Navegação - Centro (absolute) */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-between w-[260px] xl:w-auto xl:gap-12 2xl:gap-14">
            {navLinks.map((link) => {
              if (link.path === "/catalogo") {
                return (
                  <div key={link.path} className="flex items-center -mr-5 xl:-mr-1">
                    <Link
                      to={link.path}
                      className={`font-body text-[13px] xl:text-base 2xl:text-lg tracking-wider transition-smooth whitespace-nowrap ${
                        isActive(link.path) ? "text-secondary" : "text-foreground hover:text-secondary"
                      }`}
                    >
                      {link.label}
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger 
                        className="text-foreground hover:text-secondary transition-smooth -ml-5 xl:ml-0"
                        aria-label="Menu de categorias"
                      >
                        <ChevronDown className="h-4 w-4 2xl:h-5 2xl:w-5" aria-hidden="true" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 bg-card/95 backdrop-blur-xl border-border/50 shadow-premium p-2">
                        <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3 text-sm hover:bg-secondary/10 hover:text-secondary transition-smooth">
                          <Link to="/catalogo">Todos os Produtos</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/30" />
                        <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3 text-sm hover:bg-secondary/10 hover:text-secondary transition-smooth">
                          <Link to="/catalogo?categoria=Vinho Tinto">Vinhos Tintos</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3 text-sm hover:bg-secondary/10 hover:text-secondary transition-smooth">
                          <Link to="/catalogo?categoria=Vinho Branco">Vinhos Brancos</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3 text-sm hover:bg-secondary/10 hover:text-secondary transition-smooth">
                          <Link to="/catalogo?categoria=Champagne">Champagnes</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3 text-sm hover:bg-secondary/10 hover:text-secondary transition-smooth">
                          <Link to="/catalogo?categoria=Espumante">Espumantes</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3 text-sm hover:bg-secondary/10 hover:text-secondary transition-smooth">
                          <Link to="/catalogo?categoria=Whisky">Whiskies</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3 text-sm hover:bg-secondary/10 hover:text-secondary transition-smooth">
                          <Link to="/catalogo?categoria=Cognac">Cognacs</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3 text-sm hover:bg-secondary/10 hover:text-secondary transition-smooth">
                          <Link to="/catalogo?categoria=Rum">Rums</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3 text-sm hover:bg-secondary/10 hover:text-secondary transition-smooth">
                          <Link to="/catalogo?categoria=Vodka">Vodkas</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3 text-sm hover:bg-secondary/10 hover:text-secondary transition-smooth">
                          <Link to="/catalogo?categoria=Gin">Gins</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              }
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-body text-[13px] xl:text-base 2xl:text-lg tracking-wider transition-smooth whitespace-nowrap ${
                    isActive(link.path) ? "text-secondary" : "text-foreground hover:text-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Ações - Direita */}
          <div className="flex items-center gap-2 xl:gap-4 2xl:gap-5 flex-shrink-0">
            {/* Barra de Pesquisa */}
            <SearchBar theme="light" className="w-36 xl:w-56 2xl:w-64" />

            {/* Carrinho */}
            <Link 
              to="/carrinho" 
              className="relative p-2 -m-2"
              aria-label={`Carrinho de compras${itemCount > 0 ? ` com ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}` : ' vazio'}`}
            >
              <ShoppingCart className="h-4 w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6 text-foreground hover:text-secondary transition-smooth" aria-hidden="true" />
              {itemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className={`absolute -top-1 -right-1 h-4 w-4 xl:h-5 xl:w-5 flex items-center justify-center p-0 text-[10px] xl:text-xs transition-all duration-300 ${
                    animate ? 'scale-125' : 'scale-100'
                  }`}
                  aria-hidden="true"
                >
                  {itemCount}
                </Badge>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
