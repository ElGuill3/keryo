import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGamepad } from '../../src/hooks/useGamepad';
import { KeryoButton } from '../../src/lib/inputState';

// Stub globals before importing the hook
let rafCallback: ((time: number) => void) | null = null;
let rafId = 1;

beforeEach(() => {
  rafCallback = null;
  rafId = 1;
  
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: (time: number) => void) => {
    rafCallback = callback;
    return rafId++;
  }));
  
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

// Helper to trigger RAF poll wrapped in act
function triggerRafPoll() {
  if (rafCallback) {
    act(() => {
      rafCallback!(performance.now());
    });
  }
}

describe('useGamepad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Stub navigator.getGamepads
    vi.stubGlobal('navigator', {
      ...navigator,
      getGamepads: vi.fn(() => []),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('returns disconnected state initially when no gamepad', () => {
      const { result } = renderHook(() => useGamepad());
      expect(result.current.gamepad.connected).toBe(false);
    });

    it('returns lastUpdate timestamp', () => {
      const { result } = renderHook(() => useGamepad());
      expect(result.current.lastUpdate).toBeDefined();
      expect(typeof result.current.lastUpdate).toBe('number');
    });

    it('starts with empty buttons', () => {
      const { result } = renderHook(() => useGamepad());
      expect(result.current.gamepad.buttons).toEqual({});
    });

    it('starts with zeroed sticks', () => {
      const { result } = renderHook(() => useGamepad());
      expect(result.current.gamepad.leftStick).toEqual({ x: 0, y: 0 });
      expect(result.current.gamepad.rightStick).toEqual({ x: 0, y: 0 });
    });

    it('starts with zeroed triggers', () => {
      const { result } = renderHook(() => useGamepad());
      expect(result.current.gamepad.triggers.l2.value).toBe(0);
      expect(result.current.gamepad.triggers.r2.value).toBe(0);
    });
  });

  describe('RAF loop lifecycle', () => {
    it('starts RAF loop on mount', () => {
      renderHook(() => useGamepad());
      expect(vi.mocked(requestAnimationFrame)).toHaveBeenCalled();
    });

    it('cancels RAF on unmount', () => {
      const { unmount } = renderHook(() => useGamepad());
      unmount();
      expect(vi.mocked(cancelAnimationFrame)).toHaveBeenCalled();
    });

    it('cancels correct RAF id on unmount', () => {
      const { unmount } = renderHook(() => useGamepad());
      unmount();
      expect(vi.mocked(cancelAnimationFrame)).toHaveBeenCalledWith(1);
    });

    it('stores RAF callback for manual triggering', () => {
      renderHook(() => useGamepad());
      expect(rafCallback).not.toBeNull();
    });
  });

  describe('event listeners', () => {
    it('registers gamepadconnected listener', () => {
      const addSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useGamepad());
      expect(addSpy).toHaveBeenCalledWith('gamepadconnected', expect.any(Function));
    });

    it('registers gamepaddisconnected listener', () => {
      const addSpy = vi.spyOn(window, 'addEventListener');
      renderHook(() => useGamepad());
      expect(addSpy).toHaveBeenCalledWith('gamepaddisconnected', expect.any(Function));
    });

    it('removes both listeners on unmount', () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = renderHook(() => useGamepad());
      unmount();
      expect(removeSpy).toHaveBeenCalledWith('gamepadconnected', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith('gamepaddisconnected', expect.any(Function));
    });
  });

  describe('gamepad polling', () => {
    it('polls getGamepads when RAF fires', () => {
      const getGamepadsSpy = vi.spyOn(navigator, 'getGamepads');
      getGamepadsSpy.mockReturnValue([]);

      renderHook(() => useGamepad());
      triggerRafPoll();

      expect(getGamepadsSpy).toHaveBeenCalled();
    });

    it('updates to connected when gamepad present', () => {
      const mockGamepad = {
        connected: true,
        index: 0,
        mapping: 'standard',
        buttons: Array(16).fill({ pressed: false, value: 0 }) as GamepadButton[],
        axes: [0, 0, 0, 0],
      };
      vi.mocked(navigator.getGamepads).mockReturnValue([mockGamepad as unknown as Gamepad]);

      const { result } = renderHook(() => useGamepad());
      triggerRafPoll();

      expect(result.current.gamepad.connected).toBe(true);
    });

    it('stays disconnected when no gamepad', () => {
      vi.mocked(navigator.getGamepads).mockReturnValue([]);

      const { result } = renderHook(() => useGamepad());
      triggerRafPoll();

      expect(result.current.gamepad.connected).toBe(false);
    });

    it('sets connectedRef to true when gamepad connects', () => {
      const mockGamepad = {
        connected: true,
        index: 0,
        mapping: 'standard',
        buttons: Array(16).fill({ pressed: false, value: 0 }) as GamepadButton[],
        axes: [0, 0, 0, 0],
      };
      vi.mocked(navigator.getGamepads).mockReturnValue([mockGamepad as unknown as Gamepad]);

      const { result } = renderHook(() => useGamepad());
      triggerRafPoll();

      expect(result.current.gamepad.connected).toBe(true);
    });
  });

  describe('gamepad disconnection', () => {
    it('returns disconnected state when getGamepads returns empty', () => {
      vi.mocked(navigator.getGamepads).mockReturnValue([]);

      const { result } = renderHook(() => useGamepad());
      triggerRafPoll();

      expect(result.current.gamepad.connected).toBe(false);
      expect(result.current.gamepad.buttons).toEqual({});
    });

    it('detects disconnection during polling when was previously connected', () => {
      // First, gamepad is connected
      const mockGamepad = {
        connected: true,
        index: 0,
        mapping: 'standard',
        buttons: Array(16).fill({ pressed: false, value: 0 }) as GamepadButton[],
        axes: [0, 0, 0, 0],
      };
      vi.mocked(navigator.getGamepads).mockReturnValue([mockGamepad as unknown as Gamepad]);

      const { result } = renderHook(() => useGamepad());
      triggerRafPoll();
      expect(result.current.gamepad.connected).toBe(true);

      // Now simulate disconnection during polling
      vi.mocked(navigator.getGamepads).mockReturnValue([]);

      // Trigger next RAF poll - this should hit the else if (connectedRef.current) branch
      triggerRafPoll();

      expect(result.current.gamepad.connected).toBe(false);
    });
  });

  describe('gamepadconnected event handler', () => {
    it('sets connectedRef to true when gamepadconnected event fires', () => {
      vi.mocked(navigator.getGamepads).mockReturnValue([]);

      const { result } = renderHook(() => useGamepad());
      
      // Initially disconnected
      expect(result.current.gamepad.connected).toBe(false);

      // Simulate gamepad connection
      act(() => {
        window.dispatchEvent(new Event('gamepadconnected'));
      });

      // connectedRef should now be true, but RAF hasn't run yet
      // The RAF poll will pick this up
      vi.mocked(navigator.getGamepads).mockReturnValue([{
        connected: true,
        index: 0,
        mapping: 'standard',
        buttons: Array(16).fill({ pressed: false, value: 0 }) as GamepadButton[],
        axes: [0, 0, 0, 0],
      } as unknown as Gamepad]);

      triggerRafPoll();

      expect(result.current.gamepad.connected).toBe(true);
    });
  });

  describe('gamepaddisconnected event handler', () => {
    it('sets connectedRef to false when gamepaddisconnected event fires', () => {
      const mockGamepad = {
        connected: true,
        index: 0,
        mapping: 'standard',
        buttons: Array(16).fill({ pressed: false, value: 0 }) as GamepadButton[],
        axes: [0, 0, 0, 0],
      };
      vi.mocked(navigator.getGamepads).mockReturnValue([mockGamepad as unknown as Gamepad]);

      const { result } = renderHook(() => useGamepad());
      triggerRafPoll();

      // Initially connected
      expect(result.current.gamepad.connected).toBe(true);

      // Simulate disconnection
      act(() => {
        window.dispatchEvent(new Event('gamepaddisconnected'));
      });

      // connectedRef should now be false
      vi.mocked(navigator.getGamepads).mockReturnValue([]);

      triggerRafPoll();

      expect(result.current.gamepad.connected).toBe(false);
    });
  });

  describe('statesAreEqual edge cases', () => {
    it('handles null first argument', () => {
      vi.mocked(navigator.getGamepads).mockReturnValue([]);

      const { result } = renderHook(() => useGamepad());
      triggerRafPoll();

      // Initial state should not be equal to null
      expect(result.current.gamepad.connected).toBe(false);
    });

    it('handles different connected states', () => {
      vi.mocked(navigator.getGamepads).mockReturnValue([]);

      const { result, rerender } = renderHook(() => useGamepad());
      triggerRafPoll();
      expect(result.current.gamepad.connected).toBe(false);

      // Now with gamepad
      vi.mocked(navigator.getGamepads).mockReturnValue([{
        connected: true,
        index: 0,
        mapping: 'standard',
        buttons: Array(16).fill({ pressed: false, value: 0 }) as GamepadButton[],
        axes: [0, 0, 0, 0],
      } as unknown as Gamepad]);

      rerender();
      triggerRafPoll();
      expect(result.current.gamepad.connected).toBe(true);
    });

    it('handles button state changes', () => {
      vi.mocked(navigator.getGamepads).mockReturnValue([]);

      const { result } = renderHook(() => useGamepad());
      triggerRafPoll();
      expect(result.current.gamepad.buttons).toEqual({});

      // Now with buttons pressed
      vi.mocked(navigator.getGamepads).mockReturnValue([{
        connected: true,
        index: 0,
        mapping: 'standard',
        buttons: [
          { pressed: true, value: 1 },
          ...Array(15).fill({ pressed: false, value: 0 }),
        ] as GamepadButton[],
        axes: [0, 0, 0, 0],
      } as unknown as Gamepad]);

      triggerRafPoll();
      expect(result.current.gamepad.buttons[KeryoButton.South]).toBe(true);
    });
  });
});
