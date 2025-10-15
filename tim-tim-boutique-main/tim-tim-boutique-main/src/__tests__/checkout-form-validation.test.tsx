import { describe, it, expect } from "vitest";
import { checkoutSchema } from "@/lib/validations";
import { maskCep, maskPhone } from "@/lib/masks";

describe("Checkout Form Validation", () => {
  describe("Zod Schema Validation", () => {
    it("should validate complete valid form data", () => {
      const validData = {
        name: "João Silva",
        email: "joao@email.com",
        phone: "(11) 99999-9999",
        cep: "12345-678",
        address: "Rua Teste",
        number: "123",
        complement: "Apto 1",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate form without optional fields", () => {
      const validData = {
        name: "João Silva",
        email: "",
        phone: "(11) 99999-9999",
        cep: "12345-678",
        address: "Rua Teste",
        number: "123",
        complement: "",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid name (too short)", () => {
      const invalidData = {
        name: "Jo",
        email: "",
        phone: "(11) 99999-9999",
        cep: "12345-678",
        address: "Rua Teste",
        number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("name");
      }
    });

    it("should reject invalid name (contains numbers)", () => {
      const invalidData = {
        name: "João123",
        email: "",
        phone: "(11) 99999-9999",
        cep: "12345-678",
        address: "Rua Teste",
        number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("apenas letras");
      }
    });

    it("should reject invalid email format", () => {
      const invalidData = {
        name: "João Silva",
        email: "invalid-email",
        phone: "(11) 99999-9999",
        cep: "12345-678",
        address: "Rua Teste",
        number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("email");
      }
    });

    it("should reject invalid phone format", () => {
      const invalidData = {
        name: "João Silva",
        email: "",
        phone: "11999999999", // Missing formatting
        cep: "12345-678",
        address: "Rua Teste",
        number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("phone");
      }
    });

    it("should accept both mobile and landline phone formats", () => {
      const mobileData = {
        name: "João Silva",
        email: "",
        phone: "(11) 99999-9999",
        cep: "12345-678",
        address: "Rua Teste",
        number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
      };

      const landlineData = {
        ...mobileData,
        phone: "(11) 3333-4444",
      };

      expect(checkoutSchema.safeParse(mobileData).success).toBe(true);
      expect(checkoutSchema.safeParse(landlineData).success).toBe(true);
    });

    it("should reject invalid CEP format", () => {
      const invalidData = {
        name: "João Silva",
        email: "",
        phone: "(11) 99999-9999",
        cep: "12345678", // Missing hyphen
        address: "Rua Teste",
        number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("cep");
      }
    });

    it("should reject invalid state (not 2 characters)", () => {
      const invalidData = {
        name: "João Silva",
        email: "",
        phone: "(11) 99999-9999",
        cep: "12345-678",
        address: "Rua Teste",
        number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SAO", // Too long
      };

      const result = checkoutSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("state");
      }
    });

    it("should reject invalid state (lowercase)", () => {
      const invalidData = {
        name: "João Silva",
        email: "",
        phone: "(11) 99999-9999",
        cep: "12345-678",
        address: "Rua Teste",
        number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "sp", // Lowercase
      };

      const result = checkoutSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing required fields", () => {
      const invalidData = {
        name: "",
        email: "",
        phone: "",
        cep: "",
        address: "",
        number: "",
        neighborhood: "",
        city: "",
        state: "",
      };

      const result = checkoutSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should have errors for all required fields
        const errorPaths = result.error.issues.map((issue) => issue.path[0]);
        expect(errorPaths).toContain("name");
        expect(errorPaths).toContain("phone");
        expect(errorPaths).toContain("cep");
        expect(errorPaths).toContain("address");
        expect(errorPaths).toContain("number");
        expect(errorPaths).toContain("neighborhood");
        expect(errorPaths).toContain("city");
        expect(errorPaths).toContain("state");
      }
    });
  });

  describe("Input Masks", () => {
    it("should format CEP correctly", () => {
      expect(maskCep("12345678")).toBe("12345-678");
      expect(maskCep("12345")).toBe("12345");
      expect(maskCep("123")).toBe("123");
      expect(maskCep("12345-678")).toBe("12345-678");
    });

    it("should format mobile phone correctly", () => {
      expect(maskPhone("11999999999")).toBe("(11) 99999-9999");
      expect(maskPhone("11")).toBe("11");
      expect(maskPhone("119")).toBe("(11) 9");
      expect(maskPhone("1199999")).toBe("(11) 9999-9");
    });

    it("should format landline phone correctly", () => {
      expect(maskPhone("1133334444")).toBe("(11) 3333-4444");
    });

    it("should handle partial CEP input", () => {
      expect(maskCep("1")).toBe("1");
      expect(maskCep("12")).toBe("12");
      expect(maskCep("123")).toBe("123");
      expect(maskCep("1234")).toBe("1234");
      expect(maskCep("12345")).toBe("12345");
      expect(maskCep("123456")).toBe("12345-6");
      expect(maskCep("1234567")).toBe("12345-67");
      expect(maskCep("12345678")).toBe("12345-678");
    });

    it("should handle partial phone input", () => {
      expect(maskPhone("1")).toBe("1");
      expect(maskPhone("11")).toBe("11");
      expect(maskPhone("119")).toBe("(11) 9");
      expect(maskPhone("1199")).toBe("(11) 99");
      expect(maskPhone("11999")).toBe("(11) 999");
      expect(maskPhone("119999")).toBe("(11) 9999");
      expect(maskPhone("1199999")).toBe("(11) 9999-9");
    });

    it("should remove non-numeric characters before masking", () => {
      expect(maskCep("abc12345xyz678")).toBe("12345-678");
      expect(maskPhone("abc11def999ghi999jkl999")).toBe("(11) 99999-9999");
    });
  });


});
