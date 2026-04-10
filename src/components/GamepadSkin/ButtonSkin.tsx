import { KeryoButton } from '../../lib/inputState';
import { useGamepadContext, useButton } from './GamepadContext';

export interface ButtonSkinProps {
  keryoButton: KeryoButton;
  /** Button label text */
  children?: React.ReactNode;
  /** Size in pixels (assumes square) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ButtonSkin - Animated button visualizer.
 * Uses CSS custom properties for theming.
 * 
 * The button background color is controlled by --skin-btn-{buttonName} CSS variable.
 * When pressed, the button appears "depressed" with a visual change.
 */
export function ButtonSkin({
  keryoButton,
  children,
  size = 48,
  className = '',
}: ButtonSkinProps) {
  const { theme } = useGamepadContext();
  const pressed = useButton(keryoButton);

  // Map KeryoButton enum to CSS variable name
  const cssVarName = `--skin-btn-${keryoButton}`;
  
  // Get color from theme - use unknown first to allow the type assertion
  const colors = theme?.colors as Record<string, string> | undefined;
  const bgColor = colors?.[keryoButton] || '#6b7280';

  return (
    <div
      className={`flex items-center justify-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: `var(${cssVarName}, ${bgColor})`,
        transform: pressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 0.1s ease-out',
        boxShadow: pressed 
          ? 'inset 0 2px 4px rgba(0,0,0,0.3)' 
          : '0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      {children && (
        <span className="text-xs text-white font-bold">{children}</span>
      )}
    </div>
  );
}
