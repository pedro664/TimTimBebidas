import { ReactNode, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { LogOut, Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { admin, logout } = useAdminAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    // Always start with Admin
    breadcrumbs.push({ label: "Admin", path: "/admin" });

    // Map path segments to readable labels
    const pathMap: Record<string, string> = {
      dashboard: "Dashboard",
      pedidos: "Pedidos",
      produtos: "Produtos",
      novo: "Novo",
    };

    let currentPath = "";
    for (let i = 1; i < paths.length; i++) {
      currentPath += `/${paths[i]}`;
      const label = pathMap[paths[i]] || paths[i];
      breadcrumbs.push({ label, path: `/admin${currentPath}` });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen admin-bg">
      {/* Skip Links for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 gradient-wine text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{ '--tw-ring-color': 'hsl(var(--admin-primary))' } as React.CSSProperties}
      >
        Pular para o conteúdo principal
      </a>
      <a
        href="#admin-navigation"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 gradient-wine text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{ '--tw-ring-color': 'hsl(var(--admin-primary))' } as React.CSSProperties}
      >
        Pular para a navegação
      </a>

      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Fechar menu"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setSidebarOpen(false);
            }
          }}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-30 backdrop-blur-sm bg-card/95" role="banner">
          <div className="flex items-center justify-between px-4 py-4">
            {/* Left: Mobile Menu Button */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-secondary hover:text-secondary/80"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
              >
                {sidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>

            {/* Right: Admin Info + Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-foreground">
                  {admin?.name}
                </span>
                <span className="text-xs text-muted-foreground">{admin?.email}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
                aria-label="Sair do painel administrativo"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="px-4 pb-3">
            <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center gap-2">
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-foreground">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="text-muted-foreground hover:text-secondary transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main id="main-content" className="p-4 md:p-6 lg:p-8" role="main">
          {children}
        </main>
      </div>
    </div>
  );
};
