import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Mail, Lock, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { toast } from "sonner";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdminAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; root?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect authenticated admins to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  /**
   * Validate email format
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!validateEmail(email)) {
      newErrors.email = "Email inválido";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Senha é obrigatória";
    } else if (password.length < 6) {
      newErrors.password = "Senha deve ter no mínimo 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await login(email, password);

      if (success) {
        toast.success("Login administrativo realizado com sucesso!");
        navigate("/admin/dashboard", { replace: true });
      } else {
        setErrors({ root: "Email ou senha incorretos" });
        toast.error("Email ou senha incorretos");
        // Clear password field on error
        setPassword("");
      }
    } catch (error) {
      const errorMessage = "Erro ao fazer login. Tente novamente.";
      setErrors({ root: errorMessage });
      toast.error(errorMessage);
      setPassword("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 md:pt-40 pb-12 md:pb-20 flex items-center justify-center px-4 sm:px-6 bg-background">
      <div className="container mx-auto">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 md:mb-6">
              <img src="/logo-timtim.png" alt="Tim Tim" className="h-12 md:h-16 w-auto" />
            </Link>
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-secondary" />
              <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl">
                Painel Administrativo
              </h1>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              Acesso exclusivo para administradores
            </p>
          </div>

          <Card className="p-6 md:p-8 bg-card border-border">
            {/* Display root-level errors (authentication errors) */}
            {errors.root && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{errors.root}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <Label htmlFor="admin-email" className="flex items-center gap-2 mb-2 text-sm md:text-base">
                  <Mail className="h-4 w-4 text-secondary" />
                  Email
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@timtimbebidas.com"
                  className="h-12 md:h-10 text-base md:text-sm"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "admin-email-error" : undefined}
                  disabled={isSubmitting}
                  autoComplete="email"
                />
                {errors.email && (
                  <p
                    id="admin-email-error"
                    role="alert"
                    className="mt-1.5 text-sm text-destructive flex items-center gap-1"
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="admin-password" className="flex items-center gap-2 mb-2 text-sm md:text-base">
                  <Lock className="h-4 w-4 text-secondary" />
                  Senha
                </Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 md:h-10 text-base md:text-sm"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "admin-password-error" : undefined}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p
                    id="admin-password-error"
                    role="alert"
                    className="mt-1.5 text-sm text-destructive flex items-center gap-1"
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 md:h-10 bg-primary hover:bg-accent text-primary-foreground font-body uppercase tracking-wider text-base md:text-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar no Painel"
                )}
              </Button>
            </form>
          </Card>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-muted-foreground hover:text-secondary transition-smooth text-sm md:text-base inline-flex items-center gap-1"
            >
              ← Voltar para o site principal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
