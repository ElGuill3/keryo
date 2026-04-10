import { motion, useSpring, useTransform } from 'framer-motion';
import { useTrigger } from './GamepadContext';

export interface TriggerSkinProps {
  trigger: 'l2' | 'r2';
  /** Size in pixels for the trigger track (height for vertical layout) */
  size?: number;
  /** CSS class for the trigger track */
  trackClassName?: string;
  /** CSS class for the trigger thumb/fill */
  thumbClassName?: string;
}

/**
 * TriggerSkin - Animated analog trigger visualizer.
 * Uses Framer Motion useSpring for smooth physics-based animation.
 * 
 * Spring config: stiffness 100, damping 25 for heavier, more realistic trigger feel.
 */
export function TriggerSkin({
  trigger,
  size = 120,
  trackClassName = 'bg-gray-700 rounded-full',
  thumbClassName = 'bg-yellow-500 rounded-full',
}: TriggerSkinProps) {
  const animatedDepth = useTrigger(trigger);

  // Create spring with critically damped config for instant response without bounce
  const springDepth = useSpring(animatedDepth, { stiffness: 400, damping: 40 });

  // Transform 0-1 value to percentage height
  const heightPercent = useTransform(springDepth, [0, 1], ['0%', '100%']);

  return (
    <div className="flex flex-col items-center">
      <span className="text-sm mb-2">{trigger.toUpperCase()}</span>
      <div
        className={`relative ${trackClassName}`}
        style={{ width: 24, height: size }}
      >
        {/* Trigger fill - animates from bottom to top based on depth */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 ${thumbClassName}`}
          style={{
            height: heightPercent,
          }}
        />
      </div>
    </div>
  );
}
