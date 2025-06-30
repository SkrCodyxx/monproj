// Placeholder for utility functions

/**
 * Formats a date object or string into a more readable format.
 * Example: formatDate(new Date()) -> "October 28, 2023"
 * @param date - The date to format.
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string.
 */
export const formatDate = (
  date: string | number | Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return dateObj.toLocaleDateString(
    'en-US', // Or use a specific locale like 'fr-CA'
    options || {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );
};

/**
 * Formats a number as currency.
 * Example: formatCurrency(1234.56, 'CAD') -> "CA$1,234.56"
 * @param amount - The amount to format.
 * @param currency - The currency code (e.g., 'USD', 'EUR', 'CAD').
 * @returns Formatted currency string.
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'CAD' // Default to Canadian Dollar
): string => {
  return new Intl.NumberFormat('en-CA', { // Use 'fr-CA' for French Canadian formatting
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Add other helper functions as needed, e.g., for validation, string manipulation, etc.
