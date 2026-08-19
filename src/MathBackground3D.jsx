import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

const ACCENT_COLOR = '#2B4C7E';
const OPACITY = 0.45; // Увеличенная прозрачность для большей видимости

const FloatingShape = ({ position, rotation, speed, type, reducedMotion }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current && !reducedMotion) {
      meshRef.current.rotation.x += speed.x;
      meshRef.current.rotation.y += speed.y;
      meshRef.current.rotation.z += speed.z;
    }
  });

  const material = useMemo(() => new THREE.MeshBasicMaterial({
    color: ACCENT_COLOR,
    wireframe: true,
    transparent: true,
    opacity: OPACITY,
  }), []);

  let geometry;
  switch (type) {
    case 'icosahedron':
      geometry = <icosahedronGeometry args={[1.5, 0]} />;
      break;
    case 'octahedron':
      geometry = <octahedronGeometry args={[1.5, 0]} />;
      break;
    case 'torus':
      geometry = <torusGeometry args={[1.2, 0.4, 8, 24]} />;
      break;
    case 'cone':
      geometry = <coneGeometry args={[1.2, 2, 8, 2]} />;
      break;
    case 'cube':
      geometry = <boxGeometry args={[1.8, 1.8, 1.8, 2, 2, 2]} />;
      break;
    default:
      geometry = <icosahedronGeometry args={[1.5, 0]} />;
  }

  if (reducedMotion) {
    return (
      <mesh ref={meshRef} position={position} rotation={rotation} material={material}>
        {geometry}
      </mesh>
    );
  }

  return (
    <Float
      speed={1} 
      rotationIntensity={0.2} 
      floatIntensity={0.5}
      position={position}
    >
      <mesh ref={meshRef} rotation={rotation} material={material}>
        {geometry}
      </mesh>
    </Float>
  );
};

const Scene = ({ isMobile, prefersReducedMotion }) => {
  const shapes = useMemo(() => {
    const count = isMobile ? 8 : 25; // Увеличено количество элементов
    const types = ['icosahedron', 'octahedron', 'torus', 'cone', 'cube', 'icosahedron', 'torus'];
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      type: types[i % types.length],
      position: [
        (Math.random() - 0.5) * 35, // Шире разброс по X
        (Math.random() - 0.5) * 25, // Шире разброс по Y
        (Math.random() - 0.5) * 15 - 5 // Глубже разброс по Z
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      speed: {
        x: (Math.random() - 0.5) * 0.003,
        y: (Math.random() - 0.5) * 0.003,
        z: (Math.random() - 0.5) * 0.003,
      }
    }));
  }, [isMobile]);

  return (
    <>
      {shapes.map((shape) => (
        <FloatingShape
          key={shape.id}
          position={shape.position}
          rotation={shape.rotation}
          speed={shape.speed}
          type={shape.type}
          reducedMotion={prefersReducedMotion}
        />
      ))}
    </>
  );
};

export default function MathBackground3D() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene isMobile={isMobile} prefersReducedMotion={prefersReducedMotion} />
      </Canvas>
    </div>
  );
}
