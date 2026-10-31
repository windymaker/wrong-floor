import * as THREE from '../vendor/three.module.js';
import { LAYOUT } from './layout.js';
import { hints, successLines } from './team/p1.js';
import { anomalyFactory } from './team/m2.js';
import { tagAnomaly } from './team/contract.js';

export function anomalyHint(level) {
  return hints[level] ?? '';
}

export function anomalyLine(level) {
  return successLines[level] ?? '';
}

/**
 * 每一关只多一个可拍照目标。旧的留在场景里，但打中它们不算过关。
 * 挂到网格上的 userData.anomalyLevel 是拍照射线要认的标记。
 */
export function createAnomaly(level) {
  const custom = anomalyFactory[level];
  if (typeof custom === 'function') return custom(level);
  switch (level) {
    case 1: return createSeat();
    case 2: return createBoard();
    case 3: return createCurtain();
    case 4: return createEcho();
    case 5: return createDoorVision();
    default: throw new Error(`没有第 ${level} 关异常`);
  }
}

function tag(group, level, id) {
  return tagAnomaly(group, level, id);
}

/** 轴对齐盒子，中心定位。 */
function addBox(group, mat, w, h, d, x, y, z, rotZ = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  if (rotZ) mesh.rotation.z = rotZ;
  group.add(mesh);
  return mesh;
}

function addSphere(group, mat, r, x, y, z, scale = [1, 1, 1]) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat);
  mesh.position.set(x, y, z);
  mesh.scale.set(scale[0], scale[1], scale[2]);
  group.add(mesh);
  return mesh;
}

/* ---------------------------------------------------------------- 第 1 关 */

/**
 * 后排坐着的人影：校服、趴在桌上的头、垂在桌面上的手。
 * 身体朝 +X（面向黑板），原点在椅子上。
 */
function createSeat() {
  const group = new THREE.Group();
  group.position.set(LAYOUT.seat.x, 0, LAYOUT.seat.z);

  const uniform = new THREE.MeshStandardMaterial({ color: 0x151a24, roughness: 0.93 });
  const uniformDark = new THREE.MeshStandardMaterial({ color: 0x0e1218, roughness: 0.95 });
  const skin = new THREE.MeshStandardMaterial({ color: 0x7d6757, roughness: 0.88 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x08080a, roughness: 0.98 });
  const collar = new THREE.MeshStandardMaterial({ color: 0x9a978c, roughness: 0.8 });

  // 腿：大腿向前，小腿垂到地面
  addBox(group, uniformDark, 0.34, 0.13, 0.15, 0.14, 0.47, -0.11);
  addBox(group, uniformDark, 0.34, 0.13, 0.15, 0.14, 0.47, 0.11);
  addBox(group, uniformDark, 0.13, 0.40, 0.14, 0.30, 0.24, -0.11);
  addBox(group, uniformDark, 0.13, 0.40, 0.14, 0.30, 0.24, 0.11);
  addBox(group, uniformDark, 0.21, 0.08, 0.15, 0.38, 0.05, -0.11);
  addBox(group, uniformDark, 0.21, 0.08, 0.15, 0.38, 0.05, 0.11);

  // 髋部与躯干（前倾）
  addBox(group, uniform, 0.30, 0.20, 0.36, -0.01, 0.56, 0);
  const torso = addBox(group, uniform, 0.26, 0.44, 0.38, 0.06, 0.86, 0, -0.30);
  const shoulder = addBox(group, uniform, 0.23, 0.10, 0.40, 0.16, 1.03, 0, -0.30); // 肩线
  addBox(group, collar, 0.19, 0.05, 0.30, 0.20, 1.09, 0, -0.30); // 领口
  addBox(group, uniformDark, 0.26, 0.30, 0.02, 0.06, 0.86, -0.195, -0.30); // 背部拉链

  // 手臂：上臂前倾，前臂平摊在桌面上
  for (const side of [-1, 1]) {
    addBox(group, uniform, 0.12, 0.30, 0.12, 0.17, 0.99, side * 0.17, -0.55);
    addBox(group, uniform, 0.30, 0.10, 0.11, 0.34, 0.85, side * 0.17);
    addBox(group, skin, 0.11, 0.06, 0.12, 0.50, 0.83, side * 0.17);
  }

  // 头：前倾倒扣在桌面上，头发盖住后颈
  addBox(group, skin, 0.09, 0.10, 0.09, 0.28, 0.99, 0, -0.7);
  const head = addSphere(group, skin, 0.115, 0.43, 0.90, 0, [1.05, 0.95, 1]);
  const hairCap = addSphere(group, hair, 0.122, 0.415, 0.925, 0, [1.05, 0.85, 1.02]);
  hairCap.rotation.z = -0.25;
  addBox(group, hair, 0.16, 0.12, 0.02, 0.47, 0.86, 0, -0.3); // 垂下的刘海

  tag(group, 1, 'seat');
  const baseShoulderY = 1.03;

  return {
    level: 1,
    id: 'seat',
    group,
    stand: { ...LAYOUT.photoStand },
    aimY: 0.95,
    head,
    update(dt, env) {
      // 灯闪时肩膀起伏一次，像还在呼吸
      const target = baseShoulderY + (env.flickerDark ? 0.045 : 0);
      shoulder.position.y += (target - shoulder.position.y) * Math.min(1, dt * 9);
      torso.rotation.z = -0.30 + Math.sin(env.time * 1.1) * 0.012;
      head.position.y = 0.90 + Math.sin(env.time * 1.6) * 0.004;
    },
  };
}

