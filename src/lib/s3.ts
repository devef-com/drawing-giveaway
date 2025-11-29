import { S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'

// Cloudflare R2 configuration
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'mega-clone-files'

export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string,
) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  })

  await s3Client.send(command)

  // Return the public URL using your custom domain
  const publicDomain = process.env.R2_PUBLIC_DOMAIN
  return `https://${publicDomain}/${key}`
}

export async function getSignedUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })

  return getSignedUrl(s3Client, command, { expiresIn: 3600 }) // 1 hour
}

export async function getSignedDownloadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  return getSignedUrl(s3Client, command, { expiresIn: 3600 }) // 1 hour
}

export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await s3Client.send(command)
}
