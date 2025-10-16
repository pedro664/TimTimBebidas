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
      <div className="mb-3 sm:mb-3 md:mb-4">
        <label htmlFor="cep-input" className="block text-xs sm:text-xs md:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
          Calcular Frete
        </label>

        <div className="flex gap-1.5 sm:gap-2">
          <input
            id="cep-input"
            type="text"
            value={cep}
            onChange={handleCepChange}
            onKeyDown={handleKeyDown}
            placeholder="00000-000"
            maxLength={9}
            className="flex-1 min-w-0 px-2 sm:px-2.5 md:px-3 lg:px-2.5 xl:px-3 py-1.5 sm:py-2 md:py-2 lg:py-1.5 xl:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 placeholder:text-gray-400 text-xs sm:text-sm md:text-sm lg:text-xs xl:text-sm"
            aria-label="Digite seu CEP"
            aria-describedby="cep-help"
          />

          <button
            onClick={calculateShipping}
            disabled={loading || unmask(cep).length !== 8}
            className="px-2.5 sm:px-3 md:px-4 lg:px-3 xl:px-4 py-1.5 sm:py-2 md:py-2 lg:py-1.5 xl:py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-xs sm:text-sm md:text-sm lg:text-xs xl:text-sm whitespace-nowrap flex-shrink-0"
            aria-label="Calcular frete"
          >
            {loading ? 'Calculando...' : 'Calcular'}
          </button>
        </div>

        <p id="cep-help" className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 mt-1">
          Digite seu CEP para calcular o frete
        </p>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-2 sm:mt-3 md:mt-3">
          {result.isValid ? (
            <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-2.5 sm:p-3 md:p-3">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-secondary"
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

                <div className="flex-1 min-w-0">
                  <p className="font-heading text-xs sm:text-sm md:text-sm text-foreground mb-0.5 sm:mb-1">
                    {isFree ? (
                      <>Frete Grátis</>
                    ) : (
                      <>Frete: R$ {shippingCost.toFixed(2)}</>
                    )}
                  </p>

                  <p className="text-[10px] sm:text-xs md:text-xs text-muted-foreground mb-1 sm:mb-1.5 break-words leading-tight">
                    Entrega em <strong>até 2 horas</strong> para {result.address?.city}
                  </p>

                  {!isFree && subtotal < shippingInfo.freeShippingThreshold && (
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-secondary bg-secondary/10 rounded px-1.5 py-0.5 sm:px-2 sm:py-1 inline-block break-words">
                      💡 Falta R$ {(shippingInfo.freeShippingThreshold - subtotal).toFixed(2)} para frete grátis!
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-2.5 sm:p-3 md:p-3">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-destructive"
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

                <div className="flex-1 min-w-0">
                  <p className="font-heading text-xs sm:text-sm md:text-sm text-foreground mb-0.5 sm:mb-1">
                    Área não atendida
                  </p>

                  <p className="text-[10px] sm:text-xs md:text-xs text-muted-foreground mb-1 sm:mb-1.5 break-words leading-tight">
                    {result.error}
                  </p>

                  <div className="text-[10px] sm:text-xs text-muted-foreground bg-muted rounded px-1.5 py-1 sm:px-2 sm:py-1">
                    <p className="font-medium mb-0.5 sm:mb-1">Cidades atendidas:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-[9px] sm:text-[10px]">
                      {shippingInfo.coveredCities.map((city) => (
                        <li key={city} className="break-words">{city}</li>
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
        <div className="mt-2 sm:mt-3 md:mt-3 bg-card border border-border rounded-lg p-2 sm:p-2.5 md:p-3">
          <div className="flex items-start gap-1.5 sm:gap-2">
            <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-secondary/10 flex items-center justify-center">
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary"
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

            <div className="text-foreground min-w-0 flex-1">
              <p className="font-heading mb-0.5 sm:mb-1 text-xs sm:text-sm md:text-sm">Entrega Expressa</p>
              <ul className="space-y-0.5 text-[9px] sm:text-[10px] md:text-xs text-muted-foreground leading-tight">
                <li>⚡ Entrega em até 2 horas</li>
                <li>🎁 Frete grátis acima de R$ {shippingInfo.freeShippingThreshold.toFixed(2)}</li>
                <li className="break-words">📍 {shippingInfo.coveredCities.join(', ')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
