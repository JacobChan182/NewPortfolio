import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, Environment, useGLTF } from '@react-three/drei';
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
import { useReducedMotion } from '../../hooks/useReducedMotion';

/** Balanced mesh: `npm run optimize-chanocaster` → chanocaster-mid.glb (~65% of source verts) */
export const CHANOCASTER_MODEL_URL = '/models/chanocaster-mid.glb';

const MODEL_ROTATION: [number, number, number] = [0, 0, 0];
const MODEL_Y_OFFSET = 0;
const AUTO_SPIN_SPEED = 0.4;
const MAX_SPIN_DELTA = 1 / 30;
const DRAG_ROTATE_SENSITIVITY = 0.008;
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

/** Pointer drag on hero (or canvas) rotates the model on Y — same axis as auto-spin */
function usePointerDragRotate(
  dragRoot: HTMLElement | null,
  spinY: RefObject<number>,
  userHasGrabbedRef: RefObject<boolean>,
) {
  useEffect(() => {
    if (!dragRoot) return;

    let dragging = false;
    let lastX = 0;
    let pointerId = -1;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      pointerId = e.pointerId;
      lastX = e.clientX;
      userHasGrabbedRef.current = true;
      dragRoot.classList.add('hero--dragging');
      dragRoot.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      spinY.current += dx * DRAG_ROTATE_SENSITIVITY;
    };

    const endDrag = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      dragging = false;
      userHasGrabbedRef.current = false;
      dragRoot.classList.remove('hero--dragging');
      if (dragRoot.hasPointerCapture(e.pointerId)) {
        dragRoot.releasePointerCapture(e.pointerId);
      }
    };

    dragRoot.addEventListener('pointerdown', onPointerDown);
    dragRoot.addEventListener('pointermove', onPointerMove);
    dragRoot.addEventListener('pointerup', endDrag);
    dragRoot.addEventListener('pointercancel', endDrag);

    return () => {
      dragRoot.removeEventListener('pointerdown', onPointerDown);
      dragRoot.removeEventListener('pointermove', onPointerMove);
      dragRoot.removeEventListener('pointerup', endDrag);
      dragRoot.removeEventListener('pointercancel', endDrag);
    };
  }, [dragRoot, spinY, userHasGrabbedRef]);
}

function ChanocasterContent({
  userHasGrabbedRef,
  spinEnabledRef,
  spinY,
}: {
  userHasGrabbedRef: RefObject<boolean>;
  spinEnabledRef: RefObject<boolean>;
  spinY: RefObject<number>;
}) {
  const { scene } = useGLTF(CHANOCASTER_MODEL_URL);

  const preparedScene = useMemo(() => {
    optimizeScene(scene);
    return scene;
  }, [scene]);

  const bounds = useMemo(() => computeModelBounds(preparedScene), [preparedScene]);

  return (
    <>
      <Model userHasGrabbedRef={userHasGrabbedRef} spinEnabledRef={spinEnabledRef} spinY={spinY} scene={preparedScene} />
      <FitCamera bounds={bounds} spinEnabledRef={spinEnabledRef} />
      <Environment preset="studio" frames={1} background={false} environmentIntensity={0.85} />
    </>
  );
}

function Model({
  scene,
  userHasGrabbedRef,
  spinEnabledRef,
  spinY,
}: {
  scene: Object3D;
  userHasGrabbedRef: RefObject<boolean>;
  spinEnabledRef: RefObject<boolean>;
  spinY: RefObject<number>;
}) {
  const groupRef = useRef<Group>(null);
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

function Scene({ dragRoot }: { dragRoot: HTMLElement | null }) {
  const userHasGrabbedRef = useRef(false);
  const spinEnabledRef = useRef(false);
  const spinY = useRef(0);

  usePointerDragRotate(dragRoot, spinY, userHasGrabbedRef);

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
          spinY={spinY}
        />
      </Suspense>
    </>
  );
}

type ChanocasterCanvasProps = {
  className: string;
  /** Hero section element — drag anywhere on it to rotate the guitar */
  dragRoot?: HTMLElement | null;
};

function ChanocasterCanvas({ className, dragRoot = null }: ChanocasterCanvasProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [localDragRoot, setLocalDragRoot] = useState<HTMLElement | null>(null);
  const [inView, setInView] = useState(true);
  const effectiveDragRoot = dragRoot ?? localDragRoot;

  const dpr = Math.min(
    typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    MAX_DPR,
  );

  useEffect(() => {
    if (dragRoot) return;
    setLocalDragRoot(containerRef.current);
  }, [dragRoot]);

  useEffect(() => {
    const el = effectiveDragRoot ?? containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '80px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [effectiveDragRoot]);

  if (reducedMotion) {
    return <div className={`${className} ${className}--fallback`} aria-hidden />;
  }

  return (
    <div ref={containerRef} className={className} aria-hidden>
      <Canvas
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
      >
        <Scene dragRoot={effectiveDragRoot} />
      </Canvas>
    </div>
  );
}

export function ChanocasterBackground() {
  return <ChanocasterCanvas className="chanocaster-bg" />;
}

export function ChanocasterHeroLogo({ dragRoot }: { dragRoot: HTMLElement | null }) {
  return <ChanocasterCanvas className="hero__logo" dragRoot={dragRoot} />;
}
