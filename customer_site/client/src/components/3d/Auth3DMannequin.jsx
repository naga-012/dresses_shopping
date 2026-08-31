import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';

function RotatingMannequin() {
  const group = useRef();

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.5; // Smooth 360 rotation for Login Page
    }
  });

  const mannequinMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f5f5f7'),
    roughness: 0.2,
    metalness: 0.2
  }), []);

  const jointMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#d4af37'),
    metalness: 0.9,
    roughness: 0.1
  }), []);

  const jacketMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#111116'),
    roughness: 0.35,
    metalness: 0.2
  }), []);

  const shirtMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ffffff'),
    roughness: 0.3
  }), []);

  return (
    <group ref={group} position={[0, -1.3, 0]}>
      {/* Head */}
      <mesh position={[0, 3.35, 0]} material={mannequinMaterial}>
        <sphereGeometry args={[0.13, 32, 32]} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 3.18, 0]} material={mannequinMaterial}>
        <cylinderGeometry args={[0.07, 0.08, 0.14, 32]} />
      </mesh>

      {/* Tailored Tuxedo Jacket & Shirt */}
      <group position={[0, 2.85, 0]}>
        <mesh material={jacketMaterial}>
          <cylinderGeometry args={[0.27, 0.22, 0.56, 32]} />
        </mesh>
        {/* Inner Shirt V */}
        <mesh position={[0, 0.1, 0.12]} material={shirtMaterial}>
          <boxGeometry args={[0.12, 0.35, 0.02]} />
        </mesh>
        {/* Gold Buttons */}
        <mesh position={[0, 0.04, 0.14]} material={jointMaterial}>
          <cylinderGeometry args={[0.008, 0.008, 0.008, 16]} rotation={[Math.PI / 2, 0, 0]} />
        </mesh>

        <mesh position={[-0.28, 0.22, 0]} material={jointMaterial}>
          <sphereGeometry args={[0.12, 32, 32]} />
        </mesh>
        <mesh position={[0.28, 0.22, 0]} material={jointMaterial}>
          <sphereGeometry args={[0.12, 32, 32]} />
        </mesh>

        <mesh position={[-0.34, 0.02, 0]} rotation={[0, 0, 0.12]} material={jacketMaterial}>
          <cylinderGeometry args={[0.07, 0.06, 0.42, 32]} />
        </mesh>
        <mesh position={[0.34, 0.02, 0]} rotation={[0, 0, -0.12]} material={jacketMaterial}>
          <cylinderGeometry args={[0.07, 0.06, 0.42, 32]} />
        </mesh>
      </group>

      {/* Pants & Shoes */}
      <mesh position={[0, 2.48, 0]} material={jacketMaterial}>
        <cylinderGeometry args={[0.21, 0.2, 0.25, 32]} />
      </mesh>

      <group position={[0, 1.98, 0]}>
        <mesh position={[-0.11, 0.1, 0]} material={jacketMaterial}>
          <cylinderGeometry args={[0.09, 0.075, 0.65, 32]} />
        </mesh>
        <mesh position={[0.11, 0.1, 0]} material={jacketMaterial}>
          <cylinderGeometry args={[0.09, 0.075, 0.65, 32]} />
        </mesh>
      </group>

      {/* Gold Pedestal Base */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.75, 0.85, 0.05, 64]} />
        <meshStandardMaterial color="#1a1a24" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.33, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.68, 0.74, 64]} />
        <meshBasicMaterial color="#d4af37" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function Auth3DMannequin() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 1.6, 4.2]} fov={45} />
        
        <ambientLight intensity={1.5} />
        <directionalLight position={[4, 6, 5]} intensity={2.5} color="#ffffff" />
        <directionalLight position={[-4, 4, 4]} intensity={1.2} color="#e0e8ff" />
        <spotLight position={[0, 5, 2]} intensity={2.0} color="#ffd700" />

        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.02} floatIntensity={0.05}>
            <RotatingMannequin />
          </Float>
        </Suspense>

        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
