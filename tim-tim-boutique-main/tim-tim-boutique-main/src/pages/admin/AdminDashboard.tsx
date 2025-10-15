import { useMemo } from 'react';
import { AdminLayout, AdminCard } from '@/components/admin';
import { QuickImageUpload } from '@/components/admin/QuickImageUpload';
import { useProducts } from '@/contexts/ProductContext';
import { Package, Star, ShoppingBag, AlertCircle } from 'lucide-react';

/**
 * Admin Dashboard - Simplified without order management
 * Orders are managed via WhatsApp, not stored in database
 * Requirements: 2.1, 2.2, 2.6
 */
export const AdminDashboard = () => {
  const { products } = useProducts();

  // Calculate product statistics
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const inStockProducts = products.filter(product => (product.stock ?? 0) > 0).length;
    const outOfStockProducts = products.filter(product => (product.stock ?? 0) === 0).length;
    const lowStockProducts = products.filter(product => {
      const stock = product.stock ?? 0;
      return stock > 0 && stock < 5;
    }).length;

    return {
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      lowStockProducts,
    };
  }, [products]);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-card border border-border/50 rounded-2xl p-8 md:p-12 shadow-premium">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent" />
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-heading tracking-tight mb-3">
              Dashboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Bem-vindo ao painel administrativo da <span className="text-secondary font-semibold">Tim Tim Bebidas</span>
            </p>
          </div>
        </div>

        {/* Statistics Cards - Premium Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminCard
            title="Total de Produtos"
            value={stats.totalProducts}
            icon={Package}
            description="Produtos cadastrados"
            link="/admin/produtos"
          />
          <AdminCard
            title="Em Estoque"
            value={stats.inStockProducts}
            icon={ShoppingBag}
            description="Disponíveis para venda"
            link="/admin/produtos"
            variant="success"
          />
          <AdminCard
            title="Estoque Baixo"
            value={stats.lowStockProducts}
            icon={AlertCircle}
            description="Menos de 5 unidades"
            link="/admin/produtos"
            variant="warning"
          />
          <AdminCard
            title="Esgotados"
            value={stats.outOfStockProducts}
            icon={Star}
            description="Sem estoque disponível"
            link="/admin/produtos"
            variant="warning"
          />
        </div>

        {/* Quick Actions Grid - Premium Design */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info Section */}
          <div className="lg:col-span-2 bg-gradient-card border border-border/50 rounded-xl p-8 shadow-card hover:border-secondary/30 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-secondary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground font-heading">
                Gerenciamento de Pedidos
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div className="flex gap-4 p-4 bg-background/50 rounded-lg border border-border/30">
                <span className="text-2xl">📱</span>
                <div>
                  <strong className="text-foreground font-heading block mb-1">Pedidos via WhatsApp</strong>
                  <p className="text-sm">Os clientes finalizam suas compras diretamente pelo WhatsApp. Não há armazenamento de pedidos no banco de dados.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-background/50 rounded-lg border border-border/30">
                <span className="text-2xl">🛍️</span>
                <div>
                  <strong className="text-foreground font-heading block mb-1">Gerenciar Produtos</strong>
                  <p className="text-sm">Use a seção de produtos para adicionar, editar ou remover itens do catálogo.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-background/50 rounded-lg border border-border/30">
                <span className="text-2xl">📦</span>
                <div>
                  <strong className="text-foreground font-heading block mb-1">Controle de Estoque</strong>
                  <p className="text-sm">Mantenha o estoque atualizado para garantir que os clientes vejam a disponibilidade correta.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Image Upload Widget */}
          <div className="lg:col-span-1">
            <QuickImageUpload />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
