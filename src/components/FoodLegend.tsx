import React from 'react';
import { Shield, Zap, Flame, Sparkles, Gem } from 'lucide-react';

export const FoodLegend: React.FC = () => {
  return (
    <div className="bg-zinc-950/80 rounded-3xl p-4 sm:p-5 border border-white/5 backdrop-blur-md w-full max-w-md mx-auto shadow-xl">
      <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 text-center">
        Food & Item Encyclopedia
      </h4>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/50 border border-amber-500/20 col-span-2">
          <div className="w-6 h-6 rounded-full bg-amber-500 border border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.6)] flex items-center justify-center shrink-0 font-black text-amber-950 text-xs">
            🪙
          </div>
          <div>
            <span className="font-extrabold text-amber-300 block">Gold Coin</span>
            <span className="text-[10px] text-amber-200/80">+20 pts & +1 Coin | Use coins to buy Shields, 2x Boosts & Revive!</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/50 border border-white/5">
          <div className="w-5 h-5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] shrink-0" />
          <div>
            <span className="font-extrabold text-white block">Apple</span>
            <span className="text-[10px] text-zinc-400">+10 pts | Grows +1</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/50 border border-white/5">
          <div className="w-5 h-5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] shrink-0" />
          <div>
            <span className="font-extrabold text-white block">Golden Berry</span>
            <span className="text-[10px] text-amber-300">+35 pts | Grows +2</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/50 border border-white/5">
          <div className="w-5 h-5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)] flex items-center justify-center shrink-0">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-white block">Mushroom</span>
            <span className="text-[10px] text-purple-300">2x Score Frenzy</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/50 border border-white/5">
          <div className="w-5 h-5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)] flex items-center justify-center shrink-0">
            <Shield className="w-3 h-3 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-white block">Shield Gem</span>
            <span className="text-[10px] text-cyan-300">1x Crash Shield</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/50 border border-white/5">
          <div className="w-5 h-5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)] flex items-center justify-center shrink-0">
            <Gem className="w-3 h-3 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-white block">Diamond</span>
            <span className="text-[10px] text-sky-300">+50 Bonus Pts</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/50 border border-white/5">
          <div className="w-5 h-5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] flex items-center justify-center shrink-0">
            <Flame className="w-3 h-3 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-white block">Chili Pepper</span>
            <span className="text-[10px] text-orange-300">+15 pts | Shrinks -1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
