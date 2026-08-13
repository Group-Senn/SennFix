import sqlite3 from 'sqlite3';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const localDb = new sqlite3.Database('./senn.db');
const cloudPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Convierte IDs enteros de SQLite a un formato UUID deterministicamente compatible con PostgreSQL
function toUUID(id) {
  if (!id) return null;
  if (typeof id === 'string' && id.length === 36 && id.includes('-')) {
    return id;
  }
  const idStr = id.toString().padStart(12, '0');
  return `00000000-0000-4000-a000-${idStr}`;
}

async function runMigration() {
  console.log("🚀 Iniciando migración completa y compatibilidad de UUID a Supabase...");

  const sqliteQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      localDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  };

  const tableExistsInSqlite = async (tableName) => {
    const rows = await sqliteQuery("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [tableName]);
    return rows.length > 0;
  };

  // 1. Servicios
  try {
    if (await tableExistsInSqlite("services")) {
      console.log("📦 Migrando servicios...");
      const services = await sqliteQuery("SELECT * FROM services");
      for (const s of services) {
        await cloudPool.query(
          `INSERT INTO services (id, name, icon_name, category, is_main, is_high_risk)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE 
           SET name = EXCLUDED.name, icon_name = EXCLUDED.icon_name, category = EXCLUDED.category, is_main = EXCLUDED.is_main, is_high_risk = EXCLUDED.is_high_risk`,
          [s.id, s.name, s.icon_name, s.category, s.is_main === 1 || s.is_main === true, s.is_high_risk === 1 || s.is_high_risk === true]
        );
      }
      console.log(`✅ ${services.length} servicios migrados.`);
    }
  } catch (err) {
    console.warn("⚠️ No se pudo migrar servicios:", err.message);
  }

  // 2. Usuarios
  try {
    if (await tableExistsInSqlite("users")) {
      console.log("👥 Migrando usuarios...");
      const users = await sqliteQuery("SELECT * FROM users");
      for (const u of users) {
        const uuid = toUUID(u.id);
        await cloudPool.query(
          `INSERT INTO users (id, name, email, password_hash, phone_number, birth_date, identity_card, "imageUrl", user_type, account_status, legal_accepted, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO UPDATE
           SET name = EXCLUDED.name, email = EXCLUDED.email, password_hash = EXCLUDED.password_hash, phone_number = EXCLUDED.phone_number, birth_date = EXCLUDED.birth_date, identity_card = EXCLUDED.identity_card, "imageUrl" = EXCLUDED."imageUrl", user_type = EXCLUDED.user_type, account_status = EXCLUDED.account_status, legal_accepted = EXCLUDED.legal_accepted, created_at = EXCLUDED.created_at`,
          [
            uuid, 
            u.name, 
            u.email, 
            u.password_hash, 
            u.phone_number, 
            u.birth_date || '2000-01-01', 
            u.identity_card, 
            u.imageUrl, 
            u.user_type || 'client', 
            u.status || u.account_status || 'active', 
            u.legal_accepted === 1 || u.legal_accepted === true || true,
            u.created_at ? new Date(u.created_at) : new Date()
          ]
        );
      }
      console.log(`✅ ${users.length} usuarios migrados (convertidos a UUID).`);
    }
  } catch (err) {
    console.warn("⚠️ No se pudo migrar usuarios:", err.message);
  }

  // 3. Profesionales
  try {
    if (await tableExistsInSqlite("professionals")) {
      console.log("🛠️ Migrando profesionales...");
      const professionals = await sqliteQuery("SELECT * FROM professionals");
      for (const p of professionals) {
        const uuid = toUUID(p.id);
        await cloudPool.query(
          `INSERT INTO professionals (id, name, specialty, rating, reviews, is_verified, bio, "imageUrl", services_offered, has_store, store_address, latitude, longitude, action_radius, is_online, current_latitude, current_longitude)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
           ON CONFLICT (id) DO UPDATE
           SET name = EXCLUDED.name, specialty = EXCLUDED.specialty, rating = EXCLUDED.rating, reviews = EXCLUDED.reviews, is_verified = EXCLUDED.is_verified, bio = EXCLUDED.bio, "imageUrl" = EXCLUDED."imageUrl", services_offered = EXCLUDED.services_offered, has_store = EXCLUDED.has_store, store_address = EXCLUDED.store_address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, action_radius = EXCLUDED.action_radius, is_online = EXCLUDED.is_online, current_latitude = EXCLUDED.current_latitude, current_longitude = EXCLUDED.current_longitude`,
          [
            uuid, 
            p.name, 
            p.specialty, 
            p.rating, 
            p.reviews, 
            p.verified === 1 || p.verified === true || p.is_verified === 1 || p.is_verified === true || false, 
            p.bio, 
            p.imageUrl,
            p.services_offered, 
            p.has_store === 1 || p.has_store === true, 
            p.store_address, 
            p.latitude, 
            p.longitude, 
            p.action_radius || 10,
            p.is_online === 1 || p.is_online === true, 
            p.current_latitude, 
            p.current_longitude
          ]
        );
      }
      console.log(`✅ ${professionals.length} profesionales migrados (convertidos a UUID).`);
    }
  } catch (err) {
    console.warn("⚠️ No se pudo migrar profesionales:", err.message);
  }

  // 4. Reseñas (Reviews)
  try {
    if (await tableExistsInSqlite("reviews")) {
      console.log("⭐ Migrando reseñas...");
      const reviews = await sqliteQuery("SELECT * FROM reviews");
      for (const r of reviews) {
        const reviewerUuid = toUUID(r.client_id || r.reviewer_id);
        const revieweeUuid = toUUID(r.professional_id || r.reviewee_id);
        await cloudPool.query(
          `INSERT INTO reviews (id, reviewer_id, reviewee_id, rating, comment, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE
           SET reviewer_id = EXCLUDED.reviewer_id, reviewee_id = EXCLUDED.reviewee_id, rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = EXCLUDED.created_at`,
          [r.id, reviewerUuid, revieweeUuid, r.rating, r.comment, r.created_at ? new Date(r.created_at) : new Date()]
        );
      }
      console.log(`✅ ${reviews.length} reseñas migradas.`);
    }
  } catch (err) {
    console.warn("⚠️ No se pudo migrar reseñas:", err.message);
  }

  // 5. Conversaciones
  try {
    if (await tableExistsInSqlite("conversations")) {
      console.log("💬 Migrando conversaciones...");
      const convs = await sqliteQuery("SELECT * FROM conversations");
      for (const c of convs) {
        const user1Uuid = toUUID(c.user1_id);
        const user2Uuid = toUUID(c.user2_id);
        await cloudPool.query(
          `INSERT INTO conversations (id, user1_id, user2_id, created_at)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE
           SET user1_id = EXCLUDED.user1_id, user2_id = EXCLUDED.user2_id, created_at = EXCLUDED.created_at`,
          [c.id, user1Uuid, user2Uuid, c.created_at ? new Date(c.created_at) : new Date()]
        );
      }
      console.log(`✅ ${convs.length} conversaciones migradas.`);
    }
  } catch (err) {
    console.warn("⚠️ No se pudo migrar conversaciones:", err.message);
  }

  // 6. Mensajes
  try {
    if (await tableExistsInSqlite("messages")) {
      console.log("✉️ Migrando mensajes...");
      const msgs = await sqliteQuery("SELECT * FROM messages");
      for (const m of msgs) {
        const senderUuid = toUUID(m.sender_id);
        await cloudPool.query(
          `INSERT INTO messages (id, conversation_id, sender_id, content, is_read, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE
           SET conversation_id = EXCLUDED.conversation_id, sender_id = EXCLUDED.sender_id, content = EXCLUDED.content, is_read = EXCLUDED.is_read, created_at = EXCLUDED.created_at`,
          [m.id, m.conversation_id, senderUuid, m.content, m.is_read === 1 || m.is_read === true || false, m.created_at ? new Date(m.created_at) : new Date()]
        );
      }
      console.log(`✅ ${msgs.length} mensajes migrados.`);
    }
  } catch (err) {
    console.warn("⚠️ No se pudo migrar mensajes:", err.message);
  }

  // 7. Trabajos (Jobs)
  try {
    if (await tableExistsInSqlite("jobs")) {
      console.log("💼 Migrando trabajos (jobs)...");
      const jobs = await sqliteQuery("SELECT * FROM jobs");
      for (const j of jobs) {
        const clientUuid = toUUID(j.client_id);
        const professionalUuid = toUUID(j.professional_id);
        await cloudPool.query(
          `INSERT INTO jobs (id, client_id, professional_id, status, description, price, photo_before, photo_after, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE
           SET client_id = EXCLUDED.client_id, professional_id = EXCLUDED.professional_id, status = EXCLUDED.status, description = EXCLUDED.description, price = EXCLUDED.price, photo_before = EXCLUDED.photo_before, photo_after = EXCLUDED.photo_after, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at`,
          [
            j.id, 
            clientUuid, 
            professionalUuid, 
            j.status, 
            j.description, 
            j.price, 
            j.photo_before, 
            j.photo_after,
            j.created_at ? new Date(j.created_at) : new Date(),
            j.updated_at ? new Date(j.updated_at) : new Date()
          ]
        );
      }
      console.log(`✅ ${jobs.length} trabajos migrados.`);
    }
  } catch (err) {
    console.warn("⚠️ No se pudo migrar trabajos (jobs):", err.message);
  }

  // 8. Notificaciones
  try {
    if (await tableExistsInSqlite("notifications")) {
      console.log("🔔 Migrando notificaciones...");
      const notifications = await sqliteQuery("SELECT * FROM notifications");
      for (const n of notifications) {
        const userUuid = toUUID(n.user_id);
        await cloudPool.query(
          `INSERT INTO notifications (id, user_id, title, content, type, is_read, related_id, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE
           SET user_id = EXCLUDED.user_id, title = EXCLUDED.title, content = EXCLUDED.content, type = EXCLUDED.type, is_read = EXCLUDED.is_read, related_id = EXCLUDED.related_id, created_at = EXCLUDED.created_at`,
          [n.id, userUuid, n.title, n.content, n.type, n.is_read === 1 || n.is_read === true || false, n.related_id, n.created_at ? new Date(n.created_at) : new Date()]
        );
      }
      console.log(`✅ ${notifications.length} notificaciones migradas.`);
    }
  } catch (err) {
    console.warn("⚠️ No se pudo migrar notificaciones:", err.message);
  }

  // 9. Alertas Administrativas
  try {
    if (await tableExistsInSqlite("admin_alerts")) {
      console.log("🚨 Migrando alertas administrativas...");
      const alerts = await sqliteQuery("SELECT * FROM admin_alerts");
      for (const a of alerts) {
        const userUuid = toUUID(a.user_id);
        await cloudPool.query(
          `INSERT INTO admin_alerts (id, alert_type, user_id, details, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE
           SET alert_type = EXCLUDED.alert_type, user_id = EXCLUDED.user_id, details = EXCLUDED.details, status = EXCLUDED.status, created_at = EXCLUDED.created_at`,
          [a.id, a.alert_type, userUuid, a.details, a.status || 'open', a.created_at ? new Date(a.created_at) : new Date()]
        );
      }
      console.log(`✅ ${alerts.length} alertas administrativas migradas.`);
    }
  } catch (err) {
    console.warn("⚠️ No se pudo migrar alertas administrativas:", err.message);
  }

  localDb.close();
  await cloudPool.end();
  console.log("🎉 ¡Proceso de migración finalizado con éxito!");
}

runMigration();
