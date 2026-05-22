"""Inspect guitarAction rotation keyframes (Blender 5 layered actions)."""
import bpy
import math

ACTION_NAME = "guitarAction"


def iter_channelbags(action):
    if not getattr(action, "is_action_layered", False):
        if hasattr(action, "fcurves"):
            yield "legacy", action.fcurves
        return

    for li, layer in enumerate(action.layers):
        for si, strip in enumerate(layer.strips):
            if strip.type != "KEYFRAME":
                continue
            for slot in action.slots:
                bag = strip.channelbag(slot, ensure=False)
                if bag is not None:
                    yield f"{layer.name}/strip{si}/{slot.name}", bag.fcurves


def main():
    action = bpy.data.actions.get(ACTION_NAME)
    if not action:
        print(f"ERROR: Action '{ACTION_NAME}' not found.")
        print("Available:", [a.name for a in bpy.data.actions])
        return

    scene = bpy.context.scene
    print(f"=== Action: {action.name} ===")
    print(f"Layered: {action.is_action_layered}  Legacy: {action.is_action_legacy}")
    print(f"Frame range: {action.frame_range[0]} - {action.frame_range[1]}")
    print(f"Scene FPS: {scene.render.fps}")
    print(f"Timeline: {scene.frame_start} - {scene.frame_end}")

    rotation_fcurves = []
    all_fcurves = []

    for source, fcurves in iter_channelbags(action):
        for fc in fcurves:
            all_fcurves.append((source, fc))
            if "rotation" in fc.data_path.lower():
                rotation_fcurves.append((source, fc))

    print(f"\nTotal F-Curves: {len(all_fcurves)}")
    print(f"Rotation F-Curves: {len(rotation_fcurves)}")

    if not rotation_fcurves:
        print("\nAll data_paths (first 30):")
        for source, fc in all_fcurves[:30]:
            print(f"  [{source}] {fc.data_path} [{fc.array_index}]")

    start = int(action.frame_range[0])
    end = int(action.frame_range[1])

    for source, fc in rotation_fcurves:
        print(f"\n--- [{source}] {fc.data_path} index={fc.array_index} ---")
        print(f"Keyframes: {len(fc.keyframe_points)}")

        for kp in fc.keyframe_points:
            print(
                f"  frame {kp.co[0]:6.1f}  value {kp.co[1]:10.4f} rad ({math.degrees(kp.co[1]):8.2f} deg)  "
                f"interp={kp.interpolation}  easing={kp.easing}"
            )

        # Check linearity: compare sampled vs ideal lerp
        if len(fc.keyframe_points) >= 2:
            k0 = fc.keyframe_points[0]
            k1 = fc.keyframe_points[-1]
            f0, v0 = k0.co[0], k0.co[1]
            f1, v1 = k1.co[0], k1.co[1]
            print(f"\n  Linearity check (first -> last key):")
            print(f"  Key A: frame {f0}, value {v0:.4f}")
            print(f"  Key B: frame {f1}, value {v1:.4f}")
            print(f"  Interpolation on keys: {k0.interpolation} / {k1.interpolation}")

            for f in [start, 30, 60, 90, end]:
                actual = fc.evaluate(f)
                t = (f - f0) / (f1 - f0) if f1 != f0 else 0
                expected = v0 + (v1 - v0) * t
                delta = actual - expected
                print(
                    f"    frame {f:3d}: actual {actual:8.4f}  linear expect {expected:8.4f}  "
                    f"delta {delta:+.4f} rad ({math.degrees(delta):+.2f} deg)"
                )

    print("\n=== Animated objects ===")
    for obj in bpy.data.objects:
        ad = obj.animation_data
        if not ad:
            continue
        if ad.action and ad.action.name == ACTION_NAME:
            print(f"  {obj.name} type={obj.type} rotation_mode={getattr(obj, 'rotation_mode', 'n/a')}")
        for track in ad.nla_tracks:
            for strip in track.strips:
                if strip.action and strip.action.name == ACTION_NAME:
                    print(
                        f"  NLA {obj.name}: frames {strip.frame_start}-{strip.frame_end} "
                        f"scale={strip.scale} repeat={strip.repeat}"
                    )


main()
