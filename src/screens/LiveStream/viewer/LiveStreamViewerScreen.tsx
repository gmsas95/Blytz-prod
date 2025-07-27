import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, ViewToken } from 'react-native';
import { useLiveStreams } from '../../../hooks/useLiveStream';
import { theme } from '../../../config/theme';
import ScreenWrapper from '../../../components/shared/ScreenWrapper';
import LiveStreamItem from '../../../components/LiveStream/viewer/LiveStreamItem';

const LiveStreamViewerScreen = () => {
  const { livestreams, loading, loadingMore, error, loadMore } = useLiveStreams();
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
    if (viewableItems.length > 0) {
      const firstVisibleItem = viewableItems[0];
      if (firstVisibleItem.item && firstVisibleItem.isViewable) {
        setActiveStreamId(firstVisibleItem.item.id);
      }
    }
  }, []);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.infoText}>Loading Streams...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error: {error.message}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!loading && livestreams.length === 0) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.infoText}>No live streams available at the moment.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <FlatList
      data={livestreams}
      renderItem={({ item }) => <LiveStreamItem item={item} isActive={item.id === activeStreamId} />}
      keyExtractor={(item) => item.id}
      pagingEnabled
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50,
      }}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: '#000' }}
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  infoText: {
    marginTop: theme.spacing.md,
    color: theme.colors.secondary,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
  },
  loadingMoreContainer: {
    paddingVertical: 20,
  }
});

export default LiveStreamViewerScreen;
