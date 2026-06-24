INSERT INTO users (name, email, password_hash) VALUES
  ('Usuario Demo', 'demo@loyaltyapp.com', '$2b$10$placeholder')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO stores (name, location, category) VALUES
  ('OXXO Centro',         'Av. Madero 123, León',         'Conveniencia'),
  ('OXXO Plaza Mayor',    'Plaza Mayor Local 45, León',   'Conveniencia'),
  ('Farmacia del Ahorro', 'Blvd. López Mateos 890, León', 'Farmacia'),
  ('Súper Gutiérrez',     'Av. Constitución 456, León',   'Supermercado'),
  ('Gasolinería Norte',   'Carretera 45 Norte, León',     'Gasolinería')
ON CONFLICT DO NOTHING;

INSERT INTO rewards (name, description, points_cost, stock) VALUES
  ('Café gratis',           'Un café americano o cappuccino en cualquier tienda participante', 200,  50),
  ('Refresco 600ml',        'Refresco de tu elección, cualquier marca disponible en tienda',  150,  80),
  ('Snack gratis',          'Papas, galletas o dulces a tu elección',                         100, 100),
  ('Descuento $20',         '$20 de descuento en tu próxima compra mayor a $100',             300,  30),
  ('Descuento $50',         '$50 de descuento en tu próxima compra mayor a $200',             600,  20),
  ('Litro de leche gratis', 'Leche entera o light de 1L de cualquier marca',                 250,  40),
  ('Sandwich gratis',       'Sandwich o torta del menú disponible en tienda',                 350,  25),
  ('Carga de datos 1GB',    '1GB de datos para Telcel, AT&T o Movistar',                     500,  15),
  ('Vale gasolina $50',     'Vale de $50 para gasolina en Gasolinería Norte',                800,  10),
  ('Canasta básica',        'Canasta con leche, huevo, pan y aceite',                       1500,   5)
ON CONFLICT DO NOTHING;

INSERT INTO loyalty_cards (user_id, card_number, points_balance, tier)
SELECT id, '1234-5678-9012-3456', 50, 'bronze'
FROM users WHERE email = 'demo@loyaltyapp.com'
ON CONFLICT (card_number) DO UPDATE SET points_balance = EXCLUDED.points_balance;

INSERT INTO transactions (card_id, store_id, amount, points_earned)
SELECT lc.id, s.id, 50.00, 50
FROM loyalty_cards lc, stores s
WHERE lc.card_number = '1234-5678-9012-3456'
  AND s.name = 'OXXO Centro'
ON CONFLICT DO NOTHING;

INSERT INTO redemptions (card_id, reward_id, status)
SELECT lc.id, r.id, 'pending'
FROM loyalty_cards lc, rewards r
WHERE lc.card_number = '1234-5678-9012-3456'
  AND r.name = 'Café gratis'
ON CONFLICT DO NOTHING;
