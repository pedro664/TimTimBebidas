import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 md:px-8 lg:px-6 py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div>
            <Link to="/" className="inline-block mb-3 md:mb-4 group">
              <img 
                src="/logo-timtim.png" 
                alt="Tim Tim" 
                className="h-12 md:h-14 w-auto transition-smooth group-hover:opacity-80" 
              />
            </Link>
            <p className="text-muted-foreground text-sm md:text-[0.95rem] lg:text-base leading-relaxed">
              Celebre cada momento com sofisticação e exclusividade.
            </p>
          </div>
          
          <div>
            <h3 className="font-heading text-base md:text-[1.1rem] lg:text-lg mb-3 md:mb-4">Navegação</h3>
            <ul className="space-y-2 md:space-y-3 flex flex-col">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-secondary transition-smooth text-sm md:text-[0.95rem] lg:text-base block">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/catalogo" className="text-muted-foreground hover:text-secondary transition-smooth text-sm md:text-[0.95rem] lg:text-base block">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="text-muted-foreground hover:text-secondary transition-smooth text-sm md:text-[0.95rem] lg:text-base block">
                  Sobre
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-muted-foreground hover:text-secondary transition-smooth text-sm md:text-[0.95rem] lg:text-base block">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading text-base md:text-[1.1rem] lg:text-lg mb-3 md:mb-4">Categorias</h3>
            <ul className="space-y-2 md:space-y-3 flex flex-col">
              <li>
                <Link to="/catalogo?categoria=vinhos" className="text-muted-foreground hover:text-secondary transition-smooth text-sm md:text-[0.95rem] lg:text-base block">
                  Vinhos
                </Link>
              </li>
              <li>
                <Link to="/catalogo?categoria=whiskies" className="text-muted-foreground hover:text-secondary transition-smooth text-sm md:text-[0.95rem] lg:text-base block">
                  Whiskies
                </Link>
              </li>
              <li>
                <Link to="/catalogo?categoria=champagnes" className="text-muted-foreground hover:text-secondary transition-smooth text-sm md:text-[0.95rem] lg:text-base block">
                  Champagnes
                </Link>
              </li>
              <li>
                <Link to="/catalogo?categoria=destilados" className="text-muted-foreground hover:text-secondary transition-smooth text-sm md:text-[0.95rem] lg:text-base block">
                  Destilados
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading text-base md:text-[1.1rem] lg:text-lg mb-3 md:mb-4">Contato</h3>
            <div className="space-y-2 md:space-y-3 flex flex-col">
              <a 
                href="mailto:contato@timtim.com" 
                className="text-muted-foreground hover:text-secondary transition-smooth flex items-center gap-2 text-sm md:text-[0.95rem] lg:text-base font-body"
                aria-label="Email"
              >
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span className="font-body">contato@timtim.com</span>
              </a>
              <p className="text-muted-foreground text-sm md:text-[0.95rem] lg:text-base">
                Horário: Seg-Sex, 9h-18h
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-6 md:mt-8 pt-6 md:pt-8 text-center text-sm md:text-[0.95rem] lg:text-base text-muted-foreground">
          <p>© 2025 Tim Tim Bebidas. Todos os direitos reservados.</p>
          <p className="mt-2 text-xs md:text-sm">Beba com moderação. Venda proibida para menores de 18 anos.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
