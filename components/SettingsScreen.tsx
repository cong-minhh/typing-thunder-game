import React, { useState } from 'react';
import { GameSettings, Difficulty } from '../types';
import { DIFFICULTY_PRESETS, CUSTOM_SETTINGS_RANGES } from '../constants';

interface SettingsScreenProps {
    initialSettings: GameSettings;
    onStartGame: (settings: GameSettings) => void;
    onBack: () => void;
}

const SettingSlider: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    displayValue?: string;
}> = ({ label, value, min, max, step, onChange, displayValue }) => (
    <div className="mb-6">
        <label className="block text-xl text-slate-300 mb-2">{label}: <span className="font-bold text-cyan-400">{displayValue || value}</span></label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
        />
    </div>
);


const SettingsScreen: React.FC<SettingsScreenProps> = ({ initialSettings, onStartGame, onBack }) => {
    const [settings, setSettings] = useState<GameSettings>(initialSettings);

    const handlePreset = (difficulty: Difficulty) => {
        setSettings(DIFFICULTY_PRESETS[difficulty]);
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            <div className="glass-panel w-full max-w-lg p-8">
                <h2 className="text-5xl font-extrabold mb-6 text-cyan-300 text-center">Custom Game</h2>
                <p className="text-center text-slate-400 mb-4">Load a preset or create your own challenge.</p>
                <div className="flex justify-center gap-4 mb-6">
                    <button onClick={() => handlePreset('Easy')} className="btn btn-green flex-1">Easy</button>
                    <button onClick={() => handlePreset('Medium')} className="btn btn-yellow flex-1">Medium</button>
                    <button onClick={() => handlePreset('Hard')} className="btn btn-red flex-1">Hard</button>
                </div>

                <hr className="border-slate-600/50 my-4" />

                <SettingSlider
                    label="Starting Lives"
                    value={settings.startingLives}
                    min={CUSTOM_SETTINGS_RANGES.lives.min}
                    max={CUSTOM_SETTINGS_RANGES.lives.max}
                    step={CUSTOM_SETTINGS_RANGES.lives.step}
                    onChange={(val) => setSettings(s => ({ ...s, startingLives: val }))}
                />
                <SettingSlider
                    label="Base Fall Speed"
                    value={settings.fallSpeedStart}
                    min={CUSTOM_SETTINGS_RANGES.fallSpeed.min}
                    max={CUSTOM_SETTINGS_RANGES.fallSpeed.max}
                    step={CUSTOM_SETTINGS_RANGES.fallSpeed.step}
                    onChange={(val) => setSettings(s => ({ ...s, fallSpeedStart: val }))}
                    displayValue={settings.fallSpeedStart.toFixed(1)}
                />
                 <SettingSlider
                    label="Base Spawn Rate (ms)"
                    value={settings.spawnRateStart}
                    min={CUSTOM_SETTINGS_RANGES.spawnRate.min}
                    max={CUSTOM_SETTINGS_RANGES.spawnRate.max}
                    step={CUSTOM_SETTINGS_RANGES.spawnRate.step}
                    onChange={(val) => setSettings(s => ({ ...s, spawnRateStart: val }))}
                    displayValue={`${settings.spawnRateStart} ms`}
                />
                
                <hr className="border-slate-600/50 my-6" />

                <div className="flex justify-between items-center my-6">
                    <div>
                        <h3 className="text-xl text-slate-300">Hardcore Mode</h3>
                        <p className="text-sm text-slate-400 font-normal">Break combo on any mistype.</p>
                    </div>
                    <label className="toggle-switch">
                        <input 
                            type="checkbox" 
                            checked={settings.hardcoreMode}
                            onChange={(e) => setSettings(s => ({ ...s, hardcoreMode: e.target.checked }))}
                        />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="flex justify-center gap-6 mt-8">
                    <button
                        onClick={onBack}
                        className="btn btn-slate"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => onStartGame(settings)}
                        className="btn btn-cyan"
                    >
                        Start Game
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;