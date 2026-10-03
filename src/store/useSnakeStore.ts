import { create } from 'zustand';
import { Direction, Position, GameSpeed, SnakeSkin, Particle, DPadLayout } from '../types';
import { sound } from '../utils/audio';

const GRID_SIZE = 20;

const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

interface SnakeStore {
  isStarted: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  
  gridSize: number;
  snake: Position[];
  direction: Direction;
  nextDirection: Direction;
  food: Position;
  
  particles: Particle[];
  
  score: number;
  highScore: number;
  
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  showGrid: boolean;
  gameSpeed: GameSpeed;
  skin: SnakeSkin;
  dpadLayout: DPadLayout;
  settingsOpen: boolean;
  customBg: string | null;
  customAudio: string | null;
  customAudioName: string | null;

  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  togglePause: () => void;
  resetGame: () => void;
  
  setDirection: (dir: Direction) => void;
  setGameSpeed: (speed: GameSpeed) => void;
  setSkin: (skin: SnakeSkin) => void;
  setDpadLayout: (layout: DPadLayout) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleGrid: () => void;
  setSettingsOpen: (open: boolean) => void;
  toggleSettings: () => void;
  resetProgress: () => void;
  setCustomBg: (bg: string | null) => void;
  setCustomAudio: (audioData: string | null, name?: string | null) => void;
  
  tick: () => void;
}

const getRandomPosition = (gridSize: number, snake: Position[]): Position => {
  let pos: Position;
  let attempts = 0;
  do {
    pos = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
    attempts++;
    if (attempts > 100) break;
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
};

const createBurstParticles = (x: number, y: number, color: string, count = 12): Particle[] => {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    particles.push({
      x: x * 20 + 10,
      y: y * 20 + 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      radius: Math.random() * 3 + 1.5,
      alpha: 1,
      life: 0,
      maxLife: Math.floor(Math.random() * 20 + 15),
    });
  }
  return particles;
};

