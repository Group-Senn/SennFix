-- Migración para añadir soporte de notificaciones y posicionamiento de clientes

-- 1. Añadir columnas de última ubicación a usuarios para notificaciones por cercanía
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_latitude DOUBLE PRECISION;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_longitude DOUBLE PRECISION;

-- 2. Crear tabla de notificaciones persistentes
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'new_message', 'photo_verified', 'nearby_pro'
  is_read BOOLEAN DEFAULT FALSE,
  related_id INTEGER, -- ID de conversación, foto de portafolio o profesional relacionado
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
