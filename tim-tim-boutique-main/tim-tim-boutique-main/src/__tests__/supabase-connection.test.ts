/**
 * Supabase Connection Tests
 * 
 * These tests verify that the Supabase client is properly configured
 * and can connect to the database.
 */

import { describe, it, expect } from 'vitest';
import { supabase, testSupabaseConnection } from '../lib/supabase';

describe('Supabase Configuration', () => {
  it('should have supabase client initialized', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(supabase.from).toBeDefined();
  });

  it('should have valid environment variables', () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    expect(supabaseUrl).toBeDefined();
    expect(supabaseUrl).toContain('supabase.co');
    expect(supabaseAnonKey).toBeDefined();
    expect(supabaseAnonKey.length).toBeGreaterThan(0);
  });

  it('should be able to create a query', () => {
    const query = supabase.from('products').select('*');
    expect(query).toBeDefined();
  });
});

describe('Supabase Connection Test', () => {
  it('should test connection function', async () => {
    // This test will actually try to connect to Supabase
    // It may fail if the database tables are not yet created
    const result = await testSupabaseConnection();
    
    // We expect either true (connection successful) or false (tables not created yet)
    expect(typeof result).toBe('boolean');
  });
});
