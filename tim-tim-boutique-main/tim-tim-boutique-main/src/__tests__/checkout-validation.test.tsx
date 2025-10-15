import { describe, it, expect, vi, beforeEach } from "vitest";
import { maskCep, maskPhone, unmask } from "@/lib/masks";
import { checkoutSchema } from "@/lib/validations";

describe("Checkout Validation - Input Masks", () => {
  describe("maskCep", () => {
    it("should format CEP with 8 digits", () => {
      expect(maskCep("01310100")).toBe("01310-100");
    });

    it("should handle partial CEP input", () => {
      expect(maskCep("01310")).toBe("01310");
      expect(maskCep("013101")).toBe("01310-1");
    });

    it("should handle already formatted CEP", () => {
      expect(maskCep("01310-100")).toBe("01310-100");
    });

    it("should handle empty input", () => {
      expect(maskCep("")).toBe("");
    });

    it("should remove non-numeric characters", () => {
      expect(maskCep("abc01310100xyz")).toBe("01310-100");
    });
  });

  describe("maskPhone", () => {
    it("should format phone with 11 digits (mobile)", () => {
      expect(maskPhone("11999887766")).toBe("(11) 99988-7766");
    });

    it("should format phone with 10 digits (landline)", () => {
      expect(maskPhone("1133334444")).toBe("(11) 3333-4444");
    });

    it("should handle partial phone input", () => {
      expect(maskPhone("11")).toBe("11");
      expect(maskPhone("119")).toBe("(11) 9");
      expect(maskPhone("1199988")).toBe("(11) 9998-8");
    });

    it("should handle already formatted phone", () => {
      expect(maskPhone("(11) 99988-7766")).toBe("(11) 99988-7766");
    });

    it("should handle empty input", () => {
      expect(maskPhone("")).toBe("");
    });

    it("should remove non-numeric characters", () => {
      expect(maskPhone("abc11999887766xyz")).toBe("(11) 99988-7766");
    });
  });

  describe("unmask", () => {
    it("should remove all non-numeric characters", () => {
      expect(unmask("01310-100")).toBe("01310100");
      expect(unmask("(11) 99988-7766")).toBe("11999887766");
      expect(unmask("abc123def456")).toBe("123456");
    });

    it("should handle empty input", () => {
      expect(unmask("")).toBe("");
    });

    it("should handle input with only numbers", () => {
      expect(unmask("123456")).toBe("123456");
    });
  });
});

describe("Checkout Validation - Zod Schema", () => {
  describe("Valid data", () => {
    it("should validate complete valid checkout data", () => {
      const validData = {
        name: "João Silva",
        email: "joao@example.com",
        phone: "(11) 99988-7766",
        cep: "01310-100",
        address: "Avenida Paulista",
        number: "1000",
        complement: "Apto 101",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate data without optional fields", () => {
      const validData = {
        name: "João Silva",
        email: "",
        phone: "(11) 99988-7766",
        cep: "01310-100",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("Name validation", () => {
    it("should reject name with less than 3 characters", () => {
      const data = {
        name: "Jo",
        phone: "(11) 99988-7766",
        cep: "01310-100",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("name");
      }
    });

    it("should accept name with 3 or more characters", () => {
      const data = {
        name: "João",
        phone: "(11) 99988-7766",
        cep: "01310-100",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("Email validation", () => {
    it("should reject invalid email format", () => {
      const data = {
        name: "João Silva",
        email: "invalid-email",
        phone: "(11) 99988-7766",
        cep: "01310-100",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("email");
      }
    });

    it("should accept valid email format", () => {
      const data = {
        name: "João Silva",
        email: "joao@example.com",
        phone: "(11) 99988-7766",
        cep: "01310-100",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept empty email", () => {
      const data = {
        name: "João Silva",
        email: "",
        phone: "(11) 99988-7766",
        cep: "01310-100",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("Phone validation", () => {
    it("should reject phone without proper format", () => {
      const data = {
        name: "João Silva",
        phone: "11999887766",
        cep: "01310-100",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("phone");
      }
    });

    it("should accept properly formatted mobile phone", () => {
      const data = {
        name: "João Silva",
        phone: "(11) 99988-7766",
        cep: "01310-100",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept properly formatted landline phone", () => {
      const data = {
        name: "João Silva",
        phone: "(11) 3333-4444",
        cep: "01310-100",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject empty phone", () => {
      const data = {
        name: "João Silva",
        phone: "",
        cep: "01310-100",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("CEP validation", () => {
    it("should reject CEP without proper format", () => {
      const data = {
        name: "João Silva",
        phone: "(11) 99988-7766",
        cep: "01310100",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("cep");
      }
    });

    it("should accept properly formatted CEP", () => {
      const data = {
        name: "João Silva",
        phone: "(11) 99988-7766",
        cep: "01310-100",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject empty CEP", () => {
      const data = {
        name: "João Silva",
        phone: "(11) 99988-7766",
        cep: "",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("Address validation", () => {
    it("should reject address with less than 5 characters", () => {
      const data = {
        name: "João Silva",
        phone: "(11) 99988-7766",
        cep: "01310-100",
        address: "Rua",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("address");
      }
    });

    it("should accept address with 5 or more characters", () => {
      const data = {
        name: "João Silva",
        phone: "(11) 99988-7766",
        cep: "01310-100",
        address: "Rua A",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("State validation", () => {
    it("should reject state with less than 2 characters", () => {
      const data = {
        name: "João Silva",
        phone: "(11) 99988-7766",
        cep: "01310-100",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "S",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("state");
      }
    });

    it("should reject state with more than 2 characters", () => {
      const data = {
        name: "João Silva",
        phone: "(11) 99988-7766",
        cep: "01310-100",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SAO",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("state");
      }
    });

    it("should accept state with exactly 2 characters", () => {
      const data = {
        name: "João Silva",
        phone: "(11) 99988-7766",
        cep: "01310-100",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should convert state to uppercase", () => {
      const data = {
        name: "João Silva",
        phone: "(11) 99988-7766",
        cep: "01310-100",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "sp",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.state).toBe("SP");
      }
    });
  });

  describe("Required fields", () => {
    it("should reject data missing name", () => {
      const data = {
        phone: "(11) 99988-7766",
        cep: "01310-100",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject data missing phone", () => {
      const data = {
        name: "João Silva",
        cep: "01310-100",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject data missing CEP", () => {
      const data = {
        name: "João Silva",
        phone: "(11) 99988-7766",
        address: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject data missing address", () => {
      const data = {
        name: "João Silva",
        phone: "(11) 99988-7766",
        cep: "01310-100",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject data missing number", () => {
      const data = {
        name: "João Silva",
        phone: "(11) 99988-7766",
        cep: "01310-100",
        address: "Avenida Paulista",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
      };

      const result = checkoutSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

describe("Checkout Validation - Integration", () => {
  it("should validate and format a complete checkout flow", () => {
    // Simulate user input
    const rawCep = "01310100";
    const rawPhone = "11999887766";

    // Apply masks
    const formattedCep = maskCep(rawCep);
    const formattedPhone = maskPhone(rawPhone);

    expect(formattedCep).toBe("01310-100");
    expect(formattedPhone).toBe("(11) 99988-7766");

    // Validate with schema
    const data = {
      name: "João Silva",
      email: "joao@example.com",
      phone: formattedPhone,
      cep: formattedCep,
      address: "Avenida Paulista",
      number: "1000",
      complement: "Apto 101",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
    };

    const result = checkoutSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
