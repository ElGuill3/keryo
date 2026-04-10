import { useState, useEffect } from 'react';
import { useInput } from '../hooks/useInput';
import { GamepadSkin } from '../components/GamepadSkin';

export default function DebugPage() {
  const { inputState } = useInput();
  const [keyHistory, setKeyHistory] = useState<string[]>([]);

  const { gamepad } = inputState;

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
    <GamepadSkin inputState={inputState}>
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
            {/* Triggers - using TriggerSkin */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3 text-yellow-400">Triggers</h2>
              <div className="flex justify-center gap-12">
                <GamepadSkin.TriggerL2
                  trigger="l2"
                  size={120}
                  trackClassName="bg-gray-700 rounded-full"
                  thumbClassName="bg-yellow-500 rounded-full"
                />
                <GamepadSkin.TriggerR2
                  trigger="r2"
                  size={120}
                  trackClassName="bg-gray-700 rounded-full"
                  thumbClassName="bg-yellow-500 rounded-full"
                />
              </div>
              <div className="flex justify-center gap-8 mt-2 text-xs text-gray-400">
                <span>L2: {Math.round(gamepad.triggers.l2.value * 100)}%</span>
                <span>R2: {Math.round(gamepad.triggers.r2.value * 100)}%</span>
              </div>
            </div>

            {/* Sticks - using StickSkin */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3 text-blue-400">Sticks</h2>
              <div className="flex justify-center gap-8">
                <GamepadSkin.LeftStick
                  stick="leftStick"
                  size={96}
                  baseClassName="bg-gray-700 rounded-full border-2 border-gray-600"
                  knobClassName="bg-blue-500 rounded-full"
                />
                <GamepadSkin.RightStick
                  stick="rightStick"
                  size={96}
                  baseClassName="bg-gray-700 rounded-full border-2 border-gray-600"
                  knobClassName="bg-blue-500 rounded-full"
                />
              </div>
              <div className="flex justify-center gap-8 mt-2 text-xs text-gray-400">
                <span>L: x={gamepad.leftStick.x.toFixed(2)} y={gamepad.leftStick.y.toFixed(2)}</span>
                <span>R: x={gamepad.rightStick.x.toFixed(2)} y={gamepad.rightStick.y.toFixed(2)}</span>
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
    </GamepadSkin>
  );
}
