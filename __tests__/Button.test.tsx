import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '@/components/shared/Button';

describe('Button', () => {
  it('renders the button with the correct title', () => {
    const { getByText } = render(<Button title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls the onPress handler when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPressMock} />);
    
    fireEvent.press(getByText('Test Button'));
    
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
