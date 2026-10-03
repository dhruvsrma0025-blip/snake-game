import React, { useEffect } from 'react';
import { useSnakeStore } from '../store/useSnakeStore';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Settings } from 'lucide-react';
import { Direction } from '../types';

export const Controls: React.FC = () => {
  const {
    setDirection,
    isStarted,
    isGameOver,
    toggleSettings,
  } = useSnakeStore();

  // Listen to Keyboard WASD / Arrow Keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStarted || isGameOver) return;

      let dir: Direction | null = null;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          dir = 'UP';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          dir = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          dir = 'LEFT';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          dir = 'RIGHT';
          break;
      }

      if (dir) {
        e.preventDefault();
        setDirection(dir);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, isGameOver, setDirection]);

  return (
    <div className="flex items-center justify-center gap-4 w-full max-w-sm mx-auto shrink-0 select-none touch-none">
      {/* 4-Way Touch D-Pad */}
      <div className="relative w-28 h-28 xs:w-32 xs:h-32 bg-zinc-950/95 rounded-3xl p-1 border border-white/10 shadow-[0_6px_20px_rgba(0,0,0,0.6)] flex items-center justify-center shrink-0">
        {/* UP */}
        <button
          onTouchStart={(e) => { e.preventDefault(); setDirection('UP'); }}
          onClick={() => setDirection('UP')}
          className="absolute top-1 w-9 h-9 xs:w-10 xs:h-10 bg-zinc-900 hover:bg-emerald-500/20 active:bg-emerald-500/30 text-zinc-200 hover:text-emerald-400 rounded-xl flex items-center justify-center border border-white/10 active:scale-90 transition-transform shadow select-none touch-none"
          aria-label="Move Up"
        >
          <ArrowUp className="w-5 h-5 pointer-events-none" />
        </button>

        {/* DOWN */}
        <button
          onTouchStart={(e) => { e.preventDefault(); setDirection('DOWN'); }}
          onClick={() => setDirection('DOWN')}
          className="absolute bottom-1 w-9 h-9 xs:w-10 xs:h-10 bg-zinc-900 hover:bg-emerald-500/20 active:bg-emerald-500/30 text-zinc-200 hover:text-emerald-400 rounded-xl flex items-center justify-center border border-white/10 active:scale-90 transition-transform shadow select-none touch-none"
          aria-label="Move Down"
        >
          <ArrowDown className="w-5 h-5 pointer-events-none" />
        </button>

        {/* LEFT */}
        <button
          onTouchStart={(e) => { e.preventDefault(); setDirection('LEFT'); }}
          onClick={() => setDirection('LEFT')}
          className="absolute left-1 w-9 h-9 xs:w-10 xs:h-10 bg-zinc-900 hover:bg-emerald-500/20 active:bg-emerald-500/30 text-zinc-200 hover:text-emerald-400 rounded-xl flex items-center justify-center border border-white/10 active:scale-90 transition-transform shadow select-none touch-none"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-5 h-5 pointer-events-none" />
        </button>

        {/* RIGHT */}
        <button
          onTouchStart={(e) => { e.preventDefault(); setDirection('RIGHT'); }}
          onClick={() => setDirection('RIGHT')}
          className="absolute right-1 w-9 h-9 xs:w-10 xs:h-10 bg-zinc-900 hover:bg-emerald-500/20 active:bg-emerald-500/30 text-zinc-200 hover:text-emerald-400 rounded-xl flex items-center justify-center border border-white/10 active:scale-90 transition-transform shadow select-none touch-none"
          aria-label="Move Right"
        >
          <ArrowRight className="w-5 h-5 pointer-events-none" />
        </button>

        {/* Center Indicator */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
        </div>
      </div>

      {/* Settings Button beside D-Pad */}
      <button
        onClick={toggleSettings}
        className="flex flex-col items-center justify-center gap-1.5 p-3 xs:p-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/15 text-zinc-300 hover:text-purple-400 active:scale-95 transition-all shadow-lg shrink-0"
        title="Settings (Volume, Pause, Replay)"
        aria-label="Settings"
      >
        <Settings className="w-6 h-6 text-purple-400" />
        <span className="text-[10px] font-black tracking-wider uppercase text-zinc-400">Settings</span>
      </button>
    </div>
  );
};
