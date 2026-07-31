/**
 * storage.ts — Cloudinary-only image management (no Firebase).
 * Firebase has been removed. All images are uploaded to Cloudinary.
 * The `deleteImageByUrl` is a no-op stub since Cloudinary unsigned
 * browser-side delete is not supported; free storage is generous.
 */

export async function deleteImageByUrl(url: string): Promise<void> {
  // Cloudinary unsigned delete not supported from browser.
  // Image is simply de-referenced; CDN asset remains (free quota is large).
  console.info('Image de-referenced (Cloudinary asset retained):', url);
}

export async function deleteImageByPath(_path: string): Promise<void> {
  console.info('deleteImageByPath: no-op (Cloudinary, path-based delete not available)');
}
