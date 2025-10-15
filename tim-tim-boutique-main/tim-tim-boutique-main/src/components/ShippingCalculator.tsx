import { useState, useEffect } from 'react';
import { validateShippingArea, getShippingInfo } from '@/services/shippingService';
import { maskCep, unmask } from '@/lib/masks';
import { useCart } from '@/contexts/CartContext';
import type { ShippingValidation } from '@/services/shippingService';

interface ShippingCalculatorProps {
  subtotal: number;
  onShippingCalculated?: (cost: number, isFree: boolean, city?: string, cep?: string) => void;
  className?: string;
}

export default function ShippingCalculator({ 
  subtotal, 
  onShippingCalculated,
  className = '' 
}: ShippingCalculatorProps) {
  const { shipping, setShipping, items } = useCart();
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShippingValidation | null>(null);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [isFree, setIsFree] = useState(false);

  const shippingInfo = getShippingInfo();

  // Load shipping info from session on mount (Requirement 6.2)
  useEffect(() => {
    if (shipping && shipping.isValid) {
      // Pre-load shipping data from session
      setCep(shipping.cep || '');
      setShippingCost(shipping.cost);
      setIsFree(shipping.isFree);
      
      // Set result to show the shipping is already calculated
      setResult({
        isValid: true,
        address: {
          city: shipping.city || '',
          state: '', // We don't store state, but it's not critical for display
          street: '',
          neighborhood: ''
        }
      });

      // Notify parent if callback exists
      if (onShippingCalculated) {
        onShippingCalculated(shipping.cost, shipping.isFree, shipping.city, shipping.cep);
      }
    }
  }, []); // Only run on mount

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCep(e.target.value);
    setCep(masked);
    
    // Clear results when user changes CEP (Requirement 6.3)
    if (result) {
      setResult(null);
      setShippingCost(0);
      setIsFree(false);
      // Clear shipping from session
      setShipping(null);
    }
  };

  const calculateShipping = async () => {
    const cleanCep = unmask(cep);
    
    // Validate CEP length
    if (cleanCep.length !== 8) {
      setResult({
        isValid: false,
        error: 'CEP deve conter 8 dígitos'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Import calculateShipping from service
      const { calculateShipping: calcShipping } = await import('@/services/shippingService');
      
      // Use the full shipping calculation with weight
      const shippingCalc = await calcShipping(cep, items, subtotal);
      
      if (shippingCalc.isAvailable) {
        setResult({
          isValid: true,
          address: {
            city: shippingCalc.city || '',
            state: shippingCalc.state || '',
            street: '',
            neighborhood: ''
          }
        });
        
        setShippingCost(shippingCalc.cost);
        setIsFree(shippingCalc.isFree);

        // Save to CartContext (which will save to session)
        setShipping({
          cost: shippingCalc.cost,
          isFree: shippingCalc.isFree,
          city: shippingCalc.city,
          cep,
          isValid: true
        });

        // Notify parent component
        if (onShippingCalculated) {
          onShippingCalculated(shippingCalc.cost, shippingCalc.isFree, shippingCalc.city, cep);
        }
      } else {
        setResult({
          isValid: false,
          error: shippingCalc.message
        });
        
        setShippingCost(0);
        setIsFree(false);
        
        // Save invalid shipping to session
        setShipping({
          cost: 0,
          isFree: false,
          city: undefined,
          cep,
          isValid: false
        });
        
        if (onShippingCalculated) {
          onShippingCalculated(0, false, undefined, cep);
        }
      }
    } catch (error) {
      console.error('Error calculating shipping:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao calcular frete';
      
      setResult({
        isValid: false,
        error: errorMessage
      });
      
      // Show toast with retry option
      import('sonner').then(({ toast }) => {
        toast.error('Erro ao calcular frete', {
          description: errorMessage,
          action: {
            label: 'Tentar Novamente',
            onClick: calculateShipping,
          },
          duration: 5000,
        });
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      calculateShipping();
    }
  };

  return (
    <div className={`shipping-calculator ${className}`}>
      <div className="mb-4">
        <label htmlFor="cep-input" className="block text-sm font-medium text-gray-700 mb-2">
          Calcular Frete
        </label>
        
        <div className="flex gap-2">
          <input
            id="cep-input"
            type="text"
            value={cep}
            onChange={handleCepChange}
            onKeyDown={handleKeyDown}
            placeholder="00000-000"
            maxLength={9}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 placeholder:text-gray-400"
            aria-label="Digite seu CEP"
            aria-describedby="cep-help"
          />
          
          <button
            onClick={calculateShipping}
            disabled={loading || unmask(cep).length !== 8}
            className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            aria-label="Calcular frete"
          >
            {loading ? 'Calculando...' : 'Calcular'}
          </button>
        </div>
        
        <p id="cep-help" className="text-xs text-gray-500 mt-1">
          Digite seu CEP para calcular o frete
        </p>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-4">
          {result.isValid ? (
            <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-secondary" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </div>
                
                <div className="flex-1">
                  <p className="font-heading text-base text-foreground mb-1">
                    {isFree ? (
                      <>Frete Grátis</>
                    ) : (
                      <>Frete: R$ {shippingCost.toFixed(2)}</>
                    )}
                  </p>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    Entrega em <strong>até 2 horas</strong> para {result.address?.city} - {result.address?.state}
                  </p>
                  
                  {!isFree && subtotal < shippingInfo.freeShippingThreshold && (
                    <p className="text-xs text-secondary bg-secondary/10 rounded px-2 py-1 inline-block">
                      💡 Falta R$ {(shippingInfo.freeShippingThreshold - subtotal).toFixed(2)} para frete grátis!
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-destructive" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </div>
                
                <div className="flex-1">
                  <p className="font-heading text-base text-foreground mb-1">
                    Área não atendida
                  </p>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {result.error}
                  </p>
                  
                  <div className="text-xs text-muted-foreground bg-muted rounded px-2 py-1">
                    <p className="font-medium mb-1">Cidades atendidas:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {shippingInfo.coveredCities.map((city) => (
                        <li key={city}>{city}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info box */}
      {!result && (
        <div className="mt-4 bg-card border border-border rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
              <svg 
                className="w-5 h-5 text-secondary" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            
            <div className="text-sm text-foreground">
              <p className="font-heading mb-1">Entrega Expressa</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>⚡ Entrega em até 2 horas</li>
                <li>🎁 Frete grátis acima de R$ {shippingInfo.freeShippingThreshold.toFixed(2)}</li>
                <li>📍 Atendemos: {shippingInfo.coveredCities.join(', ')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
