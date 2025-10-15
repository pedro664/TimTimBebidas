import { z } from "zod";

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register validation schema with password strength
export const registerSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(6, "Senha deve ter no mínimo 6 caracteres")
      .regex(/[a-zA-Z]/, "Senha deve conter pelo menos uma letra")
      .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Checkout validation schema with enhanced validation
export const checkoutSchema = z.object({
  name: z
    .string()
    .min(1, "Nome completo é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome muito longo")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal(""))
    .transform(val => val === "" ? undefined : val),
  phone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .regex(
      /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      "Telefone inválido. Use o formato (00) 00000-0000 ou (00) 0000-0000"
    )
    .refine(
      (val) => {
        const numbers = val.replace(/\D/g, "");
        return numbers.length === 10 || numbers.length === 11;
      },
      { message: "Telefone deve ter 10 ou 11 dígitos" }
    ),
  cep: z
    .string()
    .min(1, "CEP é obrigatório")
    .regex(/^\d{5}-\d{3}$/, "CEP inválido. Use o formato 00000-000")
    .refine(
      (val) => {
        const numbers = val.replace(/\D/g, "");
        return numbers.length === 8;
      },
      { message: "CEP deve ter 8 dígitos" }
    ),
  address: z
    .string()
    .min(1, "Endereço é obrigatório")
    .min(5, "Endereço deve ter pelo menos 5 caracteres")
    .max(200, "Endereço muito longo"),
  number: z
    .string()
    .min(1, "Número é obrigatório")
    .max(10, "Número muito longo")
    .regex(/^[0-9a-zA-Z\s]+$/, "Número inválido"),
  complement: z
    .string()
    .max(100, "Complemento muito longo")
    .optional()
    .or(z.literal("")),
  neighborhood: z
    .string()
    .min(1, "Bairro é obrigatório")
    .min(3, "Bairro deve ter pelo menos 3 caracteres")
    .max(100, "Bairro muito longo"),
  city: z
    .string()
    .min(1, "Cidade é obrigatória")
    .min(3, "Cidade deve ter pelo menos 3 caracteres")
    .max(100, "Cidade muito longa")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Cidade deve conter apenas letras"),
  state: z
    .string()
    .min(1, "Estado é obrigatório")
    .length(2, "Estado deve ter exatamente 2 caracteres")
    .regex(/^[A-Z]{2}$/, "Estado deve conter apenas letras maiúsculas")
    .toUpperCase(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Contact form validation schema
export const contactSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  subject: z.string().min(5, "Assunto deve ter no mínimo 5 caracteres"),
  message: z.string().min(10, "Mensagem deve ter no mínimo 10 caracteres"),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// Profile update validation schema
export const profileSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z
    .string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone inválido")
    .optional()
    .or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
