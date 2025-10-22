import { useState, useCallback } from 'react';
import type { UserSettings } from '../lib/types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../lib/constants';

/**
 * Custom hook for managing user settings with localStorage persistence.
 *
 * Features:
 * - Loads settings from localStorage on mount
 * - Saves settings to localStorage on update
 * - Graceful error handling for localStorage failures
 * - Type-safe partial updates
 * - Reset to default settings
 *
 * @returns Object containing settings state and update functions
 */
export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all required fields exist
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
    return DEFAULT_SETTINGS;
  });

  /**
   * Updates settings with partial values and persists to localStorage.
   * Settings are merged with existing settings.
   *
   * @param updates - Partial settings object with fields to update
   */
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(next));
      } catch (error) {
        console.warn('Failed to save settings:', error);
      }
      return next;
    });
  }, []);

  /**
   * Resets settings to default values and clears localStorage.
   */
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_SETTINGS);
    } catch (error) {
      console.warn('Failed to reset settings:', error);
    }
  }, []);

  return { settings, updateSettings, resetSettings };
}
