import { HttpsError } from 'firebase-functions/v2/https';

export const validateString = (value: any, name: string, minLength = 1, maxLength = 255) => {
  if (typeof value !== 'string' || value.length < minLength || value.length > maxLength) {
    throw new HttpsError('invalid-argument', `${name} must be a string between ${minLength} and ${maxLength} characters.`);
  }
};

export const validateNumber = (value: any, name: string, min = 0, max = Infinity) => {
  if (typeof value !== 'number' || value < min || value > max) {
    throw new HttpsError('invalid-argument', `${name} must be a number between ${min} and ${max}.`);
  }
};

export const validateEmail = (email: any) => {
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError('invalid-argument', 'Invalid email address.');
  }
};