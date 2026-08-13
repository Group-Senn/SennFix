import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const isLocal = !connectionString || connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : {
    rejectUnauthorized: false
  }
});

// Forzamos el search_path a 'public' en cada nueva conexión del pool
pool.on('connect', (client) => {
  client.query('SET search_path TO public').catch((err) => {
    console.error('Error setting search_path on new client:', err);
  });
});

// Exportamos un objeto con dos métodos:
// 1. query: para ejecutar consultas simples.
// 2. connect: para obtener un cliente del pool, necesario para transacciones.
export default {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
};