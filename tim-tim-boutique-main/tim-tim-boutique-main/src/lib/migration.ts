/**
 * Migration Utility - Migrates cart data from localStorage to sessionStorage
 * 
 * This utility handles the one-time migration of cart and shipping data
 * from the old localStorage-based system to the new sessionStorage-based system.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.5
 */

import { sessionService } from '@/services/sessionService';

// Old localStorage keys
const OLD_CART_KEY = 'tim-tim-cart';
const OLD_SHIPPING_KEY = 'tim-tim-shipping';
const MIGRATION_FLAG_KEY = 'tim-tim-migrated';

interface MigrationResult {
  success: boolean;
  cartMigrated: boolean;
  shippingMigrated: boolean;
  errors: string[];
}

/**
 * Check if migration has already been performed in this session
 * Requirement: 3.2 - Prevent duplicate migration
 */
export function hasMigrated(): boolean {
  try {
    return sessionStorage.getItem(MIGRATION_FLAG_KEY) === 'true';
  } catch (error) {
    console.error('Erro ao verificar status de migração:', error);
    return false;
  }
}

/**
 * Mark migration as completed
 * Requirement: 3.2 - Prevent duplicate migration
 */
function markAsMigrated(): void {
  try {
    sessionStorage.setItem(MIGRATION_FLAG_KEY, 'true');
  } catch (error) {
    console.error('Erro ao marcar migração como concluída:', error);
  }
}

/**
 * Safely parse JSON data with error handling
 * Requirement: 3.5 - Handle corrupted data
 */
function safeParse<T>(data: string | null, defaultValue: T): { value: T; error: string | null } {
  if (!data) {
    return { value: defaultValue, error: null };
  }

  try {
    const parsed = JSON.parse(data);
    return { value: parsed, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao parsear dados:', errorMessage);
    return { value: defaultValue, error: `Dados corrompidos: ${errorMessage}` };
  }
}

/**
 * Migrate cart data from localStorage to sessionStorage
 * Requirement: 3.1 - Migrate cart data
 */
function migrateCart(): { success: boolean; error: string | null } {
  try {
    const oldCartData = localStorage.getItem(OLD_CART_KEY);
    
    if (!oldCartData) {
      console.log('ℹ️ Nenhum carrinho encontrado no localStorage');
      return { success: true, error: null };
    }

    const { value: cartItems, error: parseError } = safeParse(oldCartData, []);
    
    if (parseError) {
      return { success: false, error: parseError };
    }

    // Validate cart structure
    if (!Array.isArray(cartItems)) {
      return { success: false, error: 'Formato de carrinho inválido' };
    }

    // Save to sessionStorage using sessionService
    sessionService.saveCart(cartItems);
    console.log(`✅ Carrinho migrado: ${cartItems.length} item(ns)`);
    
    return { success: true, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao migrar carrinho:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Migrate shipping data from localStorage to sessionStorage
 * Requirement: 3.1 - Migrate shipping data
 */
function migrateShipping(): { success: boolean; error: string | null } {
  try {
    const oldShippingData = localStorage.getItem(OLD_SHIPPING_KEY);
    
    if (!oldShippingData) {
      console.log('ℹ️ Nenhuma informação de frete encontrada no localStorage');
      return { success: true, error: null };
    }

    const { value: shippingInfo, error: parseError } = safeParse(oldShippingData, null);
    
    if (parseError) {
      return { success: false, error: parseError };
    }

    // Validate shipping structure
    if (shippingInfo && typeof shippingInfo === 'object') {
      sessionService.saveShipping(shippingInfo);
      console.log('✅ Informações de frete migradas');
      return { success: true, error: null };
    }

    return { success: false, error: 'Formato de frete inválido' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao migrar frete:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Clean up old localStorage data after successful migration
 * Requirement: 3.3 - Clean up old data
 */
function cleanupLocalStorage(): void {
  try {
    const hadCart = localStorage.getItem(OLD_CART_KEY) !== null;
    const hadShipping = localStorage.getItem(OLD_SHIPPING_KEY) !== null;

    if (hadCart) {
      localStorage.removeItem(OLD_CART_KEY);
      console.log('🧹 Carrinho removido do localStorage');
    }

    if (hadShipping) {
      localStorage.removeItem(OLD_SHIPPING_KEY);
      console.log('🧹 Frete removido do localStorage');
    }

    if (hadCart || hadShipping) {
      console.log('✅ Limpeza do localStorage concluída');
    }
  } catch (error) {
    console.error('Erro ao limpar localStorage:', error);
  }
}

/**
 * Main migration function - migrates all data from localStorage to sessionStorage
 * Requirements: 3.1, 3.2, 3.3, 3.5
 * 
 * @returns MigrationResult with details about the migration process
 */
export function migrateFromLocalStorage(): MigrationResult {
  console.log('🔄 Iniciando migração de localStorage para sessionStorage...');

  const result: MigrationResult = {
    success: true,
    cartMigrated: false,
    shippingMigrated: false,
    errors: []
  };

  // Check if already migrated (Requirement 3.2)
  if (hasMigrated()) {
    console.log('ℹ️ Migração já foi realizada nesta sessão');
    return result;
  }

  try {
    // Migrate cart (Requirement 3.1)
    const cartResult = migrateCart();
    if (cartResult.success) {
      result.cartMigrated = localStorage.getItem(OLD_CART_KEY) !== null;
    } else {
      result.success = false;
      if (cartResult.error) {
        result.errors.push(`Carrinho: ${cartResult.error}`);
      }
    }

    // Migrate shipping (Requirement 3.1)
    const shippingResult = migrateShipping();
    if (shippingResult.success) {
      result.shippingMigrated = localStorage.getItem(OLD_SHIPPING_KEY) !== null;
    } else {
      result.success = false;
      if (shippingResult.error) {
        result.errors.push(`Frete: ${shippingResult.error}`);
      }
    }

    // Clean up old data (Requirement 3.3)
    if (result.cartMigrated || result.shippingMigrated) {
      cleanupLocalStorage();
    }

    // Mark as migrated to prevent duplicate runs (Requirement 3.2)
    markAsMigrated();

    // Log final result
    if (result.success) {
      if (result.cartMigrated || result.shippingMigrated) {
        console.log('✅ Migração concluída com sucesso');
      } else {
        console.log('ℹ️ Nenhum dado para migrar');
      }
    } else {
      console.warn('⚠️ Migração concluída com erros:', result.errors);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro crítico durante migração:', errorMessage);
    result.success = false;
    result.errors.push(`Erro crítico: ${errorMessage}`);
    
    // Mark as migrated even on critical error to prevent retry loops (Requirement 3.5)
    markAsMigrated();
  }

  return result;
}

/**
 * Force re-migration (useful for testing or troubleshooting)
 * This clears the migration flag and runs migration again
 */
export function forceMigration(): MigrationResult {
  try {
    sessionStorage.removeItem(MIGRATION_FLAG_KEY);
    console.log('🔄 Forçando nova migração...');
  } catch (error) {
    console.error('Erro ao limpar flag de migração:', error);
  }
  
  return migrateFromLocalStorage();
}

/**
 * Get migration status information
 */
export function getMigrationStatus(): {
  migrated: boolean;
  hasOldCart: boolean;
  hasOldShipping: boolean;
} {
  return {
    migrated: hasMigrated(),
    hasOldCart: localStorage.getItem(OLD_CART_KEY) !== null,
    hasOldShipping: localStorage.getItem(OLD_SHIPPING_KEY) !== null
  };
}
