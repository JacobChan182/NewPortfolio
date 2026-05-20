import { Canvas, useThree } from '@react-three/fiber';
import { Environment, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useLayoutEffect } from 'react';
import { Box3, Group, PerspectiveCamera, Vector3 } from 'three';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const CHANOCASTER_MODEL_URL = '/models/chanocaster.glb';

const MODEL_ROTATION: [number, number, number] = [0, Math.PI + Math.PI / 2, 0];
const MODEL_Y_OFFSET = -3.2;

useGLTF.preload(CHANOCASTER_MODEL_URL);

function Model() {
  const { scene } = useGLTF(CHANOCASTER_MODEL_URL);
  return (
    <group rotation={MODEL_ROTATION} position={[0, MODEL_Y_OFFSET, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function FitCamera() {
  const { scene } = useGLTF(CHANOCASTER_MODEL_URL);
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    const wrapper = new Group();
    wrapper.rotation.set(...MODEL_ROTATION);
    wrapper.position.set(0, MODEL_Y_OFFSET, 0);
    wrapper.add(scene.clone(true));

    const box = new Box3().setFromObject(wrapper);
    const center = new Vector3();
    const dims = new Vector3();
    box.getCenter(center);
    box.getSize(dims);

    const persp = camera as PerspectiveCamera;
    const maxDim = Math.max(dims.x, dims.y, dims.z);
    const aspect = size.width / size.height || 1;
    const vFov = (persp.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const fitHeight = maxDim / (2 * Math.tan(vFov / 2));
    const fitWidth = maxDim / (2 * Math.tan(hFov / 2));
    const distance = Math.max(fitHeight, fitWidth) * 0.88;

    persp.position.set(center.x, center.y, center.z + distance);
    persp.lookAt(center);
    persp.near = 0.1;
    persp.far = distance * 4;
    persp.updateProjectionMatrix();
  }, [scene, camera, size.width, size.height]);

  return null;
}

function Scene() {
  const { invalidate } = useThree();

  useEffect(() => {
    invalidate();
  }, [invalidate]);

  return (
    <>
      <color attach="background" args={['#ffffff']} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} />
      <Suspense fallback={null}>
        <Model />
        <FitCamera />
        <Environment preset="studio" />
      </Suspense>
    </>
  );
}

export function ChanocasterBackground() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className="chanocaster-bg chanocaster-bg--fallback" aria-hidden />;
  }

  return (
    <div className="chanocaster-bg" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        frameloop="demand"
        resize={{ scroll: false, debounce: 0 }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
