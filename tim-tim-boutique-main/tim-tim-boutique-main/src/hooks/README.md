# Hooks

## useBreakpoint

Hook para detectar o breakpoint atual do dispositivo.

### Uso

```tsx
import { useBreakpoint } from '@/hooks/useBreakpoint';

function MyComponent() {
  const { isMobile, isTablet, isDesktop, currentBreakpoint } = useBreakpoint();

  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
      
      {/* Ou use o breakpoint atual */}
      <p>Current breakpoint: {currentBreakpoint}</p>
    </div>
  );
}
```

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Retorno

```typescript
interface UseBreakpointReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop';
}
```
