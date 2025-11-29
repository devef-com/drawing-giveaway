import imageCompression from 'browser-image-compression'

// Allowed image MIME types (browser-supported formats)
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number]

// Default compression options
const DEFAULT_COMPRESSION_OPTIONS: imageCompression.Options = {
  maxSizeMB: 1, // Maximum file size in MB
  maxWidthOrHeight: 1920, // Maximum width/height dimension
  useWebWorker: true, // Use web worker for better performance
  fileType: 'image/webp', // Convert to WebP for better compression
}

/**
 * Validates if a file is an allowed image type
 */
export function isAllowedImageType(
  mimeType: string,
): mimeType is AllowedImageType {
  return ALLOWED_IMAGE_TYPES.includes(mimeType as AllowedImageType)
}

/**
 * Gets the file extension from a MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  return mimeToExt[mimeType] || 'jpg'
}

/**
 * Compresses an image file on the client side
 */
export async function compressImage(
  file: File,
  options?: Partial<imageCompression.Options>,
): Promise<File> {
  // Validate file type
  if (!isAllowedImageType(file.type)) {
    throw new Error(
      `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    )
  }

  const compressionOptions = {
    ...DEFAULT_COMPRESSION_OPTIONS,
    ...options,
  }

  try {
    const compressedFile = await imageCompression(file, compressionOptions)
    return compressedFile
  } catch (error) {
    console.error('Image compression failed:', error)
    throw new Error('Failed to compress image')
  }
}

/**
 * Compresses multiple images
 */
export async function compressImages(
  files: Array<File>,
  options?: Partial<imageCompression.Options>,
): Promise<Array<File>> {
  const compressionPromises = files.map((file) => compressImage(file, options))
  return Promise.all(compressionPromises)
}

/**
 * Creates a preview URL for an image file
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Revokes a preview URL to free memory
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url)
}
