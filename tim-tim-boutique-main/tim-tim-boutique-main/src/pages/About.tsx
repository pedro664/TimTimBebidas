import { Award, Heart, Users, Wine, Shield, Sparkles } from "lucide-react";
import OptimizedImage from "@/components/OptimizedImage";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero com Logo como Background */}
      <section 
        className="relative min-h-screen h-screen flex items-end justify-center overflow-hidden pb-12 md:pb-20"
        style={{
          backgroundImage: 'url(/src/assets/logo-timtim-hero.png)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-background"></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <p className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white/95 max-w-4xl mx-auto leading-tight">
            Onde a excelência encontra a sofisticação
          </p>
        </div>
      </section>

      {/* Nossa Missão - Layout com Imagem */}
      <section className="py-16 md:py-24 lg:py-32 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden shadow-premium">
                <OptimizedImage
                  src="https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800&auto=format&fit=crop" 
                  alt="Coleção Premium"
                  className="w-full h-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8">
                Qualidade <span className="text-secondary">Incomparável</span>
              </h2>
              <div className="w-20 md:w-24 h-1 bg-gradient-wine mb-6 md:mb-8"></div>
              <p className="text-foreground/80 text-base sm:text-lg md:text-xl leading-relaxed mb-4 md:mb-6">
                A Tim Tim nasceu com o propósito de oferecer uma experiência única em bebidas premium. 
                Nosso compromisso é com a qualidade absoluta e a satisfação total de cada cliente.
              </p>
              <p className="text-foreground/70 text-base md:text-lg leading-relaxed">
                Cada produto em nosso catálogo é cuidadosamente selecionado, garantindo autenticidade, 
                procedência e uma experiência memorável em cada brinde.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores - Grid com Imagens de Fundo */}
      <section className="py-16 md:py-24 lg:py-32 px-4 sm:px-6 bg-card/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 md:mb-6">
              Nossos <span className="text-secondary">Princípios</span>
            </h2>
            <p className="text-foreground/70 text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
              Os valores que nos definem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Excelência */}
            <div className="relative h-[350px] sm:h-[400px] overflow-hidden group shadow-card">
              <OptimizedImage
                src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop" 
                alt="Excelência"
                className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <Award className="h-10 md:h-12 w-10 md:w-12 text-secondary mb-3 md:mb-4" />
                <h3 className="font-heading text-2xl md:text-3xl text-white mb-2 md:mb-3">Excelência</h3>
                <p className="text-white/90 text-sm md:text-base leading-relaxed">
                  Compromisso inabalável com a qualidade em cada produto
                </p>
              </div>
            </div>

            {/* Paixão */}
            <div className="relative h-[350px] sm:h-[400px] overflow-hidden group shadow-card">
              <OptimizedImage
                src="https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=600&auto=format&fit=crop" 
                alt="Paixão"
                className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <Heart className="h-10 md:h-12 w-10 md:w-12 text-secondary mb-3 md:mb-4" />
                <h3 className="font-heading text-2xl md:text-3xl text-white mb-2 md:mb-3">Paixão</h3>
                <p className="text-white/90 text-sm md:text-base leading-relaxed">
                  Amor genuíno por bebidas finas e pela arte da degustação
                </p>
              </div>
            </div>

            {/* Confiança */}
            <div className="relative h-[350px] sm:h-[400px] overflow-hidden group shadow-card">
              <OptimizedImage
                src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&auto=format&fit=crop" 
                alt="Confiança"
                className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <Users className="h-10 md:h-12 w-10 md:w-12 text-secondary mb-3 md:mb-4" />
                <h3 className="font-heading text-2xl md:text-3xl text-white mb-2 md:mb-3">Confiança</h3>
                <p className="text-white/90 text-sm md:text-base leading-relaxed">
                  Relacionamento transparente e duradouro com nossos clientes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compromisso - Layout Invertido com Imagem */}
      <section className="py-16 md:py-24 lg:py-32 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8">
                Garantias que <span className="text-secondary">Importam</span>
              </h2>
              <div className="w-20 md:w-24 h-1 bg-gradient-wine mb-8 md:mb-12"></div>
              
              <div className="space-y-6 md:space-y-8">
                <div className="flex gap-4 md:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                      <Shield className="h-6 w-6 md:h-8 md:w-8 text-secondary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl md:text-2xl mb-2 md:mb-3">Autenticidade Garantida</h3>
                    <p className="text-foreground/70 text-base md:text-lg leading-relaxed">
                      Todos os produtos são 100% autênticos com certificado de procedência
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 md:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-secondary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl md:text-2xl mb-2 md:mb-3">Qualidade Premium</h3>
                    <p className="text-foreground/70 text-base md:text-lg leading-relaxed">
                      Seleção criteriosa de produtos das melhores marcas e produtores
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 md:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                      <Heart className="h-6 w-6 md:h-8 md:w-8 text-secondary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl md:text-2xl mb-2 md:mb-3">Satisfação Total</h3>
                    <p className="text-foreground/70 text-base md:text-lg leading-relaxed">
                      Atendimento personalizado e suporte completo em toda sua jornada
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="relative h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden shadow-premium">
                <OptimizedImage
                  src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop" 
                  alt="Compromisso"
                  className="w-full h-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final com Imagem de Fundo */}
      <section className="relative py-16 md:py-24 lg:py-32 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0">
          <OptimizedImage
            src="https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=1920&auto=format&fit=crop" 
            alt="CTA Background"
            className="w-full h-full object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8 text-white">
            Pronto para uma experiência <span className="text-secondary">excepcional</span>?
          </h2>
          <p className="text-white/90 text-base sm:text-lg md:text-xl mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            Descubra nossa coleção exclusiva de vinhos, whiskies e destilados premium
          </p>
          <a 
            href="/catalogo" 
            className="inline-block px-8 md:px-12 py-4 md:py-5 gradient-wine text-white text-base md:text-lg font-semibold hover:opacity-90 transition-smooth shadow-premium"
          >
            Explorar Catálogo
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;
