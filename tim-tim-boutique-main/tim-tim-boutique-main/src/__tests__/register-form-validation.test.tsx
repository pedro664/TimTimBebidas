import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Register from "@/pages/Register";
import { AuthProvider } from "@/contexts/AuthContext";

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderRegisterForm = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Register />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe("Register Form Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should render all form fields", () => {
    renderRegisterForm();

    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /criar conta/i })).toBeInTheDocument();
  });

  it("should show validation error for short name", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const nameInput = screen.getByLabelText(/nome completo/i);
    await user.type(nameInput, "Jo");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/nome deve ter no mínimo 3 caracteres/i)).toBeInTheDocument();
    });
  });

  it("should show validation error for invalid email", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const emailInput = screen.getByLabelText(/^email$/i);
    await user.type(emailInput, "invalid-email");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  it("should show validation error for short password", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const passwordInput = screen.getByLabelText(/^senha$/i);
    await user.type(passwordInput, "12345");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/senha deve ter no mínimo 6 caracteres/i)).toBeInTheDocument();
    });
  });

  it("should show validation error for password without letter", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const passwordInput = screen.getByLabelText(/^senha$/i);
    await user.type(passwordInput, "123456");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/senha deve conter pelo menos uma letra/i)).toBeInTheDocument();
    });
  });

  it("should show validation error for password without number", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const passwordInput = screen.getByLabelText(/^senha$/i);
    await user.type(passwordInput, "abcdef");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/senha deve conter pelo menos um número/i)).toBeInTheDocument();
    });
  });

  it("should show validation error when passwords don't match", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const passwordInput = screen.getByLabelText(/^senha$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);

    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password456");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/senhas não coincidem/i)).toBeInTheDocument();
    });
  });

  it("should display password strength indicators", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const passwordInput = screen.getByLabelText(/^senha$/i);
    await user.type(passwordInput, "abc123");

    await waitFor(() => {
      expect(screen.getByText(/mínimo 6 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/pelo menos uma letra/i)).toBeInTheDocument();
      expect(screen.getByText(/pelo menos um número/i)).toBeInTheDocument();
    });
  });

  it("should disable submit button while loading", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^senha$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
    const submitButton = screen.getByRole("button", { name: /criar conta/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");

    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it("should successfully register with valid data", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^senha$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
    const submitButton = screen.getByRole("button", { name: /criar conta/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "newuser@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");

    await user.click(submitButton);

    await waitFor(() => {
      const { toast } = require("sonner");
      expect(toast.success).toHaveBeenCalledWith("Conta criada com sucesso!");
    });
  });

  it("should show error for duplicate email", async () => {
    const user = userEvent.setup();
    
    // Pre-register a user
    localStorage.setItem(
      "users",
      JSON.stringify([
        {
          id: "1",
          name: "Existing User",
          email: "existing@example.com",
          password: "password123",
        },
      ])
    );

    renderRegisterForm();

    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^senha$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
    const submitButton = screen.getByRole("button", { name: /criar conta/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "existing@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/este email já está cadastrado/i)).toBeInTheDocument();
    });
  });

  it("should have proper ARIA attributes for accessibility", () => {
    renderRegisterForm();

    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^senha$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);

    expect(nameInput).toHaveAttribute("aria-invalid", "false");
    expect(emailInput).toHaveAttribute("aria-invalid", "false");
    expect(passwordInput).toHaveAttribute("aria-invalid", "false");
    expect(confirmPasswordInput).toHaveAttribute("aria-invalid", "false");
  });

  it("should clear field error when user starts typing", async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const nameInput = screen.getByLabelText(/nome completo/i);
    
    // Trigger validation error
    await user.type(nameInput, "Jo");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/nome deve ter no mínimo 3 caracteres/i)).toBeInTheDocument();
    });

    // Type more to fix the error
    await user.type(nameInput, "hn");

    // Submit to trigger validation
    const submitButton = screen.getByRole("button", { name: /criar conta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText(/nome deve ter no mínimo 3 caracteres/i)).not.toBeInTheDocument();
    });
  });
});
