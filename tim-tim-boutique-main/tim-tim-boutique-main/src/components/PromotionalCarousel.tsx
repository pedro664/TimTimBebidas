import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import OptimizedImage from "@/components/OptimizedImage";

interface Promotion {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  discount: string;
  image: string;
  cta: string;
  link: string;
  bgGradient: string;
}

const promotions: Promotion[] = [
  {
    id: 1,
    title: "Experiência Premium",
    subtitle: "Bebidas Selecionadas",
    description: "Descubra nossa curadoria exclusiva de vinhos, whiskies e destilados de alta qualidade",
    discount: "Novidades",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
    cta: "Explorar Catálogo",
    link: "/catalogo",
    bgGradient: "from-[#722F37]/20 to-[#722F37]/5"
  },
  {
    id: 2,
    title: "Momentos Especiais",
    subtitle: "Para Celebrar",
    description: "Champagnes, espumantes e vinhos premium para tornar suas ocasiões inesquecíveis",
    discount: "Entrega Rápida",
    image: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800&q=80",
    cta: "Ver Seleção",
    link: "/catalogo?categoria=Champagne",
    bgGradient: "from-[#722F37]/20 to-[#722F37]/5"
  },
  {
    id: 3,
    title: "Destilados Exclusivos",
    subtitle: "Para Conhecedores",
    description: "Whiskies, cognacs e destilados raros de produtores renomados ao redor do mundo",
    discount: "Edições Limitadas",
    image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80",
    cta: "Descobrir Mais",
    link: "/catalogo?categoria=Whisky",
    bgGradient: "from-[#722F37]/20 to-[#722F37]/5"
  }
];

const PromotionalCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px) to trigger slide change
  const minSwipeDistance = 50;

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promotions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promotions.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promotions.length) % promotions.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  // Touch event handlers for swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <div className="relative overflow-hidden bg-card">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="relative">
          {/* Slides */}
          <div 
            className="relative min-h-[450px] md:min-h-[500px] lg:min-h-[520px] overflow-hidden touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {promotions.map((promo, index) => (
              <div
                key={promo.id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out carousel-slide ${index === currentSlide
                  ? "opacity-100 translate-x-0"
                  : index < currentSlide
                    ? "opacity-0 -translate-x-full"
                    : "opacity-0 translate-x-full"
                  }`}
              >
                <div className={`h-full bg-gradient-to-r ${promo.bgGradient} rounded-xl overflow-hidden`}>
                  {/* Layout responsivo */}
                  <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 h-full items-center justify-center p-6 md:p-10 lg:p-14">
                    {/* Content - Lado esquerdo */}
                    <div className="flex flex-col justify-center space-y-5 md:space-y-6 lg:space-y-7 max-w-xl">
                      <div className="space-y-3 md:space-y-4">
                        <span className="inline-block px-4 py-1.5 bg-secondary text-secondary-foreground text-xs md:text-sm font-body font-semibold uppercase tracking-wider rounded-md">
                          {promo.discount}
                        </span>
                        <h3 className="font-heading text-3xl md:text-4xl lg:text-5xl leading-tight text-foreground">
                          {promo.title}
                        </h3>
                        <p className="text-lg md:text-xl text-secondary font-body font-medium uppercase tracking-wide">
                          {promo.subtitle}
                        </p>
                        <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                          {promo.description}
                        </p>
                      </div>
                      <div>
                        <Link to={promo.link}>
                          <Button
                            size="lg"
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-body font-semibold uppercase tracking-wider w-full md:w-auto px-8 py-6 text-sm md:text-base touch-target transition-all"
                          >
                            {promo.cta}
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Image - Lado direito, hidden no mobile */}
                    <div className="hidden md:flex items-center justify-center">
                      <div className="w-full max-w-[550px] lg:max-w-[650px]">
                        <OptimizedImage
                          src={promo.image}
                          alt={promo.title}
                          className="w-full h-auto aspect-video object-cover rounded-xl shadow-2xl"
                          sizes="(max-width: 1024px) 550px, 650px"
                          priority={index === 0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows - 48x48px for tablets */}
          <button
            onClick={prevSlide}
            className="absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 bg-background/60 hover:bg-background/90 p-2 md:p-3 rounded-full shadow-md transition-all duration-200 ease-in-out z-10 opacity-70 hover:opacity-100 active:scale-95 min-w-[40px] min-h-[40px] md:min-w-[48px] md:min-h-[48px]"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 bg-background/60 hover:bg-background/90 p-2 md:p-3 rounded-full shadow-md transition-all duration-200 ease-in-out z-10 opacity-70 hover:opacity-100 active:scale-95 min-w-[40px] min-h-[40px] md:min-w-[48px] md:min-h-[48px]"
            aria-label="Próximo slide"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          {/* Dots Indicator - Optimized for tablets */}
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-2.5 z-10">
            {promotions.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all duration-300 ease-in-out shadow-sm ${index === currentSlide
                  ? "h-2 w-7 md:h-2.5 md:w-8 bg-secondary"
                  : "h-2 w-2 md:h-2.5 md:w-2.5 bg-background/60 hover:bg-background/80 border border-secondary/30"
                  }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionalCarousel;
