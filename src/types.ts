export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type Position = {
  x: number;
  y: number;
};

export type GameSpeed = 'relaxed' | 'normal' | 'fast';

export type SnakeSkin = 'emerald' | 'cyber' | 'dragon' | 'lava' | 'rainbow';

export type DPadLayout = 'left' | 'center' | 'right';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
}

