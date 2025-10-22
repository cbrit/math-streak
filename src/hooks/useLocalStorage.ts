import { useState, useEffect } from 'react';

/**
 * Generic hook for persisting state to localStorage with error handling.
 *
 * @param key - The localStorage key to use
 * @param initialValue - The initial value if no stored value exists
 * @returns A tuple of [value, setValue] similar to useState
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  // Initialize state with value from localStorage or initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Check if localStorage is available
      if (typeof window === 'undefined' || !window.localStorage) {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);

      // Parse stored json or return initialValue if nothing is stored
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Handle JSON parse errors or SecurityError in private browsing
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter that persists to localStorage
  const setValue = (value: T) => {
    try {
      // Update React state
      setStoredValue(value);

      // Persist to localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      // Handle QuotaExceededError or other storage errors
      if (error instanceof Error) {
        if (error.name === 'QuotaExceededError') {
          console.error(`localStorage quota exceeded for key "${key}"`);
        } else if (error.name === 'SecurityError') {
          console.error(`localStorage access denied for key "${key}"`);
        } else {
          console.error(`Error writing to localStorage key "${key}":`, error);
        }
      }
      // Still update React state even if localStorage fails
    }
  };

  return [storedValue, setValue];
}
