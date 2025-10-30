import { useEffect } from 'react';
import styles from '@/styles/SettingsPanel.module.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  maxResult: number;
  onMaxResultChange: (value: number) => void;
  allowZero: boolean;
  onAllowZeroChange: (value: boolean) => void;
}

export function SettingsPanel({ isOpen, onClose, maxResult, onMaxResultChange, allowZero, onAllowZeroChange }: SettingsPanelProps) {
  // Handle Esc key to close panel
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus the close button when panel opens for accessibility
  useEffect(() => {
    if (isOpen) {
      const closeButton = document.querySelector<HTMLButtonElement>('[data-testid="settings-close-button"]');
      if (closeButton) {
        setTimeout(() => closeButton.focus(), 100);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      data-testid="settings-overlay"
    >
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        data-testid="settings-panel"
      >
        <div className={styles.header}>
          <h2 id="settings-title" className={styles.title}>
            Settings
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close settings"
            data-testid="settings-close-button"
          >
            <svg
              className={styles.closeIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.settingSection}>
            <label htmlFor="max-result" className={styles.settingLabel}>
              Maximum Sum
            </label>
            <select
              id="max-result"
              className={styles.settingSelect}
              value={maxResult}
              onChange={(e) => onMaxResultChange(Number(e.target.value))}
              data-testid="max-result-select"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.settingSection}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={allowZero || maxResult === 1}
                onChange={(e) => onAllowZeroChange(e.target.checked)}
                disabled={maxResult === 1}
                data-testid="allow-zero-checkbox"
              />
              <span className={styles.checkboxText}>
                Include Zero
                {maxResult === 1 && <span className={styles.disabledNote}> (required for sum of 1)</span>}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
