import React, { memo, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../../../config/theme';
import debounce from 'lodash/debounce';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = memo(({ onSearch, placeholder = 'Search notifications...' }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      onSearch(text);
    }, 300),
    [onSearch]
  );

  const handleTextChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    Keyboard.dismiss();
  };

  const handleFocus = () => {
    setIsFocused(true);
    scale.value = withSpring(1.02, { damping: 15, stiffness: 200 });
    opacity.value = withTiming(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    scale.value = withSpring(1);
    opacity.value = withTiming(0);
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <View style={[styles.searchContainer, isFocused && styles.searchContainerFocused]}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={isFocused ? theme.colors.primary : theme.colors.onSurface}
          style={styles.searchIcon}
        />
        
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.onSurface}
          value={query}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
        />
        
        {query.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Animated.View style={animatedIconStyle}>
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color={theme.colors.onSurface}
              />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
});

SearchBar.displayName = 'SearchBar';

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchContainerFocused: {
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  searchIcon: {
    marginRight: theme.spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.onSurface,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: theme.spacing.xs,
  },
});

export default SearchBar;