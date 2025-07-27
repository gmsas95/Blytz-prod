import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SellerRegistrationData, SellerProfile } from '../types/models/seller';
import { User } from '../types/models';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isSeller: boolean;
  sellerProfile: SellerProfile | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  registerAsSeller: (sellerData: SellerRegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: { displayName?: string | null; photoURL?: string | null; }) => Promise<void>;
  reauthenticate: (credential: FirebaseAuthTypes.AuthCredential) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  refreshSellerProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const db = getFirestore();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
      } catch (error) {
        console.error('Failed to load user from storage', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser: FirebaseAuthTypes.User | null) => {
      if (firebaseUser) {
        try {
          // Get user profile
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let userData: User;
          if (userDoc.exists()) {
            userData = userDoc.data() as User;
            userData.uid = firebaseUser.uid;
          } else {
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              phoneNumber: firebaseUser.phoneNumber || '',
            };
            await setDoc(userDocRef, userData);
          }
          
          setUser(userData);
          await AsyncStorage.setItem('user', JSON.stringify(userData));

          // Check if user is a seller
          await refreshSellerProfile();
        } catch (error) {
          console.error('Error fetching user data from Firestore:', error);
          const fallbackUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            phoneNumber: firebaseUser.phoneNumber || '',
          };
          setUser(fallbackUser);
          await AsyncStorage.setItem('user', JSON.stringify(fallbackUser));
        }
      } else {
        setUser(null);
        setIsSeller(false);
        setSellerProfile(null);
        await AsyncStorage.removeItem('user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } finally {
      setLoading(false);
    }
  }, []);

  const registerWithEmail = useCallback(
    async (email: string, password: string, displayName?: string) => {
      setLoading(true);
      try {
        const userCredential = await auth().createUserWithEmailAndPassword(
          email,
          password,
        );

        if (userCredential.user) {
          if (displayName) {
            await userCredential.user.updateProfile({ displayName });
          }

          const newUser: User = {
            uid: userCredential.user.uid,
            email: userCredential.user.email || '',
            displayName: displayName || '',
            photoURL: userCredential.user.photoURL || '',
            phoneNumber: userCredential.user.phoneNumber || '',
          };

          const userDocRef = doc(db, 'users', userCredential.user.uid);
          await setDoc(userDocRef, newUser);
        }
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [],
  );

  const registerAsSeller = useCallback(
    async (sellerData: SellerRegistrationData) => {
      setLoading(true);
      try {
        const userCredential = await auth().createUserWithEmailAndPassword(
          sellerData.email,
          sellerData.password,
        );

        if (userCredential.user) {
          // Create user profile
          const newUser: User = {
            uid: userCredential.user.uid,
            email: userCredential.user.email || '',
            displayName: sellerData.businessName,
            photoURL: userCredential.user.photoURL || '',
            phoneNumber: sellerData.phoneNumber || '',
          };

          const userDocRef = doc(db, 'users', userCredential.user.uid);
          await setDoc(userDocRef, newUser);

          // Create seller profile
          const sellerProfile: SellerProfile = {
            userId: userCredential.user.uid,
            businessName: sellerData.businessName,
            businessType: sellerData.businessType,
            taxId: sellerData.taxId,
            bankAccount: sellerData.bankAccount,
            businessAddress: sellerData.businessAddress,
            phoneNumber: sellerData.phoneNumber,
            email: sellerData.email,
            businessDescription: sellerData.businessDescription,
            isVerified: false,
            verificationStatus: 'pending',
            totalSales: 0,
            totalRevenue: 0,
            rating: 0,
            reviewCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const sellerDocRef = doc(db, 'sellers', userCredential.user.uid);
          await setDoc(sellerDocRef, sellerProfile);

          // Set custom claims for seller role (this will be handled by Cloud Functions)
          await userCredential.user.getIdToken(true);
        }
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await auth().signOut();
      setIsSeller(false);
      setSellerProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSellerProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      // Check if user is a seller
      const token = await auth().currentUser?.getIdTokenResult();
      setIsSeller(token?.claims?.seller === true);

      if (token?.claims?.seller === true) {
        // Fetch seller profile
        const sellerDocRef = doc(db, 'sellers', user.uid);
        const sellerDoc = await getDoc(sellerDocRef);
        if (sellerDoc.exists()) {
          setSellerProfile(sellerDoc.data() as SellerProfile);
        }
      }
    } catch (error) {
      console.error('Error refreshing seller profile:', error);
    }
  }, [user]);

  const updateProfile = useCallback(
    async (profile: { displayName?: string | null; photoURL?: string | null; }) => {
      setLoading(true);
      try {
        const currentUser = auth().currentUser;
        if (currentUser) {
          await currentUser.updateProfile(profile);
          const userDocRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userDocRef, profile);
          
          setUser(prevUser => {
            if (!prevUser) return null;
            return {
              ...prevUser,
              displayName: profile.displayName === null ? '' : profile.displayName ?? prevUser.displayName,
              photoURL: profile.photoURL === null ? '' : profile.photoURL ?? prevUser.photoURL,
            };
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reauthenticate = useCallback(
    async (credential: FirebaseAuthTypes.AuthCredential) => {
      setLoading(true);
      try {
        if (auth().currentUser) {
          await auth().currentUser?.reauthenticateWithCredential(credential);
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updatePassword = useCallback(async (password: string) => {
    setLoading(true);
    try {
      if (auth().currentUser) {
        await auth().currentUser?.updatePassword(password);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    setLoading(true);
    try {
      await auth().sendPasswordResetEmail(email);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSeller,
        sellerProfile,
        loginWithEmail,
        registerWithEmail,
        registerAsSeller,
        logout,
        updateProfile,
        reauthenticate,
        updatePassword,
        sendPasswordResetEmail,
        refreshSellerProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
