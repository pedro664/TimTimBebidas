import { memo } from 'react';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AdminCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  link?: string;
  variant?: 'default' | 'warning' | 'success';
}

export const AdminCard = memo(function AdminCard({
  title,
  value,
  icon: Icon,
  description,
  link,
  variant = 'default',
}: AdminCardProps) {
  const variantStyles = {
    default: 'bg-card border-border hover:border-secondary/50',
    warning: 'bg-card border-border hover:border-yellow-500/50',
    success: 'bg-card border-border hover:border-green-500/50',
  };

  const iconStyles = {
    default: 'text-secondary',
    warning: 'text-yellow-500',
    success: 'text-green-500',
  };

  const valueStyles = {
    default: 'text-foreground',
    warning: 'text-foreground',
    success: 'text-foreground',
  };

  const titleStyles = {
    default: 'text-muted-foreground',
    warning: 'text-muted-foreground',
    success: 'text-muted-foreground',
  };

  const cardContent = (
    <Card
      className={cn(
        'transition-all duration-300 shadow-card hover:shadow-premium',
        variantStyles[variant],
        link && 'cursor-pointer hover:scale-105 hover:-translate-y-1'
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className={cn('p-3 rounded-lg', 
          variant === 'success' ? 'bg-green-500/10' : 
          variant === 'warning' ? 'bg-yellow-500/10' : 
          'bg-secondary/10'
        )}>
          <Icon className={cn('h-6 w-6', iconStyles[variant])} aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className={cn('text-3xl font-bold font-heading', valueStyles[variant])}>
          {value}
        </div>
        <CardTitle className={cn('text-sm font-medium uppercase tracking-wide', titleStyles[variant])}>
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );

  if (link) {
    return (
      <Link 
        to={link} 
        className="block focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
        style={{ '--tw-ring-color': 'hsl(var(--admin-primary))' } as React.CSSProperties}
        aria-label={`Ver ${title.toLowerCase()}: ${value}`}
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
});
