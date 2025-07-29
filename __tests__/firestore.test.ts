import { renderHook, act } from '@testing-library/react-native';
import { useLiveStreams } from '../src/hooks/useLiveStream';

// Mock Firebase services
jest.mock('@react-native-firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
      })),
    })),
  })),
}));

// Simple test to verify the hook renders
describe('useLiveStreams', () => {
  it('should render without crashing', () => {
    const { result } = renderHook(() => useLiveStreams());
    
    expect(result.current).toBeDefined();
    expect(Array.isArray(result.current.livestreams)).toBe(true);
  });
});
