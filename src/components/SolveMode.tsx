import { useEffect, useRef } from 'react';
import { useCubeStore } from '../store/useCubeStore';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Cube3D } from './Cube3D';

const MOVE_DESCRIPTIONS: Record<string, string> = {
  U: 'Rotate Top face clockwise',
  "U'": 'Rotate Top face counter-clockwise',
  U2: 'Rotate Top face 180°',
  D: 'Rotate Bottom face clockwise',
  "D'": 'Rotate Bottom face counter-clockwise',
  D2: 'Rotate Bottom face 180°',
  R: 'Rotate Right face clockwise',
  "R'": 'Rotate Right face counter-clockwise',
  R2: 'Rotate Right face 180°',
  L: 'Rotate Left face clockwise',
  "L'": 'Rotate Left face counter-clockwise',
  L2: 'Rotate Left face 180°',
  F: 'Rotate Front face clockwise',
  "F'": 'Rotate Front face counter-clockwise',
  F2: 'Rotate Front face 180°',
  B: 'Rotate Back face clockwise',
  "B'": 'Rotate Back face counter-clockwise',
  B2: 'Rotate Back face 180°',
};

export function SolveMode() {
  const { solution, currentStep, isPlaying, setStep, setIsPlaying, reset, nextStep, prevStep } = useCubeStore();
  const playIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = window.setInterval(() => {
        const { currentStep, solution } = useCubeStore.getState();
        if (currentStep < solution.length) {
          useCubeStore.getState().nextStep();
        } else {
          setIsPlaying(false);
        }
      }, 800); // 800ms per move
    } else {
      if (playIntervalRef.current !== null) {
        clearInterval(playIntervalRef.current);
      }
    }
    return () => {
      if (playIntervalRef.current !== null) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, setIsPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full h-full bg-[#09090b]">
      {/* 3D View Area */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <button
          onClick={reset}
          className="absolute top-6 left-6 z-10 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white p-3 rounded-2xl flex items-center gap-2 backdrop-blur-md transition-all duration-300 border border-white/5 hover:border-white/20 shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline text-sm font-bold uppercase tracking-wider">Edit Cube</span>
        </button>

        <div className="flex-1 relative cursor-grab active:cursor-grabbing">
           <Cube3D />
        </div>

        {/* Playback Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900/80 backdrop-blur-xl px-8 py-5 rounded-3xl flex items-center gap-8 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(217,70,239,0.1)]">
          <button onClick={() => { setIsPlaying(false); setStep(0); }} className="text-zinc-500 hover:text-white transition-colors hover:rotate-[-180deg] duration-500" title="Restart">
            <RotateCcw className="w-6 h-6" />
          </button>
          
          <button onClick={() => { setIsPlaying(false); prevStep(); }} disabled={currentStep === 0} className="text-zinc-300 hover:text-fuchsia-400 disabled:opacity-30 transition-colors">
            <SkipBack className="w-7 h-7" />
          </button>
          
          <button
            onClick={togglePlay}
            disabled={currentStep >= solution.length}
            className="w-16 h-16 bg-gradient-to-br from-fuchsia-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400 text-white rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-[0_0_25px_rgba(217,70,239,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)]"
          >
            {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
          </button>
          
          <button onClick={() => { setIsPlaying(false); nextStep(); }} disabled={currentStep >= solution.length} className="text-zinc-300 hover:text-cyan-400 disabled:opacity-30 transition-colors">
            <SkipForward className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Solution Steps Sidebar */}
      <div className="w-full md:w-96 bg-zinc-950/80 backdrop-blur-lg border-l border-white/5 flex flex-col h-64 md:h-full shrink-0 shadow-2xl relative z-10">
        <div className="p-6 border-b border-white/5 bg-black/20">
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 uppercase tracking-widest">Sequence</h2>
          <p className="text-cyan-400 text-sm font-bold mt-1 tracking-wider">{solution.length} MOVES TOTAL</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {solution.length === 0 ? (
             <div className="flex flex-col items-center justify-center text-center text-zinc-400 mt-12 gap-3 p-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                <span className="font-bold text-white text-lg">Cube is Already Solved!</span>
                <p className="text-xs text-zinc-500 max-w-xs">All faces are in their solved positions. No moves are required.</p>
             </div>
          ) : (
            solution.map((move, idx) => (
              <div
                key={idx}
                className={`px-5 py-3.5 rounded-2xl flex items-center justify-between transition-all duration-300 ${
                  idx === currentStep - 1 
                    ? 'bg-fuchsia-500/20 border border-fuchsia-500/50 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.15)] scale-[1.02]' 
                    : idx < currentStep
                    ? 'bg-zinc-900/50 text-zinc-600 border border-transparent'
                    : 'bg-zinc-900 text-zinc-300 border border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black opacity-30 w-5 tracking-widest">{String(idx + 1).padStart(2, '0')}</span>
                  <div className="flex flex-col">
                    <span className="font-black text-xl tracking-tight">{move}</span>
                    <span className="text-[11px] text-zinc-400 font-medium">{MOVE_DESCRIPTIONS[move] || 'Rotate face'}</span>
                  </div>
                </div>
                {idx === currentStep - 1 && <span className="text-[10px] uppercase tracking-[0.2em] font-black text-fuchsia-400 animate-pulse">Active</span>}
                {idx < currentStep - 1 && <CheckIcon className="w-5 h-5 text-cyan-500/50" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function CheckIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

