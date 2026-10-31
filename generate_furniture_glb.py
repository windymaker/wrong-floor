"""Generate the Wrong Floor classroom furniture GLB (v2, finer detail).

Only furniture + blackboard. Walls, floor, windows, curtains and lights stay
procedural in level.js so the five anomalies keep their exact anchors.

Coordinates follow src/layout.js: X -10..10, Z -6..6, Y up, floor y = 0.
"""
import json
import pathlib
import struct

OUT = pathlib.Path(__file__).resolve().parent / 'w05_3d_game' / 'assets' / 'models' / 'classroom_m1_v01.glb'

MATERIALS = [
    ('Wood', [0.34, 0.22, 0.13, 1]),
    ('WoodDark', [0.20, 0.13, 0.085, 1]),
    ('Metal', [0.24, 0.26, 0.29, 1]),
    ('Board', [0.035, 0.085, 0.065, 1]),
    ('Trim', [0.42, 0.33, 0.20, 1]),
    ('Chalk', [0.83, 0.83, 0.78, 1]),
]
MAT_INDEX = {name: i for i, (name, _) in enumerate(MATERIALS)}
BOXES = []


def box(mat, cx, cy, cz, sx, sy, sz):
    BOXES.append((MAT_INDEX[mat], cx, cy, cz, sx, sy, sz))


DESK_X = [-7.4, -4.6, -1.8, 1.8, 4.6, 6.8]
DESK_Z = [-4.0, -1.5, 1.5, 4.0]
TOP_H = 0.78
TOP_D = 0.62
TOP_W = 1.16

for dx in DESK_X:
    for dz in DESK_Z:
        # --- desk top ---
        box('Wood', dx, TOP_H - 0.025, dz, TOP_D, 0.05, TOP_W)
        box('WoodDark', dx, TOP_H - 0.056, dz, TOP_D - 0.03, 0.012, TOP_W - 0.03)
        # side rails under the top
        for lz in (-1, 1):
            box('WoodDark', dx, TOP_H - 0.075, dz + lz * 0.50, TOP_D - 0.08, 0.05, 0.035)
        # legs
        for lx in (-1, 1):
            for lz in (-1, 1):
                box('Metal', dx + lx * 0.25, 0.36, dz + lz * 0.50, 0.045, 0.72, 0.045)
        # stretchers
        for lz in (-1, 1):
            box('Metal', dx, 0.15, dz + lz * 0.50, 0.44, 0.03, 0.03)
        for lx in (-1, 1):
            box('Metal', dx + lx * 0.25, 0.15, dz, 0.03, 0.03, 0.96)
        # modesty panel on the student side
        box('WoodDark', dx - 0.27, 0.58, dz, 0.022, 0.26, TOP_W - 0.12)
        # book shelf under the desktop
        box('WoodDark', dx, 0.32, dz, 0.50, 0.02, 0.94)

        # --- chair (student faces +X) ---
        cx = dx - 0.48
        box('WoodDark', cx, 0.45, dz, 0.42, 0.05, 0.42)
        box('Metal', cx, 0.412, dz, 0.45, 0.025, 0.45)
        for lx in (-1, 1):
            for lz in (-1, 1):
                box('Metal', cx + lx * 0.175, 0.205, dz + lz * 0.175, 0.038, 0.41, 0.038)
        for lz in (-1, 1):
            box('Metal', cx, 0.135, dz + lz * 0.175, 0.33, 0.028, 0.028)
        # back posts
        for lz in (-1, 1):
            box('WoodDark', cx - 0.20, 0.70, dz + lz * 0.18, 0.042, 0.46, 0.042)
        # back slats
        for i, y in enumerate((0.575, 0.695, 0.815)):
            box('WoodDark', cx - 0.195, y, dz, 0.028, 0.075, 0.33)
        # top rail
        box('WoodDark', cx - 0.195, 0.925, dz, 0.045, 0.055, 0.42)
        # seat-to-back brace
        box('Metal', cx - 0.20, 0.475, dz, 0.07, 0.09, 0.07)

# --- teacher desk ---
TD_X = 8.2
box('Wood', TD_X, 0.775, 0, 0.78, 0.05, 1.74)
box('WoodDark', TD_X, 0.742, 0, 0.74, 0.014, 1.68)
box('WoodDark', TD_X - 0.375, 0.46, 0, 0.03, 0.60, 1.66)   # front panel
for lz in (-1, 1):
    box('WoodDark', TD_X, 0.46, lz * 0.84, 0.72, 0.62, 0.045)  # side panels
# drawers on the teacher side (+X)
for i, y in enumerate((0.60, 0.42)):
    box('Wood', TD_X + 0.365, y, -0.30, 0.025, 0.16, 0.52)
    box('Metal', TD_X + 0.382, y, -0.30, 0.015, 0.018, 0.12)
box('Wood', TD_X + 0.365, 0.51, 0.55, 0.025, 0.34, 0.60)    # cupboard door
box('Metal', TD_X + 0.382, 0.62, 0.78, 0.015, 0.018, 0.10)
box('WoodDark', TD_X, 0.05, 0, 0.62, 0.05, 1.52)            # toe kick

