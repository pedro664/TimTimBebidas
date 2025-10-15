-- Script para inserir produtos de exemplo de marcas conhecidas
-- Um produto de cada categoria principal
-- Categorias válidas: 'vinho', 'whisky', 'destilado', 'espumante'

-- 1. Vinho Tinto - Concha y Toro Casillero del Diablo
INSERT INTO products (name, category, price, image_url, description, stock, tags, featured) 
VALUES (
  'Concha y Toro Casillero del Diablo Cabernet Sauvignon',
  'vinho',
  89.90,
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
  'Vinho tinto chileno encorpado e elegante, com aromas intensos de frutas vermelhas maduras e notas de especiarias. Cabernet Sauvignon do Valle Central. 750ml, 13.5% vol. Perfeito para carnes vermelhas, massas e queijos maturados.',
  50,
  ARRAY['Chile', 'Tinto', 'Cabernet Sauvignon', 'Valle Central'],
  true
);

-- 2. Vinho Branco - Santa Carolina Reserva Chardonnay
INSERT INTO products (name, category, price, image_url, description, stock, tags, featured) 
VALUES (
  'Santa Carolina Reserva Chardonnay',
  'vinho',
  79.90,
  'https://images.unsplash.com/photo-1474722883778-ab3ea2dd0f9d?w=400',
  'Vinho branco chileno fresco e aromático, com notas de frutas tropicais e toque de baunilha. Chardonnay do Valle de Casablanca. 750ml, 13% vol. Ideal para peixes, frutos do mar e aves.',
  45,
  ARRAY['Chile', 'Branco', 'Chardonnay', 'Valle de Casablanca'],
  false
);

-- 3. Espumante - Chandon Brut
INSERT INTO products (name, category, price, image_url, description, stock, tags, featured) 
VALUES (
  'Chandon Brut',
  'espumante',
  119.90,
  'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400',
  'Espumante brasileiro de alta qualidade, com bolhas finas e persistentes. Blend de Chardonnay e Pinot Noir da Serra Gaúcha. 750ml, 12% vol. Perfeito para celebrações, aperitivos e frutos do mar.',
  30,
  ARRAY['Brasil', 'Espumante', 'Brut', 'Serra Gaúcha'],
  true
);

-- 4. Whisky - Johnnie Walker Black Label
INSERT INTO products (name, category, price, image_url, description, stock, tags, featured) 
VALUES (
  'Johnnie Walker Black Label',
  'whisky',
  189.90,
  'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400',
  'Whisky escocês premium envelhecido por 12 anos. Blend complexo e suave das Highlands. 1000ml, 40% vol. Notas de defumado, frutas secas, mel e especiarias. Harmoniza com chocolates e queijos azuis.',
  35,
  ARRAY['Escócia', 'Whisky', '12 anos', 'Highlands'],
  true
);

-- 5. Vodka - Absolut Original
INSERT INTO products (name, category, price, image_url, description, stock, tags, featured) 
VALUES (
  'Absolut Vodka Original',
  'destilado',
  89.90,
  'https://images.unsplash.com/photo-1560508801-e1d1f2f2f5e5?w=400',
  'Vodka sueca premium, pura e suave. Produzida em Åhus com grãos selecionados. 1000ml, 40% vol. Perfeita para drinks, coquetéis sofisticados ou pura gelada.',
  60,
  ARRAY['Suécia', 'Vodka', 'Premium', 'Absolut'],
  false
);

-- 6. Gin - Tanqueray London Dry
INSERT INTO products (name, category, price, image_url, description, stock, tags, featured) 
VALUES (
  'Tanqueray London Dry Gin',
  'destilado',
  139.90,
  'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400',
  'Gin clássico inglês com sabor marcante de zimbro e botânicos. Receita tradicional de Londres. 750ml, 43.1% vol. Perfeito para gin tônica, Martini e Negroni.',
  40,
  ARRAY['Inglaterra', 'Gin', 'London Dry', 'Tanqueray'],
  true
);

-- 7. Champagne - Moët & Chandon Impérial Brut
INSERT INTO products (name, category, price, image_url, description, stock, tags, featured, discount) 
VALUES (
  'Moët & Chandon Impérial Brut',
  'espumante',
  399.90,
  'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=400',
  'Champagne francês icônico, símbolo de elegância e celebração. Blend de Pinot Noir, Chardonnay e Pinot Meunier. 750ml, 12% vol. Notas de frutas brancas, brioche e nozes. Ideal para celebrações especiais.',
  20,
  ARRAY['França', 'Champagne', 'Premium', 'Moët & Chandon'],
  true,
  10.00
);

-- 8. Rum - Havana Club 7 Anos
INSERT INTO products (name, category, price, image_url, description, stock, tags, featured) 
VALUES (
  'Havana Club 7 Anos',
  'destilado',
  159.90,
  'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400',
  'Rum cubano envelhecido por 7 anos, com sabor complexo e suave. Produzido em Havana. 750ml, 40% vol. Notas de baunilha, caramelo e especiarias. Perfeito para Mojito, Daiquiri ou puro.',
  25,
  ARRAY['Cuba', 'Rum', '7 anos', 'Havana Club'],
  false
);

-- Verificar produtos inseridos
SELECT COUNT(*) as total_produtos FROM products;
SELECT name, category, price FROM products ORDER BY category, name;
