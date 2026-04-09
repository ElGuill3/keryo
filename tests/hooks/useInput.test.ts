import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInput } from '../../src/hooks/useInput';

// Mock useGamepad hook
vi.mock('../../src/hooks/useGamepad', () => ({
  useGamepad: vi.fn(() => ({
    gamepad: {
      connected: false,
      buttons: {},
      triggers: { l2: { button: 'l2' as const, value: 0, pressed: false }, r2: { button: 'r2' as const, value: 0, pressed: false } },
      leftStick: { x: 0, y: 0 },
      rightStick: { x: 0, y: 0 },
    },
    lastUpdate: Date.now(),
  })),
}));

describe('useInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns unified input state with gamepad and keyboard', () => {
    const { result } = renderHook(() => useInput());

    expect(result.current.inputState.gamepad).toBeDefined();
    expect(result.current.inputState.keyboard).toBeDefined();
  });

  it('includes gamepad state from useGamepad', () => {
    const { result } = renderHook(() => useInput());

    expect(result.current.inputState.gamepad.connected).toBe(false);
    expect(result.current.inputState.gamepad.buttons).toEqual({});
  });

  it('returns lastUpdate timestamp', () => {
    const { result } = renderHook(() => useInput());

    expect(result.current.lastUpdate).toBeDefined();
    expect(typeof result.current.lastUpdate).toBe('number');
  });
});