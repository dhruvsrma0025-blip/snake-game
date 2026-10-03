import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useCubeStore } from '../store/useCubeStore';
import { COLORS } from '../utils/cube';
import { RefreshCw, Camera as CameraIcon, Check, ChevronRight } from 'lucide-react';

const FACE_ORDER = ['U', 'F', 'R', 'B', 'L', 'D'];
const FACE_NAMES: Record<string, string> = {
  U: 'Up (White Center)',
  F: 'Front (Green Center)',
  R: 'Right (Red Center)',
  B: 'Back (Blue Center)',
  L: 'Left (Orange Center)',
  D: 'Down (Yellow Center)'
};

const rgbToHsv = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, v };
};

const getClosestColor = (r: number, g: number, b: number) => {
  const { h, s, v } = rgbToHsv(r, g, b);
  if (s < 0.22 && v > 0.35) return 'U'; // White
  if (h >= 80 && h <= 165) return 'F'; // Green
  if (h >= 170 && h <= 260) return 'B'; // Blue
  if (h >= 45 && h <= 80) return 'D'; // Yellow
  if (h >= 15 && h < 45) return 'L'; // Orange
  if (h < 15 || h > 345) return 'R'; // Red
  return 'U';
};

export function InputCamera() {
  const webcamRef = useRef<Webcam>(null);
  const { updateFaceColor } = useCubeStore();
  const [currentFaceIdx, setCurrentFaceIdx] = useState(0);
  const [capturedColors, setCapturedColors] = useState<string[] | null>(null);
  const [selectedStickerIdx, setSelectedStickerIdx] = useState<number | null>(null);

  const currentFace = FACE_ORDER[currentFaceIdx];

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      const boxSize = Math.min(img.width, img.height) * 0.6;
      const startX = (img.width - boxSize) / 2;
      const startY = (img.height - boxSize) / 2;
      const cellSize = boxSize / 3;

      const newColors = [];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (row === 1 && col === 1) {
            newColors.push(currentFace); // Force center to be correct
            continue;
          }
          const sampleX = startX + col * cellSize + cellSize / 2;
          const sampleY = startY + row * cellSize + cellSize / 2;
          const pixel = ctx.getImageData(sampleX, sampleY, 1, 1).data;
          const closest = getClosestColor(pixel[0], pixel[1], pixel[2]);
          newColors.push(closest);
        }
      }
      setCapturedColors(newColors);
      setSelectedStickerIdx(null);
    };
    img.src = imageSrc;
  }, [webcamRef, currentFace]);

  const confirmFace = () => {
    if (!capturedColors) return;
    const offset = ['U', 'R', 'F', 'D', 'L', 'B'].indexOf(currentFace) * 9;
    capturedColors.forEach((colorCode, idx) => {
      updateFaceColor(offset + idx, colorCode);
    });
    setCapturedColors(null);
    setSelectedStickerIdx(null);
    if (currentFaceIdx < FACE_ORDER.length - 1) {
      setCurrentFaceIdx(prev => prev + 1);
    }
  };

  const handleStickerClick = (idx: number) => {
    if (idx === 4) return; // Cannot change center
    setSelectedStickerIdx(idx);
  };

  const updateSelectedStickerColor = (colorCode: string) => {
    if (selectedStickerIdx === null || !capturedColors) return;
    const updated = [...capturedColors];
    updated[selectedStickerIdx] = colorCode;
    setCapturedColors(updated);
  };

  const retry = () => {
    setCapturedColors(null);
    setSelectedStickerIdx(null);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 uppercase tracking-wide">Scan {FACE_NAMES[currentFace]}</h3>
        <p className="text-zinc-400 text-sm mt-1 font-medium">Align the cube face within the grid.</p>
        <div className="flex gap-2 justify-center mt-4">
          {FACE_ORDER.map((f, i) => (
            <div key={f} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentFaceIdx ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] scale-125' : i < currentFaceIdx ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-700'}`} />
          ))}
        </div>
      </div>

      <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-black shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-white/10 ring-1 ring-white/5">
        {!capturedColors ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'environment', aspectRatio: 1 }}
              className="w-full h-full object-cover"
            />
            {/* Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[60%] h-[60%] grid grid-cols-3 grid-rows-3 border-2 border-cyan-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.7),0_0_15px_rgba(6,182,212,0.5)_inset]">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-cyan-500/50 relative flex items-center justify-center">
                    {i === 4 && <div className="w-3 h-3 rounded-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,1)]" />}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-zinc-950 gap-4">
            <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              {selectedStickerIdx !== null ? 'Tap color below to assign' : 'Tap any sticker to adjust color'}
            </div>
            <div className="w-full max-w-[220px] aspect-square grid grid-cols-3 gap-2">
              {capturedColors.map((code, i) => (
                <button 
                  key={i} 
                  onClick={() => handleStickerClick(i)}
                  disabled={i === 4}
                  className={`rounded-xl shadow-inner border transition-all duration-200 relative ${
                    selectedStickerIdx === i 
                      ? 'border-white scale-105 shadow-[0_0_12px_rgba(255,255,255,0.8)] ring-2 ring-cyan-400' 
                      : 'border-white/10 hover:brightness-125'
                  }`}
                  style={{ backgroundColor: COLORS[code as keyof typeof COLORS] }}
                >
                  {i === 4 && <span className="text-black/50 font-black text-xs pointer-events-none drop-shadow-sm">{code}</span>}
                </button>
              ))}
            </div>

            {/* Quick Color Picker */}
            <div className="flex gap-2 mt-1">
              {Object.entries(COLORS).filter(([k]) => k !== 'BLANK').map(([code, hex]) => (
                <button
                  key={code}
                  onClick={() => updateSelectedStickerColor(code)}
                  disabled={selectedStickerIdx === null}
                  className="w-8 h-8 rounded-full border border-white/20 hover:scale-110 disabled:opacity-30 disabled:hover:scale-100 transition-all shadow-sm"
                  style={{ backgroundColor: hex }}
                  title={code}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4 w-full">
        {!capturedColors ? (
          <button
            onClick={capture}
            className="group flex-1 bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 text-white py-4 rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transform hover:scale-105 active:scale-95"
          >
            <CameraIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Capture Face
          </button>
        ) : (
          <>
            <button
              onClick={retry}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-2xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 border border-white/5 hover:border-white/20"
            >
              <RefreshCw className="w-5 h-5" />
              Retake
            </button>
            <button
              onClick={confirmFace}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white py-4 rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:scale-105 active:scale-95"
            >
              {currentFaceIdx === FACE_ORDER.length - 1 ? <Check className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              {currentFaceIdx === FACE_ORDER.length - 1 ? 'Finish' : 'Next Face'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

