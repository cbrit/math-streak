import { useEffect } from 'react';
import styles from '@/styles/SettingsPanel.module.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
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
          {/* Empty for now - settings will be added here */}
        </div>
      </div>
    </div>
  );
}
