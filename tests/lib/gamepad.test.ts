import { describe, it, expect } from 'vitest';
import { normalizeButton, normalizeTriggers } from '../../src/lib/gamepad';
import { KeryoButton } from '../../src/lib/inputState';

describe('gamepad normalization', () => {
  describe('normalizeButton', () => {
    it('maps button index 0 to South (A / Cross)', () => {
      expect(normalizeButton(0)).toBe(KeryoButton.South);
    });

    it('maps button index 1 to East (B / Circle)', () => {
      expect(normalizeButton(1)).toBe(KeryoButton.East);
    });

    it('maps button index 2 to West (X / Square)', () => {
      expect(normalizeButton(2)).toBe(KeryoButton.West);
    });

    it('maps button index 3 to North (Y / Triangle)', () => {
      expect(normalizeButton(3)).toBe(KeryoButton.North);
    });

    it('maps trigger buttons correctly', () => {
      expect(normalizeButton(4)).toBe(KeryoButton.L1);
      expect(normalizeButton(5)).toBe(KeryoButton.R1);
      expect(normalizeButton(6)).toBe(KeryoButton.L2);
      expect(normalizeButton(7)).toBe(KeryoButton.R2);
    });

    it('maps stick press buttons', () => {
      expect(normalizeButton(10)).toBe(KeryoButton.L3);
      expect(normalizeButton(11)).toBe(KeryoButton.R3);
    });

    it('maps d-pad buttons', () => {
      expect(normalizeButton(12)).toBe(KeryoButton.Up);
      expect(normalizeButton(13)).toBe(KeryoButton.Down);
      expect(normalizeButton(14)).toBe(KeryoButton.Left);
      expect(normalizeButton(15)).toBe(KeryoButton.Right);
    });

    it('returns null for out-of-range index', () => {
      expect(normalizeButton(-1)).toBe(null);
      expect(normalizeButton(16)).toBe(null);
    });
  });

  describe('normalizeTriggers', () => {
    it('reads analog value from buttons array (PlayStation style)', () => {
      const buttons = [
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: true, value: 0.75 } as GamepadButton,  // L2 at 75%
        { pressed: true, value: 0.25 } as GamepadButton,  // R2 at 25%
      ];
      const axes: readonly number[] = [];

      const result = normalizeTriggers(buttons, axes);

      expect(result.l2.value).toBeCloseTo(0.75);
      expect(result.l2.pressed).toBe(true); // 0.75 > 0.5
      expect(result.r2.value).toBeCloseTo(0.25);
      expect(result.r2.pressed).toBe(false); // 0.25 <= 0.5
    });

    it('falls back to axes when buttons have no value (Xbox style)', () => {
      const buttons = [
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton, // L2 button index — no analog value
        { pressed: false, value: 0 } as GamepadButton, // R2 button index — no analog value
      ];
      // Xbox triggers report as axes[2] and axes[3] (negative = pressed, remapped to 0-1)
      // axes[6] and axes[7] are NOT the trigger axes, they're something else
      const axes: readonly number[] = [0, 0, -0.85, -0.3]; // axes[2]=L2, axes[3]=R2

      const result = normalizeTriggers(buttons, axes);

      expect(result.l2.value).toBeCloseTo(0.85);
      expect(result.l2.pressed).toBe(true); // 0.85 > 0.5
      expect(result.r2.value).toBeCloseTo(0.3);
      expect(result.r2.pressed).toBe(false); // 0.3 <= 0.5
    });

    it('returns 0 for unpressed triggers', () => {
      const buttons = [
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
      ];
      const axes: readonly number[] = [0, 0, 0, 0]; // No axis pressure

      const result = normalizeTriggers(buttons, axes);

      expect(result.l2.value).toBe(0);
      expect(result.l2.pressed).toBe(false);
      expect(result.r2.value).toBe(0);
      expect(result.r2.pressed).toBe(false);
    });
  });
});