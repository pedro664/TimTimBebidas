import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminLogin from "@/pages/admin/AdminLogin";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";

// Mock the navigation
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderAdminLogin = () => {
  return render(
    <BrowserRouter>
      <AdminAuthProvider>
        <AdminLogin />
      </AdminAuthProvider>
    </BrowserRouter>
  );
};

describe("AdminLogin Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Requirement 1.1: Display login form", () => {
    it("should display login form with email and password fields", () => {
      renderAdminLogin();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /entrar no painel/i })).toBeInTheDocument();
    });

    it("should display admin panel title and icon", () => {
      renderAdminLogin();

      expect(screen.getByText(/painel administrativo/i)).toBeInTheDocument();
      expect(screen.getByText(/acesso exclusivo para administradores/i)).toBeInTheDocument();
    });

    it("should display logo with link to home", () => {
      renderAdminLogin();

      const logoLink = screen.getByRole("link", { name: /tim tim/i });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute("href", "/");
    });
  });

  describe("Requirement 1.2: Field validation", () => {
    it("should show error when email is empty", async () => {
      renderAdminLogin();

      const submitButton = screen.getByRole("button", { name: /entrar no painel/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
      });
    });

    it("should show error when email format is invalid", async () => {
      renderAdminLogin();

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });

      const submitButton = screen.getByRole("button", { name: /entrar no painel/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      });
    });

    it("should show error when password is empty", async () => {
      renderAdminLogin();

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: "admin@test.com" } });

      const submitButton = screen.getByRole("button", { name: /entrar no painel/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
      });
    });

    it("should show error when password is less than 6 characters", async () => {
      renderAdminLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      fireEvent.change(emailInput, { target: { value: "admin@test.com" } });
      fireEvent.change(passwordInput, { target: { value: "12345" } });

      const submitButton = screen.getByRole("button", { name: /entrar no painel/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/senha deve ter no mínimo 6 caracteres/i)).toBeInTheDocument();
      });
    });

    it("should accept valid email format", async () => {
      renderAdminLogin();

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: "admin@timtimboutique.com" } });

      const submitButton = screen.getByRole("button", { name: /entrar no painel/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/email inválido/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Requirement 1.3: Error handling and feedback", () => {
    it("should display error message for invalid credentials", async () => {
      renderAdminLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      fireEvent.change(emailInput, { target: { value: "wrong@email.com" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });

      const submitButton = screen.getByRole("button", { name: /entrar no painel/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email ou senha incorretos/i)).toBeInTheDocument();
      });
    });

    it("should clear password field after failed login", async () => {
      renderAdminLogin();

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/senha/i) as HTMLInputElement;

      fireEvent.change(emailInput, { target: { value: "wrong@email.com" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });

      const submitButton = screen.getByRole("button", { name: /entrar no painel/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(passwordInput.value).toBe("");
      });
    });

    it("should show loading state during submission", async () => {
      renderAdminLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      fireEvent.change(emailInput, { target: { value: "admin@timtimboutique.com" } });
      fireEvent.change(passwordInput, { target: { value: "admin123" } });

      const submitButton = screen.getByRole("button", { name: /entrar no painel/i });
      fireEvent.click(submitButton);

      // Check for loading state
      expect(screen.getByText(/entrando\.\.\./i)).toBeInTheDocument();
    });

    it("should disable form fields during submission", async () => {
      renderAdminLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      fireEvent.change(emailInput, { target: { value: "admin@timtimboutique.com" } });
      fireEvent.change(passwordInput, { target: { value: "admin123" } });

      const submitButton = screen.getByRole("button", { name: /entrar no painel/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe("Additional features", () => {
    it("should have link to return to main site", () => {
      renderAdminLogin();

      const backLink = screen.getByText(/voltar para o site principal/i);
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest("a")).toHaveAttribute("href", "/");
    });

    it("should have proper accessibility attributes", () => {
      renderAdminLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("autocomplete", "email");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
    });

    it("should display error with alert icon", async () => {
      renderAdminLogin();

      const submitButton = screen.getByRole("button", { name: /entrar no painel/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorElement = screen.getByRole("alert");
        expect(errorElement).toBeInTheDocument();
      });
    });
  });
});
