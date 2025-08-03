
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions-test';
import {submitSellerApplication, reviewSellerApplication} from './sellerOnboarding';

// Initialize Firebase Test SDK
const testEnv = functions();

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: () => ({
    collection: (collectionName: string) => ({
      where: (field: string, op: string, value: any) => ({
        limit: (limit: number) => ({
          get: async () => {
            if (collectionName === 'sellerApplications' && value === 'pending_user_id') {
              return { empty: false, docs: [{ data: () => ({ status: 'pending' }) }] };
            }
            if (collectionName === 'sellerApplications' && value === 'approved_user_id') {
              return { empty: false, docs: [{ data: () => ({ status: 'approved' }) }] };
            }
            return { empty: true };
          },
        }),
      }),
      add: async (data: any) => {
        return { id: 'new_application_id' };
      },
      doc: (docId: string) => ({
        update: async (data: any) => {},
        get: async () => {
          if (docId === 'existing_application_id') {
            return { exists: true, data: () => ({ userId: 'test_user_id', status: 'pending' }) };
          }
          return { exists: false };
        },
      }),
    }),
    auth: () => ({
      getUser: async (uid: string) => {
        if (uid === 'admin_user_id') {
          return { customClaims: { admin: true } };
        }
        return { customClaims: {} };
      },
      setCustomUserClaims: async (uid: string, claims: any) => {},
    }),
  })
}));

describe('Seller Onboarding Functions', () => {
  afterAll(() => {
    testEnv.cleanup();
  });

  describe('submitSellerApplication', () => {
    it('should submit a seller application for an authenticated user', async () => {
      const wrapped = testEnv.wrap(submitSellerApplication);

      const data = {
        businessName: 'Test Business',
        businessType: 'individual',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        bankName: 'Test Bank',
        accountNumber: '1234567890',
      };

      const context = {
        auth: {
          uid: 'new_user_id',
        },
      };

      const result = await wrapped(data, context);

      expect(result.success).toBe(true);
      expect(result.applicationId).toBe('new_application_id');
    });

    it('should throw an error if the user is not authenticated', async () => {
      const wrapped = testEnv.wrap(submitSellerApplication);
      const data = {};
      const context = {};

      await expect(wrapped(data, context)).rejects.toThrow('User must be authenticated');
    });

    it('should throw an error if a user with a pending application tries to apply again', async () => {
      const wrapped = testEnv.wrap(submitSellerApplication);
       const data = {
        businessName: 'Test Business',
        businessType: 'individual',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        bankName: 'Test Bank',
        accountNumber: '1234567890',
      };
      const context = {
        auth: {
          uid: 'pending_user_id',
        },
      };

      await expect(wrapped(data, context)).rejects.toThrow('You already have a pending application');
    });
  });

  describe('reviewSellerApplication', () => {
    it('should allow an admin to approve an application', async () => {
      const wrapped = testEnv.wrap(reviewSellerApplication);

      const data = {
        applicationId: 'existing_application_id',
        status: 'approved',
      };

      const context = {
        auth: {
          uid: 'admin_user_id',
        },
      };

      const result = await wrapped(data, context);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Application approved successfully');
    });

    it('should not allow a non-admin to review an application', async () => {
      const wrapped = testEnv.wrap(reviewSellerApplication);

      const data = {
        applicationId: 'existing_application_id',
        status: 'approved',
      };

      const context = {
        auth: {
          uid: 'non_admin_user_id',
        },
      };

      await expect(wrapped(data, context)).rejects.toThrow('Admin access required');
    });
  });
});
