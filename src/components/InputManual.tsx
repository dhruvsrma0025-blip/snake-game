import { useState, useMemo } from 'react';
import { useCubeStore } from '../store/useCubeStore';
import { COLORS } from '../utils/cube';
import { Shuffle, RotateCcw } from 'lucide-react';

const FACE_OFFSETS: Record<string, number> = {
  U: 0, R: 9, F: 18, D: 27, L: 36, B: 45
};

const FACE_LABELS: Record<string, string> = {
  U: 'White (Up)',
  R: 'Red (Right)',
  F: 'Green (Front)',
  D: 'Yellow (Down)',
  L: 'Orange (Left)',
  B: 'Blue (Back)',
};

export function InputManual() {
  const { cubeString, updateFaceColor, scrambleCube, resetToSolved } = useCubeStore();
  const [selectedColor, setSelectedColor] = useState('U'); // 'U' maps to White

  const handleStickerClick = (faceCode: string, localIndex: number) => {
    // Cannot change centers! Centers define the faces.
    if (localIndex === 4) return; 
    
    const offset = FACE_OFFSETS[faceCode];
    updateFaceColor(offset + localIndex, selectedColor);
  };

  // Calculate current sticker counts
  const counts = useMemo(() => {
    const map: Record<string, number> = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 };
    for (const ch of cubeString) {
      if (map[ch] !== undefined) map[ch]++;
    }
    return map;
  }, [cubeString]);

  const renderFace = (faceCode: string) => {
    const offset = FACE_OFFSETS[faceCode];
    const faceColors = cubeString.slice(offset, offset + 9).split('');

    return (
      <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1.5 rounded-xl border border-white/10 w-24 h-24 sm:w-32 sm:h-32 shadow-lg shadow-black/50">
        {faceColors.map((colorCode, idx) => (
          <button
            key={idx}
            onClick={() => handleStickerClick(faceCode, idx)}
            className="w-full h-full rounded-md border border-white/10 hover:brightness-125 transition-all disabled:brightness-100 disabled:cursor-not-allowed shadow-inner"
            style={{ backgroundColor: COLORS[colorCode as keyof typeof COLORS] }}
            disabled={idx === 4} // Disable centers
          >
            {idx === 4 && <span className="text-black/50 font-black text-xs pointer-events-none drop-shadow-sm">{faceCode}</span>}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      {/* Quick Scramble / Reset Controls */}
      <div className="flex flex-wrap items-center justify-between w-full gap-3 bg-zinc-950/60 p-3 px-5 rounded-2xl border border-white/5">
        <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
          Quick Setup:
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={scrambleCube}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-300 text-xs font-bold border border-fuchsia-500/30 transition-all active:scale-95 shadow-sm"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Random Scramble
          </button>
          <button
            onClick={resetToSolved}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold border border-white/5 transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Solved
          </button>
        </div>
      </div>

      <div className="text-center text-zinc-400 text-sm font-medium">
        <p>1. Select a color from the palette below.</p>
        <p>2. Click on the grid to paint the cube faces.</p>
        <p className="mt-1 text-fuchsia-400/80 italic text-xs tracking-wider uppercase font-bold">Note: Center pieces define face colors and cannot be changed.</p>
      </div>

      {/* Palette */}
      <div className="flex flex-wrap justify-center gap-4 bg-zinc-950/80 p-4 rounded-3xl border border-white/5 w-full shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-sm">
        {Object.entries(COLORS).filter(([k]) => k !== 'BLANK').map(([code, hex]) => (
          <div key={code} className="flex flex-col items-center gap-1">
            <button
              onClick={() => setSelectedColor(code)}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 transition-all duration-300 relative ${
                selectedColor === code ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: hex }}
              title={FACE_LABELS[code]}
            />
            <span className={`text-[10px] font-bold ${counts[code] === 9 ? 'text-emerald-400' : counts[code] > 9 ? 'text-rose-400 font-extrabold' : 'text-zinc-400'}`}>
              {counts[code]}/9
            </span>
          </div>
        ))}
      </div>

      {/* Cube Net */}
      <div className="flex justify-center w-full overflow-x-auto pb-4">
        <div className="grid grid-cols-4 grid-rows-3 gap-2 sm:gap-4 select-none">
          {/* Row 1 */}
          <div className="col-start-2">{renderFace('U')}</div>
          
          {/* Row 2 */}
          <div className="col-start-1">{renderFace('L')}</div>
          <div className="col-start-2">{renderFace('F')}</div>
          <div className="col-start-3">{renderFace('R')}</div>
          <div className="col-start-4">{renderFace('B')}</div>
          
          {/* Row 3 */}
          <div className="col-start-2">{renderFace('D')}</div>
        </div>
      </div>
    </div>
  );
}

