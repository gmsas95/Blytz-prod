/**
 * Calculate the next bid amount based on current highest bid
 * @param currentBid - Current highest bid amount
 * @param minIncrement - Minimum increment amount (default: 5)
 * @returns Next valid bid amount
 */
export const calculateNextBidAmount = (currentBid: number, minIncrement: number = 5): number => {
  return currentBid + minIncrement;
};

/**
 * Validate if a bid amount is valid
 * @param bidAmount - The bid amount to validate
 * @param currentBid - Current highest bid amount
 * @param minIncrement - Minimum increment amount (default: 5)
 * @returns Object with isValid flag and error message
 */
export const validateBidAmount = (
  bidAmount: number, 
  currentBid: number, 
  minIncrement: number = 5
): { isValid: boolean; errorMessage?: string } => {
  const minBid = currentBid + minIncrement;
  
  if (isNaN(bidAmount) || bidAmount <= 0) {
    return { isValid: false, errorMessage: 'Please enter a valid bid amount' };
  }
  
  if (bidAmount < minBid) {
    return { isValid: false, errorMessage: `Bid must be at least $${minBid}` };
  }
  
  return { isValid: true };
};