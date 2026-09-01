import * as THREE from 'three';

export const ANALYTICS_CLIPBOARD_CONFIG = Object.freeze({
  id: 'analytics-clipboard',
  label: '数据分析夹板',
  rootRotation: [-0.04, 0.04, 0] as const,
  focusPoint: [0, -0.15, 0] as const,
});

export interface AnalyticsClipboardMaterials {
  board: THREE.Material;
  paper: THREE.Material;
  paperEdge: THREE.Material;
  tabBlue: THREE.Material;
  tabBlueSide: THREE.Material;
  tabPink: THREE.Material;
  tabPinkSide: THREE.Material;
  printInk: THREE.Material;
  chartRed: THREE.Material;
  chartRedSide: THREE.Material;
  steel: THREE.Material;
  cursorYellow: THREE.Material;
  cursorYellowSide: THREE.Material;
}

function roundedBox(
  width: number,
  height: number,
  depth: number,
  radius: number,
  material: THREE.Material | THREE.Material[],
) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;

  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize: radius * 0.32,
    bevelThickness: radius * 0.28,
    bevelSegments: 3,
    curveSegments: 8,
  });
  geometry.center();

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function tube(points: THREE.Vector3[], radius: number, material: THREE.Material) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, Math.max(40, points.length * 12), radius, 12, false),
    material,
  );
  mesh.castShadow = true;
  return mesh;
}

