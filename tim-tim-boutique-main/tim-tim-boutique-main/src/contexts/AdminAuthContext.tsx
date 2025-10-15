import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Admin } from "@/types";
import { adminStorageService } from "@/services/adminStorage";

interface AdminAuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);

  // Load existing session on mount
  useEffect(() => {
    const existingSession = adminStorageService.getAdminSession();
    if (existingSession) {
      setAdmin(existingSession);
    }
  }, []);

  /**
   * Login admin with email and password
   * Returns true if successful, false otherwise
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Authenticate using adminStorageService
      const authenticatedAdmin = await adminStorageService.authenticateAdmin(email, password);
      
      if (!authenticatedAdmin) {
        return false;
      }

      // Save session to localStorage
      const saved = adminStorageService.saveAdminSession(authenticatedAdmin);
      
      if (saved) {
        setAdmin(authenticatedAdmin);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error during admin login:", error);
      return false;
    }
  };

  /**
   * Logout admin and clear session
   */
  const logout = () => {
    adminStorageService.clearAdminSession();
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

/**
 * Hook to use admin authentication context
 * Must be used within AdminAuthProvider
 */
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
};
