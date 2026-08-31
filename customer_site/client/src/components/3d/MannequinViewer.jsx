import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useUIStore } from '../../store/uiStore';
import toast from 'react-hot-toast';

// Body Anchors for exact clothing snap placement matching user specification
const bodyAnchors = {
  chest: new THREE.Vector3(0, 1.3, 0),
  waist: new THREE.Vector3(0, 0.5, 0),
  leftFoot: new THREE.Vector3(-0.2, -1, 0),
  rightFoot: new THREE.Vector3(0.2, -1, 0)
};

// Static Camera Controller without auto animation
function CameraController() {
  const { cameraPreset } = useUIStore();
  const { camera } = useThree();

  useEffect(() => {
    if (cameraPreset === 'front') {
      camera.position.set(0, 1.5, 5);
    } else if (cameraPreset === 'side') {
      camera.position.set(5, 1.5, 0);
    } else if (cameraPreset === 'back') {
      camera.position.set(0, 1.5, -5);
    } else if (cameraPreset === 'reset') {
      camera.position.set(0, 1.5, 5);
    }
    camera.lookAt(0, 1, 0);
  }, [cameraPreset, camera]);

  return null;
}

// Static 3D White Studio Mannequin (No auto rotation animation)
function MannequinModel({ onMannequinClick }) {
  const mannequinGroup = useRef();
  const { currentOutfit, selectedProduct, selectedColor } = useUIStore();

  // Alabaster White Mannequin Material
  const mannequinMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f5f5f7'),
    roughness: 0.25,
    metalness: 0.15
  });

  const jointMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#d4af37'),
    metalness: 0.8,
    roughness: 0.2
  });

  // Garment items from current outfit stack or selected product
  const outfit = currentOutfit || {};
  const topProduct = outfit.top || (['Shirts', 'T-Shirts', 'Hoodies', 'Jackets', 'Blazers'].includes(selectedProduct?.category) ? selectedProduct : null);
  const bottomProduct = outfit.bottom || (['Pants', 'Jeans', 'Shorts'].includes(selectedProduct?.category) ? selectedProduct : null);
  const shoeProduct = outfit.shoes || (selectedProduct?.category === 'Shoes' ? selectedProduct : null);
  const headwearProduct = outfit.headwear || (['Caps', 'Cap', 'Accessories'].includes(selectedProduct?.category) ? selectedProduct : null);

  const topColor = selectedColor?.hex || topProduct?.colors?.[0]?.hex || '#111111';
  const topMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(topColor),
    roughness: 0.4,
    metalness: 0.1
  });

  const bottomColor = bottomProduct?.colors?.[0]?.hex || '#d7c4b7';
  const bottomMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(bottomColor),
    roughness: 0.6
  });

  const shoeMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(shoeProduct?.colors?.[0]?.hex || '#ffffff'),
    roughness: 0.3
  });

  const headwearMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(headwearProduct?.colors?.[0]?.hex || '#111111'),
    roughness: 0.5
  });

  return (
    <group ref={mannequinGroup} position={[0, -1.5, 0]} onClick={onMannequinClick}>
      
      {/* Head */}
      <group position={[0, 3.35, 0]}>
        <mesh material={mannequinMaterial} castShadow receiveShadow>
          <sphereGeometry args={[0.13, 32, 32]} />
        </mesh>
        {headwearProduct && (
          <group position={[0, 0.08, 0]}>
            <mesh material={headwearMaterial} castShadow>
              <sphereGeometry args={[0.14, 32, 16, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
            </mesh>
            <mesh position={[0, -0.02, 0.14]} rotation={[0.2, 0, 0]} material={headwearMaterial} castShadow>
              <boxGeometry args={[0.18, 0.015, 0.12]} />
            </mesh>
          </group>
        )}
      </group>

      {/* Neck */}
      <mesh position={[0, 3.18, 0]} material={mannequinMaterial} castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.08, 0.14, 32]} />
      </mesh>

      {/* Torso & Upper Body */}
      <group position={[0, 2.85, 0]}>
        <mesh material={topProduct ? topMaterial : mannequinMaterial} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.22, 0.56, 32]} />
        </mesh>

        <mesh position={[-0.28, 0.22, 0]} material={topProduct ? topMaterial : jointMaterial} castShadow>
          <sphereGeometry args={[0.12, 32, 32]} />
        </mesh>
        <mesh position={[0.28, 0.22, 0]} material={topProduct ? topMaterial : jointMaterial} castShadow>
          <sphereGeometry args={[0.12, 32, 32]} />
        </mesh>

        <mesh position={[-0.34, 0.02, 0]} rotation={[0, 0, 0.12]} material={topProduct ? topMaterial : mannequinMaterial} castShadow>
          <cylinderGeometry args={[0.07, 0.06, 0.42, 32]} />
        </mesh>
        <mesh position={[0.34, 0.02, 0]} rotation={[0, 0, -0.12]} material={topProduct ? topMaterial : mannequinMaterial} castShadow>
          <cylinderGeometry args={[0.07, 0.06, 0.42, 32]} />
        </mesh>

        <mesh position={[-0.38, -0.32, 0.02]} rotation={[0.1, 0, 0.15]} material={topProduct ? topMaterial : mannequinMaterial} castShadow>
          <cylinderGeometry args={[0.05, 0.04, 0.38, 32]} />
        </mesh>
        <mesh position={[0.38, -0.32, 0.02]} rotation={[0.1, 0, -0.15]} material={topProduct ? topMaterial : mannequinMaterial} castShadow>
          <cylinderGeometry args={[0.05, 0.04, 0.38, 32]} />
        </mesh>
      </group>

      {/* Waist & Legs */}
      <mesh position={[0, 2.48, 0]} material={bottomProduct ? bottomMaterial : mannequinMaterial} castShadow receiveShadow>
        <cylinderGeometry args={[0.21, 0.2, 0.25, 32]} />
      </mesh>

      <group position={[0, 1.98, 0]}>
        <mesh position={[-0.11, 0.1, 0]} material={bottomProduct ? bottomMaterial : mannequinMaterial} castShadow receiveShadow>
          <cylinderGeometry args={[0.09, 0.075, 0.65, 32]} />
        </mesh>
        <mesh position={[0.11, 0.1, 0]} material={bottomProduct ? bottomMaterial : mannequinMaterial} castShadow receiveShadow>
          <cylinderGeometry args={[0.09, 0.075, 0.65, 32]} />
        </mesh>

        <mesh position={[-0.11, -0.45, 0]} material={bottomProduct ? bottomMaterial : mannequinMaterial} castShadow receiveShadow>
          <cylinderGeometry args={[0.075, 0.065, 0.55, 32]} />
        </mesh>
        <mesh position={[0.11, -0.45, 0]} material={bottomProduct ? bottomMaterial : mannequinMaterial} castShadow receiveShadow>
          <cylinderGeometry args={[0.075, 0.065, 0.55, 32]} />
        </mesh>
      </group>

      {/* Feet / Shoes */}
      <mesh position={[-0.11, 1.38, 0.06]} material={shoeProduct ? shoeMaterial : mannequinMaterial} castShadow receiveShadow>
        <boxGeometry args={[0.11, 0.09, 0.24]} />
      </mesh>
      <mesh position={[0.11, 1.38, 0.06]} material={shoeProduct ? shoeMaterial : mannequinMaterial} castShadow receiveShadow>
        <boxGeometry args={[0.11, 0.09, 0.24]} />
      </mesh>

    </group>
  );
}

