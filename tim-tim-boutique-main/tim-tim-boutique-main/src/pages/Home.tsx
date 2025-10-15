import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Hero from "@/components/Hero";

// Lazy load PromotionalCarousel for better initial page load
const PromotionalCarousel = lazy(() => import("@/components/PromotionalCarousel"));

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section com Header Integrado */}
      <Hero />

      {/* Promotional Carousel - Lazy loaded */}
      <Suspense fallback={
        <div className="bg-card py-16">
          <div className="container mx-auto px-6 text-center">
            <div className="h-[400px] md:h-[450px] flex items-center justify-center">
              <p className="text-muted-foreground">Carregando promoções...</p>
            </div>
          </div>
        </div>
      }>
        <PromotionalCarousel />
      </Suspense>

      {/* CTA Section */}
      <section className="py-12 md:py-16 lg:py-20 gradient-hero">
        <div className="container mx-auto px-4 md:px-8 lg:px-6 text-center">
          <h2 className="font-heading text-3xl md:text-[2.5rem] lg:text-5xl mb-4 md:mb-5 lg:mb-6">
            Tim Tim à sua experiência de sabor
          </h2>
          <p className="text-base md:text-[1.1rem] lg:text-xl text-foreground/90 mb-6 md:mb-7 lg:mb-8 max-w-xl md:max-w-2xl mx-auto px-4 md:px-0 leading-relaxed">
            Descubra o prazer de degustar bebidas selecionadas por especialistas
          </p>
          <Link to="/contato">
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-body uppercase tracking-wider text-sm md:text-[0.95rem] lg:text-base h-11 md:h-[52px] lg:h-12 px-6 md:px-10 lg:px-6">
              Entre em Contato
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