/* ---------------------------------------------------------------- 第 2 关 */

function createBoard() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#141c17';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 擦不掉的一层旧粉笔灰
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#dfe6dc';
  for (let i = 0; i < 90; i += 1) {
    const x = (i * 137) % canvas.width;
    const y = (i * 89) % canvas.height;
    ctx.fillRect(x, y, 26 + (i % 5) * 9, 3);
  }
  ctx.globalAlpha = 1;

  // 擦过一半的板擦痕
  const smear = ctx.createLinearGradient(120, 0, 720, 0);
  smear.addColorStop(0, 'rgba(210,220,210,0.00)');
  smear.addColorStop(0.5, 'rgba(210,220,210,0.07)');
  smear.addColorStop(1, 'rgba(210,220,210,0.00)');
  ctx.fillStyle = smear;
  ctx.fillRect(110, 120, 620, 120);

  // 主句：手写感 + 轻微歪斜
  ctx.save();
  ctx.translate(512, 178);
  ctx.rotate(-0.018);
  ctx.fillStyle = '#e8e2d2';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '76px "STKaiti", "KaiTi", "Microsoft YaHei", sans-serif';
  ctx.fillText('你把它带进来了', 0, 0);
  ctx.restore();

  // 同一句被反复描过、边缘发毛
  ctx.globalAlpha = 0.22;
  ctx.font = '76px "STKaiti", "KaiTi", "Microsoft YaHei", sans-serif';
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = '#cfc9b8';
    ctx.fillText('你把它带进来了', 512 + (i % 3) - 1, 178 + (i - 2) * 1.5 + 2);
  }
  ctx.globalAlpha = 1;

  // 下方成排的计数划痕
  ctx.strokeStyle = 'rgba(226,220,204,0.55)';
  ctx.lineWidth = 3;
  for (let group = 0; group < 9; group += 1) {
    const gx = 250 + group * 58;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo(gx + i * 7, 300);
      ctx.lineTo(gx + i * 7 + 2, 336);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(gx - 4, 330);
    ctx.lineTo(gx + 30, 306);
    ctx.stroke();
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;

  const mat = new THREE.MeshBasicMaterial({ map, transparent: true, opacity: 1 });
  mat.toneMapped = false;

  const group = new THREE.Group();
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(2.55, 0.95), mat);
  group.add(plane);
  group.position.set(LAYOUT.board.x, LAYOUT.board.y, LAYOUT.board.z);
  group.rotation.y = -Math.PI / 2;
  tag(group, 2, 'board');

  let scratchIn = 0;
  return {
    level: 2,
    id: 'board',
    group,
    stand: { x: 6.2, z: 0 },
    aimY: 0,
    update(dt, env) {
      const wave = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(env.time * 2.4));
      mat.opacity = env.flickerDark ? 1 : wave;
      plane.position.z = Math.sin(env.time * 0.9) * 0.004;
      if (env.flickerDark) {
        scratchIn += dt;
        if (scratchIn > 3.2) {
          scratchIn = 0;
          env.audio?.scratch();
        }
      }
    },
  };
}