// Studio Floor matching main.js floor specs
function StudioFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#eeeeee" roughness={0.8} />
    </mesh>
  );
}

function Loader() {
  return (
    <Html center>
      <div style={{ color: '#111', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', background: '#fff', padding: '10px 20px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        Mannequin loading...
      </div>
    </Html>
  );
}

export default function MannequinViewer() {
  const {
    selectedItemToPlace,
    updateOutfit,
    setPlacementMessage,
    clearPlacementMode,
    selectedProduct
  } = useUIStore();

  const handleMannequinClick = (event) => {
    event.stopPropagation();
    const worldPoint = event.point;
    if (!worldPoint) return;

    const y = worldPoint.y;
    let bodyRegion = 'TORSO';

    if (y > 1.4) {
      bodyRegion = 'HEAD';
    } else if (y >= 0.8 && y <= 1.4) {
      bodyRegion = 'TORSO';
    } else if (y >= 0.1 && y < 0.8) {
      bodyRegion = 'WAIST';
    } else {
      bodyRegion = 'FEET';
    }

    const itemToAttach = selectedItemToPlace || selectedProduct || { name: 'Shirt', category: 'Shirts' };
    const cat = (itemToAttach.category || '').toLowerCase();

    let isValid = false;
    let requiredRegionText = '';

    if (['shirts', 't-shirts', 'hoodies', 'jackets', 'blazers'].includes(cat)) {
      isValid = bodyRegion === 'TORSO';
      requiredRegionText = 'chest / torso';
    } else if (['pants', 'jeans', 'shorts'].includes(cat)) {
      isValid = bodyRegion === 'WAIST' || bodyRegion === 'TORSO';
      requiredRegionText = 'waist / legs';
    } else if (cat === 'shoes') {
      isValid = bodyRegion === 'FEET';
      requiredRegionText = 'feet';
    } else if (['caps', 'cap', 'headwear'].includes(cat)) {
      isValid = bodyRegion === 'HEAD';
      requiredRegionText = 'head';
    } else {
      isValid = true;
    }

    if (!isValid) {
      toast.error(`Please select the correct body area. (Click the ${requiredRegionText} for ${itemToAttach.name})`);
      setPlacementMessage(`Please click the ${requiredRegionText} to place ${itemToAttach.name}`);
      return;
    }

    updateOutfit(itemToAttach.category, itemToAttach);
    toast.success(`${itemToAttach.name} added to mannequin!`);
    setPlacementMessage(`${itemToAttach.name} added to mannequin!`);
    clearPlacementMode();
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#f5f5f5' }}>
      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 1.5, 5]} fov={45} />
        <CameraController />
        
        {/* Lights matching main.js */}
        <ambientLight intensity={2.0} color="#ffffff" />
        <directionalLight position={[5, 8, 5]} intensity={3.0} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} color="#ffffff" />

        <Suspense fallback={<Loader />}>
          <MannequinModel onMannequinClick={handleMannequinClick} />
          <StudioFloor />
        </Suspense>

        <OrbitControls
          enableDamping={false}
          target={[0, 1, 0]}
        />
      </Canvas>
    </div>
  );
}
