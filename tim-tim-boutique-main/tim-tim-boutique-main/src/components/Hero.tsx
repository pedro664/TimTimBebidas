import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import HeroNavbar from "@/components/HeroNavbar";
import heroImage from "@/assets/hero-background.png";

const Hero = () => {
  return (
    <section className="hero-section relative w-full min-h-screen" style={{ height: '100vh' }}>
      {/* Background */}
      <div 
        className="hero-background absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          height: '100%'
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/70" style={{ width: '100%', height: '100%' }} />

      {/* Navbar - absolute no topo */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <HeroNavbar />
      </div>

      {/* Conteúdo - centralizado verticalmente */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-6 sm:px-8 md:px-12 lg:px-12 py-0 md:py-0">
        <div className="w-full max-w-6xl mx-auto text-center">
          {/* Título */}
          <h1 className="hero-title font-heading text-[2.5rem] sm:text-5xl md:text-[3rem] lg:text-6xl xl:text-7xl mb-6 sm:mb-6 md:mb-8 lg:mb-8 text-white leading-[1.1] animate-in fade-in duration-1000">
            Celebre cada momento com
            <span className="block text-secondary mt-3 md:mt-4 lg:mt-4">sofisticação</span>
          </h1>
          
          {/* Subtítulo */}
          <p className="hero-subtitle text-xl sm:text-2xl md:text-[1.5rem] lg:text-2xl text-white/90 mb-10 sm:mb-12 md:mb-12 lg:mb-14 max-w-2xl md:max-w-4xl lg:max-w-3xl mx-auto animate-in fade-in duration-1000 delay-200 leading-relaxed">
            Curadoria exclusiva de vinhos, whiskies e destilados.
          </p>
          
          {/* Botões */}
          <div className="hero-buttons flex flex-row gap-2 sm:gap-4 md:gap-5 justify-center items-center animate-in fade-in duration-1000 delay-400">
            <Link to="/catalogo" className="w-auto">
              <Button 
                size="lg"
                className="hero-button bg-secondary hover:bg-secondary/90 text-secondary-foreground font-body uppercase tracking-wider w-auto h-11 sm:h-13 md:h-13 lg:h-14 text-xs sm:text-[0.9375rem] md:text-base lg:text-lg px-4 sm:px-8 md:px-10 lg:px-12"
              >
                Explorar
                <ArrowRight className="ml-1.5 h-4 w-4 sm:h-6 sm:w-6 md:h-6 md:w-6" />
              </Button>
            </Link>
            <Link to="/sobre" className="w-auto">
              <Button 
                size="lg"
                variant="outline" 
                className="hero-button border-white/30 text-white hover:bg-white/10 hover:text-white font-body uppercase tracking-wider w-auto h-11 sm:h-13 md:h-13 lg:h-14 text-xs sm:text-[0.9375rem] md:text-base lg:text-lg px-4 sm:px-8 md:px-10 lg:px-12"
              >
                Conheça-nos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
