import React from 'react';
import { useSnakeStore } from './store/useSnakeStore';
import { SnakeCanvas } from './components/SnakeCanvas';
import { Controls } from './components/Controls';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { Trophy, Settings, ArrowRight } from 'lucide-react';
import { Logo } from './components/Logo';

export default function App() {
  const {
    score,
    highScore,
    toggleSettings,
    isStarted,
    isGameOver,
    startGame,
    customBg,
  } = useSnakeStore();

  // HOME SCREEN (Not Started)
  if (!isStarted && !isGameOver) {
    return (
      <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#07070a] text-zinc-100 font-sans flex flex-col overflow-y-auto overflow-x-hidden relative select-none">
        
        {/* Full-Screen Background Photo */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
          <img
            src={customBg || "/snake-bg.svg"}
            alt="Snake Game Background Photo"
            className="w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.12]"
            referrerPolicy="no-referrer"
          />
          {/* Subtle Dark Gradient Overlay for optimal text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/40 to-black/85" />
          <div className="absolute inset-0 backdrop-blur-[0.5px]" />
        </div>

        {/* Content Layer - Positioned directly on top of the background photo */}
        <div className="min-h-[100dvh] flex flex-col justify-between items-center p-4 sm:p-6 pb-10 relative z-10">
          
          {/* Top spacer / header */}
          <div className="w-full flex justify-end max-w-sm pt-2">
            <button
              onClick={toggleSettings}
              className="p-2.5 rounded-2xl bg-black/50 hover:bg-zinc-900 border border-white/15 text-zinc-300 hover:text-purple-400 transition-all active:scale-95 shadow-lg backdrop-blur-md"
              title="Open Settings"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Center: Logo, Title, and NEXT Button */}
          <div className="flex-1 flex flex-col items-center justify-center gap-8 z-10 w-full max-w-sm mx-auto my-auto">
            
            {/* Logo & Title - glass backdrop with vivid emerald glow */}
            <div className="flex flex-col items-center gap-3 text-center bg-black/50 backdrop-blur-md px-8 py-6 rounded-3xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.7)] w-full">
              <div className="text-6xl sm:text-7xl drop-shadow-[0_0_25px_rgba(16,185,129,0.8)] animate-bounce-gentle">
                🐍
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] mt-1">
                Snake Game
              </h1>

              {/* High Score Badge */}
              {highScore > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold mt-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Best Score: {highScore}</span>
                </div>
              )}
            </div>

            {/* NEXT Button (Replaces D-Pad on Home Screen) */}
            <button
              onClick={startGame}
              className="w-full py-5 px-8 rounded-3xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-zinc-950 font-black text-2xl uppercase tracking-widest shadow-[0_0_35px_rgba(16,185,129,0.5)] hover:shadow-[0_0_50px_rgba(16,185,129,0.8)] active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/20 group"
            >
              <span>NEXT</span>
              <ArrowRight className="w-8 h-8 stroke-[3] group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>

          {/* Bottom Settings Button */}
          <div className="z-10 flex flex-col items-center w-full">
            <button
              onClick={toggleSettings}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-black/60 hover:bg-zinc-900 border border-white/15 text-zinc-200 hover:text-white transition-all active:scale-95 shadow-xl backdrop-blur-md"
              title="Open Settings"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-purple-400" />
              <span className="font-bold text-sm tracking-wider uppercase">Settings</span>
            </button>
          </div>

        </div>

        <SettingsModal />
      </div>
    );
  }

  // GAME SCREEN (When Started)
  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#07070a] text-zinc-100 font-sans flex flex-col justify-between p-1.5 xs:p-2 sm:p-3 overflow-hidden select-none touch-none relative">
      {/* Top Header Bar */}
      <header className="bg-zinc-950/90 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 shrink-0 shadow-lg flex items-center justify-between relative z-10">
        
        {/* Game Title & Logo */}
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-950 rounded-[0.8rem] flex items-center justify-center border border-white/10 overflow-hidden shrink-0">
             <Logo className="w-full h-full p-1 drop-shadow-md" />
           </div>
           <div className="flex flex-col">
             <h1 className="text-sm sm:text-base font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 uppercase italic leading-none">
                Snake Game
             </h1>
           </div>
        </div>

        {/* Center Score Status */}
        <div className="flex items-center gap-2 sm:gap-3 bg-zinc-900/90 px-2 sm:px-3 py-1.5 rounded-xl border border-white/5 text-[10px] sm:text-xs font-extrabold">
          <div className="flex items-center gap-1 sm:gap-1.5 text-zinc-200">
            <span className="text-emerald-400 hidden xs:inline">Score:</span>
            <span className="font-black text-white text-xs sm:text-[14px]">{score}</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10 mx-0.5 sm:mx-1" />
          <div className="flex items-center gap-1 sm:gap-1.5 text-zinc-200">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 hidden xs:inline">Best:</span>
            <span className="font-black text-white text-xs sm:text-[14px]">{highScore}</span>
          </div>
        </div>

        {/* Settings Button */}
        <button
          onClick={toggleSettings}
          className="p-1.5 sm:p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-purple-400 border border-white/10 shadow transition-all active:scale-95"
          title="Open Settings (Volume, Pause, Replay)"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </header>

      {/* Center Arena: Snake Canvas */}
      <main className="flex-1 min-h-0 flex flex-col items-center justify-center w-full overflow-hidden py-0.5 relative z-10">
        <SnakeCanvas />
      </main>

      {/* Bottom Controls (Touch D-Pad + Quick Settings Button) */}
      <footer className="shrink-0 w-full flex flex-col items-center justify-center pb-2 relative z-10">
        <Controls />
      </footer>

      {/* Modals */}
      <GameOverModal />
      <SettingsModal />
    </div>
  );
}
