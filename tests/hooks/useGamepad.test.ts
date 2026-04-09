import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGamepad } from '../../src/hooks/useGamepad';

// Mock requestAnimationFrame and cancelAnimationFrame
const mockRaf = vi.fn(() => 123);
const mockCancelRaf = vi.fn();
globalThis.requestAnimationFrame = mockRaf;
globalThis.cancelAnimationFrame = mockCancelRaf;

// Mock navigator.getGamepads
const mockGetGamepads = vi.fn();
Object.defineProperty(navigator, 'getGamepads', {
  value: mockGetGamepads,
  writable: true,
});

describe('useGamepad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetGamepads.mockReturnValue([]);
    mockCancelRaf.mockClear();
  });

  afterEach(() => {
    mockCancelRaf.mockClear();
  });

  it('returns disconnected state initially when no gamepad', () => {
    mockGetGamepads.mockReturnValue([]);

    const { result } = renderHook(() => useGamepad());

    expect(result.current.gamepad.connected).toBe(false);
  });

  it('starts RAF loop on mount', () => {
    mockGetGamepads.mockReturnValue([]);

    renderHook(() => useGamepad());

    expect(requestAnimationFrame).toHaveBeenCalled();
  });

  it('cleans up RAF loop on unmount', () => {
    mockGetGamepads.mockReturnValue([]);

    const { unmount } = renderHook(() => useGamepad());
    unmount();

    expect(cancelAnimationFrame).toHaveBeenCalledWith(123);
  });

  it('registers gamepadconnected and gamepaddisconnected event listeners', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    mockGetGamepads.mockReturnValue([]);

    const { unmount } = renderHook(() => useGamepad());

    // Verify listeners were added
    expect(addEventListenerSpy).toHaveBeenCalledWith('gamepadconnected', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('gamepaddisconnected', expect.any(Function));

    unmount();

    // Verify listeners were removed
    expect(removeEventListenerSpy).toHaveBeenCalledWith('gamepadconnected', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('gamepaddisconnected', expect.any(Function));
  });
});