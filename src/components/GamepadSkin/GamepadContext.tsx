import { createContext, useContext, useRef, useEffect } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';
import { KeryoInputState, KeryoButton } from '../../lib/inputState';

/**
 * Theme for GamepadSkin - colors passed as CSS custom properties
 */
export interface GamepadTheme {
  colors?: {
    btnSouth?: string;
    btnNorth?: string;
    btnEast?: string;
    btnWest?: string;
    btnL1?: string;
    btnR1?: string;
    btnL2?: string;
    btnR2?: string;
    btnL3?: string;
    btnR3?: string;
    btnSelect?: string;
    btnStart?: string;
    btnUp?: string;
    btnDown?: string;
    btnLeft?: string;
    btnRight?: string;
    stickBase?: string;
    stickKnob?: string;
  };
}

export interface GamepadThemeColors {
  btnSouth: string;
  btnNorth: string;
  btnEast: string;
  btnWest: string;
  btnL1: string;
  btnR1: string;
  btnL2: string;
  btnR2: string;
  btnL3: string;
  btnR3: string;
  btnSelect: string;
  btnStart: string;
  btnUp: string;
  btnDown: string;
  btnLeft: string;
  btnRight: string;
  stickBase: string;
  stickKnob: string;
}

export const defaultThemeColors: GamepadThemeColors = {
  btnSouth: '#3b82f6',
  btnNorth: '#3b82f6',
  btnEast: '#3b82f6',
  btnWest: '#3b82f6',
  btnL1: '#6b7280',
  btnR1: '#6b7280',
  btnL2: '#6b7280',
  btnR2: '#6b7280',
  btnL3: '#6b7280',
  btnR3: '#6b7280',
  btnSelect: '#6b7280',
  btnStart: '#6b7280',
  btnUp: '#6b7280',
  btnDown: '#6b7280',
  btnLeft: '#6b7280',
  btnRight: '#6b7280',
  stickBase: '#374151',
  stickKnob: '#1f2937',
};

interface GamepadContextValue {
  inputState: KeryoInputState;
  theme: GamepadTheme;
}

const GamepadContext = createContext<GamepadContextValue | null>(null);

export function GamepadContextProvider({
  inputState,
  theme = { colors: defaultThemeColors },
  children,
}: {
  inputState: KeryoInputState;
  theme?: GamepadTheme;
  children: React.ReactNode;
}) {
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const value: GamepadContextValue = {
    inputState,
    theme: themeRef.current,
  };

  return (
    <GamepadContext.Provider value={value}>
      {children}
    </GamepadContext.Provider>
  );
}

export function useGamepadContext(): GamepadContextValue {
  const context = useContext(GamepadContext);
  if (!context) {
    throw new Error('useGamepadContext must be used within GamepadContextProvider');
  }
  return context;
}

/**
 * Hook to subscribe to a specific stick's X and Y motion values with spring animation.
 */
export function useStick(stick: 'leftStick' | 'rightStick') {
  const { inputState } = useGamepadContext();
  const stickData = inputState.gamepad[stick];
  
  // Create raw motion values
  const rawX = useMotionValue(stickData.x);
  const rawY = useMotionValue(stickData.y);
  
  // Apply spring animation - stiffness 200, damping 20 for responsive feel
  const springConfig = { stiffness: 200, damping: 20 };
  const animatedX = useSpring(rawX, springConfig);
  const animatedY = useSpring(rawY, springConfig);
  
  // Sync motion values with input state
  useEffect(() => {
    rawX.set(stickData.x);
    rawY.set(stickData.y);
  }, [stickData.x, stickData.y, rawX, rawY]);
  
  return { x: animatedX, y: animatedY };
}

/**
 * Hook to subscribe to a specific trigger's motion value with spring animation.
 */
export function useTrigger(trigger: 'l2' | 'r2') {
  const { inputState } = useGamepadContext();
  const triggerData = inputState.gamepad.triggers[trigger];
  
  const rawValue = useMotionValue(triggerData.value);
  
  // Spring config for triggers - softer feel (lower stiffness)
  const springConfig = { stiffness: 100, damping: 25 };
  const animatedValue = useSpring(rawValue, springConfig);
  
  useEffect(() => {
    rawValue.set(triggerData.value);
  }, [triggerData.value, rawValue]);
  
  return animatedValue;
}

/**
 * Hook to subscribe to a specific button's pressed state.
 */
export function useButton(keryoButton: KeryoButton) {
  const { inputState } = useGamepadContext();
  const pressed = inputState.gamepad.buttons[keryoButton] ?? false;
  return pressed;
}

export { GamepadContext };
