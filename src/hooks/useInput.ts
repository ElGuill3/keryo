import { useEffect, useState, useRef } from 'react';
import { KeryoInputState } from '../lib/inputState';
import { useGamepad } from './useGamepad';
import { createKeyboardService } from '../lib/keyboard';

interface UseInputReturn {
  inputState: KeryoInputState;
  lastUpdate: number;
}

/**
 * useInput — unified hook combining gamepad + keyboard state.
 *
 * Provides a single KeryoInputState object consumed by skin components (RF-03).
 * Neither skins nor RF-01/RF-02 logic need to know which device is connected.
 */
export function useInput(): UseInputReturn {
  const { gamepad } = useGamepad();
  const [keyboard, setKeyboard] = useState<Partial<Record<string, boolean>>>({});

  const keyboardServiceRef = useRef<ReturnType<typeof createKeyboardService> | null>(null);

  useEffect(() => {
    // Initialize keyboard service on mount
    keyboardServiceRef.current = createKeyboardService();

    // Poll keyboard state periodically (RAF would be overkill here)
    const intervalId = setInterval(() => {
      if (keyboardServiceRef.current) {
        setKeyboard(keyboardServiceRef.current.getState());
      }
    }, 16); // ~60fps

    return () => {
      clearInterval(intervalId);
      if (keyboardServiceRef.current) {
        keyboardServiceRef.current.cleanup();
        keyboardServiceRef.current = null;
      }
    };
  }, []);

  return {
    inputState: {
      gamepad,
      keyboard,
    },
    lastUpdate: Date.now(),
  };
}