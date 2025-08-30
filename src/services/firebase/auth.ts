import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  onAuthStateChanged,
  UserCredential,
  User
} from 'firebase/auth';

// Authentication operations
export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logout = async (): Promise<void> => {
  return signOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email);
};

export const updateUserProfile = async (displayName?: string, photoURL?: string): Promise<void> => {
  if (!auth.currentUser) throw new Error('No user logged in');
  return updateProfile(auth.currentUser, { displayName, photoURL });
};

export const changePassword = async (newPassword: string): Promise<void> => {
  if (!auth.currentUser) throw new Error('No user logged in');
  return updatePassword(auth.currentUser, newPassword);
};

// Auth state management
export const subscribeToAuthChanges = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const getAuthToken = async (): Promise<string | null> => {
  if (!auth.currentUser) return null;
  return auth.currentUser.getIdToken();
};
