import { Link } from "react-router-dom";
import { Menu, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavLink {
  path: string;
  label: string;
}

interface MobileMenuProps {
  navLinks: NavLink[];
  theme?: "light" | "dark";
}

const MobileMenu = ({ navLinks, theme = "light" }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const iconColor = theme === "dark" ? "text-white" : "text-foreground";

  const categories = [
    { label: "Todos os Produtos", path: "/catalogo" },
    { label: "Vinhos Tintos", path: "/catalogo?categoria=Vinho Tinto" },
    { label: "Vinhos Brancos", path: "/catalogo?categoria=Vinho Branco" },
    { label: "Champagnes", path: "/catalogo?categoria=Champagne" },
    { label: "Espumantes", path: "/catalogo?categoria=Espumante" },
    { label: "Whiskies", path: "/catalogo?categoria=Whisky" },
    { label: "Cognacs", path: "/catalogo?categoria=Cognac" },
    { label: "Rums", path: "/catalogo?categoria=Rum" },
    { label: "Vodkas", path: "/catalogo?categoria=Vodka" },
    { label: "Gins", path: "/catalogo?categoria=Gin" },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
    setIsCategoriesOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`touch-target flex-shrink-0 ${theme === "dark" ? "hover:bg-white/10" : ""}`}
          aria-label="Abrir menu"
        >
          <Menu className={`h-6 w-6 ${iconColor}`} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle className="text-left">
            <Link to="/" onClick={handleLinkClick} className="flex items-center gap-2">
              <img
                src="/src/assets/logo-timtim.png"
                alt="Tim Tim"
                className="h-12 w-auto"
              />
            </Link>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 mt-8">
          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              if (link.path === "/catalogo") {
                return (
                  <Collapsible
                    key={link.path}
                    open={isCategoriesOpen}
                    onOpenChange={setIsCategoriesOpen}
                  >
                    <CollapsibleTrigger 
                      className="flex items-center justify-between w-full min-h-[48px] py-3 px-4 text-base font-body tracking-wider hover:bg-secondary/10 hover:text-secondary transition-smooth rounded-md"
                      aria-expanded={isCategoriesOpen}
                      aria-label="Menu de categorias"
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isCategoriesOpen ? "rotate-180" : ""
                          }`}
                        aria-hidden="true"
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 ml-4 flex flex-col gap-2">
                      {categories.map((category) => (
                        <Link
                          key={category.path}
                          to={category.path}
                          onClick={handleLinkClick}
                          className="min-h-[48px] py-3 px-4 text-sm font-body hover:bg-secondary/10 hover:text-secondary transition-smooth rounded-md flex items-center"
                        >
                          {category.label}
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                );
              }
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={handleLinkClick}
                  className="min-h-[48px] py-3 px-4 text-base font-body tracking-wider hover:bg-secondary/10 hover:text-secondary transition-smooth rounded-md flex items-center"
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Separator />

          {/* Search Bar */}
          <div>
            <label htmlFor="mobile-search" className="sr-only">Pesquisar produtos</label>
            <input
              id="mobile-search"
              type="search"
              placeholder="Pesquisar produtos..."
              aria-label="Pesquisar produtos"
              className="w-full min-h-[48px] px-4 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 font-body text-base"
            />
          </div>

          <Separator />

          {/* Admin Link - Discreto */}
          <div className="pt-4">
            <Link
              to="/admin/login"
              onClick={handleLinkClick}
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-smooth px-4"
              aria-label="Acesso administrativo"
            >
              Acesso Admin
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
