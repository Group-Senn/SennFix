import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { uploadToS3 } from './s3Service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// La carpeta privada estará un nivel arriba de 'services'
const privateUploadsDir = path.join(__dirname, 'private_uploads');

const watermarkText = 'SOLO PARA USO EN SENN FIX';

async function watermarkAndSave(fileBuffer, filenamePrefix) {
  const filename = `${filenamePrefix}-${Date.now()}.webp`;
  const outputPath = path.join(privateUploadsDir, filename);

  const image = sharp(fileBuffer);
  const metadata = await image.metadata();

  let targetWidth = metadata.width || 800;
  let targetHeight = metadata.height || 600;

  if (targetWidth > 800) {
    targetHeight = Math.round(targetHeight * (800 / targetWidth));
    targetWidth = 800;
  }

  // SVG para la marca de agua: texto rotado y semitransparente adaptado a la imagen
  const svgWatermark = `
    <svg width="${targetWidth}" height="${targetHeight}">
      <style>
      .title { fill: rgba(255, 255, 255, 0.4); font-size: ${Math.max(16, Math.round(targetWidth / 25))}px; font-family: Arial, sans-serif; font-weight: bold; text-transform: uppercase; }
      </style>
      <text x="50%" y="50%" text-anchor="middle" transform="rotate(-30 ${targetWidth / 2},${targetHeight / 2})" class="title">${watermarkText}</text>
    </svg>
  `;
  const svgBuffer = Buffer.from(svgWatermark);

  const outputBuffer = await image
    .resize({ width: 800, withoutEnlargement: true }) // Redimensiona sin agrandar
    .webp({ quality: 80 }) // Convierte a WebP para optimizar
    .composite([{ input: svgBuffer, gravity: 'center' }]) // Aplica la marca de agua
    .toBuffer();

  // 1. Subir a S3
  await uploadToS3(outputBuffer, filename, 'image/webp');

  // 2. Escribir localmente para compatibilidad local
  try {
    if (!fs.existsSync(privateUploadsDir)) {
      fs.mkdirSync(privateUploadsDir, { recursive: true });
    }
    await fs.promises.writeFile(outputPath, outputBuffer);
  } catch (err) {
    console.warn('Advertencia: No se pudo guardar imagen localmente con marca de agua:', err.message);
  }

  return `private_uploads/${filename}`;
}

export { watermarkAndSave };