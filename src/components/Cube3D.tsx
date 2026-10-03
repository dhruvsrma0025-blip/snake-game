import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useCubeStore } from '../store/useCubeStore';
import { buildInitialCubies, COLORS } from '../utils/cube';

// Material indices for BoxGeometry: 0: R(+x), 1: L(-x), 2: U(+y), 3: D(-y), 4: F(+z), 5: B(-z)
// These map to standard colors if no initial string is provided, but we use the cubeString to paint them.

const CUBE_SPACING = 1.05; // Gap between cubies

function parseMove(moveStr: string, isForward: boolean) {
  const face = moveStr[0];
  const isPrime = moveStr.includes("'");
  const isDouble = moveStr.includes("2");
  
  let amount = 1;
  if (isDouble) amount = 2;
  if (isPrime) amount = -1;
  
  if (!isForward) amount = -amount;

  const config: Record<string, any> = {
    U: { axis: new THREE.Vector3(0,1,0), sign: -1, filter: (c:any) => c.y > 0.5 },
    D: { axis: new THREE.Vector3(0,1,0), sign: 1,  filter: (c:any) => c.y < -0.5 },
    R: { axis: new THREE.Vector3(1,0,0), sign: -1, filter: (c:any) => c.x > 0.5 },
    L: { axis: new THREE.Vector3(1,0,0), sign: 1,  filter: (c:any) => c.x < -0.5 },
    F: { axis: new THREE.Vector3(0,0,1), sign: -1, filter: (c:any) => c.z > 0.5 },
    B: { axis: new THREE.Vector3(0,0,1), sign: 1,  filter: (c:any) => c.z < -0.5 },
  };

  return { ...config[face], amount, face };
}

function Cubie({ data, animatingMove, cubeString }: { data: any, animatingMove: any, cubeString: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const baseMatrix = useMemo(() => {
    const m = new THREE.Matrix4();
    m.fromArray(data.matrix);
    return m;
  }, [data.matrix]);

  // Paint materials once based on initial state
  const materials = useMemo(() => {
    return data.materials.map((matIdx: number) => {
      let hex = COLORS.BLANK;
      if (matIdx !== -1) {
        const colorCode = cubeString[matIdx];
        hex = COLORS[colorCode as keyof typeof COLORS] || COLORS.BLANK;
      }
      return new THREE.MeshStandardMaterial({ color: hex, roughness: 0.2, metalness: 0.1 });
    });
  }, [data.materials, cubeString]);

  useFrame(() => {
    if (!meshRef.current) return;
    
    // Auto-update matrix based on animation
    const currentMatrix = new THREE.Matrix4();
    
    if (animatingMove && animatingMove.filter(data)) {
      const angle = animatingMove.progress * (Math.PI / 2) * animatingMove.sign * animatingMove.amount;
      currentMatrix.makeRotationAxis(animatingMove.axis, angle);
    }
    
    // Scale and Space
    const scaleMatrix = new THREE.Matrix4().makeScale(0.96, 0.96, 0.96);
    const spacingMatrix = new THREE.Matrix4().makeScale(CUBE_SPACING, CUBE_SPACING, CUBE_SPACING);
    
    // Final transform: apply spacing to base position, then apply current rotation, then apply local scale
    // Wait, matrix multiplication order matters. 
    // We want the cubies to rotate around the origin.
    // So currentMatrix (rotation) * spacingMatrix * baseMatrix
    
    meshRef.current.matrix.identity()
      .multiply(currentMatrix)
      .multiply(spacingMatrix)
      .multiply(baseMatrix)
      .multiply(scaleMatrix);
  });

  return (
    <mesh ref={meshRef} matrixAutoUpdate={false} material={materials}>
      <boxGeometry args={[1, 1, 1]} />
    </mesh>
  );
}

function CubeScene() {
  const { cubeString, solution, currentStep } = useCubeStore();
  const [cubies, setCubies] = useState(() => buildInitialCubies());
  const [lastStep, setLastStep] = useState(currentStep);
  const [animatingMove, setAnimatingMove] = useState<any>(null);

  // Re-init cubies if cubeString changes (meaning user went back to input mode and changed colors)
  useEffect(() => {
    // Only re-init if not solving
    const { mode } = useCubeStore.getState();
    if (mode === 'input') {
      setCubies(buildInitialCubies());
      setLastStep(0);
    }
  }, [cubeString]);

  useEffect(() => {
    if (currentStep === lastStep) return;
    
    const isForward = currentStep > lastStep;
    const moveStr = isForward ? solution[lastStep] : solution[currentStep];
    
    if (!moveStr) {
      setLastStep(currentStep);
      return;
    }

    const moveData = parseMove(moveStr, isForward);
    moveData.progress = 0;
    
    // Fast animation if playing, else instant if skipping? 
    // Let's just always animate but quickly.
    const duration = 300; // ms
    const startTime = performance.now();

    const animate = (time: number) => {
      let p = (time - startTime) / duration;
      if (p >= 1) {
        p = 1;
        // Apply transform permanently
        setCubies(prev => prev.map(c => {
          if (!moveData.filter(c)) return c;
          
          const angle = (Math.PI / 2) * moveData.sign * moveData.amount;
          const rotMatrix = new THREE.Matrix4().makeRotationAxis(moveData.axis, angle);
          const baseM = new THREE.Matrix4().fromArray(c.matrix);
          
          const newM = new THREE.Matrix4().multiplyMatrices(rotMatrix, baseM);
          
          return {
            ...c,
            matrix: newM.toArray(),
            x: Math.round(newM.elements[12]),
            y: Math.round(newM.elements[13]),
            z: Math.round(newM.elements[14]),
          };
        }));
        setAnimatingMove(null);
        setLastStep(currentStep);
      } else {
        moveData.progress = p;
        setAnimatingMove({ ...moveData });
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);

  }, [currentStep, lastStep, solution]);

  return (
    <group>
      {cubies.map(c => (
        <Cubie 
          key={c.id} 
          data={c} 
          animatingMove={animatingMove} 
          cubeString={cubeString} 
        />
      ))}
    </group>
  );
}

export function Cube3D() {
  return (
    <Canvas camera={{ position: [5, 4, 6], fov: 45 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <CubeScene />
      <OrbitControls enablePan={false} minDistance={4} maxDistance={12} />
    </Canvas>
  );
}