/* ---------------------------------------------------------------- 第 3 关 */

/** 窗帘被顶出来的脸：眉骨、鼻梁、嘴缝，外加顶住布面的手指。 */
function createCurtain() {
  const group = new THREE.Group();
  group.position.set(LAYOUT.curtainFace.x, LAYOUT.curtainFace.y, LAYOUT.curtainFace.z);

  const cloth = new THREE.MeshStandardMaterial({
    color: 0x5c2a2e,
    roughness: 0.96,
    side: THREE.DoubleSide,
  });
  const clothDark = new THREE.MeshStandardMaterial({
    color: 0x3d1b1e,
    roughness: 0.97,
    side: THREE.DoubleSide,
  });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf2efe6 });
  eyeMat.toneMapped = false;
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x100608 });
  pupilMat.toneMapped = false;

  // 主体鼓起
  const bulge = addSphere(group, cloth, 0.29, 0, 0, 0, [0.72, 1.2, 0.6]);

  // 眉骨
  addBox(group, clothDark, 0.30, 0.035, 0.03, 0, 0.135, 0.145, 0.06);
  addBox(group, clothDark, 0.30, 0.032, 0.03, 0, 0.132, 0.145, -0.06);
  // 鼻梁
  addBox(group, cloth, 0.055, 0.15, 0.05, 0, 0.045, 0.175);
  // 嘴缝
  addBox(group, clothDark, 0.17, 0.018, 0.02, 0, -0.075, 0.16, 0.02);

  // 眼睛（灯闪才睁开）
  const eyeL = eyePair(-0.085, 0.075, eyeMat, pupilMat);
  const eyeR = eyePair(0.085, 0.075, eyeMat, pupilMat);
  group.add(eyeL, eyeR);

  // 手指顶住布面
  const fingers = [];
  for (let i = 0; i < 4; i += 1) {
    const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.021, 0.13, 8), clothDark);
    finger.rotation.x = Math.PI / 2;
    finger.position.set(-0.20 + i * 0.055, -0.19, 0.12);
    group.add(finger);
    fingers.push(finger);
  }

  // 布料褶皱
  const folds = [];
  for (let i = 0; i < 3; i += 1) {
    const fold = addBox(group, clothDark, 0.022, 0.42, 0.02, -0.24 + i * 0.24, -0.02, 0.10);
    fold.rotation.z = (i - 1) * 0.09;
    folds.push(fold);
  }

  group.rotation.y = Math.PI;
  tag(group, 3, 'curtain');

  return {
    level: 3,
    id: 'curtain',
    group,
    stand: { x: 2.08, z: 2.75 },
    aimY: 0,
    update(dt, env) {
      const open = env.flickerDark ? 1 : 0.02;
      const s = eyeL.scale.x + (open - eyeL.scale.x) * Math.min(1, dt * 10);
      eyeL.scale.setScalar(s);
      eyeR.scale.setScalar(s);

      const breathe = 0.45 + Math.sin(env.time * 1.7) * 0.08 + (env.flickerDark ? 0.16 : 0);
      bulge.scale.z = breathe;
      bulge.scale.x = 0.72 + Math.sin(env.time * 1.7) * 0.02;

      fingers.forEach((finger, i) => {
        finger.position.z = 0.12 + Math.sin(env.time * 2.3 + i * 0.6) * 0.012 + (env.flickerDark ? 0.03 : 0);
      });
    },
  };
}

