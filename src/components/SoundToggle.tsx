import styles from '@/styles/ToggleSwitch.module.css';

interface SoundToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function SoundToggle({ enabled, onChange }: SoundToggleProps) {
  const handleToggle = () => {
    onChange(!enabled);
  };

  return (
    <label className={styles.toggleContainer}>
      <span className={styles.label}>Sound Effects</span>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={enabled}
        onChange={handleToggle}
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle sound effects"
      />
      <div className={`${styles.switch} ${enabled ? styles.enabled : ''}`}>
        <div className={`${styles.knob} ${enabled ? styles.enabled : ''}`} />
      </div>
    </label>
  );
}