# --- blackboard on the +X wall ---
BOARD_X = 9.93
box('Board', BOARD_X, 1.70, 0, 0.05, 1.15, 4.20)
box('Trim', 9.90, 2.295, 0, 0.06, 0.07, 4.34)               # top frame
box('Trim', 9.90, 1.105, 0, 0.06, 0.07, 4.34)               # bottom frame
for lz in (-1, 1):
    box('Trim', 9.90, 1.70, lz * 2.135, 0.06, 1.22, 0.07)   # side frames
box('Trim', 9.86, 1.062, 0, 0.16, 0.04, 4.20)               # chalk tray
for i, z in enumerate((-0.85, 0.1, 0.95)):
    box('Chalk', 9.86, 1.092, z, 0.022, 0.022, 0.085)
box('WoodDark', 9.86, 1.096, 1.45, 0.10, 0.032, 0.17)       # eraser
for lz in (-1, 1):
    box('Metal', 9.99, 1.70, lz * 1.95, 0.10, 0.05, 0.10)    # wall brackets

# --- build geometry (24 verts per box, per-face normals) ---
FACES = [
    ((0, 0, 1), [(-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1)]),
    ((0, 0, -1), [(1, -1, -1), (-1, -1, -1), (-1, 1, -1), (1, 1, -1)]),
    ((1, 0, 0), [(1, -1, 1), (1, -1, -1), (1, 1, -1), (1, 1, 1)]),
    ((-1, 0, 0), [(-1, -1, -1), (-1, -1, 1), (-1, 1, 1), (-1, 1, -1)]),
    ((0, 1, 0), [(-1, 1, 1), (1, 1, 1), (1, 1, -1), (-1, 1, -1)]),
    ((0, -1, 0), [(-1, -1, -1), (1, -1, -1), (1, -1, 1), (-1, -1, 1)]),
]

batches = {i: ([], []) for i in range(len(MATERIALS))}
for mat, cx, cy, cz, sx, sy, sz in BOXES:
    verts, idx = batches[mat]
    for normal, corners in FACES:
        base = len(verts)
        for cxr, cyr, czr in corners:
            verts.append((cx + cxr * sx / 2, cy + cyr * sy / 2, cz + czr * sz / 2,
                          normal[0], normal[1], normal[2]))
        idx.extend([base, base + 1, base + 2, base, base + 2, base + 3])

positions, normals, indices = [], [], []
meshes, nodes = [], []
for mat in range(len(MATERIALS)):
    verts, idx = batches[mat]
    if not verts:
        continue
    offset = len(positions)
    for x, y, z, nx, ny, nz in verts:
        positions.append((x, y, z))
        normals.append((nx, ny, nz))
    indices.extend(i + offset for i in idx)
    meshes.append({'name': f'Furniture_{MATERIALS[mat][0]}', 'primitives': [{
        'attributes': {'POSITION': 0, 'NORMAL': 1}, 'indices': 2, 'material': mat}]})
    nodes.append({'name': f'M1_{MATERIALS[mat][0]}', 'mesh': len(meshes) - 1,
                  'extras': {'staticVisual': True}})

pmin = [min(p[i] for p in positions) for i in range(3)]
pmax = [max(p[i] for p in positions) for i in range(3)]

pos_bytes = b''.join(struct.pack('<3f', *p) for p in positions)
nrm_bytes = b''.join(struct.pack('<3f', *n) for n in normals)
idx_bytes = b''.join(struct.pack('<I', i) for i in indices)


def pad4(data):
    return data + b'\0' * ((4 - len(data) % 4) % 4)


views, accessors, blob = [], [], b''
for data, target, comp_type, count, kind, extra in (
    (pos_bytes, 34962, 5126, len(positions), 'VEC3', {'min': pmin, 'max': pmax}),
    (nrm_bytes, 34962, 5126, len(normals), 'VEC3', {}),
    (idx_bytes, 34963, 5125, len(indices), 'SCALAR', {}),
):
    blob = pad4(blob)
    views.append({'buffer': 0, 'byteOffset': len(blob), 'byteLength': len(data), 'target': target})
    accessors.append({'bufferView': len(views) - 1, 'componentType': comp_type,
                      'count': count, 'type': kind, **extra})
    blob += data
blob = pad4(blob)

meta = {
    'asset': {'version': '2.0', 'generator': 'Wrong Floor M1 furniture v2'},
    'scene': 0,
    'scenes': [{'nodes': list(range(len(nodes)))}],
    'nodes': nodes,
    'meshes': meshes,
    'materials': [{
        'name': name,
        'pbrMetallicRoughness': {
            'baseColorFactor': color,
            'metallicFactor': 0.55 if name in ('Metal',) else 0.04,
            'roughnessFactor': 0.42 if name in ('Metal', 'Chalk') else 0.82,
        },
        'doubleSided': False,
    } for name, color in MATERIALS],
    'buffers': [{'byteLength': len(blob)}],
    'bufferViews': views,
    'accessors': accessors,
}

js = json.dumps(meta, separators=(',', ':')).encode('utf-8')
js += b' ' * ((4 - len(js) % 4) % 4)  # GLB spec: JSON chunk is space padded
glb = struct.pack('<4sII', b'glTF', 2, 12 + 8 + len(js) + 8 + len(blob))
glb += struct.pack('<I4s', len(js), b'JSON') + js
glb += struct.pack('<I4s', len(blob), b'BIN\0') + blob
OUT.write_bytes(glb)
print(f'wrote {OUT}')
print(f'boxes={len(BOXES)} meshes={len(meshes)} triangles={len(indices) // 3} bytes={len(glb)}')
