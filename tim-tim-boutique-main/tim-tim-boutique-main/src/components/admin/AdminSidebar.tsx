import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, LogOut } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const location = useLocation();
  const { logout } = useAdminAuth();

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      label: "Produtos",
      icon: Package,
      path: "/admin/produtos",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/admin/dashboard") {
      return location.pathname === path || location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Sidebar for Desktop and Mobile */}
      <aside
        id="admin-navigation"
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-black border-r border-[#8B0000]/20 transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="navigation"
        aria-label="Menu de navegação administrativa"
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-[#8B0000]/20">
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-3 group"
              onClick={onClose}
            >
              <img
                src="/src/assets/logo-timtim.png"
                alt="Tim Tim Bebidas"
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="font-bold text-lg text-white font-heading">
                  Tim Tim
                </span>
                <span className="text-xs text-gray-400">
                  Painel Admin
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-1" aria-label="Menu principal">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:ring-offset-2 focus:ring-offset-black",
                    active
                      ? "gradient-wine text-white font-medium shadow-lg shadow-[#8B0000]/30"
                      : "text-gray-300 hover:bg-[#8B0000]/10 hover:text-[#FF69B4]"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-[#8B0000]/20">
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full",
                "text-gray-300 hover:bg-[#8B0000]/10 hover:text-[#FF69B4]",
                "focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:ring-offset-2 focus:ring-offset-black"
              )}
              aria-label="Sair do painel administrativo"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
