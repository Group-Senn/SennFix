import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.AWS_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.BUCKET_NAME || 'senn-fix-private-vault';

/**
 * Sube un archivo a S3 / Cloudflare R2
 * @param {Buffer} fileBuffer Buffer del archivo
 * @param {string} filename Nombre único del archivo
 * @param {string} mimeType Tipo MIME del archivo
 */
export async function uploadToS3(fileBuffer, filename, mimeType) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: fileBuffer,
    ContentType: mimeType,
  });
  return s3Client.send(command);
}

/**
 * Obtiene un archivo desde S3 / Cloudflare R2
 * @param {string} filename Nombre del archivo
 */
export async function getFromS3(filename) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filename,
  });
  return s3Client.send(command);
}

/**
 * Elimina un archivo de S3 / Cloudflare R2
 * @param {string} filename Nombre del archivo
 */
export async function deleteFromS3(filename) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filename,
  });
  return s3Client.send(command);
}