export function createAnalyticsClipboardModel(materials: AnalyticsClipboardMaterials) {
  const root = new THREE.Group();
  root.name = ANALYTICS_CLIPBOARD_CONFIG.id;
  root.rotation.fromArray([...ANALYTICS_CLIPBOARD_CONFIG.rootRotation]);

  const parts: THREE.Object3D[] = [];
  const groups: Record<'board' | 'data' | 'hardware' | 'accent', THREE.Object3D[]> = {
    board: [],
    data: [],
    hardware: [],
    accent: [],
  };

  const add = (
    object: THREE.Object3D,
    name: string,
    position: THREE.Vector3,
    explodeAmount = 1,
    group: keyof typeof groups = 'board',
  ) => {
    object.name = name;
    object.userData.partName = name;
    object.userData.home = position.clone();
    object.userData.explodeAmount = explodeAmount;
    object.position.copy(position);
    parts.push(object);
    groups[group].push(object);
    root.add(object);
    return object;
  };

  add(roundedBox(6.9, 8.35, 0.46, 0.42, materials.board), 'rounded-backboard', new THREE.Vector3(0, 0, -0.66), 1.5);

  for (let index = 0; index < 4; index += 1) {
    add(
      roundedBox(6.18, 7.5, 0.1, 0.18, index === 3 ? materials.paper : materials.paperEdge),
      `paper-layer-${index + 1}`,
      new THREE.Vector3(-0.1 + index * 0.035, 0.05 + index * 0.025, -0.37 + index * 0.105),
      1.1 + index * 0.15,
    );
  }

  add(roundedBox(6.05, 7.32, 0.105, 0.16, materials.paper), 'chart-sheet', new THREE.Vector3(-0.17, 0.22, 0.1), 1.8);
  add(roundedBox(1.15, 1.52, 0.16, 0.22, [materials.tabBlue, materials.tabBlueSide]), 'blue-index-tab', new THREE.Vector3(3.42, 1.82, -0.2), 2.2, 'accent');
  add(roundedBox(1.35, 1.55, 0.17, 0.24, [materials.tabPink, materials.tabPinkSide]), 'pink-index-tab', new THREE.Vector3(3.48, 0.92, -0.02), 2.45, 'accent');

  for (let index = 0; index < 8; index += 1) {
    add(new THREE.Mesh(new THREE.BoxGeometry(0.035, 3.05, 0.022), materials.printInk), `grid-vertical-${index + 1}`, new THREE.Vector3(-2.25 + index * 0.58, 0.62, 0.225), 1.9, 'data');
  }
  for (let index = 0; index < 7; index += 1) {
    add(new THREE.Mesh(new THREE.BoxGeometry(4.08, 0.035, 0.022), materials.printInk), `grid-horizontal-${index + 1}`, new THREE.Vector3(-0.22, -0.88 + index * 0.5, 0.225), 1.9, 'data');
  }
  for (let index = 0; index < 6; index += 1) {
    add(new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 10), materials.printInk), `axis-dot-${index + 1}`, new THREE.Vector3(-2.62, -0.75 + index * 0.61, 0.235), 1.9, 'data');
  }

  const barHeights = [1.15, 1.73, 2.42, 3.12];
  const barX = [-1.75, -0.65, 0.48, 1.62];
  barHeights.forEach((height, index) => {
    add(
      roundedBox(0.62, height, 0.22, 0.1, [materials.chartRed, materials.chartRedSide]),
      `chart-bar-${index + 1}`,
      new THREE.Vector3(barX[index], -0.93 + height / 2, 0.37),
      2.25,
      'data',
    );
  });

  [3.9, 3.2, 2.45, 1.8].forEach((width, index) => {
    add(roundedBox(width, 0.1, 0.025, 0.04, materials.printInk), `description-line-${index + 1}`, new THREE.Vector3(-0.55, -2.18 - index * 0.28, 0.23), 2.05, 'data');
  });

  const graphPoints = [
    [-2.05, -0.42, 0.62], [-1.13, 0.33, 0.62], [-0.72, 0.05, 0.62],
    [-0.1, 0.75, 0.62], [0.42, 0.17, 0.62], [1.72, 1.34, 0.62],
  ].map((value) => new THREE.Vector3(value[0], value[1], value[2]));
  add(tube(graphPoints, 0.075, materials.chartRed), 'trend-line', new THREE.Vector3(), 2.7, 'data');

  const trendArrow = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.52, 18), materials.chartRed);
  const arrowDirection = graphPoints[graphPoints.length - 1].clone().sub(graphPoints[graphPoints.length - 2]).normalize();
  trendArrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), arrowDirection);
  add(trendArrow, 'trend-arrow', graphPoints[graphPoints.length - 1].clone().addScaledVector(arrowDirection, 0.17), 2.75, 'data');

  const barrel = new THREE.Mesh(new THREE.CapsuleGeometry(0.31, 3.25, 8, 20), materials.steel);
  barrel.rotation.z = Math.PI / 2;
  add(barrel, 'metal-pressure-bar', new THREE.Vector3(-0.16, 3.59, 0.78), 3.2, 'hardware');

  const clipPoints = [
    [-1.9, 3.52, 0.7], [-2.08, 3.2, 0.58], [-2.08, 2.78, 0.52],
    [-1.82, 2.55, 0.5], [-0.75, 2.52, 0.5], [-0.45, 2.45, 0.51],
    [-0.16, 2.27, 0.55], [0.13, 2.45, 0.51], [0.43, 2.52, 0.5],
    [1.5, 2.55, 0.5], [1.76, 2.78, 0.52], [1.76, 3.2, 0.58], [1.58, 3.52, 0.7],
  ].map((value) => new THREE.Vector3(value[0], value[1], value[2]));
  add(tube(clipPoints, 0.105, materials.steel), 'spring-clip-frame', new THREE.Vector3(), 3, 'hardware');

  const cursorShape = new THREE.Shape();
  cursorShape.moveTo(1.62, 0);
  cursorShape.quadraticCurveTo(1.62, 0.1, 1.48, 0.18);
  cursorShape.lineTo(-0.43, 1.22);
  cursorShape.quadraticCurveTo(-0.67, 1.34, -0.67, 1.06);
  cursorShape.lineTo(-0.67, 0.56);
  cursorShape.quadraticCurveTo(-0.67, 0.42, -0.82, 0.42);
  cursorShape.lineTo(-1.47, 0.42);
  cursorShape.quadraticCurveTo(-1.64, 0.42, -1.64, 0.25);
  cursorShape.lineTo(-1.64, -0.25);
  cursorShape.quadraticCurveTo(-1.64, -0.42, -1.47, -0.42);
  cursorShape.lineTo(-0.82, -0.42);
  cursorShape.quadraticCurveTo(-0.67, -0.42, -0.67, -0.56);
  cursorShape.lineTo(-0.67, -1.06);
  cursorShape.quadraticCurveTo(-0.67, -1.34, -0.43, -1.22);
  cursorShape.lineTo(1.48, -0.18);
  cursorShape.quadraticCurveTo(1.62, -0.1, 1.62, 0);
  cursorShape.closePath();

  const cursorGeometry = new THREE.ExtrudeGeometry(cursorShape, {
    depth: 0.28,
    bevelEnabled: true,
    bevelSize: 0.085,
    bevelThickness: 0.065,
    bevelSegments: 4,
    curveSegments: 12,
  });
  cursorGeometry.center();
  const cursor = new THREE.Mesh(cursorGeometry, [materials.cursorYellow, materials.cursorYellowSide]);
  cursor.scale.setScalar(0.78);
  cursor.rotation.z = 2.32;
  cursor.castShadow = true;
  add(cursor, 'rounded-cursor-arrow', new THREE.Vector3(1.78, -1.88, 1), 3.8, 'accent');

  root.userData.sculptRuntime = {
    nodes: Object.fromEntries(parts.map((part) => [part.name, part])),
    destructionGroups: groups,
  };

  return {
    root,
    parts,
    groups,
    bounds: new THREE.Box3().setFromObject(root),
    focusPoint: new THREE.Vector3(...ANALYTICS_CLIPBOARD_CONFIG.focusPoint),
    dispose() {
      root.traverse((object) => {
        if (object instanceof THREE.Mesh) object.geometry.dispose();
      });
    },
  };
}
