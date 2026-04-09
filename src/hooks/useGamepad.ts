import { useEffect, useRef, useState, useCallback } from 'react';
import { GamepadState, KeryoButton } from '../lib/inputState';
import {
  normalizeAllButtons,
  normalizeTriggers,
  normalizeSticks,
} from '../lib/gamepad';

interface UseGamepadReturn {
  gamepad: GamepadState;
  lastUpdate: number;
}

/**
 * useGamepad — RAF polling hook for gamepad input detection.
 *
 * Uses dirty-flag pattern to minimize re-renders:
 * - Internal state in useRef (mutable, no re-render on change)
 * - External state via useState, only updated when actual change detected
 *
 * Cleans up RAF loop on unmount to prevent memory leaks.
 */
export function useGamepad(): UseGamepadReturn {
  const [gamepad, setGamepad] = useState<GamepadState>(() => createInitialState());

  // Refs for internal mutable state (no re-render on update)
  const rafIdRef = useRef<number | null>(null);
  const previousStateRef = useRef<GamepadState | null>(null);
  const connectedRef = useRef<boolean>(false);

  // Dirty flag — only re-render when state actually changes
  const setGamepadIfChanged = useCallback((newState: GamepadState) => {
    if (!statesAreEqual(previousStateRef.current, newState)) {
      previousStateRef.current = newState;
      setGamepad(newState);
    }
  }, []);

  // RAF polling loop
  const poll = useCallback(() => {
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0]; // Single gamepad support for v1

    if (gp) {
      const buttons = normalizeAllButtons(gp);
      const triggers = normalizeTriggers(gp.buttons, gp.axes);
      const sticks = normalizeSticks(gp.axes);

      connectedRef.current = true;

      setGamepadIfChanged({
        connected: true,
        buttons,
        triggers,
        leftStick: sticks.leftStick,
        rightStick: sticks.rightStick,
      });
    } else if (connectedRef.current) {
      // Gamepad was connected but now disconnected
      connectedRef.current = false;
      setGamepadIfChanged({
        connected: false,
        buttons: {},
        triggers: { l2: { button: KeryoButton.L2, value: 0, pressed: false }, r2: { button: KeryoButton.R2, value: 0, pressed: false } },
        leftStick: { x: 0, y: 0 },
        rightStick: { x: 0, y: 0 },
      });
    }

    rafIdRef.current = requestAnimationFrame(poll);
  }, [setGamepadIfChanged]);

  // Hot-plug event handlers (debounced — just set flag, RAF picks up state)
  useEffect(() => {
    const handleConnect = () => {
      connectedRef.current = true;
    };

    const handleDisconnect = () => {
      connectedRef.current = false;
      setGamepadIfChanged({
        connected: false,
        buttons: {},
        triggers: { l2: { button: KeryoButton.L2, value: 0, pressed: false }, r2: { button: KeryoButton.R2, value: 0, pressed: false } },
        leftStick: { x: 0, y: 0 },
        rightStick: { x: 0, y: 0 },
      });
    };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
    };
  }, [setGamepadIfChanged]);

  // Start/stop RAF loop
  useEffect(() => {
    rafIdRef.current = requestAnimationFrame(poll);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [poll]);

  return {
    gamepad,
    lastUpdate: Date.now(),
  };
}

function createInitialState(): GamepadState {
  return {
    connected: false,
    buttons: {},
    triggers: {
      l2: { button: KeryoButton.L2, value: 0, pressed: false },
      r2: { button: KeryoButton.R2, value: 0, pressed: false },
    },
    leftStick: { x: 0, y: 0 },
    rightStick: { x: 0, y: 0 },
  };
}

/**
 * Epsilon for float comparisons in state equality.
 * Using exact equality (===) on floats can fail due to precision errors,
 * causing missed state updates when joysticks move fast.
 */
const STICK_EPSILON = 0.01;
const TRIGGER_EPSILON = 0.01;

/**
 * Compares two gamepad states for equality.
 * Used for dirty-flag optimization.
 */
function statesAreEqual(a: GamepadState | null, b: GamepadState): boolean {
  if (a === null) return false;

  // Quick connected check
  if (a.connected !== b.connected) return false;

  // Check buttons
  const aKeys = Object.keys(a.buttons);
  const bKeys = Object.keys(b.buttons);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (a.buttons[key as KeryoButton] !== b.buttons[key as KeryoButton]) return false;
  }

  // Check triggers with epsilon tolerance for float precision
  if (
    Math.abs(a.triggers.l2.value - b.triggers.l2.value) > TRIGGER_EPSILON ||
    a.triggers.l2.pressed !== b.triggers.l2.pressed ||
    Math.abs(a.triggers.r2.value - b.triggers.r2.value) > TRIGGER_EPSILON ||
    a.triggers.r2.pressed !== b.triggers.r2.pressed
  ) {
    return false;
  }

  // Check sticks with epsilon tolerance — fixed typo: a.rightStick.y !== b.rightStick.y
  if (
    Math.abs(a.leftStick.x - b.leftStick.x) > STICK_EPSILON ||
    Math.abs(a.leftStick.y - b.leftStick.y) > STICK_EPSILON ||
    Math.abs(a.rightStick.x - b.rightStick.x) > STICK_EPSILON ||
    Math.abs(a.rightStick.y - b.rightStick.y) > STICK_EPSILON
  ) {
    return false;
  }

  return true;
}