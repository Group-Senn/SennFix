import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// Configura el pool de conexiones usando la variable de entorno
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // En producción con Neon, esto es necesario.
    rejectUnauthorized: false
  }
});

// Exportamos un objeto con dos métodos:
// 1. query: para ejecutar consultas simples.
// 2. connect: para obtener un cliente del pool, necesario para transacciones.
export default {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
};