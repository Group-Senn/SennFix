import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  console.log("Conectando a base de datos:", process.env.DATABASE_URL);
  
  // 1. Probar consulta simple de servicios
  try {
    console.log("\n--- TEST 1: SELECT count(*) FROM services ---");
    const { rows } = await pool.query('SELECT count(*) FROM services');
    console.log("Resultado:", rows);
  } catch (err) {
    console.error("ERROR EN TEST 1:", err.message);
  }

  // 2. Probar consulta simple de profesionales
  try {
    console.log("\n--- TEST 2: SELECT count(*) FROM professionals ---");
    const { rows } = await pool.query('SELECT count(*) FROM professionals');
    console.log("Resultado:", rows);
  } catch (err) {
    console.error("ERROR EN TEST 2:", err.message);
  }

  // 3. Probar consulta simple de usuarios
  try {
    console.log("\n--- TEST 3: SELECT count(*) FROM users ---");
    const { rows } = await pool.query('SELECT count(*) FROM users');
    console.log("Resultado:", rows);
  } catch (err) {
    console.error("ERROR EN TEST 3:", err.message);
  }

  // 4. Probar query de /api/services?main=true
  try {
    console.log("\n--- TEST 4: Query /api/services?main=true ---");
    const queryText = `
      SELECT s.id, s.name, s.category, s.is_high_risk, s.is_main, s.icon_name as icon, COUNT(p.id) as prof_count
      FROM services s
      LEFT JOIN professionals p ON s.name = p.specialty
      GROUP BY s.id, s.name, s.category, s.is_high_risk, s.is_main, s.icon_name
      ORDER BY 
        COUNT(p.id) DESC,
        CASE 
          WHEN s.name = 'Plomero / Fontanero' THEN 1
          WHEN s.name = 'Jardinero' THEN 2
          WHEN s.name = 'Electricista (Baja Tensión / Residencial)' THEN 3
          WHEN s.name = 'Limpieza de Casas / Hogar' THEN 4
          WHEN s.name = 'Pintor Domiciliario' THEN 5
          ELSE 6
        END ASC,
        s.name ASC
      LIMIT 4
    `;
    const { rows } = await pool.query(queryText);
    console.log("Resultado (primeros 2):", rows.slice(0, 2));
  } catch (err) {
    console.error("ERROR EN TEST 4:", err);
  }

  // 5. Probar query de /api/professionals/nearby
  try {
    console.log("\n--- TEST 5: Query /api/professionals/nearby ---");
    const clientLat = -17.7834;
    const clientLon = -63.1822;
    const { rows } = await pool.query(`
      SELECT 
        p.id, u.name, p.specialty, p.rating, p.reviews, p.is_verified as verified, 
        p.has_gold_seal, p.bio, u."imageUrl", p.services_offered, p.has_store, 
        p.store_address, p.latitude, p.longitude, p.action_radius, p.is_online, 
        p.current_latitude, p.current_longitude, p.is_minor, u.phone_number,
        (6371 * acos(
          LEAST(1.0, GREATEST(-1.0, 
            cos(radians($1)) * cos(radians(COALESCE(p.current_latitude, p.latitude))) * 
            cos(radians(COALESCE(p.current_longitude, p.longitude)) - radians($2)) + 
            sin(radians($1)) * sin(radians(COALESCE(p.current_latitude, p.latitude)))
          ))
        )) AS distance
      FROM professionals p
      JOIN users u ON p.id = u.id
      WHERE u.account_status = 'active'
        AND COALESCE(p.current_latitude, p.latitude) IS NOT NULL 
        AND COALESCE(p.current_longitude, p.longitude) IS NOT NULL
        AND (6371 * acos(
          LEAST(1.0, GREATEST(-1.0, 
            cos(radians($1)) * cos(radians(COALESCE(p.current_latitude, p.latitude))) * 
            cos(radians(COALESCE(p.current_longitude, p.longitude)) - radians($2)) + 
            sin(radians($1)) * sin(radians(COALESCE(p.current_latitude, p.latitude)))
          ))
        )) <= COALESCE(p.action_radius, 10)
      ORDER BY distance ASC
    `, [clientLat, clientLon]);
    console.log("Resultado (primeros 2):", rows.slice(0, 2));
  } catch (err) {
    console.error("ERROR EN TEST 5:", err);
  }

  await pool.end();
}

run();