export const useSnakeStore = create<SnakeStore>((set, get) => {
  const storedHighScore = typeof window !== 'undefined' ? Number(localStorage.getItem('snake_high_score') || 0) : 0;
  const storedDpadLayout = typeof window !== 'undefined' ? (localStorage.getItem('snake_dpad_layout') as DPadLayout || 'center') : 'center';
  const storedSound = typeof window !== 'undefined' ? localStorage.getItem('snake_sound') !== 'false' : true;
  const storedBg = typeof window !== 'undefined' ? localStorage.getItem('snake_custom_bg') : null;
  const storedAudio = typeof window !== 'undefined' ? localStorage.getItem('snake_custom_audio') : null;
  const storedAudioName = typeof window !== 'undefined' ? localStorage.getItem('snake_custom_audio_name') : null;

  sound.enabled = storedSound;
  if (storedAudio) {
    sound.setCustomAudio(storedAudio);
  }

  return {
    isStarted: false,
    isPaused: false,
    isGameOver: false,
    settingsOpen: false,
    showGrid: true,
    gameSpeed: 'normal',
    dpadLayout: storedDpadLayout,
    skin: 'emerald',
    customBg: storedBg,
    customAudio: storedAudio,
    customAudioName: storedAudioName,

    gridSize: GRID_SIZE,
    snake: INITIAL_SNAKE,
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    food: { x: 15, y: 10 },
    particles: [],

    score: 0,
    highScore: storedHighScore,
    soundEnabled: storedSound,
    hapticsEnabled: typeof window !== 'undefined' ? localStorage.getItem('snake_haptics') !== 'false' : true,

    startGame: () => {
      set({ 
        isStarted: true, 
        isPaused: false, 
        isGameOver: false, 
        score: 0,
        snake: INITIAL_SNAKE,
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        food: getRandomPosition(GRID_SIZE, INITIAL_SNAKE),
        particles: []
      });
      sound.playClick();
      sound.updateBgmState(true);
    },
    
    pauseGame: () => {
      set({ isPaused: true });
      sound.updateBgmState(false);
    },
    
    resumeGame: () => {
      set({ isPaused: false, settingsOpen: false });
      sound.updateBgmState(true);
    },
    
    togglePause: () => {
      const state = get();
      if (!state.isStarted || state.isGameOver) return;
      const newPaused = !state.isPaused;
      set({ isPaused: newPaused });
      sound.updateBgmState(!newPaused);
    },
    
    resetGame: () => {
      const state = get();
      set({
        isStarted: true,
        isPaused: false,
        isGameOver: false,
        score: 0,
        snake: INITIAL_SNAKE,
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        food: getRandomPosition(GRID_SIZE, INITIAL_SNAKE),
        particles: []
      });
      sound.playClick();
      sound.updateBgmState(true);
    },

    setDirection: (dir) => {
      const { direction, nextDirection, isPaused } = get();
      if (isPaused) return;

      const isOpposite = (d1: Direction, d2: Direction) => {
        if (d1 === 'UP' && d2 === 'DOWN') return true;
        if (d1 === 'DOWN' && d2 === 'UP') return true;
        if (d1 === 'LEFT' && d2 === 'RIGHT') return true;
        if (d1 === 'RIGHT' && d2 === 'LEFT') return true;
        return false;
      };

      if (!isOpposite(direction, dir) && !isOpposite(nextDirection, dir)) {
        set({ nextDirection: dir });
      }
    },

    setGameSpeed: (speed) => set({ gameSpeed: speed }),
    setSkin: (skin) => set({ skin }),
    setDpadLayout: (layout) => {
      set({ dpadLayout: layout });
      localStorage.setItem('snake_dpad_layout', layout);
    },
    
    toggleSound: () => {
      const newSound = !get().soundEnabled;
      set({ soundEnabled: newSound });
      sound.enabled = newSound;
      localStorage.setItem('snake_sound', String(newSound));
      if (!newSound) {
        sound.updateBgmState(false);
      } else if (get().isStarted && !get().isPaused && !get().isGameOver) {
        sound.updateBgmState(true);
      }
    },
    
    toggleHaptics: () => {
      const newHaptics = !get().hapticsEnabled;
      set({ hapticsEnabled: newHaptics });
      localStorage.setItem('snake_haptics', String(newHaptics));
      if (newHaptics && navigator.vibrate) {
        navigator.vibrate(50);
      }
    },
    
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    setSettingsOpen: (open) => set({ settingsOpen: open }),
    toggleSettings: () => {
      sound.playClick();
      const state = get();
      const nextOpen = !state.settingsOpen;
      if (nextOpen && state.isStarted && !state.isGameOver && !state.isPaused) {
        set({ settingsOpen: true, isPaused: true });
        sound.updateBgmState(false);
      } else {
        set({ settingsOpen: nextOpen });
      }
    },
    
    resetProgress: () => {
      localStorage.setItem('snake_high_score', '0');
      set({ highScore: 0, score: 0 });
    },

    setCustomBg: (bg: string | null) => {
      if (bg) {
        try {
          localStorage.setItem('snake_custom_bg', bg);
        } catch (e) {
          console.error('Failed to save custom background image', e);
        }
      } else {
        localStorage.removeItem('snake_custom_bg');
      }
      set({ customBg: bg });
    },

    setCustomAudio: (audioData: string | null, name: string | null = null) => {
      if (audioData) {
        try {
          localStorage.setItem('snake_custom_audio', audioData);
          if (name) localStorage.setItem('snake_custom_audio_name', name);
        } catch (e) {
          console.warn('Could not save custom audio to localStorage (quota or size)', e);
        }
        sound.setCustomAudio(audioData);
      } else {
        try {
          localStorage.removeItem('snake_custom_audio');
          localStorage.removeItem('snake_custom_audio_name');
        } catch (e) {
          console.error(e);
        }
        sound.setCustomAudio(null);
      }
      set({ customAudio: audioData, customAudioName: name });
    },

    tick: () => {
      const state = get();
      if (!state.isStarted || state.isPaused || state.isGameOver) return;

      const { snake, nextDirection, food, gridSize, score, highScore, particles } = state;
      const head = snake[0];
      const newHead = { ...head };

      // Update particles
      const updatedParticles = particles
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life + 1,
          alpha: Math.max(0, 1 - (p.life + 1) / p.maxLife),
        }))
        .filter(p => p.life < p.maxLife);

      switch (nextDirection) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Check collision with walls or self
      if (
        newHead.x < 0 ||
        newHead.x >= gridSize ||
        newHead.y < 0 ||
        newHead.y >= gridSize ||
        snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        sound.playGameOver();
        if (state.hapticsEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]);
        sound.updateBgmState(false);
        set({ isGameOver: true, particles: updatedParticles });
        return;
      }

      const newSnake = [newHead, ...snake];
      let newScore = score;
      let newFood = food;
      let newParticles = [...updatedParticles];

      // Check if food eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        sound.playEat();
        if (state.hapticsEnabled && navigator.vibrate) navigator.vibrate(30);
        newScore += 10;
        newFood = getRandomPosition(gridSize, newSnake);
        newParticles = [
          ...newParticles,
          ...createBurstParticles(food.x, food.y, '#10b981')
        ];
        
        if (newScore > highScore) {
          set({ highScore: newScore });
          localStorage.setItem('snake_high_score', String(newScore));
        }
      } else {
        newSnake.pop(); // Remove tail if not eating
      }

      set({
        snake: newSnake,
        direction: nextDirection,
        food: newFood,
        score: newScore,
        particles: newParticles
      });
    },
  };
});
