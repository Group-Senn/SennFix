import sqlite3 from 'sqlite3';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const localDb = new sqlite3.Database('./senn.db');
const cloudPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  console.log("🚀 Iniciando migración de SENN FIX...");

  try {
    // 1. Obtener usuarios de SQLite
    const users = await new Promise((resolve, reject) => {
      localDb.all("SELECT * FROM users", (err, rows) => err ? reject(err) : resolve(rows));
    });

    for (const user of users) {
      console.log(` -> Migrando base de usuario: ${user.name}`);
      // Insertar en la tabla 'users' de Neon (SOLO datos básicos)
      await cloudPool.query(
        `INSERT INTO users (id, name, email, password_hash, user_type, phone_number, birth_date, account_status, legal_accepted) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (id) DO NOTHING`,
        [
          user.id, 
          user.name, 
          user.email, 
          user.password_hash, 
          user.user_type || 'client', 
          user.phone_number || '00000000', 
          '2000-01-01', // Fecha por defecto
          'active', 
          true // Aceptación de "No Relación Laboral" 
        ]
      );

      // 2. Si es profesional, migrar sus datos extra a la tabla 'professionals'
      if (user.user_type === 'professional') {
        console.log(`    --> Migrando detalles de profesional...`);
        // Buscamos si tiene datos en la tabla professionals local
        const proData = await new Promise((resolve) => {
          localDb.get("SELECT * FROM professionals WHERE id = ?", [user.id], (err, row) => resolve(row));
        });

        await cloudPool.query(
          `INSERT INTO professionals (id, specialty, identity_card_num, is_verified) 
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT (id) DO NOTHING`,
          [
            user.id, 
            proData?.specialty || 'General', 
            proData?.identity_card || user.identity_card || '0000000', // Aquí corregimos el campo
            proData?.verified === 1
          ]
        );
      }
    }

    console.log("🎉 ¡Misión cumplida! Datos migrados con éxito.");

  } catch (err) {
    console.error("❌ Error durante la migración:", err);
  } finally {
    localDb.close();
    await cloudPool.end();
  }
}

migrate();