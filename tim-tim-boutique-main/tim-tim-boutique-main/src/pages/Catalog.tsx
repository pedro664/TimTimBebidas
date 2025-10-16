import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { useProducts } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

const Catalog = () => {
  // ✅ Usar ProductContext para obter produtos em tempo real
  const { products } = useProducts();
  const [searchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("default");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ✅ Aplicar busca da URL quando o componente montar ou URL mudar
  useEffect(() => {
    const buscaParam = searchParams.get('busca');
    const categoriaParam = searchParams.get('categoria');
    
    if (buscaParam) {
      setSearchTerm(buscaParam);
    }
    
    if (categoriaParam) {
      setCategoryFilter(categoriaParam);
    }
  }, [searchParams]);

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // ✅ Categorias e países atualizam automaticamente quando produtos mudam
  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];
  const countries = ["all", ...Array.from(new Set(products.map(p => p.country)))];

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search filter - busca em múltiplos campos
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower) ||
          product.country.toLowerCase().includes(searchLower) ||
          (product.region && product.region.toLowerCase().includes(searchLower)) ||
          product.tastingNotes.some(note => note.toLowerCase().includes(searchLower)) ||
          product.pairing.some(pair => pair.toLowerCase().includes(searchLower)) ||
          (product.grapes && product.grapes.some(grape => grape.toLowerCase().includes(searchLower)));
        
        if (!matchesSearch) return false;
      }

      // Category filter
      if (categoryFilter !== "all" && product.category !== categoryFilter) return false;

      // Country filter
      if (countryFilter !== "all" && product.country !== countryFilter) return false;

      // Price range filter
      if (priceRange !== "all") {
        const price = product.price;
        switch (priceRange) {
          case "0-500":
            if (price > 500) return false;
            break;
          case "500-1000":
            if (price < 500 || price > 1000) return false;
            break;
          case "1000-2000":
            if (price < 1000 || price > 2000) return false;
            break;
          case "2000+":
            if (price < 2000) return false;
            break;
        }
      }

      return true;
    });

    // Sort products
    if (sortOrder === "price-asc") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortOrder === "price-desc") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [debouncedSearchTerm, categoryFilter, countryFilter, priceRange, sortOrder]);

  const hasActiveFilters = 
    searchTerm !== "" || 
    categoryFilter !== "all" || 
    countryFilter !== "all" || 
    priceRange !== "all" || 
    sortOrder !== "default";

  const clearAllFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setCountryFilter("all");
    setPriceRange("all");
    setSortOrder("default");
  };

  return (
    <div className="min-h-screen pt-28 md:pt-32 lg:pt-36 xl:pt-40 pb-12 md:pb-16 lg:pb-18 xl:pb-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-6 xl:px-6">
        {/* Header */}
        <div className="mb-8 md:mb-10 lg:mb-10 xl:mb-12 text-center">
          <h1 className="font-heading text-3xl md:text-[2.5rem] lg:text-[2.75rem] xl:text-5xl mb-3 md:mb-4">
            Nosso Catálogo
          </h1>
          <p className="text-muted-foreground text-base md:text-[1.05rem] lg:text-[1.05rem] xl:text-lg max-w-xl md:max-w-2xl mx-auto px-4 md:px-0 leading-relaxed">
            Explore nossa seleção cuidadosamente curada de bebidas premium de todo o mundo
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 md:mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nome, país, região, uvas, notas de degustação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 h-11 md:h-12 text-sm md:text-base"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Limpar busca"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row flex-wrap gap-3 md:gap-3 lg:gap-3 xl:gap-4 justify-center items-center">
          <div className="w-full sm:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] lg:w-[180px] xl:w-[200px] h-11 md:h-11 lg:h-10 xl:h-10 text-sm md:text-sm lg:text-sm xl:text-base">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.filter(c => c !== "all").map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] lg:w-[180px] xl:w-[200px] h-11 md:h-11 lg:h-10 xl:h-10 text-sm md:text-sm lg:text-sm xl:text-base">
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Países</SelectItem>
                {countries.filter(c => c !== "all").map(country => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] lg:w-[180px] xl:w-[200px] h-11 md:h-11 lg:h-10 xl:h-10 text-sm md:text-sm lg:text-sm xl:text-base">
                <SelectValue placeholder="Faixa de Preço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Preços</SelectItem>
                <SelectItem value="0-500">Até R$ 500</SelectItem>
                <SelectItem value="500-1000">R$ 500 - R$ 1.000</SelectItem>
                <SelectItem value="1000-2000">R$ 1.000 - R$ 2.000</SelectItem>
                <SelectItem value="2000+">Acima de R$ 2.000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] lg:w-[180px] xl:w-[200px] h-11 md:h-11 lg:h-10 xl:h-10 text-sm md:text-sm lg:text-sm xl:text-base">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Padrão</SelectItem>
                <SelectItem value="price-asc">Menor Preço</SelectItem>
                <SelectItem value="price-desc">Maior Preço</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="w-full sm:w-auto h-11 md:h-11 lg:h-10 xl:h-10 hover-glow text-sm md:text-sm lg:text-sm xl:text-sm px-4 md:px-5 lg:px-4 xl:px-4"
            >
              Limpar Filtros
            </Button>
          )}
        </div>

        {/* Results Counter */}
        {hasActiveFilters && (
          <div className="mb-6 text-center">
            <p className="text-sm md:text-base text-muted-foreground">
              {filteredProducts.length === 0 
                ? "Nenhum produto encontrado" 
                : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`
              }
            </p>
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-4 lg:gap-5 xl:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-4 lg:gap-5 xl:gap-6 auto-rows-fr">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 md:py-20">
            <p className="text-muted-foreground text-base md:text-lg mb-4">
              Nenhum produto encontrado com os filtros selecionados.
            </p>
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="hover-glow"
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
