import { useState, useEffect, useCallback } from 'react';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { LiveStream, liveStreamConverter } from '../types/models';
import { streamingService } from '../services/streaming';

const PAGE_SIZE = 5; // Number of streams to fetch per page

export const useLiveStreams = () => {
  const [livestreams, setLivestreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastDoc, setLastDoc] = useState<FirebaseFirestoreTypes.DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchStreams = useCallback(async (startAfterDoc: FirebaseFirestoreTypes.DocumentSnapshot | null = null) => {
    if (startAfterDoc === null) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const livestreamsCollection = firestore().collection('livestreams');
      let q = livestreamsCollection
        .orderBy('startTime', 'desc')
        .limit(PAGE_SIZE);

      if (startAfterDoc) {
        q = q.startAfter(startAfterDoc);
      }

      const querySnapshot = await q.get();
      const newStreams: LiveStream[] = [];

      for (const doc of querySnapshot.docs) {
        const streamData = liveStreamConverter.fromFirestore(doc);
        try {
          const playbackUrl = await streamingService.getPlaybackUrl(streamData);
          newStreams.push({ ...streamData, id: doc.id, playbackUrl: playbackUrl ?? undefined });
        } catch (e) {
          console.error(`Failed to get playback URL for stream ${doc.id}`, e);
        }
      }

      if (querySnapshot.docs.length < PAGE_SIZE) {
        setHasMore(false);
      }

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastDoc(lastVisible);

      setLivestreams(prevStreams => startAfterDoc ? [...prevStreams, ...newStreams] : newStreams);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchStreams();
  }, [fetchStreams]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchStreams(lastDoc);
    }
  }, [loadingMore, hasMore, lastDoc, fetchStreams]);

  return { livestreams, loading, loadingMore, error, loadMore, hasMore };
};

