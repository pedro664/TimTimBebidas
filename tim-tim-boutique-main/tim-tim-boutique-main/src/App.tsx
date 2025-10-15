import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy load pages for code splitting and better performance
const Home = lazy(() => import("./pages/Home"));
const Catalog = lazy(() => import("./pages/Catalog"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductNew = lazy(() => import("./pages/admin/AdminProductNew"));
const AdminProductEdit = lazy(() => import("./pages/admin/AdminProductEdit"));

const queryClient = new QueryClient();

const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip Links for Keyboard Navigation */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-secondary focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
      >
        Pular para o conteúdo principal
      </a>
      <a 
        href="#navigation" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-secondary focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
      >
        Pular para a navegação
      </a>
      
      {!isHomePage && !isAdminPage && <nav id="navigation"><Navbar /></nav>}
      <main id="main-content" className={isAdminPage ? "" : "flex-1"} role="main">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/produto/:id" element={<ProductDetail />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/carrinho" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pedido-confirmado" element={<OrderConfirmation />} />
            <Route path="/perfil" element={<Profile />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin" 
              element={<Navigate to="/admin/dashboard" replace />} 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/produtos" 
              element={
                <AdminProtectedRoute>
                  <AdminProducts />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/produtos/novo" 
              element={
                <AdminProtectedRoute>
                  <AdminProductNew />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/produtos/:id" 
              element={
                <AdminProtectedRoute>
                  <AdminProductEdit />
                </AdminProtectedRoute>
              } 
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <AdminAuthProvider>
            <ErrorBoundary>
              <ProductProvider>
                <ErrorBoundary>
                  <CartProvider>
                    <ErrorBoundary>
                      <Toaster />
                      <Sonner />
                      <BrowserRouter>
                        <Layout />
                      </BrowserRouter>
                    </ErrorBoundary>
                  </CartProvider>
                </ErrorBoundary>
              </ProductProvider>
            </ErrorBoundary>
          </AdminAuthProvider>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
