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

    it('does NOT fall back to axes — axes are for sticks only (avoids crosstalk)', () => {
      // NOTE: axes[2]/axes[3] are the RIGHT stick X/Y per Gamepad API standard.
      // We do NOT use axes for triggers because it causes cross-talk where
      // moving the right stick affects trigger values.
      const buttons = [
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton,
        { pressed: false, value: 0 } as GamepadButton, // L2 button — no analog value
        { pressed: false, value: 0 } as GamepadButton, // R2 button — no analog value
      ];
      // Even if axes report negative values (as Xbox triggers do in some browsers),
      // we ignore them because axes[2]/axes[3] are the RIGHT stick, not triggers.
      const axes: readonly number[] = [0, 0, -0.85, -0.3];

      const result = normalizeTriggers(buttons, axes);

      // Triggers should be 0 since buttons have no value
      expect(result.l2.value).toBe(0);
      expect(result.l2.pressed).toBe(false);
      expect(result.r2.value).toBe(0);
      expect(result.r2.pressed).toBe(false);
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