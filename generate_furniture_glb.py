"""生成 Wrong Floor 教室家具 GLB（批处理、含法线）。

只包含：课桌、椅子、教师桌、黑板（含边框与粉笔槽）。
墙体/地面/门窗/窗帘/灯仍由 level.js 程序化生成，避免与异常位置冲突。
坐标与 src/layout.js 一致：X -10..10，Z -6..6，Y 向上，地面 y=0。
"""
import json
import math
import pathlib
import struct

OUT = pathlib.Path(__file__).resolve().parent / 'w05_3d_game' / 'assets' / 'models' / 'classroom_m1_v01.glb'

MATERIALS = [
    ('Wood', [0.34, 0.22, 0.13, 1]),
    ('WoodDark', [0.22, 0.14, 0.09, 1]),
    ('Metal', [0.24, 0.26, 0.29, 1]),
    ('Board', [0.035, 0.085, 0.065, 1]),
    ('Trim', [0.42, 0.33, 0.20, 1]),
]
MAT_INDEX = {name: i for i, (name, _) in enumerate(MATERIALS)}

# 每个 box: (材质, 中心x, 中心y, 中心z, 尺寸x, 尺寸y, 尺寸z)
BOXES = []


def box(mat, cx, cy, cz, sx, sy, sz):
    BOXES.append((MAT_INDEX[mat], cx, cy, cz, sx, sy, sz))


# ---- 课桌 + 椅子（与 layout.desks 一致：6 列 × 4 排）----
DESK_X = [-7.4, -4.6, -1.8, 1.8, 4.6, 6.8]
DESK_Z = [-4.0, -1.5, 1.5, 4.0]
TOP_H = 0.78
TOP_D = 0.62   # X 方向深度
TOP_W = 1.16   # Z 方向宽度

for dx in DESK_X:
    for dz in DESK_Z:
        # 桌面板
        box('Wood', dx, TOP_H - 0.025, dz, TOP_D, 0.05, TOP_W)
        # 桌沿（薄一圈，提升轮廓）
        box('WoodDark', dx, TOP_H - 0.058, dz, TOP_D - 0.04, 0.016, TOP_W - 0.04)
        # 四条桌腿
        for lx in (-1, 1):
            for lz in (-1, 1):
                box('Metal', dx + lx * 0.25, (TOP_H - 0.05) / 2, dz + lz * 0.50, 0.045, TOP_H - 0.05, 0.045)
        # 前后横撑
        for lz in (-1, 1):
            box('Metal', dx, 0.16, dz + lz * 0.50, 0.40, 0.035, 0.035)
        # 学生侧挡板
        box('WoodDark', dx - 0.25, 0.60, dz, 0.022, 0.24, TOP_W - 0.10)

        # 椅子：座位在桌面 -X 侧，学生朝 +X 面向黑板
        cx = dx - 0.48
        box('WoodDark', cx, 0.45, dz, 0.42, 0.05, 0.42)          # 座面
        box('WoodDark', cx - 0.18, 0.72, dz, 0.05, 0.42, 0.42)   # 靠背
        for lx in (-1, 1):
            for lz in (-1, 1):
                box('Metal', cx + lx * 0.17, 0.225, dz + lz * 0.17, 0.04, 0.45, 0.04)
        box('Metal', cx, 0.10, dz, 0.34, 0.03, 0.34)             # 椅脚圈

# ---- 教师桌（x=8.2，宽 Z 1.7）----
TD_X, TD_Z = 8.2, 0.0
box('Wood', TD_X, 0.775, TD_Z, 0.78, 0.05, 1.74)          # 台面
box('WoodDark', TD_X + 0.36, 0.46, TD_Z, 0.04, 0.62, 1.66)  # 靠黑板挡板
for lz in (-1, 1):
    box('WoodDark', TD_X, 0.46, TD_Z + lz * 0.84, 0.72, 0.62, 0.045)  # 侧板
box('Metal', TD_X, 0.13, TD_Z, 0.60, 0.04, 1.60)          # 底撑
box('WoodDark', TD_X - 0.33, 0.44, TD_Z, 0.03, 0.58, 1.50)  # 前挡板

