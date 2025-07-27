export const getFirestore = jest.fn(() => ({
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) }))
    })),
  })),
}));

export default getFirestore;
