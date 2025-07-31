import firestore from '@react-native-firebase/firestore';
import {StreamDisplay, FeaturedStream} from '../../types/models/streamDisplay';

export class StreamsService {
  private liveStreamsCollection = firestore().collection('liveStreams');
  private featuredStreamsCollection = firestore().collection('featuredStreams');
  private usersCollection = firestore().collection('users');

  // Get live streams with real-time updates
  async getLiveStreams(): Promise<StreamDisplay[]> {
    try {
      const snapshot = await this.liveStreamsCollection
        .where('status', '==', 'live')
        .orderBy('viewers', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StreamDisplay));
    } catch (error) {
      console.error('Error fetching live streams:', error);
      throw error;
    }
  }

  // Get featured streams with real-time updates
  async getFeaturedStreams(): Promise<FeaturedStream[]> {
    try {
      const snapshot = await this.featuredStreamsCollection
        .orderBy('priority', 'asc')
        .limit(3)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FeaturedStream));
    } catch (error) {
      console.error('Error fetching featured streams:', error);
      throw error;
    }
  }

  // Get streams by category
  async getStreamsByCategory(category: string): Promise<StreamDisplay[]> {
    try {
      const query = category === 'all' 
        ? this.liveStreamsCollection.where('status', '==', 'live')
        : this.liveStreamsCollection
            .where('status', '==', 'live')
            .where('category', '==', category);

      const snapshot = await query.orderBy('viewers', 'desc').get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StreamDisplay));
    } catch (error) {
      console.error('Error fetching streams by category:', error);
      throw error;
    }
  }

  // Subscribe to live streams (real-time)
  subscribeToLiveStreams(callback: (streams: StreamDisplay[]) => void) {
    return this.liveStreamsCollection
      .where('status', '==', 'live')
      .orderBy('viewers', 'desc')
      .onSnapshot(snapshot => {
        const streams = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as StreamDisplay));
        callback(streams);
      }, error => {
        console.error('Error in live streams subscription:', error);
      });
  }

  // Subscribe to featured streams (real-time)
  subscribeToFeaturedStreams(callback: (streams: FeaturedStream[]) => void) {
    return this.featuredStreamsCollection
      .orderBy('priority', 'asc')
      .limit(3)
      .onSnapshot(snapshot => {
        const streams = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FeaturedStream));
        callback(streams);
      }, error => {
        console.error('Error in featured streams subscription:', error);
      });
  }

  // Increment viewer count
  async incrementViewerCount(streamId: string) {
    try {
      const streamRef = this.liveStreamsCollection.doc(streamId);
      await streamRef.update({
        viewers: firestore.FieldValue.increment(1)
      });
    } catch (error) {
      console.error('Error incrementing viewer count:', error);
    }
  }

  // Decrement viewer count
  async decrementViewerCount(streamId: string) {
    try {
      const streamRef = this.liveStreamsCollection.doc(streamId);
      await streamRef.update({
        viewers: firestore.FieldValue.increment(-1)
      });
    } catch (error) {
      console.error('Error decrementing viewer count:', error);
    }
  }
}

export const streamsService = new StreamsService();