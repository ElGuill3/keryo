import { KeyboardKey } from './inputState';

type KeyState = Map<KeyboardKey, boolean>;

/**
 * Creates a keyboard service that tracks keydown/keyup state.
 * Returns cleanup function to remove event listeners.
 */
export function createKeyboardService() {
  const keyState: KeyState = new Map();

  const handleKeyDown = (event: KeyboardEvent) => {
    // Ignore key repeat events
    if (event.repeat) return;

    const key = normalizeKey(event.key);
    if (key) {
      keyState.set(key, true);
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    const key = normalizeKey(event.key);
    if (key) {
      keyState.set(key, false);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return {
    getState(): Partial<Record<KeyboardKey, boolean>> {
      const result: Partial<Record<KeyboardKey, boolean>> = {};
      keyState.forEach((pressed, key) => {
        result[key] = pressed;
      });
      return result;
    },

    cleanup() {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      keyState.clear();
    },
  };
}

/**
 * Normalizes a browser key value to a KeyboardKey.
 * Handles different key representations (e.g., ' ' for space, 'ArrowUp' for up).
 */
function normalizeKey(key: string): KeyboardKey | null {
  // Normalize common keys
  const normalized = key.toLowerCase();

  // Space key
  if (key === ' ') return ' ';

  // Arrow keys
  if (key === 'ArrowUp') return 'arrowup';
  if (key === 'ArrowDown') return 'arrowdown';
  if (key === 'ArrowLeft') return 'arrowleft';
  if (key === 'ArrowRight') return 'arrowright';

  // Modifier keys
  if (key === 'Enter') return 'enter';
  if (key === 'Shift') return 'shift';
  if (key === 'Control') return 'control';
  if (key === 'Alt') return 'alt';

  // WASD + common gaming keys
  if (/^[wasdqert]$/.test(normalized)) {
    return normalized as KeyboardKey;
  }

  // Single character keys (letters, numbers)
  if (/^[a-z0-9]$/.test(normalized)) {
    return normalized as KeyboardKey;
  }

  return null;
}