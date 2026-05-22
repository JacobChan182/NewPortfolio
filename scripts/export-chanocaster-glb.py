"""Export animated GLB from chanocasteranimation.blend (run via Blender --background)."""
import bpy
import os

blend_path = bpy.data.filepath
if not blend_path:
    raise RuntimeError("Open chanocasteranimation.blend before running this script.")

root = os.path.dirname(os.path.dirname(blend_path))
out_path = os.path.join(root, "chanocaster.glb")

# Use all actions so the full 120-frame spin is included
bpy.ops.export_scene.gltf(
    filepath=out_path,
    export_format="GLB",
    export_animations=True,
    export_animation_mode="ACTIONS",
    export_nla_strips=False,
    export_apply=True,
    export_yup=True,
)

print(f"Exported: {out_path}")
if bpy.data.actions:
    for action in bpy.data.actions:
        print(f"  Action: {action.name} frames {action.frame_range[0]}-{action.frame_range[1]}")
else:
    print("  WARNING: No actions in blend file")
