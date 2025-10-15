import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for ProductCard
 * Displays a loading placeholder while products are being fetched
 */
const ProductCardSkeleton = () => {
  return (
    <Card className="flex flex-col overflow-hidden border-border/50 bg-card h-full">
      {/* Image skeleton */}
      <Skeleton className="aspect-[3/4] w-full" />
      
      {/* Content skeleton */}
      <div className="p-3 sm:p-4 md:p-4 lg:p-4 bg-gradient-card flex flex-col flex-grow">
        {/* Category and country */}
        <div className="flex items-start justify-between gap-1 mb-1.5 md:mb-2 lg:mb-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        
        {/* Product name */}
        <Skeleton className="h-5 w-full mb-2 md:mb-2 lg:mb-2" />
        <Skeleton className="h-5 w-3/4 mb-2 md:mb-2 lg:mb-2" />
        
        {/* Price */}
        <div className="flex items-center justify-between mb-2.5 md:mb-2.5 lg:mb-2.5 mt-auto">
          <Skeleton className="h-7 w-24" />
        </div>
        
        {/* Button */}
        <Skeleton className="w-full h-9 sm:h-10 md:h-10 lg:h-10" />
      </div>
    </Card>
  );
};

export default ProductCardSkeleton;
