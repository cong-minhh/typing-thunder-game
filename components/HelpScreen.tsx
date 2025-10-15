import React from 'react';

interface HelpScreenProps {
    onBack: () => void;
}

const HelpSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-3xl font-bold text-cyan-300 mb-2" style={{ textShadow: '0 0 8px #0ff' }}>{title}</h3>
        <div className="text-slate-300 space-y-2 text-lg">{children}</div>
    </div>
);

const Hotkey: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="text-base mx-1 bg-slate-700 text-cyan-300 border border-cyan-500 rounded-md px-2 py-0.5 font-mono">{children}</span>
);

const HelpScreen: React.FC<HelpScreenProps> = ({ onBack }) => {
    return (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center z-30 p-4 sm:p-8">
            <div className="w-full max-w-4xl bg-slate-800/60 p-6 sm:p-8 rounded-lg border border-cyan-500/30 max-h-[90vh] overflow-y-auto">
                <h2 className="text-5xl font-extrabold mb-6 text-center text-cyan-300">How to Play</h2>
                
                <HelpSection title="The Basics">
                    <p>Words will fall from the top of the screen. Your goal is to type them correctly before they reach the bottom.</p>
                    <p>If a word hits the bottom, you will lose one life. The game ends when you run out of lives.</p>
                </HelpSection>

                <HelpSection title="Scoring & Combos">
                    <p>You earn points for each character in a completed word.</p>
                    <p>Successfully typing words in a row builds your <span className="font-bold text-yellow-400">COMBO</span>, which grants a score multiplier.</p>
                    <p>Typing words quickly after one another grants a <span className="font-bold text-fuchsia-400">TIMING BONUS</span>. Watch the Flow Bar at the bottom for a visual guide!</p>
                </HelpSection>

                <HelpSection title="Power-Ups">
                    <p>Complete words to fill the power-up meters on the right. When a meter is full, you can activate its power-up by pressing the corresponding key.</p>
                    <p><strong>Slow Time</strong> (<Hotkey>1</Hotkey>): Temporarily slows down the falling speed of all words and the boss timer.</p>
                    <p><strong>Screen Wipe</strong> (<Hotkey>2</Hotkey>): Instantly destroys all normal falling words on the screen.</p>
                    <p><strong>Shield</strong> (<Hotkey>3</Hotkey>): Protects you from the next word you miss, saving your life and combo.</p>
                    <p><strong>Score Boost</strong> (<Hotkey>4</Hotkey>): Doubles all points you earn for a short duration.</p>
                    <p className="mt-4">You can also find power-ups by typing special <span className="rainbow-text font-bold">rainbow-colored words</span> that randomly appear!</p>
                </HelpSection>
                
                <HelpSection title="Game Flow">
                    <p>After clearing a certain number of words in a level, special phases will begin.</p>
                    <p><strong>Waves:</strong> You'll get a <span className="font-bold text-red-500">WAVE INCOMING</span> warning.
                        <ul className="list-disc list-inside ml-4">
                            <li><span className="font-semibold text-yellow-400">Acceleration:</span> Words will start falling faster and faster.</li>
                            <li><span className="font-semibold text-blue-400">Deluge:</span> A large number of slower words will flood the screen. Survive the onslaught!</li>
                        </ul>
                    </p>
                    <p><strong>Boss Fights:</strong> After the wave, a BOSS appears.
                         <ul className="list-disc list-inside ml-4">
                            <li>A single, powerful word will appear in the center. Type it to damage the boss.</li>
                            <li>The boss has a health bar and a timer. Defeat it before time runs out!</li>
                            <li>Smaller "distraction" words will continue to fall. You can type these as well to keep your combo up and avoid losing lives.</li>
                        </ul>
                    </p>
                </HelpSection>

                 <HelpSection title="Controls">
                    <p><strong>Type:</strong> Use your keyboard to type the words.</p>
                    <p><strong>Pause:</strong> Press the <Hotkey>Escape</Hotkey> key to pause and resume the game.</p>
                </HelpSection>
            </div>

            <div className="mt-8">
                <button
                    onClick={onBack}
                    className="px-10 py-4 bg-cyan-500 text-slate-900 font-bold text-2xl rounded-lg shadow-lg hover:bg-cyan-400 hover:scale-105 transition-transform duration-300"
                >
                    Back to Menu
                </button>
            </div>
        </div>
    );
};

export default HelpScreen;