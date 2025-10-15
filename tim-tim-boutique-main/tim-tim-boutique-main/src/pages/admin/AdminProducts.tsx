import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Package } from 'lucide-react';
import { useProducts } from '@/contexts/ProductContext';
import { useDebounce } from '@/hooks/useDebounce';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AdminProductCard from '@/components/admin/AdminProductCard';
import { AdminProductCardSkeleton } from '@/components/admin/AdminProductCardSkeleton';
import { ErrorState } from '@/components/admin/ErrorState';

const ITEMS_PER_PAGE = 24;

const CATEGORIES = [
  'Todas',
  'vinho',
  'whisky',
  'destilado',
  'espumante',
];

export default function AdminProducts() {
  const navigate = useNavigate();
  const { products, loading, error, refreshProducts } = useProducts();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query for better performance
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter(
        (product) => product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.country.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, selectedCategory, debouncedSearch]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, debouncedSearch]);

  const handleAddProduct = () => {
    navigate('/admin/produtos/novo');
  };

  const handleEditProduct = (id: string) => {
    navigate(`/admin/produtos/${id}`);
  };

  const handleDeleteProduct = async (id: string) => {
    // Product is already deleted by the card component
    // Just refresh the list
    await refreshProducts();
  };

  const handleRetry = () => {
    refreshProducts();
  };

  if (error) {
    return (
      <AdminLayout>
        <ErrorState
          title="Erro ao carregar produtos"
          message={error}
          onRetry={handleRetry}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section - High-end design */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground font-heading tracking-tight">
                Produtos
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie o catálogo de produtos da loja
              </p>
            </div>
            <Button
              onClick={handleAddProduct}
              className="gradient-wine text-white hover:opacity-90 transition-all shadow-premium h-11 px-6 font-heading uppercase tracking-wider"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Novo Produto
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-card border border-border/50 rounded-lg p-4 hover:border-secondary/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Package className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground font-heading">{products.length}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-card border border-border/50 rounded-lg p-4 hover:border-green-500/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Package className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground font-heading">
                    {products.filter(p => p.stock > 0).length}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Em Estoque</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-card border border-border/50 rounded-lg p-4 hover:border-yellow-500/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Package className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground font-heading">
                    {products.filter(p => p.stock > 0 && p.stock < 5).length}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Estoque Baixo</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-card border border-border/50 rounded-lg p-4 hover:border-destructive/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <Package className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground font-heading">
                    {products.filter(p => p.stock === 0).length}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Esgotados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section - Premium design */}
          <div className="bg-gradient-card border border-border/50 rounded-xl p-6 shadow-card">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-background border-border focus:border-secondary transition-colors"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px] h-11 bg-background border-border focus:border-secondary">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category} className="hover:bg-muted">
                      {category === 'Todas' ? 'Todas as Categorias' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                {filteredProducts.length === 0 ? (
                  'Nenhum produto encontrado'
                ) : filteredProducts.length === 1 ? (
                  '1 produto encontrado'
                ) : (
                  `${filteredProducts.length} produtos encontrados`
                )}
              </p>
              {(searchQuery || selectedCategory !== 'Todas') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Todas');
                  }}
                  className="text-secondary hover:text-secondary/80"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid - Identical to Catalog */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <AdminProductCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground font-heading mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              {searchQuery || selectedCategory !== 'Todas'
                ? 'Tente ajustar os filtros ou adicionar um novo produto.'
                : 'Comece adicionando seu primeiro produto ao catálogo.'}
            </p>
            <Button
              onClick={handleAddProduct}
              className="gradient-wine text-white hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {paginatedProducts.map((product) => (
                <AdminProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-border hover:bg-muted"
                  >
                    Anterior
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first, last, current, and adjacent pages
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-muted-foreground">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={
                              currentPage === page
                                ? 'gradient-wine text-white'
                                : 'border-border hover:bg-muted'
                            }
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-border hover:bg-muted"
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
