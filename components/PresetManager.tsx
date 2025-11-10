import React, { useState, useEffect } from 'react';
import { Settings } from '../types';

interface PresetManagerProps {
  currentSettings: Settings;
  onPresetApply: (settings: Settings) => void;
}

const PresetManager: React.FC<PresetManagerProps> = ({ currentSettings, onPresetApply }) => {
  const [presets, setPresets] = useState<{ [key: string]: Settings }>({});
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    try {
      const storedPresets = localStorage.getItem('slideGeneratorPresets');
      if (storedPresets) {
        setPresets(JSON.parse(storedPresets));
      }
    } catch (e) {
      console.error("Failed to load presets from localStorage", e);
    }
  }, []);

  const showStatus = (message: string) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleSave = () => {
    const name = prompt('프리셋 이름을 입력하세요 (최대 4개까지):');
    if (name && name.trim()) {
      if (Object.keys(presets).length >= 4 && !presets[name]) {
        alert('프리셋은 최대 4개까지만 저장할 수 있습니다. 기존 프리셋을 덮어쓰거나 삭제해주세요.');
        return;
      }
      const newPresets = { ...presets, [name.trim()]: currentSettings };
      setPresets(newPresets);
      localStorage.setItem('slideGeneratorPresets', JSON.stringify(newPresets));
      showStatus(`✅ 프리셋 '${name.trim()}'을(를) 저장했습니다.`);
      setSelectedPreset(name.trim());
    }
  };

  const handleDelete = () => {
    if (selectedPreset && presets[selectedPreset]) {
      if (confirm(`프리셋 '${selectedPreset}'을(를) 삭제하시겠습니까?`)) {
        const newPresets = { ...presets };
        delete newPresets[selectedPreset];
        setPresets(newPresets);
        localStorage.setItem('slideGeneratorPresets', JSON.stringify(newPresets));
        showStatus(`🗑️ 프리셋 '${selectedPreset}'을(를) 삭제했습니다.`);
        setSelectedPreset('');
      }
    }
  };

  useEffect(() => {
    if (selectedPreset && presets[selectedPreset]) {
      onPresetApply(presets[selectedPreset]);
      showStatus(`🎨 프리셋 '${selectedPreset}'을(를) 적용했습니다.`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPreset]);

  return (
    <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
      <label htmlFor="presetSelect" className="block text-sm font-semibold mb-2 text-gray-700">저장된 프리셋</label>
      <div className="flex items-center gap-2">
        <select
          id="presetSelect"
          value={selectedPreset}
          onChange={(e) => setSelectedPreset(e.target.value)}
          className="flex-grow w-full text-sm p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="">프리셋 선택...</option>
          {Object.keys(presets).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <button onClick={handleSave} className="px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition">저장</button>
        <button onClick={handleDelete} disabled={!selectedPreset} className="px-3 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400">삭제</button>
      </div>
      {statusMessage && <p className="text-xs text-green-700 mt-2">{statusMessage}</p>}
    </div>
  );
};

export default PresetManager;