import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Contact from "@/pages/Contact";
import { storageService } from "@/services/localStorage";
import { toast } from "sonner";

// Mock dependencies
vi.mock("@/services/localStorage", () => ({
  storageService: {
    saveContactMessage: vi.fn(),
    getContactMessages: vi.fn(() => []),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderContact = () => {
  return render(
    <BrowserRouter>
      <Contact />
    </BrowserRouter>
  );
};

describe("Contact Form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Form Rendering", () => {
    it("should render all form fields", () => {
      renderContact();

      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/assunto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mensagem/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /enviar mensagem/i })).toBeInTheDocument();
    });

    it("should render contact information section", () => {
      renderContact();

      expect(screen.getByText(/whatsapp/i)).toBeInTheDocument();
      expect(screen.getByText(/telefone/i)).toBeInTheDocument();
      expect(screen.getByText(/email/i)).toBeInTheDocument();
      expect(screen.getByText(/localização/i)).toBeInTheDocument();
      expect(screen.getByText(/horário/i)).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("should show error when name is too short", async () => {
      const user = userEvent.setup();
      renderContact();

      const nameInput = screen.getByLabelText(/nome completo/i);
      await user.type(nameInput, "Jo");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/nome deve ter no mínimo 3 caracteres/i)).toBeInTheDocument();
      });
    });

    it("should show error when email is invalid", async () => {
      const user = userEvent.setup();
      renderContact();

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, "invalid-email");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      });
    });

    it("should show error when subject is too short", async () => {
      const user = userEvent.setup();
      renderContact();

      const subjectInput = screen.getByLabelText(/assunto/i);
      await user.type(subjectInput, "Hi");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/assunto deve ter no mínimo 5 caracteres/i)).toBeInTheDocument();
      });
    });

    it("should show error when message is too short", async () => {
      const user = userEvent.setup();
      renderContact();

      const messageInput = screen.getByLabelText(/mensagem/i);
      await user.type(messageInput, "Short");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/mensagem deve ter no mínimo 10 caracteres/i)).toBeInTheDocument();
      });
    });

    it("should not submit form with validation errors", async () => {
      const user = userEvent.setup();
      renderContact();

      const submitButton = screen.getByRole("button", { name: /enviar mensagem/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(storageService.saveContactMessage).not.toHaveBeenCalled();
      });
    });
  });

  describe("Form Submission", () => {
    it("should submit form with valid data", async () => {
      const user = userEvent.setup();
      vi.mocked(storageService.saveContactMessage).mockReturnValue(true);
      
      renderContact();

      // Fill form with valid data
      await user.type(screen.getByLabelText(/nome completo/i), "João Silva");
      await user.type(screen.getByLabelText(/email/i), "joao@example.com");
      await user.type(screen.getByLabelText(/assunto/i), "Dúvida sobre produtos");
      await user.type(screen.getByLabelText(/mensagem/i), "Gostaria de saber mais sobre os vinhos disponíveis.");

      // Submit form
      const submitButton = screen.getByRole("button", { name: /enviar mensagem/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(storageService.saveContactMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "João Silva",
            email: "joao@example.com",
            subject: "Dúvida sobre produtos",
            message: "Gostaria de saber mais sobre os vinhos disponíveis.",
            read: false,
          })
        );
      });
    });

    it("should show success toast after submission", async () => {
      const user = userEvent.setup();
      vi.mocked(storageService.saveContactMessage).mockReturnValue(true);
      
      renderContact();

      // Fill and submit form
      await user.type(screen.getByLabelText(/nome completo/i), "João Silva");
      await user.type(screen.getByLabelText(/email/i), "joao@example.com");
      await user.type(screen.getByLabelText(/assunto/i), "Dúvida sobre produtos");
      await user.type(screen.getByLabelText(/mensagem/i), "Gostaria de saber mais sobre os vinhos disponíveis.");
      
      await user.click(screen.getByRole("button", { name: /enviar mensagem/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Mensagem enviada com sucesso!",
          expect.objectContaining({
            description: "Entraremos em contato em breve.",
          })
        );
      });
    });

    it("should clear form after successful submission", async () => {
      const user = userEvent.setup();
      vi.mocked(storageService.saveContactMessage).mockReturnValue(true);
      
      renderContact();

      const nameInput = screen.getByLabelText(/nome completo/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const subjectInput = screen.getByLabelText(/assunto/i) as HTMLInputElement;
      const messageInput = screen.getByLabelText(/mensagem/i) as HTMLTextAreaElement;

      // Fill form
      await user.type(nameInput, "João Silva");
      await user.type(emailInput, "joao@example.com");
      await user.type(subjectInput, "Dúvida sobre produtos");
      await user.type(messageInput, "Gostaria de saber mais sobre os vinhos disponíveis.");

      // Submit
      await user.click(screen.getByRole("button", { name: /enviar mensagem/i }));

      // Check fields are cleared
      await waitFor(() => {
        expect(nameInput.value).toBe("");
        expect(emailInput.value).toBe("");
        expect(subjectInput.value).toBe("");
        expect(messageInput.value).toBe("");
      });
    });

    it("should show error toast when submission fails", async () => {
      const user = userEvent.setup();
      vi.mocked(storageService.saveContactMessage).mockReturnValue(false);
      
      renderContact();

      // Fill and submit form
      await user.type(screen.getByLabelText(/nome completo/i), "João Silva");
      await user.type(screen.getByLabelText(/email/i), "joao@example.com");
      await user.type(screen.getByLabelText(/assunto/i), "Dúvida sobre produtos");
      await user.type(screen.getByLabelText(/mensagem/i), "Gostaria de saber mais sobre os vinhos disponíveis.");
      
      await user.click(screen.getByRole("button", { name: /enviar mensagem/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Erro ao enviar mensagem",
          expect.objectContaining({
            description: "Por favor, tente novamente.",
          })
        );
      });
    });

    it("should disable submit button while submitting", async () => {
      const user = userEvent.setup();
      vi.mocked(storageService.saveContactMessage).mockImplementation(() => {
        return new Promise((resolve) => setTimeout(() => resolve(true), 100)) as any;
      });
      
      renderContact();

      // Fill form
      await user.type(screen.getByLabelText(/nome completo/i), "João Silva");
      await user.type(screen.getByLabelText(/email/i), "joao@example.com");
      await user.type(screen.getByLabelText(/assunto/i), "Dúvida sobre produtos");
      await user.type(screen.getByLabelText(/mensagem/i), "Gostaria de saber mais sobre os vinhos disponíveis.");

      const submitButton = screen.getByRole("button", { name: /enviar mensagem/i });
      await user.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/enviando/i)).toBeInTheDocument();
    });

    it("should generate unique message ID", async () => {
      const user = userEvent.setup();
      vi.mocked(storageService.saveContactMessage).mockReturnValue(true);
      
      renderContact();

      // Fill and submit form
      await user.type(screen.getByLabelText(/nome completo/i), "João Silva");
      await user.type(screen.getByLabelText(/email/i), "joao@example.com");
      await user.type(screen.getByLabelText(/assunto/i), "Dúvida sobre produtos");
      await user.type(screen.getByLabelText(/mensagem/i), "Gostaria de saber mais sobre os vinhos disponíveis.");
      
      await user.click(screen.getByRole("button", { name: /enviar mensagem/i }));

      await waitFor(() => {
        expect(storageService.saveContactMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            id: expect.stringMatching(/^msg_\d+_[a-z0-9]+$/),
          })
        );
      });
    });

    it("should include timestamp in message", async () => {
      const user = userEvent.setup();
      vi.mocked(storageService.saveContactMessage).mockReturnValue(true);
      
      renderContact();

      // Fill and submit form
      await user.type(screen.getByLabelText(/nome completo/i), "João Silva");
      await user.type(screen.getByLabelText(/email/i), "joao@example.com");
      await user.type(screen.getByLabelText(/assunto/i), "Dúvida sobre produtos");
      await user.type(screen.getByLabelText(/mensagem/i), "Gostaria de saber mais sobre os vinhos disponíveis.");
      
      await user.click(screen.getByRole("button", { name: /enviar mensagem/i }));

      await waitFor(() => {
        expect(storageService.saveContactMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            createdAt: expect.any(String),
          })
        );
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      renderContact();

      const nameInput = screen.getByLabelText(/nome completo/i);
      const emailInput = screen.getByLabelText(/email/i);
      const subjectInput = screen.getByLabelText(/assunto/i);
      const messageInput = screen.getByLabelText(/mensagem/i);

      expect(nameInput).toHaveAttribute("id", "name");
      expect(emailInput).toHaveAttribute("id", "email");
      expect(subjectInput).toHaveAttribute("id", "subject");
      expect(messageInput).toHaveAttribute("id", "message");
    });

    it("should mark invalid fields with aria-invalid", async () => {
      const user = userEvent.setup();
      renderContact();

      const nameInput = screen.getByLabelText(/nome completo/i);
      await user.type(nameInput, "Jo");
      await user.tab();

      await waitFor(() => {
        expect(nameInput).toHaveAttribute("aria-invalid", "true");
      });
    });

    it("should associate error messages with fields", async () => {
      const user = userEvent.setup();
      renderContact();

      const nameInput = screen.getByLabelText(/nome completo/i);
      await user.type(nameInput, "Jo");
      await user.tab();

      await waitFor(() => {
        expect(nameInput).toHaveAttribute("aria-describedby", "name-error");
        expect(screen.getByRole("alert")).toHaveAttribute("id", "name-error");
      });
    });
  });
});
