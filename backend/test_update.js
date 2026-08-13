import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    // Buscar la id del primer usuario en la base de datos
    const { rows: [user] } = await pool.query('SELECT id, name, email, phone_number FROM users LIMIT 1');
    if (!user) {
      console.log("No hay usuarios en la base de datos para probar el update.");
      return;
    }
    
    console.log(`Probando UPDATE para el usuario: ${user.name} (${user.id})`);
    
    const name = user.name + " Modificado";
    const email = user.email; // Mismo email
    const phone_number = user.phone_number; // Mismo celular

    console.log("Simulando UPDATE de usuario en Supabase...");
    await pool.query(
      `UPDATE users SET name = $1, email = $2, phone_number = $3 WHERE id = $4`,
      [name, email, phone_number, user.id]
    );
    console.log("¡UPDATE exitoso!");
  } catch (err) {
    console.error("ERROR DE UPDATE SQL:", err);
  } finally {
    await pool.end();
  }
}

run();
