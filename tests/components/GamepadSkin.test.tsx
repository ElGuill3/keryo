import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StickSkin } from '../../src/components/GamepadSkin/StickSkin';
import { TriggerSkin } from '../../src/components/GamepadSkin/TriggerSkin';
import { ButtonSkin } from '../../src/components/GamepadSkin/ButtonSkin';
import { GamepadSkin } from '../../src/components/GamepadSkin/GamepadSkin';
import { KeryoInputState, KeryoButton } from '../../src/lib/inputState';
import React from 'react';

// Mock framer-motion
vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    useSpring: (value: any) => ({
      get: () => (typeof value === 'number' ? value : 0),
      set: () => {},
    }),
    useMotionValue: (initial: number) => ({
      get: () => initial,
      set: () => {},
    }),
    useTransform: (value: any, _input: any, output: any) => ({
      get: () => {
        const v = typeof value.get === 'function' ? value.get() : value;
        const [inMin, inMax] = _input;
        const [outMin, outMax] = output;
        const normalized = (v - inMin) / (inMax - inMin);
        return outMin + normalized * (outMax - outMin);
      },
    }),
    motion: {
      div: React.forwardRef(({ style, ...props }: any, ref: any) =>
        React.createElement('div', { ref, style, ...props })
      ),
    },
  };
});

const createMockInputState = (overrides?: Partial<KeryoInputState>): KeryoInputState => ({
  gamepad: {
    connected: true,
    buttons: {
      [KeryoButton.South]: false,
      [KeryoButton.East]: false,
    },
    triggers: {
      l2: { button: KeryoButton.L2, value: 0, pressed: false },
      r2: { button: KeryoButton.R2, value: 0, pressed: false },
    },
    leftStick: { x: 0, y: 0 },
    rightStick: { x: 0, y: 0 },
  },
  keyboard: {},
  ...overrides,
});

describe('StickSkin', () => {
  it('renders left stick with label', () => {
    const inputState = createMockInputState();
    render(
      <GamepadSkin inputState={inputState}>
        <StickSkin stick="leftStick" />
      </GamepadSkin>
    );
    expect(screen.getByText('Left')).toBeTruthy();
  });

  it('renders right stick with label', () => {
    const inputState = createMockInputState();
    render(
      <GamepadSkin inputState={inputState}>
        <StickSkin stick="rightStick" />
      </GamepadSkin>
    );
    expect(screen.getByText('Right')).toBeTruthy();
  });

  it('renders with custom size', () => {
    const inputState = createMockInputState();
    const { container } = render(
      <GamepadSkin inputState={inputState}>
        <StickSkin stick="leftStick" size={120} />
      </GamepadSkin>
    );
    const base = container.querySelector('.rounded-full');
    expect(base).toBeTruthy();
  });
});

describe('TriggerSkin', () => {
  it('renders L2 trigger with label', () => {
    const inputState = createMockInputState();
    render(
      <GamepadSkin inputState={inputState}>
        <TriggerSkin trigger="l2" />
      </GamepadSkin>
    );
    expect(screen.getByText('L2')).toBeTruthy();
  });

  it('renders R2 trigger with label', () => {
    const inputState = createMockInputState();
    render(
      <GamepadSkin inputState={inputState}>
        <TriggerSkin trigger="r2" />
      </GamepadSkin>
    );
    expect(screen.getByText('R2')).toBeTruthy();
  });

  it('renders with custom size', () => {
    const inputState = createMockInputState();
    const { container } = render(
      <GamepadSkin inputState={inputState}>
        <TriggerSkin trigger="l2" size={100} />
      </GamepadSkin>
    );
    expect(container.querySelector('.flex-col')).toBeTruthy();
  });
});

describe('ButtonSkin', () => {
  it('renders button with label', () => {
    const inputState = createMockInputState();
    render(
      <GamepadSkin inputState={inputState}>
        <ButtonSkin keryoButton={KeryoButton.South}>A</ButtonSkin>
      </GamepadSkin>
    );
    expect(screen.getByText('A')).toBeTruthy();
  });

  it('renders with custom size', () => {
    const inputState = createMockInputState();
    const { container } = render(
      <GamepadSkin inputState={inputState}>
        <ButtonSkin keryoButton={KeryoButton.South} size={64}>
          A
        </ButtonSkin>
      </GamepadSkin>
    );
    expect(container.querySelector('.rounded-full')).toBeTruthy();
  });
});

describe('GamepadSkin', () => {
  it('renders children', () => {
    const inputState = createMockInputState();
    render(
      <GamepadSkin inputState={inputState}>
        <div data-testid="child">Child Content</div>
      </GamepadSkin>
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('provides context to descendants', () => {
    const inputState = createMockInputState({
      gamepad: {
        ...createMockInputState().gamepad,
        connected: true,
        buttons: { [KeryoButton.South]: true },
      },
    });

    // This tests that GamepadContext is provided - if context isn't provided,
    // useGamepadContext would throw an error
    render(
      <GamepadSkin inputState={inputState}>
        <ButtonSkin keryoButton={KeryoButton.South}>A</ButtonSkin>
      </GamepadSkin>
    );
    expect(screen.getByText('A')).toBeTruthy();
  });
});