function eyePair(x, y, whiteMat, pupilMat) {
  const g = new THREE.Group();
  const white = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 10), whiteMat);
  white.scale.set(1, 0.72, 0.7);
  const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.019, 10, 8), pupilMat);
  pupil.position.z = 0.028;
  g.add(white, pupil);
  g.position.set(x, y, 0.14);
  g.userData.pupil = pupil;
  return g;
}

/* ---------------------------------------------------------------- 第 4 关 */

/** 地上第二台相机，以及一串走到一半就断掉的鞋印。 */
function createEcho() {
  const group = new THREE.Group();
  group.position.set(LAYOUT.echo.x, 0, LAYOUT.echo.z);

  const second = cameraModel(0xe8e2d4);
  second.position.set(-0.08, 0, 0.1);
  second.rotation.y = 0.7;
  group.add(second);

  const printMat = new THREE.MeshBasicMaterial({ color: 0x1d1714, transparent: true, opacity: 0.72 });
  const prints = [];
  for (let i = 0; i < 5; i += 1) {
    const step = new THREE.Group();
    // 鞋底：前掌 + 后跟
    const sole = new THREE.Mesh(new THREE.CircleGeometry(0.075, 14), printMat);
    sole.rotation.x = -Math.PI / 2;
    sole.scale.set(1, 0.62, 1);
    sole.position.set(0, 0, 0.055);
    const heel = new THREE.Mesh(new THREE.CircleGeometry(0.045, 12), printMat);
    heel.rotation.x = -Math.PI / 2;
    heel.scale.set(1, 0.7, 1);
    heel.position.set(0, 0, -0.075);
    step.add(sole, heel);
    step.position.set((i % 2 === 0 ? -1 : 1) * 0.09, 0.032 + i * 0.001, 0.5 + i * 0.34);
    group.add(step);
    prints.push(step);
  }

  // 拖行的暗痕
  const drag = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 1.9), new THREE.MeshBasicMaterial({
    color: 0x0d0a09, transparent: true, opacity: 0.35,
  }));
  drag.rotation.x = -Math.PI / 2;
  drag.position.set(0.12, 0.028, 1.2);
  group.add(drag);

  tag(group, 4, 'echo');

  return {
    level: 4,
    id: 'echo',
    group,
    stand: { x: -1.05, z: LAYOUT.echo.z },
    aimY: 0.16,
    update(dt, env) {
      prints.forEach((print, i) => {
        print.position.y = 0.032 + i * 0.001 + Math.sin(env.time * 1.6 + i * 0.8) * 0.004;
        print.rotation.y = Math.sin(env.time * 0.8 + i) * 0.04;
      });
      drag.material.opacity = 0.28 + Math.sin(env.time * 0.7) * 0.06;
    },
  };
}

/* ---------------------------------------------------------------- 第 5 关 */

