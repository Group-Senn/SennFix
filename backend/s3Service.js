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

export const BUCKET_NAME = process.env.BUCKET_NAME || 'senn-fix-private-vault';
export const PRIVATE_BUCKET_NAME = process.env.PRIVATE_BUCKET_NAME || BUCKET_NAME;

/**
 * Sube un archivo a S3 / Cloudflare R2
 * @param {Buffer} fileBuffer Buffer del archivo
 * @param {string} filename Nombre único del archivo
 * @param {string} mimeType Tipo MIME del archivo
 * @param {string} bucketName Nombre del bucket (por defecto, el público BUCKET_NAME)
 */
export async function uploadToS3(fileBuffer, filename, mimeType, bucketName = BUCKET_NAME) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: filename,
    Body: fileBuffer,
    ContentType: mimeType,
  });
  return s3Client.send(command);
}

/**
 * Obtiene un archivo desde S3 / Cloudflare R2
 * @param {string} filename Nombre del archivo
 * @param {string} bucketName Nombre del bucket
 */
export async function getFromS3(filename, bucketName = BUCKET_NAME) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: filename,
  });
  return s3Client.send(command);
}

/**
 * Elimina un archivo de S3 / Cloudflare R2
 * @param {string} filename Nombre del archivo
 * @param {string} bucketName Nombre del bucket
 */
export async function deleteFromS3(filename, bucketName = BUCKET_NAME) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: filename,
  });
  return s3Client.send(command);
}
