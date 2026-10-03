import { useState } from 'react';
import { useCubeStore } from '../store/useCubeStore';
import { Camera, Edit3, Play } from 'lucide-react';
import { InputManual } from './InputManual';
import { InputCamera } from './InputCamera';

export function InputMode() {
  const { inputMethod, setInputMethod, solveCube, error } = useCubeStore();

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 uppercase italic mb-1 tracking-tight">INITIALIZE CUBE</h2>
          <p className="text-zinc-400 text-sm font-medium">Use the camera or select colors manually to input your scrambled cube.</p>
        </div>

        <div className="flex bg-zinc-900/80 p-1.5 rounded-2xl shadow-inner border border-white/10 backdrop-blur-sm">
          <button
            onClick={() => setInputMethod('manual')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
              inputMethod === 'manual' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.2)]' : 'text-zinc-500 hover:text-zinc-300 border border-transparent hover:bg-white/5'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Manual
          </button>
          <button
            onClick={() => setInputMethod('camera')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
              inputMethod === 'camera' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'text-zinc-500 hover:text-zinc-300 border border-transparent hover:bg-white/5'
            }`}
          >
            <Camera className="w-4 h-4" />
            Camera
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[400px] bg-zinc-900/40 border border-white/5 rounded-3xl p-4 md:p-8 flex flex-col items-center shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Decorative corner glows */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />
        
        <div className="relative z-10 w-full flex flex-col items-center h-full">
          {inputMethod === 'manual' ? <InputManual /> : <InputCamera />}
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm font-medium text-center shadow-[0_0_15px_rgba(244,63,94,0.1)]">
          {error}
        </div>
      )}

      <div className="mt-8 flex justify-center pb-8">
        <button
          onClick={solveCube}
          className="group relative flex items-center gap-3 bg-gradient-to-r from-fuchsia-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400 text-white px-10 py-5 rounded-full font-black text-xl uppercase italic tracking-widest transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(217,70,239,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <Play className="w-7 h-7 fill-current relative z-10" />
          <span className="relative z-10">Solve Cube</span>
        </button>
      </div>
    </div>
  );
}
