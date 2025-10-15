/**
 * Supabase Client Configuration
 * 
 * This file initializes and exports the Supabase client for use throughout the application.
 * The client is configured with environment variables for security.
 * 
 * @see https://supabase.com/docs/reference/javascript/introduction
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.\n' +
    'Required variables:\n' +
    '- VITE_SUPABASE_URL\n' +
    '- VITE_SUPABASE_ANON_KEY\n\n' +
    'See SUPABASE_SETUP_GUIDE.md for setup instructions.'
  );
}

/**
 * Supabase client instance
 * 
 * This client is used for all database operations, authentication, and storage.
 * It's configured with the project URL and anonymous key from environment variables.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Test the Supabase connection
 * 
 * This function can be used to verify that the Supabase client is properly configured
 * and can connect to the database.
 * 
 * @returns Promise<boolean> - True if connection is successful, false otherwise
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
}

// Export types for TypeScript support
export type { SupabaseClient } from '@supabase/supabase-js';
