import { useGLTF } from '@react-three/drei'

export function Model() {
  const { scene } = useGLTF('/models/character.glb')
  return <primitive object={scene} />
}
