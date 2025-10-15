import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/contexts/ProductContext";
import { useDebounce } from "@/hooks/useDebounce";
import { Product } from "@/types";

interface SearchBarProps {
  theme?: "light" | "dark";
  className?: string;
  inputClassName?: string;
}

const SearchBar = ({ theme = "light", className = "", inputClassName = "" }: SearchBarProps) => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter products based on search query
  useEffect(() => {
    if (debouncedSearch.trim().length >= 2) {
      const query = debouncedSearch.toLowerCase();
      const filtered = products
        .filter((product) => {
          const matchName = product.name.toLowerCase().includes(query);
          const matchCategory = product.category.toLowerCase().includes(query);
          const matchDescription = product.description?.toLowerCase().includes(query);
          const matchTags = product.tastingNotes?.some((tag) =>
            tag.toLowerCase().includes(query)
          );
          return matchName || matchCategory || matchDescription || matchTags;
        })
        .slice(0, 5); // Limit to 5 suggestions

      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  }, [debouncedSearch, products]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo?busca=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (productId: string) => {
    navigate(`/produto/${productId}`);
    setSearchQuery("");
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        handleSearch(e as any);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex].id);
        } else {
          handleSearch(e as any);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Clear search
  const handleClear = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const isDark = theme === "dark";
  const textColor = isDark ? "text-white" : "text-foreground";
  const placeholderColor = isDark ? "placeholder:text-white/50" : "placeholder:text-muted-foreground";
  const borderColor = isDark ? "border-white/30" : "border-border";
  const focusBorderColor = isDark ? "focus:border-secondary" : "focus:border-secondary";
  const iconColor = isDark ? "text-white/70" : "text-muted-foreground";

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center">
          <Search
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-3 w-3 xl:h-4 xl:w-4 2xl:h-5 2xl:w-5 ${iconColor} pointer-events-none`}
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            placeholder="Pesquisar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className={`w-full bg-transparent border-0 border-b ${borderColor} ${textColor} ${placeholderColor} pl-4 xl:pl-6 2xl:pl-7 pr-2 pb-1 pt-1 focus:outline-none font-body text-[9px] xl:text-sm 2xl:text-base ${inputClassName}`}
            aria-label="Pesquisar produtos"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={showSuggestions}
          />
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-premium overflow-hidden z-50 max-h-[400px] overflow-y-auto"
        >
          {suggestions.map((product, index) => (
            <button
              key={product.id}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => handleSuggestionClick(product.id)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full flex items-center gap-3 p-3 text-left transition-smooth hover:bg-secondary/10 ${
                index === selectedIndex ? "bg-secondary/10" : ""
              }`}
            >
              {/* Product Image */}
              <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {product.category}
                </p>
              </div>

              {/* Price */}
              <div className="flex-shrink-0 text-sm font-semibold text-secondary">
                {formatPrice(product.price)}
              </div>
            </button>
          ))}

          {/* View All Results */}
          <button
            onClick={() => {
              navigate(`/catalogo?busca=${encodeURIComponent(searchQuery.trim())}`);
              setSearchQuery("");
              setShowSuggestions(false);
              inputRef.current?.blur();
            }}
            className="w-full p-3 text-center text-sm text-secondary hover:bg-secondary/10 transition-smooth border-t border-border/30"
          >
            Ver todos os resultados para "{searchQuery}"
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
