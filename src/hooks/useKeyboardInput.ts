import { useEffect, useState, useCallback } from 'react';

interface UseKeyboardInputOptions {
  onNumberKey: (digit: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  enabled?: boolean;
}

interface UseKeyboardInputReturn {
  activeKey: string | null;
}

export function useKeyboardInput({
  onNumberKey,
  onBackspace,
  onEnter,
  enabled = true,
}: UseKeyboardInputOptions): UseKeyboardInputReturn {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const key = event.key;

    // Handle number keys (0-9) - both top row and numpad
    if (/^[0-9]$/.test(key)) {
      event.preventDefault();
      onNumberKey(key);
      setActiveKey(key);
      setTimeout(() => setActiveKey(null), 150);
      return;
    }

    // Handle Backspace
    if (key === 'Backspace') {
      event.preventDefault();
      onBackspace();
      setActiveKey('Backspace');
      setTimeout(() => setActiveKey(null), 150);
      return;
    }

    // Handle Enter
    if (key === 'Enter') {
      event.preventDefault();
      onEnter();
      setActiveKey('Enter');
      setTimeout(() => setActiveKey(null), 150);
      return;
    }
  }, [enabled, onNumberKey, onBackspace, onEnter]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { activeKey };
}
