import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../config/firebase.config';
import { Platform } from 'react-native';

interface CreateStreamData {
  title: string;
  description?: string;
  category: string;
  scheduledAt?: string;
  products?: string[];
  thumbnailUrl?: string;
}

interface CreateStreamResult {
  success: boolean;
  streamId: string;
  stream: any;
}

export const useCreateStream = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const functions = getFunctions(app);

  const createStream = async (data: CreateStreamData): Promise<CreateStreamResult> => {
    setLoading(true);
    setError(null);

    try {
      const createStreamFunction = httpsCallable(functions, 'createStream');
      const result = await createStreamFunction(data);
      
      return result.data as CreateStreamResult;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create stream';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const requestCameraPermission = async (): Promise<string> => {
    try {
      if (Platform.OS === 'web') return 'granted';
      return 'granted'; // Placeholder - implement with expo-camera
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return 'denied';
    }
  };

  const requestMicrophonePermission = async (): Promise<string> => {
    try {
      if (Platform.OS === 'web') return 'granted';
      return 'granted'; // Placeholder - implement with expo-av
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return 'denied';
    }
  };

  return {
    createStream,
    requestCameraPermission,
    requestMicrophonePermission,
    loading,
    error,
  };
};