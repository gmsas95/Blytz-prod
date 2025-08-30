import { firestore } from './firebase';
import {
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import {
  userConverter,
  liveStreamConverter,
  bidConverter,
  productConverter,
  orderConverter,
  notificationConverter,
} from '../../types/models';

// Base collection references
export const usersCollection = collection(firestore, 'users');
export const auctionsCollection = collection(firestore, 'auctions');
export const productsCollection = collection(firestore, 'products');
export const ordersCollection = collection(firestore, 'orders');
export const liveStreamsCollection = collection(firestore, 'liveStreams');

// User operations
export const getUserDoc = (userId: string) => doc(firestore, 'users', userId);
export const getUser = async (userId: string) => {
  const userDoc = getUserDoc(userId);
  const docSnap = await getDoc(userDoc);
  return docSnap.exists() ? docSnap.data() : null;
};

export const setUser = async (userId: string, userData: any) => {
  const userDoc = getUserDoc(userId);
  return setDoc(userDoc, userData, { merge: true });
};

// Auction operations
export const getAuctionDoc = (auctionId: string) => doc(firestore, 'auctions', auctionId);
export const getAuction = async (auctionId: string) => {
  const auctionDoc = getAuctionDoc(auctionId);
  const docSnap = await getDoc(auctionDoc);
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateAuction = async (auctionId: string, updates: any) => {
  const auctionDoc = getAuctionDoc(auctionId);
  return updateDoc(auctionDoc, updates);
};

// Product operations
export const getProductDoc = (productId: string) => doc(firestore, 'products', productId);
export const getProduct = async (productId: string) => {
  const productDoc = getProductDoc(productId);
  const docSnap = await getDoc(productDoc);
  return docSnap.exists() ? docSnap.data() : null;
};

// Live stream operations
export const getLiveStreamDoc = (streamId: string) => doc(firestore, 'liveStreams', streamId);
export const getLiveStream = async (streamId: string) => {
  const streamDoc = getLiveStreamDoc(streamId);
  const docSnap = await getDoc(streamDoc);
  return docSnap.exists() ? docSnap.data() : null;
};

// Query operations
export const getLiveStreams = async (status?: string) => {
  let q = query(liveStreamsCollection, orderBy('createdAt', 'desc'));
  if (status) {
    q = query(q, where('status', '==', status));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserAuctions = async (userId: string) => {
  const q = query(auctionsCollection, where('sellerId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Real-time listeners
export const listenToLiveStream = (streamId: string, callback: (data: any) => void) => {
  const streamDoc = getLiveStreamDoc(streamId);
  return onSnapshot(streamDoc, callback);
};

export const listenToAuction = (auctionId: string, callback: (data: any) => void) => {
  const auctionDoc = getAuctionDoc(auctionId);
  return onSnapshot(auctionDoc, callback);
};

// Batch operations
export const batchUpdate = async (updates: Array<{ref: any, data: any}>) => {
  const batch = writeBatch(firestore);
  updates.forEach(({ref, data}) => {
    batch.update(ref, data);
  });
  return batch.commit();
};
