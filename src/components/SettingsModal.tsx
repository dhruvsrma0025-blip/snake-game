import React, { useState } from 'react';
import { useSnakeStore } from '../store/useSnakeStore';
import { sound } from '../utils/audio';
import {
  X,
  Settings,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Smartphone,
  SmartphoneNfc,
  Image as ImageIcon,
  Upload,
  Music,
  Disc3,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    settingsOpen,
    setSettingsOpen,
    isStarted,
    isGameOver,
    isPaused,
    togglePause,
    resumeGame,
    resetGame,
    soundEnabled,
    toggleSound,
    hapticsEnabled,
    toggleHaptics,
    customBg,
    setCustomBg,
    customAudio,
    customAudioName,
    setCustomAudio,
  } = useSnakeStore();

  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  if (!settingsOpen) return null;

  const handleReplay = () => {
    if (isPreviewPlaying) {
      sound.pauseBGM();
      setIsPreviewPlaying(false);
    }
    resetGame();
    setSettingsOpen(false);
  };

  const handleResume = () => {
    if (isPreviewPlaying) {
      setIsPreviewPlaying(false);
    }
    resumeGame();
    setSettingsOpen(false);
  };

  const handleClose = () => {
    if (isPreviewPlaying) {
      sound.pauseBGM();
      setIsPreviewPlaying(false);
    }
    setSettingsOpen(false);
  };

  const togglePreviewAudio = () => {
    if (isPreviewPlaying) {
      sound.pauseBGM();
      setIsPreviewPlaying(false);
    } else {
      sound.playBGM();
      setIsPreviewPlaying(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 xs:p-4 animate-fade-in select-none">
      <div className="relative w-full max-w-sm bg-zinc-950 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 shrink-0 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/15 border border-purple-500/25 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide text-white uppercase italic">Settings</h2>
              <p className="text-[11px] text-zinc-400">Audio, Controls & Display</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex flex-col gap-3 overflow-y-auto pr-1">
          
          {/* Section: Audio & Music */}
          <div className="flex flex-col gap-2 p-3 rounded-2xl bg-zinc-900/60 border border-white/5">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                Music & Audio
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold">
                बैकग्राउंड म्यूज़िक
              </span>
            </div>

            {/* 1. VOLUME / SOUND MASTER TOGGLE */}
            <button
              onClick={toggleSound}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                soundEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                  : 'bg-zinc-900/80 border-white/5 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${soundEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-white">Sound / Volume</div>
                  <div className="text-[11px] text-zinc-400">गेम साउंड व म्यूज़िक ON / OFF</div>
                </div>
              </div>
              <span className={`text-xs font-black px-3 py-1 rounded-full ${soundEnabled ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800 text-zinc-400'}`}>
                {soundEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* 2. BGM TRACK CARD (Haye Mera Dil + Custom Sound Upload) */}
            <div className="p-3.5 rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-zinc-900/90 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/30">
                    <Disc3 className={`w-5 h-5 ${isPreviewPlaying ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm text-white leading-tight">
                      {customAudioName ? customAudioName : 'Haye Mera Dil (हाए मेरा दिल)'}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {customAudioName ? 'कस्टम ऑडियो ट्रैक' : 'Yo Yo Honey Singh & Alfaaz'}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${customAudio ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
                  {customAudio ? 'CUSTOM' : 'ACTIVE'}
                </span>
              </div>

              {/* Action Buttons: Preview Song & Upload Audio */}
              <div className="flex items-center gap-2 mt-1">
                {/* Preview Play/Stop button */}
                <button
                  onClick={togglePreviewAudio}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow border ${
                    isPreviewPlaying
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-zinc-800 hover:bg-zinc-700 border-white/10 text-zinc-200'
                  }`}
                  title="Test Sound"
                >
                  {isPreviewPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPreviewPlaying ? 'Stop' : 'Play'}</span>
                </button>

                {/* File Uploader for Custom Sound/Song */}
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow border border-white/20">
                  <Upload className="w-3.5 h-3.5" />
                  <span>नया गाना / साउंड जोड़ें</span>
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (typeof event.target?.result === 'string') {
                            setCustomAudio(event.target.result, file.name);
                            if (isPreviewPlaying) {
                              sound.playBGM();
                            }
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                {/* Reset Custom Audio Button */}
                {customAudio && (
                  <button
                    onClick={() => {
                      setCustomAudio(null, null);
                      if (isPreviewPlaying) {
                        sound.playBGM();
                      }
                    }}
                    className="flex items-center gap-1 py-2.5 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 border border-white/10"
                    title="Default 'Haye Mera Dil' par reset karein"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section: Game Controls (Pause & Replay) */}
          <div className="flex flex-col gap-2 p-3 rounded-2xl bg-zinc-900/60 border border-white/5">
            <div className="text-[10px] font-black uppercase tracking-wider text-purple-400 mb-0.5">
              Game Controls
            </div>

            {/* PAUSE / RESUME BUTTON */}
            <button
              onClick={togglePause}
              disabled={!isStarted || isGameOver}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                !isStarted || isGameOver
                  ? 'bg-zinc-900/40 border-white/5 opacity-50 cursor-not-allowed text-zinc-500'
                  : isPaused
                  ? 'bg-amber-500/10 border-amber-500/40 text-white'
                  : 'bg-zinc-900/80 border-white/5 hover:border-amber-500/30 text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isPaused ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-300'}`}>
                  {isPaused ? <Play className="w-5 h-5 fill-amber-400" /> : <Pause className="w-5 h-5" />}
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-white">
                    {isPaused ? 'Resume Game' : 'Pause Game'}
                  </div>
                  <div className="text-[11px] text-zinc-400">खेल रोकें या जारी रखें</div>
                </div>
              </div>
              <span className={`text-xs font-black px-3 py-1 rounded-full ${isPaused ? 'bg-amber-400 text-zinc-950 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-zinc-800 text-zinc-400'}`}>
                {isPaused ? 'PAUSED' : 'RUNNING'}
              </span>
            </button>

            {/* REPLAY / RESTART BUTTON */}
            <button
              onClick={handleReplay}
              disabled={!isStarted}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                !isStarted
                  ? 'bg-zinc-900/40 border-white/5 opacity-50 cursor-not-allowed text-zinc-500'
                  : 'bg-cyan-500/10 hover:bg-cyan-500/15 border-cyan-500/30 text-white active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-white">Replay Game</div>
                  <div className="text-[11px] text-zinc-400">शुरू से दोबारा खेलें (Score 0)</div>
                </div>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-cyan-500 text-zinc-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                RESTART
              </span>
            </button>
          </div>

          {/* Section: Device & Background Photo */}
          <div className="flex flex-col gap-2 p-3 rounded-2xl bg-zinc-900/60 border border-white/5">
            <div className="text-[10px] font-black uppercase tracking-wider text-purple-400 mb-0.5">
              Device & Background
            </div>

            {/* Vibration Toggle */}
            <button
              onClick={toggleHaptics}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                hapticsEnabled
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-white'
                  : 'bg-zinc-900/80 border-white/5 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${hapticsEnabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  {hapticsEnabled ? <SmartphoneNfc className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-white">Vibration</div>
                  <div className="text-[11px] text-zinc-400">फ़ोन वाइब्रेशन (Haptics)</div>
                </div>
              </div>
              <span className={`text-xs font-black px-3 py-1 rounded-full ${hapticsEnabled ? 'bg-cyan-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                {hapticsEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Home Background Photo Section */}
            <div className="p-3 rounded-2xl border border-white/5 bg-zinc-900/80 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Home Background</div>
                    <div className="text-[11px] text-zinc-400">होम स्क्रीन फोटो</div>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${customBg ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-zinc-800 text-zinc-400'}`}>
                  {customBg ? 'CUSTOM' : 'DEFAULT'}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow">
                  <Upload className="w-4 h-4" />
                  <span>फोटो बदलें</span>
                  <input
                    type="file"
                    accept="image/*,.jfif,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (typeof event.target?.result === 'string') {
                            setCustomBg(event.target.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                {customBg && (
                  <button
                    onClick={() => setCustomBg(null)}
                    className="flex items-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 border border-white/10"
                    title="Default photo reset karein"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-col gap-2 shrink-0">
          {isStarted && !isGameOver ? (
            <button
              onClick={handleResume}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-zinc-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              <span>Resume Game (खेल जारी रखें)</span>
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="w-full py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-sm uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              Back (वापस)
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
