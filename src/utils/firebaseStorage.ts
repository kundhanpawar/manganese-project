import { ref, uploadString, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage } from '../lib/firebase';

/**
 * Uploads an image to Firebase Storage.
 * Translates the provided Kotlin uploadMoviePoster logic into TypeScript.
 */
export async function uploadImageToStorage(dataUrl: string, imageName: string): Promise<string | null> {
  try {
    // Create a reference to the destination path (e.g., "uploads/imageName.jpg")
    const storageRef = ref(storage, `uploads/${imageName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`);

    // If it's a data URL, we can upload it directly as a string or convert to blob
    if (dataUrl.startsWith('data:')) {
      const uploadTask = await uploadString(storageRef, dataUrl, 'data_url');
      console.log(`Successfully uploaded to ${storageRef.fullPath}`);
      return await getDownloadURL(storageRef);
    } else {
      // Fallback if we just get a blob or URL (not expected in this flow but just in case)
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const uploadTask = await uploadBytes(storageRef, blob);
      console.log(`Successfully uploaded ${uploadTask.metadata.size} bytes to ${storageRef.fullPath}`);
      return await getDownloadURL(storageRef);
    }
  } catch (error: any) {
    console.error("Upload failed:", error.message);
    return null;
  }
}
