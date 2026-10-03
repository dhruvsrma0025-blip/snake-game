import { create } from 'zustand';
import { STANDARD_STATE } from '../utils/cube';
import Cube from 'cubejs';

// Pre-initialize solver tables on load
try {
  Cube.initSolver();
} catch (err) {
  console.warn('Failed to pre-init Cube solver:', err);
}

export type AppMode = 'input' | 'solve';
export type InputMethod = 'manual' | 'camera';

interface CubeState {
  mode: AppMode;
  inputMethod: InputMethod;
  cubeString: string;
  solution: string[];
  currentStep: number;
  isPlaying: boolean;
  error: string | null;

  setMode: (mode: AppMode) => void;
  setInputMethod: (method: InputMethod) => void;
  setCubeString: (str: string) => void;
  updateFaceColor: (index: number, faceCode: string) => void;
  solveCube: () => void;
  scrambleCube: () => void;
  resetToSolved: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  setIsPlaying: (playing: boolean) => void;
  reset: () => void;
}

export const useCubeStore = create<CubeState>((set, get) => ({
  mode: 'input',
  inputMethod: 'manual',
  cubeString: STANDARD_STATE,
  solution: [],
  currentStep: 0,
  isPlaying: false,
  error: null,

  setMode: (mode) => set({ mode }),
  setInputMethod: (method) => set({ inputMethod: method }),
  setCubeString: (str) => set({ cubeString: str, error: null }),
  updateFaceColor: (index, faceCode) => {
    const arr = get().cubeString.split('');
    arr[index] = faceCode;
    set({ cubeString: arr.join(''), error: null });
  },
  scrambleCube: () => {
    try {
      const cube = new Cube();
      cube.randomize();
      set({ cubeString: cube.asString(), error: null, solution: [], currentStep: 0 });
    } catch (e: any) {
      console.error(e);
    }
  },
  resetToSolved: () => {
    set({ cubeString: STANDARD_STATE, error: null, solution: [], currentStep: 0 });
  },
  solveCube: () => {
    try {
      const stateStr = get().cubeString;

      // 1. Validate total length and character counts
      if (stateStr.length !== 54) {
        throw new Error('Incomplete cube state: must have 54 face stickers.');
      }

      const counts: Record<string, number> = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 };
      for (const char of stateStr) {
        counts[char] = (counts[char] || 0) + 1;
      }

      const invalidFaces = Object.entries(counts).filter(([_, cnt]) => cnt !== 9);
      if (invalidFaces.length > 0) {
        const mismatchList = Object.entries(counts)
          .map(([f, cnt]) => `${f}: ${cnt}/9`)
          .join(', ');
        throw new Error(`Invalid sticker counts! Each face color must appear exactly 9 times. (${mismatchList})`);
      }

      // 2. Initialize Cube instance
      const cube = Cube.fromString(stateStr);

      // 3. Check if cube is already solved
      if (cube.isSolved()) {
        set({
          solution: [],
          currentStep: 0,
          mode: 'solve',
          error: null,
          isPlaying: false,
        });
        return;
      }

      // 4. Run Kociemba solver
      const solutionStr = cube.solve();

      // Handle solver error codes
      if (!solutionStr || solutionStr.startsWith('Error')) {
        let msg = 'Invalid cube configuration.';
        if (solutionStr === 'Error 1') msg = 'Invalid facelet configuration: Color count mismatch.';
        else if (solutionStr === 'Error 2') msg = 'Invalid cube state: Missing or duplicated edge pieces.';
        else if (solutionStr === 'Error 3') msg = 'Impossible cube state: An edge piece is flipped.';
        else if (solutionStr === 'Error 4') msg = 'Invalid cube state: Missing or duplicated corner pieces.';
        else if (solutionStr === 'Error 5') msg = 'Impossible cube state: A corner piece is twisted.';
        else if (solutionStr === 'Error 6') msg = 'Impossible parity error: Edge/corner permutation mismatch.';
        else if (solutionStr === 'Error 7' || solutionStr === 'Error 8') msg = 'Solver timeout or invalid layout. Please re-check face colors.';
        
        throw new Error(msg);
      }

      const moves = solutionStr.trim().split(/\s+/);
      set({
        solution: moves,
        currentStep: 0,
        mode: 'solve',
        error: null,
        isPlaying: false,
      });
    } catch (e: any) {
      set({ error: e.message || 'Invalid cube configuration. Please check your colors.' });
    }
  },
  nextStep: () => {
    const { currentStep, solution } = get();
    if (currentStep < solution.length) {
      set({ currentStep: currentStep + 1 });
    } else {
      set({ isPlaying: false });
    }
  },
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },
  setStep: (step) => set({ currentStep: step }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  reset: () => set({ 
    mode: 'input', 
    solution: [], 
    currentStep: 0, 
    isPlaying: false,
    error: null 
  }),
}));

