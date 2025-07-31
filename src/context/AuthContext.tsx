import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import {
  FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import { doc, getDoc, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SellerRegistrationData, SellerProfile } from '../types/models/seller';
import { User, ShippingAddress } from '../types/models';
import { firestore, app } from '../config/firebase.config';
import { firebaseAuth, authRN } from '../services/firebase/auth';

interface SellerApplication {
  businessName: string;
  businessType: 'individual' | 'company' | 'partnership';
  taxId: string;
  bankAccount: {
    accountNumber: string;
    bankName: string;
    accountHolder: string;
  };
  businessAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phoneNumber: string;
  businessDescription: string;
}

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
  applyForSeller: (sellerApplication: {
    businessName: string;
    businessType: 'individual' | 'company';
    email: string;
    phoneNumber: string;
    bankName: string;
    accountNumber: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateProfile: (profile: { displayName?: string | null; photoURL?: string | null; }) => Promise<void>;
  reauthenticate: (credential: FirebaseAuthTypes.AuthCredential) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  refreshSellerProfile: () => Promise<void>;
  addShippingAddress: (address: ShippingAddress) => Promise<void>;
  updateShippingAddress: (address: ShippingAddress) => Promise<void>;
  deleteShippingAddress: (addressId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);

  const refreshSellerProfile = useCallback(async (userId?: string) => {
    if (!userId) return;
    
    try {
      // Check if user is a seller
      const token = await authRN().currentUser?.getIdTokenResult();
      setIsSeller(token?.claims?.seller === true);

      if (token?.claims?.seller === true) {
        // Fetch seller profile
        const sellerDocRef = doc(firestore, 'sellers', userId);
        const sellerDoc = await getDoc(sellerDocRef);
        if (sellerDoc.exists()) {
          setSellerProfile(sellerDoc.data() as SellerProfile);
        }
      }
    } catch (error) {
      console.error('Error refreshing seller profile:', error);
    }
  }, []);

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

    const unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser: FirebaseAuthTypes.User | null) => {
      if (firebaseUser) {
        try {
          // Get user profile
          const userDocRef = doc(firestore, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let userData: User;
          if (userDoc.exists()) {
            userData = userDoc.data() as User;
            userData.uid = firebaseUser.uid;
          } else {
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || null,
              photoURL: firebaseUser.photoURL || null,
              phoneNumber: firebaseUser.phoneNumber || null,
            };
            await setDoc(userDocRef, userData);
          }
          
          setUser(userData);
          await AsyncStorage.setItem('user', JSON.stringify(userData));

          // Check if user is a seller
          await refreshSellerProfile(userData.uid);
        } catch (error) {
          console.error('Error fetching user data from Firestore:', error);
          const fallbackUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || null,
            photoURL: firebaseUser.photoURL || null,
            phoneNumber: firebaseUser.phoneNumber || null,
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
      console.log('Attempting login with email:', email);
      await firebaseAuth.signInWithEmailAndPassword(email, password);
      console.log('Login successful');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerWithEmail = useCallback(
    async (email: string, password: string, displayName?: string) => {
      setLoading(true);
      try {
        const userCredential: FirebaseAuthTypes.UserCredential = await firebaseAuth.createUserWithEmailAndPassword(
            email,
            password,
          );

        if (userCredential.user) {
          if (displayName) {
            await firebaseAuth.updateProfile(userCredential.user, { displayName });
          }

          const newUser: User = {
            uid: userCredential.user.uid,
            email: userCredential.user.email || '',
            displayName: displayName || null,
            photoURL: userCredential.user.photoURL || null,
            phoneNumber: userCredential.user.phoneNumber || null,
          };

          const userDocRef = doc(firestore, 'users', userCredential.user.uid);
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
        const userCredential: FirebaseAuthTypes.UserCredential = await firebaseAuth.createUserWithEmailAndPassword(
          sellerData.email,
          sellerData.password,
        );

        if (userCredential.user) {
          // Create user profile
          const newUser: User = {
            uid: userCredential.user.uid,
            email: userCredential.user.email || '',
            displayName: sellerData.businessName || null,
            photoURL: userCredential.user.photoURL || null,
            phoneNumber: sellerData.phoneNumber || null,
          };

          const userDocRef = doc(firestore, 'users', userCredential.user.uid);
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

          const sellerDocRef = doc(firestore, 'sellers', userCredential.user.uid);
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

  const applyForSeller = useCallback(
    async (sellerApplication: {
      businessName: string;
      businessType: 'individual' | 'company';
      email: string;
      phoneNumber: string;
      bankName: string;
      accountNumber: string;
    }) => {
      if (!user?.uid) throw new Error('User must be logged in');
      
      setLoading(true);
      try {
        // Validate required fields
        const requiredFields = ['businessName', 'businessType', 'email', 'phoneNumber', 'bankName', 'accountNumber'];
        for (const field of requiredFields) {
          if (!sellerApplication[field as keyof typeof sellerApplication]) {
            throw new Error(`Missing required field: ${field}`);
          }
        }

        // Call Cloud Function to submit application
        const functions = getFunctions(app);
        const submitSellerApplication = httpsCallable(functions, 'submitSellerApplication');
        const result = await submitSellerApplication(sellerApplication);
        
        const data = result.data as { success: boolean; message: string };
        
        if (data.success) {
          // Update local user state
          await refreshUser();
        }
        
        return data;
      } catch (error: any) {
        console.error('Error submitting seller application:', error);
        throw new Error(error.message || 'Failed to submit application');
      } finally {
        setLoading(false);
      }
    },
    [user?.uid]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await firebaseAuth.signOut();
      setIsSeller(false);
      setSellerProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (profile: { displayName?: string | null; photoURL?: string | null; }) => {
      setLoading(true);
      try {
        const currentUser = authRN().currentUser;
        if (currentUser) {
          const profileToUpdate: { displayName?: string; photoURL?: string } = {};
          if (profile.displayName !== undefined && profile.displayName !== null) {
            profileToUpdate.displayName = profile.displayName;
          }
          if (profile.photoURL !== undefined && profile.photoURL !== null) {
            profileToUpdate.photoURL = profile.photoURL;
          }
          await firebaseAuth.updateProfile(currentUser, profileToUpdate);
          const userDocRef = doc(firestore, 'users', currentUser.uid);
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
        const currentUser = authRN().currentUser;
        if (currentUser) {
          await currentUser.reauthenticateWithCredential(credential);
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
      const currentUser = authRN().currentUser;
      if (currentUser) {
        await currentUser.updatePassword(password);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    setLoading(true);
    try {
      await firebaseAuth.sendPasswordResetEmail(email);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const updateShippingAddress = useCallback(async (address: ShippingAddress) => {
    if (!user?.uid) throw new Error('User not logged in');
    setLoading(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const currentAddresses = user.shippingAddresses || [];
      const updatedAddresses = currentAddresses.map(addr => 
        addr.id === address.id ? address : addr
      );
      await updateDoc(userDocRef, { shippingAddresses: updatedAddresses });
      await refreshUser();
    } catch (error) {
      console.error('Error updating shipping address:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, refreshUser, user?.shippingAddresses]);

  const addShippingAddress = useCallback(async (address: ShippingAddress) => {
    if (!user?.uid) throw new Error('User not logged in');
    setLoading(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const currentAddresses = user.shippingAddresses || [];
      const newAddress = { ...address, id: Date.now().toString() };
      const updatedAddresses = [...currentAddresses, newAddress];
      await updateDoc(userDocRef, { shippingAddresses: updatedAddresses });
      await refreshUser();
    } catch (error) {
      console.error('Error adding shipping address:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, refreshUser, user?.shippingAddresses]);

  const deleteShippingAddress = useCallback(async (addressId: string) => {
    if (!user?.uid) throw new Error('User not logged in');
    setLoading(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const currentAddresses = user.shippingAddresses || [];
      const updatedAddresses = currentAddresses.filter(addr => addr.id !== addressId);
      await updateDoc(userDocRef, { shippingAddresses: updatedAddresses });
      await refreshUser();
    } catch (error) {
      console.error('Error deleting shipping address:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, refreshUser, user?.shippingAddresses]);

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
        applyForSeller,
        logout,
        updateProfile,
        reauthenticate,
        updatePassword,
        sendPasswordResetEmail,
        refreshSellerProfile,
        addShippingAddress,
        updateShippingAddress,
        deleteShippingAddress,
        refreshUser,
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
