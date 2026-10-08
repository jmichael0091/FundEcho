/**
 * FUNDORA - APPLICATION DOCUMENT STORAGE SERVICE (STEP 26)
 * Handles secure file uploads, validation, metadata extraction,
 * and resilient fallbacks for application workspace attachments.
 */

import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, isFirebaseConfigured, firebaseClientConfig } from './firebaseConfig';

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
];

export const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp', '.txt'];

export interface UploadDocumentResult {
  storagePath: string;
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isFallback: boolean;
}

export interface DocumentValidationError {
  code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'NO_FILE';
  message: string;
}

/**
 * Validates document type and size before initiating upload.
 */
export function validateDocumentFile(file: File): DocumentValidationError | null {
  if (!file) {
    return { code: 'NO_FILE', message: 'No file selected for upload.' };
  }

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      code: 'FILE_TOO_LARGE',
      message: `File is too large (${sizeMb} MB). Maximum allowed size is 10 MB.`,
    };
  }

  const name = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const hasValidMime = ALLOWED_DOCUMENT_TYPES.includes(file.type);

  if (!hasValidExtension && !hasValidMime) {
    return {
      code: 'INVALID_TYPE',
      message: 'Invalid file format. Supported formats: PDF, Word (DOC/DOCX), JPG, PNG, WebP.',
    };
  }

  return null;
}

/**
 * Uploads an application document to Firebase Storage with an automated offline/local fallback.
 * Destination path: applications/{applicationId}/documents/{timestamp}_{sanitizedName}
 */
export async function uploadApplicationDocument(
  file: File,
  userId: string,
  applicationId: string,
  onProgress?: (percent: number) => void
): Promise<UploadDocumentResult> {
  const validationError = validateDocumentFile(file);
  if (validationError) {
    throw new Error(validationError.message);
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `applications/${applicationId}/documents/${timestamp}_${sanitizedName}`;

  // Check if live Firebase Storage bucket is available
  if (isFirebaseConfigured() && firebaseClientConfig.storageBucket) {
    try {
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type || 'application/octet-stream',
        customMetadata: {
          uploadedBy: userId,
          applicationId,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });

      return await new Promise<UploadDocumentResult>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress(Math.round(progress));
            }
          },
          (error) => {
            console.warn('[DocumentStorageService] Firebase Storage upload error, using local fallback:', error);
            // Gracefully resolve with client data URL fallback on storage quota/network issue
            readFileAsDataUrl(file)
              .then((dataUrl) => {
                if (onProgress) onProgress(100);
                resolve({
                  storagePath,
                  downloadUrl: dataUrl,
                  fileName: file.name,
                  fileSize: file.size,
                  mimeType: file.type || 'application/pdf',
                  isFallback: true,
                });
              })
              .catch(reject);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              if (onProgress) onProgress(100);
              resolve({
                storagePath,
                downloadUrl,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type || 'application/pdf',
                isFallback: false,
              });
            } catch (urlErr) {
              console.warn('[DocumentStorageService] getDownloadURL error, falling back to data URL:', urlErr);
              const dataUrl = await readFileAsDataUrl(file);
              resolve({
                storagePath,
                downloadUrl: dataUrl,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type || 'application/pdf',
                isFallback: true,
              });
            }
          }
        );
      });
    } catch (err) {
      console.warn('[DocumentStorageService] Storage init error, using local fallback:', err);
    }
  }

  // Local Data URL Fallback for preview/offline environments
  if (onProgress) {
    onProgress(30);
    setTimeout(() => onProgress(75), 150);
    setTimeout(() => onProgress(100), 300);
  }

  const dataUrl = await readFileAsDataUrl(file);
  return {
    storagePath,
    downloadUrl: dataUrl,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || 'application/pdf',
    isFallback: true,
  };
}

/**
 * Deletes an uploaded document from Firebase Storage.
 */
export async function deleteApplicationDocumentFromStorage(storagePath: string): Promise<void> {
  if (!storagePath) return;

  if (isFirebaseConfigured() && firebaseClientConfig.storageBucket) {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
      console.log(`[DocumentStorageService] Successfully deleted ${storagePath}`);
    } catch (error) {
      console.warn(`[DocumentStorageService] Error deleting storage object at ${storagePath}:`, error);
      // Non-blocking: record in Firestore will still be deleted
    }
  }
}

/**
 * Helper to convert a File into a Data URL for instant local previews and fallback storage.
 */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
