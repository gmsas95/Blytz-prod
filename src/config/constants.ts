export const CURRENCY_SYMBOLS: {[key: string]: string} = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  MYR: 'RM',
  SGD: 'S$',
  IDR: 'Rp',
  THB: '฿',
  PHP: '₱',
  VND: '₫',
};

export const getCurrencySymbol = (currencyCode: string): string => {
  return CURRENCY_SYMBOLS[currencyCode.toUpperCase()] || currencyCode;
};
