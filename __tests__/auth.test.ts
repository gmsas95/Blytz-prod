import React from 'react';
import { renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

describe('useAuth', () => {
  it('should throw an error if used outside of an AuthProvider', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.error).toEqual(new Error('useAuth must be used within an AuthProvider'));
  });

  it('should return the auth context when used within an AuthProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBe(null);
  });
});
