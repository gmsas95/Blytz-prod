import authRN, {FirebaseAuthTypes} from '@react-native-firebase/auth';

export const firebaseAuth = {
  createUserWithEmailAndPassword: (email: string, password: string) =>
    authRN().createUserWithEmailAndPassword(email, password),
  signInWithEmailAndPassword: (email: string, password: string) =>
    authRN().signInWithEmailAndPassword(email, password),
  sendPasswordResetEmail: (email: string) =>
    authRN().sendPasswordResetEmail(email),
  signOut: () => authRN().signOut(),
  onAuthStateChanged: (
    callback: (user: FirebaseAuthTypes.User | null) => void,
  ) => authRN().onAuthStateChanged(callback),
  updateProfile: (
    user: FirebaseAuthTypes.User,
    profile: {displayName?: string; photoURL?: string},
  ) => user.updateProfile(profile),
};

export { authRN };