/** 门缝里的错层教室：门内还是同一间教室，钟停在你进来的时间。 */
function createDoorVision() {
  const group = new THREE.Group();
  group.position.set(LAYOUT.door.half, 1.4, -0.08);

  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 448;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#080b0e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 门框内侧的透视
  ctx.strokeStyle = '#2a2f34';
  ctx.lineWidth = 14;
  ctx.strokeRect(24, 20, canvas.width - 48, canvas.height - 40);

  // 里面的“同一间教室”：课桌剪影一排排缩小
  for (let row = 0; row < 4; row += 1) {
    const scale = 1 - row * 0.16;
    const y = 250 - row * 42 * scale;
    const w = 150 * scale;
    ctx.globalAlpha = 0.55 + row * 0.08;
    ctx.fillStyle = '#12181c';
    for (let col = -1; col <= 1; col += 1) {
      ctx.fillRect(canvas.width / 2 + col * (w * 0.62) * 1.35 - w / 2, y, w, 11 * scale);
      ctx.fillRect(canvas.width / 2 + col * (w * 0.62) * 1.35 - w / 2, y, 7 * scale, 46 * scale);
    }
  }
  ctx.globalAlpha = 1;

  // 尽头那扇门漏出的光
  const glow = ctx.createRadialGradient(canvas.width / 2, 150, 8, canvas.width / 2, 150, 120);
  glow.addColorStop(0, 'rgba(120,140,120,0.30)');
  glow.addColorStop(1, 'rgba(120,140,120,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 30, canvas.width, 260);

  // 卡住的钟：时针分针停在 03:17
  ctx.strokeStyle = '#cfc9b8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 96, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 96);
  ctx.lineTo(canvas.width / 2 + 12, 96 - 8);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 96);
  ctx.lineTo(canvas.width / 2 - 3, 96 - 22);
  ctx.stroke();

  ctx.fillStyle = '#c9c2b0';
  ctx.font = '30px "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('03:17', canvas.width / 2, 410);

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;

  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(0.46, 0.7),
    new THREE.MeshBasicMaterial({ map, toneMapped: false, side: THREE.DoubleSide }),
  );

  // 玻璃反光
  const sheen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.46, 0.7),
    new THREE.MeshBasicMaterial({
      color: 0x9fb4c0,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  sheen.position.z = 0.002;

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff2438 });
  eyeMat.toneMapped = false;
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), eyeMat);
  const eyeR = eyeL.clone();
  eyeL.position.set(-0.075, 0.085, 0.02);
  eyeR.position.set(0.075, 0.085, 0.02);

  group.add(glass, sheen, eyeL, eyeR);
  tag(group, 5, 'door');

  return {
    level: 5,
    id: 'door',
    group,
    stand: { x: 0, z: 4.2 },
    aimY: 0,
    parent: 'door',
    update(dt, env) {
      const s = env.flickerDark ? 1.5 : 0.32;
      eyeL.scale.setScalar(eyeL.scale.x + (s - eyeL.scale.x) * Math.min(1, dt * 12));
      eyeR.scale.setScalar(eyeL.scale.x);
      sheen.material.opacity = 0.08 + Math.sin(env.time * 0.6) * 0.03;
    },
  };
}

/* ------------------------------------------------------- 可拾取的相机模型 */

/** 相机：机身、镜头筒、取景器、闪光灯、背带、快门钮。 */
export function cameraModel(color = 0xd7d1c4) {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.45,
    metalness: 0.35,
    emissive: 0x3a3328,
    emissiveIntensity: 0.4,
  });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.6, metalness: 0.3 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0a1014, roughness: 0.15, metalness: 0.7 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xb9b4a6, roughness: 0.3, metalness: 0.85 });

  // 机身 + 手柄
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.15, 0.17), bodyMat);
  body.position.y = 0.1;
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.12), darkMat);
  grip.position.set(-0.13, 0.095, 0.0);

  // 顶部棱镜与快门
  const hump = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.10), bodyMat);
  hump.position.set(0.01, 0.19, 0);
  const shutter = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 10), metalMat);
  shutter.position.set(0.10, 0.183, -0.03);

  // 镜头：镜筒 + 前圈 + 镜片
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.11, 16), darkMat);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0.02, 0.105, 0.12);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.008, 8, 18), metalMat);
  ring.position.set(0.02, 0.105, 0.175);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.048, 18), glassMat);
  lens.position.set(0.02, 0.105, 0.178);

  // 闪光灯
  const flash = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.03), metalMat);
  flash.position.set(0.02, 0.175, 0.07);

  // 背带：两段垂下的细带
  for (const side of [-1, 1]) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.11, 0.012), darkMat);
    strap.position.set(side * 0.145, 0.055, -0.06);
    strap.rotation.z = side * 0.25;
    group.add(strap);
  }

  group.add(body, grip, hump, shutter, barrel, ring, lens, flash);
  return group;
}
