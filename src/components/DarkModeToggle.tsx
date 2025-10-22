import styles from '@/styles/ToggleSwitch.module.css';

interface DarkModeToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function DarkModeToggle({ enabled, onChange }: DarkModeToggleProps) {
  const handleToggle = () => {
    onChange(!enabled);
  };

  return (
    <label className={styles.toggleContainer}>
      <span className={styles.label}>Dark Mode</span>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={enabled}
        onChange={handleToggle}
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle dark mode"
      />
      <div className={`${styles.switch} ${enabled ? styles.enabled : ''}`}>
        <div className={`${styles.knob} ${enabled ? styles.enabled : ''}`} />
      </div>
    </label>
  );
}
