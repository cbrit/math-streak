import styles from '@/styles/SettingsButton.module.css';

interface SettingsButtonProps {
  onClick: () => void;
  ariaLabel?: string;
}

export function SettingsButton({ onClick, ariaLabel = 'Open settings' }: SettingsButtonProps) {
  return (
    <button
      className={styles.settingsButton}
      onClick={onClick}
      aria-label={ariaLabel}
      type="button"
    >
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m-6.364 0l-4.243 4.243m12.728 0l-4.243-4.243m-6.364 0l-4.243 4.243" />
      </svg>
    </button>
  );
}
