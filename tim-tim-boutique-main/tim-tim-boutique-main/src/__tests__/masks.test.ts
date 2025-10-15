import { describe, it, expect } from "vitest";
import { maskCep, maskPhone, maskCpf, unmask } from "@/lib/masks";

describe("Input Masks", () => {
  describe("maskCep", () => {
    it("should format complete CEP correctly", () => {
      expect(maskCep("12345678")).toBe("12345-678");
    });

    it("should handle partial CEP input (5 digits or less)", () => {
      expect(maskCep("12345")).toBe("12345");
      expect(maskCep("123")).toBe("123");
      expect(maskCep("1")).toBe("1");
    });

    it("should handle partial CEP input (more than 5 digits)", () => {
      expect(maskCep("123456")).toBe("12345-6");
      expect(maskCep("1234567")).toBe("12345-67");
    });

    it("should remove non-numeric characters", () => {
      expect(maskCep("12345-678")).toBe("12345-678");
      expect(maskCep("abc12345def678")).toBe("12345-678");
    });

    it("should limit to 8 digits", () => {
      expect(maskCep("123456789999")).toBe("12345-678");
    });

    it("should handle empty string", () => {
      expect(maskCep("")).toBe("");
    });
  });

  describe("maskPhone", () => {
    it("should format mobile phone (11 digits) correctly", () => {
      expect(maskPhone("11999999999")).toBe("(11) 99999-9999");
    });

    it("should format landline phone (10 digits) correctly", () => {
      expect(maskPhone("1133334444")).toBe("(11) 3333-4444");
    });

    it("should handle partial phone input (2 digits or less)", () => {
      expect(maskPhone("11")).toBe("11");
      expect(maskPhone("1")).toBe("1");
    });

    it("should handle partial phone input (3-6 digits)", () => {
      expect(maskPhone("119")).toBe("(11) 9");
      expect(maskPhone("11999")).toBe("(11) 999");
      expect(maskPhone("119999")).toBe("(11) 9999");
    });

    it("should handle partial phone input (7-10 digits)", () => {
      expect(maskPhone("1199999")).toBe("(11) 9999-9");
      expect(maskPhone("119999999")).toBe("(11) 9999-999");
      expect(maskPhone("1199999999")).toBe("(11) 9999-9999");
    });

    it("should remove non-numeric characters", () => {
      expect(maskPhone("(11) 99999-9999")).toBe("(11) 99999-9999");
      expect(maskPhone("abc11def99999ghi9999")).toBe("(11) 99999-9999");
    });

    it("should limit to 11 digits", () => {
      expect(maskPhone("119999999999999")).toBe("(11) 99999-9999");
    });

    it("should handle empty string", () => {
      expect(maskPhone("")).toBe("");
    });
  });

  describe("maskCpf", () => {
    it("should format complete CPF correctly", () => {
      expect(maskCpf("12345678900")).toBe("123.456.789-00");
    });

    it("should handle partial CPF input (3 digits or less)", () => {
      expect(maskCpf("123")).toBe("123");
      expect(maskCpf("12")).toBe("12");
      expect(maskCpf("1")).toBe("1");
    });

    it("should handle partial CPF input (4-6 digits)", () => {
      expect(maskCpf("1234")).toBe("123.4");
      expect(maskCpf("12345")).toBe("123.45");
      expect(maskCpf("123456")).toBe("123.456");
    });

    it("should handle partial CPF input (7-9 digits)", () => {
      expect(maskCpf("1234567")).toBe("123.456.7");
      expect(maskCpf("12345678")).toBe("123.456.78");
      expect(maskCpf("123456789")).toBe("123.456.789");
    });

    it("should handle partial CPF input (10-11 digits)", () => {
      expect(maskCpf("1234567890")).toBe("123.456.789-0");
      expect(maskCpf("12345678900")).toBe("123.456.789-00");
    });

    it("should remove non-numeric characters", () => {
      expect(maskCpf("123.456.789-00")).toBe("123.456.789-00");
      expect(maskCpf("abc123def456ghi789jkl00")).toBe("123.456.789-00");
    });

    it("should limit to 11 digits", () => {
      expect(maskCpf("123456789009999")).toBe("123.456.789-00");
    });

    it("should handle empty string", () => {
      expect(maskCpf("")).toBe("");
    });
  });

  describe("unmask", () => {
    it("should remove all non-numeric characters from CEP", () => {
      expect(unmask("12345-678")).toBe("12345678");
    });

    it("should remove all non-numeric characters from phone", () => {
      expect(unmask("(11) 99999-9999")).toBe("11999999999");
      expect(unmask("(11) 3333-4444")).toBe("1133334444");
    });

    it("should remove all non-numeric characters from CPF", () => {
      expect(unmask("123.456.789-00")).toBe("12345678900");
    });

    it("should handle strings with mixed characters", () => {
      expect(unmask("abc123def456")).toBe("123456");
    });

    it("should handle strings with only non-numeric characters", () => {
      expect(unmask("abcdef")).toBe("");
    });

    it("should handle empty string", () => {
      expect(unmask("")).toBe("");
    });

    it("should handle strings with only numbers", () => {
      expect(unmask("123456")).toBe("123456");
    });
  });

  describe("Real-world scenarios", () => {
    it("should handle user typing CEP progressively", () => {
      const inputs = ["1", "12", "123", "1234", "12345", "123456", "1234567", "12345678"];
      const expected = ["1", "12", "123", "1234", "12345", "12345-6", "12345-67", "12345-678"];
      
      inputs.forEach((input, index) => {
        expect(maskCep(input)).toBe(expected[index]);
      });
    });

    it("should handle user typing mobile phone progressively", () => {
      const inputs = ["1", "11", "119", "1199", "11999", "119999", "1199999", "11999999", "119999999", "1199999999", "11999999999"];
      const expected = ["1", "11", "(11) 9", "(11) 99", "(11) 999", "(11) 9999", "(11) 9999-9", "(11) 9999-99", "(11) 9999-999", "(11) 9999-9999", "(11) 99999-9999"];
      
      inputs.forEach((input, index) => {
        expect(maskPhone(input)).toBe(expected[index]);
      });
    });

    it("should handle user typing CPF progressively", () => {
      const inputs = ["1", "12", "123", "1234", "12345", "123456", "1234567", "12345678", "123456789", "1234567890", "12345678900"];
      const expected = ["1", "12", "123", "123.4", "123.45", "123.456", "123.456.7", "123.456.78", "123.456.789", "123.456.789-0", "123.456.789-00"];
      
      inputs.forEach((input, index) => {
        expect(maskCpf(input)).toBe(expected[index]);
      });
    });

    it("should handle pasting formatted values", () => {
      expect(maskCep("12345-678")).toBe("12345-678");
      expect(maskPhone("(11) 99999-9999")).toBe("(11) 99999-9999");
      expect(maskCpf("123.456.789-00")).toBe("123.456.789-00");
    });

    it("should handle pasting unformatted values", () => {
      expect(maskCep("12345678")).toBe("12345-678");
      expect(maskPhone("11999999999")).toBe("(11) 99999-9999");
      expect(maskCpf("12345678900")).toBe("123.456.789-00");
    });
  });
});
