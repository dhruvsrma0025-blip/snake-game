export const FACE_MAP = [
  { face: 'U', matIdx: 2, coords: [[-1,1,-1], [0,1,-1], [1,1,-1], [-1,1,0], [0,1,0], [1,1,0], [-1,1,1], [0,1,1], [1,1,1]] },
  { face: 'R', matIdx: 0, coords: [[1,1,1], [1,1,0], [1,1,-1], [1,0,1], [1,0,0], [1,0,-1], [1,-1,1], [1,-1,0], [1,-1,-1]] },
  { face: 'F', matIdx: 4, coords: [[-1,1,1], [0,1,1], [1,1,1], [-1,0,1], [0,0,1], [1,0,1], [-1,-1,1], [0,-1,1], [1,-1,1]] },
  { face: 'D', matIdx: 3, coords: [[-1,-1,1], [0,-1,1], [1,-1,1], [-1,-1,0], [0,-1,0], [1,-1,0], [-1,-1,-1], [0,-1,-1], [1,-1,-1]] },
  { face: 'L', matIdx: 1, coords: [[-1,1,-1], [-1,1,0], [-1,1,1], [-1,0,-1], [-1,0,0], [-1,0,1], [-1,-1,-1], [-1,-1,0], [-1,-1,1]] },
  { face: 'B', matIdx: 5, coords: [[1,1,-1], [0,1,-1], [-1,1,-1], [1,0,-1], [0,0,-1], [-1,0,-1], [1,-1,-1], [0,-1,-1], [-1,-1,-1]] },
];

export const buildInitialCubies = () => {
  const cubies = [];
  let id = 0;
  for (let x of [-1, 0, 1]) {
    for (let y of [-1, 0, 1]) {
      for (let z of [-1, 0, 1]) {
        const materials = [-1, -1, -1, -1, -1, -1];
        
        FACE_MAP.forEach((faceData, faceIdx) => {
          const offset = faceIdx * 9;
          const coordIdx = faceData.coords.findIndex(c => c[0] === x && c[1] === y && c[2] === z);
          if (coordIdx !== -1) {
            materials[faceData.matIdx] = offset + coordIdx;
          }
        });

        cubies.push({
          id: id++,
          x, y, z,
          initialX: x, initialY: y, initialZ: z,
          materials,
          matrix: [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
          ] // Flat Matrix4 for easy state sharing
        });
      }
    }
  }
  return cubies;
};

// Standard face colors for rendering
// U, R, F, D, L, B
export const COLORS = {
  U: '#ffffff', // White
  R: '#e41f1f', // Red
  F: '#14a114', // Green
  D: '#dbdf26', // Yellow
  L: '#f87200', // Orange
  B: '#004fd8', // Blue
  BLANK: '#222222', // Internal black plastic
};

export const STANDARD_STATE = 
  'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
