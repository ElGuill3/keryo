import { motion, useSpring, useTransform } from 'framer-motion';
import { useStick } from './GamepadContext';

export interface StickSkinProps {
  stick: 'leftStick' | 'rightStick';
  /** Size in pixels for the stick base (diameter) */
  size?: number;
  /** CSS class for the base circle */
  baseClassName?: string;
  /** CSS class for the knob/dot */
  knobClassName?: string;
}

/**
 * StickSkin - Animated joystick visualizer.
 * Uses Framer Motion useSpring for smooth physics-based animation.
 *
 * Spring config: stiffness 500, damping 45 for critically damped response
 * without oscillation or bounce.
 */
export function StickSkin({
  stick,
  size = 96,
  baseClassName = 'bg-gray-700 rounded-full border-2 border-gray-600',
  knobClassName = 'bg-blue-500 rounded-full',
}: StickSkinProps) {
  const { x: xMotion, y: yMotion } = useStick(stick);

  // Knob size matches DebugPage (24px)
  const knobSize = 24;
  const centerOffset = (size - knobSize) / 2;

  // Create springs that follow the motion values with tuned parameters
  // Critically damped: responsive without oscillation or bounce
  const springConfig = { stiffness: 500, damping: 45 };
  const springX = useSpring(xMotion, springConfig);
  const springY = useSpring(yMotion, springConfig);

  // Transform spring values (-1 to 1) to pixel offset
  // The maximum offset is centerOffset (so knob stays within bounds at ±1)
  const pixelOffsetX = useTransform(springX, [-1, 1], [-centerOffset, centerOffset]);
  const pixelOffsetY = useTransform(springY, [-1, 1], [-centerOffset, centerOffset]);

  return (
    <div className="flex flex-col items-center">
      <span className="text-sm mb-2">{stick === 'leftStick' ? 'Left' : 'Right'}</span>
      <div
        className={`relative ${baseClassName}`}
        style={{ width: size, height: size }}
      >
        {/* The animated knob - uses motion.div with MotionValue transforms */}
        <motion.div
          className={`absolute ${knobClassName}`}
          style={{
            width: knobSize,
            height: knobSize,
            // Use motion values for x/y transforms - Framer Motion handles the animation
            x: pixelOffsetX,
            y: pixelOffsetY,
            // Offset by center so knob is centered when stick is at (0,0)
            marginLeft: centerOffset,
            marginTop: centerOffset,
          }}
        />
      </div>
    </div>
  );
}
