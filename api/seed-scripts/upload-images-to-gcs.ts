import * as fs from 'fs';
import * as path from 'path';
import { uploadBuffer, generatePath } from '../src/lib/gcsService';

/**
 * Upload images from resources directory to GCS
 * Returns a map of local image paths to GCS public URLs
 */
export async function uploadImagesToGcs(
  imagePaths: string[],
  resourcesDir: string = path.join(__dirname, '..', 'resources')
): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();
  
  for (const imagePath of imagePaths) {
    if (!imagePath) continue;
    
    // Extract just the filename from the path (e.g., "resources/cellImage_0_0.jpg" -> "cellImage_0_0.jpg")
    const filename = path.basename(imagePath);
    
    // Resolve the full local path (imagePath might be "resources/cellImage_0_0.jpg" or just "cellImage_0_0.jpg")
    let localPath: string;
    if (path.isAbsolute(imagePath)) {
      localPath = imagePath;
    } else if (imagePath.startsWith('resources/')) {
      // Path is like "resources/cellImage_0_0.jpg"
      localPath = path.join(__dirname, '..', imagePath);
    } else {
      // Path is just the filename
      localPath = path.join(resourcesDir, filename);
    }
    
    // Check if file exists
    if (!fs.existsSync(localPath)) {
      console.warn(`⚠️  Image not found: ${localPath} (from path: ${imagePath})`);
      continue;
    }
    
    try {
      // Read the image file
      const imageBuffer = fs.readFileSync(localPath);
      
      // Generate GCS path (use suppliers/images/ prefix)
      const gcsPath = generatePath(['suppliers', 'images'], filename);
      
      // Upload to GCS
      const publicUrl = await uploadBuffer(imageBuffer, gcsPath, {
        metadata: {
          contentType: getContentType(filename),
        },
      });
      
      // Use the original imagePath as the key so we can look it up later
      imageMap.set(imagePath, publicUrl);
      console.log(`✅ Uploaded: ${filename} → ${publicUrl}`);
    } catch (error) {
      console.error(`❌ Failed to upload ${localPath}:`, error);
      // Continue with other images
    }
  }
  
  return imageMap;
}

/**
 * Get content type based on file extension
 */
function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  
  return contentTypes[ext] || 'image/jpeg';
}

