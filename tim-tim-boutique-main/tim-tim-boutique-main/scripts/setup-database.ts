import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eupmbbkllnjzdfnnzmdk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cG1iYmtsbG5qemRmbm56bWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDY4MzIsImV4cCI6MjA3NTY4MjgzMn0.U0svCnaBESxSaEs2pqqplczvNHivCZv_rt5clFNVrKM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Iniciando configuração do banco de dados Supabase...\n');

  try {
    // 1. Criar tabela products
    console.log('📦 Criando tabela products...');
    const { error: productsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          category VARCHAR(50) NOT NULL CHECK (category IN ('vinho', 'whisky', 'destilado', 'espumante')),
          image_url TEXT NOT NULL,
          stock INTEGER NOT NULL DEFAULT 0,
          tags TEXT[] DEFAULT '{}',
          featured BOOLEAN DEFAULT FALSE,
          discount DECIMAL(5, 2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (productsError) {
      console.log('⚠️  Tabela products já existe ou erro:', productsError.message);
    } else {
      console.log('✅ Tabela products criada com sucesso!');
    }

    // 2. Criar índices para products
    console.log('📊 Criando índices para products...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
        CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
        CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
      `
    });
    console.log('✅ Índices de products criados!');

    // 3. Criar tabela orders
    console.log('📋 Criando tabela orders...');
    const { error: ordersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS orders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_number VARCHAR(50) UNIQUE NOT NULL,
          customer_name VARCHAR(255) NOT NULL,
          customer_email VARCHAR(255) NOT NULL,
          customer_phone VARCHAR(20) NOT NULL,
          shipping_street VARCHAR(255) NOT NULL,
          shipping_number VARCHAR(20) NOT NULL,
          shipping_complement VARCHAR(255),
          shipping_neighborhood VARCHAR(100) NOT NULL,
          shipping_city VARCHAR(100) NOT NULL,
          shipping_state VARCHAR(2) NOT NULL,
          shipping_zip_code VARCHAR(9) NOT NULL,
          subtotal DECIMAL(10, 2) NOT NULL,
          shipping_cost DECIMAL(10, 2) NOT NULL,
          total DECIMAL(10, 2) NOT NULL,
          shipping_carrier VARCHAR(100) NOT NULL,
          shipping_estimated_hours INTEGER,
          shipping_is_free BOOLEAN DEFAULT FALSE,
          shipping_tracking_code VARCHAR(100),
          shipping_delivery_time TIMESTAMP WITH TIME ZONE,
          status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
            status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
          ),
          payment_method VARCHAR(20) NOT NULL CHECK (
            payment_method IN ('credit_card', 'debit_card', 'pix', 'boleto')
          ),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (ordersError) {
      console.log('⚠️  Tabela orders já existe ou erro:', ordersError.message);
    } else {
      console.log('✅ Tabela orders criada com sucesso!');
    }

    // 4. Criar índices para orders
    console.log('📊 Criando índices para orders...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
        CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
      `
    });
    console.log('✅ Índices de orders criados!');

    // 5. Criar tabela order_items
    console.log('🛒 Criando tabela order_items...');
    const { error: itemsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS order_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          product_id UUID NOT NULL REFERENCES products(id),
          product_name VARCHAR(255) NOT NULL,
          product_price DECIMAL(10, 2) NOT NULL,
          quantity INTEGER NOT NULL,
          subtotal DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (itemsError) {
      console.log('⚠️  Tabela order_items já existe ou erro:', itemsError.message);
    } else {
      console.log('✅ Tabela order_items criada com sucesso!');
    }

    // 6. Criar índice para order_items
    console.log('📊 Criando índice para order_items...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      `
    });
    console.log('✅ Índice de order_items criado!');

    // 7. Criar tabela settings
    console.log('⚙️  Criando tabela settings...');
    const { error: settingsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS settings (
          key VARCHAR(100) PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (settingsError) {
      console.log('⚠️  Tabela settings já existe ou erro:', settingsError.message);
    } else {
      console.log('✅ Tabela settings criada com sucesso!');
    }

    // 8. Inserir configurações padrão
    console.log('💾 Inserindo configurações padrão...');
    await supabase.from('settings').upsert([
      { key: 'site_name', value: 'Tim-Tim Boutique' },
      { key: 'admin_email', value: 'admin@timtimboutique.com' },
      { key: 'contact_info', value: { phone: '(81) 99999-9999', email: 'contato@timtimboutique.com' } }
    ]);
    console.log('✅ Configurações padrão inseridas!');

    console.log('\n🎉 Banco de dados configurado com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Configure as políticas RLS no painel do Supabase');
    console.log('2. Execute o script de migração de produtos');
    console.log('3. Teste a conexão com o banco de dados\n');

  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
    process.exit(1);
  }
}

setupDatabase();
