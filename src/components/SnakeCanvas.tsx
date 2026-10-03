import React, { useEffect, useRef } from 'react';
import { useSnakeStore } from '../store/useSnakeStore';
import { SnakeSkin } from '../types';

const CELL_SIZE = 24;

const SKIN_STYLES: Record<SnakeSkin, { head: string; body: string; glow: string; eye: string }> = {
  emerald: {
    head: '#10b981',
    body: '#059669',
    glow: 'rgba(16, 185, 129, 0.4)',
    eye: '#ffffff',
  },
  cyber: {
    head: '#06b6d4',
    body: '#3b82f6',
    glow: 'rgba(6, 182, 212, 0.6)',
    eye: '#f43f5e',
  },
  dragon: {
    head: '#eab308',
    body: '#ca8a04',
    glow: 'rgba(234, 179, 8, 0.5)',
    eye: '#ef4444',
  },
  lava: {
    head: '#f97316',
    body: '#dc2626',
    glow: 'rgba(249, 115, 22, 0.6)',
    eye: '#fef08a',
  },
  rainbow: {
    head: '#d946ef',
    body: '#8b5cf6',
    glow: 'rgba(217, 70, 239, 0.6)',
    eye: '#ffffff',
  },
};

export const SnakeCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const {
    gridSize,
    snake,
    direction,
    setDirection,
    food,
    particles,
    skin,
    isStarted,
    isPaused,
    resumeGame,
    isGameOver,
    gameSpeed,
    showGrid,
    tick,
  } = useSnakeStore();

  // Handle Touch Swipes for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.cancelable) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const start = touchStartRef.current;
    const end = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };
    touchStartRef.current = null;

    const diffX = end.x - start.x;
    const diffY = end.y - start.y;
    const minSwipeDist = 18;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) >= minSwipeDist) {
        if (diffX > 0) setDirection('RIGHT');
        else setDirection('LEFT');
      }
    } else {
      if (Math.abs(diffY) >= minSwipeDist) {
        if (diffY > 0) setDirection('DOWN');
        else setDirection('UP');
      }
    }
  };

  // Handle Game Loop Interval
  useEffect(() => {
    if (!isStarted || isPaused || isGameOver) return;

    const levelBaseSpeed = 200;

    let multiplier = 1.0;
    if (gameSpeed === 'relaxed') multiplier = 1.35;
    else if (gameSpeed === 'normal') multiplier = 1.0;
    else if (gameSpeed === 'fast') multiplier = 0.70;

    const interval = setInterval(() => {
      tick();
    }, Math.floor(levelBaseSpeed * multiplier));

    return () => clearInterval(interval);
  }, [isStarted, isPaused, isGameOver, gameSpeed, tick]);

  // Handle Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasSize = gridSize * CELL_SIZE;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const skinStyle = SKIN_STYLES[skin] || SKIN_STYLES.emerald;

    // 1. Atmosphere Radial Background
    const bgRad = ctx.createRadialGradient(
      canvasSize / 2,
      canvasSize / 2,
      20,
      canvasSize / 2,
      canvasSize / 2,
      canvasSize * 0.75
    );
    bgRad.addColorStop(0, '#0a3323');
    bgRad.addColorStop(1, '#03140d');
    ctx.fillStyle = bgRad;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // 2. Grid dots
    ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const cx = x * CELL_SIZE + CELL_SIZE / 2;
        const cy = y * CELL_SIZE + CELL_SIZE / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Grid lines
    if (showGrid) {
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.25)';
      ctx.lineWidth = 1;
      const crossSize = 3;
      for (let x = 1; x < gridSize; x++) {
        for (let y = 1; y < gridSize; y++) {
          const px = x * CELL_SIZE;
          const py = y * CELL_SIZE;

          ctx.beginPath();
          ctx.moveTo(px - crossSize, py);
          ctx.lineTo(px + crossSize, py);
          ctx.moveTo(px, py - crossSize);
          ctx.lineTo(px, py + crossSize);
          ctx.stroke();
        }
      }
    }

    ctx.strokeStyle = 'rgba(74, 222, 128, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvasSize - 2, canvasSize - 2);

    // 3. Draw Food
    const cx = food.x * CELL_SIZE + CELL_SIZE / 2;
    const cy = food.y * CELL_SIZE + CELL_SIZE / 2;
    const r = CELL_SIZE / 2.5;

    ctx.save();
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ef4444';

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Food Glow Accent
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - r / 3, cy - r / 3, r / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Draw Particles
    particles.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 5. Draw Snake Body & Head
    if (snake.length > 0) {
      snake.forEach((seg, idx) => {
        const px = seg.x * CELL_SIZE;
        const py = seg.y * CELL_SIZE;
        const isHead = idx === 0;

        ctx.save();
        if (isHead) {
          // Snake Head
          ctx.shadowColor = skinStyle.glow;
          ctx.shadowBlur = 12;

          ctx.fillStyle = skinStyle.head;
          ctx.beginPath();
          ctx.roundRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2, 8);
          ctx.fill();

          // Snake Eyes
          ctx.fillStyle = skinStyle.eye;
          let eyeX1 = px + 6, eyeY1 = py + 6, eyeX2 = px + 14, eyeY2 = py + 6;
          if (direction === 'DOWN') {
            eyeX1 = px + 6; eyeY1 = py + 14; eyeX2 = px + 14; eyeY2 = py + 14;
          } else if (direction === 'LEFT') {
            eyeX1 = px + 6; eyeY1 = py + 6; eyeX2 = px + 6; eyeY2 = py + 14;
          } else if (direction === 'RIGHT') {
            eyeX1 = px + 14; eyeY1 = py + 6; eyeX2 = px + 14; eyeY2 = py + 14;
          }

          ctx.beginPath();
          ctx.arc(eyeX1, eyeY1, 2.5, 0, Math.PI * 2);
          ctx.arc(eyeX2, eyeY2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Snake Body Segment
          const scale = 1 - (idx / snake.length) * 0.25; 
          const segSize = (CELL_SIZE - 4) * scale;
          const offset = (CELL_SIZE - segSize) / 2;

          ctx.fillStyle = skinStyle.body;
          ctx.beginPath();
          ctx.roundRect(px + offset, py + offset, segSize, segSize, 6);
          ctx.fill();
        }
        ctx.restore();
      });
    }
  }, [gridSize, snake, direction, food, particles, skin, showGrid]);

  return (
    <div className="relative flex flex-col items-center justify-center p-1 w-full shrink-0">
      {/* Glow Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/10 via-cyan-500/10 to-emerald-500/10 rounded-3xl blur-xl pointer-events-none" />

      {/* Canvas Wrapper with Touch Swipe Detection */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (isPaused && !isGameOver) {
            resumeGame();
          }
        }}
        className="relative border-2 sm:border-4 border-white/10 rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.8)] bg-zinc-950 touch-none select-none w-auto max-w-[280px] xs:max-w-[310px] sm:max-w-[340px] max-h-[36vh] xs:max-h-[40vh] sm:max-h-[45vh] aspect-square flex items-center justify-center cursor-pointer"
      >
        <canvas
          ref={canvasRef}
          width={gridSize * CELL_SIZE}
          height={gridSize * CELL_SIZE}
          className="block select-none w-full h-full object-contain pointer-events-auto"
        />

        {/* Overlay Badges */}
        {isPaused && !isGameOver && (
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center px-4 py-2 bg-zinc-900/95 border border-amber-500/30 rounded-2xl shadow-xl">
              <span className="text-amber-400 font-black text-base sm:text-lg tracking-wider uppercase italic block">
                PAUSED
              </span>
              <span className="text-[11px] text-zinc-400 font-medium">Tap Canvas or Play to Resume</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
