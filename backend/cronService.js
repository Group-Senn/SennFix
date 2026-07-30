import cron from 'node-cron';
import db from './db.js';

/**
 * Revisa a todos los profesionales y actualiza su estado de "Sello de Oro"
 * basado en su rendimiento (rating de 5 estrellas y 0 disputas).
 */
async function updateGoldSeals() {
  console.log('🏆 Cron Job: Iniciando actualización de Sellos de Oro...');
  const client = await db.connect();
  try {
    // 1. Obtener todos los IDs de los profesionales
    const { rows: professionals } = await client.query('SELECT id FROM professionals');

    for (const prof of professionals) {
      const professionalId = prof.id;

      // 2. Calcular el rating promedio y el número de disputas para cada profesional
      const { rows: [stats] } = await client.query(`
        SELECT
          (SELECT AVG(rating) FROM reviews WHERE reviewee_id = $1) as avg_rating,
          (SELECT COUNT(*) FROM jobs WHERE professional_id = $1 AND status = 'dispute') as dispute_count
      `, [professionalId]);

      const avgRating = parseFloat(stats.avg_rating);
      const disputeCount = parseInt(stats.dispute_count, 10);

      // 3. Lógica para otorgar o quitar el sello
      if (avgRating === 5 && disputeCount === 0) {
        await client.query('UPDATE professionals SET has_gold_seal = true WHERE id = $1', [professionalId]);
      } else {
        await client.query('UPDATE professionals SET has_gold_seal = false WHERE id = $1', [professionalId]);
      }
    }
    console.log('🏆 Cron Job: Actualización de Sellos de Oro completada.');
  } catch (error) {
    console.error('❌ Error en el cron job de Sellos de Oro:', error);
  } finally {
    client.release();
  }
}

export function startGoldSealCron() {
  // Tarea programada para ejecutarse todos los domingos a las 2:00 AM (zona horaria de Bolivia)
  cron.schedule('0 2 * * 0', updateGoldSeals, { timezone: "America/La_Paz" });
  console.log('📅 Cron Job para Sellos de Oro programado para cada domingo a las 2:00 AM.');
}