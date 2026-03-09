// components/3D/Scene.tsx
import { Canvas } from "@react-three/fiber";
import { useRef, Suspense } from "react";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { Group } from "three";

function GLTFModel() {
  const group = useRef<Group>(null);
  const { scene } = useGLTF("/models/character.glb?v=8");

  if (!scene) return null;

  // ★ 固定スケール＆位置
  const SCALE = 1.5; // さらに大きく
  const Y_OFFSET = -0.2; // ごく軽く中央へ

  return (
    <group
      ref={group}
      scale={[SCALE, SCALE, SCALE]}
      position={[0, Y_OFFSET, 0]}
    >
      <primitive object={scene} />
    </group>
  );
}

function LoadingCube() {
  return (
    <group position={[0, -0.4, 0]}>
      <mesh>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="skyblue" />
      </mesh>
    </group>
  );
}

export default function Scene() {
  return (
    <Canvas
      // 親divが 120x120 なので、その中で100%フィットさせる
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
        display: "block",
      }}
      camera={{
        position: [0, 0, 2.2], // ★ カメラを少し遠めに
        fov: 50,
      }}
      gl={{ alpha: true, antialias: true }}
      frameloop="demand" // 負荷軽減
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 5, 4]} intensity={1.0} />

      <Suspense fallback={<LoadingCube />}>
        <GLTFModel />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={false}
      />
    </Canvas>
  );
}
