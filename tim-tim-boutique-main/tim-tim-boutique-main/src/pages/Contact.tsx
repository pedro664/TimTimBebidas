import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { contactSchema, type ContactFormData } from "@/lib/validations";
import { storageService } from "@/services/localStorage";
import type { ContactMessage } from "@/types";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      // Create contact message object
      const contactMessage: ContactMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        createdAt: new Date().toISOString(),
        read: false,
      };

      // Save to localStorage
      const saved = storageService.saveContactMessage(contactMessage);

      if (!saved) {
        throw new Error("Erro ao salvar mensagem");
      }

      // Show success toast
      toast.success("Mensagem enviada com sucesso!", {
        description: "Entraremos em contato em breve.",
      });

      // Clear form
      reset();
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Erro ao enviar mensagem", {
        description: "Por favor, tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppDirect = () => {
    const whatsappUrl = "https://wa.me/5581995985278?text=Olá!%20Gostaria%20de%20mais%20informações.";
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-24 md:pt-28 lg:pt-40 pb-10 md:pb-14 lg:pb-20 px-4 md:px-8 lg:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-[2.75rem] lg:text-6xl xl:text-7xl mb-4 md:mb-5 lg:mb-6">
              Fale <span className="text-secondary">Conosco</span>
            </h1>
            <p className="text-foreground/70 text-base sm:text-lg md:text-[1.1rem] lg:text-xl max-w-3xl mx-auto leading-relaxed">
              Estamos prontos para atendê-lo. Entre em contato e descubra como podemos ajudar.
            </p>
          </div>
        </div>
      </section>

      {/* Formulário e Informações */}
      <section className="py-10 md:py-14 lg:py-20 px-4 md:px-8 lg:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14 lg:gap-16">
            {/* Formulário */}
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl md:text-[2.25rem] lg:text-4xl mb-5 md:mb-7 lg:mb-8">
                Envie sua <span className="text-secondary">Mensagem</span>
              </h2>
              <div className="w-20 md:w-24 h-1 bg-gradient-wine mb-6 md:mb-10 lg:mb-12"></div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
                <div>
                  <Label htmlFor="name" className="text-base md:text-lg mb-2 md:mb-3 block text-foreground/70">
                    Nome Completo
                  </Label>
                  <input
                    id="name"
                    {...register("name")}
                    placeholder="Seu nome"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className={`w-full h-12 md:h-auto bg-transparent border-0 border-b text-foreground placeholder:text-muted-foreground pb-2 md:pb-2 focus:outline-none font-body text-base md:text-lg ${errors.name ? "border-red-500 focus:border-red-500" : "border-border focus:border-secondary"
                      }`}
                  />
                  {errors.name && (
                    <p id="name-error" role="alert" className="text-red-500 text-sm mt-2">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-base md:text-lg mb-2 md:mb-3 block text-foreground/70">
                    Email
                  </Label>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="seu@email.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={`w-full h-12 md:h-auto bg-transparent border-0 border-b text-foreground placeholder:text-muted-foreground pb-2 md:pb-2 focus:outline-none font-body text-base md:text-lg ${errors.email ? "border-red-500 focus:border-red-500" : "border-border focus:border-secondary"
                      }`}
                  />
                  {errors.email && (
                    <p id="email-error" role="alert" className="text-red-500 text-sm mt-2">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="subject" className="text-base md:text-lg mb-2 md:mb-3 block text-foreground/70">
                    Assunto
                  </Label>
                  <input
                    id="subject"
                    {...register("subject")}
                    placeholder="Como podemos ajudar?"
                    aria-invalid={!!errors.subject}
                    aria-describedby={errors.subject ? "subject-error" : undefined}
                    className={`w-full h-12 md:h-auto bg-transparent border-0 border-b text-foreground placeholder:text-muted-foreground pb-2 md:pb-2 focus:outline-none font-body text-base md:text-lg ${errors.subject ? "border-red-500 focus:border-red-500" : "border-border focus:border-secondary"
                      }`}
                  />
                  {errors.subject && (
                    <p id="subject-error" role="alert" className="text-red-500 text-sm mt-2">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="message" className="text-base md:text-lg mb-2 md:mb-3 block text-foreground/70">
                    Mensagem
                  </Label>
                  <textarea
                    id="message"
                    {...register("message")}
                    placeholder="Conte-nos mais sobre sua necessidade..."
                    rows={6}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "message-error" : undefined}
                    className={`w-full min-h-[120px] bg-transparent border-0 border-b text-foreground placeholder:text-muted-foreground pb-2 md:pb-2 focus:outline-none font-body text-base md:text-lg resize-none ${errors.message ? "border-red-500 focus:border-red-500" : "border-border focus:border-secondary"
                      }`}
                  />
                  {errors.message && (
                    <p id="message-error" role="alert" className="text-red-500 text-sm mt-2">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full h-12 md:h-auto gradient-wine text-white hover:opacity-90 font-semibold text-base md:text-lg py-4 md:py-6 shadow-premium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Mensagem"
                  )}
                </Button>
              </form>
            </div>

            {/* Informações de Contato */}
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl mb-6 md:mb-8">
                Outras formas de <span className="text-secondary">Contato</span>
              </h2>
              <div className="w-20 md:w-24 h-1 bg-gradient-wine mb-8 md:mb-12"></div>

              <div className="space-y-6 md:space-y-8">
                {/* WhatsApp */}
                <div className="flex gap-4 md:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 md:h-8 md:w-8 text-secondary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl md:text-2xl mb-2 md:mb-3">WhatsApp</h3>
                    <p className="text-foreground/70 text-base md:text-lg mb-3 md:mb-4">
                      Fale conosco agora mesmo
                    </p>
                    <Button
                      onClick={handleWhatsAppDirect}
                      className="h-12 md:h-10 gradient-wine text-white hover:opacity-90 font-semibold text-base md:text-sm"
                    >
                      Abrir WhatsApp
                    </Button>
                  </div>
                </div>

                {/* Telefone */}
                <div className="flex gap-4 md:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                      <Phone className="h-6 w-6 md:h-8 md:w-8 text-secondary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl md:text-2xl mb-2 md:mb-3">Telefone</h3>
                    <p className="text-foreground/90 text-lg md:text-xl">(81) 99598-5278</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4 md:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                      <Mail className="h-6 w-6 md:h-8 md:w-8 text-secondary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl md:text-2xl mb-2 md:mb-3">Email</h3>
                    <p className="text-foreground/90 text-base md:text-lg break-all">contato@timtimbebidas.com.br</p>
                  </div>
                </div>

                {/* Localização */}
                <div className="flex gap-4 md:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                      <MapPin className="h-6 w-6 md:h-8 md:w-8 text-secondary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl md:text-2xl mb-2 md:mb-3">Localização</h3>
                    <p className="text-foreground/90 text-base md:text-lg">
                      Avenida Visconde de São Leopoldo, 31<br />
                      Recife - PE<br />
                      CEP 50730-121
                    </p>
                  </div>
                </div>

                {/* Horário */}
                <div className="flex gap-4 md:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                      <Clock className="h-6 w-6 md:h-8 md:w-8 text-secondary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl md:text-2xl mb-2 md:mb-3">Horário</h3>
                    <p className="text-foreground/90 text-base md:text-lg">
                      Segunda a Sexta: 9h - 18h<br />
                      Sábado: 10h - 16h<br />
                      Domingo: 10h - 14h
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA com Imagem de Fundo */}
      <section className="relative py-16 md:py-24 lg:py-32 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1920&q=80"
            alt="Contato"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl mb-6 md:mb-8 text-white">
            Pronto para descobrir nossa <span className="text-secondary">coleção</span>?
          </h2>
          <p className="text-white/90 text-base sm:text-lg md:text-xl mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            Explore nosso catálogo exclusivo de bebidas premium
          </p>
          <a
            href="/catalogo"
            className="inline-block px-8 md:px-12 py-4 md:py-5 gradient-wine text-white text-base md:text-lg font-semibold hover:opacity-90 transition-smooth shadow-premium"
          >
            Ver Catálogo
          </a>
        </div>
      </section>
    </div>
  );
};

export default Contact;
