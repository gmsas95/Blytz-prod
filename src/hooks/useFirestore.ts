import {firebaseFirestore} from '../services/firebase/firestore';

export const useFirestore = () => {
  return firebaseFirestore;
};
