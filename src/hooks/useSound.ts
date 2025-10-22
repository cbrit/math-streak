import { useEffect, useRef, useState } from 'react';

interface SoundHook {
  playSuccess: () => void;
  playError: () => void;
  isLoaded: boolean;
  error: string | null;
}

interface UseSoundOptions {
  enabled?: boolean;
}

export function useSound(options: UseSoundOptions = {}): SoundHook {
  const { enabled = true } = options;
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize AudioContext
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

      if (!AudioContextClass) {
        setError('AudioContext not supported in this browser');
        setIsLoaded(true); // Still mark as "loaded" to not block UI
        return;
      }

      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      // Handle autoplay policy - context may start suspended
      // It will resume on first user interaction
      if (audioContext.state === 'suspended') {
        console.log('AudioContext suspended - will resume on user interaction');
      }

      setIsLoaded(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize audio';
      console.error('Audio initialization error:', errorMessage);
      setError(errorMessage);
      setIsLoaded(true); // Still mark as "loaded" to not block UI
    }

    return () => {
      // Cleanup: close audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch((err) => {
          console.error('Error closing audio context:', err);
        });
      }
    };
  }, []);

  const playTone = (frequency: number, duration: number, startDelay: number = 0) => {
    const context = audioContextRef.current;
    if (!context) {
      return;
    }

    try {
      // Resume context if suspended (handles autoplay policy)
      if (context.state === 'suspended') {
        context.resume().catch((err) => {
          console.error('Error resuming audio context:', err);
        });
      }

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      const startTime = context.currentTime + startDelay;
      const endTime = startTime + duration;

      // Gentle volume with exponential fade out
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);

      oscillator.start(startTime);
      oscillator.stop(endTime);
    } catch (err) {
      console.error('Error playing tone:', err);
    }
  };

  const playSuccess = () => {
    if (!enabled || !audioContextRef.current) {
      return;
    }

    try {
      // Pleasant ascending tone: C5 (523.25 Hz) → E5 (659.25 Hz)
      playTone(523.25, 0.15, 0);      // C5 - starts immediately
      playTone(659.25, 0.15, 0.1);    // E5 - starts 100ms later
    } catch (err) {
      console.error('Error playing success sound:', err);
    }
  };

  const playError = () => {
    if (!enabled || !audioContextRef.current) {
      return;
    }

    try {
      // Gentle single tone: A3 (220 Hz)
      playTone(220, 0.2, 0);
    } catch (err) {
      console.error('Error playing error sound:', err);
    }
  };

  return { playSuccess, playError, isLoaded, error };
}
