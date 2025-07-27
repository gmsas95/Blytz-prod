export const getShippingRates = async (
  originCountry: string,
  destinationCountry: string,
  weight: number,
) => {
  // Mock implementation for now
  console.log(
    `Fetching shipping rates from ${originCountry} to ${destinationCountry} for ${weight}kg`,
  );
  return [
    {
      id: 'standard',
      name: 'Standard Shipping',
      price: 10.0,
      estimatedDays: '3-5 business days',
    },
    {
      id: 'express',
      name: 'Express Shipping',
      price: 25.0,
      estimatedDays: '1-2 business days',
    },
  ];
};
