/**
 * KeryoButton — vendor-agnostic directional button enum.
 * Used by all gamepad vendors (Xbox, PlayStation, generic).
 * Skin components (RF-03) consume this without knowing the vendor.
 */
export enum KeryoButton {
  North = 'north',   // Y / Triangle
  South = 'south',   // A / Cross
  East = 'east',     // B / Circle
  West = 'west',     // X / Square
  L1 = 'l1',
  R1 = 'r1',
  L2 = 'l2',
  R2 = 'r2',
  L3 = 'l3',
  R3 = 'r3',
  Select = 'select',
  Start = 'start',
  Up = 'up',
  Down = 'down',
  Left = 'left',
  Right = 'right',
}

/**
 * Analog trigger state.
 * value: analog depth from 0 (released) to 1 (fully pressed)
 * pressed: true when value exceeds 0.5 threshold
 */
export interface AnalogTrigger {
  button: KeryoButton.L2 | KeryoButton.R2;
  value: number; // 0 to 1
  pressed: boolean;
}

/**
 * Joystick axis state.
 * x: horizontal axis, -1 (left) to 1 (right)
 * y: vertical axis, -1 (up) to 1 (down)
 */
export interface StickAxis {
  x: number; // -1 to 1
  y: number; // -1 to 1
}

/**
 * Gamepad state — skin-agnostic representation.
 * No vendor-specific indices — only KeryoButton values.
 */
export interface GamepadState {
  connected: boolean;
  buttons: Partial<Record<KeryoButton, boolean>>;
  triggers: { l2: AnalogTrigger; r2: AnalogTrigger };
  leftStick: StickAxis;
  rightStick: StickAxis;
}

/**
 * Keyboard key — subset of valid keys we track.
 * Used as keys in the keyboard state map.
 */
export type KeyboardKey =
  | 'w' | 'a' | 's' | 'd'
  | 'arrowup' | 'arrowdown' | 'arrowleft' | 'arrowright'
  | ' '
  | 'enter' | 'shift' | 'control' | 'alt'
  | 'q' | 'e' | 'r' | 't'
  | string;

/**
 * Unified input state consumed by skin components (RF-03).
 * Neither the skin nor RF-01/RF-02 logic needs to know
 * which gamepad vendor is connected.
 */
export interface KeryoInputState {
  gamepad: GamepadState;
  keyboard: Partial<Record<KeyboardKey, boolean>>;
}