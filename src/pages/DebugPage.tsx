import { useState, useEffect, useRef } from 'react';
import { useInput } from '../hooks/useInput';

const STICK_PIXEL_FACTOR = 36; // Must equal (STICK_CONTAINER_SIZE - STICK_DOT_SIZE) / 2 for 1:1 mapping
const STICK_CONTAINER_SIZE = 96; // px
const STICK_DOT_SIZE = 24; // px
const STICK_CENTER_OFFSET = (STICK_CONTAINER_SIZE - STICK_DOT_SIZE) / 2; // 36px
const STICK_SMOOTH_FACTOR = 0.3; // Interpolation factor (0 = instant, 1 = never updates)

interface StickPosition {
  x: number;
  y: number;
}

export default function DebugPage() {
  const { inputState } = useInput();
  const [keyHistory, setKeyHistory] = useState<string[]>([]);

  // Smoothed stick values for visual interpolation (does not affect actual input)
  const smoothLeftStick = useRef<StickPosition>({ x: 0, y: 0 });
  const smoothRightStick = useRef<StickPosition>({ x: 0, y: 0 });

  const { gamepad } = inputState;

  // Interpolate stick positions for smooth visual feedback
  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    smoothLeftStick.current = {
      x: lerp(smoothLeftStick.current.x, gamepad.leftStick.x, STICK_SMOOTH_FACTOR),
      y: lerp(smoothLeftStick.current.y, gamepad.leftStick.y, STICK_SMOOTH_FACTOR),
    };
    smoothRightStick.current = {
      x: lerp(smoothRightStick.current.x, gamepad.rightStick.x, STICK_SMOOTH_FACTOR),
      y: lerp(smoothRightStick.current.y, gamepad.rightStick.y, STICK_SMOOTH_FACTOR),
    };
  }, [gamepad.leftStick.x, gamepad.leftStick.y, gamepad.rightStick.x, gamepad.rightStick.y]);

  // Track keyboard history
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      setKeyHistory((prev) => {
        const next = [e.key, ...prev];
        return next.slice(0, 10);
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Keryo — Debug Input View</h1>

      {/* Main grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Raw JSON section */}
        <section className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-green-400">Gamepad State (JSON)</h2>
          <pre className="text-sm text-gray-300 overflow-auto max-h-96">
            {JSON.stringify(gamepad, null, 2)}
          </pre>
        </section>

        {/* Visualizations section */}
        <section className="space-y-6">
          {/* Triggers */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3 text-yellow-400">Triggers</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>L2</span>
                  <span>{Math.round(gamepad.triggers.l2.value * 100)}%</span>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 transition-all duration-75"
                    style={{ width: `${gamepad.triggers.l2.value * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>R2</span>
                  <span>{Math.round(gamepad.triggers.r2.value * 100)}%</span>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 transition-all duration-75"
                    style={{ width: `${gamepad.triggers.r2.value * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sticks */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3 text-blue-400">Sticks</h2>
            <div className="flex gap-8">
              {/* Left Stick */}
              <div className="flex flex-col items-center">
                <span className="text-sm mb-2">Left</span>
                <div className="relative w-24 h-24 bg-gray-700 rounded-full border-2 border-gray-600">
                  <div
                    className="absolute w-6 h-6 bg-blue-500 rounded-full"
                    style={{
                      left: `calc(${STICK_CENTER_OFFSET}px + ${smoothLeftStick.current.x * STICK_PIXEL_FACTOR}px)`,
                      top: `calc(${STICK_CENTER_OFFSET}px + ${smoothLeftStick.current.y * STICK_PIXEL_FACTOR}px)`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  x: {gamepad.leftStick.x.toFixed(2)}, y: {gamepad.leftStick.y.toFixed(2)}
                </div>
              </div>

              {/* Right Stick */}
              <div className="flex flex-col items-center">
                <span className="text-sm mb-2">Right</span>
                <div className="relative w-24 h-24 bg-gray-700 rounded-full border-2 border-gray-600">
                  <div
                    className="absolute w-6 h-6 bg-blue-500 rounded-full"
                    style={{
                      left: `calc(${STICK_CENTER_OFFSET}px + ${smoothRightStick.current.x * STICK_PIXEL_FACTOR}px)`,
                      top: `calc(${STICK_CENTER_OFFSET}px + ${smoothRightStick.current.y * STICK_PIXEL_FACTOR}px)`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  x: {gamepad.rightStick.x.toFixed(2)}, y: {gamepad.rightStick.y.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3 text-purple-400">Buttons</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(gamepad.buttons).map(([button, pressed]) => (
                <span
                  key={button}
                  className={`px-2 py-1 rounded text-sm font-mono ${
                    pressed ? 'bg-purple-600' : 'bg-gray-700'
                  }`}
                >
                  {button}
                </span>
              ))}
              {Object.keys(gamepad.buttons).length === 0 && (
                <span className="text-gray-500 text-sm">No buttons pressed</span>
              )}
            </div>
          </div>
        </section>

        {/* Keyboard History */}
        <section className="bg-gray-800 rounded-lg p-4 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-3 text-red-400">Keyboard History (Last 10)</h2>
          <div className="flex flex-wrap gap-2">
            {keyHistory.length === 0 ? (
              <span className="text-gray-500 text-sm">Press any key...</span>
            ) : (
              keyHistory.map((key, i) => (
                <span
                  key={`${key}-${i}`}
                  className="px-3 py-1 bg-gray-700 rounded text-sm font-mono text-red-300"
                >
                  {key}
                </span>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Connection status */}
      <div className="mt-6 text-center">
        <span
          className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
            gamepad.connected
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {gamepad.connected ? '🎮 Gamepad Connected' : '❌ No Gamepad'}
        </span>
      </div>
    </div>
  );
}