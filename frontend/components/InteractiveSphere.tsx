'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function HollowSphereParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 3000;
  const radius = 3.5;
  const mouse = useRef(new THREE.Vector2(-999, -999));

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  const { positions, originalPositions } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      positions[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return { positions, originalPositions: Float32Array.from(positions) };
  }, [count, radius]);

  const vec = useMemo(() => new THREE.Vector3(), []);
  const mouseVec = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const invQuat = useMemo(() => new THREE.Quaternion(), []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    // Smooth, slow continuous floating rotation
    pointsRef.current.rotation.y += delta * 0.05;
    pointsRef.current.rotation.x += delta * 0.02;

    const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array;

    mouseVec.set(
      (mouse.current.x * state.viewport.width) / 2,
      (mouse.current.y * state.viewport.height) / 2,
      1.5 // Protrudes a bit to interact mainly with front-facing particles
    );

    // Transform mouse vector to local space
    invQuat.copy(pointsRef.current.quaternion).invert();
    mouseVec.applyQuaternion(invQuat);

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        vec.set(originalPositions[i3], originalPositions[i3 + 1], originalPositions[i3 + 2]);
        
        const dist = vec.distanceTo(mouseVec);
        const interactionRadius = 2.0;
  
        if (dist < interactionRadius) {
          // Repel effect
          const dir = vec.clone().sub(mouseVec).normalize();
          const force = (interactionRadius - dist) * 0.5;
          target.copy(vec).add(dir.multiplyScalar(force));
        } else {
          target.copy(vec);
        }
  
        // Fluid return LERP
        positionsArray[i3] += (target.x - positionsArray[i3]) * 0.08;
        positionsArray[i3 + 1] += (target.y - positionsArray[i3 + 1]) * 0.08;
        positionsArray[i3 + 2] += (target.z - positionsArray[i3 + 2]) * 0.08;
      }
  
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#D4FF3F"
        transparent
        opacity={0.25}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function InteractiveSphere() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]} gl={{ antialias: false, alpha: true }}>
      <ambientLight intensity={0.5} />
      <HollowSphereParticles />
    </Canvas>
  );
}