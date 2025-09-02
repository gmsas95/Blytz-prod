import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export const callFunction = (name: string, data?: any) => {
  const callableFunction = httpsCallable(functions, name);
  return callableFunction(data);
};
