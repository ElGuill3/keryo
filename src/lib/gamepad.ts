import { KeryoButton, AnalogTrigger } from './inputState';

/**
 * Deadzone threshold for stick axes.
 * Values within ±0.05 are treated as neutral (0).
 */
const STICK_DEADZONE = 0.05;

/**
 * Threshold for trigger pressed state.
 * Trigger is "pressed" when value exceeds 0.5.
 */
const TRIGGER_THRESHOLD = 0.5;

/**
 * Button normalization maps for Xbox and PlayStation.
 * Both vendors map to the same KeryoButton enum values,
 * but the raw button indices differ.
 *
 * Standard gamepad mapping (same for both vendors):
 * Index 0: South (A / Cross)
 * Index 1: East (B / Circle)
 * Index 2: West (X / Square)
 * Index 3: North (Y / Triangle)
 * Index 4: L1 (LB / L1)
 * Index 5: R1 (RB / R1)
 * Index 6: L2 (LT / L2) — often analog
 * Index 7: R2 (RT / R2) — often analog
 * Index 8: Select (Back / Share)
 * Index 9: Start (Start / Options)
 * Index 10: L3 (left stick press)
 * Index 11: R3 (right stick press)
 * Index 12: D-pad Up
 * Index 13: D-pad Down
 * Index 14: D-pad Left
 * Index 15: D-pad Right
 */
const BUTTON_INDEX_MAP: KeryoButton[] = [
  KeryoButton.South,   // 0
  KeryoButton.East,     // 1
  KeryoButton.West,     // 2
  KeryoButton.North,    // 3
  KeryoButton.L1,       // 4
  KeryoButton.R1,       // 5
  KeryoButton.L2,       // 6
  KeryoButton.R2,       // 7
  KeryoButton.Select,   // 8
  KeryoButton.Start,    // 9
  KeryoButton.L3,       // 10
  KeryoButton.R3,       // 11
  KeryoButton.Up,       // 12
  KeryoButton.Down,     // 13
  KeryoButton.Left,     // 14
  KeryoButton.Right,    // 15
];

/**
 * Normalizes a raw button index to a KeryoButton enum value.
 * Works for Xbox, PlayStation, and standard gamepads.
 */
export function normalizeButton(buttonIndex: number): KeryoButton | null {
  if (buttonIndex < 0 || buttonIndex >= BUTTON_INDEX_MAP.length) {
    return null;
  }
  return BUTTON_INDEX_MAP[buttonIndex];
}

/**
 * Trigger axes for left and right sticks.
 * Index 0: left stick X (left negative, right positive)
 * Index 1: left stick Y (up negative, down positive)
 * Index 2: right stick X
 * Index 3: right stick Y
 * Index 4: left trigger (some gamepads report as axis, negative = pressed)
 * Index 5: right trigger (some gamepads report as axis, negative = pressed)
 */
const LEFT_STICK_X_AXIS = 0;
const LEFT_STICK_Y_AXIS = 1;
const RIGHT_STICK_X_AXIS = 2;
const RIGHT_STICK_Y_AXIS = 3;

/**
 * Dual-mode trigger normalization.
 *
 * PlayStation controllers report triggers as buttons with analog value:
 *   - buttons[6].value = L2 (0 to 1)
 *   - buttons[7].value = R2 (0 to 1)
 *
 * Xbox controllers in some browsers report triggers as axes:
 *   - axes[2] = LT (-1 to 1, remapped to 0 to 1)
 *   - axes[3] = RT (-1 to 1, remapped to 0 to 1)
 *
 * We check buttons first (PlayStation style), then fall back to axes (Xbox style).
 * NOTE: axes[2]/axes[3] are also the RIGHT stick X/Y on most gamepads,
 * so using axes as trigger fallback can cause stick movement to affect trigger values.
 * This dual-mode detection is kept for Xbox compatibility but may cause cross-talk.
 */
export function normalizeTriggers(
  buttons: readonly GamepadButton[],
  axes: readonly number[]
): { l2: AnalogTrigger; r2: AnalogTrigger } {
  // L2 trigger
  // buttons[6] = L2 on PlayStation (analog 0-1)
  // axes[2] = LT on Xbox (analog -1 to 1, negative = pressed)
  const l2Raw = extractAnalogTrigger(buttons[6], axes[2]);
  const l2Value = Math.max(0, Math.min(1, l2Raw));
  const l2: AnalogTrigger = {
    button: KeryoButton.L2,
    value: l2Value,
    pressed: l2Value > TRIGGER_THRESHOLD,
  };

  // R2 trigger
  // buttons[7] = R2 on PlayStation (analog 0-1)
  // axes[3] = RT on Xbox (analog -1 to 1, negative = pressed)
  const r2Raw = extractAnalogTrigger(buttons[7], axes[3]);
  const r2Value = Math.max(0, Math.min(1, r2Raw));
  const r2: AnalogTrigger = {
    button: KeryoButton.R2,
    value: r2Value,
    pressed: r2Value > TRIGGER_THRESHOLD,
  };

  return { l2, r2 };
}

/**
 * Extracts analog value from either a GamepadButton or an axis.
 * Button takes precedence if it has an analog value.
 */
function extractAnalogTrigger(
  button: GamepadButton | undefined,
  axis: number | undefined
): number {
  // Try button first (PlayStation style)
  if (button && button.value !== undefined && button.value !== 0) {
    return button.value;
  }

  // Fall back to axis (Xbox style) — axis is negative when pressed
  // Remap from (-1 to 1) to (0 to 1)
  if (axis !== undefined && axis < 0) {
    return Math.abs(axis);
  }

  return 0;
}

/**
 * Normalizes stick axes with deadzone applied.
 */
export function normalizeStick(
  xAxis: number | undefined,
  yAxis: number | undefined
): { x: number; y: number } {
  const rawX = xAxis ?? 0;
  const rawY = yAxis ?? 0;

  // Apply deadzone
  const x = Math.abs(rawX) < STICK_DEADZONE ? 0 : rawX;
  const y = Math.abs(rawY) < STICK_DEADZONE ? 0 : rawY;

  return { x, y };
}

/**
 * Reads all button states from a Gamepad.
 * Returns a normalized map of KeryoButton -> pressed.
 */
export function normalizeAllButtons(gamepad: Gamepad): Partial<Record<KeryoButton, boolean>> {
  const result: Partial<Record<KeryoButton, boolean>> = {};

  for (let i = 0; i < gamepad.buttons.length; i++) {
    const keryoButton = normalizeButton(i);
    if (keryoButton !== null) {
      const pressed = gamepad.buttons[i].pressed;
      result[keryoButton] = pressed;
    }
  }

  return result;
}

/**
 * Reads stick axes from a Gamepad.
 * Applies deadzone to eliminate drift.
 */
export function normalizeSticks(
  axes: readonly number[]
): { leftStick: { x: number; y: number }; rightStick: { x: number; y: number } } {
  return {
    leftStick: normalizeStick(axes[LEFT_STICK_X_AXIS], axes[LEFT_STICK_Y_AXIS]),
    rightStick: normalizeStick(axes[RIGHT_STICK_X_AXIS], axes[RIGHT_STICK_Y_AXIS]),
  };
}