import React from 'react';
import { useSnakeStore } from '../store/useSnakeStore';
import { RotateCcw, Skull } from 'lucide-react';

export const GameOverModal: React.FC = () => {
  const {
    isGameOver,
    score,
    highScore,
    snake,
    resetGame,
  } = useSnakeStore();

  if (!isGameOver) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-zinc-950 border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full blur-3xl pointer-events-none bg-rose-500/20" />

        {/* Icon Header */}
        <div className="mb-3">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.5)]">
            <Skull className="w-8 h-8 text-zinc-950" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
          Game Over
        </h3>
        
        <p className="text-xs text-zinc-400 font-medium mb-6">
          You collided with the wall or yourself!
        </p>

        {/* Score Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full mb-6">
          <div className="bg-zinc-900/80 p-3 rounded-2xl border border-white/5 flex flex-col items-center">
            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Final Score</span>
            <span className="text-2xl font-black text-amber-400 mt-1">{score}</span>
          </div>

          <div className="bg-zinc-900/80 p-3 rounded-2xl border border-white/5 flex flex-col items-center">
            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Best Score</span>
            <span className="text-2xl font-black text-emerald-400 mt-1">{highScore}</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 p-2.5 w-full rounded-xl border border-white/5 flex items-center justify-center gap-2 mb-6 text-xs text-zinc-400">
          <span>Snake Length:</span>
          <span className="font-bold text-cyan-400">{snake.length}</span>
        </div>

        {/* Actions */}
        <div className="flex w-full">
          <button
            onClick={resetGame}
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};
