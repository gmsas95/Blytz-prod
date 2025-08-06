import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, ViewToken } from 'react-native';
import { useLiveStream } from '../../../hooks/useLiveStream';
import { theme } from '../../../config/theme';
import ScreenWrapper from '../../../components/shared/ScreenWrapper';
import LiveStreamItem from '../../../components/LiveStream/viewer/LiveStreamItem';
import { Participant } from 'livekit-client';

const LiveStreamViewerScreen = () => {
  const { room, isConnected, participants } = useLiveStream('test-room', 'test-participant');
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
    if (viewableItems.length > 0) {
      const firstVisibleItem = viewableItems[0];
      if (firstVisibleItem.item && firstVisibleItem.isViewable) {
        setActiveStreamId(firstVisibleItem.item.sid);
      }
    }
  }, []);

  const renderFooter = () => {
    return null;
  };

  if (!isConnected) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.infoText}>Connecting to Stream...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (participants.length === 0) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.infoText}>No one is in the stream.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <FlatList
      data={participants}
      renderItem={({ item }) => <LiveStreamItem item={item} isActive={item.sid === activeStreamId} />}
      keyExtractor={(item) => item.sid}
      pagingEnabled
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50,
      }}
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