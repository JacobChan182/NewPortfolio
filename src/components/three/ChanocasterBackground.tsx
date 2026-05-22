import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import type { Group, Material, Mesh, Object3D, Texture } from 'three';
import { Box3, Group as ThreeGroup, PerspectiveCamera, Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/** Balanced mesh: `npm run optimize-chanocaster` → chanocaster-mid.glb (~65% of source verts) */
export const CHANOCASTER_MODEL_URL = '/models/chanocaster-mid.glb';

const MODEL_ROTATION: [number, number, number] = [0, 0, 0];
const MODEL_Y_OFFSET = 0;
const AUTO_SPIN_SPEED = 0.4;
const MAX_SPIN_DELTA = 1 / 30;
const MAX_DPR = 1.25;
const RESIZE_DEBOUNCE_MS = 200;

useGLTF.preload(CHANOCASTER_MODEL_URL);

type ModelBounds = {
  center: Vector3;
  maxDim: number;
};

function optimizeScene(scene: Object3D) {
  scene.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;

    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.frustumCulled = true;

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (!material) continue;
      tuneMaterial(material);
    }
  });
}

function tuneMaterial(mat: Material) {
  for (const key of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap'] as const) {
    const tex = (mat as unknown as Record<string, unknown>)[key];
    if (tex && typeof tex === 'object' && 'anisotropy' in tex) {
      (tex as Texture).anisotropy = 1;
    }
  }
}

function computeModelBounds(scene: Object3D): ModelBounds {
  const wrapper = new ThreeGroup();
  wrapper.rotation.set(...MODEL_ROTATION);
  wrapper.position.set(0, MODEL_Y_OFFSET, 0);
  wrapper.add(scene.clone(true));

  const box = new Box3().setFromObject(wrapper);
  const center = new Vector3();
  const dims = new Vector3();
  box.getCenter(center);
  box.getSize(dims);

  return { center, maxDim: Math.max(dims.x, dims.y, dims.z) };
}

function ChanocasterContent({
  userHasGrabbedRef,
  spinEnabledRef,
}: {
  userHasGrabbedRef: RefObject<boolean>;
  spinEnabledRef: RefObject<boolean>;
}) {
  const { scene } = useGLTF(CHANOCASTER_MODEL_URL);

  const preparedScene = useMemo(() => {
    optimizeScene(scene);
    return scene;
  }, [scene]);

  const bounds = useMemo(() => computeModelBounds(preparedScene), [preparedScene]);

  return (
    <>
      <Model
        scene={preparedScene}
        userHasGrabbedRef={userHasGrabbedRef}
        spinEnabledRef={spinEnabledRef}
      />
      <FitCamera bounds={bounds} spinEnabledRef={spinEnabledRef} />
      <Environment preset="studio" frames={1} background={false} environmentIntensity={0.85} />
      <LockedOrbitControls userHasGrabbedRef={userHasGrabbedRef} />
    </>
  );
}

function Model({
  scene,
  userHasGrabbedRef,
  spinEnabledRef,
}: {
  scene: Object3D;
  userHasGrabbedRef: RefObject<boolean>;
  spinEnabledRef: RefObject<boolean>;
}) {
  const groupRef = useRef<Group>(null);
  const spinY = useRef(0);
  const reducedMotion = useReducedMotion();

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    group.rotation.x = MODEL_ROTATION[0];
    group.rotation.z = MODEL_ROTATION[2];

    if (!spinEnabledRef.current || reducedMotion || userHasGrabbedRef.current) {
      group.rotation.y = MODEL_ROTATION[1] + spinY.current;
      return;
    }

    spinY.current += Math.min(delta, MAX_SPIN_DELTA) * AUTO_SPIN_SPEED;
    group.rotation.y = MODEL_ROTATION[1] + spinY.current;
  });

  return (
    <group ref={groupRef} rotation={MODEL_ROTATION} position={[0, MODEL_Y_OFFSET, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function FitCamera({
  bounds,
  spinEnabledRef,
}: {
  bounds: ModelBounds;
  spinEnabledRef: RefObject<boolean>;
}) {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    spinEnabledRef.current = false;

    const persp = camera as PerspectiveCamera;
    const aspect = size.width / size.height || 1;
    const vFov = (persp.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const fitHeight = bounds.maxDim / (2 * Math.tan(vFov / 2));
    const fitWidth = bounds.maxDim / (2 * Math.tan(hFov / 2));
    const distance = Math.max(fitHeight, fitWidth) * 0.88;

    persp.position.set(bounds.center.x, bounds.center.y, bounds.center.z + distance);
    persp.lookAt(bounds.center);
    persp.near = 0.1;
    persp.far = distance * 4;
    persp.updateProjectionMatrix();

    spinEnabledRef.current = true;
  }, [bounds, camera, size.width, size.height, spinEnabledRef]);

  return null;
}

function LockedOrbitControls({
  userHasGrabbedRef,
}: {
  userHasGrabbedRef: RefObject<boolean>;
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useLayoutEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const polar = controls.getPolarAngle();
    controls.minPolarAngle = polar;
    controls.maxPolarAngle = polar;
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={false}
      enableDamping={false}
      onStart={() => {
        userHasGrabbedRef.current = true;
      }}
      onEnd={() => {
        userHasGrabbedRef.current = false;
      }}
    />
  );
}

function Scene() {
  const userHasGrabbedRef = useRef(false);
  const spinEnabledRef = useRef(false);

  return (
    <>
      <color attach="background" args={['#ffffff']} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} />
      <AdaptiveDpr pixelated />
      <Suspense fallback={null}>
        <ChanocasterContent
          userHasGrabbedRef={userHasGrabbedRef}
          spinEnabledRef={spinEnabledRef}
        />
      </Suspense>
    </>
  );
}

type ChanocasterCanvasProps = {
  className: string;
  eventSourceRef?: RefObject<HTMLElement | null>;
};

function ChanocasterCanvas({ className, eventSourceRef }: ChanocasterCanvasProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const dpr = Math.min(
    typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    MAX_DPR,
  );

  useEffect(() => {
    const el = eventSourceRef?.current ?? containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '80px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eventSourceRef]);

  if (reducedMotion) {
    return <div className={`${className} ${className}--fallback`} aria-hidden />;
  }

  return (
    <div ref={containerRef} className={className} aria-hidden>
      <Canvas
        eventSource={(eventSourceRef ?? containerRef) as RefObject<HTMLElement>}
        eventPrefix="client"
        camera={{ position: [0, 0, 4], fov: 42 }}
        dpr={dpr}
        gl={{
          antialias: true,
          alpha: false,
          stencil: false,
          powerPreference: 'high-performance',
        }}
        frameloop={inView ? 'always' : 'demand'}
        resize={{ scroll: false, debounce: RESIZE_DEBOUNCE_MS }}
        style={{ pointerEvents: eventSourceRef ? 'none' : 'auto' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

export function ChanocasterBackground() {
  return <ChanocasterCanvas className="chanocaster-bg" />;
}

export function ChanocasterHeroLogo({
  eventSourceRef,
}: {
  eventSourceRef?: RefObject<HTMLElement | null>;
}) {
  return <ChanocasterCanvas className="hero__logo" eventSourceRef={eventSourceRef} />;
}
