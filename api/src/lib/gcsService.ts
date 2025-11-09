import { Storage, UploadOptions } from '@google-cloud/storage';
import path from 'path';
import { config } from '../config';

const storage = new Storage(
  config.gcs.credentialsPath
    ? { keyFilename: config.gcs.credentialsPath, projectId: config.gcs.projectId }
    : { projectId: config.gcs.projectId }
);

const bucket = storage.bucket(config.gcs.bucketName);

export async function uploadBuffer(
  buffer: Buffer,
  destination: string,
  options: UploadOptions = {}
): Promise<string> {
  const file = bucket.file(destination);
  await file.save(buffer, options);

  // Object ACLs are blocked when Uniform Bucket-Level Access (UBLA) is enabled.
  // Try to make public, but ignore UBLA error and rely on bucket-level IAM instead.
  try {
    await file.makePublic();
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (msg.toLowerCase().includes('uniform bucket-level access')) {
      // UBLA is on; skip object ACL. Ensure bucket-level IAM allows public read if needed.
    } else {
      throw err;
    }
  }

  return publicUrl(destination);
}

export function publicUrl(filePath: string): string {
  return `https://storage.googleapis.com/${config.gcs.bucketName}/${filePath}`;
}

export function generatePath(parts: string[], filename: string): string {
  return path.posix.join(...parts, filename);
}

export async function deleteFile(filePath: string): Promise<void> {
  const file = bucket.file(filePath);
  await file.delete({ ignoreNotFound: true });
}

export function getPathFromPublicUrl(url: string): string | null {
  const prefix = `https://storage.googleapis.com/${config.gcs.bucketName}/`;
  if (url.startsWith(prefix)) {
    return url.slice(prefix.length);
  }
  return null;
}

