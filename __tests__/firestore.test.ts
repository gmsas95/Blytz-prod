import { renderHook } from '@testing-library/react';
import { useLiveStreams } from '../src/hooks/useLiveStream';

describe('useLiveStreams', () => {
  it('should return the live streams', async () => {
    const { result, rerender } = renderHook(() => useLiveStreams());
    rerender();
    expect(result.current.livestreams).toEqual([]);
  });
});
