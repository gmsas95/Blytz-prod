import storage from '@react-native-firebase/storage';

export interface UploadResult {
  url: string;
  path: string;
  name: string;
}

export const uploadToStorage = async (
  uri: string,
  path: string,
  fileName: string
): Promise<string> => {
  try {
    const reference = storage().ref(`${path}/${fileName}`);
    
    // Upload the file
    await reference.putFile(uri);
    
    // Get the download URL
    const url = await reference.getDownloadURL();
    
    return url;
  } catch (error) {
    console.error('Error uploading to Firebase Storage:', error);
    throw error;
  }
};

export const deleteFromStorage = async (path: string): Promise<void> => {
  try {
    const reference = storage().ref(path);
    await reference.delete();
  } catch (error) {
    console.error('Error deleting from Firebase Storage:', error);
    throw error;
  }
};

export const getFileExtension = (uri: string): string => {
  const extension = uri.split('.').pop();
  return extension ? `.${extension}` : '';
};

export const generateFileName = (prefix: string, extension: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `${prefix}_${timestamp}_${randomString}${extension}`;
};

export const uploadMultipleFiles = async (
  files: Array<{uri: string, path: string, fileName: string}>
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadToStorage(file.uri, file.path, file.fileName));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
};

export const firebaseStorage = storage();