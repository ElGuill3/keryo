import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create mocks before importing the module
const listenersMap = new Map<string, Set<EventListener>>();
const mockAddEventListener = vi.fn((event: string, handler: EventListener) => {
  if (!listenersMap.has(event)) {
    listenersMap.set(event, new Set());
  }
  listenersMap.get(event)!.add(handler);
});
const mockRemoveEventListener = vi.fn((event: string, handler: EventListener) => {
  listenersMap.get(event)?.delete(handler);
});
const mockClear = vi.fn(() => listenersMap.clear());

// Spy on window properties
vi.stubGlobal('addEventListener', mockAddEventListener);
vi.stubGlobal('removeEventListener', mockRemoveEventListener);

// Helper to dispatch events to registered listeners
function dispatchEvent(event: Event) {
  const listeners = listenersMap.get(event.type);
  if (listeners) {
    listeners.forEach((handler) => handler(event));
  }
}

describe('keyboard service', () => {
  beforeEach(() => {
    listenersMap.clear();
    mockAddEventListener.mockClear();
    mockRemoveEventListener.mockClear();
  });

  describe('createKeyboardService', () => {
    it('registers keydown and keyup event listeners on creation', async () => {
      const { createKeyboardService } = await import('../../src/lib/keyboard');
      createKeyboardService();

      expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
    });

    it('returns getState and cleanup functions', async () => {
      const { createKeyboardService } = await import('../../src/lib/keyboard');
      const service = createKeyboardService();

      expect(service.getState).toBeDefined();
      expect(typeof service.getState).toBe('function');
      expect(service.cleanup).toBeDefined();
      expect(typeof service.cleanup).toBe('function');
    });

    it('initializes with empty key state', async () => {
      const { createKeyboardService } = await import('../../src/lib/keyboard');
      const service = createKeyboardService();
      const state = service.getState();

      expect(state).toEqual({});
    });
  });

  describe('keydown handling', () => {
    it('sets key to true when keydown event fires', async () => {
      const { createKeyboardService } = await import('../../src/lib/keyboard');
      const service = createKeyboardService();

      dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));

      expect(service.getState()).toEqual({ w: true });
    });

    it('ignores key repeat events', async () => {
      const { createKeyboardService } = await import('../../src/lib/keyboard');
      const service = createKeyboardService();

      // First press
      dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      expect(service.getState()).toEqual({ w: true });

      // Repeat should be ignored - still only one entry
      dispatchEvent(new KeyboardEvent('keydown', { key: 'w', repeat: true }));
      expect(service.getState()).toEqual({ w: true });
    });

    it('normalizes uppercase keys to lowercase', async () => {
      const { createKeyboardService } = await import('../../src/lib/keyboard');
      const service = createKeyboardService();

      dispatchEvent(new KeyboardEvent('keydown', { key: 'W' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: 'A' }));

      expect(service.getState()).toEqual({ w: true, a: true });
    });

    it('tracks multiple keys simultaneously (combinations)', async () => {
      const { createKeyboardService } = await import('../../src/lib/keyboard');
      const service = createKeyboardService();

      dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' }));

      const state = service.getState();
      expect(state).toEqual({ w: true, a: true, shift: true });
    });

    it('returns null for unrecognized keys (does not set state)', async () => {
      const { createKeyboardService } = await import('../../src/lib/keyboard');
      const service = createKeyboardService();

      dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(service.getState()).toEqual({});
    });
  });

  describe('keyup handling', () => {
    it('sets key to false when keyup event fires', async () => {
      const { createKeyboardService } = await import('../../src/lib/keyboard');
      const service = createKeyboardService();

      dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      expect(service.getState()).toEqual({ w: true });

      dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
      expect(service.getState()).toEqual({ w: false });
    });

    it('handles key down/up cycle correctly', async () => {
      const { createKeyboardService } = await import('../../src/lib/keyboard');
      const service = createKeyboardService();

      // Press multiple keys
      dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));

      // Release one
      dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));

      expect(service.getState()).toEqual({ w: false, a: true });
    });
  });

  describe('normalizeKey edge cases', () => {
    it('handles space key', async () => {
      const { createKeyboardService } = await import('../../src/lib/keyboard');
      const service = createKeyboardService();

      dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

      expect(service.getState()).toEqual({ ' ': true });
    });

    it('handles arrow keys', async () => {
      const { createKeyboardService } = await import('../../src/lib/keyboard');
      const service = createKeyboardService();

      dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

      const state = service.getState();
      expect(state).toEqual({
        arrowup: true,
        arrowdown: true,
        arrowleft: true,
        arrowright: true,
      });
    });

    it('handles modifier keys', async () => {
      const { createKeyboardService } = await import('../../src/lib/keyboard');
      const service = createKeyboardService();

      dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }));

      const state = service.getState();
      expect(state).toEqual({
        enter: true,
        shift: true,
        control: true,
        alt: true,
      });
    });

    it('handles WASD keys', async () => {
      const { createKeyboardService } = await import('../../src/lib/keyboard');
      const service = createKeyboardService();

      dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));

      expect(service.getState()).toEqual({ w: true, a: true, s: true, d: true });
    });

    it('handles QERT gaming keys', async () => {
      const { createKeyboardService } = await import('../../src/lib/keyboard');
      const service = createKeyboardService();

      dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: 't' }));

      expect(service.getState()).toEqual({ q: true, e: true, r: true, t: true });
    });

    it('handles number keys', async () => {
      const { createKeyboardService } = await import('../../src/lib/keyboard');
      const service = createKeyboardService();

      dispatchEvent(new KeyboardEvent('keydown', { key: '0' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: '5' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: '9' }));

      expect(service.getState()).toEqual({ '0': true, '5': true, '9': true });
    });
  });

  describe('cleanup', () => {
    it('removes event listeners on cleanup', async () => {
      const { createKeyboardService } = await import('../../src/lib/keyboard');
      const service = createKeyboardService();
      mockRemoveEventListener.mockClear();

      service.cleanup();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
    });

    it('clears key state on cleanup', async () => {
      const { createKeyboardService } = await import('../../src/lib/keyboard');
      const service = createKeyboardService();

      dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      expect(Object.keys(service.getState()).length).toBe(2);

      service.cleanup();

      expect(service.getState()).toEqual({});
    });
  });
});
