import { GamepadContextProvider, GamepadTheme } from './GamepadContext';
import { StickSkin } from './StickSkin';
import { TriggerSkin } from './TriggerSkin';
import { ButtonSkin } from './ButtonSkin';

export interface GamepadSkinProps {
  /** The unified input state from useInput() */
  inputState: import('../../lib/inputState').KeryoInputState;
  /** Theme for CSS custom properties */
  theme?: GamepadTheme;
  /** Children components */
  children?: React.ReactNode;
}

/**
 * GamepadSkin - Main container for gamepad skin rendering.
 * 
 * This is the entry point for rendering a gamepad skin. It:
 * 1. Provides GamepadContext to descendants
 * 2. Applies CSS custom properties for theming
 * 3. Renders children with access to the context
 * 
 * @example
 * ```tsx
 * <GamepadSkin inputState={inputState} theme={customTheme}>
 *   <GamepadSkin.LeftStick />
 *   <GamepadSkin.RightStick />
 *   <GamepadSkin.TriggerL2 />
 *   <GamepadSkin.TriggerR2 />
 *   <GamepadSkin.Button keryoButton={KeryoButton.South}>A</GamepadSkin.Button>
 * </GamepadSkin>
 * ```
 */
export function GamepadSkin({
  inputState,
  theme,
  children,
}: GamepadSkinProps) {
  return (
    <GamepadContextProvider inputState={inputState} theme={theme}>
      <div className="relative">
        {children}
      </div>
    </GamepadContextProvider>
  );
}

/**
 * Compound Components - Static aliases for sub-components
 * 
 * These allow declarative usage: <GamepadSkin.LeftStick />
 * instead of importing StickSkin directly.
 */
GamepadSkin.LeftStick = StickSkin;
GamepadSkin.RightStick = StickSkin;
GamepadSkin.TriggerL2 = TriggerSkin;
GamepadSkin.TriggerR2 = TriggerSkin;
GamepadSkin.Button = ButtonSkin;

/**
 * TypeScript declaration for the compound component pattern.
 * This allows TypeScript to understand GamepadSkin.LeftStick etc.
 */
declare module './GamepadSkin' {
  interface GamepadSkin {
    LeftStick: typeof StickSkin;
    RightStick: typeof StickSkin;
    TriggerL2: typeof TriggerSkin;
    TriggerR2: typeof TriggerSkin;
    Button: typeof ButtonSkin;
  }
}

// Re-export sub-components
export { StickSkin, TriggerSkin, ButtonSkin };
export type { StickSkinProps } from './StickSkin';
export type { TriggerSkinProps } from './TriggerSkin';
export type { ButtonSkinProps } from './ButtonSkin';
