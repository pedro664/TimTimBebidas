import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/contexts/CartContext";
import { sessionService } from "@/services/sessionService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, ArrowLeft, Loader2, MapPin, Truck } from "lucide-react";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validations";
import { fetchAddressByCep } from "@/services/cepService";
import { maskCep, maskPhone } from "@/lib/masks";
import { toast as sonnerToast } from "sonner";
import { generateWhatsAppUrl, type OrderMessageData } from "@/lib/whatsappMessage";

const Checkout = () => {
  const { items, total, itemCount, clearCart, shipping, grandTotal } = useCart();
  const navigate = useNavigate();

  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // Initialize React Hook Form with Zod validation and real-time validation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting, touchedFields, dirtyFields },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange", // Enable real-time validation
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cep: shipping?.cep || "",
      address: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: shipping?.city || "",
      state: "",
    },
  });

  const cepValue = watch("cep");

  // Helper function to get field validation state
  const getFieldState = (fieldName: keyof CheckoutFormData) => {
    const hasError = !!errors[fieldName];
    const isTouched = touchedFields[fieldName];
    const isDirty = dirtyFields[fieldName];
    const fieldValue = watch(fieldName);

    // Show valid state only if field has value, is touched/dirty, and has no errors
    const isValid = !hasError && (isTouched || isDirty) && fieldValue && fieldValue.length > 0;

    return {
      hasError,
      isValid,
      className: hasError
        ? "border-destructive focus-visible:ring-destructive"
        : isValid
          ? "border-green-500 focus-visible:ring-green-500"
          : ""
    };
  };

  // Pre-fill CEP from shipping calculator if available
  useEffect(() => {
    if (shipping?.cep) {
      setValue("cep", shipping.cep);
    }
    if (shipping?.city) {
      setValue("city", shipping.city);
    }
  }, [shipping, setValue]);

  // Auto-fetch address when CEP is complete
  useEffect(() => {
    const fetchAddress = async () => {
      // Check if CEP is complete (8 digits)
      const cleanCep = cepValue?.replace(/\D/g, "") || "";
      if (cleanCep.length === 8) {
        setIsLoadingCep(true);
        const addressData = await fetchAddressByCep(cleanCep);

        if (addressData) {
          setValue("address", addressData.street);
          setValue("neighborhood", addressData.neighborhood);
          setValue("city", addressData.city);
          setValue("state", addressData.state);
          sonnerToast.success("Endereço encontrado!");
        } else {
          sonnerToast.error("CEP não encontrado. Preencha manualmente.");
        }
        setIsLoadingCep(false);
      }
    };

    fetchAddress();
  }, [cepValue, setValue]);



  const onSubmit = async (data: CheckoutFormData) => {
    try {
      // Validate shipping
      if (!shipping || !shipping.isValid) {
        sonnerToast.error("Por favor, calcule o frete no carrinho antes de finalizar a compra");
        navigate("/carrinho");
        return;
      }

      // Generate order ID
      const orderId = `TIM-${Date.now()}`;
      const orderDate = new Date().toISOString();

      // Calculate delivery time (2 hours from now)
      const deliveryTime = new Date();
      deliveryTime.setHours(deliveryTime.getHours() + 2);

      // Prepare WhatsApp message using centralized generator
      const messageData: OrderMessageData = {
        id: orderId,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal: total,
        shipping: {
          cep: shipping.cep,
          city: shipping.city,
          cost: shipping.cost,
          isFree: shipping.isFree,
        },
        total: grandTotal,
        customerInfo: {
          name: data.name,
          email: data.email || undefined,
          phone: data.phone,
        },
        shippingAddress: {
          cep: data.cep,
          street: data.address,
          number: data.number,
          complement: data.complement || undefined,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
        },
        estimatedDeliveryTime: deliveryTime,
      };

      // Generate WhatsApp URL with formatted message
      const whatsappUrl = generateWhatsAppUrl(messageData);

      // Open WhatsApp in new tab
      window.open(whatsappUrl, "_blank");

      // Show success toast
      sonnerToast.success("Pedido enviado para o WhatsApp!", {
        description: "Continue a compra pelo WhatsApp",
        duration: 5000,
      });

      // Clear cart and session AFTER opening WhatsApp
      sessionService.clearSession();
      clearCart();

      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Error creating order:", error);
      sonnerToast.error("Erro ao criar pedido. Tente novamente.");
    }
  };

  // Redirect to cart if empty (Requirement 6.5)
  useEffect(() => {
    if (items.length === 0) {
      sonnerToast.error("Seu carrinho está vazio", {
        description: "Adicione produtos ao carrinho antes de finalizar a compra",
      });
      navigate("/carrinho");
    }
  }, [items.length, navigate]);

  // Don't render form if cart is empty
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-20 lg:pb-20">
      <div className="container mx-auto px-4 sm:px-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/carrinho")}
          className="mb-4 md:mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Carrinho
        </Button>

        <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl mb-6 md:mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Warning if shipping not calculated */}
            {(!shipping || !shipping.isValid) && (
              <Card className="p-4 md:p-6 bg-secondary/5 border-secondary/20">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-base md:text-lg text-foreground mb-1">
                      Frete não calculado
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Por favor, volte ao carrinho e calcule o frete antes de finalizar a compra.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/carrinho")}
                      className="border-secondary/30 hover:bg-secondary/10"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar ao Carrinho
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-4 md:p-6 bg-card border-border">
              <h2 className="font-heading text-xl md:text-2xl mb-4 md:mb-6">Dados Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-base md:text-sm">
                    Nome Completo *
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Seu nome completo"
                      className={`h-12 md:h-10 text-base md:text-sm ${getFieldState("name").className}`}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      onChange={(e) => {
                        setValue("name", e.target.value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                      }}
                    />
                    {getFieldState("name").isValid && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </div>
                  {errors.name && (
                    <p id="name-error" className="text-sm text-destructive mt-1" role="alert">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email" className="text-base md:text-sm">
                    E-mail <span className="text-muted-foreground">(opcional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="seu@email.com"
                      className={`h-12 md:h-10 text-base md:text-sm ${getFieldState("email").className}`}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      onChange={(e) => {
                        setValue("email", e.target.value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                      }}
                    />
                    {getFieldState("email").isValid && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </div>
                  {errors.email && (
                    <p id="email-error" className="text-sm text-destructive mt-1" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="phone" className="text-base md:text-sm">
                    Telefone/WhatsApp *
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="Informe aqui o seu número de contato"
                      className={`h-12 md:h-10 text-base md:text-sm ${getFieldState("phone").className}`}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                      maxLength={15}
                      onChange={(e) => {
                        const masked = maskPhone(e.target.value);
                        setValue("phone", masked, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                      }}
                    />
                    {getFieldState("phone").isValid && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </div>
                  {errors.phone && (
                    <p id="phone-error" className="text-sm text-destructive mt-1" role="alert">
                      {errors.phone.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Formato: (00) 00000-0000
                  </p>
                </div>
              </div>
            </Card>



            <Card className="p-4 md:p-6 bg-card border-border">
              <h2 className="font-heading text-xl md:text-2xl mb-4 md:mb-6">Endereço de Entrega</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="cep" className="text-base md:text-sm">
                    CEP * {isLoadingCep && <span className="text-muted-foreground">(buscando...)</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      id="cep"
                      {...register("cep")}
                      placeholder="00000-000"
                      className={`h-12 md:h-10 text-base md:text-sm ${getFieldState("cep").className}`}
                      aria-invalid={!!errors.cep}
                      aria-describedby={errors.cep ? "cep-error" : "cep-help"}
                      maxLength={9}
                      onChange={(e) => {
                        const masked = maskCep(e.target.value);
                        setValue("cep", masked, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                      }}
                    />
                    {getFieldState("cep").isValid && !isLoadingCep && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" aria-hidden="true">
                        ✓
                      </span>
                    )}
                    {isLoadingCep && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {errors.cep && (
                    <p id="cep-error" className="text-sm text-destructive mt-1" role="alert">
                      {errors.cep.message}
                    </p>
                  )}
                  {!errors.cep && shipping?.cep && (
                    <p id="cep-help" className="text-xs text-muted-foreground mt-1">
                      <MapPin className="inline h-3 w-3 mr-1" />
                      Frete já calculado para este CEP
                    </p>
                  )}
                  {!errors.cep && !shipping?.cep && (
                    <p id="cep-help" className="text-xs text-muted-foreground mt-1">
                      Formato: 00000-000
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3">
                    <Label htmlFor="address" className="text-base md:text-sm">Endereço *</Label>
                    <div className="relative">
                      <Input
                        id="address"
                        {...register("address")}
                        placeholder="Rua, Avenida, etc."
                        className={`h-12 md:h-10 text-base md:text-sm ${getFieldState("address").className}`}
                        aria-invalid={!!errors.address}
                        aria-describedby={errors.address ? "address-error" : undefined}
                        disabled={isLoadingCep}
                        onChange={(e) => {
                          setValue("address", e.target.value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                        }}
                      />
                      {getFieldState("address").isValid && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" aria-hidden="true">
                          ✓
                        </span>
                      )}
                    </div>
                    {errors.address && (
                      <p id="address-error" className="text-sm text-destructive mt-1" role="alert">
                        {errors.address.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="number" className="text-base md:text-sm">Número *</Label>
                    <div className="relative">
                      <Input
                        id="number"
                        {...register("number")}
                        placeholder="123"
                        className={`h-12 md:h-10 text-base md:text-sm ${getFieldState("number").className}`}
                        aria-invalid={!!errors.number}
                        aria-describedby={errors.number ? "number-error" : undefined}
                        maxLength={10}
                        onChange={(e) => {
                          setValue("number", e.target.value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                        }}
                      />
                      {getFieldState("number").isValid && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" aria-hidden="true">
                          ✓
                        </span>
                      )}
                    </div>
                    {errors.number && (
                      <p id="number-error" className="text-sm text-destructive mt-1" role="alert">
                        {errors.number.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="complement" className="text-base md:text-sm">
                    Complemento <span className="text-muted-foreground">(opcional)</span>
                  </Label>
                  <Input
                    id="complement"
                    {...register("complement")}
                    placeholder="Apto, Bloco, etc."
                    className="h-12 md:h-10 text-base md:text-sm"
                    maxLength={100}
                    onChange={(e) => {
                      setValue("complement", e.target.value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="neighborhood" className="text-base md:text-sm">Bairro *</Label>
                    <div className="relative">
                      <Input
                        id="neighborhood"
                        {...register("neighborhood")}
                        placeholder="Bairro"
                        className={`h-12 md:h-10 text-base md:text-sm ${getFieldState("neighborhood").className}`}
                        aria-invalid={!!errors.neighborhood}
                        aria-describedby={errors.neighborhood ? "neighborhood-error" : undefined}
                        disabled={isLoadingCep}
                        onChange={(e) => {
                          setValue("neighborhood", e.target.value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                        }}
                      />
                      {getFieldState("neighborhood").isValid && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" aria-hidden="true">
                          ✓
                        </span>
                      )}
                    </div>
                    {errors.neighborhood && (
                      <p id="neighborhood-error" className="text-sm text-destructive mt-1" role="alert">
                        {errors.neighborhood.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-base md:text-sm">Cidade *</Label>
                    <div className="relative">
                      <Input
                        id="city"
                        {...register("city")}
                        placeholder="Cidade"
                        className={`h-12 md:h-10 text-base md:text-sm ${getFieldState("city").className}`}
                        aria-invalid={!!errors.city}
                        aria-describedby={errors.city ? "city-error" : undefined}
                        disabled={isLoadingCep}
                        onChange={(e) => {
                          setValue("city", e.target.value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                        }}
                      />
                      {getFieldState("city").isValid && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" aria-hidden="true">
                          ✓
                        </span>
                      )}
                    </div>
                    {errors.city && (
                      <p id="city-error" className="text-sm text-destructive mt-1" role="alert">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-base md:text-sm">Estado *</Label>
                    <div className="relative">
                      <Input
                        id="state"
                        {...register("state")}
                        placeholder="SP"
                        maxLength={2}
                        className={`h-12 md:h-10 text-base md:text-sm uppercase ${getFieldState("state").className}`}
                        aria-invalid={!!errors.state}
                        aria-describedby={errors.state ? "state-error" : "state-help"}
                        disabled={isLoadingCep}
                        onChange={(e) => {
                          const upperValue = e.target.value.toUpperCase();
                          setValue("state", upperValue, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                        }}
                      />
                      {getFieldState("state").isValid && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" aria-hidden="true">
                          ✓
                        </span>
                      )}
                    </div>
                    {errors.state && (
                      <p id="state-error" className="text-sm text-destructive mt-1" role="alert">
                        {errors.state.message}
                      </p>
                    )}
                    {!errors.state && (
                      <p id="state-help" className="text-xs text-muted-foreground mt-1"></p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-4 md:p-6 bg-card border-border lg:sticky lg:top-24">
              <h2 className="font-heading text-xl md:text-2xl mb-4 md:mb-6">Resumo do Pedido</h2>
              <div className="space-y-2 md:space-y-3 mb-3 md:mb-4 lg:mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs md:text-sm">
                      <span className="text-foreground/90">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-body">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
              </div>

              <Separator className="my-2 md:my-3 lg:my-4" />

              <div className="space-y-2 md:space-y-3 mb-3 md:mb-4 lg:mb-6">
                  <div className="flex justify-between text-xs md:text-sm text-foreground/90">
                    <span>Subtotal ({itemCount} itens)</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm text-foreground/90">
                    <span>Frete</span>
                    {shipping && shipping.isValid ? (
                      <span className={shipping.isFree ? "text-green-600 font-semibold" : "text-foreground"}>
                        {shipping.isFree ? "GRÁTIS" : `R$ ${shipping.cost.toFixed(2)}`}
                      </span>
                    ) : (
                      <span className="text-destructive">Não calculado</span>
                    )}
                  </div>
                  <Separator />
                  <div className="flex justify-between font-heading text-base md:text-lg lg:text-xl">
                    <span>Total</span>
                    <span className="text-secondary">
                      R$ {shipping && shipping.isValid ? grandTotal.toFixed(2) : total.toFixed(2)}
                    </span>
                  </div>
                  {shipping && shipping.isValid && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <Truck className="h-3 w-3" />
                      <span>Entrega em até 2 horas</span>
                    </div>
                  )}
              </div>

              <Button
                  type="button"
                  size="lg"
                  disabled={isSubmitting || isLoadingCep || !shipping || !shipping.isValid}
                  onClick={handleSubmit(onSubmit)}
                  className="w-full gradient-wine text-white hover:opacity-90 font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Finalizar via WhatsApp
                    </>
                  )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-2 md:mt-3 lg:mt-4">
                Você será redirecionado para o WhatsApp para confirmar seu pedido
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