# ---- 黑板（+X 墙，front 面 x=9.86，异常面在 9.84 更靠室内）----
BOARD_X = 9.90
box('Board', BOARD_X + 0.03, 1.70, 0, 0.05, 1.15, 4.20)   # 板面
# 边框四条（比板面略凸，但在异常面之后）
box('Trim', BOARD_X - 0.01, 2.295, 0, 0.08, 0.07, 4.34)   # 上
box('Trim', BOARD_X - 0.01, 1.105, 0, 0.08, 0.07, 4.34)   # 下
for lz in (-1, 1):
    box('Trim', BOARD_X - 0.01, 1.70, lz * 2.135, 0.08, 1.20, 0.07)  # 侧
# 粉笔槽
box('Trim', BOARD_X - 0.06, 1.065, 0, 0.14, 0.045, 4.20)

# ---- 生成几何 ----
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
            verts.append((cx + cxr * sx / 2, cy + cyr * sy / 2, cz + czr * sz / 2, normal[0], normal[1], normal[2]))
        idx.extend([base, base + 1, base + 2, base, base + 2, base + 3])

positions, normals, indices = [], [], []
mesh_defs, node_defs = [], []
for mat in range(len(MATERIALS)):
    verts, idx = batches[mat]
    if not verts:
        continue
    v_offset = len(positions)
    for x, y, z, nx, ny, nz in verts:
        positions.append((x, y, z))
        normals.append((nx, ny, nz))
    indices.extend(i + v_offset for i in idx)
    mesh_defs.append({'name': f'Furniture_{MATERIALS[mat][0]}', 'primitives': [{
        'attributes': {'POSITION': 0, 'NORMAL': 1}, 'indices': 2, 'material': mat}]})
    node_defs.append({'name': f'M1_{MATERIALS[mat][0]}', 'mesh': len(mesh_defs) - 1,
                      'extras': {'staticVisual': True}})

pmin = [min(p[i] for p in positions) for i in range(3)]
pmax = [max(p[i] for p in positions) for i in range(3)]

pos_bytes = b''.join(struct.pack('<3f', *p) for p in positions)
nrm_bytes = b''.join(struct.pack('<3f', *n) for n in normals)
idx_bytes = b''.join(struct.pack('<I', i) for i in indices)


def pad4(b):
    return b + b'\0' * ((4 - len(b) % 4) % 4)


views, accessors, blob, offset = [], [], b'', 0
for data, target, comp_type, count, kind, extra in (
    (pos_bytes, 34962, 5126, len(positions), 'VEC3', {'min': pmin, 'max': pmax}),
    (nrm_bytes, 34962, 5126, len(normals), 'VEC3', {}),
    (idx_bytes, 34963, 5125, len(indices), 'SCALAR', {}),
):
    blob = pad4(blob)
    offset = len(blob)
    views.append({'buffer': 0, 'byteOffset': offset, 'byteLength': len(data), 'target': target})
    accessors.append({'bufferView': len(views) - 1, 'componentType': comp_type, 'count': count, 'type': kind, **extra})
    blob += data
blob = pad4(blob)

meta = {
    'asset': {'version': '2.0', 'generator': 'Wrong Floor M1 furniture batch'},
    'scene': 0,
    'scenes': [{'nodes': list(range(len(node_defs)))}],
    'nodes': node_defs,
    'meshes': mesh_defs,
    'materials': [{
        'name': name,
        'pbrMetallicRoughness': {
            'baseColorFactor': color,
            'metallicFactor': 0.55 if name == 'Metal' else 0.04,
            'roughnessFactor': 0.45 if name == 'Metal' else 0.82,
        },
        'doubleSided': False,
    } for name, color in MATERIALS],
    'buffers': [{'byteLength': len(blob)}],
    'bufferViews': views,
    'accessors': accessors,
}

js = pad4(json.dumps(meta, separators=(',', ':')).encode('utf-8'))
glb = struct.pack('<4sII', b'glTF', 2, 12 + 8 + len(js) + 8 + len(blob))
glb += struct.pack('<I4s', len(js), b'JSON') + js
glb += struct.pack('<I4s', len(blob), b'BIN\0') + blob
OUT.write_bytes(glb)
print(f'wrote {OUT}')
print(f'boxes={len(BOXES)} meshes={len(mesh_defs)} triangles={len(indices)//3} bytes={len(glb)}')
