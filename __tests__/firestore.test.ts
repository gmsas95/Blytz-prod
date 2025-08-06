import { renderHook, act } from '@testing-library/react-native';
import { useLiveStream } from '../src/hooks/useLiveStream';

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
describe('useLiveStream', () => {
  it('should render without crashing', () => {
    const { result } = renderHook(() => useLiveStream('test-room', 'test-participant'));
    
    expect(result.current).toBeDefined();
    expect(result.current.isConnected).toBe(false);
  });
});
